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
  dob?: string;
  date_of_birth?: string;
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

  async changePassword(payload: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      ApiRoutes.AUTH.CHANGE_PASSWORD,
      payload,
    );
    return (response as any)?.data || response;
  },

  async checkDuplicates(
    mobileNumber?: string,
    email?: string,
    excludeUserId?: string,
  ): Promise<{
    available: boolean;
    mobile_taken: boolean;
    email_taken: boolean;
    mobile_message?: string;
    email_message?: string;
  }> {
    try {
      const response = await apiClient.post<{
        available: boolean;
        mobile_taken: boolean;
        email_taken: boolean;
        mobile_message?: string;
        email_message?: string;
      }>(ApiRoutes.AUTH.CHECK_DUPLICATES, {
        mobile_number: mobileNumber,
        email,
        exclude_user_id: excludeUserId,
      });
      const data = (response as any)?.data || response;
      if (data && (typeof data.available === 'boolean' || typeof data.mobile_taken === 'boolean')) {
        return data;
      }
    } catch {
      // In offline mode or when network fails, fallback to local storage
      try {
        const cleanMobile = mobileNumber ? mobileNumber.replace(/\\D/g, '').slice(-10) : undefined;
        const cleanEmail = email ? email.trim().toLowerCase() : undefined;
        let mobile_taken = false;
        let email_taken = false;

        const win = typeof window !== 'undefined' ? window : null;
        if (win && win.localStorage) {
          const rawUsers = win.localStorage.getItem('hrsjm_registered_users');
          if (rawUsers) {
            const users = JSON.parse(rawUsers);
            if (Array.isArray(users)) {
              for (const u of users) {
                if (excludeUserId && (u.id === excludeUserId || u._id === excludeUserId)) continue;
                if (cleanMobile && cleanMobile.length === 10) {
                  const uMobile = (u.phone || u.mobile_number || '').replace(/\\D/g, '').slice(-10);
                  if (uMobile === cleanMobile) mobile_taken = true;
                }
                if (cleanEmail && (u.email || '').trim().toLowerCase() === cleanEmail) {
                  email_taken = true;
                }
              }
            }
          }
          const rawApps = win.localStorage.getItem('hrsjm_local_membership_applications');
          if (rawApps) {
            const apps = JSON.parse(rawApps);
            if (Array.isArray(apps)) {
              for (const a of apps) {
                if (cleanMobile && cleanMobile.length === 10) {
                  const aMobile = (a.phone || a.mobile_number || '').replace(/\\D/g, '').slice(-10);
                  if (aMobile === cleanMobile) mobile_taken = true;
                }
                if (cleanEmail && (a.email || '').trim().toLowerCase() === cleanEmail) {
                  email_taken = true;
                }
              }
            }
          }
        }

        if (mobile_taken || email_taken) {
          return {
            available: false,
            mobile_taken,
            email_taken,
            mobile_message: mobile_taken ? 'Mobile number is already registered. Please sign in or use another number.' : undefined,
            email_message: email_taken ? 'Email address is already registered. Please sign in or use another email.' : undefined,
          };
        }
      } catch {
        // Ignore fallback errors
      }
    }

    return {
      available: true,
      mobile_taken: false,
      email_taken: false,
    };
  },
};