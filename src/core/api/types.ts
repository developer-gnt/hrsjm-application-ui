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
export type UserRole = 'ADMIN' | 'MEMBER' | 'DONOR' | 'DONATION_SEEKER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
