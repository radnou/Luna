import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@components/Button';
import { authService } from '@services/auth.service';
import { colors, typography, spacing } from '@styles/index';

export default function Profile() {
  const handleSignOut = async () => {
    try {
      await authService.signOut();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.text}>Profile Screen</Text>
        <Button
          title="Sign Out"
          variant="outline"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...typography.h2,
    color: colors.neutral.black,
    marginBottom: spacing.xl,
  },
  signOutButton: {
    minWidth: 200,
  },
});