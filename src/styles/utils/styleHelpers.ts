/**
 * Luna Design System - Style Helpers
 * Utility functions for styling
 */

import { Platform, Dimensions } from 'react-native';
import { spacing } from '../tokens';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive sizing
export const responsive = {
  width: (percentage: number) => (screenWidth * percentage) / 100,
  height: (percentage: number) => (screenHeight * percentage) / 100,
  
  // Font scaling
  fontSize: (size: number) => {
    const scale = screenWidth / 375; // Base on iPhone X width
    const newSize = size * scale;
    return Math.round(newSize);
  },
  
  // Spacing scaling
  spacing: (value: number) => {
    const scale = screenWidth / 375;
    return Math.round(value * scale);
  },
};

// Platform-specific styles
export const platformStyles = (styles: {
  ios?: any;
  android?: any;
  web?: any;
  default?: any;
}) => {
  return Platform.select({
    ios: styles.ios || styles.default || {},
    android: styles.android || styles.default || {},
    web: styles.web || styles.default || {},
    default: styles.default || {},
  });
};

// Shadow helper
export const createShadow = (
  elevation: number = 4,
  color: string = '#000',
  opacity: number = 0.2
) => {
  if (Platform.OS === 'android') {
    return {
      elevation,
    };
  }
  
  return {
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height: elevation / 2,
    },
    shadowOpacity: opacity,
    shadowRadius: elevation,
  };
};

// Spacing helper
export const createSpacing = (...values: (keyof typeof spacing | number)[]) => {
  const getSpacingValue = (value: keyof typeof spacing | number) => {
    if (typeof value === 'number') {
      return value;
    }
    return spacing[value] || 0;
  };
  
  if (values.length === 1) {
    const value = getSpacingValue(values[0]);
    return {
      padding: value,
    };
  }
  
  if (values.length === 2) {
    const vertical = getSpacingValue(values[0]);
    const horizontal = getSpacingValue(values[1]);
    return {
      paddingVertical: vertical,
      paddingHorizontal: horizontal,
    };
  }
  
  if (values.length === 4) {
    return {
      paddingTop: getSpacingValue(values[0]),
      paddingRight: getSpacingValue(values[1]),
      paddingBottom: getSpacingValue(values[2]),
      paddingLeft: getSpacingValue(values[3]),
    };
  }
  
  return {};
};

// Margin helper
export const createMargin = (...values: (keyof typeof spacing | number)[]) => {
  const getSpacingValue = (value: keyof typeof spacing | number) => {
    if (typeof value === 'number') {
      return value;
    }
    return spacing[value] || 0;
  };
  
  if (values.length === 1) {
    const value = getSpacingValue(values[0]);
    return {
      margin: value,
    };
  }
  
  if (values.length === 2) {
    const vertical = getSpacingValue(values[0]);
    const horizontal = getSpacingValue(values[1]);
    return {
      marginVertical: vertical,
      marginHorizontal: horizontal,
    };
  }
  
  if (values.length === 4) {
    return {
      marginTop: getSpacingValue(values[0]),
      marginRight: getSpacingValue(values[1]),
      marginBottom: getSpacingValue(values[2]),
      marginLeft: getSpacingValue(values[3]),
    };
  }
  
  return {};
};

// Flex helper
export const flex = {
  row: {
    flexDirection: 'row' as const,
  },
  rowReverse: {
    flexDirection: 'row-reverse' as const,
  },
  column: {
    flexDirection: 'column' as const,
  },
  columnReverse: {
    flexDirection: 'column-reverse' as const,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  centerHorizontal: {
    alignItems: 'center' as const,
  },
  centerVertical: {
    justifyContent: 'center' as const,
  },
  spaceBetween: {
    justifyContent: 'space-between' as const,
  },
  spaceAround: {
    justifyContent: 'space-around' as const,
  },
  spaceEvenly: {
    justifyContent: 'space-evenly' as const,
  },
  start: {
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
  },
  end: {
    alignItems: 'flex-end' as const,
    justifyContent: 'flex-end' as const,
  },
  stretch: {
    alignItems: 'stretch' as const,
  },
  fill: {
    flex: 1,
  },
};

// Position helper
export const position = {
  absolute: {
    position: 'absolute' as const,
  },
  relative: {
    position: 'relative' as const,
  },
  absoluteFill: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  absoluteCenter: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
};

// Border helper
export const createBorder = (
  width: number = 1,
  color: string = '#000',
  style: 'solid' | 'dotted' | 'dashed' = 'solid'
) => ({
  borderWidth: width,
  borderColor: color,
  borderStyle: style,
});

// Combine styles helper
export const combineStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => {
    if (Array.isArray(style)) {
      return [...acc, ...style];
    }
    return [...acc, style];
  }, []);
};