import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';

export const reportKeys = {
  all: ['reports'] as const,
  trialBalance: (asOfDate: string, includeZero?: boolean) =>
    [...reportKeys.all, 'trial-balance', asOfDate, Boolean(includeZero)] as const,
  trialBalanceSummary: (asOfDate: string) =>
    [...reportKeys.all, 'trial-balance-summary', asOfDate] as const,
  profitLoss: (startDate: string, endDate: string) =>
    [...reportKeys.all, 'profit-loss', startDate, endDate] as const,
  profitLossSummary: (startDate: string, endDate: string) =>
    [...reportKeys.all, 'profit-loss-summary', startDate, endDate] as const,
  balanceSheet: (asOfDate: string) =>
    [...reportKeys.all, 'balance-sheet', asOfDate] as const,
  balanceSheetSummary: (asOfDate: string) =>
    [...reportKeys.all, 'balance-sheet-summary', asOfDate] as const,
};

export const useTrialBalance = (asOfDate: string, includeZeroBalance: boolean = false) => {
  return useQuery({
    queryKey: reportKeys.trialBalance(asOfDate, includeZeroBalance),
    queryFn: () => reportsService.getTrialBalance({ as_of_date: asOfDate, include_zero_balance: includeZeroBalance }),
    enabled: Boolean(asOfDate),
    staleTime: 60_000,
  });
};

export const useTrialBalanceSummary = (asOfDate: string) => {
  return useQuery({
    queryKey: reportKeys.trialBalanceSummary(asOfDate),
    queryFn: () => reportsService.getTrialBalanceSummary({ as_of_date: asOfDate }),
    enabled: Boolean(asOfDate),
    staleTime: 60_000,
  });
};

export const useProfitLoss = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: reportKeys.profitLoss(startDate, endDate),
    queryFn: () => reportsService.getProfitLoss({ start_date: startDate, end_date: endDate }),
    enabled: Boolean(startDate && endDate),
    staleTime: 60_000,
  });
};

export const useProfitLossSummary = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: reportKeys.profitLossSummary(startDate, endDate),
    queryFn: () => reportsService.getProfitLossSummary({ start_date: startDate, end_date: endDate }),
    enabled: Boolean(startDate && endDate),
    staleTime: 60_000,
  });
};

export const useBalanceSheet = (asOfDate: string) => {
  return useQuery({
    queryKey: reportKeys.balanceSheet(asOfDate),
    queryFn: () => reportsService.getBalanceSheet({ as_of_date: asOfDate }),
    enabled: Boolean(asOfDate),
    staleTime: 60_000,
  });
};

export const useBalanceSheetSummary = (asOfDate: string) => {
  return useQuery({
    queryKey: reportKeys.balanceSheetSummary(asOfDate),
    queryFn: () => reportsService.getBalanceSheetSummary({ as_of_date: asOfDate }),
    enabled: Boolean(asOfDate),
    staleTime: 60_000,
  });
};
