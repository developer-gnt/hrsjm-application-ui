import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type {
  JournalEntriesListResponse,
  JournalEntryItem,
} from '../types/accounting.types';

export interface ListEntriesParams {
  page?: number;
  limit?: number;
  reference_type?: string;
  reference_id?: string;
  entry_type?: string;
  date_from?: string;
  date_to?: string;
}

export const listJournalEntriesApi = async (
  params?: ListEntriesParams,
): Promise<JournalEntriesListResponse> => {
  const res = await apiClient.get<JournalEntriesListResponse>(
    ApiRoutes.ACCOUNTING.ENTRIES,
    { params },
  );
  return res.data;
};

export const getJournalEntryByIdApi = async (
  id: string,
): Promise<JournalEntryItem> => {
  const res = await apiClient.get<JournalEntryItem>(
    `${ApiRoutes.ACCOUNTING.ENTRIES}/${id}`,
  );
  return res.data;
};

export const reverseJournalEntryApi = async (
  id: string,
  reason?: string,
): Promise<JournalEntryItem> => {
  const res = await apiClient.post<JournalEntryItem>(
    ApiRoutes.ACCOUNTING.REVERSE_ENTRY(id),
    { reason },
  );
  return res.data;
};
