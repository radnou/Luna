import React from 'react';
import { View, ViewProps } from 'react-native';
import { isSmallScreen, isMediumScreen, isLargeScreen } from '@/utils/platform';

interface ResponsiveViewProps extends ViewProps {
  mobile?: ViewProps['style'];
  tablet?: ViewProps['style'];
  desktop?: ViewProps['style'];
  children: React.ReactNode;
}

export const ResponsiveView: React.FC<ResponsiveViewProps> = ({
  style,
  mobile,
  tablet,
  desktop,
  children,
  ...props
}) => {
  const responsiveStyle = [
    style,
    isSmallScreen && mobile,
    isMediumScreen && (tablet || mobile),
    isLargeScreen && (desktop || tablet || mobile),
  ];

  return (
    <View style={responsiveStyle} {...props}>
      {children}
    </View>
  );
};