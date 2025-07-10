import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { colors } from '@/src/styles/colors';
import { OnboardingButton } from '@/src/components/onboarding/OnboardingButton';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Goal {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string[];
}

const goals: Goal[] = [
  {
    id: 'healing',
    title: 'Guérison émotionnelle',
    subtitle: 'Panser mes blessures et avancer',
    icon: 'bandage',
    gradient: [colors.accent.coral, colors.primary.lightPink],
  },
  {
    id: 'understanding',
    title: 'Compréhension de soi',
    subtitle: 'Découvrir mes patterns relationnels',
    icon: 'bulb',
    gradient: [colors.secondary.purple, colors.secondary.lavender],
  },
  {
    id: 'growth',
    title: 'Croissance personnelle',
    subtitle: 'Devenir ma meilleure version',
    icon: 'flower',
    gradient: [colors.accent.mint, colors.accent.yellow],
  },
  {
    id: 'connection',
    title: 'Relations saines',
    subtitle: 'Créer des liens authentiques',
    icon: 'people',
    gradient: [colors.primary.pink, colors.accent.coral],
  },
];

export default function GoalsScreen() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600 });
    titleTranslateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const toggleGoal = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    // Save selected goals to user preferences
    router.push('/(onboarding)/personality');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title}>Qu'est-ce qui t'amène ici? 💭</Text>
          <Text style={styles.subtitle}>
            Choisis un ou plusieurs objectifs pour personnaliser ton expérience
          </Text>
        </Animated.View>

        <View style={styles.goalsContainer}>
          {goals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isSelected={selectedGoals.includes(goal.id)}
              onPress={() => toggleGoal(goal.id)}
              delay={index * 100 + 200}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <OnboardingButton
            title={selectedGoals.length > 0 ? "Continuer ✨" : "Choisir au moins un objectif"}
            onPress={handleContinue}
            disabled={selectedGoals.length === 0}
          />
          <OnboardingButton
            title="Passer cette étape"
            onPress={() => router.push('/(onboarding)/personality')}
            variant="skip"
          />
        </View>
      </View>
    </ScrollView>
  );
}

interface GoalCardProps {
  goal: Goal;
  isSelected: boolean;
  onPress: () => void;
  delay: number;
}

function GoalCard({ goal, isSelected, onPress, delay }: GoalCardProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const borderScale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, {
      damping: 15,
      stiffness: 100,
    }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);

  useEffect(() => {
    borderScale.value = withSpring(isSelected ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isSelected]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: borderScale.value }],
    opacity: borderScale.value,
  }));

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        scale: interpolate(
          borderScale.value,
          [0, 1],
          [0, 1],
          Extrapolate.CLAMP
        ) 
      },
      {
        rotate: `${interpolate(
          borderScale.value,
          [0, 1],
          [180, 360],
          Extrapolate.CLAMP
        )}deg`
      }
    ],
  }));

  return (
    <Animated.View style={[styles.goalCardWrapper, cardAnimatedStyle]}>
      <Pressable onPress={onPress} style={styles.goalCardPressable}>
        <LinearGradient
          colors={goal.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.goalCard}
        >
          <View style={styles.goalIconContainer}>
            <Ionicons name={goal.icon as any} size={32} color={colors.neutral.white} />
          </View>
          <View style={styles.goalTextContainer}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
          </View>
          
          {/* Selection indicator */}
          <Animated.View style={[styles.selectionBorder, borderAnimatedStyle]}>
            <LinearGradient
              colors={[colors.neutral.white, colors.neutral.offWhite]}
              style={styles.selectionBorderGradient}
            />
          </Animated.View>
          
          {/* Checkmark */}
          <Animated.View style={[styles.checkmark, checkmarkAnimatedStyle]}>
            <Ionicons name="checkmark-circle" size={28} color={colors.neutral.white} />
          </Animated.View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral.black,
    fontFamily: 'Comfortaa_700Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral.darkGray,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
    marginBottom: 32,
  },
  goalsContainer: {
    marginBottom: 40,
  },
  goalCardWrapper: {
    marginBottom: 16,
  },
  goalCardPressable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  goalCard: {
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.white,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter_400Regular',
  },
  selectionBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 23,
    zIndex: -1,
  },
  selectionBorderGradient: {
    flex: 1,
    borderRadius: 23,
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 12,
  },
});