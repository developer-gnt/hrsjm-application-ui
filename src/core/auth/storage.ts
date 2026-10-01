import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppUser } from '../api/types';

const SESSION_KEY = 'hrsjm.session.v1';

export interface StoredSession {
  accessToken: string;
  user: AppUser;
}

export async function getSession(): Promise<StoredSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export async function saveSession(session: StoredSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
