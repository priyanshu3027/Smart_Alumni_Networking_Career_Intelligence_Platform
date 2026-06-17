import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('alumsphere_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('alumsphere_token');
    if (token) {
      api.get('/auth/me').then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('alumsphere_user', JSON.stringify(data.user));
      }).catch(() => {
        localStorage.removeItem('alumsphere_token');
        localStorage.removeItem('alumsphere_user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.requires2FA) return { requires2FA: true, userId: data.userId };
    localStorage.setItem('alumsphere_token', data.token);
    localStorage.setItem('alumsphere_user', JSON.stringify(data.user));
    setUser(data.user);
    return { success: true };
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('alumsphere_token', data.token);
    localStorage.setItem('alumsphere_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('alumsphere_token');
    localStorage.removeItem('alumsphere_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('alumsphere_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
