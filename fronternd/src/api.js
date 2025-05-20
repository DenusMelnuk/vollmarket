import axios from 'axios';
import i18n from '@/i18n';
import config from '@/config';

const api = axios.create({
  baseURL: config.apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Accept-Language'] = i18n.language;
  return config;
});

export default api;