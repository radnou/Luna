// Core Data Models for Luna App
import { Timestamp } from 'firebase/firestore';

// ==================== USER MODELS ====================

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  pronouns?: 'she/her' | 'they/them' | 'other';
  onboardingCompleted: boolean;
  onboardingStep?: number;
  preferences: UserPreferences;
  subscription: SubscriptionStatus;
  stats: UserStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActiveAt: Timestamp;
  deletedAt?: Timestamp;
}

export interface UserPreferences {
  journalReminders: ReminderSettings;
  notificationsEnabled: boolean;
  pushTokens: PushToken[];
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  privacySettings: PrivacySettings;
  aiSettings: AIPreferences;
}

export interface ReminderSettings {
  enabled: boolean;
  time: string; // "19:00"
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[]; // 0-6 (Sun-Sat)
  timezone: string;
}

export interface PushToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: Timestamp;
}

export interface PrivacySettings {
  shareAnalytics: boolean;
  allowAIAnalysis: boolean;
  privateByDefault: boolean;
  biometricLock: boolean;
  autoLogoutMinutes?: number;
}

export interface AIPreferences {
  preferredModel: 'gpt-4' | 'claude-3' | 'balanced';
  personalityType: 'supportive' | 'challenging' | 'balanced';
  responseLength: 'concise' | 'detailed' | 'adaptive';
}

export interface SubscriptionStatus {
  type: 'free' | 'premium' | 'premium_plus';
  isActive: boolean;
  expiresAt?: Timestamp;
  renewsAt?: Timestamp;
  paymentMethod?: 'apple' | 'google' | 'stripe';
  features: SubscriptionFeatures;
}

export interface SubscriptionFeatures {
  unlimitedEntries: boolean;
  advancedAI: boolean;
  unlimitedPhotos: boolean;
  exportPDF: boolean;
  prioritySupport: boolean;
  customThemes: boolean;
}

export interface UserStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  totalPhotos: number;
  totalConversations: number;
  lastEntryAt?: Timestamp;
  moodAverage?: number;
  favoriteTime?: string;
}

// ==================== JOURNAL MODELS ====================

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  richContent?: RichContent; // For future: formatted text
  mood: MoodType;
  moodIntensity: number; // 1-5
  emotions: EmotionTag[];
  photos: PhotoAttachment[];
  voiceNote?: VoiceAttachment;
  tags: string[];
  customTags: string[];
  relationshipId?: string;
  location?: LocationData;
  weather?: WeatherData;
  aiInsights?: AIAnalysis;
  isPrivate: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  reminderSent?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp;
}

export type MoodType = 'amazing' | 'good' | 'okay' | 'difficult' | 'terrible';

export interface EmotionTag {
  emotion: string;
  intensity: number; // 1-5
  category: 'positive' | 'negative' | 'neutral';
}

export interface PhotoAttachment {
  id: string;
  url: string;
  thumbnailUrl: string;
  blurhash?: string; // For smooth loading
  width: number;
  height: number;
  size: number; // bytes
  caption?: string;
  aiDescription?: string;
  uploadedAt: Timestamp;
}

export interface VoiceAttachment {
  id: string;
  url: string;
  duration: number; // seconds
  transcript?: string;
  uploadedAt: Timestamp;
}

export interface RichContent {
  blocks: ContentBlock[];
  version: string;
}

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'quote' | 'list';
  content: string;
  attributes?: Record<string, any>;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  placeName?: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

// ==================== AI MODELS ====================

export interface AIAnalysis {
  id: string;
  entryId: string;
  summary: string;
  sentiment: SentimentScore;
  themes: Theme[];
  emotions: EmotionAnalysis[];
  patterns: PatternDetection[];
  suggestions: AISuggestion[];
  questions: ReflectionQuestion[];
  riskFactors?: RiskFactor[];
  growthIndicators?: GrowthIndicator[];
  model: 'gpt-4' | 'claude-3';
  confidence: number; // 0-1
  processedAt: Timestamp;
  version: string;
}

export interface SentimentScore {
  overall: number; // -1 to 1
  positive: number;
  negative: number;
  neutral: number;
  mixed: boolean;
}

export interface Theme {
  name: string;
  category: ThemeCategory;
  relevance: number; // 0-1
  keywords: string[];
}

export type ThemeCategory = 
  | 'relationship'
  | 'self-growth'
  | 'conflict'
  | 'achievement'
  | 'loss'
  | 'anxiety'
  | 'joy'
  | 'other';

