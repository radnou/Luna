/**
 * Luna Design System - Dark Theme
 * Dark theme configuration with vibrant colors
 */

import { baseColors, gradients, effects } from '../colors';

export const darkTheme = {
  name: 'dark',
  dark: true,
  
  colors: {
    // Primary palette
    primary: baseColors.primary[400],
    primaryLight: baseColors.primary[300],
    primaryDark: baseColors.primary[600],
    onPrimary: baseColors.neutral[900],
    
    // Secondary palette
    secondary: baseColors.secondary[400],
    secondaryLight: baseColors.secondary[300],
    secondaryDark: baseColors.secondary[600],
    onSecondary: baseColors.neutral[900],
    
    // Accent palette
    accent: baseColors.accent[400],
    accentLight: baseColors.accent[300],
    accentDark: baseColors.accent[600],
    onAccent: baseColors.neutral[900],
    
    // Background colors
    background: baseColors.neutral[900],
    backgroundPrimary: baseColors.neutral[800],
    backgroundSecondary: baseColors.neutral[700],
    backgroundTertiary: baseColors.neutral[600],
    
    // Surface colors
    surface: baseColors.neutral[800],
    surfaceLight: baseColors.neutral[700],
    surfaceDark: baseColors.neutral[900],
    onSurface: baseColors.neutral[100],
    
    // Text colors
    text: baseColors.neutral[100],
    textSecondary: baseColors.neutral[300],
    textTertiary: baseColors.neutral[400],
    textDisabled: baseColors.neutral[600],
    textInverse: baseColors.neutral[900],
    
    // Border colors
    border: baseColors.neutral[700],
    borderLight: baseColors.neutral[600],
    borderDark: baseColors.neutral[800],
    borderFocus: baseColors.primary[400],
    
    // Semantic colors
    success: baseColors.success.light,
    successLight: baseColors.success.main,
    successDark: baseColors.success.dark,
    onSuccess: baseColors.neutral[900],
    
    warning: baseColors.warning.light,
    warningLight: baseColors.warning.main,
    warningDark: baseColors.warning.dark,
    onWarning: baseColors.neutral[900],
    
    error: baseColors.error.light,
    errorLight: baseColors.error.main,
    errorDark: baseColors.error.dark,
    onError: baseColors.neutral[900],
    
    info: baseColors.info.light,
    infoLight: baseColors.info.main,
    infoDark: baseColors.info.dark,
    onInfo: baseColors.neutral[900],
    
    // Special colors
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
    overlayDark: 'rgba(0, 0, 0, 0.85)',
    
    // Chat colors
    chatUserBubble: baseColors.primary[500],
    chatAIBubble: baseColors.neutral[700],
    chatSystemBubble: baseColors.support[500],
    
    // Navigation colors
    tabBarBackground: baseColors.neutral[800],
    tabBarActive: baseColors.primary[400],
    tabBarInactive: baseColors.neutral[500],
    
    // Input colors
    inputBackground: baseColors.neutral[700],
    inputBorder: baseColors.neutral[600],
    inputBorderFocus: baseColors.primary[400],
    inputPlaceholder: baseColors.neutral[500],
    
    // Card colors
    cardBackground: baseColors.neutral[800],
    cardBorder: baseColors.neutral[700],
    
    // Modal colors
    modalBackground: baseColors.neutral[800],
    modalBackdrop: 'rgba(0, 0, 0, 0.85)',
    
    // Status bar
    statusBar: 'light-content',
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
    card: {
      ...effects.shadows.md,
      shadowColor: baseColors.primary[400],
      shadowOpacity: 0.2,
    },
    button: {
      ...effects.shadows.sm,
      shadowColor: baseColors.primary[400],
      shadowOpacity: 0.15,
    },
    modal: {
      ...effects.shadows.xl,
      shadowColor: baseColors.primary[400],
      shadowOpacity: 0.3,
    },
    navigation: {
      ...effects.shadows.lg,
      shadowColor: baseColors.primary[400],
      shadowOpacity: 0.25,
    },
  },
  
  effects: {
    glassmorphism: {
      ...effects.glassmorphism,
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    glow: effects.glow.strong,
    glowStrong: {
      primary: `0 0 40px ${baseColors.primary[400]}80`,
      secondary: `0 0 40px ${baseColors.secondary[500]}80`,
      accent: `0 0 40px ${baseColors.accent[500]}80`,
    },
  },
};