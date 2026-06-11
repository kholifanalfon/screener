import axios from 'axios';

export const BASE_API_URL = import.meta.env.VITE_API_URL || import.meta.env.FE_API_URL || 'http://localhost:3000';

// Buat instance axios terpusat
export const api = axios.create({
  baseURL: `${BASE_API_URL}/api/v1`,
  withCredentials: true,
});

// Tambahkan request interceptor untuk menyisipkan signature secara global ke instance api
api.interceptors.request.use((config) => {
  const signature = import.meta.env.VITE_APP_SIGNATURE || import.meta.env.FE_APP_SIGNATURE;
  if (signature) {
    config.headers['x-app-signature'] = signature;
  }
  return config;
});
