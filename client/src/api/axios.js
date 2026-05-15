import axios from 'axios';

// Automatically uses whatever IP/host the app was opened from
// So if you open http://192.168.1.5:5173, API calls go to http://192.168.1.5:5000
// Works on any WiFi without changing anything
const hostname = window.location.hostname;
export const SERVER_URL = `http://${hostname}:5000`;
const API_BASE = `http://${hostname}:5000/api`;

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