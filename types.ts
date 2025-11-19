
export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export type LogType = 'food' | 'exercise';

export interface FoodItem {
  id: string;
  name: string;
  portion: string; // e.g., "1 cup", "100g", "30 mins"
  calories: number;
  macros: Macros;
  timestamp: number;
  image?: string;
  type: LogType;
  source: 'manual' | 'ai-text' | 'ai-image' | 'calculator';
}

export type RegimenType = 'balanced' | 'low-carb' | 'keto' | 'high-protein' | 'vegan' | 'intermittent-fasting';

export interface FastingState {
  isFasting: boolean;
  startTime: number | null; // Timestamp
  endTime: number | null; // Timestamp (projected)
  goalHours: number;
}

export interface WeightEntry {
    date: string;
    weight: number;
}

export interface UserProfile {
  name: string;
  avatar?: string; // Added avatar
  age: number;
  gender: 'male' | 'female' | 'other';
  heightFt: number; 
  heightIn: number;
  currentWeight: number; // lbs
  goalWeight: number; // lbs
  weightLossRate: number; // lbs per week
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  regimen: RegimenType;
  goals: UserGoals;
  theme: 'light' | 'dark';
  fasting: FastingState;
  weightHistory: WeightEntry[];
}

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyLog {
  date: string;
  items: FoodItem[];
}

export interface CommunityPost {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  type: 'milestone' | 'meal' | 'question' | 'status';
  image?: string;
  likes: number;
  comments: number;
  timestamp: number;
  isLiked?: boolean;
}

export enum AppView {
  DASHBOARD = 'dashboard',
  FASTING = 'fasting',
  COMMUNITY = 'community',
  LOG_FOOD = 'log_food',
  AI_CHAT = 'ai_chat',
  PROFILE = 'profile'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isTyping?: boolean;
}
