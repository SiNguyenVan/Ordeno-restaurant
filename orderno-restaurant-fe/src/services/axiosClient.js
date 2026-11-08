import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});


axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(
        `%c[API Request] %c${config.method?.toUpperCase()} %c${config.baseURL}${config.url}`,
        'color: #3b82f6; font-weight: bold;',
        'color: #10b981; font-weight: bold;',
        'color: #f59e0b;'
      );
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]:', error);
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined) {
      const data = response.data.data;
      // Attach pagination metadata if returned by backend
      if (Array.isArray(data) && response.data.pagination) {
        data.pagination = response.data.pagination;
      }
      return data;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.message;

      return Promise.reject(new Error(message || 'An error occurred on the server'));
    } else if (error.request) {
      // Request sent but no response received (network error or server offline)
      console.error('[API Network Error]: Unable to connect to the API server.');
      return Promise.reject(new Error('Unable to connect to the server. Please check your network connection or backend server.'));
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

