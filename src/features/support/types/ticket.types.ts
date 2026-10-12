export type TicketStatus = 'pending' | 'open' | 'in_progress' | 'resolved' | 'closed';

export type StatusTabKey = 'all' | 'pending' | 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketAttachment {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string; // 'pdf' | 'jpg' | 'png' | 'doc' | 'docx'
  uri?: string;
}

export interface SupportTicket {
  id: string; // e.g. "TKT202600125"
  ticketNumber: string; // e.g. "#TKT202600125"
  category: string;
  relatedPage?: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string; // ISO string e.g. "2026-09-20T11:24:00Z"
  formattedDate: string;
  attachments?: TicketAttachment[];
}

export interface TicketStatsData {
  total: number;
  pending: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface TicketCategoryItem {
  id: string;
  name: string;
  helperText: string;
  iconName: string;
  tintColor: string;
  bgColor: string;
}

export interface DateFilter {
  mode: 'single' | 'range';
  singleDate?: string; // YYYY-MM-DD
  fromDate?: string;   // YYYY-MM-DD
  toDate?: string;     // YYYY-MM-DD
}

export interface TicketDraft {
  category: string;
  subject: string;
  description: string;
  attachments: TicketAttachment[];
}

