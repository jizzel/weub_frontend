/**
 * Weub - Video Platform Frontend
 * Main application component with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Upload } from './pages/Upload';
import { VideoDetail } from './pages/VideoDetail';
import { Stats } from './pages/Stats';

// Log connection info on app load
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';
console.log('🎬 Weub Video Platform');
console.log('📡 Backend API configured at:', BASE_URL);
console.log('💡 Run testConnection() in console to check connection');
console.log('📖 See CONNECTION_STATUS.md for troubleshooting');

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1, // Retry once for transient failures
      staleTime: 5000,
      gcTime: 10000,
      networkMode: 'online', // Use online mode to properly connect to backend
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/video/:id" element={<VideoDetail />} />
              <Route path="/stats" element={<Stats />} />
              {/* Catch-all route for preview and unknown paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}