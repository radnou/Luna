import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/styles/colors';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'skip';
  style?: ViewStyle;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function OnboardingButton({ 
  title, 
  onPress, 
  variant = 'primary',
  style,
  disabled = false
}: OnboardingButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value * (disabled ? 0.6 : 1),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    if (!disabled) {
      // Sparkle animation
      scale.value = withSequence(
        withSpring(1.05, { damping: 15, stiffness: 150 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  if (variant === 'skip') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.skipButton, animatedStyle, style]}
        disabled={disabled}
      >
        <Text style={styles.skipText}>{title}</Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      disabled={disabled}
    >
      <LinearGradient
        colors={variant === 'primary' ? colors.gradients.primary : [colors.neutral.white, colors.neutral.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.button,
          variant === 'secondary' && styles.secondaryButton
        ]}
      >
        <Text style={[
          styles.buttonText,
          variant === 'secondary' && styles.secondaryButtonText
        ]}>
          {title}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.primary.pink,
    shadowOpacity: 0.1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryButtonText: {
    color: colors.primary.pink,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 14,
    color: colors.neutral.gray,
    fontFamily: 'Inter_400Regular',
  },
});