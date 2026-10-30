import axios, { AxiosError, AxiosInstance } from 'axios';
import { tokenStorage } from '../../storage/token-storage';
import { appStorage } from '../../storage/app-storage';
import { StorageKeys } from '../../constants/storage-keys';
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
            isRefreshing = false;
            return Promise.reject(error);
          }

          // Backend contract: POST /auth/refresh { refresh_token } →
          // { user, access_token, refresh_token } (refresh token is rotated).
          const response = await axios.post(
            `${baseURL}${ApiRoutes.AUTH.REFRESH}`,
            { refresh_token: refreshToken },
            { timeout: 15000 },
          );

          const payload = response.data?.data || response.data || {};
          const accessToken = payload.access_token;
          const newRefreshToken = payload.refresh_token;

          if (!accessToken) {
            throw new Error('Token refresh did not return a valid access_token');
          }

          tokenStorage.setAccessToken(accessToken);
          if (newRefreshToken) {
            await tokenStorage.setRefreshToken(newRefreshToken);
          }

          if (payload.user) {
            try {
              appStorage.setString(
                StorageKeys.USER_DATA,
                JSON.stringify(payload.user),
              );
            } catch {
              // ignore
            }
          }

          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError: any) {
          processQueue(refreshError, null);
          const isExplicitAuthReject =
            refreshError?.response?.status === 401 ||
            refreshError?.response?.status === 403;

          // Only clear tokens and force logout if the server explicitly rejected the refresh token.
          // Transient network errors or timeouts must NEVER kick the user out of their session.
          if (isExplicitAuthReject) {
            await tokenStorage.clearTokens();
            try {
              appStorage.delete(StorageKeys.USER_DATA);
            } catch {
              // ignore
            }
            if (onLogout) {
              onLogout();
            }
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
