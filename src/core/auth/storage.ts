import { tokenStorage } from '../storage/token-storage';
import { useAuthStore } from '../../features/auth/store/authStore';

export interface AuthSession {
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null;
}

export async function getSession(): Promise<AuthSession | null> {
  const token = tokenStorage.getAccessToken();
  const refreshToken = await tokenStorage.getRefreshToken();
  const user = useAuthStore.getState().user;

  if (!token && !refreshToken && !user) {
    return null;
  }

  return {
    accessToken: token,
    refreshToken,
    user,
  };
}

export async function getAccessToken(): Promise<string | null> {
  return tokenStorage.getAccessToken();
}

export async function setSession(accessToken: string | null, refreshToken: string | null): Promise<void> {
  await tokenStorage.setTokens(accessToken, refreshToken);
}

export async function saveSession(session: AuthSession): Promise<void> {
  await tokenStorage.setTokens(session.accessToken, session.refreshToken);
}

export async function clearSession(): Promise<void> {
  await tokenStorage.clearTokens();
  await useAuthStore.getState().signOut();
}

export default {
  getSession,
  getAccessToken,
  setSession,
  saveSession,
  clearSession,
};
