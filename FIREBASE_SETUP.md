# Firebase Setup Guide for LUNA

## Prerequisites
1. Node.js 18+ installed
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. A Firebase project created in the Firebase Console

## Initial Setup

### 1. Install Dependencies
```bash
# Install main project dependencies
npm install

# Install Cloud Functions dependencies
cd functions && npm install
cd ..
```

### 2. Configure Firebase Project
```bash
# Login to Firebase
firebase login

# Select your project
firebase use your-project-id
```

### 3. Set Environment Variables
1. Copy `.env.example` to `.env.local` (for Next.js) or `.env` (for React)
2. Fill in your Firebase configuration values from Firebase Console

### 4. Set Cloud Functions Config
```bash
# Set OpenAI API Key
firebase functions:config:set openai.api_key="your-openai-api-key"

# Set Anthropic API Key (Claude)
firebase functions:config:set anthropic.api_key="your-anthropic-api-key"
```

## Deploy to Firebase

### Deploy Everything
```bash
firebase deploy
```

### Deploy Specific Services
```bash
# Deploy Firestore rules and indexes only
firebase deploy --only firestore

# Deploy Cloud Functions only
firebase deploy --only functions

# Deploy Storage rules only
firebase deploy --only storage

# Deploy specific function
firebase deploy --only functions:analyzeJournalEntry
```

## Local Development

### Run Firebase Emulators
```bash
# Start all emulators
npm run firebase:emulators

# The emulator UI will be available at http://localhost:4000
```

### Test Cloud Functions Locally
```bash
npm run functions:shell
```

## Firebase Services Overview

### 1. **Authentication**
- Email/Password authentication
- Google Sign-In
- Apple Sign-In
- Custom user profiles in Firestore

### 2. **Firestore Collections**
- `users` - User profiles and preferences
- `journal_entries` - Mood tracking and personal insights
- `analyses` - Birth charts and compatibility reports
- `conversations` - Text decoder chat history
- `relationships` - Saved relationship data
- `notifications` - Push notification history

### 3. **Cloud Functions**
- **Auth Triggers**: User creation/deletion handlers
- **AI Integration**: OpenAI/Claude API calls
- **Astrology Service**: Birth chart calculations
- **PDF Generation**: Report generation
- **Scheduled Jobs**: Daily horoscopes, backups, analytics

### 4. **Storage Structure**
```
/users/{userId}/
  /profile/         - Profile images
  /journal/{id}/    - Journal attachments
  /analyses/{id}/   - Analysis PDFs
  /conversations/   - Screenshot uploads
```

### 5. **Security Rules**
- User data is private by default
- Analyses can be made public for sharing
- Storage files are user-scoped
- Proper validation for all data types

## Important Security Notes

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Restrict API keys** in Google Cloud Console
3. **Enable App Check** for production
4. **Monitor usage** in Firebase Console
5. **Set budget alerts** in Google Cloud Console

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check Firestore rules
   - Ensure user is authenticated
   - Verify security rules are deployed

2. **Function Deployment Fails**
   - Check Node.js version (must be 18+)
   - Verify all dependencies are installed
   - Check function logs: `firebase functions:log`

3. **Storage Upload Fails**
   - Check file size limits in storage rules
   - Verify content type validation
   - Ensure proper authentication

## Next Steps

1. Set up Firebase App Check for security
2. Configure Firebase Performance Monitoring
3. Set up Firebase Crashlytics for error tracking
4. Enable Firebase Remote Config for feature flags
5. Configure backup retention policies
6. Set up monitoring alerts

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Samples](https://github.com/firebase/functions-samples)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Guide](https://firebase.google.com/docs/storage)