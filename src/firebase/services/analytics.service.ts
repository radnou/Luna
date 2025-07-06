import { logEvent, setUserId, setUserProperties, Analytics } from 'firebase/analytics';
import { analytics } from '../config/firebase.config';

// Event names constants
export const ANALYTICS_EVENTS = {
  // Authentication events
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Profile events
  COMPLETE_PROFILE: 'complete_profile',
  UPDATE_BIRTH_DATA: 'update_birth_data',
  
  // Journal events
  CREATE_JOURNAL_ENTRY: 'create_journal_entry',
  VIEW_JOURNAL_ENTRY: 'view_journal_entry',
  ADD_JOURNAL_MOOD: 'add_journal_mood',
  
  // Analysis events
  CREATE_BIRTH_CHART: 'create_birth_chart',
  VIEW_ANALYSIS: 'view_analysis',
  SHARE_ANALYSIS: 'share_analysis',
  DOWNLOAD_PDF: 'download_pdf',
  
  // Compatibility events
  CHECK_COMPATIBILITY: 'check_compatibility',
  SAVE_RELATIONSHIP: 'save_relationship',
  
  // Text decoder events
  START_CONVERSATION: 'start_conversation',
  DECODE_MESSAGE: 'decode_message',
  UPLOAD_SCREENSHOT: 'upload_screenshot',
  
  // Subscription events
  VIEW_PRICING: 'view_pricing',
  START_TRIAL: 'start_trial',
  PURCHASE_SUBSCRIPTION: 'purchase',
  CANCEL_SUBSCRIPTION: 'cancel_subscription',
  
  // Feature usage
  USE_AI_FEATURE: 'use_ai_feature',
  VIEW_HOROSCOPE: 'view_horoscope',
  SET_REMINDER: 'set_reminder',
  
  // App engagement
  APP_OPEN: 'app_open',
  SCREEN_VIEW: 'screen_view',
  SHARE_APP: 'share',
  RATE_APP: 'rate_app'
} as const;

class AnalyticsService {
  private analytics: Analytics | null = null;

  constructor() {
    // Analytics is initialized in firebase.config.ts
    // We'll check if it's available when methods are called
    if (typeof window !== 'undefined') {
      this.analytics = analytics;
    }
  }

  // Set user ID for analytics
  setUser(userId: string): void {
    if (!this.analytics) return;
    
    try {
      setUserId(this.analytics, userId);
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>): void {
    if (!this.analytics) return;
    
    try {
      setUserProperties(this.analytics, properties);
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  // Log custom event
  logEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.analytics) return;
    
    try {
      logEvent(this.analytics, eventName, parameters);
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }

  // Authentication events
  logSignUp(method: string): void {
    this.logEvent(ANALYTICS_EVENTS.SIGN_UP, { method });
  }

  logLogin(method: string): void {
    this.logEvent(ANALYTICS_EVENTS.LOGIN, { method });
  }

  logLogout(): void {
    this.logEvent(ANALYTICS_EVENTS.LOGOUT);
  }

  // Profile events
  logProfileComplete(hasAstralData: boolean): void {
    this.logEvent(ANALYTICS_EVENTS.COMPLETE_PROFILE, {
      has_astral_data: hasAstralData
    });
  }

  logBirthDataUpdate(): void {
    this.logEvent(ANALYTICS_EVENTS.UPDATE_BIRTH_DATA);
  }

  // Journal events
  logJournalEntry(mood?: number, hasAIInsights?: boolean): void {
    this.logEvent(ANALYTICS_EVENTS.CREATE_JOURNAL_ENTRY, {
      mood_value: mood,
      has_ai_insights: hasAIInsights
    });
  }

  logViewJournalEntry(): void {
    this.logEvent(ANALYTICS_EVENTS.VIEW_JOURNAL_ENTRY);
  }

  // Analysis events
  logCreateAnalysis(type: string): void {
    this.logEvent(ANALYTICS_EVENTS.CREATE_BIRTH_CHART, {
      analysis_type: type
    });
  }

  logViewAnalysis(type: string): void {
    this.logEvent(ANALYTICS_EVENTS.VIEW_ANALYSIS, {
      analysis_type: type
    });
  }

  logShareAnalysis(method: string): void {
    this.logEvent(ANALYTICS_EVENTS.SHARE_ANALYSIS, { method });
  }

  logDownloadPDF(type: string): void {
    this.logEvent(ANALYTICS_EVENTS.DOWNLOAD_PDF, {
      document_type: type
    });
  }

  // Compatibility events
  logCompatibilityCheck(relationshipType: string): void {
    this.logEvent(ANALYTICS_EVENTS.CHECK_COMPATIBILITY, {
      relationship_type: relationshipType
    });
  }

  logSaveRelationship(type: string): void {
    this.logEvent(ANALYTICS_EVENTS.SAVE_RELATIONSHIP, {
      relationship_type: type
    });
  }

  // Text decoder events
  logStartConversation(context?: string): void {
    this.logEvent(ANALYTICS_EVENTS.START_CONVERSATION, {
      context_type: context
    });
  }

  logDecodeMessage(hasScreenshot: boolean): void {
    this.logEvent(ANALYTICS_EVENTS.DECODE_MESSAGE, {
      has_screenshot: hasScreenshot
    });
  }

  // Subscription events
  logViewPricing(): void {
    this.logEvent(ANALYTICS_EVENTS.VIEW_PRICING);
  }

  logPurchase(plan: string, price: number, currency: string): void {
    this.logEvent(ANALYTICS_EVENTS.PURCHASE_SUBSCRIPTION, {
      value: price,
      currency: currency,
      items: [{
        item_id: plan,
        item_name: `${plan} subscription`,
        item_category: 'subscription',
        price: price,
        quantity: 1
      }]
    });
  }

  logCancelSubscription(plan: string, reason?: string): void {
    this.logEvent(ANALYTICS_EVENTS.CANCEL_SUBSCRIPTION, {
      plan,
      cancellation_reason: reason
    });
  }

  // Feature usage
  logAIFeatureUse(feature: string, model: string): void {
    this.logEvent(ANALYTICS_EVENTS.USE_AI_FEATURE, {
      feature_name: feature,
      ai_model: model
    });
  }

  logViewHoroscope(type: 'daily' | 'weekly' | 'monthly'): void {
    this.logEvent(ANALYTICS_EVENTS.VIEW_HOROSCOPE, {
      horoscope_type: type
    });
  }

  // Screen tracking
  logScreenView(screenName: string, screenClass?: string): void {
    this.logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
      screen_name: screenName,
      screen_class: screenClass
    });
  }

  // App engagement
  logAppOpen(): void {
    this.logEvent(ANALYTICS_EVENTS.APP_OPEN);
  }

  logShare(contentType: string, method: string): void {
    this.logEvent(ANALYTICS_EVENTS.SHARE_APP, {
      content_type: contentType,
      method
    });
  }

  logRateApp(rating: number): void {
    this.logEvent(ANALYTICS_EVENTS.RATE_APP, { rating });
  }

  // Custom timing events
  logTiming(category: string, variable: string, value: number): void {
    this.logEvent('timing_complete', {
      name: variable,
      value,
      event_category: category
    });
  }

  // Error tracking
  logError(error: string, fatal: boolean = false): void {
    this.logEvent('app_error', {
      error_message: error,
      fatal
    });
  }
}

export default new AnalyticsService();