import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@components/Card';
import { Button } from '@components/Button';
import { colors, typography, spacing } from '@styles/index';
import { useAuth } from '@hooks/useAuth';
import { journalService } from '@services/journal.service';
import { MOOD_OPTIONS } from '@types/journal';

export default function Home() {
  const { user } = useAuth();
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const entries = await journalService.getUserEntries(user.uid, 3);
      setRecentEntries(entries);
      
      // Check if user has logged mood today
      const todayEntry = entries.find(entry => {
        const entryDate = new Date(entry.createdAt);
        const today = new Date();
        return entryDate.toDateString() === today.toDateString() && entry.mood;
      });
      
      if (todayEntry?.mood) {
        setTodayMood(todayEntry.mood.value);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMood = async (moodValue: number) => {
    if (!user) return;
    
    setTodayMood(moodValue);
    try {
      await journalService.logQuickMood(user.uid, moodValue);
      loadData();
    } catch (error) {
      console.error('Error logging mood:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.displayName || 'Beautiful'}!</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</Text>
        </View>

        {/* Quick Mood Check */}
        <Card variant="filled" style={styles.quickAction}>
          <Text style={styles.cardTitle}>How are you feeling today?</Text>
          {todayMood ? (
            <View style={styles.moodLogged}>
              <Text style={styles.moodLoggedText}>You're feeling</Text>
              <Text style={styles.moodEmoji}>
                {MOOD_OPTIONS.find(m => m.value === todayMood)?.emoji}
              </Text>
              <Text style={styles.moodLabel}>
                {MOOD_OPTIONS.find(m => m.value === todayMood)?.label}
              </Text>
              <TouchableOpacity onPress={() => router.push('/create-entry')}>
                <Text style={styles.addMoreText}>Add more details →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.moodOptions}>
                {MOOD_OPTIONS.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={styles.moodOption}
                    onPress={() => handleQuickMood(mood.value)}
                  >
                    <Text style={styles.moodOptionEmoji}>{mood.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button
                title="Write in Journal"
                size="medium"
                gradient
                style={styles.cardButton}
                onPress={() => router.push('/create-entry')}
              />
            </>
          )}
        </Card>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/relationships')}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.quickActionGradient}
            >
              <Ionicons name="people" size={28} color={colors.neutral.white} />
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Relationships</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/(tabs)/insights')}
          >
            <LinearGradient
              colors={colors.gradients.aurora}
              style={styles.quickActionGradient}
            >
              <Ionicons name="analytics" size={28} color={colors.neutral.white} />
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/photos')}
          >
            <LinearGradient
              colors={[colors.primary.purple, colors.primary.pink]}
              style={styles.quickActionGradient}
            >
              <Ionicons name="images" size={28} color={colors.neutral.white} />
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <LinearGradient
              colors={[colors.accent.coral, colors.primary.pink]}
              style={styles.quickActionGradient}
            >
              <Ionicons name="chatbubble-ellipses" size={28} color={colors.neutral.white} />
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Luna Chat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/journal')}>
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary.pink} />
          ) : recentEntries.length > 0 ? (
            recentEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                onPress={() => router.push(`/entry-details?id=${entry.id}`)}
              >
                <Card style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>
                      {entry.title || 'Untitled Entry'}
                    </Text>
                    {entry.mood && (
                      <Text style={styles.entryMood}>{entry.mood.emoji}</Text>
                    )}
                  </View>
                  <Text style={styles.entryDate}>
                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </Text>
                  <Text style={styles.entryPreview} numberOfLines={2}>
                    {entry.content}
                  </Text>
                  {entry.tags && entry.tags.length > 0 && (
                    <View style={styles.entryTags}>
                      {entry.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.entryTag}>
                          <Text style={styles.entryTagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No entries yet. Start journaling!</Text>
              <Button
                title="Create First Entry"
                size="small"
                onPress={() => router.push('/create-entry')}
                style={styles.emptyButton}
              />
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Inspiration</Text>
          <Card variant="filled" style={styles.inspirationCard}>
            <Text style={styles.quote}>
              "The only way to do great work is to love what you do."
            </Text>
            <Text style={styles.author}>- Steve Jobs</Text>
          </Card>
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
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    color: colors.neutral.black,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.body,
    color: colors.neutral.gray,
  },
  quickAction: {
    marginBottom: spacing.xl,
    backgroundColor: colors.secondary.lightPurple,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.md,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  moodOption: {
    padding: spacing.sm,
  },
  moodOptionEmoji: {
    fontSize: 32,
  },
  moodLogged: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  moodLoggedText: {
    ...typography.body,
    color: colors.neutral.darkGray,
    marginBottom: spacing.sm,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  moodLabel: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.md,
  },
  addMoreText: {
    ...typography.bodyBold,
    color: colors.primary.pink,
  },
  cardButton: {
    marginTop: spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.xl,
  },
  quickActionItem: {
    width: '25%',
    padding: spacing.xs,
    alignItems: 'center',
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    ...typography.caption,
    color: colors.neutral.black,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.neutral.black,
  },
  seeAllText: {
    ...typography.body,
    color: colors.primary.pink,
  },
  entryCard: {
    marginBottom: spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  entryTitle: {
    ...typography.h3,
    color: colors.neutral.black,
    flex: 1,
  },
  entryMood: {
    fontSize: 20,
    marginLeft: spacing.sm,
  },
  entryDate: {
    ...typography.caption,
    color: colors.neutral.gray,
    marginBottom: spacing.sm,
  },
  entryPreview: {
    ...typography.body,
    color: colors.neutral.darkGray,
    marginBottom: spacing.sm,
  },
  entryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  entryTag: {
    backgroundColor: colors.primary.pink + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.xs,
    marginRight: spacing.xs,
  },
  entryTagText: {
    ...typography.caption,
    color: colors.primary.pink,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral.gray,
    marginBottom: spacing.md,
  },
  emptyButton: {
    minWidth: 150,
  },
  inspirationCard: {
    backgroundColor: colors.accent.peach,
  },
  quote: {
    ...typography.bodyLarge,
    color: colors.neutral.black,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  author: {
    ...typography.bodySmall,
    color: colors.neutral.darkGray,
    textAlign: 'right',
  },
});