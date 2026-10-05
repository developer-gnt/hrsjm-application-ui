import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type {
  BalanceSheetReportResponse,
  BalanceSheetSummaryResponse,
  ProfitLossReportResponse,
  ProfitLossSummaryResponse,
  TrialBalanceReportResponse,
  TrialBalanceSummaryResponse,
} from '../types/reports.types';

export const reportsService = {
  // 1. Trial Balance
  async getTrialBalance(params: {
    as_of_date: string;
    include_zero_balance?: boolean;
  }): Promise<TrialBalanceReportResponse> {
    const res = await apiClient.get<TrialBalanceReportResponse>(
      ApiRoutes.REPORTS.TRIAL_BALANCE,
      { params },
    );
    return res.data;
  },

  async getTrialBalanceSummary(params: {
    as_of_date: string;
  }): Promise<TrialBalanceSummaryResponse> {
    const res = await apiClient.get<TrialBalanceSummaryResponse>(
      `${ApiRoutes.REPORTS.TRIAL_BALANCE}/summary`,
      { params },
    );
    return res.data;
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
    return res.data;
  },

  async getProfitLossSummary(params: {
    start_date: string;
    end_date: string;
  }): Promise<ProfitLossSummaryResponse> {
    const res = await apiClient.get<ProfitLossSummaryResponse>(
      `${ApiRoutes.REPORTS.PROFIT_LOSS}/summary`,
      { params },
    );
    return res.data;
  },

  // 3. Balance Sheet
  async getBalanceSheet(params: {
    as_of_date: string;
  }): Promise<BalanceSheetReportResponse> {
    const res = await apiClient.get<BalanceSheetReportResponse>(
      ApiRoutes.REPORTS.BALANCE_SHEET,
      { params },
    );
    return res.data;
  },

  async getBalanceSheetSummary(params: {
    as_of_date: string;
  }): Promise<BalanceSheetSummaryResponse> {
    const res = await apiClient.get<BalanceSheetSummaryResponse>(
      `${ApiRoutes.REPORTS.BALANCE_SHEET}/summary`,
      { params },
    );
    return res.data;
  },
};
