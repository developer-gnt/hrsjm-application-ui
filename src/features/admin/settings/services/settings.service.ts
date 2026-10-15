import { api, unwrap } from '../../../../core/api/client';
import type { ApiEnvelope, AppUser } from '../../../../core/api/types';

// Routes confirmed against the implemented backend (HRSJM-back-api, auth
// module): PATCH /auth/me accepts full_name and/or email ONLY. There is no
// phone, profile-image or change-password endpoint (reported gaps) - nothing
// beyond the supported fields is ever sent.
export interface UpdateProfileBody {
  full_name?: string;
  email?: string;
}

export const settingsService = {
  async updateProfile(body: UpdateProfileBody): Promise<AppUser> {
    const payload: UpdateProfileBody = {};
    if (body.full_name !== undefined) {
      payload.full_name = body.full_name;
    }
    if (body.email !== undefined) {
      payload.email = body.email;
    }
    const res = await api.patch<ApiEnvelope<AppUser>>('/auth/me', payload);
    return unwrap(res.data);
  },
};
