import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@components/Card';
import { Button } from '@components/Button';
import { colors, typography, spacing } from '@styles/index';

export default function Home() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Beautiful!</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</Text>
        </View>

        <Card variant="filled" style={styles.quickAction}>
          <Text style={styles.cardTitle}>How are you feeling today?</Text>
          <Text style={styles.cardDescription}>
            Take a moment to reflect on your emotions
          </Text>
          <Button
            title="Write in Journal"
            size="medium"
            gradient
            style={styles.cardButton}
            onPress={() => {
              // Navigate to journal entry
            }}
          />
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          <Card style={styles.entryCard}>
            <Text style={styles.entryTitle}>A day to remember</Text>
            <Text style={styles.entryDate}>Yesterday at 10:30 PM</Text>
            <Text style={styles.entryPreview} numberOfLines={2}>
              Today was amazing! I finally had that conversation I've been putting off...
            </Text>
          </Card>
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
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.body,
    color: colors.neutral.darkGray,
    marginBottom: spacing.md,
  },
  cardButton: {
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.neutral.black,
    marginBottom: spacing.md,
  },
  entryCard: {
    marginBottom: spacing.md,
  },
  entryTitle: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.xs,
  },
  entryDate: {
    ...typography.caption,
    color: colors.neutral.gray,
    marginBottom: spacing.sm,
  },
  entryPreview: {
    ...typography.body,
    color: colors.neutral.darkGray,
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