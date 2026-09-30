import { AxiosError } from 'axios';
import { ApiError } from '../api-error';

export const errorResponseInterceptor = (error: AxiosError) => {
  const normalizedError = ApiError.fromAxiosError(error);
  return Promise.reject(normalizedError);
};
