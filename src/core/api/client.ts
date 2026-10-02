import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { authRequestInterceptor } from './interceptors/auth.interceptor';
import { setupRefreshInterceptor } from './interceptors/refresh.interceptor';
import { errorResponseInterceptor } from './interceptors/error.interceptor';
import { ApiResponse } from './api.types';

// Default configuration for development / production
// Android emulator reaches host machine via 10.0.2.2; the web dev
// preview uses a relative path proxied by the dev server (no CORS).
export const API_BASE_URL =
  Platform.OS === 'web' ? '/api/v1' : 'http://10.0.2.2:5000/api/v1';

const createApiClient = (baseURL: string = API_BASE_URL): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // 1. Request Interceptors
  instance.interceptors.request.use(authRequestInterceptor, error => Promise.reject(error));

  // 2. Token Refresh Interceptor (registered before error normalizer)
  setupRefreshInterceptor(instance, baseURL);

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
