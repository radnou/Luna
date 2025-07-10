import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '@services/auth.service';
import { userService } from '@services/user.service';
import { googleAuthService } from '@services/google-auth.service';
import { appleAuthService } from '@services/apple-auth.service';
import { biometricAuthService } from '@services/biometric-auth.service';
import { User } from '@types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth context types
interface AuthContextType {
  // State
  user: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Email/Password methods
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;

  // Social auth methods
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  linkAppleAccount: () => Promise<void>;
  unlinkProvider: (providerId: string) => Promise<void>;

  // Biometric methods
  enableBiometric: (email: string, password: string) => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
  signInWithBiometric: () => Promise<void>;
  isBiometricEnabled: () => Promise<boolean>;
  isBiometricAvailable: () => Promise<boolean>;

  // Utility methods
  clearError: () => void;
  refreshUserProfile: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Session storage key
const SESSION_KEY = 'luna_auth_session';

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile
  const loadUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const profile = await userService.getUserById(firebaseUser.uid);
      if (profile) {
        setUserProfile(profile as User);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  // Save session
  const saveSession = async (firebaseUser: FirebaseUser | null) => {
    try {
      if (firebaseUser) {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        }));
      } else {
        await AsyncStorage.removeItem(SESSION_KEY);
      }
    } catch (err) {
      console.error('Error saving session:', err);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      await saveSession(firebaseUser);

      if (firebaseUser) {
        await loadUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Auth methods implementation
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.signUp(email, password, displayName);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.signIn(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const sendVerificationEmail = async () => {
    try {
      setError(null);
      await authService.sendEmailVerification();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateEmail = async (newEmail: string, currentPassword: string) => {
    try {
      setError(null);
      await authService.updateEmail(newEmail, currentPassword);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      await authService.updatePassword(currentPassword, newPassword);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Social auth methods
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Get Google auth configuration
      const [request, response, promptAsync] = googleAuthService.getGoogleAuthConfig();
      
      // Prompt for Google sign-in
      if (request) {
        const result = await promptAsync();
        if (result?.type === 'success' && result.params.id_token) {
          await googleAuthService.signInWithGoogle(result.params.id_token);
        }
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await appleAuthService.signInWithApple();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const linkGoogleAccount = async () => {
    try {
      setError(null);
      
      const [request, response, promptAsync] = googleAuthService.getGoogleAuthConfig();
      
      if (request) {
        const result = await promptAsync();
        if (result?.type === 'success' && result.params.id_token) {
          await googleAuthService.linkGoogleAccount(result.params.id_token);
          await refreshUserProfile();
        }
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const linkAppleAccount = async () => {
    try {
      setError(null);
      await appleAuthService.linkAppleAccount();
      await refreshUserProfile();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const unlinkProvider = async (providerId: string) => {
    try {
      setError(null);
      await authService.unlinkProvider(providerId);
      await refreshUserProfile();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Biometric methods
  const enableBiometric = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      return await biometricAuthService.enableBiometric(email, password);
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const disableBiometric = async (): Promise<boolean> => {
    try {
      setError(null);
      return await biometricAuthService.disableBiometric();
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const signInWithBiometric = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await biometricAuthService.signInWithBiometric();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isBiometricEnabled = async (): Promise<boolean> => {
    try {
      return await biometricAuthService.isBiometricEnabled();
    } catch {
      return false;
    }
  };

  const isBiometricAvailable = async (): Promise<boolean> => {
    try {
      return await biometricAuthService.isAvailable();
    } catch {
      return false;
    }
  };

  // Utility methods
  const clearError = () => setError(null);

  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendVerificationEmail,
    updateEmail,
    updatePassword,
    signInWithGoogle,
    signInWithApple,
    linkGoogleAccount,
    linkAppleAccount,
    unlinkProvider,
    enableBiometric,
    disableBiometric,
    signInWithBiometric,
    isBiometricEnabled,
    isBiometricAvailable,
    clearError,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;