# Architecture des Services - Luna App

## Vue d'ensemble

Cette documentation détaille l'architecture des services pour l'application Luna. Chaque service est conçu pour être modulaire, testable et réutilisable.

## 1. Service d'Authentification (AuthService)

### Responsabilités
- Gestion de l'authentification Firebase
- Login/Signup avec email, Google, Apple
- Gestion des sessions
- Réinitialisation de mot de passe
- Suppression de compte

### Méthodes principales
```typescript
interface IAuthService {
  // Auth state
  getCurrentUser(): User | null;
  isAuthenticated(): boolean;
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
  
  // Sign in methods
  signInWithEmail(email: string, password: string): Promise<User>;
  signInWithGoogle(): Promise<User>;
  signInWithApple(): Promise<User>;
  
  // Sign up
  signUpWithEmail(data: SignUpData): Promise<User>;
  
  // Session management
  signOut(): Promise<void>;
  refreshToken(): Promise<void>;
  
  // Account management
  resetPassword(email: string): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  deleteAccount(password?: string): Promise<void>;
  
  // Profile
  updateProfile(data: UpdateProfileData): Promise<void>;
  uploadProfilePhoto(file: File): Promise<string>;
}
```

### Gestion des erreurs
```typescript
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public originalError?: any
  ) {
    super(message);
  }
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'auth/invalid-credentials',
  USER_NOT_FOUND = 'auth/user-not-found',
  EMAIL_ALREADY_EXISTS = 'auth/email-already-exists',
  WEAK_PASSWORD = 'auth/weak-password',
  NETWORK_ERROR = 'auth/network-error',
  REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login',
}
```

## 2. Service Journal (JournalService)

### Responsabilités
- CRUD des entrées journal
- Gestion des photos et médias
- Recherche et filtrage
- Analyse d'entrées
- Export de données

### Méthodes principales
```typescript
interface IJournalService {
  // CRUD operations
  createEntry(data: CreateEntryData): Promise<JournalEntry>;
  updateEntry(id: string, data: UpdateEntryData): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  getEntry(id: string): Promise<JournalEntry>;
  
  // Listing & search
  getEntries(options?: GetEntriesOptions): Promise<PaginatedResult<JournalEntry>>;
  searchEntries(query: string, filters?: SearchFilters): Promise<JournalEntry[]>;
  getEntriesByMood(mood: MoodType, limit?: number): Promise<JournalEntry[]>;
  getEntriesByRelationship(relationshipId: string): Promise<JournalEntry[]>;
  
  // Media management
  uploadPhotos(entryId: string, files: File[]): Promise<PhotoAttachment[]>;
  deletePhoto(entryId: string, photoId: string): Promise<void>;
  uploadVoiceNote(entryId: string, audioBlob: Blob): Promise<VoiceAttachment>;
  
  // Favorites & pins
  toggleFavorite(entryId: string): Promise<void>;
  togglePin(entryId: string): Promise<void>;
  getFavorites(): Promise<JournalEntry[]>;
  getPinned(): Promise<JournalEntry[]>;
  
  // Analytics
  getEntryStats(userId: string, period?: StatsPeriod): Promise<EntryStatistics>;
  getMoodTrends(userId: string, days: number): Promise<MoodTrend[]>;
  
  // AI Integration
  requestAIAnalysis(entryId: string): Promise<AIAnalysis>;
  regenerateAnalysis(entryId: string): Promise<AIAnalysis>;
  
  // Export
  exportEntries(format: 'json' | 'pdf', options?: ExportOptions): Promise<DataExport>;
}
```

### Options et filtres
```typescript
interface GetEntriesOptions {
  limit?: number;
  startAfter?: string;
  orderBy?: 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

interface SearchFilters {
  mood?: MoodType[];
  emotions?: string[];
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  hasPhotos?: boolean;
  hasAnalysis?: boolean;
  relationshipId?: string;
  isPrivate?: boolean;
}
```

## 3. Service IA (AIService)

### Responsabilités
- Communication avec OpenAI/Claude
- Analyse de texte et sentiments
- Détection de patterns
- Chat conversationnel
- Génération de suggestions

