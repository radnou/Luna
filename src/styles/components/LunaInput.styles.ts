/**
 * Luna Design System - Input Styles
 * Modern input component with focus states and animations
 */

import { StyleSheet } from 'react-native';
import { baseColors, effects } from '../colors';
import { typography } from '../typography';
import { spacing, sizing, radius, borderWidths } from '../tokens';

// Input variants
export const inputVariants = {
  outlined: {
    backgroundColor: 'transparent',
    borderColor: baseColors.neutral[300],
    borderWidth: borderWidths.thin,
  },
  filled: {
    backgroundColor: baseColors.neutral[50],
    borderColor: 'transparent',
    borderWidth: borderWidths.thin,
  },
  underlined: {
    backgroundColor: 'transparent',
    borderColor: baseColors.neutral[300],
    borderBottomWidth: borderWidths.thin,
    borderWidth: 0,
  },
  soft: {
    backgroundColor: `${baseColors.primary[400]}10`,
    borderColor: 'transparent',
    borderWidth: borderWidths.thin,
  },
};

// Input sizes
export const inputSizes = {
  small: {
    height: sizing.input.sm,
    paddingHorizontal: spacing[3],
    ...typography.bodySmall,
  },
  medium: {
    height: sizing.input.md,
    paddingHorizontal: spacing[4],
    ...typography.bodyMedium,
  },
  large: {
    height: sizing.input.lg,
    paddingHorizontal: spacing[5],
    ...typography.bodyLarge,
  },
  xlarge: {
    height: sizing.input.xl,
    paddingHorizontal: spacing[6],
    ...typography.bodyLarge,
  },
};

// Base input styles
export const inputStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  
  // Rounded variants
  rounded: {
    borderRadius: radius.input.md,
  },
  roundedSmall: {
    borderRadius: radius.input.sm,
  },
  roundedLarge: {
    borderRadius: radius.input.lg,
  },
  roundedFull: {
    borderRadius: radius.full,
  },
  
  // Text input
  textInput: {
    flex: 1,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  
  // State styles
  focused: {
    borderColor: baseColors.primary[400],
    borderWidth: borderWidths.medium,
  },
  focusedShadow: {
    shadowColor: baseColors.primary[400],
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  error: {
    borderColor: baseColors.error.main,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: baseColors.neutral[100],
  },
  
  // Icons
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
  
  // Label styles
  labelContainer: {
    position: 'absolute',
    backgroundColor: baseColors.neutral[0],
    paddingHorizontal: spacing[1],
  },
  label: {
    ...typography.labelMedium,
    color: baseColors.neutral[600],
  },
  labelFocused: {
    color: baseColors.primary[400],
  },
  labelError: {
    color: baseColors.error.main,
  },
  
  // Helper text
  helperContainer: {
    marginTop: spacing[1],
    paddingHorizontal: spacing[3],
  },
  helperText: {
    ...typography.caption,
    color: baseColors.neutral[600],
  },
  helperTextError: {
    color: baseColors.error.main,
  },
  
  // Multiline
  multiline: {
    minHeight: sizing.input.lg * 2,
    paddingVertical: spacing[3],
    textAlignVertical: 'top',
  },
  
  // Full width
  fullWidth: {
    width: '100%',
  },
  
  // Character counter
  characterCounter: {
    position: 'absolute',
    bottom: spacing[1],
    right: spacing[3],
    ...typography.caption,
    color: baseColors.neutral[500],
  },
  characterCounterError: {
    color: baseColors.error.main,
  },
  
  // Clear button
  clearButton: {
    padding: spacing[1],
  },
  
  // Password toggle
  passwordToggle: {
    padding: spacing[1],
  },
});

// Input container styles
export const inputContainerStyles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  innerContainer: {
    position: 'relative',
  },
  
  // Floating label
  floatingLabel: {
    position: 'absolute',
    left: spacing[4],
    backgroundColor: baseColors.neutral[0],
    paddingHorizontal: spacing[1],
    pointerEvents: 'none',
  },
  floatingLabelActive: {
    top: -spacing[2],
    fontSize: typography.caption.fontSize,
  },
  floatingLabelInactive: {
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  
  // Prefix/Suffix
  prefix: {
    marginRight: spacing[2],
    ...typography.bodyMedium,
    color: baseColors.neutral[600],
  },
  suffix: {
    marginLeft: spacing[2],
    ...typography.bodyMedium,
    color: baseColors.neutral[600],
  },
});

// Search input specific styles
export const searchInputStyles = StyleSheet.create({
  container: {
    ...inputStyles.base,
    ...inputVariants.filled,
    ...inputSizes.medium,
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  clearButton: {
    marginLeft: spacing[2],
  },
});

// Helper function to create custom input styles
export const createInputStyle = (
  variant: keyof typeof inputVariants,
  size: keyof typeof inputSizes,
  state?: 'default' | 'focused' | 'error' | 'disabled'
) => {
  const variantStyle = inputVariants[variant];
  const sizeStyle = inputSizes[size];
  
  let stateStyle = {};
  if (state === 'focused') {
    stateStyle = { ...inputStyles.focused, ...inputStyles.focusedShadow };
  } else if (state === 'error') {
    stateStyle = inputStyles.error;
  } else if (state === 'disabled') {
    stateStyle = inputStyles.disabled;
  }
  
  return {
    ...inputStyles.base,
    ...variantStyle,
    ...sizeStyle,
    ...stateStyle,
  };
};