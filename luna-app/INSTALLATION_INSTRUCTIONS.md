# 🌙 Luna App - Instructions d'Installation

## 📋 Prérequis

- Node.js 18+ 
- npm, yarn ou pnpm
- Expo CLI (`npm install -g expo`)
- iOS Simulator (macOS uniquement) ou Android Studio

## 🚀 Installation Rapide

### 1. Cloner le projet
```bash
git clone https://github.com/yourusername/luna.git
cd luna/luna-app
```

### 2. Installer les dépendances
```bash
# Avec npm
npm install

# Avec yarn
yarn install

# Avec pnpm (recommandé)
pnpm install
```

### 3. Configuration de l'environnement
```bash
# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos clés Firebase
nano .env
```

Ajoutez vos clés Firebase dans `.env`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Lancer l'application
```bash
# Démarrer Expo
npm start

# Ou directement sur une plateforme
npm run ios     # iOS Simulator (macOS seulement)
npm run android # Android Emulator
npm run web     # Navigateur web
```

## 🔧 Résolution des Problèmes

### Erreur: "jest" not installed
```bash
npm install --save-dev jest jest-expo @types/jest jest-html-reporters
```

### Erreur: xcrun simctl (macOS)
Si vous voyez "Error: xcrun simctl help exited with non-zero code: 72":
1. Ouvrez Xcode
2. Allez dans Preferences → Locations
3. Sélectionnez Command Line Tools

### Erreur: Metro bundler
```bash
# Nettoyer le cache
npx expo start -c

# Ou réinitialiser complètement
rm -rf node_modules
npm install
npx expo start -c
```

### Erreur: Firebase configuration
Assurez-vous que:
1. Le fichier `.env` existe avec les bonnes clés
2. Les services Firebase sont activés dans la console
3. L'authentification email/password est activée

## 📱 Configuration Plateforme

### iOS (macOS seulement)
1. Installer Xcode depuis l'App Store
2. Installer les outils en ligne de commande:
   ```bash
   xcode-select --install
   ```
3. Accepter la licence Xcode:
   ```bash
   sudo xcodebuild -license accept
   ```

### Android
1. Installer Android Studio
2. Configurer un émulateur Android (Pixel 3a API 30 recommandé)
3. Ajouter les variables d'environnement:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## 🧪 Tests

### Tests unitaires
```bash
npm test
```

### Tests E2E
```bash
# Build pour les tests
npm run test:e2e:build:ios
npm run test:e2e:build:android

# Lancer les tests
npm run test:e2e
```

### Suite complète
```bash
./scripts/run-all-tests.sh
```

## 🛠 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Lance Expo |
| `npm run ios` | Lance sur iOS |
| `npm run android` | Lance sur Android |
| `npm run web` | Lance sur le web |
| `npm run build` | Build toutes les plateformes |
| `npm run typecheck` | Vérifie TypeScript |
| `npm run lint` | Vérifie le code |
| `npm test` | Lance les tests |

## 📂 Structure du Projet

```
luna-app/
├── app/              # Écrans et navigation
├── src/              
│   ├── components/   # Composants UI
│   ├── contexts/     # État global
│   ├── hooks/        # Custom hooks
│   ├── services/     # Services API
│   ├── styles/       # Styles globaux
│   ├── types/        # Types TypeScript
│   └── utils/        # Utilitaires
├── assets/           # Images et assets
├── scripts/          # Scripts d'automatisation
└── e2e/             # Tests end-to-end
```

## 🆘 Support

- Documentation: [/docs](./docs)
- Issues: [GitHub Issues](https://github.com/yourusername/luna/issues)
- Email: support@luna-app.com

---

*Installation Guide v1.0 - Janvier 2025*