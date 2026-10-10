import { apiClient } from '../../../core/api/client';
import { ApiRoutes } from '../../../core/constants/api-routes';
import {
  AuthSession,
  ForgotPasswordResult,
  UserProfile,
} from '../types/auth.types';

/** Payload of POST /auth/register (role_name allowlist is enforced backend-side). */
export interface RegisterRequest {
  full_name: string;
  mobile_number: string;
  email?: string;
  password: string;
  confirm_password: string;
  role_name?: string;
}

/**
 * Auth service — the ONLY place that talks to the /auth endpoints.
 * Screens consume it via the authStore; never call axios directly (rule.md §2).
 *
 * Backend contract (HRSJM-back-api/src/modules/auth):
 * - POST /auth/register { full_name, mobile_number, email?, password,
 *     confirm_password, role_name? } → { user, access_token, refresh_token }
 * - POST /auth/login    { identifier, password } → { user, access_token, refresh_token }
 * - POST /auth/refresh  { refresh_token }        → { user, access_token, refresh_token }
 * - POST /auth/logout   { refresh_token }        → idempotent, data: null
 * - POST /auth/forgot-password { identifier }    → { delivered_mechanism, reset_token? }
 * - POST /auth/reset-password  { token, password, confirm_password }
 * - GET  /auth/me                                → UserProfile
 */
export const authService = {
  async register(payload: RegisterRequest): Promise<AuthSession> {
    const response = await apiClient.post<AuthSession>(
      ApiRoutes.AUTH.REGISTER,
      payload,
    );
    return response.data;
  },

  async login(identifier: string, password: string): Promise<AuthSession> {
    const response = await apiClient.post<AuthSession>(ApiRoutes.AUTH.LOGIN, {
      identifier,
      password,
    });
    return response.data;
  },

  async refresh(refreshToken: string): Promise<AuthSession> {
    const response = await apiClient.post<AuthSession>(ApiRoutes.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post(ApiRoutes.AUTH.LOGOUT, {
      refresh_token: refreshToken,
    });
  },

  async forgotPassword(identifier: string): Promise<ForgotPasswordResult> {
    const response = await apiClient.post<ForgotPasswordResult>(
      ApiRoutes.AUTH.FORGOT_PASSWORD,
      { identifier },
    );
    return response.data;
  },

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ): Promise<void> {
    await apiClient.post(ApiRoutes.AUTH.RESET_PASSWORD, {
      token,
      password,
      confirm_password: confirmPassword,
    });
  },

  async getMe(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(ApiRoutes.AUTH.ME);
    return response.data;
  },
};