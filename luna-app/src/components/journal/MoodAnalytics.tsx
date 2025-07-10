import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '@styles/index';
import { JournalEntry, MOOD_OPTIONS } from '@types/journal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MoodAnalyticsProps {
  entries: JournalEntry[];
  period?: 'week' | 'month' | 'all';
}

export const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({ entries, period = 'month' }) => {
  const analytics = useMemo(() => {
    // Filter entries based on period
    const now = new Date();
    const filteredEntries = entries.filter(entry => {
      if (period === 'all') return true;
      
      const entryDate = new Date(entry.createdAt);
      const daysDiff = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (period === 'week') return daysDiff <= 7;
      if (period === 'month') return daysDiff <= 30;
      return false;
    });

    // Calculate mood distribution
    const moodCounts = MOOD_OPTIONS.reduce((acc, mood) => {
      acc[mood.value] = 0;
      return acc;
    }, {} as Record<number, number>);

    let totalMoodValue = 0;
    let entriesWithMood = 0;

    filteredEntries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood.value]++;
        totalMoodValue += entry.mood.value;
        entriesWithMood++;
      }
    });

    const averageMood = entriesWithMood > 0 ? totalMoodValue / entriesWithMood : 0;
    
    // Find dominant mood
    let dominantMood = MOOD_OPTIONS[2]; // Default to neutral
    let maxCount = 0;
    
    Object.entries(moodCounts).forEach(([value, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = MOOD_OPTIONS.find(m => m.value === parseInt(value)) || dominantMood;
      }
    });

    // Calculate mood trend (simple linear regression)
    const recentEntries = filteredEntries
      .filter(e => e.mood)
      .slice(-10)
      .map((e, index) => ({ x: index, y: e.mood!.value }));

    let trend = 'stable';
    if (recentEntries.length >= 3) {
      const n = recentEntries.length;
      const sumX = recentEntries.reduce((sum, e) => sum + e.x, 0);
      const sumY = recentEntries.reduce((sum, e) => sum + e.y, 0);
      const sumXY = recentEntries.reduce((sum, e) => sum + e.x * e.y, 0);
      const sumX2 = recentEntries.reduce((sum, e) => sum + e.x * e.x, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      
      if (slope > 0.1) trend = 'improving';
      else if (slope < -0.1) trend = 'declining';
    }

    return {
      moodCounts,
      averageMood,
      dominantMood,
      trend,
      totalEntries: filteredEntries.length,
      entriesWithMood,
    };
  }, [entries, period]);

  const getMoodPercentage = (count: number) => {
    if (analytics.entriesWithMood === 0) return 0;
    return (count / analytics.entriesWithMood) * 100;
  };

  const getTrendIcon = () => {
    switch (analytics.trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendText = () => {
    switch (analytics.trend) {
      case 'improving': return 'Your mood is improving!';
      case 'declining': return 'Your mood needs attention';
      default: return 'Your mood is stable';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.neutral.offWhite, colors.neutral.white]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.title}>Mood Insights</Text>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryEmoji}>{analytics.dominantMood.emoji}</Text>
            <Text style={styles.summaryLabel}>Most Common</Text>
            <Text style={styles.summaryValue}>{analytics.dominantMood.label}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryEmoji}>
              {MOOD_OPTIONS[Math.round(analytics.averageMood) - 1]?.emoji || '😐'}
            </Text>
            <Text style={styles.summaryLabel}>Average Mood</Text>
            <Text style={styles.summaryValue}>
              {analytics.averageMood.toFixed(1)}/5.0
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryEmoji}>{getTrendIcon()}</Text>
            <Text style={styles.summaryLabel}>Trend</Text>
            <Text style={styles.summaryValue}>{analytics.trend}</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Mood Distribution</Text>
          {MOOD_OPTIONS.map(mood => {
            const count = analytics.moodCounts[mood.value];
            const percentage = getMoodPercentage(count);
            
            return (
              <View key={mood.value} style={styles.barContainer}>
                <View style={styles.barLabelContainer}>
                  <Text style={styles.barEmoji}>{mood.emoji}</Text>
                  <Text style={styles.barCount}>{count}</Text>
                </View>
                <View style={styles.barBackground}>
                  <LinearGradient
                    colors={[mood.color, colors.secondary.lightPurple]}
                    style={[styles.bar, { width: `${percentage}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.barPercentage}>{percentage.toFixed(0)}%</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.insightContainer}>
          <Text style={styles.insightIcon}>{getTrendIcon()}</Text>
          <Text style={styles.insightText}>{getTrendText()}</Text>
        </View>

        <Text style={styles.footer}>
          Based on {analytics.entriesWithMood} entries 
          {period !== 'all' && ` from the past ${period}`}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  card: {
    borderRadius: spacing.lg,
    padding: spacing.lg,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.neutral.gray,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.bodyBold,
    color: colors.neutral.black,
  },
  chartContainer: {
    marginBottom: spacing.lg,
  },
  chartTitle: {
    ...typography.bodyBold,
    color: colors.neutral.black,
    marginBottom: spacing.md,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
  },
  barEmoji: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  barCount: {
    ...typography.caption,
    color: colors.neutral.gray,
  },
  barBackground: {
    flex: 1,
    height: 20,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: spacing.sm,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: spacing.sm,
  },
  barPercentage: {
    ...typography.caption,
    color: colors.neutral.darkGray,
    width: 35,
    textAlign: 'right',
  },
  insightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.lightGray,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.md,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  insightText: {
    ...typography.body,
    color: colors.neutral.black,
  },
  footer: {
    ...typography.caption,
    color: colors.neutral.gray,
    textAlign: 'center',
  },
});