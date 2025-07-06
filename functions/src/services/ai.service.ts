import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Configuration, OpenAIApi } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const db = admin.firestore();

// Initialize AI clients
const openaiConfig = new Configuration({
  apiKey: functions.config().openai?.api_key || process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(openaiConfig);

const anthropic = new Anthropic({
  apiKey: functions.config().anthropic?.api_key || process.env.ANTHROPIC_API_KEY
});

// Analyze journal entry with AI
export const analyzeJournalEntry = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { entryId, content, useModel = 'gpt-4' } = data;

  try {
    // Get user's astrological context
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();
    const astralContext = userData?.astralData || {};

    let analysis;

    if (useModel === 'claude-3') {
      // Use Claude for analysis
      const message = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Analyze this journal entry with consideration of the user's astrological profile.
          
          User's Astral Data: ${JSON.stringify(astralContext)}
          
          Journal Entry: ${content}
          
          Provide:
          1. A brief summary (2-3 sentences)
          2. Key themes identified
          3. Emotional sentiment analysis
          4. Astrological insights based on their profile
          5. Supportive suggestions or affirmations`
        }]
      });

      analysis = parseClaudeResponse(message.content[0].text);
    } else {
      // Use GPT-4 for analysis
      const completion = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are Luna, an empathetic AI assistant that combines psychological insights with astrological wisdom.'
        }, {
          role: 'user',
          content: `Analyze this journal entry with consideration of the user's astrological profile.
          
          User's Astral Data: ${JSON.stringify(astralContext)}
          
          Journal Entry: ${content}
          
          Provide:
          1. A brief summary (2-3 sentences)
          2. Key themes identified
          3. Emotional sentiment analysis
          4. Astrological insights based on their profile
          5. Supportive suggestions or affirmations`
        }],
        temperature: 0.7,
        max_tokens: 1000
      });

      analysis = parseGPTResponse(completion.data.choices[0].message?.content || '');
    }

    // Update journal entry with analysis
    if (entryId) {
      await db.collection('journal_entries').doc(entryId).update({
        aiInsights: analysis,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return { success: true, analysis };
  } catch (error) {
    console.error('Error analyzing journal entry:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze journal entry');
  }
});

// Generate compatibility report
export const generateCompatibilityReport = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { person1Data, person2Data, reportType = 'romantic' } = data;

  try {
    // Calculate astrological compatibility (would integrate with Swiss Ephemeris)
    const compatibilityData = await calculateCompatibility(person1Data, person2Data);

    // Generate AI interpretation
    const prompt = `Generate a detailed compatibility report for two people based on their astrological data.
    
    Person 1: ${JSON.stringify(person1Data)}
    Person 2: ${JSON.stringify(person2Data)}
    Compatibility Type: ${reportType}
    Astrological Data: ${JSON.stringify(compatibilityData)}
    
    Include:
    1. Overall compatibility score and summary
    2. Strengths of the relationship
    3. Potential challenges
    4. Communication style compatibility
    5. Emotional compatibility
    6. Long-term potential
    7. Specific advice for each person`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'You are an expert astrologer providing insightful and balanced compatibility readings.'
      }, {
        role: 'user',
        content: prompt
      }],
      temperature: 0.8,
      max_tokens: 2000
    });

    const report = completion.data.choices[0].message?.content || '';

    // Save analysis to database
    const analysisDoc = await db.collection('analyses').add({
      userId: context.auth.uid,
      type: 'compatibility',
      title: `Compatibility Report: ${person1Data.name} & ${person2Data.name}`,
      data: {
        chartData: compatibilityData,
        interpretation: report,
        reportType
      },
      participants: [person1Data, person2Data],
      isPublic: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      analysisId: analysisDoc.id,
      report,
      compatibilityScore: compatibilityData.overallScore
    };
  } catch (error) {
    console.error('Error generating compatibility report:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate compatibility report');
  }
});

// Decode conversation (text decoder feature)
export const decodeConversation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { conversationId, message, context: conversationContext } = data;

  try {
    // Get conversation history
    let conversation;
    let messages = [];

    if (conversationId) {
      const conversationDoc = await db.collection('conversations').doc(conversationId).get();
      conversation = conversationDoc.data();
      messages = conversation?.messages || [];
    }

    // Add astrological context
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const astralData = userDoc.data()?.astralData || {};

    const systemPrompt = `You are Luna's Text Decoder, an AI that helps decode hidden meanings in conversations with astrological insights.
    Consider the user's astrological profile: ${JSON.stringify(astralData)}
    Context: ${conversationContext?.type || 'general'} conversation`;

    // Build conversation history for context
    const conversationHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Add new message
    conversationHistory.push({
      role: 'user',
      content: `Decode this message: "${message}"
      
      Provide:
      1. Surface meaning
      2. Potential hidden meanings or subtext
      3. Emotional undertones
      4. Astrological perspective on the communication style
      5. Suggested responses (if applicable)`
    });

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: systemPrompt
      }, ...conversationHistory],
      temperature: 0.8,
      max_tokens: 1500
    });

    const analysis = completion.data.choices[0].message?.content || '';

    // Save or update conversation
    const newMessage = {
      id: generateMessageId(),
      role: 'user' as const,
      content: message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      analysis: {
        decoded: true,
        timestamp: new Date().toISOString()
      }
    };

    const assistantMessage = {
      id: generateMessageId(),
      role: 'assistant' as const,
      content: analysis,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    if (conversationId) {
      // Update existing conversation
      await db.collection('conversations').doc(conversationId).update({
        messages: admin.firestore.FieldValue.arrayUnion(newMessage, assistantMessage),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Create new conversation
      const newConversation = await db.collection('conversations').add({
        userId: context.auth.uid,
        title: `Text Decode: ${message.substring(0, 50)}...`,
        messages: [newMessage, assistantMessage],
        context: conversationContext || { type: 'general' },
        aiModel: 'gpt-4',
        isArchived: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      conversationId = newConversation.id;
    }

    return {
      success: true,
      conversationId,
      analysis
    };
  } catch (error) {
    console.error('Error decoding conversation:', error);
    throw new functions.https.HttpsError('internal', 'Failed to decode conversation');
  }
});

// Helper functions
function parseGPTResponse(response: string): any {
  // Parse structured response from GPT
  // This is a simplified version - implement proper parsing based on your needs
  return {
    summary: extractSection(response, 'summary'),
    themes: extractSection(response, 'themes')?.split(',').map(t => t.trim()) || [],
    sentiment: extractSection(response, 'sentiment') || 'neutral',
    astrologicalInsights: extractSection(response, 'astrological'),
    suggestions: extractSection(response, 'suggestions')?.split('\n').filter(s => s.trim()) || []
  };
}

function parseClaudeResponse(response: string): any {
  // Similar parsing for Claude responses
  return parseGPTResponse(response);
}

function extractSection(text: string, section: string): string | null {
  const regex = new RegExp(`${section}[:\s]+([^]+?)(?=\n\n|\n[A-Z]|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

async function calculateCompatibility(person1: any, person2: any): Promise<any> {
  // Placeholder for Swiss Ephemeris integration
  // This would calculate actual astrological compatibility
  return {
    overallScore: Math.floor(Math.random() * 30) + 70, // Mock score 70-100
    sunCompatibility: 'harmonious',
    moonCompatibility: 'complementary',
    risingCompatibility: 'challenging',
    elementBalance: 'balanced',
    aspects: []
  };
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}