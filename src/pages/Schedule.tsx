// Schedule page for AI Meeting Buddy
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { getCalendarSlots, addUpcomingMeeting, addActivityLog } from '../lib/dataService';
import { findOverlappingSlots, formatDisplayTime } from '../lib/time';
import { format, addDays } from 'date-fns';

interface SuggestedSlot {
  date: string;
  chennaiTime: { start: string; end: string };
  germanyTime: { start: string; end: string };
  utcTime: { start: string; end: string };
}

const Schedule: React.FC = () => {
  const [duration, setDuration] = useState(30);
  const [suggestions, setSuggestions] = useState<SuggestedSlot[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showInfo } = useToast();

  // Mock calendar data for display
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      days.push({
        date: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'EEE'),
        dayNum: format(date, 'd'),
        isToday: i === 0
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  const findSlots = async () => {
    setIsLoading(true);
    try {
      const calendarData = getCalendarSlots();
      const overlaps = findOverlappingSlots(
        calendarData.chennaiIST,
        calendarData.germanyCET,
        duration
      );
      
      setSuggestions(overlaps);
      setCurrentSuggestion(0);
      
      if (overlaps.length > 0) {
        setIsModalOpen(true);
        addActivityLog('slot_search', `Found ${overlaps.length} available slots for ${duration} minute meeting`);
      } else {
        showInfo('No overlapping slots found. Try a different duration or date range.');
      }
    } catch (error) {
      console.error('Error finding slots:', error);
      showInfo('Error finding slots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const acceptSlot = () => {
    const slot = suggestions[currentSuggestion];
    if (!slot) return;

    const meetingId = Math.random().toString(36).substring(7);
    const newMeeting = {
      id: meetingId,
      date: slot.date,
      topic: 'Germany Distributor Meeting',
      chennaiTime: `${slot.chennaiTime.start}-${slot.chennaiTime.end}`,
      germanyTime: `${slot.germanyTime.start}-${slot.germanyTime.end}`,
      status: 'scheduled' as const
    };

    addUpcomingMeeting(newMeeting);
    addActivityLog('meeting_scheduled', `Meeting scheduled for ${format(new Date(slot.date), 'MMM dd')}`);
    
    showSuccess('Meeting slot reserved! Placeholder invite created.');
    setIsModalOpen(false);
  };

  const tryNextSlot = () => {
    if (currentSuggestion < suggestions.length - 1) {
      setCurrentSuggestion(currentSuggestion + 1);
    } else {
      showInfo('No more suggestions available. Try a different duration.');
    }
  };

  const renderTimeBar = (timeZone: string, slots: Array<[string, string]>) => {
    // Simple visualization of free/busy times
    const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM
    
    return (
      <div className="flex items-center gap-1">
        {hours.map(hour => {
          const timeStr = `${hour.toString().padStart(2, '0')}:00`;
          const isFree = slots.some(([start, end]) => {
            const startHour = parseInt(start.split(':')[0]);
            const endHour = parseInt(end.split(':')[0]);
            return hour >= startHour && hour < endHour;
          });
          
          return (
            <div
              key={hour}
              className={`w-6 h-6 rounded ${
                isFree ? 'bg-success/30' : 'bg-muted'
              }`}
              title={`${timeStr} - ${isFree ? 'Free' : 'Busy'}`}
            />
          );
        })}
      </div>
    );
  };

  const currentSlot = suggestions[currentSuggestion];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card title="Find Meeting Slot">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Meeting Duration</label>
            <select 
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="meeting-input w-48"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          
          <button 
            onClick={findSlots}
            disabled={isLoading}
            className="meeting-button-primary"
          >
            {isLoading ? 'Searching...' : 'Suggest Slot'}
          </button>
        </div>
      </Card>

      {/* Calendar Overview */}
      <Card title="7-Day Availability">
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-8 gap-4 text-sm font-medium text-muted-foreground">
            <div>Time Zone</div>
            {calendarDays.map(day => (
              <div key={day.date} className="text-center">
                <div>{day.dayName}</div>
                <div className={`text-lg ${day.isToday ? 'text-primary font-bold' : ''}`}>
                  {day.dayNum}
                </div>
              </div>
            ))}
          </div>

          {/* Chennai IST */}
          <div className="grid grid-cols-8 gap-4 items-center">
            <div className="text-sm font-medium">
              Chennai IST
              <div className="text-xs text-muted-foreground">GMT+5:30</div>
            </div>
            {calendarDays.map(day => (
              <div key={`chennai-${day.date}`} className="text-center">
                {renderTimeBar('IST', [['10:00', '12:00'], ['15:00', '18:00']])}
              </div>
            ))}
          </div>

          {/* Germany CET */}
          <div className="grid grid-cols-8 gap-4 items-center">
            <div className="text-sm font-medium">
              Germany CET
              <div className="text-xs text-muted-foreground">GMT+1</div>
            </div>
            {calendarDays.map(day => (
              <div key={`germany-${day.date}`} className="text-center">
                {renderTimeBar('CET', [['07:00', '10:30'], ['13:00', '16:30']])}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success/30 rounded"></div>
            <span>Free</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded"></div>
            <span>Busy</span>
          </div>
        </div>
      </Card>

      {/* Suggestion Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Meeting Time Suggestion"
        size="md"
      >
        {currentSlot ? (
          <div className="space-y-6">
            {/* Suggestion Details */}
            <div className="text-center bg-secondary/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Suggested: {format(new Date(currentSlot.date), 'EEEE, MMM dd')}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chennai (IST):</span>
                  <span className="font-semibold text-primary">
                    {currentSlot.chennaiTime.start} - {currentSlot.chennaiTime.end}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Germany (CET):</span>
                  <span className="font-semibold text-primary">
                    {currentSlot.germanyTime.start} - {currentSlot.germanyTime.end}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{duration} minutes</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="meeting-button-ghost"
              >
                Cancel
              </button>
              
              {currentSuggestion < suggestions.length - 1 && (
                <button
                  onClick={tryNextSlot}
                  className="meeting-button-ghost"
                >
                  Try Next ({suggestions.length - currentSuggestion - 1} more)
                </button>
              )}
              
              <button
                onClick={acceptSlot}
                className="meeting-button-primary"
              >
                Accept & Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No suggestions available
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Schedule;