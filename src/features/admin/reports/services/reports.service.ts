import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type {
  BalanceSheetReportResponse,
  BalanceSheetSummaryResponse,
  ProfitLossReportResponse,
  ProfitLossSummaryResponse,
  ReportsAnalyticsResponse,
  TrialBalanceReportResponse,
  TrialBalanceSummaryResponse,
} from '../types/reports.types';

export const reportsService = {
  // 0. Platform Analytics Overview
  async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ReportsAnalyticsResponse> {
    const res = await apiClient.get<ReportsAnalyticsResponse>(
      '/reports/analytics',
      { params },
    );
    const data = (res as any)?.data?.data || (res as any)?.data || res;
    return data as ReportsAnalyticsResponse;
  },

  // 1. Trial Balance
  async getTrialBalance(params: {
    as_of_date: string;
    include_zero_balance?: boolean;
  }): Promise<TrialBalanceReportResponse> {
    const res = await apiClient.get<TrialBalanceReportResponse>(
      ApiRoutes.REPORTS.TRIAL_BALANCE,
      { params },
    );
    const data = (res as any)?.data?.data || (res as any)?.data || res;
    return data as TrialBalanceReportResponse;
  },

  async getTrialBalanceSummary(params: {
    as_of_date: string;
  }): Promise<TrialBalanceSummaryResponse> {
    const res = await apiClient.get<TrialBalanceSummaryResponse>(
      `${ApiRoutes.REPORTS.TRIAL_BALANCE}/summary`,
      { params },
    );
    const data = (res as any)?.data?.data || (res as any)?.data || res;
    return data as TrialBalanceSummaryResponse;
  },

  // 2. Profit & Loss
  async getProfitLoss(params: {
    start_date: string;
    end_date: string;
  }): Promise<ProfitLossReportResponse> {
    const res = await apiClient.get<ProfitLossReportResponse>(
      ApiRoutes.REPORTS.PROFIT_LOSS,
      { params },
    );
    const data = (res as any)?.data?.data || (res as any)?.data || res;
    return data as ProfitLossReportResponse;
  },

  async getProfitLossSummary(params: {
    start_date: string;
    end_date: string;
  }): Promise<ProfitLossSummaryResponse> {
    const res = await apiClient.get<ProfitLossSummaryResponse>(
      `${ApiRoutes.REPORTS.PROFIT_LOSS}/summary`,
      { params },
    );
    const data = (res as any)?.data?.data || (res as any)?.data || res;
    return data as ProfitLossSummaryResponse;
  },

  // 3. Balance Sheet
  async getBalanceSheet(params: {
    as_of_date: string;
  }): Promise<BalanceSheetReportResponse> {
    const res = await apiClient.get<BalanceSheetReportResponse>(
      ApiRoutes.REPORTS.BALANCE_SHEET,
      { params },
    );
    const data = (res as any)?.data?.data || (res as any)?.data || res;
    return data as BalanceSheetReportResponse;
  },

  async getBalanceSheetSummary(params: {
    as_of_date: string;
  }): Promise<BalanceSheetSummaryResponse> {
    const res = await apiClient.get<BalanceSheetSummaryResponse>(
      `${ApiRoutes.REPORTS.BALANCE_SHEET}/summary`,
      { params },
    );
    const data = (res as any)?.data?.data || (res as any)?.data || res;
    return data as BalanceSheetSummaryResponse;
  },
};
