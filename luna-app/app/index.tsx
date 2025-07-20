import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@contexts/AuthContext';
import { useOnboarding } from '@contexts/OnboardingContext';
import { colors } from '@styles/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { user, isLoading } = useAuth();
  const { isCompleted } = useOnboarding();

  useEffect(() => {
    if (!isLoading) {
      checkAppState();
    }
  }, [isLoading, user]);

  const checkAppState = async () => {
    try {
      if (user) {
        // User is signed in
        if (isCompleted()) {
          // User has completed onboarding, go to main app
          router.replace('/(tabs)');
        } else {
          // User needs to complete onboarding
          router.replace('/(onboarding)');
        }
      } else {
        // User is not signed in
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        if (hasSeenOnboarding === 'true') {
          // Show login screen for returning users
          router.replace('/(auth)');
        } else {
          // New user, show onboarding
          router.replace('/(onboarding)');
        }
      }
    } catch (error) {
      console.error('Error checking app state:', error);
      // Default to onboarding on error
      router.replace('/(onboarding)');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary.pink} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
});