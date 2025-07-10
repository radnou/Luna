import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Configuration, OpenAIApi } from 'openai';
import { ChatCompletionRequestMessage } from 'openai/api';

// Initialize OpenAI
const openai = new OpenAIApi(
  new Configuration({
    apiKey: functions.config().openai.key,
  })
);

// Luna's system prompt
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

// Chat with Luna
export const chatWithLuna = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { message, conversationId, includeJournalContext } = data;
  const userId = context.auth.uid;

  try {
    // Get conversation history
    const conversationHistory = await getConversationHistory(userId, conversationId);
    
    // Get journal context if requested
    let journalContext = '';
    if (includeJournalContext) {
      journalContext = await getJournalContext(userId);
    }

    // Build messages for OpenAI
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: LUNA_SYSTEM_PROMPT },
    ];

    if (journalContext) {
      messages.push({ 
        role: 'system', 
        content: `Contexte du journal de l'utilisatrice: ${journalContext}` 
      });
    }

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages,
      temperature: 0.8,
      max_tokens: 500,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    const response = completion.data.choices[0]?.message?.content || '';

    // Save messages to Firestore
    const batch = admin.firestore().batch();
    
    // Save user message
    const userMessageRef = admin.firestore()
      .collection(`users/${userId}/conversations`)
      .doc();
    batch.set(userMessageRef, {
      role: 'user',
      content: message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      conversationId
    });

    // Save Luna's response
    const assistantMessageRef = admin.firestore()
      .collection(`users/${userId}/conversations`)
      .doc();
    batch.set(assistantMessageRef, {
      role: 'assistant',
      content: response,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      conversationId,
      metadata: {
        model: 'gpt-4',
        suggestions: generateSuggestions(response)
      }
    });

    await batch.commit();

    // Check for crisis keywords
    const needsCrisisSupport = checkCrisisKeywords(message);

    return {
      response,
      suggestions: generateSuggestions(response),
      needsCrisisSupport,
      conversationId
    };

  } catch (error) {
    console.error('Error in chatWithLuna:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process message');
  }
});

// Get conversation history
async function getConversationHistory(userId: string, conversationId?: string): Promise<any[]> {
  const query = admin.firestore()
    .collection(`users/${userId}/conversations`)
    .orderBy('timestamp', 'asc')
    .limit(20);

  if (conversationId) {
    query.where('conversationId', '==', conversationId);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => doc.data());
}

// Get journal context
async function getJournalContext(userId: string): Promise<string> {
  const entriesSnapshot = await admin.firestore()
    .collection(`users/${userId}/entries`)
    .orderBy('createdAt', 'desc')
    .limit(3)
    .get();

  if (entriesSnapshot.empty) return '';

  const entries = entriesSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      mood: data.mood,
      content: data.content?.substring(0, 200),
      tags: data.tags
    };
  });

  return JSON.stringify(entries);
}

// Generate contextual suggestions
function generateSuggestions(response: string): string[] {
  const suggestions: string[] = [];

  if (response.includes('?')) {
    suggestions.push('Oui, c\'est vrai');
    suggestions.push('Je n\'y avais pas pensé');
    suggestions.push('Dis-m\'en plus');
  } else {
    suggestions.push('Merci Luna 💕');
    suggestions.push('J\'ai une autre question');
    suggestions.push('Peux-tu m\'aider avec autre chose?');
  }

  return suggestions.slice(0, 3);
}

// Check for crisis keywords
function checkCrisisKeywords(message: string): boolean {
  const crisisKeywords = [
    'suicide', 'mourir', 'me tuer', 'plus envie de vivre',
    'self harm', 'me faire du mal', 'disparaître'
  ];

  const lowerMessage = message.toLowerCase();
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Analyze journal patterns
export const analyzeJournalPatterns = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    // Get last 30 journal entries
    const entriesSnapshot = await admin.firestore()
      .collection(`users/${userId}/entries`)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    if (entriesSnapshot.empty) {
      return { insights: 'Pas encore assez d\'entrées pour une analyse.' };
    }

    const entries = entriesSnapshot.docs.map(doc => doc.data());

    // Prepare analysis prompt
    const analysisPrompt = `Analyse ces entrées de journal et identifie les patterns émotionnels, les thèmes récurrents, et donne des insights bienveillants et constructifs. Entrées: ${JSON.stringify(entries)}`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'Tu es Luna, une coach bienveillante qui analyse les patterns de journaling pour donner des insights constructifs.' 
        },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const insights = completion.data.choices[0]?.message?.content || '';

    // Save insights
    await admin.firestore()
      .collection(`users/${userId}/insights`)
      .add({
        insights,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        entriesAnalyzed: entries.length
      });

    return { insights };

  } catch (error) {
    console.error('Error analyzing journal patterns:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze journal patterns');
  }
});

