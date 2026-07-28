import axios from 'axios';

// Connect to API Gateway running on http://localhost:4000
const API_BASE_URL = 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject Bearer Token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gharsetu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor for response handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gharsetu_token');
      localStorage.removeItem('gharsetu_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const errorPayload = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: 'Network error or service unavailable. Please try again.'
    };
    return Promise.reject(errorPayload);
  }
);