### Méthodes principales
```typescript
interface IAIService {
  // Entry analysis
  analyzeEntry(entry: JournalEntry): Promise<AIAnalysis>;
  detectPatterns(entries: JournalEntry[]): Promise<PatternDetection[]>;
  generateSummary(entries: JournalEntry[], period: string): Promise<string>;
  
  // Chat functionality
  startConversation(context?: ConversationContext): Promise<Conversation>;
  sendMessage(conversationId: string, message: string): Promise<ChatMessage>;
  getConversationSuggestions(conversationId: string): Promise<string[]>;
  
  // Insights generation
  generateInsights(userId: string, period: InsightPeriod): Promise<UserInsights>;
  generateRelationshipReport(relationshipId: string): Promise<RelationshipReport>;
  
  // Recommendations
  getPersonalizedSuggestions(userId: string): Promise<AISuggestion[]>;
  getReflectionQuestions(entry: JournalEntry): Promise<ReflectionQuestion[]>;
  
  // Text analysis
  extractThemes(text: string): Promise<Theme[]>;
  analyzeSentiment(text: string): Promise<SentimentScore>;
  detectEmotions(text: string): Promise<EmotionAnalysis[]>;
  
  // Safety
  moderateContent(text: string): Promise<ModerationResult>;
  detectCrisisSignals(entry: JournalEntry): Promise<CrisisDetection>;
}
```

### Configuration IA
```typescript
interface AIConfig {
  model: 'gpt-4' | 'claude-3' | 'balanced';
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  safetyLevel: 'strict' | 'moderate' | 'minimal';
}
```

## 4. Service de Stockage (StorageService)

### Responsabilités
- Upload de fichiers vers Firebase Storage
- Gestion des photos et médias
- Compression et optimisation
- Génération de thumbnails
- Nettoyage des fichiers orphelins

### Méthodes principales
```typescript
interface IStorageService {
  // Upload
  uploadImage(file: File, path: string): Promise<UploadResult>;
  uploadImages(files: File[], basePath: string): Promise<UploadResult[]>;
  uploadAudio(blob: Blob, path: string): Promise<UploadResult>;
  
  // Processing
  compressImage(file: File, options?: CompressionOptions): Promise<File>;
  generateThumbnail(imageUrl: string, size?: ThumbnailSize): Promise<string>;
  generateBlurhash(imageUrl: string): Promise<string>;
  
  // Management
  deleteFile(path: string): Promise<void>;
  deleteFiles(paths: string[]): Promise<void>;
  getFileMetadata(path: string): Promise<FileMetadata>;
  
  // URLs
  getDownloadUrl(path: string): Promise<string>;
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;
  
  // Cleanup
  cleanupOrphanedFiles(userId: string): Promise<CleanupResult>;
  calculateUserStorage(userId: string): Promise<StorageUsage>;
}
```

## 5. Service de Notifications (NotificationService)

### Responsabilités
- Gestion des push notifications
- Scheduling de rappels
- Notifications in-app
- Gestion des préférences
- Analytics de notifications

### Méthodes principales
```typescript
interface INotificationService {
  // Setup
  requestPermission(): Promise<boolean>;
  registerDevice(token: string): Promise<void>;
  unregisterDevice(): Promise<void>;
  
  // Sending
  sendNotification(userId: string, notification: NotificationPayload): Promise<void>;
  scheduleNotification(userId: string, notification: ScheduledNotification): Promise<string>;
  cancelScheduledNotification(notificationId: string): Promise<void>;
  
  // Reminders
  setupDailyReminder(userId: string, time: string): Promise<void>;
  updateReminderSettings(userId: string, settings: ReminderSettings): Promise<void>;
  pauseReminders(userId: string, until?: Date): Promise<void>;
  
  // In-app
  showInAppNotification(notification: InAppNotification): void;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  
  // History
  getNotificationHistory(userId: string, limit?: number): Promise<Notification[]>;
  clearHistory(userId: string): Promise<void>;
  
  // Analytics
  trackOpen(notificationId: string): Promise<void>;
  trackAction(notificationId: string, action: string): Promise<void>;
}
```

## 6. Service de Relations (RelationshipService)

### Responsabilités
- Gestion des profils de partenaires
- Tracking des red/green flags
- Timeline de relations
- Analyse de compatibilité

### Méthodes principales
```typescript
interface IRelationshipService {
  // CRUD
  createRelationship(data: CreateRelationshipData): Promise<Relationship>;
  updateRelationship(id: string, data: UpdateRelationshipData): Promise<void>;
  archiveRelationship(id: string): Promise<void>;
  deleteRelationship(id: string): Promise<void>;
  
  // Listing
  getRelationships(userId: string, includeArchived?: boolean): Promise<Relationship[]>;
  getActiveRelationships(userId: string): Promise<Relationship[]>;
  getRelationship(id: string): Promise<Relationship>;
  
  // Flags management
  addRedFlag(relationshipId: string, flag: RedFlag): Promise<void>;
  addGreenFlag(relationshipId: string, flag: GreenFlag): Promise<void>;
  updateFlag(relationshipId: string, flagId: string, data: any): Promise<void>;
  removeFlag(relationshipId: string, flagId: string): Promise<void>;
  
  // Boundaries
  setBoundary(relationshipId: string, boundary: Boundary): Promise<void>;
  recordBoundaryViolation(boundaryId: string, violation: BoundaryViolation): Promise<void>;
  
  // Timeline
  addMemory(relationshipId: string, memory: Memory): Promise<void>;
  addMilestone(relationshipId: string, milestone: Milestone): Promise<void>;
  getTimeline(relationshipId: string): Promise<TimelineEvent[]>;
  
  // Analysis
  analyzeRelationship(relationshipId: string): Promise<RelationshipAnalysis>;
  compareRelationships(ids: string[]): Promise<ComparisonReport>;
  detectPatterns(userId: string): Promise<RelationshipPattern[]>;
}
```

