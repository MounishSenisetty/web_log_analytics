import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import TrafficOverview from './components/TrafficOverview';
import TopPages from './components/TopPages';
import GeoDistribution from './components/GeoDistribution';
import BrowserStats from './components/BrowserStats';
import DeviceStats from './components/DeviceStats';
import StatusCodes from './components/StatusCodes';
import UserSessions from './components/UserSessions';
import Anomalies from './components/Anomalies';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/traffic" element={<TrafficOverview />} />
            <Route path="/top-pages" element={<TopPages />} />
            <Route path="/geo" element={<GeoDistribution />} />
            <Route path="/browsers" element={<BrowserStats />} />
            <Route path="/devices" element={<DeviceStats />} />
            <Route path="/status-codes" element={<StatusCodes />} />
            <Route path="/sessions" element={<UserSessions />} />
            <Route path="/anomalies" element={<Anomalies />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
