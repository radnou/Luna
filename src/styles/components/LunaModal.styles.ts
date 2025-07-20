/**
 * Luna Design System - Modal Styles
 * Modern modal component with backdrop blur and animations
 */

import { StyleSheet, Dimensions } from 'react-native';
import { baseColors, effects } from '../colors';
import { typography } from '../typography';
import { spacing, radius, zIndex } from '../tokens';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Modal sizes
export const modalSizes = {
  small: {
    width: screenWidth * 0.8,
    maxWidth: 320,
  },
  medium: {
    width: screenWidth * 0.85,
    maxWidth: 480,
  },
  large: {
    width: screenWidth * 0.9,
    maxWidth: 640,
  },
  fullWidth: {
    width: screenWidth - spacing[8],
    maxWidth: screenWidth - spacing[8],
  },
  fullScreen: {
    width: screenWidth,
    height: screenHeight,
    maxWidth: screenWidth,
  },
};

// Modal positions
export const modalPositions = {
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  top: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing[20],
  },
  bottom: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomSheet: {
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
};

// Base modal styles
export const modalStyles = StyleSheet.create({
  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: zIndex.modalBackdrop,
  },
  backdropBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Container
  container: {
    flex: 1,
    zIndex: zIndex.modal,
  },
  
  // Modal content
  modal: {
    backgroundColor: baseColors.neutral[0],
    borderRadius: radius.modal.md,
    overflow: 'hidden',
    ...effects.shadows.xl,
  },
  
  // Modal sections
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: baseColors.neutral[200],
  },
  
  body: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: baseColors.neutral[200],
  },
  
  // Header elements
  title: {
    ...typography.h5,
    color: baseColors.neutral[900],
    flex: 1,
  },
  
  subtitle: {
    ...typography.bodySmall,
    color: baseColors.neutral[600],
    marginTop: spacing[1],
  },
  
  closeButton: {
    padding: spacing[2],
    marginLeft: spacing[3],
  },
  
  // Footer buttons
  footerButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  
  // Scrollable content
  scrollContent: {
    flexGrow: 1,
  },
  
  // Bottom sheet specific
  bottomSheet: {
    backgroundColor: baseColors.neutral[0],
    borderTopLeftRadius: radius.modal.lg,
    borderTopRightRadius: radius.modal.lg,
    paddingBottom: spacing[4],
    ...effects.shadows.xl,
  },
  
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: baseColors.neutral[300],
    borderRadius: radius.full,
    alignSelf: 'center',
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  
  // Full screen modal
  fullScreen: {
    flex: 1,
    backgroundColor: baseColors.neutral[0],
  },
  
  // Glass effect modal
  glassModal: {
    ...effects.glassmorphism,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Alert modal
  alert: {
    maxWidth: 320,
    padding: spacing[5],
  },
  
  alertIcon: {
    alignSelf: 'center',
    marginBottom: spacing[4],
  },
  
  alertTitle: {
    ...typography.h6,
    color: baseColors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  
  alertMessage: {
    ...typography.bodyMedium,
    color: baseColors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing[5],
  },
  
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[3],
  },
  
  // Drawer modal
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: screenWidth * 0.8,
    maxWidth: 320,
    backgroundColor: baseColors.neutral[0],
    ...effects.shadows.xl,
  },
  
  drawerLeft: {
    left: 0,
  },
  
  drawerRight: {
    right: 0,
  },
  
  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: zIndex.modal + 1,
  },
});

// Animation configurations
export const modalAnimations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 200,
  },
  slideUp: {
    from: { translateY: screenHeight },
    to: { translateY: 0 },
    duration: 300,
  },
  slideDown: {
    from: { translateY: -screenHeight },
    to: { translateY: 0 },
    duration: 300,
  },
  slideLeft: {
    from: { translateX: screenWidth },
    to: { translateX: 0 },
    duration: 300,
  },
  slideRight: {
    from: { translateX: -screenWidth },
    to: { translateX: 0 },
    duration: 300,
  },
  scaleIn: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 200,
  },
};

// Helper function to create modal styles
export const createModalStyle = (
  size: keyof typeof modalSizes,
  position: keyof typeof modalPositions = 'center'
) => {
  return {
    container: {
      ...modalStyles.container,
      ...modalPositions[position],
    },
    modal: {
      ...modalStyles.modal,
      ...modalSizes[size],
    },
  };
};