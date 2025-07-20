import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@components/Button';
import { authService } from '@services/auth.service';
import { userService } from '@services/user.service';
import { useAuth } from '@hooks/useAuth';
import { colors, typography, spacing } from '@styles/index';
import type { User, UserProfile } from '@types/user';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [journalCount, setJournalCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const userProfile = await userService.getUserProfile(user.uid);
      setProfile(userProfile);
      
      // Get journal stats
      const stats = await userService.getUserStats(user.uid);
      setJournalCount(stats.totalEntries || 0);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const navigateToEditProfile = () => {
    router.push('/edit-profile');
  };

  const navigateToPhotos = () => {
    router.push('/photos');
  };

  const navigateToPrivacy = () => {
    router.push('/privacy');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.pink} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with gradient background */}
        <LinearGradient
          colors={colors.gradients.aurora}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity style={styles.settingsButton} onPress={navigateToSettings}>
            <Ionicons name="settings-outline" size={24} color={colors.neutral.white} />
          </TouchableOpacity>

          {/* Profile Picture */}
          <TouchableOpacity onPress={navigateToPhotos} style={styles.profileImageContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={48} color={colors.neutral.white} />
              </View>
            )}
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color={colors.neutral.white} />
            </View>
          </TouchableOpacity>

          {/* Name and Bio */}
          <Text style={styles.displayName}>{user?.displayName || 'Luna User'}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{journalCount}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.interests?.length || 0}</Text>
              <Text style={styles.statLabel}>Interests</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.isPremium ? 'Pro' : 'Free'}</Text>
              <Text style={styles.statLabel}>Plan</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editProfileButton} onPress={navigateToEditProfile}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToPhotos}>
            <View style={styles.menuIcon}>
              <Ionicons name="images-outline" size={24} color={colors.primary.pink} />
            </View>
            <Text style={styles.menuText}>Photos & Media</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={navigateToPrivacy}>
            <View style={styles.menuIcon}>
              <Ionicons name="lock-closed-outline" size={24} color={colors.primary.pink} />
            </View>
            <Text style={styles.menuText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/subscription')}>
            <View style={styles.menuIcon}>
              <Ionicons name="star-outline" size={24} color={colors.primary.pink} />
            </View>
            <Text style={styles.menuText}>Luna Premium</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/help')}>
            <View style={styles.menuIcon}>
              <Ionicons name="help-circle-outline" size={24} color={colors.primary.pink} />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            style={styles.signOutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  settingsButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.neutral.white,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral.white + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.pink,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
  },
  displayName: {
    ...typography.h2,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  bio: {
    ...typography.body,
    color: colors.neutral.white + 'CC',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    ...typography.h3,
    color: colors.neutral.white,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.neutral.white + 'CC',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.white + '30',
  },
  editProfileButton: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
  },
  editProfileText: {
    ...typography.bodyBold,
    color: colors.primary.pink,
  },
  menuContainer: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.pink + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuText: {
    ...typography.body,
    color: colors.neutral.black,
    flex: 1,
  },
  signOutContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  signOutButton: {
    width: '100%',
  },
});