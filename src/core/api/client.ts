import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../config';
import { clearSession, getSession } from '../auth/storage';
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

// Emitted when the backend rejects the session (401). The backend currently
// exposes no refresh-token endpoint, so the only recovery is a fresh login.
export const authEvents = {
  onUnauthorized(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  emitUnauthorized(): void {
    listeners.forEach(listener => listener());
  },
};

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
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
