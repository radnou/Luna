import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { responsive, isWeb } from '@/utils/platform';

interface ResponsiveTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  responsive?: boolean;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  variant = 'body',
  weight = 'normal',
  color,
  align = 'left',
  responsive: isResponsive = true,
  style,
  children,
  ...props
}) => {
  const getVariantStyle = () => {
    if (!isResponsive) {
      return variantStyles[variant];
    }

    switch (variant) {
      case 'h1':
        return {
          fontSize: responsive(32, 40, 48),
          lineHeight: responsive(40, 48, 56),
        };
      case 'h2':
        return {
          fontSize: responsive(24, 28, 32),
          lineHeight: responsive(32, 36, 40),
        };
      case 'h3':
        return {
          fontSize: responsive(20, 22, 24),
          lineHeight: responsive(28, 30, 32),
        };
      case 'h4':
        return {
          fontSize: responsive(16, 18, 20),
          lineHeight: responsive(24, 26, 28),
        };
      case 'body':
        return {
          fontSize: responsive(14, 16, 16),
          lineHeight: responsive(20, 24, 24),
        };
      case 'caption':
        return {
          fontSize: responsive(12, 12, 14),
          lineHeight: responsive(16, 16, 20),
        };
    }
  };

  const fontWeights = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };

  return (
    <Text
      style={[
        styles.base,
        getVariantStyle(),
        { 
          fontWeight: fontWeights[weight] as any,
          color,
          textAlign: align,
        },
        isWeb && styles.webText,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const variantStyles = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
};

const styles = StyleSheet.create({
  base: {
    fontFamily: isWeb ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
  webText: {
    ...isWeb && {
      WebkitFontSmoothing: 'antialiased' as any,
      MozOsxFontSmoothing: 'grayscale' as any,
    },
  },
});