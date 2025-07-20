/**
 * Luna Design System - Light Theme
 * Default light theme configuration
 */

import { baseColors, gradients, effects } from '../colors';

export const lightTheme = {
  name: 'light',
  dark: false,
  
  colors: {
    // Primary palette
    primary: baseColors.primary[400],
    primaryLight: baseColors.primary[300],
    primaryDark: baseColors.primary[600],
    onPrimary: baseColors.neutral[0],
    
    // Secondary palette
    secondary: baseColors.secondary[500],
    secondaryLight: baseColors.secondary[400],
    secondaryDark: baseColors.secondary[700],
    onSecondary: baseColors.neutral[0],
    
    // Accent palette
    accent: baseColors.accent[500],
    accentLight: baseColors.accent[400],
    accentDark: baseColors.accent[700],
    onAccent: baseColors.neutral[900],
    
    // Background colors
    background: baseColors.neutral[50],
    backgroundPrimary: baseColors.neutral[0],
    backgroundSecondary: baseColors.neutral[100],
    backgroundTertiary: baseColors.neutral[200],
    
    // Surface colors
    surface: baseColors.neutral[0],
    surfaceLight: baseColors.neutral[50],
    surfaceDark: baseColors.neutral[100],
    onSurface: baseColors.neutral[900],
    
    // Text colors
    text: baseColors.neutral[900],
    textSecondary: baseColors.neutral[600],
    textTertiary: baseColors.neutral[500],
    textDisabled: baseColors.neutral[400],
    textInverse: baseColors.neutral[0],
    
    // Border colors
    border: baseColors.neutral[200],
    borderLight: baseColors.neutral[100],
    borderDark: baseColors.neutral[300],
    borderFocus: baseColors.primary[400],
    
    // Semantic colors
    success: baseColors.success.main,
    successLight: baseColors.success.light,
    successDark: baseColors.success.dark,
    onSuccess: baseColors.neutral[0],
    
    warning: baseColors.warning.main,
    warningLight: baseColors.warning.light,
    warningDark: baseColors.warning.dark,
    onWarning: baseColors.neutral[900],
    
    error: baseColors.error.main,
    errorLight: baseColors.error.light,
    errorDark: baseColors.error.dark,
    onError: baseColors.neutral[0],
    
    info: baseColors.info.main,
    infoLight: baseColors.info.light,
    infoDark: baseColors.info.dark,
    onInfo: baseColors.neutral[0],
    
    // Special colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',
    
    // Chat colors
    chatUserBubble: baseColors.primary[400],
    chatAIBubble: baseColors.neutral[100],
    chatSystemBubble: baseColors.support[400],
    
    // Navigation colors
    tabBarBackground: baseColors.neutral[0],
    tabBarActive: baseColors.primary[400],
    tabBarInactive: baseColors.neutral[500],
    
    // Input colors
    inputBackground: baseColors.neutral[0],
    inputBorder: baseColors.neutral[300],
    inputBorderFocus: baseColors.primary[400],
    inputPlaceholder: baseColors.neutral[500],
    
    // Card colors
    cardBackground: baseColors.neutral[0],
    cardBorder: baseColors.neutral[200],
    
    // Modal colors
    modalBackground: baseColors.neutral[0],
    modalBackdrop: 'rgba(0, 0, 0, 0.5)',
    
    // Status bar
    statusBar: 'dark-content',
  },
  
  gradients: {
    primary: gradients.primary.main,
    primaryLight: gradients.primary.light,
    primaryDark: gradients.primary.dark,
    
    aurora: gradients.aurora.main,
    auroraLight: gradients.aurora.light,
    auroraDark: gradients.aurora.dark,
    
    sunset: gradients.sunset.main,
    sunsetLight: gradients.sunset.light,
    sunsetDark: gradients.sunset.dark,
    
    moonlight: gradients.moonlight.main,
    moonlightLight: gradients.moonlight.light,
    moonlightDark: gradients.moonlight.dark,
  },
  
  shadows: {
    ...effects.shadows,
    card: effects.shadows.md,
    button: effects.shadows.sm,
    modal: effects.shadows.xl,
    navigation: effects.shadows.lg,
  },
  
  effects: {
    glassmorphism: effects.glassmorphism,
    glow: effects.glow.soft,
    glowStrong: effects.glow.strong,
  },
};