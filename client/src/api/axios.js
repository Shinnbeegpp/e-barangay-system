import axios from 'axios';

export const SERVER_URL = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:5000`;
const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

export const fileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${SERVER_URL}${url}`;
};

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;