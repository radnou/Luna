# Structure de Navigation - Luna App

## Vue d'ensemble

Cette documentation détaille la structure de navigation de l'application Luna utilisant Expo Router v4. La navigation est organisée en groupes logiques avec des layouts spécifiques pour chaque section.

## Architecture de Navigation

```
app/
├── _layout.tsx                    # Root layout avec providers
├── +not-found.tsx                # 404 screen
├── index.tsx                     # Entry point (redirect logic)
│
├── (auth)/                       # Auth flow (non-authenticated)
│   ├── _layout.tsx              # Stack navigator
│   ├── login.tsx                # Login screen
│   ├── signup.tsx               # Sign up screen
│   ├── forgot-password.tsx      # Password reset
│   └── verify-email.tsx         # Email verification
│
├── (onboarding)/                 # Onboarding flow (new users)
│   ├── _layout.tsx              # Stack with progress
│   ├── welcome.tsx              # Welcome screens (3 slides)
│   ├── personality.tsx          # Personality questionnaire
│   ├── profile-setup.tsx        # Basic profile info
│   ├── preferences.tsx          # App preferences
│   ├── permissions.tsx          # Permission requests
│   └── complete.tsx             # Onboarding complete
│
├── (tabs)/                       # Main app (authenticated)
│   ├── _layout.tsx              # Bottom tab navigator
│   │
│   ├── journal/                 # Journal tab
│   │   ├── _layout.tsx         # Stack navigator
│   │   ├── index.tsx           # Journal list
│   │   ├── new.tsx             # Create entry
│   │   ├── [id].tsx            # Entry detail
│   │   ├── edit/[id].tsx       # Edit entry
│   │   ├── search.tsx          # Search entries
│   │   └── calendar.tsx        # Calendar view
│   │
│   ├── luna/                    # AI Chat tab
│   │   ├── _layout.tsx         # Stack navigator
│   │   ├── index.tsx           # Chat interface
│   │   ├── history.tsx         # Conversation history
│   │   └── conversation/[id].tsx # Past conversation
│   │
│   ├── insights/                # Insights tab
│   │   ├── _layout.tsx         # Stack navigator
│   │   ├── index.tsx           # Dashboard
│   │   ├── patterns.tsx        # Pattern analysis
│   │   ├── mood-trends.tsx     # Mood analytics
│   │   ├── relationships.tsx   # Relationship insights
│   │   └── export.tsx          # Export data
│   │
│   ├── relationships/           # Relationships tab
│   │   ├── _layout.tsx         # Stack navigator
│   │   ├── index.tsx           # Relationships list
│   │   ├── new.tsx             # Add relationship
│   │   ├── [id].tsx            # Relationship detail
│   │   ├── edit/[id].tsx       # Edit relationship
│   │   └── timeline/[id].tsx   # Relationship timeline
│   │
│   └── profile/                 # Profile tab
│       ├── _layout.tsx         # Stack navigator
│       ├── index.tsx           # Profile overview
│       ├── edit.tsx            # Edit profile
│       ├── settings.tsx        # App settings
│       ├── preferences.tsx     # User preferences
│       ├── subscription.tsx    # Subscription management
│       ├── privacy.tsx         # Privacy settings
│       ├── notifications.tsx   # Notification settings
│       ├── help.tsx            # Help & Support
│       └── about.tsx           # About app
│
└── (modals)/                     # Modal screens
    ├── _layout.tsx              # Modal presentation
    ├── photo-viewer.tsx         # Full screen photo
    ├── mood-picker.tsx          # Mood selection
    ├── tag-selector.tsx         # Tag management
    ├── date-picker.tsx          # Date selection
    ├── export-options.tsx       # Export configuration
    └── premium-upgrade.tsx      # Upgrade prompt
```

## Layouts détaillés

### 1. Root Layout (_layout.tsx)

```typescript
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { setupServices } from '@/services';
import { LunaTheme } from '@/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    setupServices();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <BottomSheetModalProvider>
                  <StatusBar style="light" />
                  <NavigationContainer />
                </BottomSheetModalProvider>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function NavigationContainer() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!user && !inAuthGroup) {
      // Redirect to login
      router.replace('/login');
    } else if (user && !user.onboardingCompleted && !inOnboardingGroup) {
      // Redirect to onboarding
      router.replace('/welcome');
    } else if (user && user.onboardingCompleted && (inAuthGroup || inOnboardingGroup)) {
      // Redirect to main app
      router.replace('/journal');
    }
  }, [user, segments, isLoading]);

  return <Slot />;
}
```

### 2. Auth Layout ((auth)/_layout.tsx)

```typescript
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Se connecter',
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Créer un compte',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'Mot de passe oublié',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
```

