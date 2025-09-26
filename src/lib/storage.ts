// Local storage utilities with fallbacks for AI Meeting Buddy

export const storage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.warn(`Failed to get ${key} from localStorage:`, error);
      return fallback;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  }
};

// Storage keys
export const STORAGE_KEYS = {
  PAST_MEETINGS: 'meeting_buddy_past_meetings',
  UPCOMING_MEETINGS: 'meeting_buddy_upcoming_meetings', 
  PREP_NOTES: 'meeting_buddy_prep_notes',
  FOLLOW_UPS: 'meeting_buddy_follow_ups',
  ACTIVITY_LOG: 'meeting_buddy_activity_log'
} as const;