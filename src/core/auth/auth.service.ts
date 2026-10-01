import { api, unwrap } from '../api/client';
import type { ApiEnvelope, AppUser } from '../api/types';

interface LoginResponse {
  user: AppUser;
  accessToken: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await api.post<ApiEnvelope<LoginResponse>>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    return unwrap(res.data);
  },

  async me(): Promise<AppUser> {
    const res = await api.get<ApiEnvelope<AppUser>>('/auth/me');
    return unwrap(res.data);
  },
};
