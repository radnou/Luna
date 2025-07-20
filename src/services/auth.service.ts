import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  getIdToken
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { auth, db, storage } from '@/config/firebase';
import { User, UserPreferences } from '@/types/models';
import { EventBus } from '@/utils/event-bus';
import { Logger } from '@/utils/logger';

// Types
export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  acceptedTerms: boolean;
}

export interface UpdateProfileData {
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  pronouns?: 'she/her' | 'they/them' | 'other';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

// Error types
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'auth/invalid-credentials',
  USER_NOT_FOUND = 'auth/user-not-found',
  EMAIL_ALREADY_EXISTS = 'auth/email-already-exists',
  WEAK_PASSWORD = 'auth/weak-password',
  NETWORK_ERROR = 'auth/network-error',
  REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login',
  TERMS_NOT_ACCEPTED = 'auth/terms-not-accepted',
  PROFILE_UPDATE_FAILED = 'auth/profile-update-failed',
  UNKNOWN_ERROR = 'auth/unknown-error'
}

// Constants
const USER_CACHE_KEY = '@luna_user_cache';
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private unsubscribeAuth: (() => void) | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;
  private googleProvider = new GoogleAuthProvider();
  private appleProvider = new OAuthProvider('apple.com');

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ========== Initialization ==========

  private async initializeAuth() {
    try {
      // Load cached user
      const cachedUser = await this.loadCachedUser();
      if (cachedUser) {
        this.currentUser = cachedUser;
        EventBus.emit('auth:stateChanged', { user: cachedUser, isAuthenticated: true });
      }

      // Setup auth state listener
      this.unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        await this.handleAuthStateChange(firebaseUser);
      });

      // Setup token refresh
      this.setupTokenRefresh();
    } catch (error) {
      Logger.error('Auth initialization failed:', error);
    }
  }

  private async handleAuthStateChange(firebaseUser: FirebaseUser | null) {
    try {
      if (firebaseUser) {
        // User is signed in
        const user = await this.fetchUserData(firebaseUser.uid);
        if (user) {
          this.currentUser = user;
          await this.cacheUser(user);
          EventBus.emit('auth:stateChanged', { user, isAuthenticated: true });
        } else {
          // User exists in Firebase Auth but not in Firestore
          await this.createUserDocument(firebaseUser);
        }
      } else {
        // User is signed out
        this.currentUser = null;
        await this.clearCache();
        EventBus.emit('auth:stateChanged', { user: null, isAuthenticated: false });
      }
    } catch (error) {
      Logger.error('Auth state change error:', error);
    }
  }

  // ========== Public Methods ==========

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    const handler = (data: { user: User | null }) => callback(data.user);
    EventBus.on('auth:stateChanged', handler);
    
    // Call immediately with current state
    callback(this.currentUser);
    
    return () => EventBus.off('auth:stateChanged', handler);
  }

  // ========== Sign In Methods ==========

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = await this.fetchUserData(credential.user.uid);
      
      if (!user) {
        throw new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          'User data not found in database'
        );
      }

      await this.updateLastActive(user.id);
      EventBus.emit('auth:signIn', { method: 'email', user });
      
      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      this.googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      const credential = await signInWithPopup(auth, this.googleProvider);
      let user = await this.fetchUserData(credential.user.uid);
      
      if (!user) {
        // First time Google sign in
        user = await this.createUserDocument(credential.user);
      }

      await this.updateLastActive(user.id);
      EventBus.emit('auth:signIn', { method: 'google', user });
      
      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithApple(): Promise<User> {
    try {
      // Generate nonce for security
      const nonce = await this.generateNonce();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      // Apple sign in
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      // Create Firebase credential
      const { identityToken } = credential;
      if (!identityToken) {
        throw new AuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          'Apple Sign In failed - no identity token'
        );
      }

      const appleCredential = OAuthProvider.credential({
        idToken: identityToken,
        rawNonce: nonce,
      });

      // Sign in to Firebase
      const firebaseCredential = await signInWithCredential(auth, appleCredential);
      let user = await this.fetchUserData(firebaseCredential.user.uid);
      
      if (!user) {
        // First time Apple sign in
        user = await this.createUserDocument(firebaseCredential.user, {
          fullName: credential.fullName
        });
      }

      await this.updateLastActive(user.id);
      EventBus.emit('auth:signIn', { method: 'apple', user });
      
      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // ========== Sign Up ==========

  async signUpWithEmail(data: SignUpData): Promise<User> {
    try {
      if (!data.acceptedTerms) {
        throw new AuthError(
          AuthErrorCode.TERMS_NOT_ACCEPTED,
          'You must accept the terms and conditions'
        );
      }

      // Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update display name
      await updateProfile(credential.user, {
        displayName: data.displayName
      });

      // Create user document
      const user = await this.createUserDocument(credential.user);
      
      EventBus.emit('auth:signUp', { method: 'email', user });
      
      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // ========== Sign Out ==========

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      await this.clearCache();
      this.stopTokenRefresh();
      
      EventBus.emit('auth:signOut', {});
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // ========== Account Management ==========

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: 'https://luna-app.com/login', // Deep link back to app
        handleCodeInApp: false
      });
      
      EventBus.emit('auth:passwordReset', { email });
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          'No authenticated user found'
        );
      }

      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      EventBus.emit('auth:passwordUpdated', {});
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async deleteAccount(password?: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          'No authenticated user found'
        );
      }

      // Re-authenticate if password provided (email users)
      if (password && user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      // Mark user as deleted in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Delete auth account
      await deleteUser(user);
      
      // Clean up
      this.currentUser = null;
      await this.clearCache();
      
      EventBus.emit('auth:accountDeleted', {});
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // ========== Profile Management ==========

  async updateProfile(data: UpdateProfileData): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !this.currentUser) {
        throw new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          'No authenticated user found'
        );
      }

      // Update Firebase Auth profile
      const authUpdates: any = {};
      if (data.displayName) authUpdates.displayName = data.displayName;
      if (data.photoURL) authUpdates.photoURL = data.photoURL;
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(user, authUpdates);
      }

      // Update Firestore document
      const userUpdates: any = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'users', user.uid), userUpdates);

      // Update local user object
      this.currentUser = {
        ...this.currentUser,
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await this.cacheUser(this.currentUser);
      
      EventBus.emit('auth:profileUpdated', { updates: data });
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async uploadProfilePhoto(file: File): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          'No authenticated user found'
        );
      }

      // Delete old photo if exists
      if (this.currentUser?.photoURL) {
        try {
          const oldPhotoRef = ref(storage, this.currentUser.photoURL);
          await deleteObject(oldPhotoRef);
        } catch (error) {
          // Ignore error if old photo doesn't exist
        }
      }

      // Upload new photo
      const filename = `users/${user.uid}/profile_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          userId: user.uid
        }
      });

      const photoURL = await getDownloadURL(snapshot.ref);

      // Update profile with new photo URL
      await this.updateProfile({ photoURL });

      return photoURL;
    } catch (error: any) {
      throw new AuthError(
        AuthErrorCode.PROFILE_UPDATE_FAILED,
        'Failed to upload profile photo',
        error
      );
    }
  }

  // ========== Token Management ==========

  async getIdToken(forceRefresh = false): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      
      return await getIdToken(user, forceRefresh);
    } catch (error) {
      Logger.error('Failed to get ID token:', error);
      return null;
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      await getIdToken(user, true);
    } catch (error) {
      Logger.error('Token refresh failed:', error);
    }
  }

  // ========== Private Helper Methods ==========

  private async fetchUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        return null;
      }

      return {
        id: uid,
        ...userDoc.data()
      } as User;
    } catch (error) {
      Logger.error('Failed to fetch user data:', error);
      return null;
    }
  }

  private async createUserDocument(
    firebaseUser: FirebaseUser,
    additionalData?: any
  ): Promise<User> {
    const now = serverTimestamp();
    
    const defaultPreferences: UserPreferences = {
      journalReminders: {
        enabled: true,
        time: '19:00',
        frequency: 'daily',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      notificationsEnabled: true,
      pushTokens: [],
      theme: 'auto',
      language: 'fr',
      privacySettings: {
        shareAnalytics: true,
        allowAIAnalysis: true,
        privateByDefault: false,
        biometricLock: false
      },
      aiSettings: {
        preferredModel: 'balanced',
        personalityType: 'supportive',
        responseLength: 'adaptive'
      }
    };

    const userData: Omit<User, 'id'> = {
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || additionalData?.fullName?.givenName || 'User',
      photoURL: firebaseUser.photoURL || undefined,
      phoneNumber: firebaseUser.phoneNumber || undefined,
      onboardingCompleted: false,
      onboardingStep: 0,
      preferences: defaultPreferences,
      subscription: {
        type: 'free',
        isActive: true,
        features: {
          unlimitedEntries: false,
          advancedAI: false,
          unlimitedPhotos: false,
          exportPDF: false,
          prioritySupport: false,
          customThemes: false
        }
      },
      stats: {
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPhotos: 0,
        totalConversations: 0
      },
      createdAt: now as any,
      updatedAt: now as any,
      lastActiveAt: now as any
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    const user: User = {
      id: firebaseUser.uid,
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastActiveAt: Timestamp.now()
    };

    this.currentUser = user;
    await this.cacheUser(user);

    return user;
  }

  private async updateLastActive(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        lastActiveAt: serverTimestamp()
      });
    } catch (error) {
      Logger.error('Failed to update last active:', error);
    }
  }

  private setupTokenRefresh() {
    this.stopTokenRefresh();
    
    this.tokenRefreshTimer = setInterval(() => {
      if (this.isAuthenticated()) {
        this.refreshToken();
      }
    }, TOKEN_REFRESH_INTERVAL);
  }

  private stopTokenRefresh() {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  private async generateNonce(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes, (byte) => 
      byte.toString(16).padStart(2, '0')
    ).join('');
  }

  // ========== Cache Management ==========

  private async cacheUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } catch (error) {
      Logger.error('Failed to cache user:', error);
    }
  }

  private async loadCachedUser(): Promise<User | null> {
    try {
      const cached = await AsyncStorage.getItem(USER_CACHE_KEY);
      if (!cached) return null;
      
      return JSON.parse(cached);
    } catch (error) {
      Logger.error('Failed to load cached user:', error);
      return null;
    }
  }

  private async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_CACHE_KEY);
    } catch (error) {
      Logger.error('Failed to clear cache:', error);
    }
  }

  // ========== Error Handling ==========

  private handleAuthError(error: any): AuthError {
    const errorCode = error.code || AuthErrorCode.UNKNOWN_ERROR;
    
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-email': 'Invalid email address',
      'auth/email-already-in-use': 'An account already exists with this email',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/network-request-failed': 'Network error - please check your connection',
      'auth/too-many-requests': 'Too many attempts - please try again later',
      'auth/requires-recent-login': 'Please sign in again to complete this action',
      'auth/popup-closed-by-user': 'Sign in cancelled',
      'auth/cancelled-popup-request': 'Another sign in process is already in progress'
    };

    const message = errorMessages[errorCode] || error.message || 'Authentication failed';
    
    return new AuthError(errorCode as AuthErrorCode, message, error);
  }

  // ========== Cleanup ==========

  destroy() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    this.stopTokenRefresh();
    this.currentUser = null;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();