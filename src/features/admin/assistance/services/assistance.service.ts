import { api, unwrap } from '../../../../core/api/client';
import type { ApiEnvelope } from '../../../../core/api/types';
import type {
  AssistanceDocumentsListData,
  AssistanceListData,
  AssistanceQuery,
  AssistanceRequest,
  AssistanceSummaryStats,
  CreateAssistanceRequestPayload,
  UpdateAssistanceStatusBody,
} from '../types/assistance.types';

export const assistanceService = {
  async create(payload: CreateAssistanceRequestPayload): Promise<AssistanceRequest> {
    const res = await api.post<ApiEnvelope<AssistanceRequest>>('/assistance-requests', payload);
    return unwrap(res.data);
  },

  async list(query: AssistanceQuery = {}): Promise<AssistanceListData> {
    const params: AssistanceQuery = {
      page: query.page ?? 1,
      limit: query.limit ?? 100,
      ...(query.status && { status: query.status }),
      ...(query.search && { search: query.search }),
      ...(query.category && { category: query.category }),
      ...(query.min_amount !== undefined && { min_amount: query.min_amount }),
      ...(query.max_amount !== undefined && { max_amount: query.max_amount }),
      ...(query.from_date && { from_date: query.from_date }),
      ...(query.to_date && { to_date: query.to_date }),
    };
    const res = await api.get<ApiEnvelope<AssistanceListData>>('/assistance-requests', { params });
    return unwrap(res.data);
  },

  async getStatsSummary(query: AssistanceQuery = {}): Promise<AssistanceSummaryStats> {
    const params = {
      ...(query.status && { status: query.status }),
      ...(query.search && { search: query.search }),
      ...(query.category && { category: query.category }),
      ...(query.min_amount !== undefined && { min_amount: query.min_amount }),
      ...(query.max_amount !== undefined && { max_amount: query.max_amount }),
      ...(query.from_date && { from_date: query.from_date }),
      ...(query.to_date && { to_date: query.to_date }),
    };
    const res = await api.get<ApiEnvelope<AssistanceSummaryStats>>('/assistance-requests/stats/summary', { params });
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

