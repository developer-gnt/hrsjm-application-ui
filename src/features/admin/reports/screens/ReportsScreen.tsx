import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Shadows, Spacing, Typography } from '../../../../core/theme';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppRoutes } from '../../../../core/constants/routes';
import { ReportDateSelector } from '../components/ReportDateSelector';
import { useBalanceSheetSummary, useProfitLossSummary, useTrialBalanceSummary } from '../hooks/useReports';
import { getDefaultDatePreset } from '../utils/reportDates';
import { formatINR } from '../../../../core/utils/currency';
import type { DatePresetKey, DateRangePreset } from '../types/reports.types';

interface ReportsScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
  onOpenTrialBalance?: () => void;
  onOpenProfitLoss?: () => void;
  onOpenBalanceSheet?: () => void;
  onOpenLedger?: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  onBack,
  onNavigate,
  onOpenTrialBalance,
  onOpenProfitLoss,
  onOpenBalanceSheet,
  onOpenLedger,
}) => {
  const defaultPreset = getDefaultDatePreset();
  const [selectedPreset, setSelectedPreset] = useState<DatePresetKey>(defaultPreset.key);
  const [startDate, setStartDate] = useState(defaultPreset.startDate);
  const [endDate, setEndDate] = useState(defaultPreset.endDate);
  const [asOfDate, setAsOfDate] = useState(defaultPreset.asOfDate);

  const tbSummary = useTrialBalanceSummary(asOfDate);
  const plSummary = useProfitLossSummary(startDate, endDate);
  const bsSummary = useBalanceSheetSummary(asOfDate);

  const handleSelectPreset = (preset: DateRangePreset) => {
    setSelectedPreset(preset.key);
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
    setAsOfDate(preset.asOfDate);
  };

  const handleRefresh = async () => {
    await Promise.all([
      tbSummary.refetch(),
      plSummary.refetch(),
      bsSummary.refetch(),
    ]);
  };

  const isRefreshing =
    tbSummary.isRefetching || plSummary.isRefetching || bsSummary.isRefetching;

  const handleGoTrialBalance = () => {
    if (onOpenTrialBalance) onOpenTrialBalance();
    else if (onNavigate) onNavigate(AppRoutes.TRIAL_BALANCE);
  };

  const handleGoProfitLoss = () => {
    if (onOpenProfitLoss) onOpenProfitLoss();
    else if (onNavigate) onNavigate(AppRoutes.PROFIT_LOSS);
  };

  const handleGoBalanceSheet = () => {
    if (onOpenBalanceSheet) onOpenBalanceSheet();
    else if (onNavigate) onNavigate(AppRoutes.BALANCE_SHEET);
  };

  const handleGoLedger = () => {
    if (onOpenLedger) onOpenLedger();
    else if (onNavigate) onNavigate(AppRoutes.GENERAL_LEDGER);
  };

  const isSurplus = plSummary.data?.result_type === 'SURPLUS';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AdminHeader
        title="Financial Reports"
        showBack={Boolean(onBack)}
        onBack={onBack}
        onNavigate={onNavigate}
      />

      <ReportDateSelector
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        subText={`Reporting Period: ${startDate} to ${endDate}`}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* CARD 1: TRIAL BALANCE */}
        <TouchableOpacity
          style={styles.reportCard}
          onPress={handleGoTrialBalance}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconTitleRow}>
              <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.cardIcon}>⚖️</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Trial Balance</Text>
                <Text style={styles.cardSubtitle}>Debit & Credit Ledger Check</Text>
              </View>
            </View>
            <View
              style={[
                styles.badge,
                tbSummary.data?.is_balanced ? styles.badgeSuccess : styles.badgeDanger,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  tbSummary.data?.is_balanced ? styles.badgeTextSuccess : styles.badgeTextDanger,
                ]}
              >
                {tbSummary.data?.is_balanced ? 'Balanced' : 'Out of Balance'}
              </Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>TOTAL DEBIT</Text>
              <Text style={styles.metricValue}>
                {tbSummary.data ? formatINR(tbSummary.data.total_debit) : '—'}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>TOTAL CREDIT</Text>
              <Text style={styles.metricValue}>
                {tbSummary.data ? formatINR(tbSummary.data.total_credit) : '—'}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>View Full Statement & PDF Export</Text>
            <Text style={styles.cardChevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* CARD 2: PROFIT & LOSS */}
        <TouchableOpacity
          style={styles.reportCard}
          onPress={handleGoProfitLoss}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconTitleRow}>
              <View style={[styles.iconWrap, { backgroundColor: '#F0FDF4' }]}>
                <Text style={styles.cardIcon}>📈</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Profit & Loss Statement</Text>
                <Text style={styles.cardSubtitle}>Income vs Expenditures</Text>
              </View>
            </View>
            <View
              style={[
                styles.badge,
                isSurplus ? styles.badgeSuccess : styles.badgeDanger,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isSurplus ? styles.badgeTextSuccess : styles.badgeTextDanger,
                ]}
              >
                {plSummary.data ? (isSurplus ? 'Surplus' : 'Deficit') : '—'}
              </Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>INCOME</Text>
              <Text style={[styles.metricValue, { color: '#166534' }]}>
                {plSummary.data ? formatINR(plSummary.data.total_income) : '—'}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>EXPENSES</Text>
              <Text style={[styles.metricValue, { color: '#991B1B' }]}>
                {plSummary.data ? formatINR(plSummary.data.total_expenses) : '—'}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>NET {plSummary.data?.result_type ?? 'RESULT'}</Text>
              <Text style={[styles.metricValue, isSurplus ? { color: '#166534' } : { color: '#991B1B' }]}>
                {plSummary.data ? formatINR(Math.abs(plSummary.data.net_result)) : '—'}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>View Income & Expense Breakdown</Text>
            <Text style={styles.cardChevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* CARD 3: BALANCE SHEET */}
        <TouchableOpacity
          style={styles.reportCard}
          onPress={handleGoBalanceSheet}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconTitleRow}>
              <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.cardIcon}>🏛️</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Balance Sheet Statement</Text>
                <Text style={styles.cardSubtitle}>Assets, Liabilities & Fund Equity</Text>
              </View>
            </View>
            <View
              style={[
                styles.badge,
                bsSummary.data?.is_balanced ? styles.badgeSuccess : styles.badgeDanger,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  bsSummary.data?.is_balanced ? styles.badgeTextSuccess : styles.badgeTextDanger,
                ]}
              >
                {bsSummary.data?.is_balanced ? 'Balanced' : 'Check Balance'}
              </Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>TOTAL ASSETS</Text>
              <Text style={styles.metricValue}>
                {bsSummary.data ? formatINR(bsSummary.data.total_assets) : '—'}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>LIABILITIES</Text>
              <Text style={styles.metricValue}>
                {bsSummary.data ? formatINR(bsSummary.data.total_liabilities) : '—'}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>EQUITY</Text>
              <Text style={styles.metricValue}>
                {bsSummary.data ? formatINR(bsSummary.data.total_equity) : '—'}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>View Balance Sheet Details & Export</Text>
            <Text style={styles.cardChevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* QUICK LINK TO GENERAL LEDGER */}
        <TouchableOpacity
          style={styles.ledgerLinkCard}
          onPress={handleGoLedger}
          activeOpacity={0.8}
        >
          <View style={styles.iconTitleRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#EDE9FE' }]}>
              <Text style={styles.cardIcon}>📚</Text>
            </View>
            <View>
              <Text style={styles.ledgerLinkTitle}>General Ledger & Transactions</Text>
              <Text style={styles.cardSubtitle}>Inspect running balances and entry lines</Text>
            </View>
          </View>
          <Text style={styles.cardChevron}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
    gap: 14,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F2C59',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: '#166534',
  },
  badgeTextDanger: {
    color: '#991B1B',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F2C59',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: AdminColors.primaryDark,
  },
  cardChevron: {
    fontSize: 18,
    color: AdminColors.primaryDark,
    fontWeight: '700',
  },
  ledgerLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    ...Shadows.card,
  },
  ledgerLinkTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F2C59',
  },
});