## 7. Service Analytics (AnalyticsService)

### Responsabilités
- Tracking des événements utilisateur
- Métriques de performance
- Analyse comportementale
- Rapports d'usage

### Méthodes principales
```typescript
interface IAnalyticsService {
  // Event tracking
  trackEvent(event: string, properties?: Record<string, any>): void;
  trackScreen(screenName: string, properties?: Record<string, any>): void;
  
  // User properties
  setUserProperty(name: string, value: string | number | boolean): void;
  setUserProperties(properties: Record<string, any>): void;
  
  // Custom events
  trackJournalEntry(entry: JournalEntry): void;
  trackMoodChange(from: MoodType, to: MoodType): void;
  trackAIInteraction(type: string, context?: any): void;
  trackFeatureUsage(feature: string, duration?: number): void;
  
  // Performance
  startTrace(name: string): PerformanceTrace;
  recordMetric(name: string, value: number): void;
  
  // Conversion
  trackSignup(method: string): void;
  trackSubscription(plan: string, revenue?: number): void;
  trackRetention(day: number): void;
}
```

## 8. Service de Synchronisation (SyncService)

### Responsabilités
- Synchronisation offline/online
- Résolution de conflits
- Queue de synchronisation
- État de synchronisation

### Méthodes principales
```typescript
interface ISyncService {
  // Sync management
  startSync(): Promise<void>;
  stopSync(): void;
  forceSync(): Promise<SyncResult>;
  
  // Queue management
  addToQueue(action: SyncAction): void;
  processQueue(): Promise<void>;
  getQueueStatus(): QueueStatus;
  clearQueue(): void;
  
  // Conflict resolution
  resolveConflict(conflict: SyncConflict): Promise<void>;
  setConflictStrategy(strategy: ConflictStrategy): void;
  
  // Status
  getSyncStatus(): SyncStatus;
  getLastSyncTime(): Date | null;
  onSyncStatusChange(callback: (status: SyncStatus) => void): Unsubscribe;
  
  // Data management
  getCachedData<T>(key: string): T | null;
  setCachedData<T>(key: string, data: T): void;
  clearCache(): void;
}
```

## 9. Service de Sécurité (SecurityService)

### Responsabilités
- Chiffrement des données sensibles
- Authentification biométrique
- Gestion des sessions
- Audit de sécurité

### Méthodes principales
```typescript
interface ISecurityService {
  // Encryption
  encrypt(data: string, key?: string): Promise<string>;
  decrypt(encryptedData: string, key?: string): Promise<string>;
  generateKey(): string;
  
  // Biometric
  isBiometricAvailable(): Promise<boolean>;
  authenticateWithBiometric(reason: string): Promise<boolean>;
  enableBiometricLock(): Promise<void>;
  disableBiometricLock(): Promise<void>;
  
  // Session
  startSession(): void;
  extendSession(): void;
  endSession(): void;
  isSessionActive(): boolean;
  getSessionTimeout(): number;
  
  // Security checks
  validatePassword(password: string): PasswordValidation;
  checkDataBreaches(email: string): Promise<boolean>;
  auditSecuritySettings(): Promise<SecurityAudit>;
  
  // Privacy
  anonymizeData(data: any): any;
  redactSensitiveInfo(text: string): string;
}
```

## 10. Service d'Export (ExportService)

### Responsabilités
- Export de données utilisateur
- Génération de PDFs
- Export CSV/JSON
- Conformité RGPD

