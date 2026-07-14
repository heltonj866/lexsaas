import axios from 'axios';

const api = axios.create({
  // Força o Axios a usar o mesmo hostname (localhost vs 127.0.0.1) dinamicamente
  baseURL: `http://${window.location.hostname}:8000/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@LegalTech:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;