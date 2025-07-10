import {
  GoogleAuthProvider,
  signInWithCredential,
  linkWithCredential,
} from 'firebase/auth';
import { auth } from '@config/firebase';
import { userService } from './user.service';
import { authService } from './auth.service';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Complete auth session on web
WebBrowser.maybeCompleteAuthSession();

class GoogleAuthService {
  private webClientId: string;
  private iosClientId: string;
  private androidClientId: string;

  constructor() {
    this.webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
    this.iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
    this.androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

    if (!this.webClientId) {
      console.warn('Google Web Client ID not configured');
    }
  }

  // Get the appropriate client ID based on platform
  private getClientId(): string {
    if (Platform.OS === 'ios' && this.iosClientId) {
      return this.iosClientId;
    } else if (Platform.OS === 'android' && this.androidClientId) {
      return this.androidClientId;
    }
    return this.webClientId;
  }

  // Configure Google auth request
  getGoogleAuthConfig() {
    return Google.useAuthRequest({
      clientId: this.getClientId(),
      webClientId: this.webClientId,
      iosClientId: this.iosClientId,
      androidClientId: this.androidClientId,
      scopes: ['profile', 'email'],
      responseType: Google.ResponseType.IdToken,
    });
  }

  // Sign in with Google
  async signInWithGoogle(idToken: string) {
    try {
      // Create Google credential
      const credential = GoogleAuthProvider.credential(idToken);
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Check if user document exists
      const userExists = await userService.getUserById(user.uid);
      
      if (!userExists) {
        // Create new user document
        await userService.createUser({
          id: user.uid,
          email: user.email!,
          displayName: user.displayName || 'Luna User',
          photoURL: user.photoURL || undefined,
          provider: 'google',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Update last login
        await userService.updateUser(user.uid, {
          lastLogin: new Date(),
          updatedAt: new Date(),
        });
      }

      return user;
    } catch (error) {
      throw this.handleGoogleAuthError(error);
    }
  }

  // Link Google account to existing user
  async linkGoogleAccount(idToken: string) {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      return await authService.linkProvider('google.com', credential);
    } catch (error) {
      throw this.handleGoogleAuthError(error);
    }
  }

  // Unlink Google account
  async unlinkGoogleAccount() {
    try {
      return await authService.unlinkProvider('google.com');
    } catch (error) {
      throw this.handleGoogleAuthError(error);
    }
  }

  // Handle Google-specific auth errors
  private handleGoogleAuthError(error: any): Error {
    const errorCode = error.code;
    const googleErrorMessages: { [key: string]: string } = {
      'auth/account-exists-with-different-credential': 
        'An account already exists with this email. Try signing in with a different method.',
      'auth/popup-closed-by-user': 
        'Sign-in was cancelled. Please try again.',
      'auth/cancelled-popup-request': 
        'Another sign-in is in progress. Please wait.',
      'auth/popup-blocked': 
        'Sign-in popup was blocked. Please allow popups for this site.',
      'auth/unauthorized-domain': 
        'This domain is not authorized for Google sign-in.',
    };

    const message = googleErrorMessages[errorCode] || error.message;
    return new Error(message);
  }

  // Check if Google Sign-In is available
  isAvailable(): boolean {
    return Platform.OS === 'web' || 
           (Constants.appOwnership !== 'expo' && !!this.getClientId());
  }

  // Get provider ID
  getProviderId(): string {
    return GoogleAuthProvider.PROVIDER_ID;
  }
}

export const googleAuthService = new GoogleAuthService();