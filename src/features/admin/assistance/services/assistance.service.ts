import { Platform } from 'react-native';
import { api, unwrap } from '../../../../core/api/client';
import type { ApiEnvelope } from '../../../../core/api/types';
import type {
  AssistanceDocumentItem,
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
    const { documents, ...body } = payload;
    const res = await api.post<ApiEnvelope<AssistanceRequest>>('/assistance-requests', body);
    const created = unwrap(res.data);

    if (documents && documents.length > 0 && created?.id) {
      for (const doc of documents) {
        await this.attachDocument(
          created.id,
          {
            uri: doc.uri,
            fileName: doc.file_name,
            name: doc.document_name,
            type: doc.mime_type,
            file: doc.file,
          },
          {
            document_name: doc.document_name,
          },
        );
      }
    }

    return created;
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

  async attachDocument(
    requestId: string,
    fileData: { uri?: string; fileName?: string; name?: string; type?: string; file?: any; blob?: any },
    meta?: { document_name?: string; description?: string },
  ): Promise<AssistanceDocumentItem | null> {
    try {
      const form = new FormData() as any;
      if (fileData.file instanceof Blob) {
        form.append('file', fileData.file, fileData.fileName || fileData.name || 'document.pdf');
      } else if (fileData.blob instanceof Blob) {
        form.append('file', fileData.blob, fileData.fileName || fileData.name || 'document.pdf');
      } else if (fileData.uri) {
        if (Platform.OS === 'web' && typeof fetch !== 'undefined' && fileData.uri.startsWith('blob:')) {
          try {
            const blob = await fetch(fileData.uri).then(r => r.blob());
            form.append('file', blob, fileData.fileName || fileData.name || 'document.pdf');
          } catch {
            form.append('file', {
              uri: fileData.uri,
              name: fileData.fileName || fileData.name || 'document.pdf',
              type: fileData.type || 'application/pdf',
            });
          }
        } else {
          form.append('file', {
            uri: fileData.uri,
            name: fileData.fileName || fileData.name || 'document.pdf',
            type: fileData.type || 'application/pdf',
          });
        }
      }
      if (meta?.document_name || fileData.name || fileData.fileName) {
        form.append('document_name', meta?.document_name || fileData.name || fileData.fileName || 'Supporting Document');
      }
      if (meta?.description) {
        form.append('description', meta.description);
      }
      const res = await api.post<ApiEnvelope<AssistanceDocumentItem>>(
        `/assistance-requests/${requestId}/documents`,
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return unwrap(res.data);
    } catch (err) {
      console.warn('Failed to attach document to assistance request:', err);
      return null;
    }
  },
};

