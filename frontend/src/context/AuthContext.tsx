import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored credentials
    const storedToken = localStorage.getItem('dentex_token');
    const storedUser = localStorage.getItem('dentex_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Verify token is still valid by requesting profile
      api.get('/profile')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('dentex_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('dentex_token', access_token);
      localStorage.setItem('dentex_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      const { access_token, user: registeredUser } = response.data;
      
      localStorage.setItem('dentex_token', access_token);
      localStorage.setItem('dentex_user', JSON.stringify(registeredUser));
      
      setToken(access_token);
      setUser(registeredUser);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('dentex_token');
    localStorage.removeItem('dentex_user');
    setToken(null);
    setUser(null);
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
