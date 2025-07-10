import { firestore, functions } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Insight {
  id: string;
  type: 'mood_pattern' | 'relationship_advice' | 'self_care' | 'goal_progress' | 'celebration';
  title: string;
  content: string;
  actionItems?: string[];
  relatedEntries?: string[];
  createdAt: Date;
  priority: 'high' | 'medium' | 'low';
  emoji?: string;
}

export interface MoodAnalysis {
  dominantMood: string;
  moodTrend: 'improving' | 'stable' | 'declining';
  triggers: string[];
  recommendations: string[];
}

export interface RelationshipInsight {
  pattern: string;
  frequency: number;
  advice: string;
  exercises: string[];
}

class LunaInsightsService {
  private insightsCache: Map<string, Insight[]> = new Map();
  private lastAnalysis: Date | null = null;

  // Get personalized insights based on journal entries
  async getPersonalizedInsights(userId: string): Promise<Insight[]> {
    try {
      // Check cache first
      const cacheKey = `insights_${userId}`;
      const cached = this.insightsCache.get(cacheKey);
      
      if (cached && this.isRecentAnalysis()) {
        return cached;
      }

      // Analyze journal patterns
      const analyzePatterns = httpsCallable(functions, 'analyzeJournalPatterns');
      const result = await analyzePatterns({ userId });
      
      const insights = await this.generateInsights(userId, result.data);
      
      // Cache results
      this.insightsCache.set(cacheKey, insights);
      this.lastAnalysis = new Date();
      
      return insights;
    } catch (error) {
      console.error('Error getting personalized insights:', error);
      return this.getDefaultInsights();
    }
  }

  // Generate insights from analysis
  private async generateInsights(userId: string, analysisData: any): Promise<Insight[]> {
    const insights: Insight[] = [];
    
    // Mood pattern insights
    const moodAnalysis = await this.analyzeMoodPatterns(userId);
    if (moodAnalysis) {
      insights.push({
        id: `mood_${Date.now()}`,
        type: 'mood_pattern',
        title: 'Tes Émotions Cette Semaine',
        content: this.generateMoodInsightContent(moodAnalysis),
        actionItems: moodAnalysis.recommendations,
        priority: moodAnalysis.moodTrend === 'declining' ? 'high' : 'medium',
        emoji: '🌈',
        createdAt: new Date()
      });
    }

    // Relationship insights
    const relationshipPatterns = await this.analyzeRelationshipPatterns(userId);
    if (relationshipPatterns.length > 0) {
      const topPattern = relationshipPatterns[0];
      insights.push({
        id: `rel_${Date.now()}`,
        type: 'relationship_advice',
        title: 'Insight Relationnel',
        content: topPattern.advice,
        actionItems: topPattern.exercises,
        priority: 'medium',
        emoji: '💕',
        createdAt: new Date()
      });
    }

    // Self-care reminders
    const selfCareNeeded = await this.checkSelfCareNeeds(userId);
    if (selfCareNeeded) {
      insights.push({
        id: `care_${Date.now()}`,
        type: 'self_care',
        title: 'Moment Self-Care',
        content: 'J\'ai remarqué que tu traverses une période intense. Prendre soin de toi est essentiel!',
        actionItems: [
          'Prends 10 minutes pour une méditation guidée',
          'Fais une activité qui te fait plaisir',
          'Appelle une amie proche',
          'Prends un bain relaxant ce soir'
        ],
        priority: 'high',
        emoji: '🌸',
        createdAt: new Date()
      });
    }

    // Celebration insights
    const achievements = await this.findAchievements(userId);
    if (achievements.length > 0) {
      insights.push({
        id: `celebrate_${Date.now()}`,
        type: 'celebration',
        title: 'Célébrons tes Victoires! 🎉',
        content: `Tu as accompli tellement de choses! ${achievements.join(', ')}. Je suis fière de toi!`,
        priority: 'low',
        emoji: '🎉',
        createdAt: new Date()
      });
    }

    return insights;
  }

