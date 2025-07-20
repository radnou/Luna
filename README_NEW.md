# 🌙 Luna - Journal Intime Intelligent

> Une application de journaling intelligent conçue pour accompagner les jeunes femmes dans leur bien-être émotionnel et leur croissance personnelle.

[![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_52-000020?style=flat-square&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)

## 🌟 Aperçu

Luna est plus qu'un simple journal - c'est votre compagne de croissance personnelle qui combine:

- 📖 **Journaling Intelligent** - Éditeur riche avec analyse d'émotions
- 😊 **Suivi d'Humeur** - 9 niveaux d'émotions avec analytics détaillés  
- 💬 **IA Bienveillante** - Support émotionnel personnalisé
- 💕 **Gestion des Relations** - Tracker la santé de vos relations
- 📊 **Insights Personnalisés** - Découvrez vos patterns émotionnels
- 🔒 **100% Privé** - Vos données sont cryptées et sécurisées

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Expo CLI (`npm install -g expo`)
- iOS Simulator (Mac) ou Android Studio

### Installation

```bash
# Cloner le repository
git clone https://github.com/yourusername/luna.git
cd luna

# Installer les dépendances
cd luna-app
npm install

# Configuration Firebase
cp .env.example .env
# Ajouter vos clés Firebase dans .env

# Lancer l'application
npm start
```

### Scripts Disponibles

```bash
npm start          # Lance Expo
npm run ios        # Lance sur iOS
npm run android    # Lance sur Android  
npm run web        # Lance version web
npm run typecheck  # Vérifie les types TypeScript
npm run lint       # Lint le code
npm run test       # Lance les tests
```

## 🏗️ Architecture

```
luna/
├── luna-app/              # Application React Native
│   ├── app/              # Écrans et navigation (Expo Router)
│   ├── src/              
│   │   ├── components/   # Composants UI réutilisables
│   │   ├── contexts/     # État global (Context API)
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # Logique métier & API
│   │   ├── styles/       # Thème et styles globaux
│   │   ├── types/        # Types TypeScript
│   │   └── utils/        # Fonctions utilitaires
│   └── assets/           # Images, fonts, etc.
├── firebase/             # Configuration Firebase
│   ├── functions/        # Cloud Functions
│   └── firestore.rules   # Règles de sécurité
└── docs/                 # Documentation
```

## 🛠️ Stack Technique

### Frontend
- **React Native 0.76** - Framework mobile
- **Expo SDK 52** - Outils et APIs natives
- **TypeScript** - Typage statique
- **Expo Router** - Navigation basée sur les fichiers
- **React Native Web** - Support web
- **React Native Reanimated** - Animations fluides

### Backend
- **Firebase Auth** - Authentification
- **Cloud Firestore** - Base de données temps réel
- **Cloud Storage** - Stockage de fichiers
- **Cloud Functions** - Logique serveur
- **Vertex AI (Gemini)** - IA conversationnelle

### Outils
- **ESLint & Prettier** - Qualité du code
- **Jest** - Tests unitaires
- **GitHub Actions** - CI/CD
- **Sentry** - Monitoring d'erreurs

## 📚 Documentation

- 📖 [Guide Utilisateur](./GUIDE_UTILISATEUR.md) - Comment utiliser Luna
- 🔧 [Cours Technique](./COURS_TECHNIQUE.md) - Architecture et développement
- 🧠 [Approche Thérapeutique](./APPROCHE_THERAPEUTIQUE.md) - Fondements psychologiques
- 🚀 [Roadmap](./DEVELOPMENT_ROADMAP.md) - Fonctionnalités futures

## 🌈 Fonctionnalités Principales

### Journal Intelligent
- Éditeur de texte riche
- Tags et catégories
- Attachement de photos
- Sauvegarde automatique
- Recherche avancée

### Suivi d'Humeur
- 9 niveaux d'émotions
- Check-in rapide quotidien
- Graphiques de tendances
- Détection de patterns
- Rappels personnalisés

### IA Bienveillante
- Écoute sans jugement
- Support émotionnel adapté
- Suggestions d'exercices
- Méditations guidées
- Orientation vers des ressources

### Gestion des Relations
- Types variés (romantique, amitié, famille)
- Suivi de la santé relationnelle
- Notes et historique
- Intégration avec le journal
- Insights relationnels

## 🔐 Sécurité & Confidentialité

- **Chiffrement** - Toutes les données sont cryptées
- **Authentification** - Multi-facteurs disponible
- **Biométrie** - Touch/Face ID supportés
- **RGPD** - Conforme aux régulations
- **Export** - Vos données vous appartiennent

## 🤝 Contribution

Nous accueillons les contributions! Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour:

- Code de conduite
- Guide de style
- Process de PR
- Architecture decisions

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

## 🙏 Remerciements

- L'équipe React Native & Expo
- La communauté Firebase
- Tous nos beta testeurs
- Les experts en santé mentale consultés

## 📞 Contact

- **Email**: contact@luna-app.com
- **Twitter**: [@luna_app](https://twitter.com/luna_app)
- **Instagram**: [@luna_app](https://instagram.com/luna_app)
- **Support**: support@luna-app.com

---

<div align="center">
  <p>Fait avec 💜 pour le bien-être mental</p>
  <p>© 2025 Luna. Tous droits réservés.</p>
</div>