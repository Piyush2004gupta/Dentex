import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';


























const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smileguard_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('smileguard_token');
  });
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('smileguard_token');
    localStorage.removeItem('smileguard_user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      api.get('/profile').
      then((res) => {
        setUser(res.data);
        localStorage.setItem('smileguard_user', JSON.stringify(res.data));
      }).
      catch((err) => {
        console.warn('Backend sync failed, using local fallback:', err);
        if (err.response?.status === 401) {
          logout();
        }
      }).
      finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      const { access_token, user: loggedUser } = res.data;
      localStorage.setItem('smileguard_token', access_token);
      localStorage.setItem('smileguard_user', JSON.stringify(loggedUser));
      setToken(access_token);
      setUser(loggedUser);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      // Auto login
      await login({ email: userData.email, password: userData.password });
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Registration failed');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>);

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};