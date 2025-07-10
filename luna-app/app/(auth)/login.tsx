import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { useAuth } from '@contexts/AuthContext';
import { colors, typography, spacing } from '@styles/index';
import * as Haptics from 'expo-haptics';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const { 
    signIn, 
    signInWithGoogle, 
    signInWithApple, 
    signInWithBiometric, 
    resetPassword,
    isBiometricAvailable,
    isBiometricEnabled,
    error,
    clearError 
  } = useAuth();

  useEffect(() => {
    checkBiometric();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const checkBiometric = async () => {
    const available = await isBiometricAvailable();
    const enabled = await isBiometricEnabled();
    setBiometricAvailable(available && enabled);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await signInWithBiometric();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      await signInWithApple();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      await resetPassword(resetEmail);
      Alert.alert('Success', 'Password reset email sent! Check your inbox.');
      setShowResetModal(false);
      setResetEmail('');
    } catch (error: any) {
      // Error handled by context
    }
  };

  return (
    <LinearGradient
      colors={['#1A1B3A', '#2D2F5B']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with decorative elements */}
            <View style={styles.header}>
              <View style={styles.moonIcon}>
                <Ionicons name="moon" size={50} color={colors.primary.light} />
                <View style={styles.sparkle}>
                  <Ionicons name="sparkles" size={20} color={colors.accent.yellow} />
                </View>
              </View>
              <Text style={styles.title}>Welcome back, star!</Text>
              <Text style={styles.subtitle}>Your cosmic journey awaits ✨</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="stardust@luna.com"
                value={email}
                onChangeText={setEmail}
                type="email"
                icon="mail"
                autoCapitalize="none"
                style={styles.input}
              />

              <Input
                label="Password"
                placeholder="Your secret spell"
                value={password}
                onChangeText={setPassword}
                type="password"
                icon="lock-closed"
                style={styles.input}
              />

              <TouchableOpacity
                onPress={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                }}
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>Forgot your magic word?</Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                size="large"
                gradient
              />

              {biometricAvailable && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                >
                  <LinearGradient
                    colors={[colors.primary.main, colors.primary.dark]}
                    style={styles.biometricGradient}
                  >
                    <Ionicons name="finger-print" size={24} color="white" />
                    <Text style={styles.biometricText}>Quick Access</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleLogin}
                  disabled={loading}
                >
                  <View style={styles.socialButtonContent}>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.socialButtonText}>Google</Text>
                  </View>
                </TouchableOpacity>

                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[styles.socialButton, styles.appleButton]}
                    onPress={handleAppleLogin}
                    disabled={loading}
                  >
                    <View style={styles.socialButtonContent}>
                      <Ionicons name="logo-apple" size={20} color="white" />
                      <Text style={[styles.socialButtonText, styles.appleText]}>Apple</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>New to the cosmos? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.signUpText}>Join Luna</Text>
              </TouchableOpacity>
            </View>

            {/* Decorative stars */}
            <View style={styles.stars}>
              <Ionicons name="star" size={12} color={colors.accent.yellow} style={styles.star1} />
              <Ionicons name="star" size={8} color={colors.accent.pink} style={styles.star2} />
              <Ionicons name="star" size={10} color={colors.accent.purple} style={styles.star3} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Password Reset Modal */}
        {showResetModal && (
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <Text style={styles.modalSubtitle}>We'll send you a magic link</Text>
              
              <Input
                label="Email"
                placeholder="your@email.com"
                value={resetEmail}
                onChangeText={setResetEmail}
                type="email"
                icon="mail"
                style={styles.modalInput}
              />
              
              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setShowResetModal(false);
                    setResetEmail('');
                  }}
                />
                <Button
                  title="Send Link"
                  gradient
                  onPress={handlePasswordReset}
                />
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  moonIcon: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  sparkle: {
    position: 'absolute',
    top: -5,
    right: -10,
  },
  title: {
    ...typography.displayMedium,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.primary.light,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  forgotText: {
    ...typography.bodySmall,
    color: colors.accent.pink,
  },
  actions: {
    marginBottom: spacing.xl,
  },
  biometricButton: {
    marginTop: spacing.md,
  },
  biometricGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  biometricText: {
    ...typography.body,
    color: colors.neutral.white,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.primary.light,
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  appleButton: {
    backgroundColor: colors.neutral.black,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  socialButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.neutral.black,
  },
  appleText: {
    color: colors.neutral.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.primary.light,
  },
  signUpText: {
    ...typography.body,
    color: colors.accent.pink,
    fontWeight: '600',
  },
  stars: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  star1: {
    position: 'absolute',
    top: 80,
    left: 30,
  },
  star2: {
    position: 'absolute',
    top: 150,
    right: 40,
  },
  star3: {
    position: 'absolute',
    bottom: 100,
    left: 50,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.headlineMedium,
    color: colors.neutral.black,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.neutral.gray,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalInput: {
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});