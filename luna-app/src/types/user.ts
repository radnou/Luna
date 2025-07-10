export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  firstName: string;
  lastName?: string;
  dateOfBirth?: Date;
  bio?: string;
  interests?: string[];
  preferences?: UserPreferences;
  isPremium?: boolean;
}

export interface UserPreferences {
  notifications: {
    journal: boolean;
    insights: boolean;
    reminders: boolean;
  };
  privacy: {
    isProfilePublic: boolean;
    shareInsights: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}