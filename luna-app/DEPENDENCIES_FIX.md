# 🔧 Correction des Dépendances Luna App

## ⚠️ Problèmes Identifiés

1. **React incompatible** : React 19 vs React-DOM 19.1 
2. **Expo CLI manquant** : `expo: command not found`
3. **Versions incompatibles** : React Native 0.79 avec Expo 53

## ✅ Solutions Appliquées

### 1. Versions Compatibles Fixées

**Avant:**
```json
"react": "19.0.0",
"react-dom": "^19.1.0",
"react-native": "0.79.5",
"expo": "~53.0.17"
```

**Après (versions stables):**
```json
"react": "18.2.0",
"react-dom": "18.2.0",
"react-native": "0.76.5",
"expo": "~52.0.0"
```

### 2. Scripts Corrigés avec npx

**Avant:**
```json
"start": "expo start",
"web": "expo start --web"
```

**Après (utilise npx):**
```json
"start": "npx expo start",
"web": "npx expo start --web"
```

### 3. Types TypeScript Alignés

```json
"@types/react": "~18.2.0",
"@types/react-native": "^0.76.0"
```

## 🚀 Instructions d'Installation

### Étape 1: Nettoyer complètement
```bash
cd /Users/radnoumanemossabely/Projects/Luna/luna-app

# Supprimer tous les fichiers de cache
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml
rm -rf .expo
rm -rf dist
```

### Étape 2: Installer avec pnpm
```bash
# Installation propre
pnpm install

# Si pnpm échoue, utiliser npm avec --legacy-peer-deps
npm install --legacy-peer-deps
```

### Étape 3: Lancer l'application
```bash
# Lancer sur le web (recommandé pour commencer)
pnpm run web

# Ou lancer avec interface de sélection
pnpm run start
```

## 📱 Alternatives de Lancement

### Option 1: Web (Plus simple)
```bash
pnpm run web
```
L'application s'ouvrira dans votre navigateur sur `http://localhost:19006`

### Option 2: Expo Go (Mobile)
```bash
pnpm run start
```
Puis scannez le QR code avec l'app Expo Go sur votre téléphone

### Option 3: Simulateur iOS (après correction Xcode)
```bash
# Corriger Xcode d'abord
sudo xcode-select --install
sudo xcodebuild -license accept

# Puis lancer
pnpm run ios
```

## 🔍 Vérification de l'Installation

Après l'installation, vérifiez:

```bash
# Vérifier les versions
node --version    # Doit être 18+
pnpm --version    # Doit être 8+

# Vérifier les dépendances clés
pnpm list react
pnpm list expo
pnpm list typescript

# Tester la compilation TypeScript
pnpm run typecheck
```

## 🚨 Si les Problèmes Persistent

### Solution de Secours 1: Utiliser npm
```bash
rm -rf node_modules
npm install --legacy-peer-deps
npm run web
```

### Solution de Secours 2: Versions Minimales
```bash
# Installer seulement Expo
npm install -g @expo/cli

# Créer un nouveau projet
npx create-expo-app --template blank-typescript luna-new
cd luna-new

# Copier vos fichiers src/ dans le nouveau projet
```

### Solution de Secours 3: Mode Développement Web uniquement
```bash
# Installer uniquement les dépendances web
pnpm install react react-dom react-scripts

# Lancer en mode web seulement
pnpm run web
```

## 📊 Versions Recommandées

| Package | Version Stable | Version Récente |
|---------|----------------|-----------------|
| Node.js | 18.17.0 | 20.10.0 |
| React | 18.2.0 | 18.2.0 |
| React Native | 0.76.5 | 0.76.5 |
| Expo | 52.0.0 | 52.0.0 |
| TypeScript | 5.8.3 | 5.8.3 |

## 🎯 Prochaines Étapes

1. **Tester l'installation** : `pnpm run web`
2. **Configurer Firebase** : Copier `.env.example` vers `.env`
3. **Tester les fonctionnalités** : Onboarding, authentification, etc.
4. **Lancer les tests** : `pnpm test` (une fois l'app stable)

---

*Guide de correction v1.0 - Janvier 2025*