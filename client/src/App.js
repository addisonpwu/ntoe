import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import MainView from './components/MainView';
import LoginPage from './pages/LoginPage';

// Lazy load the AdminDashboard component
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));

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
                  <Suspense fallback={<div className="p-4 text-center"><h5>載入中...</h5></div>}>
                    <div className="admin-dashboard-container glass-effect"><AdminDashboard /></div>
                  </Suspense>
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