export interface EmotionAnalysis {
  emotion: string;
  intensity: number;
  confidence: number;
  triggers?: string[];
}

export interface PatternDetection {
  type: PatternType;
  description: string;
  frequency: number;
  firstOccurrence: Timestamp;
  lastOccurrence: Timestamp;
  relatedEntries: string[];
  severity?: 'low' | 'medium' | 'high';
  suggestions?: string[];
}

export type PatternType = 
  | 'recurring_emotion'
  | 'relationship_cycle'
  | 'trigger_response'
  | 'growth_pattern'
  | 'red_flag'
  | 'coping_mechanism'
  | 'communication_style';

export interface AISuggestion {
  type: 'action' | 'reflection' | 'resource';
  content: string;
  priority: 'low' | 'medium' | 'high';
  relatedPattern?: string;
}

export interface ReflectionQuestion {
  question: string;
  purpose: string;
  category: 'self-awareness' | 'growth' | 'relationship' | 'coping';
}

export interface RiskFactor {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  resources?: string[];
}

export interface GrowthIndicator {
  area: string;
  progress: number; // 0-100
  milestone?: string;
  comparison?: string; // vs last period
}

// ==================== RELATIONSHIP MODELS ====================

export interface Relationship {
  id: string;
  userId: string;
  partnerName: string;
  partnerNickname?: string;
  partnerPhoto?: string;
  partnerDateOfBirth?: Date;
  type: RelationshipType;
  status: RelationshipStatus;
  startDate?: Date;
  endDate?: Date;
  anniversaries?: Anniversary[];
  description?: string;
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
  boundaries: Boundary[];
  communicationStyle?: CommunicationStyle;
  attachmentStyle?: AttachmentStyle;
  loveLanguages?: LoveLanguage[];
  compatibilityScore?: number;
  notes: string;
  memories: Memory[];
  milestones: Milestone[];
  journalEntries: string[]; // Entry IDs
  isArchived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type RelationshipType = 
  | 'romantic'
  | 'ex-partner'
  | 'situationship'
  | 'crush'
  | 'friend'
  | 'family';

export type RelationshipStatus = 
  | 'active'
  | 'ended'
  | 'paused'
  | 'complicated'
  | 'no-contact';

export interface Anniversary {
  date: Date;
  type: 'first-date' | 'official' | 'engagement' | 'marriage' | 'custom';
  title: string;
  recurring: boolean;
}

export interface RedFlag {
  id: string;
  type: RedFlagType;
  description: string;
  severity: 'minor' | 'moderate' | 'major';
  firstNoticed: Date;
  frequency?: 'once' | 'sometimes' | 'often' | 'always';
  examples: string[];
  resolved: boolean;
}

export type RedFlagType = 
  | 'communication'
  | 'respect'
  | 'trust'
  | 'control'
  | 'emotional'
  | 'physical'
  | 'financial'
  | 'other';

export interface GreenFlag {
  id: string;
  type: string;
  description: string;
  examples: string[];
}

export interface Boundary {
  id: string;
  type: 'personal' | 'emotional' | 'physical' | 'time' | 'digital';
  description: string;
  isRespected: boolean;
  violations?: BoundaryViolation[];
}

export interface BoundaryViolation {
  date: Date;
  description: string;
  resolved: boolean;
}

export interface Memory {
  id: string;
  date: Date;
  title: string;
  description: string;
  photos?: string[];
  mood: 'positive' | 'negative' | 'neutral' | 'mixed';
  isFavorite: boolean;
}

export interface Milestone {
  id: string;
  date: Date;
  type: string;
  title: string;
  description?: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export type CommunicationStyle = 
  | 'direct'
  | 'indirect'
  | 'passive'
  | 'aggressive'
  | 'passive-aggressive'
  | 'assertive';

export type AttachmentStyle = 
  | 'secure'
  | 'anxious'
  | 'avoidant'
  | 'anxious-avoidant';

export type LoveLanguage = 
  | 'words-of-affirmation'
  | 'quality-time'
  | 'physical-touch'
  | 'acts-of-service'
  | 'receiving-gifts';

// ==================== CHAT MODELS ====================

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: MessageAttachment[];
  referencedEntry?: string; // Journal entry ID
  suggestedActions?: SuggestedAction[];
  feedback?: MessageFeedback;
  timestamp: Timestamp;
}

export interface MessageAttachment {
  type: 'journal_entry' | 'photo' | 'pattern' | 'insight';
  id: string;
  preview?: string;
}

export interface SuggestedAction {
  type: 'journal' | 'exercise' | 'resource' | 'reflection';
  label: string;
  action: string;
  data?: any;
}

export interface MessageFeedback {
  helpful: boolean;
  rating?: number; // 1-5
  comment?: string;
  timestamp: Timestamp;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  type: ConversationType;
  messages: ChatMessage[];
  context?: ConversationContext;
  summary?: string;
  tags: string[];
  isArchived: boolean;
  isPinned: boolean;
  lastMessageAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ConversationType = 
  | 'general'
  | 'journal_analysis'
  | 'relationship_advice'
  | 'pattern_discussion'
  | 'crisis_support'
  | 'growth_planning';

export interface ConversationContext {
  mood?: MoodType;
  relationshipId?: string;
  entryIds?: string[];
  topic?: string;
  urgency?: 'low' | 'normal' | 'high';
}

// ==================== INSIGHTS MODELS ====================

export interface UserInsights {
  userId: string;
  period: InsightPeriod;
  startDate: Date;
  endDate: Date;
  moodTrends: MoodTrend[];
  emotionDistribution: EmotionDistribution;
  topThemes: Theme[];
  patterns: PatternSummary[];
  growthAreas: GrowthArea[];
  achievements: Achievement[];
  recommendations: Recommendation[];
  statistics: InsightStatistics;
  generatedAt: Timestamp;
}

export interface InsightPeriod {
  type: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  label: string;
}

export interface MoodTrend {
  date: Date;
  averageMood: number;
  entries: number;
  dominantMood: MoodType;
}

export interface EmotionDistribution {
  emotions: Record<string, number>;
  topPositive: string[];
  topNegative: string[];
  emotionalDiversity: number;
}

export interface PatternSummary {
  pattern: PatternDetection;
  occurrences: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  impact: 'positive' | 'negative' | 'neutral';
}

export interface GrowthArea {
  area: string;
  currentLevel: number; // 0-100
  previousLevel: number;
  suggestions: string[];
  relatedEntries: string[];
}

export interface Achievement {
  type: 'streak' | 'milestone' | 'breakthrough' | 'consistency';
  title: string;
  description: string;
  unlockedAt: Timestamp;
  icon?: string;
}

export interface Recommendation {
  type: 'activity' | 'reflection' | 'resource' | 'professional';
  title: string;
  description: string;
  reason: string;
  priority: number; // 1-5
  actionUrl?: string;
}

export interface InsightStatistics {
  totalEntries: number;
  averageEntriesPerWeek: number;
  totalPhotos: number;
  totalWords: number;
  longestEntry: string; // entry ID
  mostProductiveTime: string;
  streakDays: number;
}

// ==================== NOTIFICATION MODELS ====================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
  scheduledFor?: Timestamp;
  sentAt?: Timestamp;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
}

export type NotificationType = 
  | 'reminder'
  | 'insight'
  | 'achievement'
  | 'pattern_alert'
  | 'weekly_summary'
  | 'quote'
  | 'check_in';

export interface NotificationData {
  action?: string;
  entryId?: string;
  conversationId?: string;
  insightId?: string;
  deepLink?: string;
}

// ==================== CONTENT MODELS ====================

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  author: string;
  category: ArticleCategory;
  tags: string[];
  readTime: number; // minutes
  heroImage?: string;
  isPublished: boolean;
  isPremium: boolean;
  viewCount: number;
  likeCount: number;
  publishedAt: Timestamp;
  updatedAt: Timestamp;
}

export type ArticleCategory = 
  | 'relationships'
  | 'self-care'
  | 'mental-health'
  | 'communication'
  | 'boundaries'
  | 'healing'
  | 'growth';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  benefits: string[];
  materials?: string[];
  isPremium: boolean;
  completionCount: number;
  rating: number;
  createdAt: Timestamp;
}

export type ExerciseCategory = 
  | 'journaling'
  | 'meditation'
  | 'reflection'
  | 'communication'
  | 'boundary-setting'
  | 'self-compassion';

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string[];
  mood?: MoodType[];
  isFavorite: boolean;
  displayCount: number;
  lastShownAt?: Timestamp;
}

// ==================== EXPORT MODELS ====================

export interface DataExport {
  id: string;
  userId: string;
  type: 'full' | 'journal' | 'insights' | 'conversations';
  format: 'json' | 'pdf' | 'csv';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: Timestamp;
  metadata: ExportMetadata;
  requestedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface ExportMetadata {
  entryCount?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  includedData: string[];
  fileSize?: number;
  error?: string;
}