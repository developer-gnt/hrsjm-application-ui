import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../config';
import { authService } from '../auth/auth.service';
import { clearSession, getSession, saveSession } from '../auth/storage';
import type { ApiEnvelope } from './types';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

type AuthListener = () => void;

const listeners = new Set<AuthListener>();

export const authEvents = {
  onUnauthorized(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  emitUnauthorized(): void {
    listeners.forEach(listener => listener());
  },
};

// Endpoints that must never trigger the refresh flow (they are part of it).
function isAuthEndpoint(url?: string): boolean {
  return !!url && /\/auth\/(login|refresh)$/.test(url);
}

// Single-flight refresh: concurrent 401s share one /auth/refresh call, so the
// rotating refresh token is exchanged exactly once. The backend rotates the
// token on every use - a second parallel exchange would fail both.
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const session = await getSession();
      if (!session?.refreshToken) {
        return false;
      }
      try {
        const pair = await authService.refresh(session.refreshToken);
        await saveSession({
          accessToken: pair.access_token,
          refreshToken: pair.refresh_token,
          user: pair.user,
        });
        return true;
      } catch {
        await clearSession();
        authEvents.emitUnauthorized();
        return false;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !isAuthEndpoint(original.url)
    ) {
      original._retried = true;
      const refreshed = await tryRefreshSession();
      if (refreshed) {
        const session = await getSession();
        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(original.headers ?? {})) {
          if (typeof value === 'string') {
            headers[key] = value;
          }
        }
        if (session?.accessToken) {
          headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return api.request({ ...original, headers });
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // 401 on login/refresh itself, or refresh unavailable: the session is over.
      await clearSession();
      authEvents.emitUnauthorized();
    }
    return Promise.reject(error);
  },
);

export function unwrap<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data;
}

// Human-readable message from an axios/backend error, without exposing stack traces
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { message?: string | string[] } | undefined;
    if (typeof body?.message === 'string') {
      return body.message;
    }
    if (Array.isArray(body?.message) && body.message.length > 0) {
      return body.message[0];
    }
    if (!error.response) {
      return 'Cannot reach the server. Check your connection and try again.';
    }
  }
  return fallback;
}
