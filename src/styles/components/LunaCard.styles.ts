/**
 * Luna Design System - Card Styles
 * Modern card component with rounded corners and shadows
 */

import { StyleSheet } from 'react-native';
import { baseColors, effects } from '../colors';
import { spacing, radius, borderWidths } from '../tokens';

// Card variants
export const cardVariants = {
  elevated: {
    backgroundColor: baseColors.neutral[0],
    borderColor: 'transparent',
    ...effects.shadows.md,
  },
  outlined: {
    backgroundColor: baseColors.neutral[0],
    borderColor: baseColors.neutral[200],
    borderWidth: borderWidths.thin,
  },
  filled: {
    backgroundColor: baseColors.neutral[50],
    borderColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  glass: {
    backgroundColor: effects.glassmorphism.background,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: borderWidths.thin,
  },
};

// Card sizes/padding
export const cardSizes = {
  small: {
    padding: spacing[3],
  },
  medium: {
    padding: spacing[4],
  },
  large: {
    padding: spacing[5],
  },
  xlarge: {
    padding: spacing[6],
  },
};

// Base card styles
export const cardStyles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    position: 'relative',
  },
  
  // Rounded variants
  rounded: {
    borderRadius: radius.card.md,
  },
  roundedSmall: {
    borderRadius: radius.card.sm,
  },
  roundedLarge: {
    borderRadius: radius.card.lg,
  },
  roundedXLarge: {
    borderRadius: radius.card.xl,
  },
  
  // Interaction states
  pressable: {
    activeOpacity: 0.8,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  
  // Special effects
  glowPrimary: {
    shadowColor: baseColors.primary[400],
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  glowSecondary: {
    shadowColor: baseColors.secondary[500],
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  glowAccent: {
    shadowColor: baseColors.accent[500],
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  
  // Header/Footer sections
  header: {
    paddingBottom: spacing[3],
    marginBottom: spacing[3],
    borderBottomWidth: borderWidths.hairline,
    borderBottomColor: baseColors.neutral[200],
  },
  footer: {
    paddingTop: spacing[3],
    marginTop: spacing[3],
    borderTopWidth: borderWidths.hairline,
    borderTopColor: baseColors.neutral[200],
  },
  
  // Content sections
  content: {
    flex: 1,
  },
  
  // Gradient overlay
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  
  // Glass effect
  glassEffect: {
    ...effects.glassmorphism,
  },
  
  // Full width
  fullWidth: {
    width: '100%',
  },
  
  // Compact padding
  compact: {
    padding: spacing[2],
  },
  
  // No padding
  noPadding: {
    padding: 0,
  },
});

// Card section styles
export const cardSectionStyles = StyleSheet.create({
  section: {
    marginBottom: spacing[3],
  },
  sectionLast: {
    marginBottom: 0,
  },
  sectionTitle: {
    marginBottom: spacing[2],
  },
  divider: {
    height: borderWidths.hairline,
    backgroundColor: baseColors.neutral[200],
    marginVertical: spacing[3],
  },
});

// Helper function to create custom card styles
export const createCardStyle = (
  variant: keyof typeof cardVariants,
  size: keyof typeof cardSizes,
  rounded: 'sm' | 'md' | 'lg' | 'xl' = 'md'
) => {
  const variantStyle = cardVariants[variant];
  const sizeStyle = cardSizes[size];
  const roundedStyle = {
    sm: cardStyles.roundedSmall,
    md: cardStyles.rounded,
    lg: cardStyles.roundedLarge,
    xl: cardStyles.roundedXLarge,
  }[rounded];
  
  return {
    ...cardStyles.base,
    ...variantStyle,
    ...sizeStyle,
    ...roundedStyle,
  };
};