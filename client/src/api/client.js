import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30s default timeout for normal API calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach demo user ID to every request
// Also extend timeout for multipart uploads (videos can be large)
client.interceptors.request.use((config) => {
  const userId = localStorage.getItem('locale_user_id');
  if (userId) {
    config.headers['x-user-id'] = userId;
  }

  // Extend timeout to 5 minutes for file uploads
  if (config.headers['Content-Type'] === 'multipart/form-data') {
    config.timeout = 5 * 60 * 1000; // 5 minutes
  }

  return config;
});

// Handle errors globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('[API Error] Request timed out');
    } else {
      const message = error.response?.data?.error || error.message || 'Something went wrong';
      console.error('[API Error]', message);
    }
    return Promise.reject(error);
  }
);

export default client;
