/**
 * Luna Design System - Animations
 * Modern animation configurations and utilities
 */

import { Animated, Easing } from 'react-native';
import { duration, easing } from '../tokens';

// Animation types
export const animationTypes = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: duration.normal,
    easing: Easing.out(Easing.ease),
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: duration.normal,
    easing: Easing.in(Easing.ease),
  },
  
  // Scale animations
  scaleIn: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: duration.normal,
    easing: Easing.out(Easing.back(1.5)),
  },
  scaleOut: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.9, opacity: 0 },
    duration: duration.normal,
    easing: Easing.in(Easing.ease),
  },
  pulse: {
    from: { scale: 1 },
    to: { scale: 1.05 },
    duration: duration.slow,
    easing: Easing.inOut(Easing.ease),
    loop: true,
  },
  
  // Slide animations
  slideInRight: {
    from: { translateX: 100, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: duration.normal,
    easing: Easing.out(Easing.quad),
  },
  slideInLeft: {
    from: { translateX: -100, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: duration.normal,
    easing: Easing.out(Easing.quad),
  },
  slideInUp: {
    from: { translateY: 100, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: duration.normal,
    easing: Easing.out(Easing.quad),
  },
  slideInDown: {
    from: { translateY: -100, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: duration.normal,
    easing: Easing.out(Easing.quad),
  },
  
  // Bounce animations
  bounceIn: {
    from: { scale: 0.3, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: duration.slow,
    easing: Easing.out(Easing.back(2)),
  },
  bounce: {
    from: { translateY: 0 },
    to: { translateY: -20 },
    duration: duration.normal,
    easing: Easing.out(Easing.quad),
    loop: true,
    reverse: true,
  },
  
  // Rotate animations
  rotate: {
    from: { rotate: '0deg' },
    to: { rotate: '360deg' },
    duration: duration.slower,
    easing: Easing.linear,
    loop: true,
  },
  swing: {
    from: { rotate: '-10deg' },
    to: { rotate: '10deg' },
    duration: duration.slow,
    easing: Easing.inOut(Easing.ease),
    loop: true,
    reverse: true,
  },
  
  // Shimmer effect
  shimmer: {
    from: { translateX: -200 },
    to: { translateX: 200 },
    duration: duration.slowest,
    easing: Easing.inOut(Easing.ease),
    loop: true,
  },
  
  // Ripple effect
  ripple: {
    from: { scale: 0, opacity: 0.6 },
    to: { scale: 4, opacity: 0 },
    duration: duration.slow,
    easing: Easing.out(Easing.ease),
  },
};

// Animation utilities
export const createAnimation = (
  value: Animated.Value | Animated.ValueXY,
  config: typeof animationTypes[keyof typeof animationTypes],
  options?: {
    delay?: number;
    loop?: boolean;
    reverse?: boolean;
  }
) => {
  const animation = Animated.timing(value, {
    toValue: 1,
    duration: config.duration,
    easing: config.easing,
    delay: options?.delay || 0,
    useNativeDriver: true,
  });
  
  if (options?.loop) {
    if (options?.reverse) {
      return Animated.loop(
        Animated.sequence([
          animation,
          Animated.timing(value, {
            toValue: 0,
            duration: config.duration,
            easing: config.easing,
            useNativeDriver: true,
          }),
        ])
      );
    }
    return Animated.loop(animation);
  }
  
  return animation;
};

// Parallel animations
export const createParallelAnimation = (
  animations: Animated.CompositeAnimation[],
  options?: { delay?: number }
) => {
  if (options?.delay) {
    return Animated.sequence([
      Animated.delay(options.delay),
      Animated.parallel(animations),
    ]);
  }
  return Animated.parallel(animations);
};

// Sequence animations
export const createSequenceAnimation = (
  animations: Animated.CompositeAnimation[],
  options?: { delay?: number; gap?: number }
) => {
  const sequence = [];
  
  if (options?.delay) {
    sequence.push(Animated.delay(options.delay));
  }
  
  animations.forEach((animation, index) => {
    sequence.push(animation);
    if (options?.gap && index < animations.length - 1) {
      sequence.push(Animated.delay(options.gap));
    }
  });
  
  return Animated.sequence(sequence);
};

// Stagger animations
export const createStaggerAnimation = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 100,
  options?: { initialDelay?: number }
) => {
  return Animated.stagger(staggerDelay, animations);
};

// Spring animations
export const springAnimations = {
  gentle: {
    friction: 7,
    tension: 40,
    useNativeDriver: true,
  },
  wobbly: {
    friction: 3,
    tension: 40,
    useNativeDriver: true,
  },
  stiff: {
    friction: 20,
    tension: 200,
    useNativeDriver: true,
  },
  slow: {
    friction: 14,
    tension: 20,
    useNativeDriver: true,
  },
  bouncy: {
    friction: 4,
    tension: 60,
    useNativeDriver: true,
  },
};

// Gesture animations
export const gestureAnimations = {
  swipeThreshold: 50,
  swipeVelocity: 0.3,
  
  drag: {
    damping: 15,
    stiffness: 100,
  },
  
  pinch: {
    minScale: 0.5,
    maxScale: 3,
    friction: 7,
  },
  
  rotate: {
    minRotation: -45,
    maxRotation: 45,
    friction: 5,
  },
};

// Micro-interactions
export const microInteractions = {
  tap: {
    scale: 0.95,
    duration: duration.faster,
  },
  
  hover: {
    scale: 1.05,
    duration: duration.fast,
  },
  
  focus: {
    scale: 1.02,
    duration: duration.fast,
  },
  
  success: {
    scale: [1, 1.2, 0.9, 1],
    duration: duration.normal,
  },
  
  error: {
    translateX: [-10, 10, -10, 10, 0],
    duration: duration.normal,
  },
};

// Page transitions
export const pageTransitions = {
  fade: {
    cardStyleInterpolator: ({ current: { progress } }: any) => ({
      cardStyle: {
        opacity: progress,
      },
    }),
  },
  
  slide: {
    cardStyleInterpolator: ({ current, layouts }: any) => ({
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    }),
  },
  
  modal: {
    cardStyleInterpolator: ({ current, layouts }: any) => ({
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    }),
  },
};