import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import HostDashboard from './pages/HostDashboard';
import Discover from './pages/Discover';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <Router>
          <div className="bg-gray-50 min-h-screen text-slate-900 antialiased font-sans">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/host" element={<HostDashboard />} />
              <Route path="/host-mode" element={<HostDashboard />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </Router>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
