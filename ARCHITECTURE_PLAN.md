# Plan d'Architecture Complète - Application Luna

## 1. Vue d'Ensemble

### 1.1 Concept
- **Application**: Journaling intelligent pour relations amoureuses et ex-partners
- **Cible**: Jeunes femmes 18-30 ans
- **Mission**: Aider les utilisatrices à comprendre leurs patterns relationnels et grandir émotionnellement
- **Différenciateurs**: IA bienveillante, analyse de patterns, conseils personnalisés, design apaisant

### 1.2 Stack Technique
```yaml
Frontend:
  - Expo SDK 52+
  - React Native 0.76+
  - TypeScript
  - Expo Router v4
  
Backend:
  - Firebase Auth
  - Cloud Firestore
  - Firebase Storage
  - Cloud Functions (Node.js)
  
IA & Analytics:
  - OpenAI GPT-4
  - Claude 3 (Anthropic)
  - Firebase Analytics
  
State Management:
  - Zustand (recommandé)
  - React Query (data fetching)
```

## 2. Architecture Fonctionnelle

### 2.1 Features Principales (MVP)

#### Phase 1 - Core (2-3 semaines)
1. **Onboarding Flow**
   - Splash screen animé
   - Tutoriel interactif (3-4 écrans)
   - Création de compte (email, Google, Apple)
   - Setup profil initial
   - Préférences de journaling
   - Permissions (notifications, photos)

2. **Authentication & Profil**
   - Login/Signup multi-méthodes
   - Gestion profil utilisateur
   - Préférences et paramètres
   - Photo de profil
   - Suppression de compte RGPD

3. **Journal Entries**
   - Création d'entrées avec mood tracker
   - Ajout de photos (max 5)
   - Tags et catégories
   - Recherche et filtres
   - Vue calendrier
   - Édition et suppression

#### Phase 2 - IA & Insights (3-4 semaines)
4. **IA Assistant (Luna)**
   - Chat conversationnel
   - Analyse des entrées journal
   - Détection de patterns
   - Conseils personnalisés
   - Questions de réflexion
   - Résumés hebdomadaires

5. **Relationships Tracking**
   - Profils de partners/ex
   - Timeline de relation
   - Red flags tracking
   - Compatibility insights
   - Closure tools

6. **Analytics & Insights**
   - Dashboard personnel
   - Graphiques d'évolution
   - Patterns identifiés
   - Mood statistics
   - Export PDF mensuel

#### Phase 3 - Engagement (2-3 semaines)
7. **Notifications & Reminders**
   - Rappels de journaling
   - Citations inspirantes
   - Check-ins émotionnels
   - Célébration de milestones

8. **Content & Resources**
   - Articles éducatifs
   - Exercices guidés
   - Méditations audio
   - Community stories (anonymes)

### 2.2 Features Futures
- Intégration thérapie en ligne
- Groupes de support privés
- Challenges de croissance
- Intégration wearables (mood)
- Voice journaling
- Backup chiffré

## 3. Architecture Technique

### 3.1 Structure de Navigation (Expo Router)

```typescript
app/
├── (auth)/
│   ├── _layout.tsx         # Stack navigator pour auth
│   ├── login.tsx
│   ├── signup.tsx
│   └── forgot-password.tsx
├── (onboarding)/
│   ├── _layout.tsx         # Stack avec progress bar
│   ├── welcome.tsx
│   ├── tutorial/[step].tsx
│   ├── profile-setup.tsx
│   └── permissions.tsx
├── (tabs)/
│   ├── _layout.tsx         # Bottom tabs
│   ├── journal/
│   │   ├── _layout.tsx     # Stack dans tab
│   │   ├── index.tsx       # Liste entries
│   │   ├── new.tsx         # Nouvelle entrée
│   │   └── [id].tsx        # Détail entrée
│   ├── chat/
│   │   ├── index.tsx       # Chat avec Luna
│   │   └── history.tsx     # Historique conversations
│   ├── insights/
│   │   ├── index.tsx       # Dashboard
│   │   ├── patterns.tsx
│   │   └── relationships.tsx
│   └── profile/
│       ├── index.tsx
│       ├── settings.tsx
│       └── preferences.tsx
├── +not-found.tsx
└── _layout.tsx            # Root layout
```

