import * as Font from 'expo-font';

export const loadFonts = async () => {
  await Font.loadAsync({
    'Comfortaa_300Light': require('@expo-google-fonts/comfortaa/Comfortaa_300Light.ttf'),
    'Comfortaa_400Regular': require('@expo-google-fonts/comfortaa/Comfortaa_400Regular.ttf'),
    'Comfortaa_500Medium': require('@expo-google-fonts/comfortaa/Comfortaa_500Medium.ttf'),
    'Comfortaa_600SemiBold': require('@expo-google-fonts/comfortaa/Comfortaa_600SemiBold.ttf'),
    'Comfortaa_700Bold': require('@expo-google-fonts/comfortaa/Comfortaa_700Bold.ttf'),
    'Inter_300Light': require('@expo-google-fonts/inter/Inter_300Light.ttf'),
    'Inter_400Regular': require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
    'Inter_500Medium': require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
    'Inter_600SemiBold': require('@expo-google-fonts/inter/Inter_600SemiBold.ttf'),
    'Inter_700Bold': require('@expo-google-fonts/inter/Inter_700Bold.ttf'),
  });
};