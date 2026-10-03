import { api, unwrap } from '../../../../core/api/client';
import type { ApiEnvelope } from '../../../../core/api/types';
import type {
  AddTicketMessageBody,
  SupportTicket,
  SupportTicketListData,
  SupportTicketMessage,
  SupportTicketQuery,
  UpdateTicketStatusBody,
} from '../types/support.types';
import type { SupportTicketDocumentsListData } from './support.documents.types';

// Routes confirmed against the implemented backend (HRSJM-back-api,
// modules/support): GET /support-tickets, GET /support-tickets/:id,
// PATCH /support-tickets/:id/status { status, note? } (permission
// support.manage), POST /support-tickets/:id/messages { body },
// GET /support-tickets/:id/messages (full history, no pagination).
//
// Confirmed gaps vs the phase plan - no backend support exists (reported):
//   assignment / escalation endpoints, priority, category, assignee,
//   date-range filters. The list endpoint only supports page, limit,
//   status, user_id and search (subject + description).
//
// The backend rejects unknown query fields (strict whitelist validation),
// so nothing beyond the supported params is ever sent.
export const supportService = {
  async list(query: SupportTicketQuery = {}): Promise<SupportTicketListData> {
    const params: SupportTicketQuery = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
    if (query.status) {
      params.status = query.status;
    }
    if (query.search) {
      params.search = query.search;
    }
    const res = await api.get<ApiEnvelope<SupportTicketListData>>('/support-tickets', { params });
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
