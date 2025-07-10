import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  sendEmailVerification,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  linkWithCredential,
  unlink,
} from 'firebase/auth';
import { auth } from '@config/firebase';
import { userService } from './user.service';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Constants
const SECURE_STORE_KEYS = {
  REFRESH_TOKEN: 'luna_refresh_token',
  USER_CREDENTIALS: 'luna_user_credentials',
  BIOMETRIC_ENABLED: 'luna_biometric_enabled',
};

class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Create user document in Firestore
      await userService.createUser({
        id: user.uid,
        email: user.email!,
        displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Send email verification
  async sendEmailVerification() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      await sendEmailVerification(user);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Update email
  async updateEmail(newEmail: string, currentPassword: string) {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('No user logged in');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update email
      await updateEmail(user, newEmail);
      
      // Update user document
      await userService.updateUser(user.uid, { email: newEmail });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Update password
  async updatePassword(currentPassword: string, newPassword: string) {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('No user logged in');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Link provider to existing account
  async linkProvider(providerId: string, credential: any) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      const result = await linkWithCredential(user, credential);
      return result.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Unlink provider from account
  async unlinkProvider(providerId: string) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      const result = await unlink(user, providerId);
      return result;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Store credentials securely
  async storeCredentials(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  // Retrieve credentials securely
  async getCredentials(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  }

  // Remove credentials
  async removeCredentials(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }

  // Handle auth errors
  private handleAuthError(error: any): Error {
    const errorCode = error.code;
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'Operation not allowed.',
      'auth/weak-password': 'Password is too weak (minimum 6 characters).',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/cancelled-popup-request': 'Another sign-in popup is already open.',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email.',
      'auth/invalid-credential': 'The credential is malformed or has expired.',
      'auth/invalid-verification-code': 'Invalid verification code.',
      'auth/invalid-verification-id': 'Invalid verification ID.',
      'auth/missing-verification-code': 'Verification code is required.',
      'auth/missing-verification-id': 'Verification ID is required.',
      'auth/credential-already-in-use': 'This credential is already associated with another account.',
      'auth/requires-recent-login': 'Please sign in again to complete this action.',
    };

    return new Error(errorMessages[errorCode] || `Authentication error: ${error.message}`);
  }
}

export const authService = new AuthService();