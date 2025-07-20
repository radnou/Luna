/**
 * Luna Design System - Button Styles
 * Modern button component with gradients and animations
 */

import { StyleSheet } from 'react-native';
import { baseColors, gradients, effects } from '../colors';
import { typography } from '../typography';
import { spacing, sizing, radius, duration } from '../tokens';

// Button variants
export const buttonVariants = {
  primary: {
    background: gradients.primary.main,
    color: baseColors.neutral[0],
    borderColor: 'transparent',
  },
  secondary: {
    background: baseColors.secondary[500],
    color: baseColors.neutral[0],
    borderColor: 'transparent',
  },
  accent: {
    background: baseColors.accent[500],
    color: baseColors.neutral[900],
    borderColor: 'transparent',
  },
  ghost: {
    background: 'transparent',
    color: baseColors.primary[400],
    borderColor: baseColors.primary[400],
  },
  outline: {
    background: 'transparent',
    color: baseColors.primary[400],
    borderColor: baseColors.primary[400],
  },
  soft: {
    background: `${baseColors.primary[400]}20`,
    color: baseColors.primary[600],
    borderColor: 'transparent',
  },
};

// Button sizes
export const buttonSizes = {
  small: {
    height: sizing.button.sm,
    paddingHorizontal: spacing[3],
    ...typography.buttonSmall,
  },
  medium: {
    height: sizing.button.md,
    paddingHorizontal: spacing[4],
    ...typography.buttonMedium,
  },
  large: {
    height: sizing.button.lg,
    paddingHorizontal: spacing[5],
    ...typography.buttonLarge,
  },
  xlarge: {
    height: sizing.button.xl,
    paddingHorizontal: spacing[6],
    ...typography.buttonLarge,
  },
};

// Base button styles
export const buttonStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  
  // Rounded styles
  rounded: {
    borderRadius: radius.button.md,
  },
  roundedSmall: {
    borderRadius: radius.button.sm,
  },
  roundedLarge: {
    borderRadius: radius.button.lg,
  },
  roundedFull: {
    borderRadius: radius.full,
  },
  
  // Icon styles
  iconOnly: {
    paddingHorizontal: 0,
    aspectRatio: 1,
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
  
  // State styles
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  
  // Full width
  fullWidth: {
    width: '100%',
  },
  
  // Shadow styles
  elevated: {
    ...effects.shadows.md,
    shadowColor: baseColors.primary[400],
    shadowOpacity: 0.3,
  },
  
  // Gradient overlay for press state
  pressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Loading state
  loading: {
    opacity: 0.7,
  },
  loadingSpinner: {
    marginRight: spacing[2],
  },
});

// Animation configurations
export const buttonAnimations = {
  press: {
    duration: duration.fast,
    useNativeDriver: true,
    toValue: 0.98,
  },
  release: {
    duration: duration.fast,
    useNativeDriver: true,
    toValue: 1,
  },
  hover: {
    duration: duration.normal,
    useNativeDriver: false,
  },
  ripple: {
    duration: duration.slow,
    useNativeDriver: true,
  },
};

// Helper function to create custom button styles
export const createButtonStyle = (variant: keyof typeof buttonVariants, size: keyof typeof buttonSizes) => {
  const variantStyle = buttonVariants[variant];
  const sizeStyle = buttonSizes[size];
  
  return {
    ...buttonStyles.base,
    ...sizeStyle,
    backgroundColor: variantStyle.background,
    borderColor: variantStyle.borderColor,
  };
};

// Text styles for buttons
export const buttonTextStyles = StyleSheet.create({
  text: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  primary: {
    color: baseColors.neutral[0],
  },
  secondary: {
    color: baseColors.neutral[0],
  },
  accent: {
    color: baseColors.neutral[900],
  },
  ghost: {
    color: baseColors.primary[400],
  },
  outline: {
    color: baseColors.primary[400],
  },
  soft: {
    color: baseColors.primary[600],
  },
});