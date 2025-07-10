export interface JournalEntry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  mood?: Mood;
  tags?: string[];
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
  relationshipId?: string;
  isDraft?: boolean;
  promptId?: string;
  location?: {
    name?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface Mood {
  value: 1 | 2 | 3 | 4 | 5; // 1 = very sad, 5 = very happy
  emoji: string;
  label: string;
  color: string;
}

export const MOOD_OPTIONS: Mood[] = [
  { value: 1, emoji: '😢', label: 'Very Sad', color: '#B8B8FF' },
  { value: 2, emoji: '😔', label: 'Sad', color: '#C774E8' },
  { value: 3, emoji: '😐', label: 'Neutral', color: '#FFB4A2' },
  { value: 4, emoji: '😊', label: 'Happy', color: '#FF8CC8' },
  { value: 5, emoji: '😍', label: 'Very Happy', color: '#FF6B9D' }
];

export interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  storagePath: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface JournalPrompt {
  id: string;
  category: 'self-reflection' | 'relationship' | 'gratitude' | 'goals' | 'memories';
  text: string;
  emoji: string;
}

export interface JournalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  tags: string[];
  prompts?: string[];
}

export interface JournalStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  moodAverage: number;
  topTags: Array<{ tag: string; count: number }>;
  entriesByMonth: Array<{ month: string; count: number }>;
  moodByMonth: Array<{ month: string; average: number }>;
}

export interface Relationship {
  id: string;
  userId: string;
  name: string;
  type: 'romantic' | 'friendship' | 'family' | 'other';
  status: 'active' | 'ended' | 'complicated';
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}