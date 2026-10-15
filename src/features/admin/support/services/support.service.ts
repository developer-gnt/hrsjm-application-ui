import { api, unwrap } from '../../../../core/api/client';
import type { ApiEnvelope } from '../../../../core/api/types';
import type {
  AddTicketMessageBody,
  CreateTicketBody,
  SupportTicket,
  SupportTicketListData,
  SupportTicketMessage,
  SupportTicketQuery,
  UpdateTicketStatusBody,
} from '../types/support.types';
import type { SupportTicketDocumentsListData } from './support.documents.types';

export interface TicketStatsData {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export const supportService = {
  async list(query: SupportTicketQuery = {}): Promise<SupportTicketListData> {
    const params: Record<string, any> = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
    if (query.status) params.status = query.status;
    if (query.category && query.category !== 'ALL') params.category = query.category;
    if (query.from_date) params.from_date = query.from_date;
    if (query.to_date) params.to_date = query.to_date;
    if (query.search) params.search = query.search;

    const res = await api.get<ApiEnvelope<SupportTicketListData>>('/support-tickets', { params });
    return unwrap(res.data);
  },

  async create(body: CreateTicketBody): Promise<SupportTicket> {
    const payload: { subject: string; description: string } = {
      subject: body.category && body.category !== 'ALL' && !body.subject.includes(`[${body.category}]`)
        ? `[${body.category}] ${body.subject.trim()}`
        : body.subject.trim(),
      description: body.priority && body.priority !== 'NORMAL'
        ? `[Priority: ${body.priority}]\n\n${body.description.trim()}`
        : body.description.trim(),
    };
    const res = await api.post<ApiEnvelope<SupportTicket>>('/support-tickets', payload);
    return unwrap(res.data);
  },

  async getStatsSummary(query: SupportTicketQuery = {}): Promise<TicketStatsData> {
    const params: Record<string, any> = {};
    if (query.status) params.status = query.status;
    if (query.category && query.category !== 'ALL') params.category = query.category;
    if (query.from_date) params.from_date = query.from_date;
    if (query.to_date) params.to_date = query.to_date;
    if (query.search) params.search = query.search;

    const res = await api.get<ApiEnvelope<TicketStatsData>>('/support-tickets/stats/summary', { params });
    return unwrap(res.data);
  },

  async getById(id: string): Promise<SupportTicket> {
    const res = await api.get<ApiEnvelope<SupportTicket>>(`/support-tickets/${id}`);
    return unwrap(res.data);
  },

  async updateStatus(id: string, body: UpdateTicketStatusBody): Promise<SupportTicket> {
    const res = await api.patch<ApiEnvelope<SupportTicket>>(
      `/support-tickets/${id}/status`,
      body,
    );
    return unwrap(res.data);
  },

  async listMessages(id: string): Promise<SupportTicketMessage[]> {
    const res = await api.get<ApiEnvelope<SupportTicketMessage[]>>(
      `/support-tickets/${id}/messages`,
    );
    return unwrap(res.data);
  },

  async addMessage(id: string, body: AddTicketMessageBody): Promise<SupportTicketMessage> {
    const res = await api.post<ApiEnvelope<SupportTicketMessage>>(
      `/support-tickets/${id}/messages`,
      body,
    );
    return unwrap(res.data);
  },

  // Ticket attachments live in the shared documents module, related to the
  // ticket via related_entity_type=SUPPORT_TICKET (confirmed contract).
  async listAttachments(ticketId: string, page = 1, limit = 50): Promise<SupportTicketDocumentsListData> {
    const res = await api.get<ApiEnvelope<SupportTicketDocumentsListData>>('/documents', {
      params: {
        related_entity_type: 'SUPPORT_TICKET',
        related_entity_id: ticketId,
        page,
        limit,
      },
    });
    return unwrap(res.data);
  },
};
