import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@contexts/AuthContext';
import { colors } from '@styles/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      checkAppState();
    }
  }, [isLoading, user]);

  const checkAppState = async () => {
    try {
      // Check if user has completed onboarding
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      
      if (user) {
        // User is signed in
        const userOnboarded = await AsyncStorage.getItem(`user_${user.uid}_onboarded`);
        
        if (userOnboarded === 'true') {
          // User has completed onboarding, go to main app
          router.replace('/(tabs)');
        } else {
          // User needs to complete onboarding
          router.replace('/(onboarding)');
        }
      } else {
        // User is not signed in
        if (hasCompletedOnboarding === 'true') {
          // Show login screen
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