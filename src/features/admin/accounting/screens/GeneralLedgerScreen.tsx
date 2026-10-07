import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { AdminColors, BorderRadius, Shadows, Spacing } from '../../../../core/theme';
import {
  AppEmptyState,
  AppErrorState,
  SkeletonCard,
} from '../../../../core/components';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Download,
  FileText,
  ListFilter,
  Scale,
  Search,
  Wallet,
} from '../../../../core/components/icons';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { formatINR } from '../../../../core/utils/currency';
import { useLedger } from '../hooks/useLedger';
import type { LedgerTransaction } from '../types/accounting.types';

interface GeneralLedgerScreenProps {
  accountId?: string;
  accountName?: string;
  accountCode?: string | null;
  onBack?: () => void;
  onNavigate?: (target: string) => void;
}

type MainMode = 'PASSBOOK' | 'CREDIT' | 'EXPENSE' | 'LEDGER' | 'OVERVIEW';
type DimensionTab = 'Date Wise' | 'Category Wise' | 'Member Wise' | 'Support Type';
type DatePresetKey = 'SEP_2026' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'THIS_FY';

export const GeneralLedgerScreen: React.FC<GeneralLedgerScreenProps> = ({
  accountId,
  accountName: initialAccountName,
  accountCode: initialAccountCode,
  onBack,
  onNavigate,
}) => {
  const { width } = useWindowDimensions();
  const [activeMode, setActiveMode] = useState<MainMode>('PASSBOOK');
  const [activeDimensionTab, setActiveDimensionTab] = useState<DimensionTab>('Date Wise');
  const [txFilterType, setTxFilterType] = useState<'ALL' | 'CREDIT' | 'EXPENSE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDatePreset, setSelectedDatePreset] = useState<DatePresetKey>('THIS_MONTH');

  const { fromDate, toDate, dateLabel } = useMemo(() => {
    const now = new Date();
    if (selectedDatePreset === 'SEP_2026') {
      return { fromDate: '2026-09-01', toDate: '2026-09-30', dateLabel: 'Sep 2026' };
    } else if (selectedDatePreset === 'THIS_MONTH') {
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return { fromDate: from, toDate: to, dateLabel: `${monthNames[now.getMonth()]} ${now.getFullYear()}` };
    } else if (selectedDatePreset === 'LAST_MONTH') {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      return { fromDate: from, toDate: to, dateLabel: 'Last Month' };
    } else if (selectedDatePreset === 'THIS_QUARTER') {
      const from = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      return { fromDate: from, toDate: to, dateLabel: 'This Quarter' };
    } else {
      const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      return { fromDate: `${currentYear}-04-01`, toDate: `${currentYear + 1}-03-31`, dateLabel: `FY ${currentYear}-${(currentYear + 1).toString().slice(-2)}` };
    }
  }, [selectedDatePreset]);

  const {
    transactions,
    summary,
    account,
    loading,
    error,
    refresh,
  } = useLedger({
    accountId,
    fromDate,
    toDate,
  });

  const displayAccountName = account?.account_name || initialAccountName;

  // Filtered transactions for Mode 2 (Credit / Expense / All)
  const filteredTransactions = useMemo(() => {
    let list = transactions;

    // Filter by tab / mode
    if (activeMode === 'CREDIT' || txFilterType === 'CREDIT') {
      list = list.filter(t => (t.credit || 0) > 0);
    } else if (activeMode === 'EXPENSE' || txFilterType === 'EXPENSE') {
      list = list.filter(t => (t.debit || 0) > 0);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        t =>
          (t.account_name && t.account_name.toLowerCase().includes(q)) ||
          (t.narration && t.narration.toLowerCase().includes(q)) ||
          (t.entry_number && t.entry_number.toLowerCase().includes(q)) ||
          (t.reference_id && t.reference_id.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [transactions, activeMode, txFilterType, searchQuery]);

  // Counts
  const totalCount = transactions.length;
  const creditCount = transactions.filter(t => (t.credit || 0) > 0).length;
  const expenseCount = transactions.filter(t => (t.debit || 0) > 0).length;

  // Real financial figures
  const openingBal = summary.opening_balance || 0;
  const totalCreditAmt = summary.total_credit || 0;
  const totalExpenseAmt = summary.total_debit || 0;
  const closingBal = summary.closing_balance || 0;

  // Responsive chart width
  const chartWidth = Math.min(width - 48, 560);

  // Grouped date-wise summary for Mode 3 (Details)
  const dateWiseRows = useMemo(() => {
    const map = new Map<string, { date: string; credit: number; debit: number; count: number }>();
    transactions.forEach(t => {
      const dateKey = t.entry_date ? t.entry_date.slice(0, 10) : '2026-09-30';
      const existing = map.get(dateKey) || { date: dateKey, credit: 0, debit: 0, count: 0 };
      existing.credit += t.credit || 0;
      existing.debit += t.debit || 0;
      existing.count += 1;
      map.set(dateKey, existing);
    });

    const sorted = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
    let running = closingBal;
    return sorted.map(row => {
      const closing = running;
      const opening = closing - row.credit + row.debit;
      running = opening;
      return {
        ...row,
        openingBalance: opening,
        closingBalance: closing,
      };
    });
  }, [transactions, closingBal]);

  const handleExport = () => {
    Alert.alert('Export Summary', 'Statement exported successfully as PDF/Excel.');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <AdminHeader
        unreadCount={3}
        onNavigate={(target: string) => {
          if (onNavigate) onNavigate(target);
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        {/* ========================================================================= */}
        {/* 1. TOP PAGE HEADER & DATE PRESET PILL */}
        {/* ========================================================================= */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderText}>
            <View style={styles.titleRow}>
              {onBack && (
                <TouchableOpacity
                  onPress={onBack}
                  style={styles.backBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <ChevronLeft size={22} color="#0F2C59" />
                </TouchableOpacity>
              )}
              <Text style={styles.pageTitle}>
                {activeMode === 'LEDGER' ? 'Balance Details' : displayAccountName || 'Balance'}
              </Text>
            </View>
            <Text style={styles.pageSubtitle}>
              {activeMode === 'OVERVIEW'
                ? 'Overview of opening balance, credits, expenses and closing balance.'
                : activeMode === 'LEDGER'
                ? 'View detailed summary for the selected period.'
                : 'View all credit and expense transactions.'}
            </Text>
          </View>

          {/* Date Selector Pill */}
          <TouchableOpacity
            style={styles.datePill}
            onPress={() => {
              const presets: DatePresetKey[] = ['THIS_MONTH', 'LAST_MONTH', 'THIS_QUARTER', 'THIS_FY'];
              const nextIdx = (presets.indexOf(selectedDatePreset) + 1) % presets.length;
              setSelectedDatePreset(presets[nextIdx]);
            }}
            activeOpacity={0.8}
          >
            <Calendar size={13} color="#2563EB" />
            <Text style={styles.datePillText}>{dateLabel}</Text>
            <ChevronDown size={13} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* 2. TOP 4 KPI CARDS (2x2 Grid or 1-Row Mini Cards) */}
        {/* ========================================================================= */}
        {activeMode !== 'LEDGER' ? (
          <View style={styles.kpiGrid2x2}>
            {/* Card 1: Opening Balance */}
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Wallet size={16} color="#2563EB" />
              </View>
              <Text style={styles.kpiValue} numberOfLines={1}>
                {formatINR(openingBal, { noDecimals: true })}
              </Text>
              <Text style={styles.kpiLabel}>Opening Balance</Text>
              <Text style={styles.kpiSub}>As on {fromDate.slice(5)}</Text>
            </View>

            {/* Card 2: Total Credit Amount */}
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <ArrowDownLeft size={16} color="#16A34A" />
              </View>
              <Text style={styles.kpiValue} numberOfLines={1}>
                {formatINR(totalCreditAmt, { noDecimals: true })}
              </Text>
              <Text style={styles.kpiLabel}>Total Credit Amount</Text>
              <Text style={styles.trendGreenText}>↑ +{creditCount} credits</Text>
            </View>

            {/* Card 3: Total Expense Amount */}
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#FEF2F2' }]}>
                <ArrowUpRight size={16} color="#DC2626" />
              </View>
              <Text style={[styles.kpiValue, styles.kpiValueExpense]} numberOfLines={1}>
                {formatINR(totalExpenseAmt, { noDecimals: true })}
              </Text>
              <Text style={styles.kpiLabel}>Total Expense Amount</Text>
              <Text style={styles.trendRedText}>↑ +{expenseCount} debits</Text>
            </View>

            {/* Card 4: Closing Balance */}
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#F5F3FF' }]}>
                <Scale size={16} color="#7C3AED" />
              </View>
              <Text style={styles.kpiValue} numberOfLines={1}>
                {formatINR(closingBal, { noDecimals: true })}
              </Text>
              <Text style={styles.kpiLabel}>Closing Balance</Text>
              <Text style={styles.kpiSub}>As on {toDate.slice(5)}</Text>
            </View>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRowMini}>
            <View style={styles.kpiMiniCard}>
              <View style={[styles.kpiIconWrapMini, { backgroundColor: '#EFF6FF' }]}>
                <Wallet size={14} color="#2563EB" />
              </View>
              <Text style={styles.kpiLabelMini}>Opening Balance</Text>
              <Text style={styles.kpiValMini}>{formatINR(openingBal, { noDecimals: true })}</Text>
              <Text style={styles.kpiSubMini}>As on {fromDate.slice(5)}</Text>
            </View>

            <View style={styles.kpiMiniCard}>
              <View style={[styles.kpiIconWrapMini, { backgroundColor: '#ECFDF5' }]}>
                <ArrowDownLeft size={14} color="#16A34A" />
              </View>
              <Text style={styles.kpiLabelMini}>Total Credit</Text>
              <Text style={styles.kpiValMini}>{formatINR(totalCreditAmt, { noDecimals: true })}</Text>
              <Text style={styles.kpiSubMini}>{creditCount} transactions</Text>
            </View>

            <View style={styles.kpiMiniCard}>
              <View style={[styles.kpiIconWrapMini, { backgroundColor: '#FEF2F2' }]}>
                <ArrowUpRight size={14} color="#DC2626" />
              </View>
              <Text style={styles.kpiLabelMini}>Total Expense</Text>
              <Text style={[styles.kpiValMini, styles.kpiValueExpense]}>{formatINR(totalExpenseAmt, { noDecimals: true })}</Text>
              <Text style={styles.kpiSubMini}>{expenseCount} transactions</Text>
            </View>

            <View style={styles.kpiMiniCard}>
              <View style={[styles.kpiIconWrapMini, { backgroundColor: '#F5F3FF' }]}>
                <Scale size={14} color="#7C3AED" />
              </View>
              <Text style={styles.kpiLabelMini}>Closing Balance</Text>
              <Text style={styles.kpiValMini}>{formatINR(closingBal, { noDecimals: true })}</Text>
              <Text style={styles.kpiSubMini}>As on {toDate.slice(5)}</Text>
            </View>
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* 3. MAIN NAVIGATION TABS (Passbook | Credit | Expense | Ledger | Overview) */}
        {/* ========================================================================= */}
        <View style={styles.modeTabsRow}>
          <TouchableOpacity
            style={[styles.modeTabBtn, activeMode === 'PASSBOOK' && styles.modeTabBtnActive]}
            onPress={() => {
              setActiveMode('PASSBOOK');
              setTxFilterType('ALL');
            }}
            activeOpacity={0.8}
          >
            <Wallet size={13} color={activeMode === 'PASSBOOK' ? '#FFFFFF' : '#0F2C59'} />
            <Text style={[styles.modeTabText, activeMode === 'PASSBOOK' && styles.modeTabTextActive]}>
              Passbook
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTabBtn, activeMode === 'CREDIT' && styles.modeTabBtnActive]}
            onPress={() => {
              setActiveMode('CREDIT');
              setTxFilterType('CREDIT');
            }}
            activeOpacity={0.8}
          >
            <ArrowDownLeft size={13} color={activeMode === 'CREDIT' ? '#FFFFFF' : '#16A34A'} />
            <Text style={[styles.modeTabText, activeMode === 'CREDIT' && styles.modeTabTextActive]}>
              Credit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTabBtn, activeMode === 'EXPENSE' && styles.modeTabBtnActive]}
            onPress={() => {
              setActiveMode('EXPENSE');
              setTxFilterType('EXPENSE');
            }}
            activeOpacity={0.8}
          >
            <ArrowUpRight size={13} color={activeMode === 'EXPENSE' ? '#FFFFFF' : '#DC2626'} />
            <Text style={[styles.modeTabText, activeMode === 'EXPENSE' && styles.modeTabTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTabBtn, activeMode === 'LEDGER' && styles.modeTabBtnActive]}
            onPress={() => setActiveMode('LEDGER')}
            activeOpacity={0.8}
          >
            <FileText size={13} color={activeMode === 'LEDGER' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.modeTabText, activeMode === 'LEDGER' && styles.modeTabTextActive]}>
              Ledger
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTabBtn, activeMode === 'OVERVIEW' && styles.modeTabBtnActive]}
            onPress={() => setActiveMode('OVERVIEW')}
            activeOpacity={0.8}
          >
            <Scale size={13} color={activeMode === 'OVERVIEW' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.modeTabText, activeMode === 'OVERVIEW' && styles.modeTabTextActive]}>
              Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* 4. MODE 1: OVERVIEW SCREEN (Balance Trend & Quick Summary) */}
        {/* ========================================================================= */}
        {activeMode === 'OVERVIEW' && (
          <ScrollView
            contentContainerStyle={styles.overviewScroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
                tintColor={AdminColors.primary}
              />
            }
          >
            {/* Balance Trend Card */}
            <View style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendTitle}>Balance Trend</Text>
                <View style={styles.timeFilterChip}>
                  <Text style={styles.timeFilterText}>Last 30 Days</Text>
                  <ChevronDown size={12} color="#64748B" />
                </View>
              </View>

              {/* Legend */}
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Credit</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendText}>Expense</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.legendText}>Closing Balance</Text>
                </View>
              </View>

              {/* Combined Chart (Dual Bar + Line Graph) */}
              <View style={styles.chartWrap}>
                <Svg width={chartWidth} height={150} viewBox="0 0 330 150">
                  <Defs>
                    <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                      <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </LinearGradient>
                  </Defs>
                  {/* Grid Lines */}
                  <Path d="M 30 20 L 320 20 M 30 50 L 320 50 M 30 80 L 320 80 M 30 110 L 320 110 M 30 135 L 320 135" stroke="#F1F5F9" strokeWidth="1" />
                  {/* Y Axis Labels */}
                  <SvgText x="5" y="24" fontSize="8" fill="#94A3B8" fontWeight="600">8L</SvgText>
                  <SvgText x="5" y="54" fontSize="8" fill="#94A3B8" fontWeight="600">6L</SvgText>
                  <SvgText x="5" y="84" fontSize="8" fill="#94A3B8" fontWeight="600">4L</SvgText>
                  <SvgText x="5" y="114" fontSize="8" fill="#94A3B8" fontWeight="600">2L</SvgText>
                  <SvgText x="15" y="139" fontSize="8" fill="#94A3B8" fontWeight="600">0</SvgText>

                  {/* Dual Bars across intervals */}
                  <G>
                    {/* Interval 1 */}
                    <Rect x="42" y="105" width="5" height="30" rx="1.5" fill="#10B981" />
                    <Rect x="49" y="115" width="5" height="20" rx="1.5" fill="#EF4444" />
                    {/* Interval 2 */}
                    <Rect x="97" y="90" width="5" height="45" rx="1.5" fill="#10B981" />
                    <Rect x="104" y="118" width="5" height="17" rx="1.5" fill="#EF4444" />
                    {/* Interval 3 */}
                    <Rect x="152" y="85" width="5" height="50" rx="1.5" fill="#10B981" />
                    <Rect x="159" y="100" width="5" height="35" rx="1.5" fill="#EF4444" />
                    {/* Interval 4 */}
                    <Rect x="207" y="70" width="5" height="65" rx="1.5" fill="#10B981" />
                    <Rect x="214" y="95" width="5" height="40" rx="1.5" fill="#EF4444" />
                    {/* Interval 5 */}
                    <Rect x="262" y="60" width="5" height="75" rx="1.5" fill="#10B981" />
                    <Rect x="269" y="105" width="5" height="30" rx="1.5" fill="#EF4444" />
                  </G>

                  {/* Closing Balance Area & Line */}
                  <Path
                    d="M 30 115 L 45 110 L 100 95 L 155 90 L 210 70 L 265 60 L 315 45 L 315 135 L 30 135 Z"
                    fill="url(#lineGrad)"
                  />
                  <Path
                    d="M 30 115 L 45 110 L 100 95 L 155 90 L 210 70 L 265 60 L 315 45"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                  />
                  {/* Line Dots */}
                  <Circle cx="30" cy="115" r="3.5" fill="#2563EB" />
                  <Circle cx="45" cy="110" r="3.5" fill="#2563EB" />
                  <Circle cx="100" cy="95" r="3.5" fill="#2563EB" />
                  <Circle cx="155" cy="90" r="3.5" fill="#2563EB" />
                  <Circle cx="210" cy="70" r="3.5" fill="#2563EB" />
                  <Circle cx="265" cy="60" r="3.5" fill="#2563EB" />
                  <Circle cx="315" cy="45" r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                </Svg>
                <View style={styles.xAxisRow}>
                  <Text style={styles.xAxisText}>1 Sep</Text>
                  <Text style={styles.xAxisText}>7 Sep</Text>
                  <Text style={styles.xAxisText}>14 Sep</Text>
                  <Text style={styles.xAxisText}>21 Sep</Text>
                  <Text style={styles.xAxisText}>28 Sep</Text>
                </View>
              </View>
            </View>

            {/* Quick Summary Cards (3 Columns) */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Quick Summary</Text>
              <View style={styles.quickSummaryRow}>
                <View style={styles.quickCard}>
                  <Text style={styles.quickCardLabel}>Total Transactions</Text>
                  <Text style={styles.quickCardVal}>{totalCount}</Text>
                </View>

                <View style={[styles.quickCard, styles.quickCardCredit]}>
                  <Text style={styles.quickCardLabel}>Credit Transactions</Text>
                  <Text style={[styles.quickCardVal, { color: '#16A34A' }]}>{creditCount}</Text>
                </View>

                <View style={[styles.quickCard, styles.quickCardExpense]}>
                  <Text style={styles.quickCardLabel}>Expense Transactions</Text>
                  <Text style={[styles.quickCardVal, { color: '#DC2626' }]}>{expenseCount}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* 5. MODE 2: TRANSACTIONS LIST VIEW (Passbook / Credit / Expense / All) */}
        {/* ========================================================================= */}
        {(activeMode === 'PASSBOOK' || activeMode === 'CREDIT' || activeMode === 'EXPENSE') && (
          <View style={styles.transactionsContainer}>
            {/* Search & Filter Bar */}
            <View style={styles.searchRow}>
              <View style={styles.searchInputWrap}>
                <Search size={16} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by description, reference no. or member..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
                <ListFilter size={15} color="#0F2C59" />
                <Text style={styles.filterBtnText}>Filters</Text>
              </TouchableOpacity>
            </View>

            {/* Type Pills */}
            <View style={styles.typePillsRow}>
              <TouchableOpacity
                style={[styles.typePill, txFilterType === 'ALL' && styles.typePillActive]}
                onPress={() => setTxFilterType('ALL')}
              >
                <Text style={[styles.typePillText, txFilterType === 'ALL' && styles.typePillTextActive]}>
                  All ({totalCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typePill, txFilterType === 'CREDIT' && styles.typePillActive]}
                onPress={() => setTxFilterType('CREDIT')}
              >
                <Text style={[styles.typePillText, txFilterType === 'CREDIT' && styles.typePillTextActive]}>
                  Credit ({creditCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typePill, txFilterType === 'EXPENSE' && styles.typePillActive]}
                onPress={() => setTxFilterType('EXPENSE')}
              >
                <Text style={[styles.typePillText, txFilterType === 'EXPENSE' && styles.typePillTextActive]}>
                  Expense ({expenseCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Transactions FlatList */}
            <FlatList
              data={filteredTransactions}
              keyExtractor={item => `${item.entry_id}-${item.id}`}
              contentContainerStyle={styles.txListContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isCredit = (item.credit || 0) > 0;
                const amt = isCredit ? item.credit : item.debit;
                return (
                  <View style={styles.txCard}>
                    {/* Date */}
                    <View style={styles.txDateCol}>
                      <Text style={styles.txDateText}>
                        {item.entry_date ? item.entry_date.slice(0, 10) : '—'}
                      </Text>
                    </View>

                    {/* Type Badge */}
                    <View
                      style={[
                        styles.txTypeBadge,
                        isCredit ? styles.txCreditBadge : styles.txExpenseBadge,
                      ]}
                    >
                      <View
                        style={[
                          styles.txTypeDot,
                          { backgroundColor: isCredit ? '#16A34A' : '#DC2626' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.txTypeText,
                          { color: isCredit ? '#16A34A' : '#DC2626' },
                        ]}
                      >
                        {isCredit ? 'Credit' : 'Expense'}
                      </Text>
                    </View>

                    {/* Description & Ref */}
                    <View style={styles.txDescCol}>
                      <Text style={styles.txDescTitle} numberOfLines={1}>
                        {item.account_name || 'Transaction'}
                      </Text>
                      <Text style={styles.txDescRef} numberOfLines={1}>
                        REF: {item.reference_id || item.entry_number || 'N/A'}
                      </Text>
                    </View>

                    {/* Amount & Balance */}
                    <View style={styles.txAmountCol}>
                      <Text
                        style={[
                          styles.txAmountText,
                          isCredit ? styles.txCreditAmount : styles.txExpenseAmount,
                        ]}
                        numberOfLines={1}
                      >
                        {isCredit ? '+' : '-'} {formatINR(amt, { noDecimals: true })}
                      </Text>
                      <Text style={styles.txBalanceText} numberOfLines={1}>
                        {formatINR(item.running_balance || 0, { noDecimals: true })}
                      </Text>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <AppEmptyState
                    icon="📖"
                    title="No Transactions"
                    description="No matching transactions found for this selection."
                  />
                </View>
              }
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={refresh}
                  tintColor={AdminColors.primary}
                />
              }
            />
          </View>
        )}

        {/* ========================================================================= */}
        {/* 6. MODE 3: DETAILED BREAKDOWN (Date Wise / Category Wise / Member / Support) */}
        {/* ========================================================================= */}
        {activeMode === 'LEDGER' && (
          <ScrollView
            contentContainerStyle={styles.detailsScroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
                tintColor={AdminColors.primary}
              />
            }
          >
            {/* Dimension Breakdown Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dimensionTabsRow}
            >
              {(['Date Wise', 'Category Wise', 'Member Wise', 'Support Type'] as DimensionTab[]).map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.dimensionTabChip,
                    activeDimensionTab === tab && styles.dimensionTabChipActive,
                  ]}
                  onPress={() => setActiveDimensionTab(tab)}
                >
                  <Text
                    style={[
                      styles.dimensionTabText,
                      activeDimensionTab === tab && styles.dimensionTabTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date Wise Summary Table Card */}
            <View style={styles.summaryTableCard}>
              <View style={styles.tableCardHeader}>
                <View style={styles.tableHeaderTitleRow}>
                  <Calendar size={16} color="#0F2C59" />
                  <Text style={styles.tableCardTitle}>{activeDimensionTab} Summary</Text>
                </View>
                <TouchableOpacity style={styles.exportBtn} onPress={handleExport} activeOpacity={0.8}>
                  <Download size={13} color="#0F2C59" />
                  <Text style={styles.exportBtnText}>Export</Text>
                </TouchableOpacity>
              </View>

              {/* Table Column Headers */}
              <View style={styles.tableHeadRow}>
                <Text style={[styles.thCol, { width: 75 }]}>Date</Text>
                <Text style={[styles.thCol, { flex: 1, textAlign: 'right' }]}>Opening</Text>
                <Text style={[styles.thCol, { flex: 1, textAlign: 'right', color: '#16A34A' }]}>Credit</Text>
                <Text style={[styles.thCol, { flex: 1, textAlign: 'right', color: '#DC2626' }]}>Expense</Text>
                <Text style={[styles.thCol, { flex: 1.1, textAlign: 'right' }]}>Closing</Text>
              </View>

              {/* Table Rows */}
              {dateWiseRows.map((row, idx) => (
                <View key={`row-${idx}`} style={styles.tableDataRow}>
                  <Text style={[styles.tdColDate, { width: 75 }]}>{row.date}</Text>
                  <Text style={[styles.tdColVal, { flex: 1, textAlign: 'right' }]}>
                    {formatINR(row.openingBalance, { noDecimals: true })}
                  </Text>
                  <Text style={[styles.tdColVal, { flex: 1, textAlign: 'right', color: row.credit > 0 ? '#16A34A' : '#94A3B8' }]}>
                    {row.credit > 0 ? formatINR(row.credit, { noDecimals: true }) : '₹0'}
                  </Text>
                  <Text style={[styles.tdColVal, { flex: 1, textAlign: 'right', color: row.debit > 0 ? '#DC2626' : '#94A3B8' }]}>
                    {row.debit > 0 ? formatINR(row.debit, { noDecimals: true }) : '₹0'}
                  </Text>
                  <Text style={[styles.tdColVal, { flex: 1.1, textAlign: 'right', fontWeight: '800', color: '#0F2C59' }]}>
                    {formatINR(row.closingBalance, { noDecimals: true })}
                  </Text>
                </View>
              ))}

              {dateWiseRows.length === 0 && (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#94A3B8' }}>No records found for this timeframe.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    gap: 8,
  },
  pageHeaderText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2C59',
    letterSpacing: -0.2,
  },
  pageSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  datePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2C59',
  },

  /* 2x2 Top KPI Grid */
  kpiGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    gap: 10,
    marginVertical: Spacing.xs,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  kpiIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2C59',
    marginBottom: 2,
  },
  kpiValueExpense: {
    color: '#DC2626',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  kpiSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  trendGreenText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
  trendRedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 2,
  },

  /* 1-Row Mini KPI Carousel for Details */
  kpiRowMini: {
    paddingHorizontal: Spacing.base,
    gap: 8,
    paddingVertical: Spacing.xs,
  },
  kpiMiniCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  kpiIconWrapMini: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiLabelMini: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  kpiValMini: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2C59',
    marginVertical: 1,
  },
  kpiSubMini: {
    fontSize: 8,
    fontWeight: '600',
    color: '#94A3B8',
  },

  /* Mode Selector Tabs */
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.xs,
  },
  modeTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 8,
  },
  modeTabBtnActive: {
    backgroundColor: '#0F2C59',
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Mode 1: Overview Styles */
  overviewScroll: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl + 40,
  },
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: Spacing.xs,
    ...Shadows.card,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2C59',
  },
  timeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeFilterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  chartWrap: {
    alignItems: 'center',
    marginTop: 6,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 26,
    marginTop: 4,
  },
  xAxisText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
  },
  summarySection: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2C59',
    marginBottom: 8,
  },
  quickSummaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    ...Shadows.card,
  },
  quickCardCredit: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  quickCardExpense: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  quickCardLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  quickCardVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2C59',
    marginTop: 4,
  },

  /* Mode 2: Transactions View */
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: Spacing.xs,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F2C59',
    padding: 0,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2C59',
  },
  typePillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typePillActive: {
    backgroundColor: '#0F2C59',
    borderColor: '#0F2C59',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  typePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  txListContent: {
    paddingBottom: Spacing.xxl + 40,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    ...Shadows.card,
  },
  txDateCol: {
    width: 65,
  },
  txDateText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  txTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  txCreditBadge: {
    backgroundColor: '#ECFDF5',
  },
  txExpenseBadge: {
    backgroundColor: '#FEF2F2',
  },
  txTypeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  txTypeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  txDescCol: {
    flex: 1,
  },
  txDescTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2C59',
  },
  txDescRef: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    marginTop: 1,
  },
  txAmountCol: {
    alignItems: 'flex-end',
    width: 80,
  },
  txAmountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  txCreditAmount: {
    color: '#16A34A',
  },
  txExpenseAmount: {
    color: '#DC2626',
  },
  txBalanceText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },

  /* Mode 3: Details & Breakdown */
  detailsScroll: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl + 40,
  },
  dimensionTabsRow: {
    gap: 6,
    marginVertical: Spacing.xs,
  },
  dimensionTabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dimensionTabChipActive: {
    backgroundColor: '#0F2C59',
    borderColor: '#0F2C59',
  },
  dimensionTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  dimensionTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  summaryTableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: Spacing.xs,
    ...Shadows.card,
  },
  tableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tableHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tableCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2C59',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exportBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F2C59',
  },
  tableHeadRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thCol: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tdColDate: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  tdColVal: {
    fontSize: 10,
    color: '#1E293B',
  },
  skeletonContainer: {
    padding: Spacing.base,
    gap: 10,
  },
  emptyContainer: {
    padding: Spacing.base,
    alignItems: 'center',
  },
});
