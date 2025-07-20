import { Platform, Dimensions } from 'react-native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMobile = isIOS || isAndroid;

// Responsive breakpoints
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
} as const;

export const isSmallScreen = windowWidth < breakpoints.mobile;
export const isMediumScreen = windowWidth >= breakpoints.mobile && windowWidth < breakpoints.tablet;
export const isLargeScreen = windowWidth >= breakpoints.tablet;
export const isDesktop = windowWidth >= breakpoints.desktop;

// Platform-specific values
export function platformSelect<T>(options: {
  web?: T;
  ios?: T;
  android?: T;
  mobile?: T;
  desktop?: T;
  default?: T;
}): T | undefined {
  if (isWeb && options.web !== undefined) return options.web;
  if (isWeb && isDesktop && options.desktop !== undefined) return options.desktop;
  if (isIOS && options.ios !== undefined) return options.ios;
  if (isAndroid && options.android !== undefined) return options.android;
  if (isMobile && options.mobile !== undefined) return options.mobile;
  return options.default;
}

// Responsive sizing
export function responsive(
  mobile: number,
  tablet?: number,
  desktop?: number
): number {
  if (isSmallScreen) return mobile;
  if (isMediumScreen) return tablet ?? mobile;
  return desktop ?? tablet ?? mobile;
}

// Max width container for web
export const maxWidth = {
  small: 640,
  medium: 768,
  large: 1024,
  xlarge: 1280,
  full: '100%',
} as const;

// Platform-specific shadows
export const platformShadow = (elevation: number = 4) => {
  if (isWeb) {
    const shadowHeight = elevation * 0.5;
    const shadowRadius = elevation * 0.8;
    return {
      boxShadow: `0 ${shadowHeight}px ${shadowRadius}px rgba(0, 0, 0, 0.1)`,
    };
  }
  
  if (isAndroid) {
    return {
      elevation,
    };
  }
  
  // iOS
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: elevation * 0.5,
    },
    shadowOpacity: 0.1,
    shadowRadius: elevation * 0.8,
  };
};