// Types mirror the implemented backend contract exactly (see phase report):
// enum AssistanceRequestStatus, toSafeRequest() payload, envelope + { items, meta }.
import type { PaginationMeta } from '../../../../core/api/types';

export type AssistanceStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLOSED';

export interface AssistanceOwner {
  id: string;
  fullName: string;
  email: string;
}

export interface AssistanceRequest {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  requestedAmount: string; // numeric(12,2) arrives as string
  reason: string;
  description: string | null;
  status: AssistanceStatus;
  adminRemark: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: AssistanceOwner;
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
  adminRemark?: string;
}

export interface AssistanceDocumentItem {
  id: string;
  documentName: string;
  documentType: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  description: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
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
