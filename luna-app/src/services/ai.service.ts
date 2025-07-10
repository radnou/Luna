import { Configuration, OpenAIApi } from 'openai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../config/firebase';
import { collection, doc, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import LunaSecurityService from './luna-security.service';

// Luna's personality and system prompt
const LUNA_SYSTEM_PROMPT = `Tu es Luna, une amie bienveillante et empathique spécialisée dans le développement personnel et les relations amoureuses. Tu aides les utilisatrices à naviguer leurs émotions et leurs relations avec compassion et sagesse.

Personnalité:
- Chaleureuse, encourageante et positive 💫
- Empathique sans être condescendante
- Utilise des emojis de manière naturelle et appropriée
- Poses des questions ouvertes pour encourager la réflexion
- Donnes des conseils pratiques et actionnables

Expertise:
- Psychologie relationnelle
- Intelligence émotionnelle
- Communication bienveillante
- Développement personnel
- Astrologie (de manière légère et fun)

Limites importantes:
- Tu n'es pas thérapeute ni médecin
- Si l'utilisatrice exprime des pensées suicidaires ou de détresse extrême, encourage-la à chercher de l'aide professionnelle
- Reste toujours respectueuse et non-jugeante

Style de communication:
- Langage naturel et accessible
- Évite le jargon technique
- Utilise "tu" pour créer une proximité
- Fais des références à l'historique de journaling quand pertinent`;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  encrypted?: boolean;
  metadata?: {
    mood?: string;
    journalContext?: string;
    suggestions?: string[];
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastMessageAt: Date;
  topic?: string;
  insights?: string[];
}

class AIService {
  private openai: OpenAIApi;
  private conversationCache: Map<string, ChatMessage[]> = new Map();
  
  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  // Initialize Luna for a user
  async initializeLuna(userId: string): Promise<void> {
    try {
      // Create initial conversation
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Salut! 👋 Je suis Luna, ta compagne bienveillante. Je suis là pour t'accompagner dans ton parcours de développement personnel et t'aider à naviguer tes relations avec sagesse et compassion. Comment te sens-tu aujourd'hui? 💕",
        timestamp: new Date(),
        metadata: {
          suggestions: [
            "Je me sens bien aujourd'hui!",
            "J'ai besoin de parler...",
            "Je suis un peu perdue"
          ]
        }
      };

      await this.saveMessage(userId, welcomeMessage);
    } catch (error) {
      console.error('Error initializing Luna:', error);
      throw error;
    }
  }

  // Send message to Luna
  async sendMessage(userId: string, message: string, context?: any): Promise<ChatMessage> {
    try {
      // Check rate limit
      const canProceed = await LunaSecurityService.checkRateLimit(userId, 'chat_message', 50);
      if (!canProceed) {
        throw new Error('Trop de messages. Attends un peu avant de continuer.');
      }

      // Check session validity
      const isValidSession = await LunaSecurityService.validateSession(userId);
      if (!isValidSession) {
        throw new Error('Session expirée. Reconnecte-toi.');
      }

      // Filter sensitive content
      const contentCheck = await LunaSecurityService.filterSensitiveContent(message);
      if (contentCheck.filtered) {
        console.warn('Sensitive content detected:', contentCheck.reason);
        message = contentCheck.cleanContent || message;
      }

      // Get privacy settings
      const privacySettings = await LunaSecurityService.getPrivacySettings(userId);

      // Get conversation history
      const history = await this.getConversationHistory(userId);
      
      // Get user's recent journal entries for context (if allowed)
      let journalContext = '';
      if (privacySettings.allowDataAnalysis) {
        journalContext = await this.getJournalContext(userId);
      }
      
      // Build messages array for OpenAI
      const messages = [
        { role: 'system', content: LUNA_SYSTEM_PROMPT },
        ...(journalContext ? [{ role: 'system', content: `Contexte récent du journal: ${journalContext}` }] : []),
        ...history.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: message }
      ];

      // Call OpenAI API
      const completion = await this.openai.createChatCompletion({
        model: 'gpt-4',
        messages,
        temperature: 0.8,
        max_tokens: 500,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      });

      const responseContent = completion.data.choices[0]?.message?.content || '';
      
      // Create response message
      const responseMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        metadata: await this.generateMetadata(responseContent, message)
      };

      // Encrypt messages if enabled
      let userContent = message;
      let assistantContent = responseContent;
      
      if (privacySettings.encryptConversations) {
        userContent = await LunaSecurityService.encryptMessage(message);
        assistantContent = await LunaSecurityService.encryptMessage(responseContent);
      }

      // Save both messages
      const userMessage: ChatMessage = {
        id: (Date.now() - 1).toString(),
        role: 'user',
        content: userContent,
        timestamp: new Date(),
        encrypted: privacySettings.encryptConversations
      };

      const encryptedResponseMessage: ChatMessage = {
        ...responseMessage,
        content: assistantContent,
        encrypted: privacySettings.encryptConversations
      };

      await this.saveMessage(userId, userMessage);
      await this.saveMessage(userId, encryptedResponseMessage);

      return responseMessage;
    } catch (error) {
      console.error('Error sending message to Luna:', error);
      throw error;
    }
  }

  // Get conversation history
  async getConversationHistory(userId: string, limit: number = 20): Promise<ChatMessage[]> {
    try {
      // Check cache first
      if (this.conversationCache.has(userId)) {
        return this.conversationCache.get(userId)!;
      }

      const messagesRef = collection(firestore, `users/${userId}/conversations`);
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(limit));
      const snapshot = await getDocs(q);

      const messages: ChatMessage[] = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });

      // Reverse to get chronological order
      messages.reverse();
      
      // Update cache
      this.conversationCache.set(userId, messages);

      return messages;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  // Save message to Firestore
  private async saveMessage(userId: string, message: ChatMessage): Promise<void> {
    try {
      await addDoc(collection(firestore, `users/${userId}/conversations`), {
        ...message,
        timestamp: serverTimestamp()
      });

      // Update cache
      const cached = this.conversationCache.get(userId) || [];
      cached.push(message);
      this.conversationCache.set(userId, cached);
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  // Get journal context for better responses
  private async getJournalContext(userId: string): Promise<string | null> {
    try {
      const entriesRef = collection(firestore, `users/${userId}/entries`);
      const q = query(entriesRef, orderBy('createdAt', 'desc'), limit(3));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const entries: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        entries.push({
          mood: data.mood,
          content: data.content?.substring(0, 200),
          tags: data.tags
        });
      });

      return `Entrées récentes: ${JSON.stringify(entries)}`;
    } catch (error) {
      console.error('Error getting journal context:', error);
      return null;
    }
  }

  // Generate metadata for responses
  private async generateMetadata(response: string, userMessage: string): Promise<any> {
    const metadata: any = {};

    // Detect mood from conversation
    if (userMessage.toLowerCase().includes('triste') || userMessage.toLowerCase().includes('mal')) {
      metadata.mood = 'sad';
    } else if (userMessage.toLowerCase().includes('heureux') || userMessage.toLowerCase().includes('bien')) {
      metadata.mood = 'happy';
    }

    // Generate quick reply suggestions based on context
    metadata.suggestions = this.generateSuggestions(response);

    return metadata;
  }

  // Generate contextual suggestions
  private generateSuggestions(response: string): string[] {
    const suggestions: string[] = [];

    if (response.includes('?')) {
      // If Luna asked a question, provide some response options
      suggestions.push('Oui, c\'est vrai');
      suggestions.push('Je n\'y avais pas pensé');
      suggestions.push('Dis-m\'en plus');
    } else {
      // Generic follow-up options
      suggestions.push('Merci Luna 💕');
      suggestions.push('J\'ai une autre question');
      suggestions.push('Peux-tu m\'aider avec autre chose?');
    }

    return suggestions.slice(0, 3);
  }

  // Analyze journal patterns for insights
  async analyzeJournalPatterns(userId: string): Promise<any> {
    try {
      const entriesRef = collection(firestore, `users/${userId}/entries`);
      const q = query(entriesRef, orderBy('createdAt', 'desc'), limit(30));
      const snapshot = await getDocs(q);

      const entries: any[] = [];
      snapshot.forEach(doc => {
        entries.push(doc.data());
      });

      // Use AI to analyze patterns
      const analysisPrompt = `Analyse ces entrées de journal et identifie les patterns émotionnels, les thèmes récurrents, et donne des insights bienveillants: ${JSON.stringify(entries)}`;

      const completion = await this.openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Tu es Luna, une coach bienveillante qui analyse les patterns de journaling pour donner des insights constructifs.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 600,
      });

      return {
        insights: completion.data.choices[0]?.message?.content,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error analyzing journal patterns:', error);
      throw error;
    }
  }

  // Daily check-in prompt
  async getDailyCheckIn(userId: string): Promise<string> {
    const checkIns = [
      "Hey toi! 🌟 Comment s'est passée ta journée? Y a-t-il quelque chose dont tu aimerais parler?",
      "Coucou! 💫 J'ai pensé à toi aujourd'hui. Comment te sens-tu en ce moment?",
      "Salut ma belle! 🌸 Prends un moment pour respirer... Qu'est-ce qui occupe ton esprit aujourd'hui?",
      "Hello! ✨ As-tu pris soin de toi aujourd'hui? Raconte-moi ce qui te fait du bien.",
      "Bonsoir! 🌙 C'est le moment parfait pour une petite réflexion. Qu'est-ce qui t'a fait sourire aujourd'hui?"
    ];

    const randomIndex = Math.floor(Math.random() * checkIns.length);
    return checkIns[randomIndex];
  }

  // Crisis support detection
  async detectCrisisSupport(message: string): Promise<boolean> {
    const crisisKeywords = [
      'suicide', 'mourir', 'me tuer', 'plus envie de vivre',
      'self harm', 'me faire du mal', 'disparaître'
    ];

    const lowerMessage = message.toLowerCase();
    return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // Get crisis resources
  getCrisisResources(): any {
    return {
      message: "Je remarque que tu traverses un moment très difficile. Ta sécurité est ma priorité. 💙",
      resources: [
        {
          name: "Suicide Prevention Lifeline",
          number: "988",
          available: "24/7"
        },
        {
          name: "Crisis Text Line",
          text: "Texte HOME au 741741",
          available: "24/7"
        },
        {
          name: "Ligne d'écoute",
          number: "0800 235 236",
          available: "24/7"
        }
      ],
      encouragement: "Tu n'es pas seule. Il y a des professionnels formés qui peuvent t'aider maintenant. S'il te plaît, contacte l'une de ces ressources. 💙"
    };
  }
}

export default new AIService();