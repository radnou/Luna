import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '@/src/styles/colors';
import { OnboardingButton } from '@/src/components/onboarding/OnboardingButton';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
// import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function CompleteScreen() {
  const confettiRef = useRef<ConfettiCannon>(null);
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const starsScale = useSharedValue(0);

  useEffect(() => {
    // Fire confetti
    setTimeout(() => {
      confettiRef.current?.start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 500);

    // Logo animation
    logoScale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
    logoRotation.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Title animation
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    titleScale.value = withDelay(300, withSpring(1, {
      damping: 10,
      stiffness: 100,
    }));

    // Subtitle animation
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));

    // Button animation
    buttonOpacity.value = withDelay(900, withTiming(1, { duration: 800 }));

    // Stars animation
    starsScale.value = withDelay(1200, withSpring(1, {
      damping: 10,
      stiffness: 100,
    }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const handleStart = () => {
    // Navigate to main app
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={[colors.secondary.lightPurple, colors.primary.lightPink, colors.accent.peach]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Confetti */}
      <ConfettiCannon
        ref={confettiRef}
        count={100}
        origin={{ x: width / 2, y: -20 }}
        fadeOut
        explosionSpeed={350}
        fallSpeed={2500}
        colors={[
          colors.primary.pink,
          colors.secondary.purple,
          colors.accent.coral,
          colors.accent.yellow,
          colors.accent.mint,
        ]}
      />

      {/* Floating Stars */}
      <FloatingStars scale={starsScale} />

      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Ionicons name="checkmark" size={80} color={colors.neutral.white} />
          </LinearGradient>
        </Animated.View>

        {/* Success Message */}
        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title}>Bravo! 🎉</Text>
        </Animated.View>

        <Animated.View style={subtitleAnimatedStyle}>
          <Text style={styles.subtitle}>
            Ton profil Luna est prêt!{'\n'}
            Commence ton voyage d'introspection{'\n'}
            et de croissance personnelle
          </Text>
        </Animated.View>

        {/* Features Preview */}
        <Animated.View style={[styles.featuresContainer, subtitleAnimatedStyle]}>
          <FeaturePreview 
            icon="book" 
            text="Journal quotidien personnalisé"
            delay={1000}
          />
          <FeaturePreview 
            icon="sparkles" 
            text="Insights sur tes relations"
            delay={1200}
          />
          <FeaturePreview 
            icon="trending-up" 
            text="Suivi de ta progression"
            delay={1400}
          />
        </Animated.View>

        {/* Start Button */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <OnboardingButton
            title="Commencer à journaler 🌙"
            onPress={handleStart}
          />
        </Animated.View>
      </View>
    </View>
  );
}

function FloatingStars({ scale }: { scale: Animated.SharedValue<number> }) {
  const stars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height * 0.7,
    size: Math.random() * 20 + 10,
    delay: Math.random() * 2000,
  }));

  return (
    <>
      {stars.map((star) => (
        <FloatingStar key={star.id} star={star} parentScale={scale} />
      ))}
    </>
  );
}

function FloatingStar({ 
  star, 
  parentScale 
}: { 
  star: { x: number; y: number; size: number; delay: number };
  parentScale: Animated.SharedValue<number>;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      star.delay,
      withRepeat(
        withTiming(-30, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
    
    opacity.value = withDelay(
      star.delay,
      withRepeat(
        withTiming(1, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );

    rotation.value = withRepeat(
      withTiming(360, {
        duration: 10000,
        easing: Easing.linear,
      }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: star.x,
    top: star.y,
    transform: [
      { translateY: translateY.value },
      { scale: parentScale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value * 0.6,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="star" size={star.size} color={colors.accent.yellow} />
    </Animated.View>
  );
}

function FeaturePreview({ icon, text, delay }: { icon: string; text: string; delay: number }) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-30);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateX.value = withDelay(delay, withSpring(0, {
      damping: 15,
      stiffness: 100,
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.featureItem, animatedStyle]}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon as any} size={20} color={colors.primary.pink} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.pink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary.pink,
    fontFamily: 'Comfortaa_700Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.neutral.darkGray,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: 'Inter_400Regular',
    marginBottom: 40,
  },
  featuresContainer: {
    marginBottom: 50,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.neutral.darkGray,
    fontFamily: 'Inter_400Regular',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    paddingHorizontal: 30,
  },
});