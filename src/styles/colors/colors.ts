/**
 * Luna Design System - Colors
 * Based on 2025 design trends with vibrant, girly aesthetic
 */

export const baseColors = {
  // Primary Colors
  primary: {
    50: '#FAF0FE',
    100: '#F5E1FD',
    200: '#F0D2FC',
    300: '#EBC3FB',
    400: '#E8B4F3', // Main Primary
    500: '#E19CEF',
    600: '#D585E8',
    700: '#C26DD9',
    800: '#A855C3',
    900: '#8E3DAD',
  },
  
  // Secondary Colors - Rose Coral
  secondary: {
    50: '#FFF0F3',
    100: '#FFE1E7',
    200: '#FFC3D0',
    300: '#FFA5B8',
    400: '#FF87A1',
    500: '#FF6B9D', // Main Secondary
    600: '#E65590',
    700: '#CC4080',
    800: '#B32A70',
    900: '#991560',
  },
  
  // Accent Colors - Lunar Gold
  accent: {
    50: '#FFFBF0',
    100: '#FFF7E1',
    200: '#FFEFC3',
    300: '#FFE7A5',
    400: '#FFDF87',
    500: '#FFC75F', // Main Accent
    600: '#E6B356',
    700: '#CC9F4C',
    800: '#B38B43',
    900: '#997739',
  },
  
  // Support Colors - Soft Periwinkle
  support: {
    50: '#F7F8FC',
    100: '#EFF1F9',
    200: '#DFE3F3',
    300: '#CFD5ED',
    400: '#C7CEEA', // Main Support
    500: '#B7BEE0',
    600: '#A7AED6',
    700: '#979ECC',
    800: '#878EC2',
    900: '#777EB8',
  },
  
  // Neutral Colors
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#636E72',
    700: '#404040',
    800: '#2D3436',
    900: '#171717',
    1000: '#000000',
  },
  
  // Semantic Colors
  success: {
    light: '#A7F3D0',
    main: '#10B981',
    dark: '#059669',
  },
  
  warning: {
    light: '#FED7AA',
    main: '#F59E0B',
    dark: '#D97706',
  },
  
  error: {
    light: '#FEC7CD',
    main: '#EF4444',
    dark: '#DC2626',
  },
  
  info: {
    light: '#BFDBFE',
    main: '#3B82F6',
    dark: '#2563EB',
  },
};

// Gradient Definitions
export const gradients = {
  primary: {
    light: `linear-gradient(135deg, ${baseColors.primary[300]} 0%, ${baseColors.secondary[300]} 100%)`,
    main: `linear-gradient(135deg, ${baseColors.primary[400]} 0%, ${baseColors.secondary[500]} 100%)`,
    dark: `linear-gradient(135deg, ${baseColors.primary[600]} 0%, ${baseColors.secondary[700]} 100%)`,
  },
  
  aurora: {
    light: `linear-gradient(135deg, ${baseColors.support[300]} 0%, ${baseColors.accent[300]} 50%, ${baseColors.primary[300]} 100%)`,
    main: `linear-gradient(135deg, ${baseColors.support[400]} 0%, ${baseColors.accent[500]} 50%, ${baseColors.primary[400]} 100%)`,
    dark: `linear-gradient(135deg, ${baseColors.support[600]} 0%, ${baseColors.accent[700]} 50%, ${baseColors.primary[600]} 100%)`,
  },
  
  sunset: {
    light: `linear-gradient(135deg, ${baseColors.accent[300]} 0%, ${baseColors.secondary[300]} 100%)`,
    main: `linear-gradient(135deg, ${baseColors.accent[500]} 0%, ${baseColors.secondary[500]} 100%)`,
    dark: `linear-gradient(135deg, ${baseColors.accent[700]} 0%, ${baseColors.secondary[700]} 100%)`,
  },
  
  moonlight: {
    light: `linear-gradient(180deg, ${baseColors.support[200]} 0%, ${baseColors.primary[200]} 100%)`,
    main: `linear-gradient(180deg, ${baseColors.support[400]} 0%, ${baseColors.primary[400]} 100%)`,
    dark: `linear-gradient(180deg, ${baseColors.support[600]} 0%, ${baseColors.primary[600]} 100%)`,
  },
};

// Special Effects
export const effects = {
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  
  glow: {
    soft: {
      primary: `0 0 20px ${baseColors.primary[400]}40`,
      secondary: `0 0 20px ${baseColors.secondary[500]}40`,
      accent: `0 0 20px ${baseColors.accent[500]}40`,
    },
    strong: {
      primary: `0 0 30px ${baseColors.primary[400]}60`,
      secondary: `0 0 30px ${baseColors.secondary[500]}60`,
      accent: `0 0 30px ${baseColors.accent[500]}60`,
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    coloredSm: `0 2px 4px -1px ${baseColors.primary[400]}30`,
    coloredMd: `0 4px 6px -1px ${baseColors.primary[400]}40`,
    coloredLg: `0 10px 15px -3px ${baseColors.primary[400]}50`,
  },
};

// Opacity values for consistent transparency
export const opacity = {
  disabled: 0.38,
  hover: 0.08,
  focus: 0.12,
  selected: 0.16,
  activated: 0.24,
  pressed: 0.32,
  dragged: 0.16,
};