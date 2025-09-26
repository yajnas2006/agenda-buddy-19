// Notes & Follow-ups page for AI Meeting Buddy
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table, { TableColumn } from '../components/Table';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { getFollowUps, addFollowUp, updateFollowUp, addActivityLog, type FollowUp } from '../lib/dataService';
import { format, parseISO } from 'date-fns';

const Notes: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [notes, setNotes] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    text: '',
    owner: '',
    dueDate: ''
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadFollowUps();
    // Load existing notes from localStorage
    const savedNotes = localStorage.getItem('meeting_notes') || '';
    setNotes(savedNotes);
  }, []);

  const loadFollowUps = () => {
    setFollowUps(getFollowUps());
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const content = e.target.innerHTML;
    setNotes(content);
    localStorage.setItem('meeting_notes', content);
  };

  const addNewFollowUp = () => {
    if (!newFollowUp.text.trim() || !newFollowUp.owner.trim() || !newFollowUp.dueDate) {
      showError('Please fill in all follow-up fields');
      return;
    }

    const followUp: FollowUp = {
      id: Math.random().toString(36).substring(7),
      text: newFollowUp.text,
      owner: newFollowUp.owner,
      dueDate: newFollowUp.dueDate,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    addFollowUp(followUp);
    loadFollowUps();
    
    setNewFollowUp({ text: '', owner: '', dueDate: '' });
    setIsAddModalOpen(false);
    
    addActivityLog('followup_created', `Follow-up created for ${followUp.owner}`);
    showSuccess('Follow-up added successfully!');
  };

  const toggleFollowUpStatus = (id: string) => {
    const followUp = followUps.find(f => f.id === id);
    if (!followUp) return;

    const newStatus = followUp.status === 'open' ? 'done' : 'open';
    updateFollowUp(id, { status: newStatus });
    loadFollowUps();
    
    addActivityLog('followup_updated', `Follow-up marked as ${newStatus}`);
    showSuccess(`Follow-up marked as ${newStatus}!`);
  };

  const exportNotes = () => {
    // Create plain text version of notes
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = notes;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    const content = `Meeting Notes - ${format(new Date(), 'MMM dd, yyyy')}\n\n${plainText}\n\nFollow-ups:\n${
      followUps.filter(f => f.status === 'open')
        .map((f, i) => `${i + 1}. ${f.text} (${f.owner} - Due: ${format(parseISO(f.dueDate), 'MMM dd')})`)
        .join('\n')
    }`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-notes-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addActivityLog('notes_exported', 'Meeting notes exported to file');
    showSuccess('Notes exported successfully!');
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
  };

  const openFollowUps = followUps.filter(f => f.status === 'open');
  const doneFollowUps = followUps.filter(f => f.status === 'done');

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
      className: 'w-32'
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (item) => format(parseISO(item.dueDate), 'MMM dd, yyyy'),
      className: 'w-32'
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusPill status={item.status === 'done' ? 'success' : 'warning'}>
          {item.status}
        </StatusPill>
      ),
      className: 'w-24'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <button
          onClick={() => toggleFollowUpStatus(item.id)}
          className={`text-sm px-3 py-1 rounded-lg transition-colors ${
            item.status === 'open' 
              ? 'bg-success/10 text-success hover:bg-success/20' 
              : 'bg-warning/10 text-warning hover:bg-warning/20'
          }`}
        >
          {item.status === 'open' ? 'Mark Done' : 'Reopen'}
        </button>
      ),
      className: 'w-24'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Meeting Notes */}
      <Card
        title="Meeting Notes"
        actions={
          <div className="flex gap-2">
            <button
              onClick={exportNotes}
              className="meeting-button-ghost text-sm"
            >
              Export Notes
            </button>
          </div>
        }
      >
        {/* Rich text toolbar */}
        <div className="flex gap-2 mb-4 p-2 bg-secondary/30 rounded-lg">
          <button
            onClick={() => formatText('bold')}
            className="p-2 hover:bg-background rounded text-sm font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() => formatText('italic')}
            className="p-2 hover:bg-background rounded text-sm italic"
            title="Italic"
          >
            I
          </button>
          <button
            onClick={() => formatText('insertUnorderedList')}
            className="p-2 hover:bg-background rounded text-sm"
            title="Bullet List"
          >
            •
          </button>
          <div className="w-px bg-border mx-1"></div>
          <span className="text-xs text-muted-foreground p-2">
            Meeting decisions, key points, action items...
          </span>
        </div>

        {/* Rich text editor */}
        <div
          contentEditable
          onInput={handleNotesChange}
          dangerouslySetInnerHTML={{ __html: notes }}
          className="min-h-[200px] p-4 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
          style={{ outline: 'none' }}
        />
      </Card>

      {/* Follow-ups */}
      <Card
        title={`Follow-ups (${openFollowUps.length} open)`}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="meeting-button-primary text-sm"
          >
            + Add Follow-up
          </button>
        }
      >
        {openFollowUps.length > 0 ? (
          <Table
            data={openFollowUps}
            columns={followUpColumns}
            emptyMessage="No open follow-ups"
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>All follow-ups completed!</p>
          </div>
        )}
      </Card>

      {/* Completed Follow-ups */}
      {doneFollowUps.length > 0 && (
        <Card title={`Completed Follow-ups (${doneFollowUps.length})`}>
          <Table
            data={doneFollowUps}
            columns={followUpColumns}
            emptyMessage="No completed follow-ups"
          />
        </Card>
      )}

      {/* Add Follow-up Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Follow-up"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Follow-up Text</label>
            <textarea
              value={newFollowUp.text}
              onChange={(e) => setNewFollowUp({ ...newFollowUp, text: e.target.value })}
              className="meeting-input min-h-[80px] resize-none"
              placeholder="Describe the follow-up action needed..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Owner</label>
              <select
                value={newFollowUp.owner}
                onChange={(e) => setNewFollowUp({ ...newFollowUp, owner: e.target.value })}
                className="meeting-input"
              >
                <option value="">Select owner</option>
                <option value="Chennai">Chennai Team</option>
                <option value="Germany">Germany Team</option>
                <option value="Product">Product Team</option>
                <option value="Support">Support Team</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                value={newFollowUp.dueDate}
                onChange={(e) => setNewFollowUp({ ...newFollowUp, dueDate: e.target.value })}
                className="meeting-input"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="meeting-button-ghost"
            >
              Cancel
            </button>
            <button
              onClick={addNewFollowUp}
              className="meeting-button-primary"
            >
              Add Follow-up
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Notes;