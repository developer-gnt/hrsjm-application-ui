import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Shadows, Spacing, Typography } from '../../../../core/theme';
import { AppEmptyState, AppErrorState, AppLoader } from '../../../../core/components';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { ReportDateSelector } from '../components/ReportDateSelector';
import { ReportKpiCard } from '../components/ReportKpiCard';
import { ReportExportActions } from '../components/ReportExportActions';
import { useProfitLoss } from '../hooks/useReports';
import { getDefaultDatePreset, getDatePresets } from '../utils/reportDates';
import { generateProfitLossPdf } from '../utils/reportPdfDocument';
import { formatINR } from '../../../../core/utils/currency';
import { AppRoutes } from '../../../../core/constants/routes';
import type { DatePresetKey, DateRangePreset, ProfitLossAccountItem } from '../types/reports.types';

interface ProfitLossScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
}

export const ProfitLossScreen: React.FC<ProfitLossScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const defaultPreset = getDefaultDatePreset();
  const [selectedPreset, setSelectedPreset] = useState<DatePresetKey>(defaultPreset.key);
  const [startDate, setStartDate] = useState(defaultPreset.startDate);
  const [endDate, setEndDate] = useState(defaultPreset.endDate);
  const [includeZero, setIncludeZero] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom date picker modal state
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);
  const [customError, setCustomError] = useState<string | null>(null);

  // Selected account for drilldown detail modal
  const [selectedAccount, setSelectedAccount] = useState<ProfitLossAccountItem | null>(null);

  const { data, isLoading, isError, error, refetch, isRefetching } = useProfitLoss(
    startDate,
    endDate,
    includeZero,
  );

  const handleSelectPreset = (preset: DateRangePreset) => {
    setSelectedPreset(preset.key);
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
  };

  const handleApplyCustomDates = () => {
    const s = customStart.trim();
    const e = customEnd.trim();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(s) || !dateRegex.test(e)) {
      setCustomError('Please enter dates in YYYY-MM-DD format');
      return;
    }
    if (new Date(s).getTime() > new Date(e).getTime()) {
      setCustomError('From Date cannot be after To Date');
      return;
    }
    setCustomError(null);
    setStartDate(s);
    setEndDate(e);
    setCustomModalVisible(false);
  };

  const isSurplus = (data?.result_type ?? 'SURPLUS') === 'SURPLUS';
  const totalIncome = data?.total_income ?? 0;
  const totalExpenses = data?.total_expenses ?? 0;
  const netResult = data?.net_result ?? 0;

  // Margin percentage
  const marginPercent = useMemo(() => {
    if (!totalIncome || totalIncome <= 0) return null;
    return ((netResult / totalIncome) * 100).toFixed(1);
  }, [totalIncome, netResult]);

  // Filter accounts by search query
  const filteredIncome = useMemo(() => {
    const items = data?.income?.items || [];
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(
      item =>
        item.account.account_name.toLowerCase().includes(q) ||
        (item.account.account_code && item.account.account_code.toLowerCase().includes(q)),
    );
  }, [data?.income?.items, searchQuery]);

  const filteredExpenses = useMemo(() => {
    const items = data?.expenses?.items || [];
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(
      item =>
        item.account.account_name.toLowerCase().includes(q) ||
        (item.account.account_code && item.account.account_code.toLowerCase().includes(q)),
    );
  }, [data?.expenses?.items, searchQuery]);

  const handleAccountPress = (item: ProfitLossAccountItem) => {
    setSelectedAccount(item);
  };

  const handleGoToLedger = () => {
    setSelectedAccount(null);
    if (onNavigate) {
      onNavigate(AppRoutes.GENERAL_LEDGER);
    }
  };

  const renderAccountRow = (
    item: ProfitLossAccountItem,
    isEven: boolean,
    sectionTotal: number,
  ) => {
    const percent = sectionTotal > 0 ? ((item.amount / sectionTotal) * 100).toFixed(1) : null;
    const hasGrossBreakdown = item.gross_debit > 0 && item.gross_credit > 0;

    return (
      <TouchableOpacity
        key={item.account.id}
        style={[styles.itemRow, isEven && styles.itemRowAlt]}
        onPress={() => handleAccountPress(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Account ${item.account.account_name}, amount ${formatINR(item.amount)}`}
      >
        <View style={styles.itemInfo}>
          <View style={styles.itemHeaderLine}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.account.account_name}
            </Text>
            {item.account.account_code ? (
              <View style={styles.codeBadge}>
                <Text style={styles.itemCode}>{item.account.account_code}</Text>
              </View>
            ) : null}
          </View>
          {hasGrossBreakdown ? (
            <Text style={styles.grossMeta}>
              Cr: {formatINR(item.gross_credit)} · Dr: {formatINR(item.gross_debit)}
            </Text>
          ) : percent ? (
            <Text style={styles.percentMeta}>{percent}% of section total</Text>
          ) : null}
        </View>
        <View style={styles.amountCol}>
          <Text style={styles.itemAmount}>{formatINR(item.amount)}</Text>
          <Text style={styles.chevronIcon}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AdminHeader
        title="Profit & Loss Statement"
        showBack={Boolean(onBack)}
        onBack={onBack}
        onNavigate={onNavigate}
      />

      <ReportDateSelector
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        subText={`Period: ${startDate} to ${endDate}`}
      />

      {/* Dynamic Controls Bar: Custom Date & Zero-Balance Toggle & Search */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          style={styles.customDateBtn}
          onPress={() => {
            setCustomStart(startDate);
            setCustomEnd(endDate);
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

      {/* Search Input Filter */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search income or expense accounts..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Top Summary KPI Cards */}
      <View style={styles.kpiGrid}>
        <ReportKpiCard
          label="Total Income"
          amount={totalIncome}
          badgeText={`${data?.income?.items?.length || 0} Inflows`}
          badgeVariant="success"
          style={styles.kpiHalf}
        />
        <ReportKpiCard
          label="Total Expenses"
          amount={totalExpenses}
          badgeText={`${data?.expenses?.items?.length || 0} Outflows`}
          badgeVariant="danger"
          style={styles.kpiHalf}
        />
      </View>

      {/* Net Result Highlight Banner */}
      <View
        style={[
          styles.netResultCard,
          isSurplus ? styles.netSurplusCard : styles.netDeficitCard,
        ]}
      >
        <View style={styles.netResultLeft}>
          <Text
            style={[
              styles.netResultLabel,
              isSurplus ? styles.netSurplusText : styles.netDeficitText,
            ]}
          >
            NET {data?.result_type ?? (netResult >= 0 ? 'SURPLUS' : 'DEFICIT')} FOR THE PERIOD
          </Text>
          <Text
            style={[
              styles.netResultAmount,
              isSurplus ? styles.netSurplusText : styles.netDeficitText,
            ]}
          >
            {formatINR(Math.abs(netResult))}
          </Text>
          {marginPercent ? (
            <Text style={[styles.marginSubtitle, isSurplus ? styles.netSurplusText : styles.netDeficitText]}>
              {isSurplus ? `+${marginPercent}%` : `${marginPercent}%`} Net Surplus Margin
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.netBadge,
            isSurplus ? styles.netSurplusBadge : styles.netDeficitBadge,
          ]}
        >
          <Text
            style={[
              styles.netBadgeText,
              isSurplus ? styles.netSurplusText : styles.netDeficitText,
            ]}
          >
            {isSurplus ? '✓ Operating Surplus' : '⚠ Operating Deficit'}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <AppLoader message="Calculating dynamic Profit & Loss statement..." />
      ) : isError ? (
        <AppErrorState
          title="Failed to load Profit & Loss"
          message={error instanceof Error ? error.message : 'Please check your connection.'}
          onRetry={refetch}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION 1: INCOME */}
          <View style={styles.sectionCard}>
            <View style={[styles.sectionHeader, styles.incomeHeader]}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={styles.sectionTitle}>1. REVENUES & INFLOWS</Text>
                <Text style={styles.sectionCountBadge}>{filteredIncome.length} streams</Text>
              </View>
              <Text style={[styles.sectionTotal, styles.incomeTotalText]}>
                {formatINR(totalIncome)}
              </Text>
            </View>

            {filteredIncome.length > 0 ? (
              filteredIncome.map((item, idx) =>
                renderAccountRow(item, idx % 2 === 1, totalIncome),
              )
            ) : (
              <View style={styles.emptySectionWrap}>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? `No income accounts match "${searchQuery}".`
                    : 'No income activity recorded in this period.'}
                </Text>
                {!includeZero && !searchQuery ? (
                  <TouchableOpacity
                    style={styles.enableZeroBtn}
                    onPress={() => setIncludeZero(true)}
                  >
                    <Text style={styles.enableZeroBtnText}>Show Inactive Accounts</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </View>

          {/* SECTION 2: EXPENSES */}
          <View style={styles.sectionCard}>
            <View style={[styles.sectionHeader, styles.expenseHeader]}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={styles.sectionTitle}>2. EXPENDITURES & OUTFLOWS</Text>
                <Text style={styles.sectionCountBadge}>{filteredExpenses.length} streams</Text>
              </View>
              <Text style={[styles.sectionTotal, styles.expenseTotalText]}>
                {formatINR(totalExpenses)}
              </Text>
            </View>

            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((item, idx) =>
                renderAccountRow(item, idx % 2 === 1, totalExpenses),
              )
            ) : (
              <View style={styles.emptySectionWrap}>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? `No expense accounts match "${searchQuery}".`
                    : 'No expense activity recorded in this period.'}
                </Text>
                {!includeZero && !searchQuery ? (
                  <TouchableOpacity
                    style={styles.enableZeroBtn}
                    onPress={() => setIncludeZero(true)}
                  >
                    <Text style={styles.enableZeroBtnText}>Show Inactive Accounts</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* PDF Download & Share Actions */}
      {data ? (
        <ReportExportActions
          fileName={`HRSJM_Profit_Loss_${startDate}_to_${endDate}.pdf`}
          reportTitle={`HRSJM Profit & Loss Statement (${startDate} to ${endDate})`}
          generatePdf={() => generateProfitLossPdf(data)}
        />
      ) : null}

      {/* Custom Date Range Modal */}
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
                <Text style={styles.modalTitle}>Custom Period</Text>
                <Text style={styles.modalSubtitle}>
                  Specify start and end dates to compute dynamic P&L
                </Text>

                {customError ? (
                  <View style={styles.modalErrorBox}>
                    <Text style={styles.modalErrorText}>{customError}</Text>
                  </View>
                ) : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>From Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={customStart}
                    onChangeText={setCustomStart}
                    placeholder="2026-01-01"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>To Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={customEnd}
                    onChangeText={setCustomEnd}
                    placeholder="2026-12-31"
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
                    onPress={handleApplyCustomDates}
                  >
                    <Text style={styles.modalApplyBtnText}>Apply Filter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Account Drill-down Breakdown Modal */}
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
                  <View>
                    <Text style={styles.modalTitle}>
                      {selectedAccount?.account.account_name}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      Code: {selectedAccount?.account.account_code || 'N/A'} · Type:{' '}
                      {selectedAccount?.account.account_type}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedAccount(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.drillMetrics}>
                  <View style={styles.drillMetricBox}>
                    <Text style={styles.drillMetricLabel}>Gross Credits</Text>
                    <Text style={styles.drillMetricValue}>
                      {formatINR(selectedAccount?.gross_credit ?? 0)}
                    </Text>
                  </View>
                  <View style={styles.drillMetricBox}>
                    <Text style={styles.drillMetricLabel}>Gross Debits</Text>
                    <Text style={styles.drillMetricValue}>
                      {formatINR(selectedAccount?.gross_debit ?? 0)}
                    </Text>
                  </View>
                  <View style={[styles.drillMetricBox, styles.drillNetBox]}>
                    <Text style={styles.drillNetLabel}>Net Amount</Text>
                    <Text style={styles.drillNetValue}>
                      {formatINR(selectedAccount?.amount ?? 0)}
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
  searchWrap: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12.5,
    color: '#0F172A',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 10,
    top: 8,
    padding: 2,
  },
  clearSearchText: {
    fontSize: 12,
    color: '#94A3B8',
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
  netResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  netSurplusCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  netDeficitCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  netResultLeft: {
    flex: 1,
  },
  netResultLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  netResultAmount: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  marginSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  netSurplusText: {
    color: '#166534',
  },
  netDeficitText: {
    color: '#991B1B',
  },
  netBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  netSurplusBadge: {
    backgroundColor: '#DCFCE7',
  },
  netDeficitBadge: {
    backgroundColor: '#FEE2E2',
  },
  netBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
    gap: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incomeHeader: {
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
  },
  expenseHeader: {
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2C59',
    letterSpacing: 0.5,
  },
  sectionCountBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTotal: {
    fontSize: 14,
    fontWeight: '800',
  },
  incomeTotalText: {
    color: '#166534',
  },
  expenseTotalText: {
    color: '#991B1B',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flexShrink: 1,
  },
  codeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemCode: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  grossMeta: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  percentMeta: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  amountCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2C59',
  },
  chevronIcon: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '400',
  },
  emptySectionWrap: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.caption,
    color: '#94A3B8',
    textAlign: 'center',
  },
  enableZeroBtn: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
  },
  enableZeroBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#06294D',
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
    marginVertical: 16,
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
  drillNetBox: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  drillNetLabel: {
    fontSize: 10,
    color: '#1D4ED8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  drillNetValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1D4ED8',
    marginTop: 3,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
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
