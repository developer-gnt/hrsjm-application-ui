import { api, unwrap } from '../../../../core/api/client';
import type { ApiEnvelope } from '../../../../core/api/types';
import type {
  AssistanceDocumentsListData,
  AssistanceListData,
  AssistanceQuery,
  AssistanceRequest,
  UpdateAssistanceStatusBody,
} from '../types/assistance.types';

// Routes confirmed against the implemented backend (HRSJM-back-api):
//   GET   /assistance-requests?status&page&limit          (admin)
//   GET   /assistance-requests/:id                        (admin or owner)
//   PATCH /assistance-requests/:id/status { status, admin_remark? }
//   GET   /documents?related_entity_type=ASSISTANCE_REQUEST&related_entity_id=...
// No other query parameters exist yet - do not send unsupported params,
// the backend rejects unknown fields (strict whitelist validation).
export const assistanceService = {
  async list(query: AssistanceQuery = {}): Promise<AssistanceListData> {
    const params: AssistanceQuery = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
    if (query.status) {
      params.status = query.status;
    }
    const res = await api.get<ApiEnvelope<AssistanceListData>>('/assistance-requests', { params });
    return unwrap(res.data);
  },

  async getById(id: string): Promise<AssistanceRequest> {
    const res = await api.get<ApiEnvelope<AssistanceRequest>>(`/assistance-requests/${id}`);
    return unwrap(res.data);
  },

  async updateStatus(id: string, body: UpdateAssistanceStatusBody): Promise<AssistanceRequest> {
    const res = await api.patch<ApiEnvelope<AssistanceRequest>>(
      `/assistance-requests/${id}/status`,
      body,
    );
    return unwrap(res.data);
  },

  async listDocuments(requestId: string, page = 1, limit = 50): Promise<AssistanceDocumentsListData> {
    const res = await api.get<ApiEnvelope<AssistanceDocumentsListData>>('/documents', {
      params: {
        related_entity_type: 'ASSISTANCE_REQUEST',
        related_entity_id: requestId,
        page,
        limit,
      },
    });
    return unwrap(res.data);
  },
};
