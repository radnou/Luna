import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  GoogleAuthProvider,
  OAuthProvider,
  UserCredential,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';

// Auth providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Configure Apple provider
appleProvider.addScope('email');
appleProvider.addScope('name');

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  astralData?: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    elements?: Record<string, number>;
  };
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
    privacyMode: boolean;
  };
  subscription?: {
    plan: 'free' | 'premium' | 'pro';
    startDate: string;
    endDate?: string;
    status: 'active' | 'cancelled' | 'expired';
  };
  createdAt: any;
  updatedAt: any;
}

class AuthService {
  // Create new user with email and password
  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Create user profile in Firestore
      await this.createUserProfile(userCredential.user);
      
      return userCredential;
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await this.updateLastLogin(userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await this.createOrUpdateUserProfile(userCredential.user);
      return userCredential;
    } catch (error) {
      console.error('Google SignIn error:', error);
      throw error;
    }
  }

  // Sign in with Apple
  async signInWithApple(): Promise<UserCredential> {
    try {
      const userCredential = await signInWithPopup(auth, appleProvider);
      await this.createOrUpdateUserProfile(userCredential.user);
      return userCredential;
    } catch (error) {
      console.error('Apple SignIn error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('SignOut error:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    try {
      // Update Firebase Auth profile if display name or photo changed
      if (updates.displayName !== undefined || updates.photoURL !== undefined) {
        await updateProfile(user, {
          displayName: updates.displayName || user.displayName,
          photoURL: updates.photoURL || user.photoURL
        });
      }

      // Update Firestore profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Update email
  async updateUserEmail(newEmail: string, currentPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user');

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update email
      await updateEmail(user, newEmail);
      
      // Update in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        email: newEmail,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Update email error:', error);
      throw error;
    }
  }

  // Update password
  async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user');

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  // Delete user account
  async deleteUserAccount(password?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    try {
      // Re-authenticate if password provided (for email users)
      if (password && user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }
      
      // Delete user data from Firestore (consider soft delete)
      // Actual deletion should be handled by Cloud Functions for data consistency
      
      // Delete auth account
      await deleteUser(user);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  // Auth state observer
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Private helper methods
  private async createUserProfile(user: User): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      preferences: {
        notifications: true,
        theme: 'system',
        language: 'en',
        privacyMode: false
      },
      subscription: {
        plan: 'free',
        startDate: new Date().toISOString(),
        status: 'active'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, userProfile);
  }

  private async createOrUpdateUserProfile(user: User): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await this.createUserProfile(user);
    } else {
      await updateDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        updatedAt: serverTimestamp()
      });
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

export default new AuthService();