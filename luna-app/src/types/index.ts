export * from './user';
export * from './journal';

// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Profile: undefined;
  JournalEntry: { entryId?: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Journal: undefined;
  Insights: undefined;
  Chat: undefined;
};