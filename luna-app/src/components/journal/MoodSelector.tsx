import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '@styles/index';
import { Mood, MOOD_OPTIONS } from '@types/journal';

interface MoodSelectorProps {
  selectedMood?: Mood;
  onMoodSelect: (mood: Mood) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <View style={styles.moodsContainer}>
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMood?.value === mood.value;
          return (
            <TouchableOpacity
              key={mood.value}
              onPress={() => onMoodSelect(mood)}
              style={styles.moodButton}
              activeOpacity={0.7}
            >
              {isSelected ? (
                <LinearGradient
                  colors={[mood.color, colors.secondary.lightPurple]}
                  style={styles.selectedMoodGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.moodCircle, { backgroundColor: colors.neutral.lightGray }]}>
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </View>
              )}
              <Text style={[styles.moodLabel, isSelected && { color: mood.color }]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.neutral.black,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  moodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
  },
  moodButton: {
    alignItems: 'center',
  },
  moodCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  selectedMoodGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    ...typography.caption,
    color: colors.neutral.darkGray,
    textAlign: 'center',
  },
});