// Time zone utilities for AI Meeting Buddy
import { format, parse, addMinutes, isAfter, isBefore } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export const TIME_ZONES = {
  CHENNAI: 'Asia/Kolkata',
  GERMANY: 'Europe/Berlin'
} as const;

export interface TimeSlot {
  start: string;
  end: string;
}

export interface CalendarDay {
  date: string;
  free: string[][];
}

export interface CalendarData {
  chennaiIST: CalendarDay[];
  germanyCET: CalendarDay[];
}

// Convert time string to Date object in specific timezone
export const parseTimeInZone = (dateStr: string, timeStr: string, timeZone: string): Date => {
  const dateTime = `${dateStr}T${timeStr}:00`;
  const parsedDate = new Date(dateTime);
  return fromZonedTime(parsedDate, timeZone);
};

// Find overlapping free slots between two calendars
export const findOverlappingSlots = (
  chennaiSlots: CalendarDay[],
  germanySlots: CalendarDay[],
  durationMinutes: number
): Array<{
  date: string;
  chennaiTime: TimeSlot;
  germanyTime: TimeSlot;
  utcTime: TimeSlot;
}> => {
  const overlaps = [];

  for (const chennaiDay of chennaiSlots) {
    const germanyDay = germanySlots.find(g => g.date === chennaiDay.date);
    if (!germanyDay) continue;

    for (const chennaiSlot of chennaiDay.free) {
      const [chennaiStart, chennaiEnd] = chennaiSlot;
      for (const germanySlot of germanyDay.free) {
        const [germanyStart, germanyEnd] = germanySlot;
        // Convert to UTC for comparison
        const chennaiStartUTC = parseTimeInZone(chennaiDay.date, chennaiStart, TIME_ZONES.CHENNAI);
        const chennaiEndUTC = parseTimeInZone(chennaiDay.date, chennaiEnd, TIME_ZONES.CHENNAI);
        const germanyStartUTC = parseTimeInZone(germanyDay.date, germanyStart, TIME_ZONES.GERMANY);
        const germanyEndUTC = parseTimeInZone(germanyDay.date, germanyEnd, TIME_ZONES.GERMANY);

        // Find overlap
        const overlapStart = new Date(Math.max(chennaiStartUTC.getTime(), germanyStartUTC.getTime()));
        const overlapEnd = new Date(Math.min(chennaiEndUTC.getTime(), germanyEndUTC.getTime()));

        // Check if overlap is long enough
        const overlapDuration = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60);
        if (overlapDuration >= durationMinutes) {
          const meetingEnd = addMinutes(overlapStart, durationMinutes);
          
          overlaps.push({
            date: chennaiDay.date,
            chennaiTime: {
              start: format(toZonedTime(overlapStart, TIME_ZONES.CHENNAI), 'HH:mm'),
              end: format(toZonedTime(meetingEnd, TIME_ZONES.CHENNAI), 'HH:mm')
            },
            germanyTime: {
              start: format(toZonedTime(overlapStart, TIME_ZONES.GERMANY), 'HH:mm'),
              end: format(toZonedTime(meetingEnd, TIME_ZONES.GERMANY), 'HH:mm')
            },
            utcTime: {
              start: format(overlapStart, 'HH:mm'),
              end: format(meetingEnd, 'HH:mm')
            }
          });
        }
      }
    }
  }

  return overlaps.slice(0, 5); // Return first 5 suggestions
};

// Format display time for UI
export const formatDisplayTime = (date: string, time: string, timeZone: string): string => {
  const dateTime = parseTimeInZone(date, time, timeZone);
  const zonedTime = toZonedTime(dateTime, timeZone);
  return format(zonedTime, 'MMM dd, HH:mm');
};