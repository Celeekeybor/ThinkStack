// src/components/AuthProvider.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This function will be called from Login.js
  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    // You should create a '/api/logout' route in Flask that clears the session
    try {
      await axios.post('http://localhost:5000/api/logout');
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
    }
  };

  // Check if user is already logged in on app start
  const checkSession = useCallback(async () => {
    try {
      // You should create a '/api/me' route that returns the user if a session exists
      const response = await axios.get('http://localhost:5000/api/me', { withCredentials: true });
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      // No active session, which is normal
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const authValue = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);