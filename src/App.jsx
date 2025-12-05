import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocationProvider } from './contexts/LocationContext';
import Layout from './components/layout/Layout';
import MobileBottomNav from './components/navigation/MobileBottomNav';

// Eager load main dashboard
import Dashboard from './pages/Dashboard';

// Lazy load secondary pages for code splitting
const LocationDetail = lazy(() => import('./pages/LocationDetail'));

// Create a client instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// Loading fallback for lazy-loaded routes
const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
    <div className="text-center text-white">
      <div className="spinner-border text-info mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p>Loading...</p>
    </div>
  </div>
);

// Placeholder component for future pages
const PlaceholderPage = ({ title, description }) => (
  <div className="flex-grow-1 overflow-auto p-4 p-md-5" style={{ minHeight: '100vh' }}>
    <div className="container-fluid mt-5 text-center text-white">
      <h1 className="display-4 fw-bold mb-3">{title}</h1>
      <p className="lead text-white-50">{description}</p>
      <div className="glass-card p-5 mt-4">
        <h3>🚧 Coming Soon</h3>
        <p className="mb-0">This page is under development</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter basename="/PowPlus">
      <QueryClientProvider client={queryClient}>
        <LocationProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Main dashboard route */}
              <Route path="/" element={<Dashboard />} />

              {/* Location detail route */}
              <Route path="/location/:name" element={<LocationDetail />} />

              {/* Placeholder routes for bottom nav */}
              <Route
                path="/map"
                element={<PlaceholderPage title="Map View" description="Full-screen interactive map" />}
              />
              <Route
                path="/avalanche"
                element={<PlaceholderPage title="Avalanche Safety" description="Safety information and education" />}
              />
              <Route
                path="/settings"
                element={<PlaceholderPage title="Settings" description="Customize your experience" />}
              />
            </Routes>

            {/* Mobile bottom navigation */}
            <MobileBottomNav />
          </Suspense>
        </LocationProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
