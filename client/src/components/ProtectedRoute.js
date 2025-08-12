import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useContext(AuthContext);
  const location = useLocation();

  if (!token || !user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // If a non-admin tries to access an admin route, send them to the home page.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
