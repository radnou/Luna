import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  Timestamp,
  serverTimestamp,
  addDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase.config';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  JOURNAL_ENTRIES: 'journal_entries',
  ANALYSES: 'analyses',
  CONVERSATIONS: 'conversations',
  RELATIONSHIPS: 'relationships',
  NOTIFICATIONS: 'notifications'
} as const;

// Journal Entry Interface
export interface JournalEntry {
  id?: string;
  userId: string;
  title?: string;
  content: string;
  mood?: {
    value: number; // 1-10 scale
    emotion: string;
    color: string;
  };
  tags?: string[];
  astralInfluence?: {
    moonPhase: string;
    planetaryPositions: Record<string, any>;
    aspects: string[];
  };
  aiInsights?: {
    summary: string;
    themes: string[];
    suggestions: string[];
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  };
  attachments?: {
    type: 'image' | 'voice';
    url: string;
    thumbnail?: string;
  }[];
  isPrivate: boolean;
  createdAt: any;
  updatedAt: any;
}

// Analysis Interface
export interface Analysis {
  id?: string;
  userId: string;
  type: 'birth_chart' | 'compatibility' | 'transit' | 'progression' | 'synastry';
  title: string;
  description?: string;
  data: {
    chartData?: any; // Astrological chart data
    interpretation?: string;
    keyPoints?: string[];
    recommendations?: string[];
  };
  participants?: {
    userId?: string;
    name: string;
    birthData: {
      date: string;
      time: string;
      place: {
        city: string;
        country: string;
        latitude: number;
        longitude: number;
      };
    };
  }[];
  pdfUrl?: string;
  shareableLink?: string;
  isPublic: boolean;
  createdAt: any;
  updatedAt: any;
}

// Conversation Interface (Text Decoder)
export interface Conversation {
  id?: string;
  userId: string;
  title: string;
  messages: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: any;
    analysis?: {
      sentiment: string;
      topics: string[];
      astralContext?: any;
    };
  }[];
  context?: {
    type: 'relationship' | 'personal' | 'general';
    metadata?: Record<string, any>;
  };
  aiModel: 'gpt-4' | 'claude-3' | 'custom';
  tags?: string[];
  isArchived: boolean;
  createdAt: any;
  updatedAt: any;
}

// Relationship Interface
export interface Relationship {
  id?: string;
  userId: string;
  partnerId?: string; // If partner is also a user
  partnerName: string;
  partnerBirthData?: {
    date: string;
    time?: string;
    place?: {
      city: string;
      country: string;
      latitude: number;
      longitude: number;
    };
  };
  type: 'romantic' | 'friendship' | 'family' | 'professional';
  status: 'active' | 'past' | 'potential';
  compatibilityScore?: number;
  analyses?: string[]; // Analysis IDs
  notes?: string;
  milestones?: {
    date: string;
    event: string;
    description?: string;
  }[];
  createdAt: any;
  updatedAt: any;
}

class FirestoreService {
  // Generic CRUD operations
  async create<T extends DocumentData>(
    collectionName: string,
    data: T
  ): Promise<string> {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (data.id) {
        const docRef = doc(db, collectionName, data.id);
        await setDoc(docRef, docData);
        return data.id;
      } else {
        const docRef = await addDoc(collection(db, collectionName), docData);
        return docRef.id;
      }
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  async get<T>(
    collectionName: string,
    docId: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  async update<T extends DocumentData>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  async delete(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  async query<T>(
    collectionName: string,
    constraints: QueryConstraint[]
  ): Promise<T[]> {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  }

  // Real-time listeners
  subscribe<T>(
    collectionName: string,
    constraints: QueryConstraint[],
    callback: (data: T[]) => void
  ): Unsubscribe {
    const q = query(collection(db, collectionName), ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      callback(data);
    });
  }

  subscribeToDoc<T>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void
  ): Unsubscribe {
    const docRef = doc(db, collectionName, docId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    });
  }

  // Specialized methods for journal entries
  async getUserJournalEntries(
    userId: string,
    limitCount = 20,
    lastDoc?: DocumentData
  ): Promise<JournalEntry[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    ];
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    return this.query<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, constraints);
  }

  async getJournalEntriesByMood(
    userId: string,
    moodValue: number,
    range = 1
  ): Promise<JournalEntry[]> {
    const constraints = [
      where('userId', '==', userId),
      where('mood.value', '>=', moodValue - range),
      where('mood.value', '<=', moodValue + range),
      orderBy('mood.value'),
      orderBy('createdAt', 'desc')
    ];
    
    return this.query<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, constraints);
  }

  // Specialized methods for analyses
  async getUserAnalyses(
    userId: string,
    type?: Analysis['type']
  ): Promise<Analysis[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ];
    
    if (type) {
      constraints.splice(1, 0, where('type', '==', type));
    }
    
    return this.query<Analysis>(COLLECTIONS.ANALYSES, constraints);
  }

  // Specialized methods for conversations
  async getUserConversations(
    userId: string,
    isArchived = false
  ): Promise<Conversation[]> {
    const constraints = [
      where('userId', '==', userId),
      where('isArchived', '==', isArchived),
      orderBy('updatedAt', 'desc')
    ];
    
    return this.query<Conversation>(COLLECTIONS.CONVERSATIONS, constraints);
  }

  async addMessageToConversation(
    conversationId: string,
    message: Conversation['messages'][0]
  ): Promise<void> {
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    const conversation = await this.get<Conversation>(COLLECTIONS.CONVERSATIONS, conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    const updatedMessages = [...conversation.messages, message];
    
    await updateDoc(conversationRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp()
    });
  }

  // Specialized methods for relationships
  async getUserRelationships(
    userId: string,
    type?: Relationship['type'],
    status?: Relationship['status']
  ): Promise<Relationship[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ];
    
    if (type) {
      constraints.splice(1, 0, where('type', '==', type));
    }
    
    if (status) {
      constraints.splice(type ? 2 : 1, 0, where('status', '==', status));
    }
    
    return this.query<Relationship>(COLLECTIONS.RELATIONSHIPS, constraints);
  }

  // Batch operations
  async batchCreate<T extends DocumentData>(
    collectionName: string,
    items: T[]
  ): Promise<string[]> {
    const ids: string[] = [];
    
    for (const item of items) {
      const id = await this.create(collectionName, item);
      ids.push(id);
    }
    
    return ids;
  }

  // Search functionality (basic text search)
  async searchJournalEntries(
    userId: string,
    searchTerm: string
  ): Promise<JournalEntry[]> {
    // Note: For production, consider using Algolia or Elasticsearch
    // This is a basic implementation
    const entries = await this.getUserJournalEntries(userId, 100);
    
    const searchLower = searchTerm.toLowerCase();
    return entries.filter(entry => 
      entry.content.toLowerCase().includes(searchLower) ||
      entry.title?.toLowerCase().includes(searchLower) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
}

export default new FirestoreService();