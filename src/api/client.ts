// src/api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('teacherId');
      localStorage.removeItem('teacherName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Named API helpers ──────────────────────────────────────────────
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  register: (payload: {
    username: string;
    password: string;
    name?: string;
    section?: string;
  }) => api.post('/auth/register', payload),

  logout: () =>
    api.post('/auth/logout'),
};