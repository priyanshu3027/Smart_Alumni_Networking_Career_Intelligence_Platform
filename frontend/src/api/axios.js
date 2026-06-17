import axios from 'axios';

const RAW_API_URL = (import.meta.env.VITE_API_URL || 'https://smart-alumni-networking-career.onrender.com').replace(/\/+$/, '');
const API_BASE_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('alumsphere_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('alumsphere_token');
      localStorage.removeItem('alumsphere_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
