# 🔧 Résolution du Problème d'Installation Luna App

## Problème Actuel

Lors du lancement avec `pnpm run start`, vous avez rencontré :
1. **Erreur xcrun simctl** : Code 72 (problème avec Xcode Command Line Tools)
2. **Jest manquant** : Dépendance non installée

## Solution Rapide

### 1. Installer les dépendances manquantes
```bash
cd /Users/radnoumanemossabely/Projects/Luna/luna-app

# Nettoyer les installations précédentes
rm -rf node_modules
rm -f package-lock.json

# Réinstaller avec pnpm
pnpm install

# Si pnpm échoue, utiliser npm
npm install
```

### 2. Corriger l'erreur Xcode (macOS seulement)
```bash
# Option 1: Installer/Réinstaller les outils en ligne de commande
xcode-select --install

# Option 2: Si Xcode est installé
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept

# Option 3: Réinitialiser les outils
sudo xcode-select --reset
```

### 3. Créer le fichier .env
```bash
# Copier le template
cp .env.example .env

# Éditer avec vos clés Firebase (obtenues depuis Firebase Console)
nano .env
```

### 4. Lancer l'application
```bash
# Nettoyer le cache et démarrer
pnpm run start -- -c

# Ou si vous voulez éviter iOS pour l'instant
pnpm run web
```

## Solutions Alternatives

### Si les problèmes persistent avec iOS

#### Option 1: Utiliser uniquement le Web
```bash
pnpm run web
```

#### Option 2: Utiliser Android
```bash
# Assurez-vous qu'Android Studio est installé
pnpm run android
```

#### Option 3: Expo Go (Plus simple)
1. Installer l'app Expo Go sur votre téléphone
2. Scanner le QR code affiché après `pnpm run start`

### Si Jest continue de poser problème

```bash
# Installation manuelle des dépendances de test
pnpm add -D jest jest-expo @types/jest jest-html-reporters @testing-library/jest-native

# Ou désactiver temporairement les tests
mv jest.config.js jest.config.js.bak
```

## Vérification de l'Installation

Après avoir suivi ces étapes :

```bash
# Vérifier que tout est installé
pnpm list jest
pnpm list expo

# Tester le démarrage
pnpm run start
```

Vous devriez voir :
- Metro Bundler démarrer
- Un QR code s'afficher
- Options pour lancer sur iOS/Android/Web

## Configuration Firebase Requise

Pour que l'app fonctionne complètement, vous devez :

1. Créer un projet Firebase : https://console.firebase.google.com
2. Activer Authentication (Email/Password)
3. Créer une base Firestore
4. Copier les clés dans votre fichier `.env`

## Commandes Utiles

```bash
# Nettoyer complètement le projet
pnpm run clean
rm -rf node_modules .expo dist

# Réinstaller
pnpm install

# Démarrer avec cache nettoyé
pnpm run start -- -c

# Voir les logs détaillés
EXPO_DEBUG=true pnpm run start
```

## Support

Si les problèmes persistent après ces étapes :

1. Vérifiez votre version de Node.js : `node --version` (doit être 18+)
2. Mettez à jour Expo : `pnpm add -g expo`
3. Consultez les logs : `cat ~/.expo/expo-cli.log`

---

*Guide de dépannage v1.0 - Janvier 2025*