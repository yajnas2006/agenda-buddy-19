// Data service for AI Meeting Buddy mock data
import { storage, STORAGE_KEYS } from './storage';
import pastMeetingsData from '../data/pastMeetings.json';
import prepNotesData from '../data/prepNotes.json';
import calendarSlotsData from '../data/calendarSlots.json';

export interface Meeting {
  id: string;
  date: string;
  topic: string;
  outcome: string;
  notes: string;
}

export interface UpcomingMeeting {
  id: string;
  date: string;
  topic: string;
  chennaiTime: string;
  germanyTime: string;
  status: 'scheduled' | 'confirmed';
}

export interface PrepNote {
  id: string;
  meetingId: string | null;
  items: string[];
}

export interface FollowUp {
  id: string;
  text: string;
  owner: string;
  dueDate: string;
  status: 'open' | 'done';
  createdAt: string;
}

export interface SalesData {
  date: string;
  product: string;
  customer_type: string;
  licenses: number;
  region: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

// Initialize data on first load
export const initializeData = () => {
  // Load past meetings if not exists
  const existingPastMeetings = storage.get(STORAGE_KEYS.PAST_MEETINGS, null);
  if (!existingPastMeetings) {
    storage.set(STORAGE_KEYS.PAST_MEETINGS, pastMeetingsData);
  }

  // Initialize other data structures
  if (!storage.get(STORAGE_KEYS.UPCOMING_MEETINGS, null)) {
    storage.set(STORAGE_KEYS.UPCOMING_MEETINGS, []);
  }

  if (!storage.get(STORAGE_KEYS.PREP_NOTES, null)) {
    storage.set(STORAGE_KEYS.PREP_NOTES, prepNotesData);
  }

  if (!storage.get(STORAGE_KEYS.FOLLOW_UPS, null)) {
    storage.set(STORAGE_KEYS.FOLLOW_UPS, []);
  }

  if (!storage.get(STORAGE_KEYS.ACTIVITY_LOG, null)) {
    storage.set(STORAGE_KEYS.ACTIVITY_LOG, []);
  }
};

// Get data functions
export const getPastMeetings = (): Meeting[] => {
  return storage.get(STORAGE_KEYS.PAST_MEETINGS, pastMeetingsData);
};

export const getUpcomingMeetings = (): UpcomingMeeting[] => {
  return storage.get(STORAGE_KEYS.UPCOMING_MEETINGS, []);
};

export const getPrepNotes = (): PrepNote[] => {
  return storage.get(STORAGE_KEYS.PREP_NOTES, prepNotesData);
};

export const getFollowUps = (): FollowUp[] => {
  return storage.get(STORAGE_KEYS.FOLLOW_UPS, []);
};

export const getActivityLog = (): ActivityLog[] => {
  return storage.get(STORAGE_KEYS.ACTIVITY_LOG, []);
};

export const getCalendarSlots = () => {
  return calendarSlotsData;
};

// Parse sales CSV data
export const parseSalesData = async (): Promise<SalesData[]> => {
  try {
    const response = await fetch('/src/data/sales.csv');
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = header === 'licenses' ? parseInt(values[index]) : values[index];
        return obj;
      }, {} as any);
    });
  } catch (error) {
    console.warn('Failed to load sales data:', error);
    return [];
  }
};

// Parse reminders CSV data  
export const parseRemindersData = async (): Promise<Array<{date: string, who: string, reminder: string}>> => {
  try {
    const response = await fetch('/src/data/reminders.csv');
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {} as any);
    });
  } catch (error) {
    console.warn('Failed to load reminders data:', error);
    return [];
  }
};

// Update data functions
export const addUpcomingMeeting = (meeting: UpcomingMeeting) => {
  const meetings = getUpcomingMeetings();
  meetings.push(meeting);
  storage.set(STORAGE_KEYS.UPCOMING_MEETINGS, meetings);
};

export const updatePrepNotes = (notes: PrepNote[]) => {
  storage.set(STORAGE_KEYS.PREP_NOTES, notes);
};

export const addFollowUp = (followUp: FollowUp) => {
  const followUps = getFollowUps();
  followUps.push(followUp);
  storage.set(STORAGE_KEYS.FOLLOW_UPS, followUps);
};

export const updateFollowUp = (id: string, updates: Partial<FollowUp>) => {
  const followUps = getFollowUps();
  const index = followUps.findIndex(f => f.id === id);
  if (index !== -1) {
    followUps[index] = { ...followUps[index], ...updates };
    storage.set(STORAGE_KEYS.FOLLOW_UPS, followUps);
  }
};

export const addActivityLog = (action: string, details: string) => {
  const logs = getActivityLog();
  logs.push({
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    action,
    details
  });
  storage.set(STORAGE_KEYS.ACTIVITY_LOG, logs);
};