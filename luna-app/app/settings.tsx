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
import { colors, typography, spacing } from '@styles/index';
import { userService } from '@services/user.service';
import { useAuth } from '@hooks/useAuth';
import type { UserPreferences } from '@types/user';

export default function Settings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      journal: true,
      insights: true,
      reminders: true,
    },
    privacy: {
      isProfilePublic: false,
      shareInsights: false,
    },
    theme: 'light',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      const profile = await userService.getUserProfile(user.uid);
      if (profile?.preferences) {
        setPreferences(profile.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updatePreference = async (category: keyof UserPreferences, key: string, value: any) => {
    if (!user) return;

    const newPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category as keyof UserPreferences],
        [key]: value,
      },
    };

    setPreferences(newPreferences);
    setIsLoading(true);

    try {
      await userService.updateUserPreferences(user.uid, newPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert('Error', 'Failed to update preferences');
      // Revert the change
      loadPreferences();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Implement account deletion
            console.log('Delete account');
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.neutral.black} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Journal Reminders</Text>
                <Text style={styles.settingDescription}>
                  Daily reminders to write in your journal
                </Text>
              </View>
              <Switch
                value={preferences.notifications.journal}
                onValueChange={(value) =>
                  updatePreference('notifications', 'journal', value)
                }
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                disabled={isLoading}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Insights</Text>
                <Text style={styles.settingDescription}>
                  Get notified about new insights and patterns
                </Text>
              </View>
              <Switch
                value={preferences.notifications.insights}
                onValueChange={(value) =>
                  updatePreference('notifications', 'insights', value)
                }
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                disabled={isLoading}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Mood Check-ins</Text>
                <Text style={styles.settingDescription}>
                  Reminders to log your mood
                </Text>
              </View>
              <Switch
                value={preferences.notifications.reminders}
                onValueChange={(value) =>
                  updatePreference('notifications', 'reminders', value)
                }
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                disabled={isLoading}
              />
            </View>
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Public Profile</Text>
                <Text style={styles.settingDescription}>
                  Allow others to see your profile
                </Text>
              </View>
              <Switch
                value={preferences.privacy.isProfilePublic}
                onValueChange={(value) =>
                  updatePreference('privacy', 'isProfilePublic', value)
                }
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                disabled={isLoading}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Share Insights</Text>
                <Text style={styles.settingDescription}>
                  Contribute anonymized data to improve Luna
                </Text>
              </View>
              <Switch
                value={preferences.privacy.shareInsights}
                onValueChange={(value) =>
                  updatePreference('privacy', 'shareInsights', value)
                }
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.pink }}
                disabled={isLoading}
              />
            </View>
          </View>

          {/* Appearance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Theme</Text>
                <Text style={styles.settingDescription}>
                  {preferences.theme === 'light' ? 'Light' : preferences.theme === 'dark' ? 'Dark' : 'Auto'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/change-password')}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/export-data')}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Export Data</Text>
                <Text style={styles.settingDescription}>
                  Download all your journal entries
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, styles.dangerItem]} 
              onPress={handleDeleteAccount}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, styles.dangerText]}>Delete Account</Text>
                <Text style={[styles.settingDescription, styles.dangerText]}>
                  Permanently delete your account and data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.accent.coral} />
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/about')}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>About Luna</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/terms')}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/privacy-policy')}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Luna v1.0.0</Text>
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
  dangerItem: {
    marginTop: spacing.md,
  },
  dangerText: {
    color: colors.accent.coral,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  versionText: {
    ...typography.caption,
    color: colors.neutral.gray,
  },
});