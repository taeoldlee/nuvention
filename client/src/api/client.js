import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach demo user ID to every request
client.interceptors.request.use((config) => {
  const userId = localStorage.getItem('mise_user_id');
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

// Handle errors globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    console.error('[API Error]', message);
    return Promise.reject(error);
  }
);

export default client;
