import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach scoped JWT token based on endpoint
client.interceptors.request.use((config: any) => {
  const isPortalRoute = config.url && config.url.includes('/portal');
  const token = isPortalRoute
    ? localStorage.getItem('portalToken') || localStorage.getItem('accessToken')
    : localStorage.getItem('accessToken') || localStorage.getItem('portalToken');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
