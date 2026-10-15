import axios, { AxiosError, AxiosInstance } from 'axios';
import { tokenStorage } from '../../storage/token-storage';
import { ApiRoutes } from '../../constants/api-routes';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupRefreshInterceptor = (
  axiosInstance: AxiosInstance,
  baseURL: string,
  onLogout?: () => void
) => {
  axiosInstance.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // Only attempt refresh on 401 Unauthorized, and not for the refresh/login endpoints themselves
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes(ApiRoutes.AUTH.LOGIN) &&
        !originalRequest.url?.includes(ApiRoutes.AUTH.REFRESH)
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await tokenStorage.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Backend contract: POST /auth/refresh { refresh_token } →
          // { user, access_token, refresh_token } (refresh token is rotated).
          const response = await axios.post(
            `${baseURL}${ApiRoutes.AUTH.REFRESH}`,
            { refresh_token: refreshToken },
            { timeout: 15000 },
          );

          const { access_token: accessToken, refresh_token: newRefreshToken } =
            response.data?.data || {};

          if (!accessToken) {
            throw new Error('Token refresh did not return a valid access_token');
          }

          tokenStorage.setAccessToken(accessToken);
          if (newRefreshToken) {
            await tokenStorage.setRefreshToken(newRefreshToken);
          }

          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          await tokenStorage.clearTokens();
          if (onLogout) {
            onLogout();
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};
