import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { colors } from '@/src/styles/colors';
import { OnboardingButton } from '@/src/components/onboarding/OnboardingButton';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useOnboarding } from '@/src/contexts/OnboardingContext';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ProfileData {
  name: string;
  birthDate: Date | null;
  photo: string | null;
}

export default function ProfileScreen() {
  const { data, updateProfile } = useOnboarding();
  const [profile, setProfile] = useState<ProfileData>({
    name: data.profile.name || '',
    birthDate: data.profile.birthDate ? new Date(data.profile.birthDate) : null,
    photo: data.profile.photoUri || null,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const photoScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    photoScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
    formOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
  }, []);

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfile(prev => ({ ...prev, photo: result.assets[0].uri }));
      photoScale.value = withSpring(0.95, { damping: 15, stiffness: 150 }, (finished) => {
        if (finished) {
          photoScale.value = withSpring(1, { damping: 15, stiffness: 150 });
        }
      });
    }
  };

  const handleContinue = async () => {
    // Save profile data
    await updateProfile({
      name: profile.name,
      birthDate: profile.birthDate ? profile.birthDate.toISOString() : '',
      photoUri: profile.photo || undefined,
    });
    router.push('/(onboarding)/complete');
  };

  const canContinue = profile.name.trim().length > 0;

  const photoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: photoScale.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Presque fini! 🌟</Text>
          <Text style={styles.subtitle}>
            Dis-nous en un peu plus sur toi
          </Text>

          {/* Profile Photo */}
          <Animated.View style={[styles.photoContainer, photoAnimatedStyle]}>
            <Pressable onPress={pickImage} style={styles.photoPressable}>
              <LinearGradient
                colors={profile.photo ? ['transparent', 'transparent'] : colors.gradients.primary}
                style={styles.photoGradient}
              >
                {profile.photo ? (
                  <Image source={{ uri: profile.photo }} style={styles.photo} />
                ) : (
                  <>
                    <Ionicons name="camera" size={40} color={colors.neutral.white} />
                    <Text style={styles.photoText}>Ajouter une photo</Text>
                  </>
                )}
              </LinearGradient>
              {profile.photo && (
                <View style={styles.photoEditButton}>
                  <Ionicons name="camera" size={16} color={colors.neutral.white} />
                </View>
              )}
            </Pressable>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            {/* Name Input */}
            <InputField
              label="Ton prénom"
              value={profile.name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
              placeholder="Entre ton prénom"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              isFocused={focusedField === 'name'}
              icon="person"
              delay={400}
            />

            {/* Birth Date */}
            <Pressable 
              onPress={() => setShowDatePicker(true)}
              style={styles.dateInputContainer}
            >
              <View style={styles.inputLabel}>
                <View style={styles.inputIcon}>
                  <Ionicons name="calendar" size={20} color={colors.primary.pink} />
                </View>
                <Text style={styles.inputLabelText}>Ta date de naissance</Text>
              </View>
              <View style={[
                styles.dateInput,
                focusedField === 'date' && styles.inputFocused
              ]}>
                <Text style={[
                  styles.dateInputText,
                  !profile.birthDate && styles.placeholderText
                ]}>
                  {profile.birthDate 
                    ? profile.birthDate.toLocaleDateString('fr-FR')
                    : 'Sélectionne ta date'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.neutral.gray} />
              </View>
            </Pressable>

            {/* Optional Badge */}
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>
                La photo et la date sont optionnelles 💕
              </Text>
            </View>
          </Animated.View>

          <View style={styles.buttonContainer}>
            <OnboardingButton
              title={canContinue ? "Finaliser mon profil ✨" : "Entre ton prénom pour continuer"}
              onPress={handleContinue}
              disabled={!canContinue}
            />
            <OnboardingButton
              title="Passer"
              onPress={() => router.push('/(onboarding)/complete')}
              variant="skip"
            />
          </View>
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={profile.birthDate || new Date()}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setProfile(prev => ({ ...prev, birthDate: selectedDate }));
            }
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  icon: string;
  delay: number;
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  onFocus,
  onBlur,
  isFocused,
  icon,
  delay,
}: InputFieldProps) {
  const inputScale = useSharedValue(0);
  const borderWidth = useSharedValue(1);

  React.useEffect(() => {
    inputScale.value = withDelay(delay, withSpring(1, {
      damping: 15,
      stiffness: 100,
    }));
  }, []);

  React.useEffect(() => {
    borderWidth.value = withSpring(isFocused ? 2 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
    borderColor: interpolate(
      borderWidth.value,
      [1, 2],
      [colors.neutral.lightGray, colors.primary.pink].map(c => 
        parseInt(c.replace('#', '0x'), 16)
      ),
      Extrapolate.CLAMP
    ).toString(16).padStart(6, '0'),
  }));

  return (
    <Animated.View style={[styles.inputContainer, containerAnimatedStyle]}>
      <View style={styles.inputLabel}>
        <View style={styles.inputIcon}>
          <Ionicons name={icon as any} size={20} color={colors.primary.pink} />
        </View>
        <Text style={styles.inputLabelText}>{label}</Text>
      </View>
      <AnimatedTextInput
        style={[styles.input, inputAnimatedStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral.gray}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
    flex: 1,
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  photoPressable: {
    position: 'relative',
  },
  photoGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoText: {
    fontSize: 14,
    color: colors.neutral.white,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
  photoEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.pink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  inputLabelText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.black,
    fontFamily: 'Inter_500Medium',
  },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    color: colors.neutral.black,
  },
  inputFocused: {
    borderColor: colors.primary.pink,
    borderWidth: 2,
  },
  dateInputContainer: {
    marginBottom: 24,
  },
  dateInput: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.neutral.black,
  },
  placeholderText: {
    color: colors.neutral.gray,
  },
  optionalBadge: {
    alignItems: 'center',
    marginTop: 8,
  },
  optionalText: {
    fontSize: 14,
    color: colors.neutral.gray,
    fontFamily: 'Inter_400Regular',
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 'auto',
  },
});