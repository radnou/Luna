import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../styles';

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onOptions?: () => void;
  showStatus?: boolean;
  isOnline?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = "Luna",
  subtitle = "Toujours là pour toi 💫",
  onBack,
  onOptions,
  showStatus = true,
  isOnline = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <BlurView intensity={95} tint="light" style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
        style={styles.gradientOverlay}
      />
      
      <View style={styles.content}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.primary.main} />
          </TouchableOpacity>
        )}

        <View style={styles.centerContent}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[colors.primary.gradient.start, colors.primary.gradient.end]}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarEmoji}>✨</Text>
            </LinearGradient>
            {showStatus && (
              <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#9E9E9E' }]} />
            )}
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        {onOptions && (
          <TouchableOpacity onPress={onOptions} style={styles.optionsButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 112, 219, 0.1)',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 60,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  centerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  optionsButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});