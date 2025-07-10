import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore } from '@/src/config/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export interface OnboardingData {
  goals: string[];
  personality: {
    communication: string;
    conflict: string;
    attachment: string;
    trust: string;
    loveLanguage: string;
  };
  preferences: {
    notifications: {
      daily: boolean;
      insights: boolean;
      reminders: boolean;
    };
    reminderTime: string;
    theme: 'light' | 'dark' | 'auto';
    privacy: {
      analytics: boolean;
      backup: boolean;
    };
  };
  profile: {
    name: string;
    birthDate: string | null;
    photoUrl: string | null;
  };
  completedAt: string;
}

class OnboardingService {
  private data: Partial<OnboardingData> = {};

  // Set goals
  setGoals(goals: string[]) {
    this.data.goals = goals;
  }

  // Set personality quiz answers
  setPersonality(personality: OnboardingData['personality']) {
    this.data.personality = personality;
  }

  // Set preferences
  setPreferences(preferences: OnboardingData['preferences']) {
    this.data.preferences = preferences;
  }

  // Set profile
  setProfile(profile: OnboardingData['profile']) {
    this.data.profile = profile;
  }

  // Complete onboarding and save data
  async completeOnboarding(userId: string): Promise<void> {
    try {
      // Add completion timestamp
      const completeData: OnboardingData = {
        ...this.data as OnboardingData,
        completedAt: new Date().toISOString(),
      };

      // Save to Firestore
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        onboarding: completeData,
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString(),
      });

      // Mark onboarding as complete in AsyncStorage
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      await AsyncStorage.setItem(`user_${userId}_onboarded`, 'true');

      // Clear temporary data
      this.data = {};
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  // Get current onboarding data (for debugging/preview)
  getCurrentData(): Partial<OnboardingData> {
    return this.data;
  }

  // Clear onboarding data
  clearData() {
    this.data = {};
  }

  // Check if user has completed onboarding
  static async hasCompletedOnboarding(userId?: string): Promise<boolean> {
    try {
      if (userId) {
        const userOnboarded = await AsyncStorage.getItem(`user_${userId}_onboarded`);
        return userOnboarded === 'true';
      } else {
        const hasCompleted = await AsyncStorage.getItem('hasCompletedOnboarding');
        return hasCompleted === 'true';
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  // Reset onboarding (for testing)
  static async resetOnboarding(userId?: string): Promise<void> {
    try {
      await AsyncStorage.removeItem('hasCompletedOnboarding');
      if (userId) {
        await AsyncStorage.removeItem(`user_${userId}_onboarded`);
      }
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  }
}

export const onboardingService = new OnboardingService();