import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../core/theme';
import { AppEmptyState, AppErrorState, AppLoader, AppSearchBar } from '../../../../core/components';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { ReportDateSelector } from '../components/ReportDateSelector';
import { ReportKpiCard } from '../components/ReportKpiCard';
import { ReportExportActions } from '../components/ReportExportActions';
import { useTrialBalance } from '../hooks/useReports';
import { getDefaultDatePreset } from '../utils/reportDates';
import { generateTrialBalancePdf } from '../utils/reportPdfDocument';
import { formatINR } from '../../../../core/utils/currency';
import type { DatePresetKey, DateRangePreset, TrialBalanceAccountItem } from '../types/reports.types';

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

  const { data, isLoading, isError, error, refetch, isRefetching } = useTrialBalance(
    asOfDate,
    includeZero,
  );

  const handleSelectPreset = (preset: DateRangePreset) => {
    setSelectedPreset(preset.key);
    setAsOfDate(preset.asOfDate);
  };

  const filteredAccounts = useMemo(() => {
    if (!data?.accounts) return [];
    if (!search.trim()) return data.accounts;
    const q = search.toLowerCase();
    return data.accounts.filter(
      item =>
        item.account.account_name.toLowerCase().includes(q) ||
        (item.account.account_code && item.account.account_code.toLowerCase().includes(q)),
    );
  }, [data?.accounts, search]);

  const renderAccountRow = ({ item }: { item: TrialBalanceAccountItem }) => {
    return (
      <View style={styles.row}>
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
              item.debit_balance > 0 && styles.activeAmount,
            ]}
          >
            {item.debit_balance > 0 ? formatINR(item.debit_balance) : '—'}
          </Text>
          <Text
            style={[
              styles.creditAmount,
              item.credit_balance > 0 && styles.activeAmount,
            ]}
          >
            {item.credit_balance > 0 ? formatINR(item.credit_balance) : '—'}
          </Text>
        </View>
      </View>
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

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <ReportKpiCard
          label="Total Debit"
          amount={data?.total_debit ?? 0}
          style={styles.kpiHalf}
        />
        <ReportKpiCard
          label="Total Credit"
          amount={data?.total_credit ?? 0}
          style={styles.kpiHalf}
        />
      </View>

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

        <View style={styles.zeroToggle}>
          <Text style={styles.zeroToggleText}>Zero Balances</Text>
          <Switch
            value={includeZero}
            onValueChange={setIncludeZero}
            trackColor={{ false: '#CBD5E1', true: AdminColors.primaryLight }}
            thumbColor={includeZero ? AdminColors.primaryDark : '#F8FAFC'}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <AppSearchBar
          placeholder="Search by code or account..."
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
        <AppLoader message="Loading Trial Balance statement..." />
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
            search ? 'No accounts match your search filter.' : 'No transactions recorded for this period.'
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
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
  zeroToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zeroToggleText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
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
    paddingVertical: 7,
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
  activeAmount: {
    color: '#0F2C59',
    fontWeight: '700',
  },
});
