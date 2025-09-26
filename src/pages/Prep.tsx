// Prep page for AI Meeting Buddy
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table, { TableColumn } from '../components/Table';
import { useToast } from '../components/Toast';
import { getPastMeetings, getPrepNotes, updatePrepNotes, addActivityLog, type Meeting, type PrepNote, type SalesData } from '../lib/dataService';
import { format, parseISO, isAfter, subDays } from 'date-fns';

const Prep: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [prepNotes, setPrepNotes] = useState<PrepNote[]>([]);
  const [currentAgenda, setCurrentAgenda] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showInfo } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load sales data (mock CSV parsing)
      const mockSalesData: SalesData[] = [
        { date: '2025-09-26', product: 'CRM', customer_type: 'SMB', licenses: 30, region: 'DE' },
        { date: '2025-09-25', product: 'Analytics', customer_type: 'Education', licenses: 200, region: 'DE' },
        { date: '2025-09-24', product: 'Desk', customer_type: 'Enterprise', licenses: 90, region: 'DE' },
        { date: '2025-09-22', product: 'Mail', customer_type: 'SMB', licenses: 40, region: 'DE' },
        { date: '2025-09-21', product: 'CRM', customer_type: 'SMB', licenses: 28, region: 'DE' },
      ];
      setSalesData(mockSalesData);

      // Load existing prep notes
      const notes = getPrepNotes();
      setPrepNotes(notes);
      
      if (notes.length > 0) {
        setCurrentAgenda([...notes[0].items]);
      }
    } catch (error) {
      console.error('Error loading prep data:', error);
    }
  };

  const generateAgenda = () => {
    setIsLoading(true);
    
    try {
      const pastMeetings = getPastMeetings();
      const recentMeetings = pastMeetings.slice(0, 2); // Last 2 meetings
      
      // Get recent sales data (last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30);
      const recentSales = salesData.filter(sale => 
        isAfter(parseISO(sale.date), thirtyDaysAgo)
      );

      // Generate agenda items based on data
      const agendaItems = [];

      // Sales performance items
      const crmSales = recentSales.filter(s => s.product === 'CRM');
      if (crmSales.length > 0) {
        const totalLicenses = crmSales.reduce((sum, s) => sum + s.licenses, 0);
        agendaItems.push(`Review CRM performance: ${totalLicenses} licenses in last 30 days`);
      }

      // Education vertical focus
      const eduSales = recentSales.filter(s => s.customer_type === 'Education');
      if (eduSales.length > 0) {
        agendaItems.push('Education vertical update and pipeline review');
      }

      // Recent meeting follow-ups
      if (recentMeetings.length > 0) {
        agendaItems.push(`Follow up: ${recentMeetings[0].outcome}`);
        if (recentMeetings[0].notes) {
          agendaItems.push(`Action item: ${recentMeetings[0].notes}`);
        }
      }

      // Product focus based on recent activity
      const topProduct = recentSales.reduce((prev, current) => 
        (prev.licenses > current.licenses) ? prev : current
      );
      if (topProduct) {
        agendaItems.push(`${topProduct.product} strategy discussion`);
      }

      // Standard items
      agendaItems.push('Q4 targets and projections');
      agendaItems.push('Blockers and support needed');

      setCurrentAgenda(agendaItems);
      addActivityLog('agenda_generated', `Generated agenda with ${agendaItems.length} items`);
      showSuccess('Agenda generated based on recent meetings and sales data!');
      
    } catch (error) {
      console.error('Error generating agenda:', error);
      showInfo('Error generating agenda. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const savePrep = () => {
    const updatedNotes = [{
      id: 'p1',
      meetingId: null,
      items: currentAgenda
    }];
    
    updatePrepNotes(updatedNotes);
    addActivityLog('prep_saved', `Saved prep with ${currentAgenda.length} agenda items`);
    showSuccess('Meeting prep saved successfully!');
  };

  const exportAgenda = () => {
    const agendaText = currentAgenda
      .map((item, index) => `${index + 1}. ${item}`)
      .join('\n');
    
    const content = `Meeting Agenda - ${format(new Date(), 'MMM dd, yyyy')}\n\n${agendaText}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-agenda-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addActivityLog('agenda_exported', 'Meeting agenda exported to file');
    showSuccess('Agenda exported successfully!');
  };

  const addAgendaItem = () => {
    setCurrentAgenda([...currentAgenda, 'New agenda item']);
  };

  const updateAgendaItem = (index: number, value: string) => {
    const updated = [...currentAgenda];
    updated[index] = value;
    setCurrentAgenda(updated);
  };

  const removeAgendaItem = (index: number) => {
    const updated = currentAgenda.filter((_, i) => i !== index);
    setCurrentAgenda(updated);
  };

  const salesColumns: TableColumn<SalesData>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (sale) => format(parseISO(sale.date), 'MMM dd'),
      className: 'w-20'
    },
    {
      key: 'product',
      header: 'Product',
      className: 'font-medium'
    },
    {
      key: 'customer_type',
      header: 'Segment',
      className: 'text-muted-foreground'
    },
    {
      key: 'licenses',
      header: 'Licenses',
      render: (sale) => sale.licenses.toLocaleString(),
      className: 'text-right font-mono'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Sales Context */}
      <div className="space-y-6">
        <Card title="Sales Context (Last 30 Days)">
          <Table 
            data={salesData}
            columns={salesColumns}
            emptyMessage="No sales data available"
          />
        </Card>
      </div>

      {/* Right Column - Agenda */}
      <div className="space-y-6">
        <Card 
          title="Meeting Agenda"
          actions={
            <div className="flex gap-2">
              <button
                onClick={generateAgenda}
                disabled={isLoading}
                className="meeting-button-primary text-sm"
              >
                {isLoading ? 'Generating...' : 'Auto-Generate'}
              </button>
              <button
                onClick={savePrep}
                className="meeting-button-ghost text-sm"
              >
                Save Prep
              </button>
              <button
                onClick={exportAgenda}
                className="meeting-button-ghost text-sm"
              >
                Export
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            {currentAgenda.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-2 rounded border-border"
                  defaultChecked={false}
                />
                <div className="flex-1">
                  <textarea
                    value={item}
                    onChange={(e) => updateAgendaItem(index, e.target.value)}
                    className="meeting-input min-h-[60px] text-sm resize-none"
                    placeholder="Agenda item..."
                  />
                </div>
                <button
                  onClick={() => removeAgendaItem(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors mt-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            
            <button
              onClick={addAgendaItem}
              className="w-full meeting-button-ghost text-sm py-3 border-2 border-dashed border-border"
            >
              + Add Agenda Item
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Prep;