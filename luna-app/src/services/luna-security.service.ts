import { firestore, auth } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface PrivacySettings {
  encryptConversations: boolean;
  allowDataAnalysis: boolean;
  shareInsightsWithPartner: boolean;
  deleteDataAfterDays: number | null;
  anonymizeData: boolean;
  exportDataAllowed: boolean;
}

export interface SecurityAudit {
  id: string;
  action: string;
  timestamp: Date;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface DataRetention {
  conversationsRetentionDays: number;
  journalRetentionDays: number;
  insightsRetentionDays: number;
  autoDeleteEnabled: boolean;
}

class LunaSecurityService {
  private encryptionKey: string | null = null;
  private readonly ENCRYPTION_KEY_STORAGE = 'luna_encryption_key';
  private readonly PRIVACY_SETTINGS_KEY = 'luna_privacy_settings';

  // Initialize security settings
  async initializeSecurity(userId: string): Promise<void> {
    try {
      // Generate or retrieve encryption key
      await this.ensureEncryptionKey();

      // Set default privacy settings if not exists
      const privacyDoc = await getDoc(doc(firestore, `users/${userId}/privacy`));
      if (!privacyDoc.exists()) {
        await this.setDefaultPrivacySettings(userId);
      }

      // Log security initialization
      await this.logSecurityEvent(userId, 'security_initialized');
    } catch (error) {
      console.error('Error initializing security:', error);
      throw error;
    }
  }

  // Encryption methods
  private async ensureEncryptionKey(): Promise<void> {
    try {
      let key = await AsyncStorage.getItem(this.ENCRYPTION_KEY_STORAGE);
      if (!key) {
        // Generate new encryption key
        const randomBytes = await Crypto.getRandomBytesAsync(32);
        key = btoa(String.fromCharCode(...new Uint8Array(randomBytes)));
        await AsyncStorage.setItem(this.ENCRYPTION_KEY_STORAGE, key);
      }
      this.encryptionKey = key;
    } catch (error) {
      console.error('Error ensuring encryption key:', error);
      throw error;
    }
  }

  async encryptMessage(message: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.ensureEncryptionKey();
    }

    try {
      // Simple encryption - in production, use a more robust method
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        message + this.encryptionKey!,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      
      // XOR with key for basic encryption
      const encrypted = btoa(
        message.split('').map((char, i) => 
          String.fromCharCode(char.charCodeAt(0) ^ this.encryptionKey!.charCodeAt(i % this.encryptionKey!.length))
        ).join('')
      );

      return encrypted;
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw error;
    }
  }

  async decryptMessage(encryptedMessage: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.ensureEncryptionKey();
    }

