import { Platform } from 'react-native';
import { API_BASE_URL, api, unwrap } from '../../../../core/api/client';
import { tokenStorage } from '../../../../core/storage/token-storage';
import type { ApiEnvelope } from '../../../../core/api/types';

function dataUriToBlob(dataUri: string, fallbackMime = 'application/octet-stream'): any {
  const WebBlob = (globalThis as any).Blob;
  const commaIdx = dataUri.indexOf(',');
  if (commaIdx === -1) {
    return new WebBlob([], { type: fallbackMime });
  }
  const meta = dataUri.slice(0, commaIdx);
  const body = dataUri.slice(commaIdx + 1);
  const mimeMatch = meta.match(/^data:([^;]+)/i);
  const mime = mimeMatch ? mimeMatch[1] : fallbackMime;
  const isBase64 = /;base64$/i.test(meta);
  if (!isBase64) {
    return new WebBlob([decodeURIComponent(body)], { type: mime });
  }
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new WebBlob([bytes], { type: mime });
}
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
    const fileName = fileData.fileName || fileData.name || 'document.pdf';
    const fallbackMime = fileData.type || (fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    const form = new FormData() as any;

    if (fileData.file instanceof Blob) {
      form.append('file', fileData.file, fileName);
    } else if (fileData.blob instanceof Blob) {
      form.append('file', fileData.blob, fileName);
    } else if (fileData.uri) {
      if (Platform.OS === 'web') {
        if (fileData.uri.startsWith('data:')) {
          const blob = dataUriToBlob(fileData.uri, fallbackMime);
          form.append('file', blob, fileName);
        } else if (fileData.uri.startsWith('blob:') && typeof fetch !== 'undefined') {
          const blob = await fetch(fileData.uri).then(r => r.blob());
          form.append('file', blob, fileName);
        } else {
          form.append('file', {
            uri: fileData.uri,
            name: fileName,
            type: fallbackMime,
          });
        }
      } else {
        form.append('file', {
          uri: fileData.uri,
          name: fileName,
          type: fallbackMime,
        });
      }
    }

    if (meta?.document_name || fileData.name || fileData.fileName) {
      form.append('document_name', meta?.document_name || fileData.name || fileData.fileName || 'Supporting Document');
    }
    if (meta?.description) {
      form.append('description', meta.description);
    }

    if (Platform.OS === 'web' && typeof fetch !== 'undefined') {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(
        `${API_BASE_URL}/assistance-requests/${requestId}/documents`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form,
        },
      );
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          json?.message || `Document upload failed with status ${response.status}`;
        throw new Error(message);
      }
      return unwrap(json);
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
  },
};

