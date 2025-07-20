import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

interface OnboardingData {
  goals: string[];
  personality: Record<string, string>;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    analytics: boolean;
  };
  profile: {
    name: string;
    birthDate: string;
    birthTime?: string;
    birthPlace?: string;
    photoUri?: string;
  };
  currentStep: number;
  completed: boolean;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateGoals: (goals: string[]) => Promise<void>;
  updatePersonality: (answers: Record<string, string>) => Promise<void>;
  updatePreferences: (prefs: OnboardingData['preferences']) => Promise<void>;
  updateProfile: (profile: OnboardingData['profile']) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  getCurrentStep: () => number;
  isCompleted: () => boolean;
  saveProgress: () => Promise<void>;
}

const ONBOARDING_KEY = 'luna_onboarding';

const defaultOnboardingData: OnboardingData = {
  goals: [],
  personality: {},
  preferences: {
    theme: 'auto',
    notifications: true,
    analytics: true,
  },
  profile: {
    name: '',
    birthDate: '',
  },
  currentStep: 0,
  completed: false,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);
  const { user } = useAuth();

  // Load saved onboarding data
  useEffect(() => {
    loadOnboardingData();
  }, [user]);

  const loadOnboardingData = async () => {
    try {
      const key = user ? `${ONBOARDING_KEY}_${user.uid}` : ONBOARDING_KEY;
      const savedData = await AsyncStorage.getItem(key);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setData({ ...defaultOnboardingData, ...parsedData });
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    }
  };

  const saveOnboardingData = async (newData: OnboardingData) => {
    try {
      const key = user ? `${ONBOARDING_KEY}_${user.uid}` : ONBOARDING_KEY;
      await AsyncStorage.setItem(key, JSON.stringify(newData));
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const updateGoals = async (goals: string[]) => {
    const newData = {
      ...data,
      goals,
      currentStep: Math.max(data.currentStep, 1),
    };
    setData(newData);
    await saveOnboardingData(newData);
  };

  const updatePersonality = async (answers: Record<string, string>) => {
    const newData = {
      ...data,
      personality: answers,
      currentStep: Math.max(data.currentStep, 2),
    };
    setData(newData);
    await saveOnboardingData(newData);
  };

  const updatePreferences = async (prefs: OnboardingData['preferences']) => {
    const newData = {
      ...data,
      preferences: prefs,
      currentStep: Math.max(data.currentStep, 3),
    };
    setData(newData);
    await saveOnboardingData(newData);
  };

  const updateProfile = async (profile: OnboardingData['profile']) => {
    const newData = {
      ...data,
      profile,
      currentStep: Math.max(data.currentStep, 4),
    };
    setData(newData);
    await saveOnboardingData(newData);
  };

  const completeOnboarding = async () => {
    const newData = {
      ...data,
      completed: true,
      currentStep: 5,
    };
    setData(newData);
    await saveOnboardingData(newData);

    // Save to user profile in Firestore if authenticated
    if (user) {
      try {
        // This would update the user profile in Firestore
        // await userService.updateUserProfile(user.uid, {
        //   onboardingCompleted: true,
        //   goals: data.goals,
        //   personality: data.personality,
        //   preferences: data.preferences,
        //   profile: data.profile,
        // });
      } catch (error) {
        console.error('Error saving onboarding to user profile:', error);
      }
    }
  };

  const resetOnboarding = async () => {
    setData(defaultOnboardingData);
    const key = user ? `${ONBOARDING_KEY}_${user.uid}` : ONBOARDING_KEY;
    await AsyncStorage.removeItem(key);
  };

  const getCurrentStep = () => data.currentStep;
  const isCompleted = () => data.completed;
  const saveProgress = async () => await saveOnboardingData(data);

  const value: OnboardingContextType = {
    data,
    updateGoals,
    updatePersonality,
    updatePreferences,
    updateProfile,
    completeOnboarding,
    resetOnboarding,
    getCurrentStep,
    isCompleted,
    saveProgress,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;