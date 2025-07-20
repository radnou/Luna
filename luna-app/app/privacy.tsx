import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors, typography, spacing } from '@styles/index';
import { userService } from '@services/user.service';
import { useAuth } from '@hooks/useAuth';

interface PrivacySettings {
  biometricLock: boolean;
  privateProfile: boolean;
  hideEmail: boolean;
  hidePhone: boolean;
  blockList: string[];
  dataSharing: {
    analytics: boolean;
    crashReports: boolean;
    personalization: boolean;
  };
}

export default function Privacy() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>({
    biometricLock: false,
    privateProfile: false,
    hideEmail: true,
    hidePhone: true,
    blockList: [],
    dataSharing: {
      analytics: false,
      crashReports: true,
      personalization: false,
    },
  });
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    loadPrivacySettings();
  }, [user]);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
  };

  const loadPrivacySettings = async () => {
    if (!user) return;
    
    try {
      const privacySettings = await userService.getPrivacySettings(user.uid);
      if (privacySettings) {
        setSettings(privacySettings);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    if (!user) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setIsLoading(true);

    try {
      await userService.updatePrivacySettings(user.uid, newSettings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      Alert.alert('Error', 'Failed to update privacy settings');
      // Revert the change
      loadPrivacySettings();
    } finally {
      setIsLoading(false);
    }
  };

  const updateDataSharing = async (key: keyof PrivacySettings['dataSharing'], value: boolean) => {
    const newDataSharing = { ...settings.dataSharing, [key]: value };
    await updateSetting('dataSharing', newDataSharing);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value && biometricAvailable) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric lock',
          cancelLabel: 'Cancel',
        });

        if (result.success) {
          await updateSetting('biometricLock', true);
        }
      } catch (error) {
        console.error('Biometric authentication error:', error);
      }
    } else {
      await updateSetting('biometricLock', false);
    }
  };

  const handleManageBlockList = () => {
    router.push('/blocked-users');
  };

  const handleDataRequest = () => {
    Alert.alert(
      'Request Your Data',
      'You can request a copy of all your data. This process may take up to 48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            try {
              await userService.requestDataExport(user!.uid);
              Alert.alert('Success', 'Your data export request has been submitted. You will receive an email when it\'s ready.');
            } catch (error) {
              Alert.alert('Error', 'Failed to request data export');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Privacy & Security',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.neutral.black} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            
            {biometricAvailable && (
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Biometric Lock</Text>
                  <Text style={styles.settingDescription}>
                    Use Face ID or Touch ID to unlock Luna
                  </Text>
                </View>
                <Switch
                  value={settings.biometricLock}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                  disabled={isLoading}
                />
              </View>
            )}

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/change-password')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Change Password</Text>
                <Text style={styles.settingDescription}>
                  Update your account password
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/two-factor')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>
                  Add an extra layer of security
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Private Profile</Text>
                <Text style={styles.settingDescription}>
                  Only approved followers can see your profile
                </Text>
              </View>
              <Switch
                value={settings.privateProfile}
                onValueChange={(value) => updateSetting('privateProfile', value)}
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                disabled={isLoading}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Hide Email</Text>
                <Text style={styles.settingDescription}>
                  Don't show your email on your profile
                </Text>
              </View>
              <Switch
                value={settings.hideEmail}
                onValueChange={(value) => updateSetting('hideEmail', value)}
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                disabled={isLoading}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Hide Phone Number</Text>
                <Text style={styles.settingDescription}>
                  Don't show your phone number on your profile
                </Text>
              </View>
              <Switch
                value={settings.hidePhone}
                onValueChange={(value) => updateSetting('hidePhone', value)}
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                disabled={isLoading}
              />
            </View>

            <TouchableOpacity style={styles.settingItem} onPress={handleManageBlockList}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Blocked Users</Text>
                <Text style={styles.settingDescription}>
                  {settings.blockList.length} users blocked
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>
          </View>

          {/* Data Sharing Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Sharing</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Analytics</Text>
                <Text style={styles.settingDescription}>
                  Help improve Luna by sharing usage data
                </Text>
              </View>
              <Switch
                value={settings.dataSharing.analytics}
                onValueChange={(value) => updateDataSharing('analytics', value)}
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                disabled={isLoading}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Crash Reports</Text>
                <Text style={styles.settingDescription}>
                  Automatically send crash reports
                </Text>
              </View>
              <Switch
                value={settings.dataSharing.crashReports}
                onValueChange={(value) => updateDataSharing('crashReports', value)}
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                disabled={isLoading}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Personalization</Text>
                <Text style={styles.settingDescription}>
                  Use your data to personalize your experience
                </Text>
              </View>
              <Switch
                value={settings.dataSharing.personalization}
                onValueChange={(value) => updateDataSharing('personalization', value)}
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                disabled={isLoading}
              />
            </View>
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleDataRequest}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Download Your Data</Text>
                <Text style={styles.settingDescription}>
                  Get a copy of all your Luna data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/delete-account')}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, styles.dangerText]}>
                  Delete Account
                </Text>
                <Text style={[styles.settingDescription, styles.dangerText]}>
                  Permanently delete your account and data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.accent.coral} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutral.black,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral.white,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.neutral.black,
    marginBottom: 4,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.neutral.gray,
  },
  dangerText: {
    color: colors.accent.coral,
  },
});