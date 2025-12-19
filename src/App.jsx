import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WeatherDashboard from './components/WeatherDashboard';
import TidesView from './components/TidesView';
import MapView from './components/MapView';
import PlanningView from './components/PlanningView';
import TabNavigation from './components/TabNavigation';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Tab Navigation - shows on all pages */}
        <TabNavigation />

        {/* Main Content Area */}
        <div className="main-content">
          <Routes>
            <Route path="/weather" element={<WeatherDashboard />} />
            <Route path="/tides" element={<TidesView />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/planning" element={<PlanningView />} />

            {/* Redirect root to /weather */}
            <Route path="/" element={<Navigate to="/weather" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
