// Dashboard page for AI Meeting Buddy
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table, { TableColumn } from '../components/Table';
import StatusPill from '../components/StatusPill';
import { getPastMeetings, getUpcomingMeetings, getFollowUps, type Meeting, type UpcomingMeeting, type FollowUp } from '../lib/dataService';
import { format, parseISO } from 'date-fns';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const [pastMeetings, setPastMeetings] = useState<Meeting[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    setPastMeetings(getPastMeetings().slice(0, 5)); // Last 5 meetings
    setUpcomingMeetings(getUpcomingMeetings());
    setFollowUps(getFollowUps().filter(f => f.status === 'open').slice(0, 3)); // Top 3 open follow-ups
  }, []);

  // Get next upcoming meeting
  const nextMeeting = upcomingMeetings[0];

  // Count prep items due today (mock)
  const prepDueToday = 2;

  const pastMeetingColumns: TableColumn<Meeting>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (meeting) => format(parseISO(meeting.date), 'MMM dd'),
      className: 'w-20'
    },
    {
      key: 'topic',
      header: 'Topic',
      className: 'font-medium'
    },
    {
      key: 'outcome',
      header: 'Outcome',
      className: 'text-muted-foreground'
    }
  ];

  const followUpColumns: TableColumn<FollowUp>[] = [
    {
      key: 'text',
      header: 'Follow-up',
      className: 'font-medium'
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (item) => <StatusPill status="info">{item.owner}</StatusPill>,
      className: 'w-24'
    },
    {
      key: 'dueDate',
      header: 'Due',
      render: (item) => format(parseISO(item.dueDate), 'MMM dd'),
      className: 'w-20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Meeting */}
        <Card
          title="Next Meeting"
          actions={
            <button 
              onClick={() => onPageChange('schedule')}
              className="meeting-button-ghost text-sm"
            >
              View All
            </button>
          }
        >
          {nextMeeting ? (
            <div className="space-y-2">
              <h4 className="font-medium">{nextMeeting.topic}</h4>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(nextMeeting.date), 'MMM dd, yyyy')}
              </p>
              <p className="text-sm">
                <span className="text-primary font-medium">{nextMeeting.chennaiTime} IST</span>
                <span className="text-muted-foreground"> • </span>
                <span className="text-primary font-medium">{nextMeeting.germanyTime} CET</span>
              </p>
              <StatusPill status={nextMeeting.status === 'confirmed' ? 'success' : 'warning'}>
                {nextMeeting.status}
              </StatusPill>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 1.5M14 7l.5 1.5M16 7l.5 1.5M8 7L7.5 8.5" />
              </svg>
              <p>No upcoming meetings</p>
            </div>
          )}
        </Card>

        {/* Open Follow-ups */}
        <Card
          title="Open Follow-ups"
          actions={
            <button 
              onClick={() => onPageChange('notes')}
              className="meeting-button-ghost text-sm"
            >
              View All
            </button>
          }
        >
          {followUps.length > 0 ? (
            <div className="space-y-3">
              {followUps.map((followUp) => (
                <div key={followUp.id} className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{followUp.text}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {format(parseISO(followUp.dueDate), 'MMM dd')} • {followUp.owner}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>All caught up!</p>
            </div>
          )}
        </Card>

        {/* Prep Due Today */}
        <Card
          title="Prep Due Today"
          actions={
            <button 
              onClick={() => onPageChange('prep')}
              className="meeting-button-ghost text-sm"
            >
              View All
            </button>
          }
        >
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-primary mb-2">{prepDueToday}</div>
            <p className="text-sm text-muted-foreground">Items need attention</p>
          </div>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onPageChange('schedule')}
            className="meeting-button-primary text-center p-4 flex flex-col items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 1.5M14 7l.5 1.5M16 7l.5 1.5M8 7L7.5 8.5" />
            </svg>
            Find Slot
          </button>

          <button 
            onClick={() => onPageChange('prep')}
            className="meeting-button-ghost text-center p-4 flex flex-col items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Prepare Agenda
          </button>

          <button className="meeting-button-ghost text-center p-4 flex flex-col items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7z" />
            </svg>
            Send Reminder
          </button>

          <button 
            onClick={() => onPageChange('notes')}
            className="meeting-button-ghost text-center p-4 flex flex-col items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Log Follow-up
          </button>
        </div>
      </Card>

      {/* Recent Meetings Timeline */}
      <Card title="Recent Meetings">
        <Table 
          data={pastMeetings}
          columns={pastMeetingColumns}
          emptyMessage="No past meetings found"
        />
      </Card>
    </div>
  );
};

export default Dashboard;