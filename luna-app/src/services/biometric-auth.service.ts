import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { authService } from './auth.service';

class BiometricAuthService {
  private readonly BIOMETRIC_KEY = 'luna_biometric_enabled';
  private readonly CREDENTIALS_KEY = 'luna_biometric_credentials';

  // Check if biometric authentication is available
  async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return false;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled;
  }

  // Get available biometric types
  async getAvailableTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    if (Platform.OS === 'web') {
      return [];
    }
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  }

  // Enable biometric authentication
  async enableBiometric(email: string, password: string): Promise<boolean> {
    try {
      // First authenticate with biometrics
      const authResult = await this.authenticate('Enable biometric login for Luna');
      if (!authResult.success) {
        return false;
      }

      // Store encrypted credentials
      const credentials = JSON.stringify({ email, password });
      await SecureStore.setItemAsync(this.CREDENTIALS_KEY, credentials);
      await SecureStore.setItemAsync(this.BIOMETRIC_KEY, 'true');

      return true;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  }

  // Disable biometric authentication
  async disableBiometric(): Promise<boolean> {
    try {
      // First authenticate with biometrics
      const authResult = await this.authenticate('Disable biometric login');
      if (!authResult.success) {
        return false;
      }

      // Remove stored credentials
      await SecureStore.deleteItemAsync(this.CREDENTIALS_KEY);
      await SecureStore.deleteItemAsync(this.BIOMETRIC_KEY);

      return true;
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return false;
    }
  }

  // Check if biometric is enabled
  async isBiometricEnabled(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const enabled = await SecureStore.getItemAsync(this.BIOMETRIC_KEY);
      return enabled === 'true';
    } catch {
      return false;
    }
  }

  // Authenticate with biometrics
  async authenticate(reason: string = 'Authenticate to access Luna'): Promise<LocalAuthentication.LocalAuthenticationResult> {
    if (Platform.OS === 'web') {
      return { success: false, error: 'not-supported' };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      return result;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: 'unknown' };
    }
  }

  // Sign in with biometrics
  async signInWithBiometric(): Promise<any> {
    try {
      // Check if biometric is enabled
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        throw new Error('Biometric authentication is not enabled');
      }

      // Authenticate with biometrics
      const authResult = await this.authenticate('Sign in to Luna');
      if (!authResult.success) {
        throw new Error('Biometric authentication failed');
      }

      // Retrieve stored credentials
      const credentialsJson = await SecureStore.getItemAsync(this.CREDENTIALS_KEY);
      if (!credentialsJson) {
        throw new Error('No stored credentials found');
      }

      const { email, password } = JSON.parse(credentialsJson);

      // Sign in with stored credentials
      return await authService.signIn(email, password);
    } catch (error) {
      throw error;
    }
  }

  // Update stored credentials (when user changes password)
  async updateStoredCredentials(email: string, password: string): Promise<boolean> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        return false;
      }

      // Authenticate with biometrics
      const authResult = await this.authenticate('Update stored credentials');
      if (!authResult.success) {
        return false;
      }

      // Update credentials
      const credentials = JSON.stringify({ email, password });
      await SecureStore.setItemAsync(this.CREDENTIALS_KEY, credentials);

      return true;
    } catch (error) {
      console.error('Error updating credentials:', error);
      return false;
    }
  }

  // Get biometric type string for UI
  getBiometricTypeString(types: LocalAuthentication.AuthenticationType[]): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris Recognition';
    }
    return 'Biometric';
  }
}

export const biometricAuthService = new BiometricAuthService();