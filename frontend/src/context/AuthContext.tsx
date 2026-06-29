import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  name: string;
  age: number;
  phone_no: string;
  gender: string;
  consent_terms: boolean;
  consent_not_professional_ai: boolean;
  consent_store_images: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('dentex_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('dentex_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  const logout = () => {
    localStorage.removeItem('dentex_token');
    localStorage.removeItem('dentex_user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      api.get('/profile')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('dentex_user', JSON.stringify(res.data));
        })
        .catch((err) => {
          console.warn('Backend sync failed, using local fallback:', err);
          if (err.response?.status === 401) {
            logout();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials: any) => {
    try {
      const res = await api.post('/auth/login', credentials);
      const { access_token, user: loggedUser } = res.data;
      localStorage.setItem('dentex_token', access_token);
      localStorage.setItem('dentex_user', JSON.stringify(loggedUser));
      setToken(access_token);
      setUser(loggedUser);
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    try {
      await api.post('/auth/register', userData);
      // Auto login
      await login({ email: userData.email, password: userData.password });
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Registration failed');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

