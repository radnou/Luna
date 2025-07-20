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

  // Update relationship
  async updateRelationship(relationshipId: string, updates: Partial<Relationship>): Promise<void> {
    try {
      const relationshipRef = doc(db, this.relationshipsCollection, relationshipId);
      await updateDoc(relationshipRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating relationship:', error);
      throw new Error('Failed to update relationship');
    }
  }

  // Delete relationship
  async deleteRelationship(relationshipId: string): Promise<void> {
    try {
      const relationshipRef = doc(db, this.relationshipsCollection, relationshipId);
      await deleteDoc(relationshipRef);
    } catch (error) {
      console.error('Error deleting relationship:', error);
      throw new Error('Failed to delete relationship');
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

  // Get user statistics
  async getUserStats(userId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<any> {
    try {
      // This is a simplified implementation
      // In production, you'd want to use aggregation queries or Cloud Functions
      const entries = await this.getUserEntries(userId, 1000);
      
      const stats = {
        totalEntries: entries.length,
        currentStreak: this.calculateCurrentStreak(entries),
        longestStreak: this.calculateLongestStreak(entries),
        moodAverage: this.calculateMoodAverage(entries),
        topTags: this.calculateTopTags(entries),
        entriesByMonth: this.calculateEntriesByMonth(entries),
        moodByMonth: this.calculateMoodByMonth(entries),
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  // Log quick mood
  async logQuickMood(userId: string, moodValue: number): Promise<void> {
    try {
      const entry: Partial<JournalEntry> = {
        userId,
        content: `Quick mood log: ${moodValue}`,
        mood: {
          value: moodValue as 1 | 2 | 3 | 4 | 5,
          emoji: ['😢', '😔', '😐', '😊', '😍'][moodValue - 1],
          label: ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'][moodValue - 1],
          color: ['#B8B8FF', '#C774E8', '#FFB4A2', '#FF8CC8', '#FF6B9D'][moodValue - 1],
        },
        isPrivate: true,
        tags: ['mood-log'],
      };
      
      await this.createEntry(entry as JournalEntry);
    } catch (error) {
      console.error('Error logging quick mood:', error);
      throw new Error('Failed to log mood');
    }
  }

  // Helper methods for statistics
  private calculateCurrentStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;
    
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < entries.length - 1; i++) {
      const current = new Date(entries[i].createdAt);
      const next = new Date(entries[i + 1].createdAt);
      current.setHours(0, 0, 0, 0);
      next.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private calculateLongestStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;
    
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 0; i < entries.length - 1; i++) {
      const current = new Date(entries[i].createdAt);
      const next = new Date(entries[i + 1].createdAt);
      current.setHours(0, 0, 0, 0);
      next.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return longestStreak;
  }

  private calculateMoodAverage(entries: JournalEntry[]): number {
    const moodEntries = entries.filter(e => e.mood);
    if (moodEntries.length === 0) return 0;
    
    const sum = moodEntries.reduce((acc, entry) => acc + (entry.mood?.value || 0), 0);
    return sum / moodEntries.length;
  }

  private calculateTopTags(entries: JournalEntry[]): Array<{ tag: string; count: number }> {
    const tagCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      entry.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateEntriesByMonth(entries: JournalEntry[]): Array<{ month: string; count: number }> {
    const monthCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });
    
    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateMoodByMonth(entries: JournalEntry[]): Array<{ month: string; average: number }> {
    const monthMoods: Record<string, number[]> = {};
    
    entries.forEach(entry => {
      if (entry.mood) {
        const date = new Date(entry.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthMoods[monthKey]) {
          monthMoods[monthKey] = [];
        }
        monthMoods[monthKey].push(entry.mood.value);
      }
    });
    
    return Object.entries(monthMoods)
      .map(([month, moods]) => ({
        month,
        average: moods.reduce((a, b) => a + b, 0) / moods.length,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}

export const journalService = new JournalService();