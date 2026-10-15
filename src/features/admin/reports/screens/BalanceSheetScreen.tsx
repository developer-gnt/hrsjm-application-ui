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
import { useBalanceSheet } from '../hooks/useReports';
import { getDefaultDatePreset } from '../utils/reportDates';
import { generateBalanceSheetPdf } from '../utils/reportPdfDocument';
import { formatINR } from '../../../../core/utils/currency';
import type { BalanceSheetAccountItem, DatePresetKey, DateRangePreset } from '../types/reports.types';

interface BalanceSheetScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
}

export const BalanceSheetScreen: React.FC<BalanceSheetScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const defaultPreset = getDefaultDatePreset();
  const [selectedPreset, setSelectedPreset] = useState<DatePresetKey>(defaultPreset.key);
  const [asOfDate, setAsOfDate] = useState(defaultPreset.asOfDate);

  const { data, isLoading, isError, error, refetch, isRefetching } = useBalanceSheet(asOfDate);

  const handleSelectPreset = (preset: DateRangePreset) => {
    setSelectedPreset(preset.key);
    setAsOfDate(preset.asOfDate);
  };

  const renderAccountRow = (item: BalanceSheetAccountItem, isEven: boolean) => (
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
        title="Balance Sheet Statement"
        showBack={Boolean(onBack)}
        onBack={onBack}
        onNavigate={onNavigate}
      />

      <ReportDateSelector
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        subText={`Position as of ${asOfDate}`}
      />

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <ReportKpiCard
          label="Total Assets"
          amount={data?.total_assets ?? 0}
          badgeText="Assets"
          badgeVariant="info"
          style={styles.kpiHalf}
        />
        <ReportKpiCard
          label="Liabilities & Equity"
          amount={data?.total_liabilities_and_equity ?? 0}
          badgeText="Liab + Eq"
          badgeVariant="warning"
          style={styles.kpiHalf}
        />
      </View>

      {/* Balancing Status Banner */}
      <View
        style={[
          styles.balanceBanner,
          data?.is_balanced ? styles.balanceBannerOk : styles.balanceBannerWarn,
        ]}
      >
        <Text
          style={[
            styles.balanceBannerText,
            data?.is_balanced ? styles.balanceTextOk : styles.balanceTextWarn,
          ]}
        >
          {data?.is_balanced
            ? '✓ BALANCED — Total Assets equal Total Liabilities & Fund Equity.'
            : `⚠ OUT OF BALANCE — Net Difference: ${formatINR(Math.abs(data?.difference ?? 0))}`}
        </Text>
      </View>

      {isLoading ? (
        <AppLoader message="Compiling Balance Sheet statement..." />
      ) : isError ? (
        <AppErrorState
          title="Failed to load Balance Sheet"
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
          {/* SECTION 1: ASSETS */}
          <View style={styles.sectionCard}>
            <View style={[styles.sectionHeader, styles.assetHeader]}>
              <Text style={styles.sectionTitle}>1. ASSETS</Text>
              <Text style={styles.sectionTotal}>{formatINR(data?.total_assets ?? 0)}</Text>
            </View>

            {data?.assets.items && data.assets.items.length > 0 ? (
              data.assets.items.map((item, idx) => renderAccountRow(item, idx % 2 === 1))
            ) : (
              <Text style={styles.emptyText}>No asset accounts found.</Text>
            )}
          </View>

          {/* SECTION 2: LIABILITIES */}
          <View style={styles.sectionCard}>
            <View style={[styles.sectionHeader, styles.liabHeader]}>
              <Text style={styles.sectionTitle}>2. LIABILITIES</Text>
              <Text style={styles.sectionTotal}>{formatINR(data?.total_liabilities ?? 0)}</Text>
            </View>

            {data?.liabilities.items && data.liabilities.items.length > 0 ? (
              data.liabilities.items.map((item, idx) => renderAccountRow(item, idx % 2 === 1))
            ) : (
              <Text style={styles.emptyText}>No liability accounts recorded.</Text>
            )}
          </View>

          {/* SECTION 3: EQUITY */}
          <View style={styles.sectionCard}>
            <View style={[styles.sectionHeader, styles.equityHeader]}>
              <Text style={styles.sectionTitle}>3. FUND & CAPITAL EQUITY</Text>
              <Text style={styles.sectionTotal}>{formatINR(data?.total_equity ?? 0)}</Text>
            </View>

            {data?.equity.items && data.equity.items.length > 0 ? (
              data.equity.items.map((item, idx) => renderAccountRow(item, idx % 2 === 1))
            ) : null}

            {/* Current Period Surplus Row */}
            <View style={[styles.itemRow, styles.surplusRow]}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, styles.surplusName]}>
                  Current Period Net Surplus / (Deficit)
                </Text>
                <Text style={styles.itemCode}>Calculated P&L</Text>
              </View>
              <Text style={[styles.itemAmount, styles.surplusAmount]}>
                {formatINR(data?.equity.current_surplus_deficit ?? 0)}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* PDF Download & Share Actions */}
      {data ? (
        <ReportExportActions
          fileName={`HRSJM_Balance_Sheet_${asOfDate}.pdf`}
          reportTitle={`HRSJM Balance Sheet (${asOfDate})`}
          generatePdf={() => generateBalanceSheetPdf(data)}
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
  balanceBanner: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  balanceBannerOk: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  balanceBannerWarn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  balanceBannerText: {
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  balanceTextOk: {
    color: '#166534',
  },
  balanceTextWarn: {
    color: '#991B1B',
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
  assetHeader: {
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  liabHeader: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  equityHeader: {
    backgroundColor: '#F5F3FF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9FE',
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
  surplusRow: {
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  surplusName: {
    color: '#166534',
    fontWeight: '700',
  },
  surplusAmount: {
    color: '#166534',
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
