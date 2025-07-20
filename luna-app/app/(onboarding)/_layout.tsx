import React from 'react';
import { Slot, useSegments } from 'expo-router';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/styles/colors';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '@/src/contexts/OnboardingContext';

const { width } = Dimensions.get('window');

const STEPS = [
  'welcome',
  'goals', 
  'personality',
  'preferences',
  'profile',
  'complete'
];

export default function OnboardingLayout() {
  const segments = useSegments();
  const { getCurrentStep } = useOnboarding();
  const currentStep = segments[1] as string || 'welcome';
  const currentIndex = STEPS.indexOf(currentStep);
  const savedStep = getCurrentStep();
  
  // Use the higher of current navigation step or saved step
  const effectiveStep = Math.max(currentIndex, savedStep);
  const progress = (effectiveStep + 1) / STEPS.length;

  return (
    <LinearGradient
      colors={[colors.neutral.offWhite, colors.secondary.lightPurple]}
      style={styles.container}
    >
      <View style={styles.progressContainer}>
        <ProgressIndicator progress={progress} currentStep={effectiveStep} />
      </View>
      <Slot />
    </LinearGradient>
  );
}

function ProgressIndicator({ progress, currentStep }: { progress: number; currentStep: number }) {
  return (
    <View style={styles.progressWrapper}>
      <View style={styles.starsContainer}>
        {STEPS.map((_, index) => (
          <Star key={index} isActive={index <= currentStep} index={index} />
        ))}
      </View>
      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${progress * 100}%` }]}
        />
      </View>
    </View>
  );
}

function Star({ isActive, index }: { isActive: boolean; index: number }) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(isActive ? 1.2 : 0.8, {
      damping: 15,
      stiffness: 150,
    });
    const opacity = withTiming(isActive ? 1 : 0.3, { duration: 300 });
    const rotation = withSpring(isActive ? 360 : 0, {
      damping: 20,
      stiffness: 80,
    });

    return {
      transform: [
        { scale },
        { rotate: `${rotation}deg` }
      ],
      opacity,
    };
  });

  React.useEffect(() => {
    if (isActive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [isActive]);

  return (
    <Animated.View style={[styles.starWrapper, animatedStyle]}>
      <Ionicons 
        name={isActive ? "star" : "star-outline"} 
        size={24} 
        color={isActive ? colors.accent.yellow : colors.neutral.gray}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressWrapper: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 80,
    marginBottom: 15,
  },
  starWrapper: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    width: width - 40,
    height: 6,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});