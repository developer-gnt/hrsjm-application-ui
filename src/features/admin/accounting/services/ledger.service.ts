import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type {
  AccountLedgerResponse,
  GlobalLedgerResponse,
} from '../types/accounting.types';

export interface GlobalLedgerParams {
  from_date: string;
  to_date: string;
  account_id?: string;
  entry_type?: string;
  reference?: string;
  page?: number;
  limit?: number;
}

export interface AccountLedgerParams {
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export const getGlobalLedgerApi = async (
  params: GlobalLedgerParams,
): Promise<GlobalLedgerResponse> => {
  const res = await apiClient.get<GlobalLedgerResponse>(
    ApiRoutes.ACCOUNTING.LEDGER,
    { params },
  );
  return res.data;
};

export const getAccountLedgerApi = async (
  accountId: string,
  params?: AccountLedgerParams,
): Promise<AccountLedgerResponse> => {
  const res = await apiClient.get<AccountLedgerResponse>(
    ApiRoutes.ACCOUNTING.ACCOUNT_LEDGER(accountId),
    { params },
  );
  return res.data;
};
