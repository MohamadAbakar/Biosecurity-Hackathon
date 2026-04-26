import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import AnalysisSession from './components/analysis/AnalysisSession';
import PeptideDatabase from './components/database/PeptideDatabase';
import Login from './components/auth/Login';
import { useAuth } from './hooks/useAuth';
import { WebSocketProvider } from './hooks/useWebSocket';

import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <WebSocketProvider>
      {/* Full-screen shell: fixed header + scrollable content area */}
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 bg-muted/40">
            <Routes>
              <Route path="/"          element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analysis"  element={<AnalysisSession />} />
              <Route path="/database"  element={<PeptideDatabase />} />
              <Route path="*"          element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </WebSocketProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
