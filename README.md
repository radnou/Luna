# LUNA - Mindful Dating App

A Flutter-based dating application that combines astrology and psychology to create meaningful connections.

## Features Implemented

### Onboarding Flow
1. **Splash Screen** - Animated moon logo with constellation background
2. **Welcome Screens** - 3-page introduction with smooth transitions
3. **Authentication** - Email/password and OAuth (Google & Apple) sign-in/up
4. **Personality Questionnaire** - 15 questions to assess personality traits
5. **Astral Profile** - Birth date, time, and location pickers for zodiac calculation
6. **Relationship Goals** - Multi-select goals for what users seek
7. **Permissions** - Request for notifications and location access
8. **Profile Completion** - Generated zodiac avatar and success screen

### Technical Features
- **State Management**: Provider pattern
- **Authentication**: Firebase Auth integration
- **Database**: Firestore for user data
- **Animations**: Flutter Animate for smooth transitions
- **UI/UX**: Custom theme with cosmic design elements
- **Progress Tracking**: Star-based progress indicators
- **Zodiac Calculations**: Automatic sign detection based on birth date
- **Location Services**: Geolocator for birth location

## Project Structure

```
lib/
├── main.dart                    # App entry point
├── constants/
│   └── app_theme.dart          # Theme configuration
├── models/
│   └── user_model.dart         # User data models
├── services/
│   ├── auth_service.dart       # Authentication logic
│   └── user_service.dart       # User data management
├── screens/
│   ├── home_screen.dart        # Main app screen
│   └── onboarding/
│       ├── splash_screen.dart
│       ├── welcome_screen.dart
│       ├── auth_screen.dart
│       ├── personality_questionnaire_screen.dart
│       ├── astral_profile_screen.dart
│       ├── relationship_goals_screen.dart
│       ├── permissions_screen.dart
│       └── profile_completion_screen.dart
├── widgets/
│   ├── constellation_background.dart
│   ├── star_progress_indicator.dart
│   ├── location_picker.dart
│   └── zodiac_avatar.dart
└── utils/
    └── zodiac_calculator.dart

assets/
├── images/                     # App images
├── animations/                 # Lottie animations
└── fonts/                      # Custom fonts
```

## Setup Instructions

1. **Install Flutter**
   ```bash
   # Follow instructions at https://flutter.dev/docs/get-started/install
   ```

2. **Clone and Navigate**
   ```bash
   cd /Users/radnoumanemossabely/Projects/Luna
   ```

3. **Install Dependencies**
   ```bash
   flutter pub get
   ```

4. **Firebase Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Add Android and iOS apps to your Firebase project
   - Download and add configuration files:
     - `google-services.json` to `android/app/`
     - `GoogleService-Info.plist` to `ios/Runner/`
   - Enable Authentication methods:
     - Email/Password
     - Google Sign-In
     - Apple Sign-In (iOS only)
   - Create a Firestore database

5. **Platform-Specific Setup**
   
   **Android:**
   - Minimum SDK: 21
   - Add SHA-1 fingerprint to Firebase for Google Sign-In
   
   **iOS:**
   - Minimum iOS version: 12.0
   - Configure Apple Sign-In in Xcode capabilities
   - Add URL schemes for Google Sign-In

6. **Add Fonts**
   Download Quicksand font family and add to `assets/fonts/`:
   - Quicksand-Light.ttf
   - Quicksand-Regular.ttf
   - Quicksand-Medium.ttf
   - Quicksand-SemiBold.ttf
   - Quicksand-Bold.ttf

7. **Run the App**
   ```bash
   flutter run
   ```

## Next Steps

1. **Complete Firebase Integration**
   - Add proper Firebase configuration files
   - Set up Cloud Functions for advanced features

2. **Enhance Features**
   - Implement matching algorithm
   - Add chat functionality
   - Create discovery/swipe interface
   - Add daily horoscopes
   - Implement compatibility calculations

3. **Testing**
   - Add unit tests
   - Add widget tests
   - Test on multiple devices

4. **Deployment**
   - Configure app signing
   - Prepare store listings
   - Submit to App Store and Google Play

## Design Philosophy

LUNA uses a cosmic, space-themed design with:
- Dark backgrounds representing the night sky
- Constellation animations
- Gradient accents in purple, pink, and yellow
- Smooth animations and transitions
- Mindful, calming user experience

## Dependencies

Key packages used:
- `firebase_core` & Firebase services
- `provider` for state management
- `flutter_animate` for animations
- `google_fonts` for typography
- `geolocator` & `geocoding` for location
- `smooth_page_indicator` for onboarding
- `lottie` for complex animations

## License

This project is proprietary software. All rights reserved.