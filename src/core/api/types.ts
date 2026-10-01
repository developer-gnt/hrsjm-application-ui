// Backend response envelope: { success: true, message, data }
// Errors: { success: false, message, error: { code, details } }
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: unknown;
  };
}

// List endpoints return data: { items, meta } (backend buildPaginationMeta)
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PageQuery {
  page?: number;
  limit?: number;
}

// Shared backend enums (confirmed against implemented backend contract)
export type UserRoleName = 'ADMIN' | 'MEMBER' | 'DONOR' | 'DONATION_SEEKER';

// CommonStatus enum (backend common/enums/common-status.enum.ts)
export type CommonStatus = 'ACTIVE' | 'INACTIVE';

// Role entry inside the backend UserProfile.roles array
export interface UserRoleInfo {
  id: string;
  name: string;
}

// Backend UserProfile (users.service.ts) - snake_case wire format
export interface AppUser {
  id: string;
  full_name: string;
  mobile_number: string;
  email: string | null;
  status: CommonStatus;
  roles: UserRoleInfo[];
  created_at: string;
  updated_at: string;
}

// Shape of a related user object embedded in entity payloads
// (ticket.user, message.author, ...) - the full UserEntity minus
// password_hash; the UI only relies on the identity fields below.
export interface RelatedUser {
  id: string;
  full_name: string;
  email: string | null;
  mobile_number?: string;
  status?: CommonStatus;
}