    try {
      // Decrypt the message
      const decoded = atob(encryptedMessage);
      const decrypted = decoded.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ this.encryptionKey!.charCodeAt(i % this.encryptionKey!.length))
      ).join('');

      return decrypted;
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw error;
    }
  }

  // Privacy settings
  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      // Try local cache first
      const cached = await AsyncStorage.getItem(`${this.PRIVACY_SETTINGS_KEY}_${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from Firestore
      const privacyDoc = await getDoc(doc(firestore, `users/${userId}/privacy`));
      if (privacyDoc.exists()) {
        const settings = privacyDoc.data() as PrivacySettings;
        // Cache locally
        await AsyncStorage.setItem(`${this.PRIVACY_SETTINGS_KEY}_${userId}`, JSON.stringify(settings));
        return settings;
      }

      // Return defaults
      return this.getDefaultPrivacySettings();
    } catch (error) {
      console.error('Error getting privacy settings:', error);
      return this.getDefaultPrivacySettings();
    }
  }

  async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<void> {
    try {
      const currentSettings = await this.getPrivacySettings(userId);
      const updatedSettings = { ...currentSettings, ...settings };

      // Update Firestore
      await updateDoc(doc(firestore, `users/${userId}/privacy`), {
        ...updatedSettings,
        updatedAt: serverTimestamp()
      });

      // Update local cache
      await AsyncStorage.setItem(`${this.PRIVACY_SETTINGS_KEY}_${userId}`, JSON.stringify(updatedSettings));

      // Log privacy change
      await this.logSecurityEvent(userId, 'privacy_settings_updated', settings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  private async setDefaultPrivacySettings(userId: string): Promise<void> {
    const defaultSettings = this.getDefaultPrivacySettings();
    
    await setDoc(doc(firestore, `users/${userId}/privacy`), {
      ...defaultSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  private getDefaultPrivacySettings(): PrivacySettings {
    return {
      encryptConversations: true,
      allowDataAnalysis: true,
      shareInsightsWithPartner: false,
      deleteDataAfterDays: null,
      anonymizeData: false,
      exportDataAllowed: true
    };
  }

  // Content filtering
  async filterSensitiveContent(content: string): Promise<{
    filtered: boolean;
    reason?: string;
    cleanContent?: string;
  }> {
    // Check for sensitive information patterns
    const sensitivePatterns = [
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'SSN' },
      { pattern: /\b\d{16}\b/g, type: 'Credit Card' },
      { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: 'Email' },
      { pattern: /\b\d{10,11}\b/g, type: 'Phone Number' },
      { pattern: /\b(suicide|self-harm|kill myself)\b/gi, type: 'Crisis Content' }
    ];

    for (const { pattern, type } of sensitivePatterns) {
      if (pattern.test(content)) {
        return {
          filtered: true,
          reason: `Contains ${type}`,
          cleanContent: content.replace(pattern, '[FILTERED]')
        };
      }
    }

    return { filtered: false };
  }

  // Data retention and deletion
  async getDataRetentionSettings(userId: string): Promise<DataRetention> {
    try {
      const retentionDoc = await getDoc(doc(firestore, `users/${userId}/dataRetention`));
      if (retentionDoc.exists()) {
        return retentionDoc.data() as DataRetention;
      }

      // Default retention settings
      return {
        conversationsRetentionDays: 365,
        journalRetentionDays: -1, // Never delete
        insightsRetentionDays: 180,
        autoDeleteEnabled: false
      };
    } catch (error) {
      console.error('Error getting data retention settings:', error);
      throw error;
    }
  }

  async updateDataRetentionSettings(userId: string, settings: Partial<DataRetention>): Promise<void> {
    try {
      await updateDoc(doc(firestore, `users/${userId}/dataRetention`), {
        ...settings,
        updatedAt: serverTimestamp()
      });

      await this.logSecurityEvent(userId, 'data_retention_updated', settings);
    } catch (error) {
      console.error('Error updating data retention settings:', error);
      throw error;
    }
  }

  // Export user data
  async exportUserData(userId: string): Promise<{
    conversations: any[];
    journal: any[];
    insights: any[];
    profile: any;
  }> {
    try {
      // Check if export is allowed
      const privacy = await this.getPrivacySettings(userId);
      if (!privacy.exportDataAllowed) {
        throw new Error('Data export is disabled in privacy settings');
      }

      // Log export event
      await this.logSecurityEvent(userId, 'data_exported');

      // Collect all user data
      const [conversations, journal, insights, profile] = await Promise.all([
        this.exportConversations(userId),
        this.exportJournalEntries(userId),
        this.exportInsights(userId),
        this.exportProfile(userId)
      ]);

      return {
        conversations,
        journal,
        insights,
        profile
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  private async exportConversations(userId: string): Promise<any[]> {
    // Implementation for exporting conversations
    const conversationsSnapshot = await firestore
      .collection(`users/${userId}/conversations`)
      .orderBy('timestamp', 'desc')
      .get();

    return conversationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  private async exportJournalEntries(userId: string): Promise<any[]> {
    // Implementation for exporting journal entries
    const entriesSnapshot = await firestore
      .collection(`users/${userId}/entries`)
      .orderBy('createdAt', 'desc')
      .get();

    return entriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  private async exportInsights(userId: string): Promise<any[]> {
    // Implementation for exporting insights
    const insightsSnapshot = await firestore
      .collection(`users/${userId}/insights`)
      .orderBy('timestamp', 'desc')
      .get();

    return insightsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  private async exportProfile(userId: string): Promise<any> {
    const userDoc = await getDoc(doc(firestore, `users/${userId}`));
    return userDoc.exists() ? userDoc.data() : null;
  }

  // Delete user data
  async deleteAllUserData(userId: string): Promise<void> {
    try {
      // Require re-authentication before deletion
      const user = auth.currentUser;
      if (!user || user.uid !== userId) {
        throw new Error('User authentication required for data deletion');
      }

      // Log deletion request
      await this.logSecurityEvent(userId, 'data_deletion_requested');

      // Delete collections
      const collections = ['conversations', 'entries', 'insights', 'notifications'];
      
      for (const collectionName of collections) {
        await this.deleteCollection(userId, collectionName);
      }

      // Delete user document
      await firestore.doc(`users/${userId}`).delete();

      // Clear local storage
      await this.clearLocalData(userId);

      // Log completion
      await this.logSecurityEvent(userId, 'data_deletion_completed');
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  private async deleteCollection(userId: string, collectionName: string): Promise<void> {
    const collectionRef = firestore.collection(`users/${userId}/${collectionName}`);
    const snapshot = await collectionRef.get();
    
    const batch = firestore.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  private async clearLocalData(userId: string): Promise<void> {
    // Clear all user-specific data from AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    const userKeys = keys.filter(key => key.includes(userId));
    await AsyncStorage.multiRemove(userKeys);
  }

  // Security audit logging
  private async logSecurityEvent(userId: string, action: string, details?: any): Promise<void> {
    try {
      await firestore.collection(`users/${userId}/securityAudit`).add({
        action,
        timestamp: serverTimestamp(),
        details: details || null,
        deviceInfo: await this.getDeviceInfo()
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  private async getDeviceInfo(): Promise<string> {
    // In a real app, collect device information
    return 'Mobile Device';
  }

  // Session management
  async validateSession(userId: string): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user || user.uid !== userId) {
        return false;
      }

      // Check session timeout
      const lastActivity = await AsyncStorage.getItem(`last_activity_${userId}`);
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        const sessionTimeout = 30 * 60 * 1000; // 30 minutes
        
        if (timeSinceActivity > sessionTimeout) {
          await this.logSecurityEvent(userId, 'session_timeout');
          return false;
        }
      }

      // Update last activity
      await AsyncStorage.setItem(`last_activity_${userId}`, Date.now().toString());
      
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }

  // Rate limiting
  async checkRateLimit(userId: string, action: string, limit: number = 100): Promise<boolean> {
    const key = `rate_limit_${userId}_${action}`;
    const now = Date.now();
    const window = 60 * 60 * 1000; // 1 hour window

    try {
      const stored = await AsyncStorage.getItem(key);
      let data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + window };

      if (now > data.resetTime) {
        // Reset window
        data = { count: 1, resetTime: now + window };
      } else {
        data.count++;
      }

      await AsyncStorage.setItem(key, JSON.stringify(data));

      if (data.count > limit) {
        await this.logSecurityEvent(userId, 'rate_limit_exceeded', { action, count: data.count });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow on error
    }
  }
}

export default new LunaSecurityService();