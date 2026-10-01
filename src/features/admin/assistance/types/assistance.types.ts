// Types mirror the implemented backend contract exactly (HRSJM-back-api,
// assistance module): snake_case wire format, enum AssistanceRequestStatus,
// PATCH :id/status { status, admin_remark? }, envelope + { items, meta }.
import type { PaginationMeta, RelatedUser } from '../../../../core/api/types';

export type AssistanceStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLOSED';

export interface AssistanceRequest {
  id: string;
  user_id: string;
  full_name: string;
  mobile: string;
  email: string | null;
  // numeric(12,2) - the backend entity transformer parses it to a number
  requested_amount: number;
  reason: string;
  description: string | null;
  status: AssistanceStatus;
  admin_remark: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: RelatedUser;
  // Design-forward optional display fields from the approved mockup (age,
  // location, funds raised) that the current backend contract does NOT send
  // (reported gaps). The UI renders them only when present; the backend
  // rejects unknown fields, so nothing here is ever sent upstream.
  age?: number;
  city?: string;
  raised_amount?: number;
}

export interface AssistanceListData {
  items: AssistanceRequest[];
  meta: PaginationMeta;
}

export interface AssistanceQuery {
  status?: AssistanceStatus;
  page?: number;
  limit?: number;
}

export interface UpdateAssistanceStatusBody {
  status: AssistanceStatus;
  admin_remark?: string;
}

export interface AssistanceDocumentItem {
  id: string;
  document_name: string;
  document_type: string;
  original_file_name: string;
  mime_type: string;
  file_size: number;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssistanceDocumentsListData {
  items: AssistanceDocumentItem[];
  meta: PaginationMeta;
}

// Backend terminal states: APPROVED / REJECTED / CLOSED accept no further transitions.
export const TERMINAL_STATUSES: AssistanceStatus[] = ['APPROVED', 'REJECTED', 'CLOSED'];

export function isTerminalStatus(status: AssistanceStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function shortRequestId(id: string): string {
  return `#${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}
