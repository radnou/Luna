import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@styles/index';
import { journalService } from '@services/journal.service';
import { useAuth } from '@hooks/useAuth';
import { MOOD_OPTIONS, type JournalStats } from '@types/journal';
import { MoodAnalytics } from '@components/journal/MoodAnalytics';

const { width } = Dimensions.get('window');

export default function Insights() {
  const { user } = useAuth();
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [quickMood, setQuickMood] = useState<number | null>(null);

  useEffect(() => {
    loadStats();
  }, [user, selectedPeriod]);

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const journalStats = await journalService.getUserStats(user.uid, selectedPeriod);
      setStats(journalStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMoodLog = async (moodValue: number) => {
    if (!user) return;
    
    setQuickMood(moodValue);
    try {
      await journalService.logQuickMood(user.uid, moodValue);
      // Reload stats to reflect the new mood
      loadStats();
    } catch (error) {
      console.error('Error logging mood:', error);
    }
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Insights</Text>
          <Text style={styles.subtitle}>
            Track your emotional journey and discover patterns
          </Text>
        </View>

        {/* Quick Mood Log */}
        <View style={styles.quickMoodSection}>
          <Text style={styles.sectionTitle}>How are you feeling right now?</Text>
          <View style={styles.quickMoodContainer}>
            {MOOD_OPTIONS.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.quickMoodItem,
                  quickMood === mood.value && styles.quickMoodItemSelected,
                ]}
                onPress={() => handleQuickMoodLog(mood.value)}
              >
                <Text style={styles.quickMoodEmoji}>{mood.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mood Analytics */}
        {stats && <MoodAnalytics stats={stats} period={selectedPeriod} />}

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={[styles.statCard, { marginRight: spacing.md }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="book" size={24} color={colors.neutral.white} />
            <Text style={styles.statValue}>{stats?.totalEntries || 0}</Text>
            <Text style={styles.statLabel}>Total Entries</Text>
          </LinearGradient>

          <LinearGradient
            colors={colors.gradients.aurora}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="flame" size={24} color={colors.neutral.white} />
            <Text style={styles.statValue}>{stats?.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </LinearGradient>

          <LinearGradient
            colors={[colors.primary.purple, colors.primary.pink]}
            style={[styles.statCard, { marginRight: spacing.md }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="happy" size={24} color={colors.neutral.white} />
            <Text style={styles.statValue}>
              {stats?.moodAverage ? stats.moodAverage.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.statLabel}>Avg Mood</Text>
          </LinearGradient>

          <LinearGradient
            colors={[colors.accent.coral, colors.primary.pink]}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="trophy" size={24} color={colors.neutral.white} />
            <Text style={styles.statValue}>{stats?.longestStreak || 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </LinearGradient>
        </View>

        {/* Top Tags */}
        {stats?.topTags && stats.topTags.length > 0 && (
          <View style={styles.topTagsSection}>
            <Text style={styles.sectionTitle}>Your Top Topics</Text>
            <View style={styles.tagsList}>
              {stats.topTags.slice(0, 5).map((tagData, index) => (
                <View key={index} style={styles.tagItem}>
                  <Text style={styles.tagText}>#{tagData.tag}</Text>
                  <Text style={styles.tagCount}>{tagData.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Patterns & Insights */}
        <View style={styles.patternsSection}>
          <Text style={styles.sectionTitle}>Patterns & Insights</Text>
          <View style={styles.insightCard}>
            <LinearGradient
              colors={[colors.primary.pink + '20', colors.primary.purple + '20']}
              style={styles.insightGradient}
            >
              <Ionicons name="bulb-outline" size={20} color={colors.primary.pink} />
              <Text style={styles.insightText}>
                You tend to feel happiest on weekends. Consider scheduling more relaxing activities during weekdays.
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.insightCard}>
            <LinearGradient
              colors={[colors.primary.purple + '20', colors.accent.lavender + '20']}
              style={styles.insightGradient}
            >
              <Ionicons name="trending-up-outline" size={20} color={colors.primary.purple} />
              <Text style={styles.insightText}>
                Your mood has been improving over the past month. Keep up the positive momentum!
              </Text>
            </LinearGradient>
          </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.neutral.black,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral.gray,
  },
  quickMoodSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.md,
  },
  quickMoodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickMoodItem: {
    width: (width - spacing.lg * 2 - spacing.sm * 4) / 5,
    aspectRatio: 1,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickMoodItemSelected: {
    backgroundColor: colors.primary.pink + '20',
    transform: [{ scale: 1.1 }],
  },
  quickMoodEmoji: {
    fontSize: 24,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: spacing.md,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.neutral.lightGray,
  },
  periodButtonActive: {
    backgroundColor: colors.primary.pink,
  },
  periodButtonText: {
    ...typography.body,
    color: colors.neutral.gray,
  },
  periodButtonTextActive: {
    color: colors.neutral.white,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    aspectRatio: 1,
    borderRadius: spacing.lg,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    ...typography.h2,
    color: colors.neutral.white,
    marginVertical: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.neutral.white + 'CC',
  },
  topTagsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.pink + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    ...typography.body,
    color: colors.primary.pink,
    marginRight: spacing.xs,
  },
  tagCount: {
    ...typography.caption,
    color: colors.primary.pink,
    fontWeight: '600',
  },
  patternsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  insightCard: {
    marginBottom: spacing.md,
  },
  insightGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: spacing.md,
  },
  insightText: {
    ...typography.body,
    color: colors.neutral.black,
    marginLeft: spacing.sm,
    flex: 1,
  },
});