// Get daily check-in message
export const getDailyCheckIn = functions.pubsub
  .schedule('every day 20:00')
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    try {
      // Get all users with check-in enabled
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('preferences.dailyCheckIn', '==', true)
        .get();

      const checkIns = [
        "Hey toi! 🌟 Comment s'est passée ta journée? Y a-t-il quelque chose dont tu aimerais parler?",
        "Coucou! 💫 J'ai pensé à toi aujourd'hui. Comment te sens-tu en ce moment?",
        "Salut ma belle! 🌸 Prends un moment pour respirer... Qu'est-ce qui occupe ton esprit aujourd'hui?",
        "Hello! ✨ As-tu pris soin de toi aujourd'hui? Raconte-moi ce qui te fait du bien.",
        "Bonsoir! 🌙 C'est le moment parfait pour une petite réflexion. Qu'est-ce qui t'a fait sourire aujourd'hui?"
      ];

      const batch = admin.firestore().batch();

      usersSnapshot.docs.forEach(doc => {
        const userId = doc.id;
        const randomCheckIn = checkIns[Math.floor(Math.random() * checkIns.length)];

        // Create notification
        const notificationRef = admin.firestore()
          .collection(`users/${userId}/notifications`)
          .doc();

        batch.set(notificationRef, {
          type: 'daily_checkin',
          title: 'Luna pense à toi 💕',
          body: randomCheckIn,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        });
      });

      await batch.commit();
      console.log(`Sent daily check-ins to ${usersSnapshot.size} users`);

    } catch (error) {
      console.error('Error sending daily check-ins:', error);
    }
  });

// Get chat insights
export const getChatInsights = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    // Get recent conversations
    const conversationsSnapshot = await admin.firestore()
      .collection(`users/${userId}/conversations`)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const conversations = conversationsSnapshot.docs.map(doc => doc.data());

    // Analyze themes and patterns
    const themes = analyzeThemes(conversations);
    const moodTrend = analyzeMoodTrend(conversations);
    const topTopics = getTopTopics(conversations);

    return {
      themes,
      moodTrend,
      topTopics,
      conversationCount: conversations.length
    };

  } catch (error) {
    console.error('Error getting chat insights:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get chat insights');
  }
});

// Helper functions
function analyzeThemes(conversations: any[]): string[] {
  // Simple theme extraction - in production, use more sophisticated NLP
  const themes = new Set<string>();
  
  conversations.forEach(conv => {
    if (conv.content.includes('relation')) themes.add('Relations');
    if (conv.content.includes('travail')) themes.add('Travail');
    if (conv.content.includes('famille')) themes.add('Famille');
    if (conv.content.includes('ami')) themes.add('Amitié');
    if (conv.content.includes('stress')) themes.add('Stress');
  });

  return Array.from(themes);
}

function analyzeMoodTrend(conversations: any[]): string {
  // Simple mood analysis - in production, use sentiment analysis
  let positiveCount = 0;
  let negativeCount = 0;

  conversations.forEach(conv => {
    const content = conv.content.toLowerCase();
    if (content.includes('heureux') || content.includes('bien') || content.includes('super')) {
      positiveCount++;
    }
    if (content.includes('triste') || content.includes('mal') || content.includes('difficile')) {
      negativeCount++;
    }
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function getTopTopics(conversations: any[]): string[] {
  // Extract top discussed topics
  const topics = new Map<string, number>();
  
  const keywords = [
    'amour', 'relation', 'travail', 'famille', 'amis',
    'stress', 'anxiété', 'bonheur', 'objectifs', 'rêves'
  ];

  conversations.forEach(conv => {
    const content = conv.content.toLowerCase();
    keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        topics.set(keyword, (topics.get(keyword) || 0) + 1);
      }
    });
  });

  return Array.from(topics.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);
}