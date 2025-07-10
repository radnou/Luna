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
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { useAuth } from '@contexts/AuthContext';
import { colors, typography, spacing } from '@styles/index';
import * as Haptics from 'expo-haptics';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const { signUp, signInWithGoogle, signInWithApple, error, clearError } = useAuth();

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Oops!', 'Please fill in all the magical fields ✨');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Oops!', 'Your passwords don\'t match, star! 🌟');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Oops!', 'Your password needs at least 6 characters for extra protection 🔒');
      return false;
    }

    if (!acceptedTerms) {
      Alert.alert('One more thing!', 'Please accept our terms to join the Luna family 💫');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(email, password, name);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!acceptedTerms) {
      Alert.alert('One more thing!', 'Please accept our terms to join the Luna family 💫');
      return;
    }

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

  const handleAppleSignUp = async () => {
    if (!acceptedTerms) {
      Alert.alert('One more thing!', 'Please accept our terms to join the Luna family 💫');
      return;
    }

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
              <Text style={styles.title}>Join the cosmos!</Text>
              <Text style={styles.subtitle}>Start your celestial journey 🌙</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Your Name"
                placeholder="Moonlight Princess"
                value={name}
                onChangeText={setName}
                icon="person"
                autoCapitalize="words"
                style={styles.input}
              />

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
                placeholder="Create your secret spell"
                value={password}
                onChangeText={setPassword}
                type="password"
                icon="lock-closed"
                style={styles.input}
              />

              <Input
                label="Confirm Password"
                placeholder="Repeat your spell"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                type="password"
                icon="lock-closed"
                style={styles.input}
              />

              {/* Password strength indicator */}
              {password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBar}>
                    <LinearGradient
                      colors={
                        password.length < 6
                          ? ['#FF6B9D', '#FF6B9D']
                          : password.length < 10
                          ? ['#FFE66D', '#FFE66D']
                          : ['#4CAF50', '#4CAF50']
                      }
                      style={[
                        styles.strengthFill,
                        {
                          width: `${Math.min((password.length / 12) * 100, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.strengthText}>
                    {password.length < 6
                      ? 'Keep going...'
                      : password.length < 10
                      ? 'Good spell!'
                      : 'Powerful magic!'}
                  </Text>
                </View>
              )}
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View style={styles.checkbox}>
                {acceptedTerms && (
                  <Ionicons name="checkmark" size={16} color={colors.accent.pink} />
                )}
              </View>
              <Text style={styles.termsText}>
                I accept the{' '}
                <Text style={styles.link}>Terms of Service</Text> and{' '}
                <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                fullWidth
                size="large"
                gradient
                disabled={!acceptedTerms}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or join with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleSignUp}
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
                    onPress={handleAppleSignUp}
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
              <Text style={styles.footerText}>Already a star? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Decorative stars */}
            <View style={styles.stars}>
              <Ionicons name="star" size={14} color={colors.accent.yellow} style={styles.star1} />
              <Ionicons name="star" size={10} color={colors.accent.pink} style={styles.star2} />
              <Ionicons name="star" size={12} color={colors.accent.purple} style={styles.star3} />
              <Ionicons name="star" size={8} color={colors.primary.light} style={styles.star4} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    marginTop: spacing.xl,
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
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  passwordStrength: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  strengthBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    ...typography.caption,
    color: colors.primary.light,
    textAlign: 'right',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.primary.light,
    borderRadius: 4,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  termsText: {
    ...typography.caption,
    color: colors.primary.light,
    flex: 1,
  },
  link: {
    color: colors.accent.pink,
    fontWeight: '600',
  },
  actions: {
    marginBottom: spacing.lg,
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
  signInText: {
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
    top: 60,
    left: 40,
  },
  star2: {
    position: 'absolute',
    top: 120,
    right: 30,
  },
  star3: {
    position: 'absolute',
    bottom: 120,
    left: 60,
  },
  star4: {
    position: 'absolute',
    bottom: 180,
    right: 50,
  },
});