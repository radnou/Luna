import { firestore, auth, functions } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIService, { ChatMessage, ChatSession } from './ai.service';

export interface ChatRoom {
  id: string;
  userId: string;
  title: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  isActive: boolean;
  topic?: string;
  mood?: string;
}

export interface TypingIndicator {
  isTyping: boolean;
  userId: string;
  timestamp: Date;
}

export interface QuickReply {
  id: string;
  text: string;
  action?: string;
  data?: any;
}

class ChatService {
  private listeners: Map<string, () => void> = new Map();
  private typingTimeout: NodeJS.Timeout | null = null;

  // Create new chat session
  async createChatSession(userId: string, topic?: string): Promise<string> {
    try {
      const chatRoom: Omit<ChatRoom, 'id'> = {
        userId,
        title: topic || `Chat du ${new Date().toLocaleDateString('fr-FR')}`,
        lastMessage: '',
        lastMessageAt: new Date(),
        unreadCount: 0,
        isActive: true,
        topic
      };

      const docRef = await addDoc(collection(firestore, 'chatRooms'), {
        ...chatRoom,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp()
      });

      // Initialize Luna for this chat
      await AIService.initializeLuna(userId);

      return docRef.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  // Get all chat sessions for a user
  async getChatSessions(userId: string): Promise<ChatRoom[]> {
    try {
      const q = query(
        collection(firestore, 'chatRooms'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('lastMessageAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const chatRooms: ChatRoom[] = [];

      snapshot.forEach(doc => {
        chatRooms.push({
          id: doc.id,
          ...doc.data()
        } as ChatRoom);
      });

      return chatRooms;
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return [];
    }
  }

  // Send message in chat
  async sendMessage(
    chatRoomId: string, 
    message: string,
    attachments?: any[]
  ): Promise<ChatMessage> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      // Show typing indicator
      await this.setTypingIndicator(chatRoomId, true);

      // Get Luna's response
      const response = await AIService.sendMessage(userId, message, {
        chatRoomId,
        attachments
      });

      // Update chat room
      await updateDoc(doc(firestore, 'chatRooms', chatRoomId), {
        lastMessage: response.content.substring(0, 100),
        lastMessageAt: serverTimestamp(),
        unreadCount: 0
      });

      // Hide typing indicator
      await this.setTypingIndicator(chatRoomId, false);

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      await this.setTypingIndicator(chatRoomId, false);
      throw error;
    }
  }

  // Listen to messages in real-time
  listenToMessages(
    chatRoomId: string, 
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};

    const q = query(
      collection(firestore, `users/${userId}/conversations`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as ChatMessage);
      });
      callback(messages);
    });

