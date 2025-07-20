/**
 * Luna Design System - Design Tokens
 * Spacing, sizing, and other design primitives
 */

// Spacing Scale (based on 4px grid)
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

// Sizing Scale
export const sizing = {
  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
  },
  
  // Button heights
  button: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },
  
  // Input heights
  input: {
    sm: 36,
    md: 44,
    lg: 52,
    xl: 60,
  },
  
  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 96,
    '3xl': 128,
  },
  
  // Container max widths
  container: {
    xs: 320,
    sm: 384,
    md: 448,
    lg: 512,
    xl: 576,
    '2xl': 672,
    '3xl': 768,
    '4xl': 896,
    '5xl': 1024,
    '6xl': 1152,
    '7xl': 1280,
  },
};

// Border Radius
export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
  
  // Component-specific radii
  button: {
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
  },
  
  card: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  
  input: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  
  modal: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
};

// Border Widths
export const borderWidths = {
  0: 0,
  hairline: 0.5,
  thin: 1,
  medium: 2,
  thick: 4,
  heavy: 8,
};

// Z-Index Scale
export const zIndex = {
  auto: 'auto',
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  
  // Semantic z-indices
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
};

// Breakpoints
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  '2xl': 1400,
};

// Durations (in milliseconds)
export const duration = {
  instant: 0,
  faster: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000,
};

// Easing Functions
export const easing = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom bezier curves
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  
  easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  
  easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',
  
  // Spring-like
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Grid Configuration
export const grid = {
  columns: 12,
  gutter: spacing[4],
  margin: spacing[4],
  
  // Responsive gutters
  gutters: {
    xs: spacing[3],
    sm: spacing[4],
    md: spacing[5],
    lg: spacing[6],
    xl: spacing[8],
  },
  
  // Responsive margins
  margins: {
    xs: spacing[4],
    sm: spacing[5],
    md: spacing[6],
    lg: spacing[8],
    xl: spacing[10],
  },
};

// Aspect Ratios
export const aspectRatios = {
  square: 1,
  video: 16 / 9,
  photo: 4 / 3,
  portrait: 3 / 4,
  ultrawide: 21 / 9,
  golden: 1.618,
};