### 3.2 Organisation du Code

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingState.tsx
│   ├── journal/
│   │   ├── EntryCard.tsx
│   │   ├── MoodPicker.tsx
│   │   ├── PhotoGallery.tsx
│   │   └── TagSelector.tsx
│   ├── chat/
│   │   ├── MessageBubble.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── SuggestionChips.tsx
│   └── insights/
│       ├── MoodChart.tsx
│       ├── PatternCard.tsx
│       └── RelationshipTimeline.tsx
├── services/
│   ├── api/
│   │   ├── auth.service.ts
│   │   ├── journal.service.ts
│   │   ├── ai.service.ts
│   │   └── analytics.service.ts
│   ├── storage/
│   │   ├── secure-storage.ts
│   │   └── media-upload.ts
│   └── notifications/
│       └── push-notifications.ts
├── stores/
│   ├── auth.store.ts
│   ├── journal.store.ts
│   ├── chat.store.ts
│   └── ui.store.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useJournal.ts
│   ├── useChat.ts
│   └── useOffline.ts
├── utils/
│   ├── constants.ts
│   ├── validators.ts
│   ├── formatters.ts
│   └── encryption.ts
├── types/
│   ├── models.ts
│   ├── api.ts
│   └── navigation.ts
└── theme/
    ├── colors.ts
    ├── typography.ts
    ├── spacing.ts
    └── components.ts
```

### 3.3 Modèles de Données

```typescript
// User Model
interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  onboardingCompleted: boolean;
  preferences: UserPreferences;
  subscription: SubscriptionStatus;
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}

interface UserPreferences {
  journalReminders: ReminderSettings;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  privacySettings: PrivacySettings;
}

// Journal Entry Model
interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  mood: MoodType;
  moodIntensity: number; // 1-5
  photos: PhotoAttachment[];
  tags: string[];
  relationshipId?: string;
  aiInsights?: AIAnalysis;
  isPrivate: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface PhotoAttachment {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  uploadedAt: Timestamp;
}

// AI Analysis Model
interface AIAnalysis {
  summary: string;
  sentiment: SentimentScore;
  themes: string[];
  patterns: PatternDetection[];
  suggestions: string[];
  processedAt: Timestamp;
}

// Relationship Model
interface Relationship {
  id: string;
  userId: string;
  partnerName: string;
  partnerPhoto?: string;
  type: 'romantic' | 'situationship' | 'ex' | 'crush';
  status: 'active' | 'ended' | 'paused';
  startDate?: Date;
  endDate?: Date;
  notes: string;
  redFlags: RedFlag[];
  positiveTraits: string[];
  journalEntries: string[]; // Entry IDs
  createdAt: Timestamp;
}

// Chat Model
interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: MessageAttachment[];
  timestamp: Timestamp;
}

interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  context?: ConversationContext;
  isArchived: boolean;
  createdAt: Timestamp;
  lastMessageAt: Timestamp;
}
```

### 3.4 Architecture Firestore

```
firestore/
├── users/{userId}
│   ├── details: User
│   └── preferences: UserPreferences
├── journal_entries/{entryId}
│   └── (JournalEntry document)
├── relationships/{relationshipId}
│   └── (Relationship document)
├── conversations/{conversationId}
│   ├── details: Conversation
│   └── messages/{messageId}
├── ai_analyses/{analysisId}
│   └── (AIAnalysis document)
├── user_insights/{userId}
│   ├── patterns/{patternId}
│   └── statistics/{period}
└── app_content/
    ├── articles/{articleId}
    ├── exercises/{exerciseId}
    └── quotes/{quoteId}
```

### 3.5 State Management (Zustand)

```typescript
// Auth Store
interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Journal Store
interface JournalStore {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  isLoading: boolean;
  filters: JournalFilters;
  
