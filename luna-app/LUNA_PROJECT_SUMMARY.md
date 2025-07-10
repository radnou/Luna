# 🌙 LUNA - Application de Journaling Relationnel avec IA Bienveillante

## 📋 Vue d'Ensemble du Projet

Luna est une application mobile de journaling innovante conçue spécialement pour les jeunes femmes (18-30 ans) qui souhaitent comprendre et améliorer leurs relations personnelles grâce à l'intelligence artificielle bienveillante.

### 🎯 Concept Principal
- **Journaling des relations et ex-partners** avec suivi émotionnel
- **IA bienveillante nommée Luna** pour conseils personnalisés
- **Design girly et moderne** inspiré des tendances 2025
- **Développement personnel** axé sur la croissance relationnelle

### 🚀 Technologies Utilisées
- **Frontend**: Expo SDK 52 + React Native 0.76 + TypeScript
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **IA**: OpenAI GPT-4 / Claude API
- **State Management**: Zustand + React Query
- **Navigation**: Expo Router
- **Design**: React Native (styles custom + gradients)

## 🎨 Design System Luna

### Palette de Couleurs Girly 2025
- **Primaire**: #E8B4F3 (Lavande Rose)
- **Secondaire**: #FF6B9D (Rose Corail)
- **Accent**: #FFC75F (Or Lunaire)
- **Support**: #C7CEEA (Pervenche Douce)
- **Neutres**: #FAFAFA, #2D3436, #636E72

### Typographie
- **Headers**: Comfortaa (arrondie, moderne)
- **Body**: Inter (lisibilité optimale)
- **Accents**: Pacifico (citations inspirantes)

### Composants Signature
- **LunaButton**: Boutons avec gradients et haptics
- **LunaCard**: Cartes avec coins arrondis et blur effects
- **LunaChatBubble**: Bulles de chat avec design girly
- **LunaInput**: Inputs modernes avec floating labels
- **MoodSelector**: Sélecteur d'humeur avec 5 niveaux colorés

## 📱 Fonctionnalités Principales

### 1. Onboarding Flow (6 Étapes)
- **Welcome**: Présentation avec animation constellation
- **Goals**: Sélection objectifs (guérison, compréhension, croissance)
- **Personality**: Quiz personnalité relationnelle (5-6 questions)
- **Preferences**: Notifications, thème, privacy settings
- **Profile**: Nom, âge, photo optionnelle
- **Complete**: Animation celebration avec confettis

### 2. Authentification Multi-Méthodes
- **Email/Password** avec validation sécurisée
- **Google Sign-In** intégration native
- **Apple Sign-In** (iOS) avec fallback web
- **Authentification biométrique** (Face ID/Touch ID)
- **Session persistence** sécurisée

### 3. Journaling Avancé
- **Rich text editor** avec support markdown
- **Upload de photos** (max 5 par entrée) avec compression
- **Mood tracking** (5 niveaux avec couleurs girly)
- **Tags system** personnalisable (ex, crush, bestie, famille)
- **Auto-save** des brouillons
- **Timeline et calendar views**
- **Search et filtres** avancés
- **Analytics des patterns d'humeur**

### 4. Luna - IA Bienveillante
- **Personnalité cohérente**: Amicale, encourageante, expertise relations
- **Context awareness**: Analyse du journal pour conseils personnalisés
- **Chat en temps réel** avec typing indicators
- **Quick replies** contextuelles
- **Crisis detection** avec ressources d'aide
- **Daily check-ins** automatiques
- **Insights patterns** relationnels

### 5. Features Avancées
- **Photo management** avec thumbnails et CDN
- **Export conversations** et entrées
- **Notifications push** intelligentes
- **Thèmes clair/sombre** adaptatifs
- **RGPD compliance** complète
- **Offline support** avec synchronisation

## 🏗️ Architecture Technique

