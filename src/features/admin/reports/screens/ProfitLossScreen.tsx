import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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
import { getDefaultDatePreset } from '../utils/reportDates';
import { generateProfitLossPdf } from '../utils/reportPdfDocument';
import { formatINR } from '../../../../core/utils/currency';
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

  const { data, isLoading, isError, error, refetch, isRefetching } = useProfitLoss(
    startDate,
    endDate,
  );

  const handleSelectPreset = (preset: DateRangePreset) => {
    setSelectedPreset(preset.key);
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
  };

  const isSurplus = data?.result_type === 'SURPLUS';

  const renderAccountRow = (item: ProfitLossAccountItem, isEven: boolean) => (
    <View key={item.account.id} style={[styles.itemRow, isEven && styles.itemRowAlt]}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.account.account_name}</Text>
        {item.account.account_code ? (
          <Text style={styles.itemCode}>{item.account.account_code}</Text>
        ) : null}
      </View>
      <Text style={styles.itemAmount}>{formatINR(item.amount)}</Text>
    </View>
  );

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

      {/* Top Summary Cards */}
      <View style={styles.kpiGrid}>
        <ReportKpiCard
          label="Total Income"
          amount={data?.total_income ?? 0}
          badgeText="Inflow"
          badgeVariant="success"
          style={styles.kpiHalf}
        />
        <ReportKpiCard
          label="Total Expenses"
          amount={data?.total_expenses ?? 0}
          badgeText="Outflow"
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
        <View>
          <Text
            style={[
              styles.netResultLabel,
              isSurplus ? styles.netSurplusText : styles.netDeficitText,
            ]}
          >
            NET {data?.result_type ?? 'SURPLUS'} FOR THE PERIOD
          </Text>
          <Text
            style={[
              styles.netResultAmount,
              isSurplus ? styles.netSurplusText : styles.netDeficitText,
            ]}
          >
            {data ? formatINR(Math.abs(data.net_result)) : '₹0'}
          </Text>
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
            {isSurplus ? '✓ Surplus' : '⚠ Deficit'}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <AppLoader message="Calculating Profit & Loss statement..." />
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
              <Text style={styles.sectionTitle}>1. INCOME & REVENUES</Text>
              <Text style={styles.sectionTotal}>{formatINR(data?.total_income ?? 0)}</Text>
            </View>

            {data?.income.items && data.income.items.length > 0 ? (
              data.income.items.map((item, idx) => renderAccountRow(item, idx % 2 === 1))
            ) : (
              <Text style={styles.emptyText}>No income accounts recorded in this period.</Text>
            )}
          </View>

          {/* SECTION 2: EXPENSES */}
          <View style={styles.sectionCard}>
            <View style={[styles.sectionHeader, styles.expenseHeader]}>
              <Text style={styles.sectionTitle}>2. EXPENDITURES & OUTFLOWS</Text>
              <Text style={styles.sectionTotal}>{formatINR(data?.total_expenses ?? 0)}</Text>
            </View>

            {data?.expenses.items && data.expenses.items.length > 0 ? (
              data.expenses.items.map((item, idx) => renderAccountRow(item, idx % 2 === 1))
            ) : (
              <Text style={styles.emptyText}>No expense accounts recorded in this period.</Text>
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
  netResultLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  netResultAmount: {
    fontSize: 20,
    fontWeight: '800',
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
    paddingVertical: 5,
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
  sectionTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2C59',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
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
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemCode: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2C59',
  },
  emptyText: {
    ...Typography.caption,
    color: '#94A3B8',
    padding: Spacing.md,
    textAlign: 'center',
  },
});
