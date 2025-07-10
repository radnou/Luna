import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '@/src/styles/colors';
import { OnboardingButton } from '@/src/components/onboarding/OnboardingButton';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const sparkleScale = useSharedValue(0);

  useEffect(() => {
    // Logo animation
    logoScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
    logoRotation.value = withSequence(
      withTiming(10, { duration: 300 }),
      withTiming(-10, { duration: 300 }),
      withTiming(0, { duration: 300 })
    );

    // Title animation
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    titleTranslateY.value = withDelay(300, withSpring(0, {
      damping: 15,
      stiffness: 100,
    }));

    // Subtitle animation
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));

    // Button animation
    buttonOpacity.value = withDelay(900, withTiming(1, { duration: 800 }));

    // Sparkle animation
    sparkleScale.value = withDelay(1200, 
      withSequence(
        withSpring(1.2, { damping: 15, stiffness: 150 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      )
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
    opacity: interpolate(sparkleScale.value, [0, 1, 1.2], [0, 1, 0.8]),
  }));

  return (
    <View style={styles.container}>
      {/* Animated Background Gradient */}
      <LinearGradient
        colors={[colors.secondary.lightPurple, colors.primary.lightPink, colors.accent.peach]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Sparkles */}
      <Animated.View style={[styles.sparkleContainer, sparkleAnimatedStyle]}>
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.sparkle,
              {
                top: Math.random() * height * 0.6,
                left: Math.random() * width,
              },
            ]}
          >
            <Ionicons name="sparkles" size={20} color={colors.accent.yellow} />
          </View>
        ))}
      </Animated.View>

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Ionicons name="moon" size={60} color={colors.neutral.white} />
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title}>Luna</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={subtitleAnimatedStyle}>
          <Text style={styles.subtitle}>
            Ton journal intime pour comprendre{'\n'}tes relations et grandir 🌙
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.featuresContainer, subtitleAnimatedStyle]}>
          <FeatureItem 
            icon="heart" 
            text="Comprends tes émotions"
            delay={1000}
          />
          <FeatureItem 
            icon="analytics" 
            text="Analyse tes patterns relationnels"
            delay={1200}
          />
          <FeatureItem 
            icon="flower" 
            text="Grandis et épanouis-toi"
            delay={1400}
          />
        </Animated.View>

        {/* Button */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <OnboardingButton
            title="Commencer mon voyage ✨"
            onPress={() => router.push('/(onboarding)/goals')}
          />
        </Animated.View>
      </View>
    </View>
  );
}

function FeatureItem({ icon, text, delay }: { icon: string; text: string; delay: number }) {
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
        <Ionicons name={icon as any} size={24} color={colors.primary.pink} />
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
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    marginBottom: 20,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: colors.neutral.darkGray,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    paddingHorizontal: 30,
  },
});