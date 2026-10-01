import { api, unwrap } from '../api/client';
import type { ApiEnvelope, AppUser } from '../api/types';

// Backend auth contract (auth.controller.ts / auth.service.ts):
//   POST /auth/login    { identifier, password } -> { user, access_token, refresh_token }
//   POST /auth/refresh  { refresh_token }        -> { user, access_token, refresh_token }
//   GET  /auth/me                                -> UserProfile
// Login accepts a mobile number or email as the identifier.
export interface AuthTokenPair {
  user: AppUser;
  access_token: string;
  refresh_token: string;
}

export const authService = {
  async login(identifier: string, password: string): Promise<AuthTokenPair> {
    const res = await api.post<ApiEnvelope<AuthTokenPair>>('/auth/login', {
      identifier: identifier.trim(),
      password,
    });
    return unwrap(res.data);
  },

  async refresh(refreshToken: string): Promise<AuthTokenPair> {
    const res = await api.post<ApiEnvelope<AuthTokenPair>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return unwrap(res.data);
  },

  async me(): Promise<AppUser> {
    const res = await api.get<ApiEnvelope<AppUser>>('/auth/me');
    return unwrap(res.data);
  },
};
