import { JournalPrompt, JournalTemplate } from '@types/journal';

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Self-reflection
  { id: 'sr1', category: 'self-reflection', text: 'What made you smile today?', emoji: '😊' },
  { id: 'sr2', category: 'self-reflection', text: 'What are three things you\'re grateful for right now?', emoji: '🙏' },
  { id: 'sr3', category: 'self-reflection', text: 'How have you grown as a person this week?', emoji: '🌱' },
  { id: 'sr4', category: 'self-reflection', text: 'What\'s something you\'ve been avoiding that you need to face?', emoji: '💪' },
  { id: 'sr5', category: 'self-reflection', text: 'Describe a moment today when you felt truly yourself', emoji: '✨' },

  // Relationship
  { id: 'r1', category: 'relationship', text: 'What do you miss most about them?', emoji: '💭' },
  { id: 'r2', category: 'relationship', text: 'What lesson did this relationship teach you?', emoji: '📚' },
  { id: 'r3', category: 'relationship', text: 'If you could say one thing to them right now, what would it be?', emoji: '💌' },
  { id: 'r4', category: 'relationship', text: 'What red flags did you ignore and why?', emoji: '🚩' },
  { id: 'r5', category: 'relationship', text: 'How has this relationship changed your view on love?', emoji: '💕' },
  { id: 'r6', category: 'relationship', text: 'What boundaries do you need to set in future relationships?', emoji: '🛡️' },

  // Gratitude
  { id: 'g1', category: 'gratitude', text: 'Who in your life are you most grateful for and why?', emoji: '🤗' },
  { id: 'g2', category: 'gratitude', text: 'What\'s a small thing that brought you joy today?', emoji: '🌈' },
  { id: 'g3', category: 'gratitude', text: 'What ability or skill are you grateful to have?', emoji: '🎯' },

  // Goals
  { id: 'go1', category: 'goals', text: 'What\'s one goal you want to achieve this month?', emoji: '🎯' },
  { id: 'go2', category: 'goals', text: 'What habits do you want to build or break?', emoji: '🔄' },
  { id: 'go3', category: 'goals', text: 'Where do you see yourself in 6 months?', emoji: '🔮' },
  { id: 'go4', category: 'goals', text: 'What\'s holding you back from your dreams?', emoji: '🚀' },

  // Memories
  { id: 'm1', category: 'memories', text: 'Describe your favorite memory with them', emoji: '📸' },
  { id: 'm2', category: 'memories', text: 'What\'s a childhood memory that still makes you happy?', emoji: '🧸' },
  { id: 'm3', category: 'memories', text: 'Write about a time you felt incredibly proud of yourself', emoji: '🏆' },
];

export const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    id: 't1',
    name: 'Daily Check-In',
    description: 'A simple template for daily reflection',
    category: 'daily',
    content: `Today's Highlights:
- 

How I'm Feeling:


What I'm Grateful For:
1. 
2. 
3. 

Tomorrow's Intention:
`,
    tags: ['daily', 'gratitude', 'reflection'],
    prompts: ['What made today special?', 'How did I take care of myself today?'],
  },
  {
    id: 't2',
    name: 'Relationship Reflection',
    description: 'Process your thoughts about a relationship',
    category: 'relationship',
    content: `Person: 

Current Status:


What I Appreciate(d):
- 

What Challenged Me:
- 

Lessons Learned:


How I'm Growing:
`,
    tags: ['relationship', 'growth', 'reflection'],
    prompts: ['What patterns do I notice?', 'What would I do differently?'],
  },
  {
    id: 't3',
    name: 'Emotional Release',
    description: 'Let out your feelings in a safe space',
    category: 'emotional',
    content: `Right now I'm feeling:


This emotion is telling me:


What triggered this feeling:


What I need right now:


One small step I can take:
`,
    tags: ['emotions', 'selfcare', 'healing'],
    prompts: ['Where do I feel this in my body?', 'What would I tell a friend feeling this way?'],
  },
  {
    id: 't4',
    name: 'Dream & Goals',
    description: 'Visualize and plan your future',
    category: 'goals',
    content: `My Dream:


Why This Matters to Me:


Steps to Get There:
1. 
2. 
3. 

Potential Obstacles:


How I'll Overcome Them:


First Action:
`,
    tags: ['goals', 'dreams', 'planning'],
    prompts: ['What would success feel like?', 'Who can support me in this?'],
  },
  {
    id: 't5',
    name: 'Gratitude Practice',
    description: 'Focus on the positive in your life',
    category: 'gratitude',
    content: `Three Things I'm Grateful For:
1. 
2. 
3. 

Someone Who Made My Day Better:


A Challenge That Helped Me Grow:


Something Beautiful I Noticed:


How I Showed Kindness Today:
`,
    tags: ['gratitude', 'positivity', 'mindfulness'],
    prompts: ['What abundance do I have in my life?', 'How can I spread more joy?'],
  },
];

export const getRandomPrompt = (category?: JournalPrompt['category']): JournalPrompt => {
  const prompts = category 
    ? JOURNAL_PROMPTS.filter(p => p.category === category)
    : JOURNAL_PROMPTS;
  
  return prompts[Math.floor(Math.random() * prompts.length)];
};

export const getDailyPrompt = (): JournalPrompt => {
  // Use date as seed for consistent daily prompt
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % JOURNAL_PROMPTS.length;
  
  return JOURNAL_PROMPTS[index];
};