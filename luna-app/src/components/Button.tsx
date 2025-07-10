import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius, shadows } from '@styles/index';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  gradient?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  fullWidth = false,
  gradient = false,
  disabled,
  onPress,
  style,
  ...props
}) => {
  const handlePress = (event: any) => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(event);
    }
  };

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary.pink : colors.neutral.white}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.text, textStyles[variant], textSizes[size]]}>
            {title}
          </Text>
        </>
      )}
    </>
  );

  const buttonStyle: ViewStyle[] = [
    styles.button,
    buttonStyles[variant],
    sizeStyles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style as ViewStyle,
  ];

  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled || loading}
        onPress={handlePress}
        style={[buttonStyle, { backgroundColor: 'transparent' }]}
        {...props}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={handlePress}
      style={buttonStyle}
      {...props}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary.pink,
  },
  secondary: {
    backgroundColor: colors.secondary.purple,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.pink,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
});

const textStyles = StyleSheet.create({
  primary: {
    color: colors.neutral.white,
  },
  secondary: {
    color: colors.neutral.white,
  },
  outline: {
    color: colors.primary.pink,
  },
  ghost: {
    color: colors.primary.pink,
  },
});

const sizeStyles = StyleSheet.create({
  small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 56,
  },
});

const textSizes: Record<string, TextStyle> = {
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
  },
};