/**
 * Auth domain types — MUST mirror the backend contract in
 * HRSJM-back-api (auth.service.ts / users.service.ts). Do not invent fields.
 */

/** Role info attached to the user profile (from users.service.ts). */
export interface UserRoleInfo {
  id: string;
  name: string;
}

/** UserProfile as returned by GET /auth/me and nested in auth responses. */
export interface UserProfile {
  id: string;
  full_name: string;
  mobile_number: string;
  email: string | null;
  avatar?: string | null;
  status: string;
  roles: UserRoleInfo[];
  created_at: string;
  updated_at: string;
}

/** Token pair issued by login/refresh (snake_case per backend contract). */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

/** Payload of POST /auth/login and POST /auth/refresh. */
export interface AuthSession extends AuthTokens {
  user: UserProfile;
}

/** Payload of POST /auth/forgot-password. `reset_token` is only present
 * outside production (manual testing channel — delivery mechanism is TBC). */
export interface ForgotPasswordResult {
  delivered_mechanism: string;
  reset_token?: string;
}

/** One of the user's roles, flattened for convenience. */
export type UserRole = UserRoleInfo['name'];