### 3. Onboarding Layout ((onboarding)/_layout.tsx)

```typescript
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { ProgressBar } from '@/components/common/ProgressBar';

export default function OnboardingLayout() {
  const { colors } = useTheme();

  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => <ProgressBar />,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'slide_from_right',
          gestureEnabled: false, // Prevent swipe back
        }}
      >
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="personality" />
        <Stack.Screen name="profile-setup" />
        <Stack.Screen name="preferences" />
        <Stack.Screen name="permissions" />
        <Stack.Screen
          name="complete"
          options={{
            headerShown: false,
            animation: 'fade',
          }}
        />
      </Stack>
    </OnboardingProvider>
  );
}
```

### 4. Tabs Layout ((tabs)/_layout.tsx)

```typescript
import { Tabs } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { TabBar } from '@/components/navigation/TabBar';
import {
  JournalIcon,
  LunaIcon,
  InsightsIcon,
  RelationshipsIcon,
  ProfileIcon,
} from '@/components/icons';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
      tabBar={props => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <JournalIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="luna"
        options={{
          title: 'Luna',
          tabBarIcon: ({ color, size }) => (
            <LunaIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <InsightsIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="relationships"
        options={{
          title: 'Relations',
          tabBarIcon: ({ color, size }) => (
            <RelationshipsIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### 5. Journal Stack Layout ((tabs)/journal/_layout.tsx)

```typescript
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { HeaderButton } from '@/components/navigation/HeaderButton';
import { SearchIcon, CalendarIcon } from '@/components/icons';

export default function JournalLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: 'Quicksand-SemiBold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Mon Journal',
          headerRight: () => (
            <>
              <HeaderButton icon={SearchIcon} href="/journal/search" />
              <HeaderButton icon={CalendarIcon} href="/journal/calendar" />
            </>
          ),
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'Nouvelle entrée',
          presentation: 'modal',
          headerLeft: () => <HeaderButton title="Annuler" href=".." />,
          headerRight: () => <HeaderButton title="Publier" action="save" />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: '',
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Modifier',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
```

## Navigation Guards

### AuthGuard
```typescript
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthGuard(requireAuth = true) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !user) {
      router.replace('/login');
    } else if (!requireAuth && user) {
      router.replace('/journal');
    }
  }, [user, isLoading, requireAuth]);

  return { user, isLoading };
}
```

### OnboardingGuard
```typescript
export function useOnboardingGuard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      router.replace('/welcome');
    }
  }, [user]);
}
```

## Deep Linking

### Configuration
```typescript
// app.config.js
export default {
  expo: {
    scheme: 'luna',
    // ...
  },
};
```

### Routes
```
luna://journal/new           # New journal entry
luna://journal/:id          # View entry
luna://luna                 # Open AI chat
luna://relationships/:id    # View relationship
luna://profile/settings     # Open settings
luna://subscription         # Subscription page
```

## Transitions et Animations

### Custom Transitions
```typescript
// Slide from bottom for modals
presentation: 'modal'

// Fade transition
animation: 'fade'

// Default slide
animation: 'slide_from_right'

// iOS modal style
presentation: 'formSheet'
```

### Gesture Navigation
```typescript
// Enable swipe to go back
gestureEnabled: true

// Disable for critical flows
gestureEnabled: false
```

## State Persistence

### Navigation State
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const NAVIGATION_STATE_KEY = '@luna_navigation_state';

// Save state
export async function saveNavigationState(state: any) {
  try {
    await AsyncStorage.setItem(
      NAVIGATION_STATE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.error('Failed to save navigation state:', error);
  }
}

// Restore state
export async function restoreNavigationState() {
  try {
    const state = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('Failed to restore navigation state:', error);
    return null;
  }
}
```

## Meilleures Pratiques

1. **Groupes de Routes**: Utiliser des groupes `(name)` pour organiser les routes
2. **Layouts Réutilisables**: Créer des layouts partagés pour la cohérence
3. **Type Safety**: Utiliser TypeScript pour typer les paramètres de route
4. **Performance**: Lazy load les écrans non critiques
5. **Accessibility**: Ajouter des labels pour la navigation
6. **Error Boundaries**: Gérer les erreurs de navigation gracieusement

## Types TypeScript

```typescript
// types/navigation.ts
export type RootStackParamList = {
  '(auth)/login': undefined;
  '(auth)/signup': undefined;
  '(tabs)/journal': undefined;
  '(tabs)/journal/[id]': { id: string };
  '(tabs)/journal/new': { mood?: string };
  // ... autres routes
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

Cette structure de navigation offre une expérience utilisateur fluide et intuitive tout en maintenant une architecture modulaire et maintenable.