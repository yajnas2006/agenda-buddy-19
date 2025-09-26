// Main App component for AI Meeting Buddy
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Prep from './pages/Prep';
import Notes from './pages/Notes';
import { ToastContainer, useToast } from './components/Toast';
import { initializeData } from './lib/dataService';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    // Initialize mock data on first load
    initializeData();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <Schedule />;
      case 'prep':
        return <Prep />;
      case 'notes':
        return <Notes />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderPage()}
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;