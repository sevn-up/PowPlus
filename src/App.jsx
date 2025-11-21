import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import WeatherDashboard from './components/WeatherDashboard';

/**
 * App - Main application with persistent sidebar navigation
 */
function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'map' | 'dashboard'
  const [selectedLocation, setSelectedLocation] = useState(null);

  /**
   * Handle location selection from sidebar or map
   * Navigate to dashboard detail view
   */
  const handleLocationSelect = (location) => {
    console.log('🎯 Location selected:', location);
    setSelectedLocation(location);
    setCurrentPage('dashboard');
    console.log('📍 Navigating to dashboard for:', location.name);
  };

  /**
   * Handle page navigation from sidebar
   */
  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page !== 'dashboard') {
      setSelectedLocation(null);
    }
  };

  return (
    <div className="d-flex">
      {/* Persistent Sidebar */}
      <Sidebar
        currentPage={currentPage}
        selectedLocation={selectedLocation}
        onNavigate={handleNavigate}
        onLocationSelect={handleLocationSelect}
      />

      {/* Main Content Area */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: '260px',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%)'
        }}
      >
        {currentPage === 'landing' && (
          <LandingPage onLocationSelect={handleLocationSelect} />
        )}

        {currentPage === 'map' && (
          <MapPage onLocationSelect={handleLocationSelect} />
        )}

        {currentPage === 'dashboard' && selectedLocation && (
          <WeatherDashboard
            selectedLocation={selectedLocation}
            currentLocation={selectedLocation}
            onBack={() => handleNavigate('landing')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