    this.listeners.set(chatRoomId, unsubscribe);
    return unsubscribe;
  }

  // Set typing indicator
  async setTypingIndicator(chatRoomId: string, isTyping: boolean): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      if (isTyping) {
        // Clear existing timeout
        if (this.typingTimeout) {
          clearTimeout(this.typingTimeout);
        }

        // Set typing status
        await updateDoc(doc(firestore, 'chatRooms', chatRoomId), {
          'typing.luna': {
            isTyping: true,
            timestamp: serverTimestamp()
          }
        });

        // Auto-clear after 5 seconds
        this.typingTimeout = setTimeout(() => {
          this.setTypingIndicator(chatRoomId, false);
        }, 5000);
      } else {
        // Clear typing status
        await updateDoc(doc(firestore, 'chatRooms', chatRoomId), {
          'typing.luna': {
            isTyping: false,
            timestamp: serverTimestamp()
          }
        });

        if (this.typingTimeout) {
          clearTimeout(this.typingTimeout);
          this.typingTimeout = null;
        }
      }
    } catch (error) {
      console.error('Error setting typing indicator:', error);
    }
  }

  // Get quick replies based on context
  async getQuickReplies(context: string): Promise<QuickReply[]> {
    const quickReplies: QuickReply[] = [];

    // Context-based suggestions
    if (context.includes('mood')) {
      quickReplies.push(
        { id: '1', text: '😊 Je me sens bien' },
        { id: '2', text: '😔 Pas terrible' },
        { id: '3', text: '😐 Ça va' }
      );
    } else if (context.includes('help')) {
      quickReplies.push(
        { id: '1', text: 'J\'ai besoin de conseils' },
        { id: '2', text: 'Je veux parler de mes émotions' },
        { id: '3', text: 'Comment améliorer ma relation?' }
      );
    } else {
      // Default suggestions
      quickReplies.push(
        { id: '1', text: 'Raconte-moi plus' },
        { id: '2', text: 'J\'ai une question' },
        { id: '3', text: 'Merci Luna! 💕' }
      );
    }

    return quickReplies;
  }

  // Archive chat session
  async archiveChatSession(chatRoomId: string): Promise<void> {
    try {
      await updateDoc(doc(firestore, 'chatRooms', chatRoomId), {
        isActive: false,
        archivedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error archiving chat session:', error);
      throw error;
    }
  }

  // Delete chat session
  async deleteChatSession(chatRoomId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, 'chatRooms', chatRoomId));
      
      // Clean up listener
      const unsubscribe = this.listeners.get(chatRoomId);
      if (unsubscribe) {
        unsubscribe();
        this.listeners.delete(chatRoomId);
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  }

  // Get chat insights
  async getChatInsights(userId: string): Promise<any> {
    try {
      // Call Firebase Function for advanced analytics
      const getInsights = httpsCallable(functions, 'getChatInsights');
      const result = await getInsights({ userId });
      return result.data;
    } catch (error) {
      console.error('Error getting chat insights:', error);
      // Fallback to local analysis
      return await AIService.analyzeJournalPatterns(userId);
    }
  }

  // Export chat history
  async exportChatHistory(chatRoomId: string): Promise<string> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const messages = await AIService.getConversationHistory(userId);
      
      // Format messages for export
      const exportData = messages.map(msg => {
        const role = msg.role === 'user' ? 'Moi' : 'Luna';
        const time = new Date(msg.timestamp).toLocaleString('fr-FR');
        return `[${time}] ${role}: ${msg.content}`;
      }).join('\n\n');

      // Save to AsyncStorage for sharing
      const exportKey = `chat_export_${chatRoomId}`;
      await AsyncStorage.setItem(exportKey, exportData);

      return exportKey;
    } catch (error) {
      console.error('Error exporting chat history:', error);
      throw error;
    }
  }

  // Schedule daily check-in
  async scheduleDailyCheckIn(userId: string, hour: number = 20): Promise<void> {
    try {
      // This would typically use a notification service
      // For now, we'll store the preference
      await AsyncStorage.setItem(`checkIn_${userId}`, JSON.stringify({
        enabled: true,
        hour,
        lastCheckIn: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error scheduling daily check-in:', error);
      throw error;
    }
  }

  // Handle voice messages
  async sendVoiceMessage(
    chatRoomId: string,
    audioUri: string,
    duration: number
  ): Promise<ChatMessage> {
    try {
      // Upload audio to storage
      const audioUrl = await this.uploadAudio(audioUri);
      
      // Transcribe audio (would use a speech-to-text service)
      const transcription = await this.transcribeAudio(audioUrl);
      
      // Send as regular message with audio attachment
      return await this.sendMessage(chatRoomId, transcription, [{
        type: 'audio',
        url: audioUrl,
        duration
      }]);
    } catch (error) {
      console.error('Error sending voice message:', error);
      throw error;
    }
  }

  // Helper: Upload audio
  private async uploadAudio(uri: string): Promise<string> {
    // Implementation would use Firebase Storage
    // Placeholder for now
    return uri;
  }

  // Helper: Transcribe audio
  private async transcribeAudio(audioUrl: string): Promise<string> {
    // Implementation would use speech-to-text service
    // Placeholder for now
    return "Message vocal transcrit";
  }

  // Clean up all listeners
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }
}

export default new ChatService();