### Structure du Projet
```
luna-app/
├── app/                    # Expo Router navigation
│   ├── (auth)/            # Authentication screens
│   ├── (onboarding)/      # Onboarding flow
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   ├── services/          # Business logic services
│   ├── contexts/          # React contexts
│   ├── styles/            # Design system
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── assets/                # Images, fonts, animations
├── functions/             # Firebase Cloud Functions
└── firestore/             # Database rules and indexes
```

### Services Principaux
- **AuthService**: Gestion authentification complète
- **JournalService**: CRUD entrées avec photos
- **AIService**: Intégration OpenAI/Claude pour Luna
- **ChatService**: Gestion conversations temps réel
- **MediaService**: Upload/compression images
- **LunaInsightsService**: Analyse patterns et conseils

### Navigation Architecture
- **Auth Stack**: Login, Register, Reset Password
- **Onboarding Stack**: 6 étapes guidées
- **Main Tabs**: Journal, Chat, Insights, Profile
- **Modal Stacks**: Settings, Privacy, Entry Details

## 🔐 Sécurité & Privacy

### Mesures de Sécurité
- **Chiffrement** des conversations sensibles
- **Firestore rules** restrictives par utilisateur
- **Storage rules** avec validation de fichiers
- **Rate limiting** pour APIs IA
- **Content filtering** pour sécurité
- **Biometric auth** pour accès rapide sécurisé

### Conformité RGPD
- **Consentement explicite** pour data processing
- **Export de données** complet
- **Suppression de compte** avec cascade
- **Transparence** sur l'utilisation des données
- **Droit à l'oubli** respecté

## 📊 Métriques de Développement

### Temps de Développement Estimé
- **Total**: ~370 heures (10-11 semaines)
- **Phase 1 - Base**: 80h (MVP structure)
- **Phase 2 - Features**: 120h (Journal + Auth)
- **Phase 3 - IA**: 70h (Luna chat)
- **Phase 4 - Polish**: 60h (Animations, optimisations)
- **Phase 5 - Deploy**: 40h (Production, tests)

### Architecture Scalable
- **Modulaire**: Services découplés
- **Type-safe**: TypeScript strict
- **Performance**: Lazy loading, caching intelligent
- **Maintenance**: Code documenté, patterns cohérents

## 🚀 Prochaines Étapes

### Phase Immédiate
1. **Configuration Firebase** complète (clés API)
2. **Tests utilisateur** sur MVP
3. **Optimisation performance** (bundling, images)
4. **App Store preparation** (icons, screenshots)

### Évolutions Futures
- **Version web** (React)
- **Notifications intelligentes** basées sur l'IA
- **Communauté** (partage anonyme d'insights)
- **Intégrations** (calendrier, Spotify pour mood)
- **Analytics avancées** (ML pour pattern detection)

## 💰 Modèle Économique

### Freemium
- **Gratuit**: 10 entrées/mois, chat Luna limité
- **Premium** (9.99€/mois): Illimité + insights avancés
- **Annual** (79.99€/an): Économie 33% + features exclusives

### Coûts Opérationnels
- **Firebase**: ~50-200€/mois selon usage
- **IA APIs**: ~100-500€/mois selon volume
- **App Store fees**: 99€/an Apple + 25$ Google

## 🎉 Conclusion

Luna représente une application de nouvelle génération qui combine:
- **Technologie moderne** (Expo, Firebase, IA)
- **Design centré utilisateur** (girly, accessible, engageant)
- **Intelligence artificielle bienveillante** (Luna comme vraie amie)
- **Développement personnel** (croissance relationnelle)

L'app est architecturée pour être **scalable**, **maintenir**, et **centrée sur la privacy** tout en offrant une expérience utilisateur exceptionnelle pour accompagner les jeunes femmes dans leur parcours relationnel.

---

*Créée avec 💕 par l'équipe Luna - Votre compagne IA pour un développement relationnel épanouissant*