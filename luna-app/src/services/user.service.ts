import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { User, UserProfile } from '@types/user';

class UserService {
  private collection = 'users';

  // Create a new user document
  async createUser(userData: User): Promise<void> {
    try {
      const userRef = doc(db, this.collection, userData.id);
      await setDoc(userRef, {
        ...userData,
        createdAt: Timestamp.fromDate(userData.createdAt),
        updatedAt: Timestamp.fromDate(userData.updatedAt),
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user profile');
    }
  }

  // Get user by ID
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, this.collection, userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          ...data,
          id: userSnap.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to get user profile');
    }
  }

  // Update user profile
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, this.collection, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user profile');
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, this.collection, userId);
      await updateDoc(userRef, {
        profile,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.collection, userId);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user profile');
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await this.getUser(userId);
      return user?.profile || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update profile
  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    await this.updateUserProfile(userId, profile);
  }

  // Update user preferences
  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      const userRef = doc(db, this.collection, userId);
      await updateDoc(userRef, {
        'profile.preferences': preferences,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }

  // Get user stats
  async getUserStats(userId: string): Promise<any> {
    // This would typically query from a stats collection or aggregate data
    return {
      totalEntries: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  // Privacy settings methods
  async getPrivacySettings(userId: string): Promise<any> {
    try {
      const userRef = doc(db, this.collection, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data().privacySettings || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting privacy settings:', error);
      return null;
    }
  }

  async updatePrivacySettings(userId: string, settings: any): Promise<void> {
    try {
      const userRef = doc(db, this.collection, userId);
      await updateDoc(userRef, {
        privacySettings: settings,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw new Error('Failed to update privacy settings');
    }
  }

  // Request data export
  async requestDataExport(userId: string): Promise<void> {
    // This would typically trigger a backend process
    console.log('Data export requested for user:', userId);
  }
}

export const userService = new UserService();