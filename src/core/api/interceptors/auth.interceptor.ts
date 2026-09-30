import { InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../../storage/token-storage';

export const authRequestInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  const token = tokenStorage.getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};
