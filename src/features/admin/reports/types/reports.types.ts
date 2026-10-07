import type { AccountType } from '../../accounting/types/accounting.types';

export type DatePresetKey =
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_QUARTER'
  | 'THIS_FY'
  | 'LAST_FY'
  | 'CUSTOM';

export interface DateRangePreset {
  key: DatePresetKey;
  label: string;
  startDate: string;
  endDate: string;
  asOfDate: string;
}

// ==========================================
// PLATFORM ANALYTICS & DASHBOARD REPORTS
// ==========================================
export interface AnalyticsKpiData {
  total_users: number;
  users_growth_pct: number;
  total_donations_amount: number;
  donations_growth_pct: number;
  total_donations_count: number;
  total_complaints: number;
  complaints_growth_pct: number;
  total_events: number;
  events_growth_pct: number;
}

export interface UserGrowthPoint {
  label: string;
  count: number;
  date: string;
}

export interface UserDistributionSlice {
  label: string;
  count: number;
  pct: string;
  color: string;
}

export interface DonationsOverviewData {
  total_amount: number;
  growth_pct: number;
  total_donations: number;
  donations_count_growth_pct: number;
}

export interface ComplaintsOverviewData {
  total: number;
  resolved: number;
  in_progress: number;
  pending: number;
  growth_pct: number;
  resolved_pct: number;
  in_progress_pct: number;
  pending_pct: number;
}

export interface ContentPerformanceItem {
  rank: number;
  title: string;
  views: string;
}

export interface EventsOverviewData {
  total_events: number;
  events_growth_pct: number;
  total_registrations: number;
  registrations_growth_pct: number;
  avg_attendance_pct: number;
}

export interface ReportsAnalyticsResponse {
  kpis: AnalyticsKpiData;
  user_growth: UserGrowthPoint[];
  user_distribution: UserDistributionSlice[];
  donations_overview: DonationsOverviewData;
  complaints_overview: ComplaintsOverviewData;
  top_content: {
    rights: ContentPerformanceItem[];
    blogs: ContentPerformanceItem[];
    news: ContentPerformanceItem[];
  };
  events_overview: EventsOverviewData;
}

// ==========================================
// TRIAL BALANCE
// ==========================================
export interface TrialBalanceAccountItem {
  account: {
    id: string;
    account_code: string | null;
    account_name: string;
    account_type: AccountType;
  };
  gross_debit: number;
  gross_credit: number;
  debit_balance: number;
  credit_balance: number;
}

export interface TrialBalanceReportResponse {
  as_of_date: string;
  accounts: TrialBalanceAccountItem[];
  total_debit: number;
  total_credit: number;
  total_gross_debit: number;
  total_gross_credit: number;
  difference: number;
  is_balanced: boolean;
}

export interface AccountTypeSummary {
  account_type: AccountType;
  total_debit: number;
  total_credit: number;
  net_balance: number;
  account_count: number;
}

export interface TrialBalanceSummaryResponse {
  as_of_date: string;
  total_debit: number;
  total_credit: number;
  difference: number;
  is_balanced: boolean;
  total_accounts: number;
  by_account_type: Record<string, AccountTypeSummary>;
}

// ==========================================
// PROFIT & LOSS
// ==========================================
export interface ProfitLossAccountItem {
  account: {
    id: string;
    account_code: string | null;
    account_name: string;
    account_type: AccountType;
  };
  gross_debit: number;
  gross_credit: number;
  amount: number;
}

export interface ProfitLossCategoryGroup {
  items: ProfitLossAccountItem[];
  total: number;
}

export interface ProfitLossReportResponse {
  from_date: string;
  to_date: string;
  income: ProfitLossCategoryGroup;
  expenses: ProfitLossCategoryGroup;
  total_income: number;
  total_expenses: number;
  net_result: number;
  net_profit_loss: number;
  result_type: 'SURPLUS' | 'DEFICIT';
}

export interface ProfitLossSummaryResponse {
  from_date: string;
  to_date: string;
  total_income: number;
  total_expenses: number;
  net_result: number;
  net_profit_loss: number;
  result_type: 'SURPLUS' | 'DEFICIT';
  income_accounts_count: number;
  expense_accounts_count: number;
}

// ==========================================
// BALANCE SHEET
// ==========================================
export interface BalanceSheetAccountItem {
  account: {
    id: string;
    account_code: string | null;
    account_name: string;
    account_type: AccountType;
  };
  gross_debit: number;
  gross_credit: number;
  amount: number;
}

export interface BalanceSheetCategoryGroup {
  items: BalanceSheetAccountItem[];
  total: number;
}

export interface EquityCategoryGroup {
  items: BalanceSheetAccountItem[];
  total_equity_accounts: number;
  current_surplus_deficit: number;
  total: number;
}

export interface BalanceSheetReportResponse {
  as_of_date: string;
  assets: BalanceSheetCategoryGroup;
  liabilities: BalanceSheetCategoryGroup;
  equity: EquityCategoryGroup;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  total_liabilities_and_equity: number;
  difference: number;
  is_balanced: boolean;
}

export interface BalanceSheetSummaryResponse {
  as_of_date: string;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  current_surplus_deficit: number;
  total_liabilities_and_equity: number;
  difference: number;
  is_balanced: boolean;
  asset_accounts_count: number;
  liability_accounts_count: number;
  equity_accounts_count: number;
}
