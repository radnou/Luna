import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { colors } from '@/src/styles/colors';
import { OnboardingButton } from '@/src/components/onboarding/OnboardingButton';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Preferences {
  notifications: {
    daily: boolean;
    insights: boolean;
    reminders: boolean;
  };
  reminderTime: Date;
  theme: 'light' | 'dark' | 'auto';
  privacy: {
    analytics: boolean;
    backup: boolean;
  };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PreferencesScreen() {
  const [preferences, setPreferences] = useState<Preferences>({
    notifications: {
      daily: true,
      insights: true,
      reminders: false,
    },
    reminderTime: new Date(new Date().setHours(20, 0, 0, 0)),
    theme: 'light',
    privacy: {
      analytics: true,
      backup: true,
    },
  });
  
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggleSwitch = (category: keyof Preferences['notifications'] | 'analytics' | 'backup') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (category === 'analytics' || category === 'backup') {
      setPreferences(prev => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [category]: !prev.privacy[category],
        },
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [category]: !prev.notifications[category],
        },
      }));
    }
  };

  const setTheme = (theme: Preferences['theme']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreferences(prev => ({ ...prev, theme }));
  };

  const handleContinue = () => {
    // Save preferences
    router.push('/(onboarding)/profile');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Personnalise ton expérience ✨</Text>
        <Text style={styles.subtitle}>
          Configure Luna selon tes préférences
        </Text>

        {/* Notifications Section */}
        <Section title="Notifications" icon="notifications" delay={0}>
          <PreferenceRow
            title="Rappel quotidien"
            subtitle="Pour ne jamais oublier de journaler"
            value={preferences.notifications.daily}
            onToggle={() => toggleSwitch('daily')}
          />
          
          {preferences.notifications.daily && (
            <Pressable 
              onPress={() => setShowTimePicker(true)}
              style={styles.timePickerButton}
            >
              <Text style={styles.timePickerLabel}>Heure du rappel</Text>
              <View style={styles.timePickerValue}>
                <Text style={styles.timePickerText}>
                  {preferences.reminderTime.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
              </View>
            </Pressable>
          )}
          
          <PreferenceRow
            title="Insights hebdomadaires"
            subtitle="Reçois tes analyses relationnelles"
            value={preferences.notifications.insights}
            onToggle={() => toggleSwitch('insights')}
          />
          
          <PreferenceRow
            title="Rappels motivants"
            subtitle="Des messages pour t'encourager"
            value={preferences.notifications.reminders}
            onToggle={() => toggleSwitch('reminders')}
          />
        </Section>

        {/* Theme Section */}
        <Section title="Apparence" icon="color-palette" delay={200}>
          <View style={styles.themeSelector}>
            {(['light', 'dark', 'auto'] as const).map((theme) => (
              <ThemeOption
                key={theme}
                theme={theme}
                isSelected={preferences.theme === theme}
                onPress={() => setTheme(theme)}
              />
            ))}
          </View>
        </Section>

        {/* Privacy Section */}
        <Section title="Confidentialité" icon="lock-closed" delay={400}>
          <PreferenceRow
            title="Analyses anonymes"
            subtitle="Aide-nous à améliorer Luna"
            value={preferences.privacy.analytics}
            onToggle={() => toggleSwitch('analytics')}
          />
          
          <PreferenceRow
            title="Sauvegarde cloud"
            subtitle="Synchronise tes données en sécurité"
            value={preferences.privacy.backup}
            onToggle={() => toggleSwitch('backup')}
          />
        </Section>

        <View style={styles.buttonContainer}>
          <OnboardingButton
            title="Continuer"
            onPress={handleContinue}
          />
          <OnboardingButton
            title="Configurer plus tard"
            onPress={() => router.push('/(onboarding)/profile')}
            variant="skip"
          />
        </View>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={preferences.reminderTime}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) {
              setPreferences(prev => ({ ...prev, reminderTime: selectedDate }));
            }
          }}
        />
      )}
    </ScrollView>
  );
}

interface SectionProps {
  title: string;
  icon: string;
  delay: number;
  children: React.ReactNode;
}

function Section({ title, icon, delay, children }: SectionProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(delay, withSpring(0, {
      damping: 15,
      stiffness: 100,
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.section, animatedStyle]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name={icon as any} size={20} color={colors.primary.pink} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </Animated.View>
  );
}

interface PreferenceRowProps {
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: () => void;
}

function PreferenceRow({ title, subtitle, value, onToggle }: PreferenceRowProps) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceTextContainer}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.neutral.lightGray, true: colors.primary.lightPink }}
        thumbColor={value ? colors.primary.pink : colors.neutral.gray}
        ios_backgroundColor={colors.neutral.lightGray}
      />
    </View>
  );
}

interface ThemeOptionProps {
  theme: 'light' | 'dark' | 'auto';
  isSelected: boolean;
  onPress: () => void;
}

function ThemeOption({ theme, isSelected, onPress }: ThemeOptionProps) {
  const scale = useSharedValue(1);
  
  const themeConfig = {
    light: { icon: 'sunny', label: 'Clair', colors: [colors.accent.yellow, colors.accent.peach] },
    dark: { icon: 'moon', label: 'Sombre', colors: [colors.secondary.purple, colors.secondary.lavender] },
    auto: { icon: 'phone-portrait', label: 'Auto', colors: colors.gradients.primary },
  };

  const config = themeConfig[theme];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 }, (finished) => {
      if (finished) {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }
    });
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.themeOption, animatedStyle]}
    >
      <LinearGradient
        colors={isSelected ? config.colors : [colors.neutral.lightGray, colors.neutral.lightGray]}
        style={styles.themeOptionGradient}
      >
        <Ionicons 
          name={config.icon as any} 
          size={24} 
          color={isSelected ? colors.neutral.white : colors.neutral.darkGray} 
        />
        <Text style={[
          styles.themeOptionLabel,
          { color: isSelected ? colors.neutral.white : colors.neutral.darkGray }
        ]}>
          {config.label}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral.black,
    fontFamily: 'Comfortaa_700Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral.darkGray,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.black,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  preferenceTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.black,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  preferenceSubtitle: {
    fontSize: 14,
    color: colors.neutral.gray,
    fontFamily: 'Inter_400Regular',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.neutral.offWhite,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  timePickerLabel: {
    fontSize: 16,
    color: colors.neutral.darkGray,
    fontFamily: 'Inter_400Regular',
  },
  timePickerValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePickerText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary.pink,
    fontFamily: 'Inter_500Medium',
    marginRight: 4,
  },
  themeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  themeOption: {
    flex: 1,
    marginHorizontal: 6,
  },
  themeOptionGradient: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  themeOptionLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginTop: 8,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
});