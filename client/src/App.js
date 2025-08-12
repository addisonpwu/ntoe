import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import MainView from './components/MainView';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Nested routes will render inside AppLayout's <Outlet> */}
            <Route index element={<MainView />} />
            <Route 
              path="admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <div className="admin-dashboard-container"><AdminDashboard /></div>
                </ProtectedRoute>
              }
            />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
