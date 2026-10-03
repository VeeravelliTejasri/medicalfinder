import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { LocationProvider } from './context/LocationContext.js';
import { NotificationProvider } from './context/NotificationContext.js';

import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

import { LandingPage } from './pages/LandingPage.js';
import { SearchResultsPage } from './pages/SearchResultsPage.js';
import { PharmacyDetailsPage } from './pages/PharmacyDetailsPage.js';
import { PrescriptionUploadPage } from './pages/PrescriptionUploadPage.js';
import { EmergencyPage } from './pages/EmergencyPage.js';
import { UserDashboard } from './pages/UserDashboard.js';
import { PharmacyDashboard } from './pages/PharmacyDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <NotificationProvider>
            <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900">
              {/* Main Navbar */}
              <Navbar />

              {/* Page Content */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/pharmacies/:id" element={<PharmacyDetailsPage />} />
                  <Route path="/prescription" element={<PrescriptionUploadPage />} />
                  <Route path="/emergency" element={<EmergencyPage />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/pharmacy-dashboard" element={<PharmacyDashboard />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Global Footer */}
              <Footer />
            </div>
          </NotificationProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
