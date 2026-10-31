import { api, unwrap } from '../../../../core/api/client';
import type { ApiEnvelope, AppUser } from '../../../../core/api/types';

export interface UpdateProfileBody {
  full_name?: string;
  email?: string;
  mobile_number?: string;
  phone?: string;
}

export interface ChangePasswordBody {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const settingsService = {
  async updateProfile(body: UpdateProfileBody): Promise<AppUser> {
    const payload: Record<string, any> = {};
    if (body.full_name !== undefined) {
      payload.full_name = body.full_name;
    }
    if (body.email !== undefined) {
      payload.email = body.email;
    }
    if (body.mobile_number !== undefined || body.phone !== undefined) {
      payload.mobile_number = body.mobile_number ?? body.phone;
    }
    const res = await api.patch<ApiEnvelope<AppUser>>('/auth/me', payload);
    return unwrap(res.data);
  },

  async changePassword(body: ChangePasswordBody): Promise<{ success: boolean; message: string }> {
    const res = await api.post<ApiEnvelope<{ success: boolean; message: string }>>(
      '/auth/change-password',
      body,
    );
    return unwrap(res.data);
  },
};
