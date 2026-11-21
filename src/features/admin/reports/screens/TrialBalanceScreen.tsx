import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Shadows, Spacing, Typography } from '../../../../core/theme';
import { AppEmptyState, AppErrorState, AppLoader, AppSearchBar } from '../../../../core/components';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { ReportDateSelector } from '../components/ReportDateSelector';
import { ReportKpiCard } from '../components/ReportKpiCard';
import { ReportExportActions } from '../components/ReportExportActions';
import { useTrialBalance } from '../hooks/useReports';
import { getDefaultDatePreset } from '../utils/reportDates';
import { generateTrialBalancePdf } from '../utils/reportPdfDocument';
import { formatINR } from '../../../../core/utils/currency';
import { AppRoutes } from '../../../../core/constants/routes';
import type { DatePresetKey, DateRangePreset, TrialBalanceAccountItem } from '../types/reports.types';

type AccountTypeFilter = 'ALL' | 'ASSET' | 'LIABILITY' | 'FUND_EQUITY' | 'INCOME' | 'EXPENSE';

const ACCOUNT_TYPE_LABELS: Record<AccountTypeFilter, string> = {
  ALL: 'All Types',
  ASSET: 'Assets',
  LIABILITY: 'Liabilities',
  FUND_EQUITY: 'Equity',
  INCOME: 'Income',
  EXPENSE: 'Expenses',
};

interface TrialBalanceScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
}

