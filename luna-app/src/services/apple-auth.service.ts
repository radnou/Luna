import {
  OAuthProvider,
  signInWithCredential,
  linkWithCredential,
} from 'firebase/auth';
import { auth } from '@config/firebase';
import { userService } from './user.service';
import { authService } from './auth.service';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

class AppleAuthService {
  private provider: OAuthProvider;

  constructor() {
    this.provider = new OAuthProvider('apple.com');
    this.provider.addScope('email');
    this.provider.addScope('name');
  }

  // Check if Apple Sign-In is available
  async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return await AppleAuthentication.isAvailableAsync();
    }
    return Platform.OS === 'web';
  }

  // Sign in with Apple (Native iOS)
  async signInWithAppleNative() {
    try {
      // Generate nonce for security
      const nonce = await this.generateNonce();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      // Create OAuth credential
      const oauthCredential = this.provider.credential({
        idToken: credential.identityToken!,
        rawNonce: nonce,
      });

      // Sign in with Firebase
      const userCredential = await signInWithCredential(auth, oauthCredential);
      const user = userCredential.user;

      // Check if user document exists
      const userExists = await userService.getUserById(user.uid);
      
      if (!userExists) {
        // Create new user document
        const displayName = credential.fullName 
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : 'Luna User';

        await userService.createUser({
          id: user.uid,
          email: credential.email || user.email || `${user.uid}@privaterelay.appleid.com`,
          displayName: displayName || user.displayName || 'Luna User',
          provider: 'apple',
          emailVerified: true,
          appleUserId: credential.user,
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
      throw this.handleAppleAuthError(error);
    }
  }

  // Sign in with Apple (Web)
  async signInWithAppleWeb() {
    try {
      // Use Firebase's built-in popup for web
      const { signInWithPopup } = await import('firebase/auth');
      const userCredential = await signInWithPopup(auth, this.provider);
      const user = userCredential.user;

      // Check if user document exists
      const userExists = await userService.getUserById(user.uid);
      
      if (!userExists) {
        // Create new user document
        await userService.createUser({
          id: user.uid,
          email: user.email!,
          displayName: user.displayName || 'Luna User',
          provider: 'apple',
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
      throw this.handleAppleAuthError(error);
    }
  }

  // Main sign in method
  async signInWithApple() {
    if (Platform.OS === 'ios') {
      return await this.signInWithAppleNative();
    } else if (Platform.OS === 'web') {
      return await this.signInWithAppleWeb();
    } else {
      throw new Error('Apple Sign-In is not available on this platform');
    }
  }

  // Link Apple account to existing user
  async linkAppleAccount() {
    try {
      if (Platform.OS === 'ios') {
        const nonce = await this.generateNonce();
        const hashedNonce = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          nonce
        );

        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
          nonce: hashedNonce,
        });

        const oauthCredential = this.provider.credential({
          idToken: credential.identityToken!,
          rawNonce: nonce,
        });

        return await authService.linkProvider('apple.com', oauthCredential);
      } else {
        throw new Error('Apple account linking is only available on iOS');
      }
    } catch (error) {
      throw this.handleAppleAuthError(error);
    }
  }

  // Unlink Apple account
  async unlinkAppleAccount() {
    try {
      return await authService.unlinkProvider('apple.com');
    } catch (error) {
      throw this.handleAppleAuthError(error);
    }
  }

  // Generate a secure nonce
  private async generateNonce(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  // Handle Apple-specific auth errors
  private handleAppleAuthError(error: any): Error {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      return new Error('Apple Sign-In was cancelled');
    }
    
    const errorCode = error.code;
    const appleErrorMessages: { [key: string]: string } = {
      'auth/account-exists-with-different-credential': 
        'An account already exists with this email. Try signing in with a different method.',
      'auth/invalid-credential': 
        'The Apple credential is invalid or has expired.',
      'auth/operation-not-allowed': 
        'Apple Sign-In is not enabled. Please contact support.',
      'ERR_REQUEST_FAILED': 
        'Apple Sign-In failed. Please try again.',
    };

    const message = appleErrorMessages[errorCode] || error.message;
    return new Error(message);
  }

  // Get provider ID
  getProviderId(): string {
    return OAuthProvider.PROVIDER_ID;
  }
}

export const appleAuthService = new AppleAuthService();