  fetchEntries: () => Promise<void>;
  createEntry: (data: CreateEntryData) => Promise<void>;
  updateEntry: (id: string, data: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setFilters: (filters: JournalFilters) => void;
}

// Chat Store
interface ChatStore {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isTyping: boolean;
  
  startConversation: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  archiveConversation: (id: string) => Promise<void>;
}
```

## 4. Services Architecture

### 4.1 API Services

```typescript
// Auth Service
class AuthService {
  async signInWithEmail(email: string, password: string): Promise<User>
  async signInWithGoogle(): Promise<User>
  async signInWithApple(): Promise<User>
  async signUp(data: SignupData): Promise<User>
  async signOut(): Promise<void>
  async resetPassword(email: string): Promise<void>
  async deleteAccount(): Promise<void>
}

// Journal Service
class JournalService {
  async createEntry(data: CreateEntryData): Promise<JournalEntry>
  async updateEntry(id: string, data: UpdateEntryData): Promise<void>
  async deleteEntry(id: string): Promise<void>
  async getEntries(filters?: JournalFilters): Promise<JournalEntry[]>
  async getEntry(id: string): Promise<JournalEntry>
  async uploadPhotos(files: File[]): Promise<PhotoAttachment[]>
}

// AI Service
class AIService {
  async analyzeEntry(entryId: string): Promise<AIAnalysis>
  async chatWithLuna(message: string, context?: ChatContext): Promise<string>
  async generateInsights(userId: string, period: string): Promise<UserInsights>
  async detectPatterns(entries: JournalEntry[]): Promise<Pattern[]>
}
```

### 4.2 Cloud Functions

```typescript
// Triggers
- onUserCreate: Setup initial data, send welcome email
- onEntryCreate: Queue AI analysis, update statistics
- onEntryUpdate: Re-analyze if needed
- scheduledInsights: Weekly/monthly insights generation
- scheduledBackup: User data export

// HTTP Functions
- analyzeJournalEntry
- generateCompatibilityReport
- exportUserData
- deleteUserData (RGPD)
```

## 5. Features Détaillées

### 5.1 Onboarding Flow

```
1. Splash Screen (2s)
   - Logo animation
   - Loading user state

2. Welcome Screens (Swipeable)
   - Screen 1: "Ton espace safe pour comprendre tes relations"
   - Screen 2: "Luna, ton IA bienveillante t'accompagne"
   - Screen 3: "Identifie tes patterns, grandis émotionnellement"

3. Auth Choice
   - Continue with Google
   - Continue with Apple
   - Use email instead

4. Profile Setup
   - Prénom (required)
   - Photo (optional)
   - Date de naissance (optional)
   - Pronoms (optional)

5. Preferences
   - Journal reminders time
   - Notification preferences
   - Privacy settings

6. Permissions
   - Push notifications
   - Photo library access
   - (Future: Health app for mood)

7. First Entry Prompt
   - "Commence par nous dire comment tu te sens aujourd'hui..."
```

### 5.2 Journal Entry Creation

```
1. Entry Screen
   - Mood selector (5 émojis + intensité)
   - Rich text editor
   - Photo attachment (max 5)
   - Tag suggestions basés sur le contenu
   - Relationship link (optional)
   - Privacy toggle

2. AI Analysis (Post-save)
   - Sentiment analysis
   - Theme extraction
   - Pattern detection
   - Personalized reflection questions

3. Entry Actions
   - Edit/Delete
   - Share insight (anonymized)
   - Export as image
   - Add to favorites
```

### 5.3 Chat avec Luna (IA)

```
1. Conversation Starters
   - "Comment te sens-tu aujourd'hui?"
   - "Parlons de ta dernière entrée..."
   - "As-tu remarqué des patterns?"

2. Context-Aware Responses
   - Référence aux entrées précédentes
   - Suivi des sujets discutés
   - Adaptation au style de l'utilisatrice

3. Guided Exercises
   - Réflexion guidée
   - Techniques de journaling
   - Exercices de gratitude
   - Boundary setting
```

## 6. Considérations Techniques

### 6.1 Performance

```yaml
Optimisations:
  - Lazy loading des écrans
  - Image optimization (WebP)
  - Firestore offline persistence
  - React Query caching
  - Debounced search
  - Virtual lists pour entries
  
Métriques cibles:
  - App launch: < 2s
  - Screen transition: < 300ms
  - API response: < 1s
  - Image upload: < 3s
```

### 6.2 Sécurité & Privacy

```yaml
Mesures:
  - Chiffrement bout-en-bout (entries privées)
  - Anonymisation des données analytiques
  - Secure storage pour tokens
  - Biometric lock option
  - Auto-logout après inactivité
  - HTTPS only
  - Input sanitization
  
Compliance:
  - RGPD ready
  - Data export feature
  - Account deletion
  - Consent management
```

### 6.3 Offline Support

```yaml
Features offline:
  - Lecture des entries cached
  - Création d'entries (sync later)
  - Navigation de base
  - Profil utilisateur
  
Sync strategy:
  - Queue des actions offline
  - Conflict resolution
  - Progressive sync
  - User notification
```

## 7. Plan de Développement

### Phase 1: Foundation (Semaines 1-2)
- [ ] Setup projet Expo avec TypeScript
- [ ] Configuration Firebase
- [ ] Architecture de navigation
- [ ] Design system de base
- [ ] Auth flow complet
- [ ] Profil utilisateur

### Phase 2: Core Features (Semaines 3-4)
- [ ] Journal CRUD operations
- [ ] Photo upload
- [ ] Mood tracking
- [ ] Search & filters
- [ ] Basic insights

### Phase 3: AI Integration (Semaines 5-6)
- [ ] Cloud Functions setup
- [ ] OpenAI/Claude integration
- [ ] Entry analysis
- [ ] Chat interface
- [ ] Pattern detection

### Phase 4: Polish & Launch (Semaines 7-8)
- [ ] Notifications
- [ ] Onboarding optimization
- [ ] Performance tuning
- [ ] Error handling
- [ ] Analytics setup
- [ ] Beta testing

## 8. Estimations de Complexité

```yaml
Features par complexité:

Simple (1-2 jours):
  - Splash screen
  - Basic navigation
  - Simple forms
  - Static screens

Moyen (3-5 jours):
  - Authentication flow
  - Journal entries CRUD
  - Photo upload
  - Profile management
  - Search/filters

Complexe (5-10 jours):
  - AI chat interface
  - Pattern detection
  - Insights dashboard
  - Offline sync
  - Data export

Très complexe (10+ jours):
  - End-to-end encryption
  - Advanced analytics
  - ML recommendations
  - Voice journaling
```

## 9. Métriques de Succès

```yaml
User Engagement:
  - DAU/MAU > 60%
  - Avg session: > 5 min
  - Entries/user/week: > 3
  - Retention J30: > 40%

Technical:
  - Crash rate: < 1%
  - API latency p95: < 1s
  - App store rating: > 4.5
  - Load time: < 2s

Business:
  - Conversion rate: > 5%
  - Churn rate: < 10%/month
  - NPS score: > 50
```

## 10. Risques & Mitigations

```yaml
Risques techniques:
  - API rate limits → Implement caching
  - Coûts IA élevés → Usage limits + optimization
  - Offline sync conflicts → Clear resolution strategy
  - Performance issues → Profiling + optimization

Risques produit:
  - Low engagement → Gamification elements
  - Privacy concerns → Transparent communication
  - Complex onboarding → Progressive disclosure
  - Feature creep → Strict MVP focus
```

---

Ce plan d'architecture fournit une base solide pour développer Luna. Il est conçu pour être évolutif, maintenable et centré sur l'expérience utilisateur. Les priorités sont établies pour livrer rapidement une MVP fonctionnelle tout en gardant la flexibilité pour des évolutions futures.