### Méthodes principales
```typescript
interface IExportService {
  // Export creation
  createExport(userId: string, options: ExportOptions): Promise<DataExport>;
  getExportStatus(exportId: string): Promise<ExportStatus>;
  downloadExport(exportId: string): Promise<Blob>;
  
  // Formats
  exportToPDF(data: ExportData, template?: PDFTemplate): Promise<Blob>;
  exportToJSON(data: ExportData): Promise<Blob>;
  exportToCSV(data: ExportData): Promise<Blob>;
  
  // GDPR compliance
  exportAllUserData(userId: string): Promise<DataExport>;
  deleteAllUserData(userId: string): Promise<void>;
  
  // Templates
  generateMonthlyReport(userId: string, month: Date): Promise<Blob>;
  generateRelationshipReport(relationshipId: string): Promise<Blob>;
  generateInsightsReport(userId: string, period: string): Promise<Blob>;
}
```

## Architecture de Communication

### 1. Entre Services
```typescript
// Service Registry Pattern
class ServiceRegistry {
  private static services: Map<string, any> = new Map();
  
  static register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }
  
  static get<T>(name: string): T {
    return this.services.get(name);
  }
}

// Usage
ServiceRegistry.register('auth', new AuthService());
ServiceRegistry.register('journal', new JournalService());

// Dans un service
const authService = ServiceRegistry.get<IAuthService>('auth');
```

### 2. Event Bus
```typescript
// Pour la communication découplée
class EventBus {
  private static instance: EventBus;
  private events: Map<string, Set<EventHandler>> = new Map();
  
  emit(event: string, data?: any): void {
    const handlers = this.events.get(event);
    handlers?.forEach(handler => handler(data));
  }
  
  on(event: string, handler: EventHandler): Unsubscribe {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
    
    return () => {
      this.events.get(event)?.delete(handler);
    };
  }
}
```

### 3. Error Handling
```typescript
// Base error class
export abstract class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific errors
export class NetworkError extends ServiceError {
  constructor(message: string, originalError?: any) {
    super('NETWORK_ERROR', message, 503, originalError);
  }
}

export class ValidationError extends ServiceError {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super('VALIDATION_ERROR', message, 400);
  }
}
```

### 4. Intercepteurs
```typescript
// Pour logging, auth, etc.
interface ServiceInterceptor {
  onRequest?(config: any): any;
  onResponse?(response: any): any;
  onError?(error: any): any;
}

class AuthInterceptor implements ServiceInterceptor {
  async onRequest(config: any) {
    const token = await AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
}
```

## Tests

### Structure de tests
```typescript
// Exemple de test pour JournalService
describe('JournalService', () => {
  let service: JournalService;
  let mockFirestore: any;
  
  beforeEach(() => {
    mockFirestore = createMockFirestore();
    service = new JournalService(mockFirestore);
  });
  
  describe('createEntry', () => {
    it('should create a new journal entry', async () => {
      const data = {
        content: 'Test entry',
        mood: 'good' as MoodType,
        moodIntensity: 4
      };
      
      const entry = await service.createEntry(data);
      
      expect(entry).toBeDefined();
      expect(entry.content).toBe(data.content);
      expect(entry.mood).toBe(data.mood);
    });
    
    it('should handle photo uploads', async () => {
      // Test implementation
    });
  });
});
```

## Performance

### Optimisations
1. **Caching**: Utilisation de React Query pour le cache côté client
2. **Pagination**: Chargement progressif des données
3. **Debouncing**: Pour les recherches et sauvegardes automatiques
4. **Lazy loading**: Chargement à la demande des services
5. **Compression**: Images et données avant upload

### Monitoring
```typescript
interface PerformanceMetrics {
  service: string;
  method: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  static async measure<T>(
    service: string,
    method: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await operation();
      this.record({
        service,
        method,
        duration: performance.now() - start,
        timestamp: new Date(),
        success: true
      });
      return result;
    } catch (error) {
      this.record({
        service,
        method,
        duration: performance.now() - start,
        timestamp: new Date(),
        success: false,
        error: error.message
      });
      throw error;
    }
  }
}
```

## Sécurité

### Principes
1. **Principe du moindre privilège**: Chaque service n'a accès qu'aux données nécessaires
2. **Validation des entrées**: Toutes les données utilisateur sont validées
3. **Sanitization**: Nettoyage des données avant stockage
4. **Encryption**: Données sensibles chiffrées
5. **Audit trail**: Logging des actions sensibles

### Implémentation
```typescript
// Decorator pour la validation
function Validate(schema: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const validation = schema.validate(args[0]);
      if (validation.error) {
        throw new ValidationError(validation.error.message);
      }
      return originalMethod.apply(this, args);
    };
  };
}

// Usage
class JournalService {
  @Validate(CreateEntrySchema)
  async createEntry(data: CreateEntryData) {
    // Implementation
  }
}
```

Cette architecture de services fournit une base solide et scalable pour l'application Luna, avec une séparation claire des responsabilités et une approche modulaire facilitant la maintenance et l'évolution.