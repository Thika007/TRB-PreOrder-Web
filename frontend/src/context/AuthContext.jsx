import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('trb_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Set default axios authorization header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('trb_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('trb_token');
    }
  }, [token]);

  // Verify token on initial app mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('trb_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setToken(storedToken);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed or expired:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // Login handler
  const login = async (username, password) => {
    setAuthError(null);
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('trb_token');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    authError,
    setAuthError,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
