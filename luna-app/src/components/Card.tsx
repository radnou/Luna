import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@styles/index';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  style,
  ...props
}) => {
  return (
    <View
      style={[
        styles.card,
        variantStyles[variant],
        paddingStyles[padding],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.white,
  },
});

const variantStyles = StyleSheet.create({
  elevated: {
    ...shadows.md,
  },
  filled: {
    backgroundColor: colors.neutral.offWhite,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
});

const paddingStyles = StyleSheet.create({
  none: {
    padding: 0,
  },
  small: {
    padding: spacing.sm,
  },
  medium: {
    padding: spacing.md,
  },
  large: {
    padding: spacing.lg,
  },
});