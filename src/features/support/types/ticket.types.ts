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

export const isImageFile = (type?: string, name?: string): boolean => {
  const normType = (type || '').toLowerCase();
  const normName = (name || '').toLowerCase();
  return (
    normType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(normType) ||
    /.(jpe?g|png|webp|gif|bmp|svg)$/i.test(normName)
  );
};

export const formatAttachmentSize = (
  size?: number | null,
  formattedSize?: string | null,
  fallback = '150 KB'
): string => {
  if (
    formattedSize &&
    !formattedSize.startsWith('0.0') &&
    !formattedSize.startsWith('0 ') &&
    formattedSize !== '0MB' &&
    formattedSize !== '0 MB' &&
    formattedSize !== '0.0MB' &&
    formattedSize !== '0.0 MB' &&
    formattedSize !== '0 B' &&
    formattedSize !== '0 KB'
  ) {
    return formattedSize;
  }

  const bytes = typeof size === 'number' ? size : Number(size);
  if (!bytes || isNaN(bytes) || bytes <= 0) {
    return fallback;
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
};

export const getAttachmentIconConfig = (
  type?: string,
  name?: string
): { icon: string; bg: string } => {
  const norm = (type || '').toLowerCase();
  const normName = (name || '').toLowerCase();
  if (norm === 'pdf' || norm.includes('pdf') || normName.endsWith('.pdf')) {
    return { icon: '📄', bg: '#FEE2E2' };
  }
  if (
    norm.includes('word') ||
    norm === 'doc' ||
    norm === 'docx' ||
    normName.endsWith('.doc') ||
    normName.endsWith('.docx')
  ) {
    return { icon: '📝', bg: '#DBEAFE' };
  }
  if (isImageFile(norm, normName)) {
    return { icon: '🖼️', bg: '#DCFCE7' };
  }
  return { icon: '📎', bg: '#F1F5F9' };
};
