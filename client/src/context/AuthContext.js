import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api'; // Import the specific axios instance
import * as api from '../api';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const setupAuthHeader = useCallback((token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
    setToken(token);
  }, []);

  useEffect(() => {
    if (token) {
      setupAuthHeader(token);
      // You could add a /api/auth/me endpoint to verify token and get user data
      // For now, we'll decode it.
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser(decoded.user);
      } catch (error) {
        console.error("Failed to decode token", error);
        setupAuthHeader(null); // Clear invalid token
      }
    }
    setLoading(false);
  }, [token, setupAuthHeader]);

  const login = async (username, password) => {
    try {
      const response = await api.login(username, password);
      const { token } = response.data;
      setupAuthHeader(token);
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUser(decoded.user);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setupAuthHeader(null);
  };

  const authContextValue = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
