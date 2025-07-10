import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@components/Button';
import { colors, typography, spacing } from '@styles/index';

export default function Welcome() {
  return (
    <LinearGradient
      colors={[colors.accent.peach, colors.primary.lightPink, colors.secondary.lightPurple]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Luna</Text>
            <Text style={styles.tagline}>Your personal journal companion</Text>
          </View>

          <View style={styles.illustration}>
            {/* Add your illustration here */}
            <View style={styles.placeholderIllustration} />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Get Started"
              onPress={() => router.push('/(auth)/register')}
              fullWidth
              size="large"
              gradient
            />
            <Button
              title="I already have an account"
              onPress={() => router.push('/(auth)/login')}
              variant="ghost"
              fullWidth
              size="medium"
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logo: {
    ...typography.displayLarge,
    color: colors.neutral.white,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    ...typography.bodyLarge,
    color: colors.neutral.white,
    marginTop: spacing.sm,
    opacity: 0.9,
  },
  illustration: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIllustration: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.overlay.light,
  },
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
});