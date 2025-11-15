import axios from 'axios';
import { handleApiError } from './errorHandler';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? "http://localhost:5001/api" : "/api",
    withCredentials: true,
    timeout: 120000,
});

let retryQueue = [];
let isRefreshing = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          retryQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post('/auth/refresh');
        retryQueue.forEach(({ resolve }) => resolve());
        retryQueue = [];
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        retryQueue.forEach(({ reject }) => reject(refreshError));
        retryQueue = [];
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (!error.response && originalRequest._retryCount < 2) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
      return axiosInstance(originalRequest);
    }

    return Promise.reject(error);
  }
);