  // Analyze mood patterns
  private async analyzeMoodPatterns(userId: string): Promise<MoodAnalysis | null> {
    try {
      const entriesRef = collection(firestore, `users/${userId}/entries`);
      const q = query(entriesRef, orderBy('createdAt', 'desc'), limit(14));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const moods: string[] = [];
      const triggers: Set<string> = new Set();

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.mood) moods.push(data.mood);
        if (data.tags) {
          data.tags.forEach((tag: string) => triggers.add(tag));
        }
      });

      // Calculate mood trend
      const recentMoods = moods.slice(0, 7);
      const olderMoods = moods.slice(7);
      
      const moodTrend = this.calculateMoodTrend(recentMoods, olderMoods);
      const dominantMood = this.findDominantMood(moods);
      
      const recommendations = this.generateMoodRecommendations(dominantMood, moodTrend);

      return {
        dominantMood,
        moodTrend,
        triggers: Array.from(triggers).slice(0, 5),
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing mood patterns:', error);
      return null;
    }
  }

  // Analyze relationship patterns
  private async analyzeRelationshipPatterns(userId: string): Promise<RelationshipInsight[]> {
    try {
      const entriesRef = collection(firestore, `users/${userId}/entries`);
      const q = query(
        entriesRef, 
        where('tags', 'array-contains-any', ['relation', 'amour', 'couple', 'partenaire']),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);

      const patterns: Map<string, number> = new Map();
      
      snapshot.forEach(doc => {
        const content = doc.data().content?.toLowerCase() || '';
        
        // Detect common relationship patterns
        if (content.includes('conflit') || content.includes('dispute')) {
          patterns.set('conflict', (patterns.get('conflict') || 0) + 1);
        }
        if (content.includes('communication') || content.includes('parler')) {
          patterns.set('communication', (patterns.get('communication') || 0) + 1);
        }
        if (content.includes('distance') || content.includes('éloigné')) {
          patterns.set('distance', (patterns.get('distance') || 0) + 1);
        }
        if (content.includes('jalousie') || content.includes('jaloux')) {
          patterns.set('jealousy', (patterns.get('jealousy') || 0) + 1);
        }
      });

      return Array.from(patterns.entries())
        .map(([pattern, frequency]) => this.createRelationshipInsight(pattern, frequency))
        .sort((a, b) => b.frequency - a.frequency);
    } catch (error) {
      console.error('Error analyzing relationship patterns:', error);
      return [];
    }
  }

  // Check if user needs self-care reminder
  private async checkSelfCareNeeds(userId: string): Promise<boolean> {
    try {
      const entriesRef = collection(firestore, `users/${userId}/entries`);
      const q = query(entriesRef, orderBy('createdAt', 'desc'), limit(7));
      const snapshot = await getDocs(q);

      let stressCount = 0;
      let negativeCount = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const mood = data.mood?.toLowerCase() || '';
        const content = data.content?.toLowerCase() || '';

        if (mood === 'stressed' || mood === 'anxious' || content.includes('stress')) {
          stressCount++;
        }
        if (mood === 'sad' || mood === 'angry' || mood === 'frustrated') {
          negativeCount++;
        }
      });

      return stressCount >= 3 || negativeCount >= 4;
    } catch (error) {
      console.error('Error checking self-care needs:', error);
      return false;
    }
  }

  // Find achievements to celebrate
  private async findAchievements(userId: string): Promise<string[]> {
    const achievements: string[] = [];

    try {
      // Check journal streak
      const streak = await this.calculateJournalStreak(userId);
      if (streak >= 7) {
        achievements.push(`${streak} jours de journaling consécutifs`);
      }

      // Check mood improvements
      const moodAnalysis = await this.analyzeMoodPatterns(userId);
      if (moodAnalysis?.moodTrend === 'improving') {
        achievements.push('Ton humeur s\'améliore');
      }

      // Check completed goals
      const completedGoals = await this.getCompletedGoals(userId);
      if (completedGoals > 0) {
        achievements.push(`${completedGoals} objectif${completedGoals > 1 ? 's' : ''} atteint${completedGoals > 1 ? 's' : ''}`);
      }

      return achievements;
    } catch (error) {
      console.error('Error finding achievements:', error);
      return [];
    }
  }

  // Helper functions
  private isRecentAnalysis(): boolean {
    if (!this.lastAnalysis) return false;
    const hoursSinceAnalysis = (Date.now() - this.lastAnalysis.getTime()) / (1000 * 60 * 60);
    return hoursSinceAnalysis < 6; // Cache for 6 hours
  }

  private calculateMoodTrend(recent: string[], older: string[]): 'improving' | 'stable' | 'declining' {
    const moodScores: { [key: string]: number } = {
      'happy': 5, 'excited': 5, 'grateful': 5,
      'calm': 4, 'content': 4,
      'neutral': 3,
      'anxious': 2, 'sad': 2, 'frustrated': 2,
      'angry': 1, 'stressed': 1
    };

    const recentScore = recent.reduce((sum, mood) => sum + (moodScores[mood] || 3), 0) / recent.length;
    const olderScore = older.length > 0 
      ? older.reduce((sum, mood) => sum + (moodScores[mood] || 3), 0) / older.length 
      : recentScore;

    if (recentScore > olderScore + 0.5) return 'improving';
    if (recentScore < olderScore - 0.5) return 'declining';
    return 'stable';
  }

  private findDominantMood(moods: string[]): string {
    const moodCount = moods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(moodCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  }

  private generateMoodInsightContent(analysis: MoodAnalysis): string {
    const trendMessages = {
      improving: 'Je vois que ton humeur s\'améliore! Continue sur cette belle lancée.',
      stable: 'Tu maintiens un bon équilibre émotionnel, c\'est important.',
      declining: 'J\'ai remarqué que tu traverses une période difficile. Je suis là pour toi.'
    };

    return `${trendMessages[analysis.moodTrend]} Ton humeur dominante a été "${analysis.dominantMood}". 
    ${analysis.triggers.length > 0 ? `Les principaux déclencheurs: ${analysis.triggers.join(', ')}.` : ''}`;
  }

  private generateMoodRecommendations(mood: string, trend: string): string[] {
    const recommendations: string[] = [];

    if (trend === 'declining' || ['sad', 'anxious', 'stressed'].includes(mood)) {
      recommendations.push(
        'Pratique 5 minutes de respiration profonde',
        'Écris 3 choses pour lesquelles tu es reconnaissante',
        'Fais une activité physique douce',
        'Connecte-toi avec une personne qui te fait du bien'
      );
    } else if (trend === 'improving') {
      recommendations.push(
        'Continue tes bonnes habitudes',
        'Célèbre tes progrès',
        'Partage ta joie avec quelqu\'un',
        'Note ce qui fonctionne bien pour toi'
      );
    }

    return recommendations;
  }

  private createRelationshipInsight(pattern: string, frequency: number): RelationshipInsight {
    const insights: { [key: string]: RelationshipInsight } = {
      conflict: {
        pattern: 'Gestion des conflits',
        frequency,
        advice: 'Les conflits font partie de toute relation saine. L\'important est de les gérer avec bienveillance et communication.',
        exercises: [
          'Pratique l\'écoute active lors du prochain désaccord',
          'Exprime tes besoins avec des phrases en "Je"',
          'Prends une pause de 20 minutes avant de répondre si tu es énervée',
          'Écris tes sentiments avant d\'en parler'
        ]
      },
      communication: {
        pattern: 'Communication',
        frequency,
        advice: 'La communication est la clé! Tu es sur la bonne voie en reconnaissant son importance.',
        exercises: [
          'Planifie un moment quotidien de partage avec ton partenaire',
          'Pratique l\'expression de gratitude',
          'Pose des questions ouvertes pour mieux comprendre',
          'Partage tes vulnérabilités en toute sécurité'
        ]
      },
      distance: {
        pattern: 'Distance émotionnelle',
        frequency,
        advice: 'La distance peut être une opportunité de se reconnecter différemment.',
        exercises: [
          'Planifie des activités ensemble',
          'Envoie des messages doux spontanés',
          'Crée des rituels de connexion',
          'Exprime tes besoins de proximité'
        ]
      },
      jealousy: {
        pattern: 'Jalousie',
        frequency,
        advice: 'La jalousie révèle souvent nos propres insécurités. C\'est une invitation à travailler sur soi.',
        exercises: [
          'Identifie la source de tes peurs',
          'Travaille sur ta confiance en toi',
          'Communique tes limites sainement',
          'Pratique la confiance progressive'
        ]
      }
    };

    return insights[pattern] || {
      pattern: 'Pattern général',
      frequency,
      advice: 'Continue à observer et comprendre tes schémas relationnels.',
      exercises: ['Journaling quotidien', 'Communication ouverte']
    };
  }

  private async calculateJournalStreak(userId: string): Promise<number> {
    try {
      const entriesRef = collection(firestore, `users/${userId}/entries`);
      const q = query(entriesRef, orderBy('createdAt', 'desc'), limit(30));
      const snapshot = await getDocs(q);

      let streak = 0;
      let lastDate: Date | null = null;

      snapshot.forEach(doc => {
        const entryDate = doc.data().createdAt?.toDate();
        if (!entryDate) return;

        if (!lastDate) {
          streak = 1;
          lastDate = entryDate;
        } else {
          const daysDiff = Math.floor((lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            streak++;
            lastDate = entryDate;
          } else {
            return; // Break streak
          }
        }
      });

      return streak;
    } catch (error) {
      console.error('Error calculating journal streak:', error);
      return 0;
    }
  }

  private async getCompletedGoals(userId: string): Promise<number> {
    // Placeholder - implement goal tracking
    return 0;
  }

  private getDefaultInsights(): Insight[] {
    return [
      {
        id: 'default_1',
        type: 'self_care',
        title: 'Bienvenue dans tes Insights Luna! 🌟',
        content: 'Je suis là pour t\'aider à mieux comprendre tes émotions et tes patterns. Continue à journaler pour que je puisse te donner des insights personnalisés.',
        actionItems: [
          'Écris dans ton journal chaque jour',
          'Note ton humeur régulièrement',
          'Partage tes pensées avec moi'
        ],
        priority: 'medium',
        emoji: '✨',
        createdAt: new Date()
      }
    ];
  }

  // Save insight interaction
  async markInsightAsRead(userId: string, insightId: string): Promise<void> {
    try {
      await addDoc(collection(firestore, `users/${userId}/insightInteractions`), {
        insightId,
        action: 'read',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  }

  // Get insight recommendations based on time of day
  async getTimeBasedRecommendations(userId: string): Promise<string[]> {
    const hour = new Date().getHours();
    const recommendations: string[] = [];

    if (hour >= 6 && hour < 9) {
      recommendations.push(
        'Commence ta journée avec une intention positive',
        'Prends 5 minutes pour méditer',
        'Écris 3 gratitudes'
      );
    } else if (hour >= 12 && hour < 14) {
      recommendations.push(
        'Prends une vraie pause déjeuner',
        'Fais une marche de 10 minutes',
        'Respire profondément'
      );
    } else if (hour >= 18 && hour < 21) {
      recommendations.push(
        'Déconnecte-toi des écrans',
        'Prépare-toi une tisane relaxante',
        'Écris dans ton journal'
      );
    } else if (hour >= 21) {
      recommendations.push(
        'Prépare-toi pour une bonne nuit',
        'Note 3 moments positifs de ta journée',
        'Pratique la relaxation'
      );
    }

    return recommendations;
  }
}

export default new LunaInsightsService();