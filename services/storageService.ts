
import { DailyLog, FoodItem, UserProfile, CommunityPost, UserGoals } from "../types";

const KEYS = {
  LOGS: 'nutriai_logs',
  PROFILE: 'nutriai_profile',
  POSTS: 'nutriai_community_posts'
};

const SEED_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    author: "Sarah Jenkins",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content: "Finally broke through my plateau! Down 2lbs this week thanks to the high protein plan. 💪",
    type: 'milestone',
    likes: 24,
    comments: 5,
    timestamp: Date.now() - 3600000
  },
  {
    id: 'p2',
    author: "Mike Chen",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    content: "Just tried this amazing quinoa bowl. The AI analysis was spot on with the macros.",
    type: 'meal',
    likes: 12,
    comments: 2,
    timestamp: Date.now() - 7200000
  }
];

export const getLogs = (): Record<string, DailyLog> => {
  const data = localStorage.getItem(KEYS.LOGS);
  return data ? JSON.parse(data) : {};
};

export const getLogForDate = (date: string): DailyLog => {
    const logs = getLogs();
    return logs[date] || { date, items: [] };
};

export const saveLogItem = (item: FoodItem, dateOverride?: string) => {
  const logs = getLogs();
  const dateKey = dateOverride || new Date().toISOString().split('T')[0];
  
  if (!logs[dateKey]) {
    logs[dateKey] = { date: dateKey, items: [] };
  }
  
  logs[dateKey].items.push(item);
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  return logs[dateKey];
};

export const deleteLogItem = (itemId: string, date: string) => {
    const logs = getLogs();
    if (logs[date]) {
        logs[date].items = logs[date].items.filter(i => i.id !== itemId);
        localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
    }
    return logs;
};

export const getProfile = (): UserProfile | null => {
  const data = localStorage.getItem(KEYS.PROFILE);
  const profile = data ? JSON.parse(data) : null;
  
  if (profile) {
      if (!profile.fasting) profile.fasting = { isFasting: false, startTime: null, endTime: null, goalHours: 16 };
      if (!profile.weightHistory) profile.weightHistory = [];
      if (!profile.weightLossRate) profile.weightLossRate = 1;
      // Default to dark mode if not set
      if (!profile.theme) profile.theme = 'dark';
      // Default avatar
      if (!profile.avatar) profile.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'User'}`;
  }
  
  return profile;
};

export const saveProfile = (profile: UserProfile) => {
    // Check if weight changed, if so, add to history
    const oldProfile = getProfile();
    if (oldProfile && oldProfile.currentWeight !== profile.currentWeight) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        const history = [...(profile.weightHistory || [])];
        // Limit history to last 30 entries
        if (history.length > 30) history.shift();
        history.push({ date: today, weight: profile.currentWeight });
        profile.weightHistory = history;
    } else if (!profile.weightHistory && oldProfile?.weightHistory) {
        profile.weightHistory = oldProfile.weightHistory;
    }

    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const getPosts = (): CommunityPost[] => {
  const data = localStorage.getItem(KEYS.POSTS);
  if (!data) {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(SEED_POSTS));
    return SEED_POSTS;
  }
  return JSON.parse(data);
};

export const savePost = (post: CommunityPost) => {
  const posts = getPosts();
  const newPosts = [post, ...posts];
  localStorage.setItem(KEYS.POSTS, JSON.stringify(newPosts));
  return newPosts;
};

export const toggleLike = (postId: string): CommunityPost[] => {
    const posts = getPosts();
    const updated = posts.map(p => {
        if (p.id === postId) {
            return { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked };
        }
        return p;
    });
    localStorage.setItem(KEYS.POSTS, JSON.stringify(updated));
    return updated;
};
