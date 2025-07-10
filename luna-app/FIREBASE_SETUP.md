# Luna Firebase Setup Guide

## Overview
This guide covers the complete Firebase setup for Luna app, including authentication (Google, Apple, Email), Firestore, and Storage.

## Prerequisites
1. Firebase project created
2. Google Service files configured (GoogleService-Info.plist for iOS, google-services.json for Android)
3. Apple Developer account (for Apple Sign-In)
4. Google Cloud Console project linked to Firebase

## Environment Setup

### 1. Create `.env` file
Copy `.env.example` to `.env` and fill in your Firebase configuration:

```bash
cp .env.example .env
```

### 2. Firebase Console Configuration

#### Enable Authentication Methods:
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable:
   - Email/Password
   - Google
   - Apple (iOS only)

#### Google Sign-In Setup:
1. In Google Cloud Console, create OAuth 2.0 credentials:
   - Web client ID (for Expo)
   - iOS client ID
   - Android client ID
2. Add these to your `.env` file
3. Download configuration files:
   - `GoogleService-Info.plist` → `/ios/`
   - `google-services.json` → `/android/app/`

#### Apple Sign-In Setup:
1. Enable Sign in with Apple in Apple Developer Console
2. Create Service ID for web
3. Configure return URLs
4. Update `app.json` with your bundle identifier

### 3. Deploy Security Rules

#### Firestore Rules:
```bash
firebase deploy --only firestore:rules
```

#### Storage Rules:
```bash
firebase deploy --only storage:rules
```

#### Firestore Indexes:
```bash
firebase deploy --only firestore:indexes
```

## Development Workflow

### Running in Development:
```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# For iOS development (requires Mac)
npm run ios

# For Android development
npm run android
```

### Testing Authentication:
1. **Email/Password**: Works in Expo Go
2. **Google Sign-In**: Requires development build or standalone app
3. **Apple Sign-In**: iOS only, requires development build
4. **Biometric**: Native devices only

### Using Firebase Emulators:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Start emulators: `firebase emulators:start`
3. In `src/config/firebase.ts`, set `USE_EMULATORS = true`

## Production Build

### 1. EAS Build Setup:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project
eas build:configure
```

### 2. Update Credentials:
- Add Firebase config to EAS secrets
- Configure Google Sign-In URL schemes
- Set up Apple Sign-In entitlements

### 3. Build for Production:
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] Firestore rules restrict access to authenticated users
- [ ] Storage rules limit file sizes and types
- [ ] API keys restricted in Google Cloud Console
- [ ] App Check enabled for production
- [ ] Proper error handling for auth failures
- [ ] Rate limiting configured
- [ ] Backup and disaster recovery plan

## Troubleshooting

### Common Issues:

1. **Google Sign-In not working in Expo Go**
   - This is expected. Use development build or test in production

2. **Apple Sign-In errors**
   - Verify bundle ID matches Apple Developer configuration
   - Check Service ID configuration

3. **Firebase connection issues**
   - Verify all environment variables are set
   - Check Firebase project settings
   - Ensure authentication methods are enabled

4. **Biometric authentication fails**
   - Not supported in simulators
   - User must have biometric enrolled on device

### Debug Commands:
```bash
# Check Firebase configuration
npx expo config --type introspect

# Verify environment variables
npx expo start --clear
```

## Support
For issues, check:
- Firebase Console logs
- Expo development logs
- Native device logs (Xcode/Android Studio)

Remember to never commit sensitive credentials to version control!