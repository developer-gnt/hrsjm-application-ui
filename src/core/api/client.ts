import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { authRequestInterceptor } from './interceptors/auth.interceptor';
import { setupRefreshInterceptor } from './interceptors/refresh.interceptor';
import { errorResponseInterceptor } from './interceptors/error.interceptor';
import { ApiResponse } from './api.types';
import { APP_CONFIG } from '../../app/config/app.config';

// Single source of truth for the environment base URL (see app.config.ts).
export const API_BASE_URL =
  Platform.OS === 'web' ? '/api/v1' : APP_CONFIG.apiBaseUrl;

/**
 * Invoked when the refresh interceptor exhausts the refresh token (expired /
 * revoked) and the session cannot be recovered. The app layer registers the
 * handler at startup (see AppProviders) to route the user back to login.
 */
let sessionExpiredHandler: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: (() => void) | null): void => {
  sessionExpiredHandler = handler;
};

const createApiClient = (baseURL: string = API_BASE_URL): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: APP_CONFIG.requestTimeoutMs,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // 1. Request Interceptors
  instance.interceptors.request.use(authRequestInterceptor, error => Promise.reject(error));

  // 2. Token Refresh Interceptor (registered before error normalizer)
  setupRefreshInterceptor(instance, baseURL, () => sessionExpiredHandler?.());

  // 3. Error Normalization Interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    errorResponseInterceptor
  );

  return instance;
};

export const axiosInstance = createApiClient();

/**
 * Standard typed HTTP client methods wrapper
 */
export const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data;
  },

  post: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  put: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  patch: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data;
  },
};

export default apiClient;