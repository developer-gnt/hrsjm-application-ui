import { reportsService } from '../../src/features/admin/reports/services/reports.service';
import { apiClient } from '../../src/core/api/client';
import { getDatePresets, getDefaultDatePreset } from '../../src/features/admin/reports/utils/reportDates';
import {
  generateBalanceSheetPdf,
  generateProfitLossPdf,
  generateTrialBalancePdf,
} from '../../src/features/admin/reports/utils/reportPdfDocument';
import type {
  BalanceSheetReportResponse,
  ProfitLossReportResponse,
  TrialBalanceReportResponse,
} from '../../src/features/admin/reports/types/reports.types';

jest.mock('../../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('Phase 7 — Financial Reports Services & Utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Reports Service API Calls', () => {
    it('calls GET /reports/trial-balance with parameters', async () => {
      const mockData: Partial<TrialBalanceReportResponse> = {
        as_of_date: '2026-10-31',
        total_debit: 50000,
        total_credit: 50000,
        is_balanced: true,
        accounts: [],
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

      const result = await reportsService.getTrialBalance({
        as_of_date: '2026-10-31',
        include_zero_balance: false,
      });

      expect(apiClient.get).toHaveBeenCalledWith('/reports/trial-balance', {
        params: { as_of_date: '2026-10-31', include_zero_balance: false },
      });
      expect(result.is_balanced).toBe(true);
      expect(result.total_debit).toBe(50000);
    });

    it('calls GET /reports/profit-loss with date range', async () => {
      const mockData: Partial<ProfitLossReportResponse> = {
        from_date: '2026-04-01',
        to_date: '2027-03-31',
        total_income: 150000,
        total_expenses: 80000,
        net_result: 70000,
        result_type: 'SURPLUS',
        income: { items: [], total: 150000 },
        expenses: { items: [], total: 80000 },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

      const result = await reportsService.getProfitLoss({
        start_date: '2026-04-01',
        end_date: '2027-03-31',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/reports/profit-loss', {
        params: { start_date: '2026-04-01', end_date: '2027-03-31' },
      });
      expect(result.result_type).toBe('SURPLUS');
      expect(result.net_result).toBe(70000);
    });

    it('calls GET /reports/balance-sheet with as_of_date', async () => {
      const mockData: Partial<BalanceSheetReportResponse> = {
        as_of_date: '2026-10-31',
        total_assets: 250000,
        total_liabilities: 50000,
        total_equity: 200000,
        total_liabilities_and_equity: 250000,
        is_balanced: true,
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

      const result = await reportsService.getBalanceSheet({
        as_of_date: '2026-10-31',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/reports/balance-sheet', {
        params: { as_of_date: '2026-10-31' },
      });
      expect(result.is_balanced).toBe(true);
      expect(result.total_assets).toBe(250000);
    });
  });

  describe('Date Preset Calculations', () => {
    it('generates 5 valid reporting presets', () => {
      const presets = getDatePresets();
      expect(presets).toHaveLength(5);
      expect(presets.map(p => p.key)).toEqual([
        'THIS_MONTH',
        'LAST_MONTH',
        'THIS_QUARTER',
        'THIS_FY',
        'LAST_FY',
      ]);
      presets.forEach(p => {
        expect(p.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(p.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(p.asOfDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('provides default date preset as THIS_MONTH', () => {
      const defaultPreset = getDefaultDatePreset();
      expect(defaultPreset.key).toBe('THIS_MONTH');
    });
  });

  describe('PDF Report Generator Output', () => {
    it('generates a valid Trial Balance PDF document', () => {
      const mockData: TrialBalanceReportResponse = {
        as_of_date: '2026-10-31',
        total_debit: 10000,
        total_credit: 10000,
        total_gross_debit: 10000,
        total_gross_credit: 10000,
        difference: 0,
        is_balanced: true,
        accounts: [
          {
            account: {
              id: 'acc-1',
              account_code: '1010',
              account_name: 'Cash in Hand',
              account_type: 'ASSET',
            },
            gross_debit: 10000,
            gross_credit: 0,
            debit_balance: 10000,
            credit_balance: 0,
          },
        ],
      };

      const pdf = generateTrialBalancePdf(mockData);
      expect(pdf).toBeDefined();
      expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    });

    it('generates a valid Profit & Loss PDF document', () => {
      const mockData: ProfitLossReportResponse = {
        from_date: '2026-04-01',
        to_date: '2026-10-31',
        total_income: 50000,
        total_expenses: 20000,
        net_result: 30000,
        net_profit_loss: 30000,
        result_type: 'SURPLUS',
        income: {
          items: [
            {
              account: {
                id: 'acc-inc',
                account_code: '4010',
                account_name: 'Donation Receipts',
                account_type: 'INCOME',
              },
              gross_debit: 0,
              gross_credit: 50000,
              amount: 50000,
            },
          ],
          total: 50000,
        },
        expenses: {
          items: [
            {
              account: {
                id: 'acc-exp',
                account_code: '5010',
                account_name: 'Relief Food Drive',
                account_type: 'EXPENSE',
              },
              gross_debit: 20000,
              gross_credit: 0,
              amount: 20000,
            },
          ],
          total: 20000,
        },
      };

      const pdf = generateProfitLossPdf(mockData);
      expect(pdf).toBeDefined();
      expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    });

    it('generates a valid Balance Sheet PDF document', () => {
      const mockData: BalanceSheetReportResponse = {
        as_of_date: '2026-10-31',
        total_assets: 100000,
        total_liabilities: 20000,
        total_equity: 80000,
        total_liabilities_and_equity: 100000,
        difference: 0,
        is_balanced: true,
        assets: {
          items: [
            {
              account: {
                id: 'acc-ast',
                account_code: '1020',
                account_name: 'HDFC Main Account',
                account_type: 'ASSET',
              },
              gross_debit: 100000,
              gross_credit: 0,
              amount: 100000,
            },
          ],
          total: 100000,
        },
        liabilities: {
          items: [],
          total: 20000,
        },
        equity: {
          items: [],
          total_equity_accounts: 50000,
          current_surplus_deficit: 30000,
          total: 80000,
        },
      };

      const pdf = generateBalanceSheetPdf(mockData);
      expect(pdf).toBeDefined();
      expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    });
  });
});
