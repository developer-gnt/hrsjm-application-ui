import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type {
  AccountItem,
  AccountType,
  CreateAccountPayload,
  UpdateAccountPayload,
} from '../types/accounting.types';

export interface ListAccountsParams {
  type?: AccountType;
  is_active?: boolean;
  search?: string;
  limit?: number;
  page?: number;
}

export const listAccounts = async (
  params?: ListAccountsParams,
): Promise<AccountItem[]> => {
  const queryParams: Record<string, any> = {
    limit: params?.limit ?? 200,
  };
  if (params?.type) {
    queryParams.account_type = params.type;
    queryParams.type = params.type;
  }
  if (params?.is_active !== undefined) queryParams.is_active = params.is_active;
  if (params?.search && params.search.trim()) queryParams.search = params.search.trim();
  if (params?.page) queryParams.page = params.page;

  const res = await apiClient.get<any>(
    ApiRoutes.ACCOUNTING.ACCOUNTS,
    { params: queryParams },
  );
  const data = res.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.items)) {
    return data.items;
  }
  return [];
};

export const getAccountById = async (id: string): Promise<AccountItem> => {
  const res = await apiClient.get<AccountItem>(
    `${ApiRoutes.ACCOUNTING.ACCOUNTS}/${id}`,
  );
  return res.data;
};

export const createAccountApi = async (
  payload: CreateAccountPayload,
): Promise<AccountItem> => {
  const res = await apiClient.post<AccountItem>(
    ApiRoutes.ACCOUNTING.ACCOUNTS,
    payload,
  );
  return res.data;
};

export const updateAccountApi = async (
  id: string,
  payload: UpdateAccountPayload,
): Promise<AccountItem> => {
  const res = await apiClient.patch<AccountItem>(
    `${ApiRoutes.ACCOUNTING.ACCOUNTS}/${id}`,
    payload,
  );
  return res.data;
};

export const updateAccountStatusApi = async (
  id: string,
  is_active: boolean,
): Promise<AccountItem> => {
  const res = await apiClient.patch<AccountItem>(
    `${ApiRoutes.ACCOUNTING.ACCOUNTS}/${id}/status`,
    { is_active },
  );
  return res.data;
};