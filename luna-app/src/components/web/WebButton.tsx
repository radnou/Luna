import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { spacing } from '@/styles/spacing';
import { isWeb } from '@/utils/platform';

interface WebButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  gradient?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const WebButton: React.FC<WebButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  gradient = true,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    small: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      minHeight: 36,
    },
    medium: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      minHeight: 44,
    },
    large: {
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
      minHeight: 52,
    },
  };

  const textSizes = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
          gradient: colors.gradients.secondary,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
          gradient: null,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
          gradient: null,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          gradient: colors.gradients.primary,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const shouldShowGradient = gradient && variantStyles.gradient && !isDisabled;

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? colors.neutral.white : colors.primary.pink}
        />
      ) : (
        <Text style={[
          styles.text,
          textSizes[size],
          variantStyles.text,
          isDisabled && styles.textDisabled,
          textStyle,
        ]}>
          {title}
        </Text>
      )}
    </>
  );

  const containerStyle = [
    styles.container,
    sizeStyles[size],
    variantStyles.container,
    fullWidth && styles.fullWidth,
    isDisabled && styles.containerDisabled,
    isWeb && styles.webContainer,
    style,
  ];

  if (shouldShowGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={fullWidth && styles.fullWidth}
      >
        <LinearGradient
          colors={variantStyles.gradient}
          style={containerStyle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={containerStyle}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  webContainer: {
    ...isWeb && {
      cursor: 'pointer' as any,
      transition: 'all 0.2s ease' as any,
      ':hover': {
        transform: 'translateY(-1px)' as any,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' as any,
      } as any,
    },
  },
  fullWidth: {
    width: '100%',
  },
  containerDisabled: {
    opacity: 0.6,
  },
  primaryContainer: {
    backgroundColor: colors.primary.pink,
  },
  secondaryContainer: {
    backgroundColor: colors.secondary.coral,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.pink,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  text: {
    ...typography.button.medium,
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  primaryText: {
    color: colors.neutral.white,
  },
  secondaryText: {
    color: colors.neutral.white,
  },
  outlineText: {
    color: colors.primary.pink,
  },
  ghostText: {
    color: colors.primary.pink,
  },
  textDisabled: {
    opacity: 0.7,
  },
});