export const TrialBalanceScreen: React.FC<TrialBalanceScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const defaultPreset = getDefaultDatePreset();
  const [selectedPreset, setSelectedPreset] = useState<DatePresetKey>(defaultPreset.key);
  const [asOfDate, setAsOfDate] = useState(defaultPreset.asOfDate);
  const [search, setSearch] = useState('');
  const [includeZero, setIncludeZero] = useState(false);
  const [selectedType, setSelectedType] = useState<AccountTypeFilter>('ALL');

  // Custom date picker modal state
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customDate, setCustomDate] = useState(asOfDate);
  const [customError, setCustomError] = useState<string | null>(null);

  // Selected account for drilldown modal
  const [selectedAccount, setSelectedAccount] = useState<TrialBalanceAccountItem | null>(null);

  const { data, isLoading, isError, error, refetch, isRefetching } = useTrialBalance(
    asOfDate,
    includeZero,
  );

  const handleSelectPreset = (preset: DateRangePreset) => {
    setSelectedPreset(preset.key);
    setAsOfDate(preset.asOfDate);
  };

  const handleApplyCustomDate = () => {
    const d = customDate.trim();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(d)) {
      setCustomError('Please enter date in YYYY-MM-DD format');
      return;
    }
    setCustomError(null);
    setAsOfDate(d);
    setCustomModalVisible(false);
  };

  const handleAccountPress = (item: TrialBalanceAccountItem) => {
    setSelectedAccount(item);
  };

  const handleGoToLedger = () => {
    setSelectedAccount(null);
    if (onNavigate) {
      onNavigate(AppRoutes.GENERAL_LEDGER);
    }
  };

  const filteredAccounts = useMemo(() => {
    if (!data?.accounts) return [];
    let list = data.accounts;

    // Filter by account type
    if (selectedType !== 'ALL') {
      list = list.filter(item => item.account.account_type === selectedType);
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        item =>
          item.account.account_name.toLowerCase().includes(q) ||
          (item.account.account_code && item.account.account_code.toLowerCase().includes(q)) ||
          item.account.account_type.toLowerCase().includes(q),
      );
    }

    return list;
  }, [data?.accounts, selectedType, search]);

  const renderAccountRow = ({ item, index }: { item: TrialBalanceAccountItem; index: number }) => {
    const isEven = index % 2 === 1;
    const hasNetBalance = item.debit_balance > 0 || item.credit_balance > 0;

    return (
      <TouchableOpacity
        key={item.account.id}
        style={[styles.row, isEven && styles.rowAlt]}
        onPress={() => handleAccountPress(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Account ${item.account.account_name}, debit ${formatINR(item.debit_balance)}, credit ${formatINR(item.credit_balance)}`}
      >
        <View style={styles.accountInfo}>
          <Text style={styles.accountName} numberOfLines={1}>
            {item.account.account_name}
          </Text>
          <View style={styles.codeBadgeRow}>
            {item.account.account_code ? (
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{item.account.account_code}</Text>
              </View>
            ) : null}
            <Text style={styles.typeText}>{item.account.account_type.replace(/_/g, ' ')}</Text>
          </View>
        </View>

        <View style={styles.amountsRow}>
          <Text
            style={[
              styles.debitAmount,
              item.debit_balance > 0 && styles.activeDebit,
            ]}
          >
            {item.debit_balance > 0 ? formatINR(item.debit_balance) : '—'}
          </Text>
          <Text
            style={[
              styles.creditAmount,
              item.credit_balance > 0 && styles.activeCredit,
            ]}
          >
            {item.credit_balance > 0 ? formatINR(item.credit_balance) : '—'}
          </Text>
          <Text style={styles.chevronIcon}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AdminHeader
        title="Trial Balance"
        showBack={Boolean(onBack)}
        onBack={onBack}
        onNavigate={onNavigate}
      />

      <ReportDateSelector
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        subText={`Showing ledger balance as of ${asOfDate}`}
      />

      {/* Dynamic Controls Bar */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          style={styles.customDateBtn}
          onPress={() => {
            setCustomDate(asOfDate);
            setCustomError(null);
            setCustomModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.customDateBtnText}>📅 Custom Date</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, includeZero && styles.toggleBtnActive]}
          onPress={() => setIncludeZero(prev => !prev)}
          activeOpacity={0.8}
        >
          <View style={[styles.toggleCheckbox, includeZero && styles.toggleCheckboxActive]}>
            {includeZero ? <Text style={styles.toggleCheckMark}>✓</Text> : null}
          </View>
          <Text style={[styles.toggleBtnText, includeZero && styles.toggleBtnTextActive]}>
            Show Zero Balances
          </Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <ReportKpiCard
          label="Total Debit"
          amount={data?.total_debit ?? 0}
          badgeText="Debit (Dr)"
          badgeVariant="success"
          style={styles.kpiHalf}
        />
        <ReportKpiCard
          label="Total Credit"
          amount={data?.total_credit ?? 0}
          badgeText="Credit (Cr)"
          badgeVariant="info"
          style={styles.kpiHalf}
        />
      </View>

      {/* Balance Indicator & Account Summary */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.balanceIndicator,
            data?.is_balanced ? styles.indicatorBalanced : styles.indicatorUnbalanced,
          ]}
        >
          <Text
            style={[
              styles.balanceIndicatorText,
              data?.is_balanced ? styles.indicatorTextBalanced : styles.indicatorTextUnbalanced,
            ]}
          >
            {data?.is_balanced
              ? '✓ BALANCED (Debits = Credits)'
              : `⚠ UNBALANCED (Diff: ${formatINR(Math.abs(data?.difference ?? 0))})`}
          </Text>
        </View>

        <Text style={styles.accountCountText}>
          {filteredAccounts.length} {filteredAccounts.length === 1 ? 'account' : 'accounts'}
        </Text>
      </View>

      {/* Account Type Filter Pills */}
      <View style={styles.typeFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeFilterScroll}
        >
          {(['ALL', 'ASSET', 'LIABILITY', 'FUND_EQUITY', 'INCOME', 'EXPENSE'] as AccountTypeFilter[]).map(
            typeKey => {
              const isSelected = selectedType === typeKey;
              return (
                <TouchableOpacity
                  key={typeKey}
                  style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                  onPress={() => setSelectedType(typeKey)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}>
                    {ACCOUNT_TYPE_LABELS[typeKey]}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <AppSearchBar
          placeholder="Search by account code, name or type..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Table Column Headers */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCol, styles.colAccount]}>ACCOUNT</Text>
        <Text style={[styles.headerCol, styles.colDebit]}>DEBIT (DR)</Text>
        <Text style={[styles.headerCol, styles.colCredit]}>CREDIT (CR)</Text>
      </View>

      {isLoading ? (
        <AppLoader message="Loading dynamic Trial Balance statement..." />
      ) : isError ? (
        <AppErrorState
          title="Failed to load Trial Balance"
          message={error instanceof Error ? error.message : 'Please check your connection.'}
          onRetry={refetch}
        />
      ) : filteredAccounts.length === 0 ? (
        <AppEmptyState
          title="No Accounts Found"
          message={
            search
              ? 'No accounts match your search filter.'
              : 'No transactions recorded for this period. Try switching presets or enabling zero balances.'
          }
        />
      ) : (
        <FlatList
          data={filteredAccounts}
          keyExtractor={item => item.account.id}
          renderItem={renderAccountRow}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* PDF Download & Share Actions */}
      {data ? (
        <ReportExportActions
          fileName={`HRSJM_Trial_Balance_${asOfDate}.pdf`}
          reportTitle={`HRSJM Trial Balance (${asOfDate})`}
          generatePdf={() => generateTrialBalancePdf(data)}
        />
      ) : null}

      {/* Custom As-Of Date Modal */}
      <Modal
        visible={customModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCustomModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Custom As-Of Date</Text>
                <Text style={styles.modalSubtitle}>
                  Specify a date to compute dynamic Trial Balance ledger positions
                </Text>

                {customError ? (
                  <View style={styles.modalErrorBox}>
                    <Text style={styles.modalErrorText}>{customError}</Text>
                  </View>
                ) : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>As of Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={customDate}
                    onChangeText={setCustomDate}
                    placeholder="2026-10-31"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setCustomModalVisible(false)}
                  >
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalApplyBtn}
                    onPress={handleApplyCustomDate}
                  >
                    <Text style={styles.modalApplyBtnText}>Apply Date</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Account Drilldown Modal */}
      <Modal
        visible={Boolean(selectedAccount)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAccount(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedAccount(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.drillHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.modalTitle}>
                      {selectedAccount?.account.account_name}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      Code: {selectedAccount?.account.account_code || 'N/A'} · Category:{' '}
                      {selectedAccount?.account.account_type.replace(/_/g, ' ')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedAccount(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.drillMetrics}>
                  <View style={styles.drillMetricBox}>
                    <Text style={styles.drillMetricLabel}>Gross Debits</Text>
                    <Text style={styles.drillMetricValue}>
                      {formatINR(selectedAccount?.gross_debit ?? 0)}
                    </Text>
                  </View>
                  <View style={styles.drillMetricBox}>
                    <Text style={styles.drillMetricLabel}>Gross Credits</Text>
                    <Text style={styles.drillMetricValue}>
                      {formatINR(selectedAccount?.gross_credit ?? 0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.drillNetRow}>
                  <View
                    style={[
                      styles.drillNetCard,
                      (selectedAccount?.debit_balance ?? 0) > 0 ? styles.netDebitCard : styles.netCreditCard,
                    ]}
                  >
                    <Text style={styles.drillNetLabel}>
                      {(selectedAccount?.debit_balance ?? 0) > 0
                        ? 'Closing Debit Balance (Dr)'
                        : (selectedAccount?.credit_balance ?? 0) > 0
                        ? 'Closing Credit Balance (Cr)'
                        : 'Settled Balance (₹0)'}
                    </Text>
                    <Text style={styles.drillNetValue}>
                      {formatINR(
                        (selectedAccount?.debit_balance ?? 0) > 0
                          ? selectedAccount?.debit_balance ?? 0
                          : selectedAccount?.credit_balance ?? 0,
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setSelectedAccount(null)}
                  >
                    <Text style={styles.modalCancelBtnText}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalApplyBtn}
                    onPress={handleGoToLedger}
                  >
                    <Text style={styles.modalApplyBtnText}>View General Ledger →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    gap: 8,
  },
  customDateBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#DCE4EC',
  },
  customDateBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06294D',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    gap: 6,
  },
  toggleBtnActive: {
    borderColor: '#06294D',
    backgroundColor: '#F0F5FA',
  },
  toggleCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCheckboxActive: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  toggleCheckMark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#06294D',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  kpiHalf: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  balanceIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  indicatorBalanced: {
    backgroundColor: '#DCFCE7',
  },
  indicatorUnbalanced: {
    backgroundColor: '#FEE2E2',
  },
  balanceIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
  },
  indicatorTextBalanced: {
    color: '#166534',
  },
  indicatorTextUnbalanced: {
    color: '#991B1B',
  },
  accountCountText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  typeFilterContainer: {
    marginBottom: Spacing.xs,
  },
  typeFilterScroll: {
    paddingHorizontal: Spacing.md,
    gap: 6,
    paddingVertical: 2,
  },
  typeChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeChipSelected: {
    backgroundColor: '#0F2C59',
    borderColor: '#0F2C59',
  },
  typeChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  headerCol: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  colAccount: {
    flex: 1.8,
  },
  colDebit: {
    flex: 1,
    textAlign: 'right',
  },
  colCredit: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 14,
  },
  listContent: {
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  rowAlt: {
    backgroundColor: '#F8FAFC',
  },
  accountInfo: {
    flex: 1.8,
    paddingRight: 6,
  },
  accountName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  codeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  codeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  codeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '700',
  },
  typeText: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  amountsRow: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  debitAmount: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  creditAmount: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  activeDebit: {
    color: '#166534',
    fontWeight: '700',
  },
  activeCredit: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  chevronIcon: {
    fontSize: 16,
    color: '#CBD5E1',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    ...Shadows.elevated,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2C59',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalErrorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
  },
  modalErrorText: {
    fontSize: 11.5,
    color: '#991B1B',
  },
  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  drillMetrics: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 10,
  },
  drillMetricBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  drillMetricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  drillMetricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 3,
  },
  drillNetRow: {
    marginBottom: 14,
  },
  drillNetCard: {
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  netDebitCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  netCreditCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  drillNetLabel: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  drillNetValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2C59',
    marginTop: 3,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  modalCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  modalApplyBtn: {
    backgroundColor: '#06294D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  modalApplyBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
