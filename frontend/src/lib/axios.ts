import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8000/api';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending/receiving HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh token requests at the same time
let isRefreshing = false;
// Queue to hold pending requests while the token is being refreshed
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Request Interceptor ---
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the latest access token from Zustand store
    const { accessToken } = useAuthStore.getState();
    
    // If token exists, attach it to Authorization header
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops for the refresh token endpoint itself
      if (originalRequest.url.includes('/auth/refresh-token') || originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token. 
        // We use a fresh axios call to avoid the interceptors on this specific request.
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;

        // Update Zustand store with new access token
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Process queue of pending requests
        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g. invalid refresh token), clear auth and redirect to login
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        
        // Ensure we don't redirect if we're already on the login page
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
