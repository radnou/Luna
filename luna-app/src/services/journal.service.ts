import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { JournalEntry, Relationship } from '@types/journal';

class JournalService {
  private entriesCollection = 'journalEntries';
  private relationshipsCollection = 'relationships';

  // Create a new journal entry
  async createEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const entryData = {
        ...entry,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, this.entriesCollection), entryData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw new Error('Failed to create journal entry');
    }
  }

  // Get journal entries for a user
  async getUserEntries(userId: string, limitCount: number = 50): Promise<JournalEntry[]> {
    try {
      const q = query(
        collection(db, this.entriesCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      } as JournalEntry));
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw new Error('Failed to get journal entries');
    }
  }

  // Get a single journal entry
  async getEntry(entryId: string): Promise<JournalEntry | null> {
    try {
      const entryRef = doc(db, this.entriesCollection, entryId);
      const entrySnap = await getDoc(entryRef);

      if (entrySnap.exists()) {
        const data = entrySnap.data();
        return {
          id: entrySnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as JournalEntry;
      }
      return null;
    } catch (error) {
      console.error('Error getting journal entry:', error);
      throw new Error('Failed to get journal entry');
    }
  }

  // Update journal entry
  async updateEntry(entryId: string, updates: Partial<JournalEntry>): Promise<void> {
    try {
      const entryRef = doc(db, this.entriesCollection, entryId);
      await updateDoc(entryRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw new Error('Failed to update journal entry');
    }
  }

  // Delete journal entry
  async deleteEntry(entryId: string): Promise<void> {
    try {
      const entryRef = doc(db, this.entriesCollection, entryId);
      await deleteDoc(entryRef);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw new Error('Failed to delete journal entry');
    }
  }

  // Create a new relationship
  async createRelationship(relationship: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const relationshipData = {
        ...relationship,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, this.relationshipsCollection), relationshipData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating relationship:', error);
      throw new Error('Failed to create relationship');
    }
  }

  // Get user relationships
  async getUserRelationships(userId: string): Promise<Relationship[]> {
    try {
      const q = query(
        collection(db, this.relationshipsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
      } as Relationship));
    } catch (error) {
      console.error('Error getting relationships:', error);
      throw new Error('Failed to get relationships');
    }
  }
}

export const journalService = new JournalService();