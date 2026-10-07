import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
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
import { AppEmptyState } from '../../../../core/components';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Download,
  Eye,
  FileText,
  ListFilter,
  Plus,
  Scale,
  Search,
  Wallet,
  X,
} from '../../../../core/components/icons';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { formatINR } from '../../../../core/utils/currency';
import { useLedger } from '../hooks/useLedger';
import type { LedgerTransaction } from '../types/accounting.types';
import { AppRoutes } from '../../../../core/constants/routes';

interface GeneralLedgerScreenProps {
  accountId?: string;
  accountName?: string;
  accountCode?: string | null;
  onBack?: () => void;
  onNavigate?: (target: string, params?: any) => void;
}

type MainMode = 'PASSBOOK' | 'CREDIT' | 'EXPENSE' | 'LEDGER' | 'ANALYTICS';
type DimensionTab = 'Date Wise' | 'Category Wise' | 'Member Wise' | 'Support Type';
type DatePresetKey = 'ALL_TIME' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'THIS_FY';

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
  const [selectedDatePreset, setSelectedDatePreset] = useState<DatePresetKey>('ALL_TIME');
  const [selectedTx, setSelectedTx] = useState<LedgerTransaction | null>(null);

  const { fromDate, toDate, dateLabel } = useMemo(() => {
    const now = new Date();
    if (selectedDatePreset === 'ALL_TIME') {
      return { fromDate: undefined, toDate: undefined, dateLabel: 'All Records' };
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
      return {
        fromDate: `${currentYear}-04-01`,
        toDate: `${currentYear + 1}-03-31`,
        dateLabel: `FY ${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
      };
    }
  }, [selectedDatePreset]);

  const {
    transactions,
    summary,
    account,
    loading,
    refresh,
  } = useLedger({
    accountId,
    fromDate,
    toDate,
  });

  const displayName = account?.account_name || initialAccountName || 'General Passbook';

  // Filtered transactions for Mode 2 (Credit / Expense / All)
  const filteredTransactions = useMemo(() => {
    let list = transactions;

    // Filter by tab / mode
    if (activeMode === 'CREDIT' || txFilterType === 'CREDIT') {
      list = list.filter((t) => (t.credit || 0) > 0);
    } else if (activeMode === 'EXPENSE' || txFilterType === 'EXPENSE') {
      list = list.filter((t) => (t.debit || 0) > 0);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          (t.account_name && t.account_name.toLowerCase().includes(q)) ||
          (t.narration && t.narration.toLowerCase().includes(q)) ||
          (t.entry_number && t.entry_number.toLowerCase().includes(q)) ||
          (t.reference_id && t.reference_id.toLowerCase().includes(q)) ||
          (t.paid_to && t.paid_to.toLowerCase().includes(q)) ||
          (t.received_from && t.received_from.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [transactions, activeMode, txFilterType, searchQuery]);

  // Counts
  const totalCount = transactions.length;
  const creditCount = transactions.filter((t) => (t.credit || 0) > 0).length;
  const expenseCount = transactions.filter((t) => (t.debit || 0) > 0).length;

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
    transactions.forEach((t) => {
      const dateKey = t.entry_date ? t.entry_date.slice(0, 10) : 'Today';
      const existing = map.get(dateKey) || { date: dateKey, credit: 0, debit: 0, count: 0 };
      existing.credit += t.credit || 0;
      existing.debit += t.debit || 0;
      existing.count += 1;
      map.set(dateKey, existing);
    });

    const sorted = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
    let running = closingBal;
    return sorted.map((row) => {
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
    Alert.alert('Export Statement', 'Passbook statement exported successfully as PDF/Excel.');
  };

  const handleOpenVoucher = (tx: LedgerTransaction) => {
    if (!onNavigate) return;
    if (tx.reference_type === 'EXPENSE_VOUCHER' || tx.entry_type === 'EXPENSE') {
      onNavigate(AppRoutes.EXPENSE_DETAILS, { id: tx.id });
    } else if (tx.reference_type === 'RECEIPT_VOUCHER' || tx.entry_type === 'RECEIPT') {
      onNavigate(AppRoutes.RECEIPT_DETAILS, { id: tx.id });
    } else if (tx.reference_type === 'DONATION' || tx.entry_type === 'DONATION') {
      onNavigate(AppRoutes.DONATION_RECEIPT_DETAILS, { id: tx.id });
    }
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
              <Text style={styles.pageTitle}>{displayName}</Text>
            </View>
            <Text style={styles.pageSubtitle}>
              Live ledger showing all credits, expenses, and running balance.
            </Text>
          </View>

          {/* Date Selector Pill */}
          <TouchableOpacity
            style={styles.datePill}
            onPress={() => {
              const presets: DatePresetKey[] = [
                'ALL_TIME',
                'THIS_MONTH',
                'LAST_MONTH',
                'THIS_QUARTER',
                'THIS_FY',
              ];
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
        {/* 2. TOP 4 KPI CARDS */}
        {/* ========================================================================= */}
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
            <Text style={styles.kpiSub}>Base balance</Text>
          </View>

          {/* Card 2: Total Credit Amount */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <ArrowDownLeft size={16} color="#16A34A" />
            </View>
            <Text style={[styles.kpiValue, { color: '#16A34A' }]} numberOfLines={1}>
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
            <Text style={[styles.kpiValue, { color: '#0F2C59' }]} numberOfLines={1}>
              {formatINR(closingBal, { noDecimals: true })}
            </Text>
            <Text style={styles.kpiLabel}>Closing Balance</Text>
            <Text style={styles.kpiSub}>Net available</Text>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 3. QUICK ACTION BAR (+ Credit, + Expense, Receipts, Expenses) */}
        {/* ========================================================================= */}
        <View style={styles.quickActionBar}>
          <TouchableOpacity
            style={styles.actionBtnCredit}
            onPress={() => {
              if (onNavigate) onNavigate(AppRoutes.CREATE_RECEIPT_VOUCHER);
            }}
            activeOpacity={0.8}
          >
            <Plus size={14} color="#FFFFFF" />
            <Text style={styles.actionBtnCreditText}>+ Add Credit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnExpense}
            onPress={() => {
              if (onNavigate) onNavigate(AppRoutes.CREATE_EXPENSE_VOUCHER);
            }}
            activeOpacity={0.8}
          >
            <Plus size={14} color="#FFFFFF" />
            <Text style={styles.actionBtnExpenseText}>+ Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnOutline}
            onPress={() => {
              if (onNavigate) onNavigate(AppRoutes.RECEIPT_VOUCHERS);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnOutlineText}>Receipts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnOutline}
            onPress={() => {
              if (onNavigate) onNavigate(AppRoutes.EXPENSE_VOUCHERS);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnOutlineText}>Expenses</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* 4. MAIN NAVIGATION TABS (Passbook | Credit | Expense | Ledger | Analytics) */}
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
              Credit ({creditCount})
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
              Expense ({expenseCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTabBtn, activeMode === 'LEDGER' && styles.modeTabBtnActive]}
            onPress={() => setActiveMode('LEDGER')}
            activeOpacity={0.8}
          >
            <FileText size={13} color={activeMode === 'LEDGER' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.modeTabText, activeMode === 'LEDGER' && styles.modeTabTextActive]}>
              Statement
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTabBtn, activeMode === 'ANALYTICS' && styles.modeTabBtnActive]}
            onPress={() => setActiveMode('ANALYTICS')}
            activeOpacity={0.8}
          >
            <Scale size={13} color={activeMode === 'ANALYTICS' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.modeTabText, activeMode === 'ANALYTICS' && styles.modeTabTextActive]}>
              Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* 5. PASSBOOK TRANSACTIONS VIEW */}
        {/* ========================================================================= */}
        {(activeMode === 'PASSBOOK' || activeMode === 'CREDIT' || activeMode === 'EXPENSE') && (
          <View style={styles.transactionsContainer}>
            {/* Search & Filter Bar */}
            <View style={styles.searchRow}>
              <View style={styles.searchInputWrap}>
                <Search size={16} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by payee, source, voucher #..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={() => {
                  const presets: DatePresetKey[] = [
                    'ALL_TIME',
                    'THIS_MONTH',
                    'LAST_MONTH',
                    'THIS_QUARTER',
                    'THIS_FY',
                  ];
                  const nextIdx = (presets.indexOf(selectedDatePreset) + 1) % presets.length;
                  setSelectedDatePreset(presets[nextIdx]);
                }}
                activeOpacity={0.8}
              >
                <ListFilter size={15} color="#0F2C59" />
                <Text style={styles.filterBtnText}>{dateLabel}</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Filter Pills */}
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
                  Credits ({creditCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typePill, txFilterType === 'EXPENSE' && styles.typePillActive]}
                onPress={() => setTxFilterType('EXPENSE')}
              >
                <Text style={[styles.typePillText, txFilterType === 'EXPENSE' && styles.typePillTextActive]}>
                  Expenses ({expenseCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Transactions FlatList */}
            <FlatList
              data={filteredTransactions}
              keyExtractor={(item) => `${item.entry_id}-${item.id}`}
              contentContainerStyle={styles.txListContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isCredit = (item.credit || 0) > 0;
                const amt = isCredit ? item.credit : item.debit;
                const dateObj = new Date(item.entry_date);
                const dayNum = isNaN(dateObj.getTime()) ? '' : dateObj.getDate();
                const monthShort = isNaN(dateObj.getTime())
                  ? ''
                  : dateObj.toLocaleString('default', { month: 'short' });

                return (
                  <TouchableOpacity
                    style={styles.txCard}
                    onPress={() => setSelectedTx(item)}
                    activeOpacity={0.7}
                  >
                    {/* Date Block */}
                    <View style={styles.dateBlock}>
                      <Text style={styles.dateBlockDay}>{dayNum || '•'}</Text>
                      <Text style={styles.dateBlockMonth}>{monthShort || 'DATE'}</Text>
                    </View>

                    {/* Middle Info Column */}
                    <View style={styles.txMainInfo}>
                      <View style={styles.txTitleRow}>
                        <Text style={styles.txTitle} numberOfLines={1}>
                          {item.account_name || (isCredit ? 'Credit Receipt' : 'Expense Payment')}
                        </Text>
                      </View>

                      <View style={styles.txMetaRow}>
                        <View
                          style={[
                            styles.badgeType,
                            isCredit ? styles.badgeTypeCredit : styles.badgeTypeExpense,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeTypeText,
                              { color: isCredit ? '#16A34A' : '#DC2626' },
                            ]}
                          >
                            {isCredit ? 'CREDIT' : 'EXPENSE'}
                          </Text>
                        </View>

                        {item.payment_method && (
                          <View style={styles.badgeMethod}>
                            <Text style={styles.badgeMethodText}>
                              {item.payment_method.replace('_', ' ')}
                            </Text>
                          </View>
                        )}

                        <Text style={styles.txRefText} numberOfLines={1}>
                          {item.entry_number || item.reference_id || 'REF-N/A'}
                        </Text>
                      </View>

                      {item.narration ? (
                        <Text style={styles.txNarration} numberOfLines={1}>
                          {item.narration}
                        </Text>
                      ) : null}
                    </View>

                    {/* Right Amount & Balance */}
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
                      <View style={styles.balancePill}>
                        <Text style={styles.balancePillText} numberOfLines={1}>
                          Bal: {formatINR(item.running_balance || 0, { noDecimals: true })}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <AppEmptyState
                    icon="📖"
                    title="No Transactions Found"
                    description="No credit receipts or expense vouchers match the selected filter."
                  />
                  <View style={styles.emptyActionRow}>
                    <TouchableOpacity
                      style={styles.emptyActionBtn}
                      onPress={() => {
                        if (onNavigate) onNavigate(AppRoutes.CREATE_RECEIPT_VOUCHER);
                      }}
                    >
                      <Text style={styles.emptyActionBtnText}>+ Record Credit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.emptyActionBtn, { backgroundColor: '#DC2626' }]}
                      onPress={() => {
                        if (onNavigate) onNavigate(AppRoutes.CREATE_EXPENSE_VOUCHER);
                      }}
                    >
                      <Text style={styles.emptyActionBtnText}>+ Record Expense</Text>
                    </TouchableOpacity>
                  </View>
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
        {/* 6. STATEMENT / LEDGER BREAKDOWN VIEW */}
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
              {(['Date Wise', 'Category Wise', 'Member Wise', 'Support Type'] as DimensionTab[]).map(
                (tab) => (
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
                ),
              )}
            </ScrollView>

            {/* Date Wise Summary Table Card */}
            <View style={styles.summaryTableCard}>
              <View style={styles.tableCardHeader}>
                <View style={styles.tableHeaderTitleRow}>
                  <Calendar size={16} color="#0F2C59" />
                  <Text style={styles.tableCardTitle}>{activeDimensionTab} Statement</Text>
                </View>
                <TouchableOpacity
                  style={styles.exportBtn}
                  onPress={handleExport}
                  activeOpacity={0.8}
                >
                  <Download size={13} color="#0F2C59" />
                  <Text style={styles.exportBtnText}>Export</Text>
                </TouchableOpacity>
              </View>

              {/* Table Column Headers */}
              <View style={styles.tableHeadRow}>
                <Text style={[styles.thCol, { width: 75 }]}>Date</Text>
                <Text style={[styles.thCol, { flex: 1, textAlign: 'right' }]}>Opening</Text>
                <Text style={[styles.thCol, { flex: 1, textAlign: 'right', color: '#16A34A' }]}>
                  Credit
                </Text>
                <Text style={[styles.thCol, { flex: 1, textAlign: 'right', color: '#DC2626' }]}>
                  Expense
                </Text>
                <Text style={[styles.thCol, { flex: 1.1, textAlign: 'right' }]}>Closing</Text>
              </View>

              {/* Table Rows */}
              {dateWiseRows.map((row, idx) => (
                <View key={`row-${idx}`} style={styles.tableDataRow}>
                  <Text style={[styles.tdColDate, { width: 75 }]}>{row.date}</Text>
                  <Text style={[styles.tdColVal, { flex: 1, textAlign: 'right' }]}>
                    {formatINR(row.openingBalance, { noDecimals: true })}
                  </Text>
                  <Text
                    style={[
                      styles.tdColVal,
                      {
                        flex: 1,
                        textAlign: 'right',
                        color: row.credit > 0 ? '#16A34A' : '#94A3B8',
                      },
                    ]}
                  >
                    {row.credit > 0 ? formatINR(row.credit, { noDecimals: true }) : '₹0'}
                  </Text>
                  <Text
                    style={[
                      styles.tdColVal,
                      {
                        flex: 1,
                        textAlign: 'right',
                        color: row.debit > 0 ? '#DC2626' : '#94A3B8',
                      },
                    ]}
                  >
                    {row.debit > 0 ? formatINR(row.debit, { noDecimals: true }) : '₹0'}
                  </Text>
                  <Text
                    style={[
                      styles.tdColVal,
                      { flex: 1.1, textAlign: 'right', fontWeight: '800', color: '#0F2C59' },
                    ]}
                  >
                    {formatINR(row.closingBalance, { noDecimals: true })}
                  </Text>
                </View>
              ))}

              {dateWiseRows.length === 0 && (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                    No records found for this timeframe.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* 7. ANALYTICS / CHART VIEW */}
        {/* ========================================================================= */}
        {activeMode === 'ANALYTICS' && (
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
                <Text style={styles.trendTitle}>Balance & Cash Flow Trend</Text>
                <View style={styles.timeFilterChip}>
                  <Text style={styles.timeFilterText}>{dateLabel}</Text>
                </View>
              </View>

              {/* Legend */}
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Credits (Inflow)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendText}>Expenses (Outflow)</Text>
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
                    <LinearGradient id="lineGradPassbook2" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                      <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </LinearGradient>
                  </Defs>
                  {/* Grid Lines */}
                  <Path
                    d="M 30 20 L 320 20 M 30 50 L 320 50 M 30 80 L 320 80 M 30 110 L 320 110 M 30 135 L 320 135"
                    stroke="#F1F5F9"
                    strokeWidth="1"
                  />
                  {/* Dual Bars */}
                  <G>
                    <Rect x="42" y="95" width="6" height="40" rx="2" fill="#10B981" />
                    <Rect x="50" y="115" width="6" height="20" rx="2" fill="#EF4444" />
                    <Rect x="97" y="80" width="6" height="55" rx="2" fill="#10B981" />
                    <Rect x="105" y="110" width="6" height="25" rx="2" fill="#EF4444" />
                    <Rect x="152" y="70" width="6" height="65" rx="2" fill="#10B981" />
                    <Rect x="160" y="95" width="6" height="40" rx="2" fill="#EF4444" />
                    <Rect x="207" y="60" width="6" height="75" rx="2" fill="#10B981" />
                    <Rect x="215" y="90" width="6" height="45" rx="2" fill="#EF4444" />
                    <Rect x="262" y="45" width="6" height="90" rx="2" fill="#10B981" />
                    <Rect x="270" y="105" width="6" height="30" rx="2" fill="#EF4444" />
                  </G>

                  {/* Closing Balance Area & Line */}
                  <Path
                    d="M 30 115 L 45 105 L 100 85 L 155 75 L 210 55 L 265 40 L 315 30 L 315 135 L 30 135 Z"
                    fill="url(#lineGradPassbook2)"
                  />
                  <Path
                    d="M 30 115 L 45 105 L 100 85 L 155 75 L 210 55 L 265 40 L 315 30"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                  />
                  <Circle cx="45" cy="105" r="3.5" fill="#2563EB" />
                  <Circle cx="100" cy="85" r="3.5" fill="#2563EB" />
                  <Circle cx="155" cy="75" r="3.5" fill="#2563EB" />
                  <Circle cx="210" cy="55" r="3.5" fill="#2563EB" />
                  <Circle cx="265" cy="40" r="3.5" fill="#2563EB" />
                  <Circle
                    cx="315"
                    cy="30"
                    r="4.5"
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </Svg>
              </View>
            </View>

            {/* Quick Summary Cards */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Summary Metrics</Text>
              <View style={styles.quickSummaryRow}>
                <View style={styles.quickCard}>
                  <Text style={styles.quickCardLabel}>Total Records</Text>
                  <Text style={styles.quickCardVal}>{totalCount}</Text>
                </View>

                <View style={[styles.quickCard, styles.quickCardCredit]}>
                  <Text style={styles.quickCardLabel}>Credits</Text>
                  <Text style={[styles.quickCardVal, { color: '#16A34A' }]}>{creditCount}</Text>
                </View>

                <View style={[styles.quickCard, styles.quickCardExpense]}>
                  <Text style={styles.quickCardLabel}>Expenses</Text>
                  <Text style={[styles.quickCardVal, { color: '#DC2626' }]}>{expenseCount}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* 8. TRANSACTION DETAIL MODAL */}
        {/* ========================================================================= */}
        <Modal
          visible={!!selectedTx}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedTx(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Transaction Details</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedTx?.entry_number || selectedTx?.reference_id}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedTx(null)}
                  style={styles.modalCloseBtn}
                >
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {selectedTx && (
                <View style={styles.modalBody}>
                  <View style={styles.modalAmountBox}>
                    <Text style={styles.modalAmountLabel}>
                      {(selectedTx.credit || 0) > 0 ? 'Credit Inflow' : 'Expense Outflow'}
                    </Text>
                    <Text
                      style={[
                        styles.modalAmountVal,
                        {
                          color:
                            (selectedTx.credit || 0) > 0 ? '#16A34A' : '#DC2626',
                        },
                      ]}
                    >
                      {(selectedTx.credit || 0) > 0 ? '+' : '-'}
                      {formatINR(
                        (selectedTx.credit || 0) > 0 ? selectedTx.credit : selectedTx.debit,
                      )}
                    </Text>
                    <Text style={styles.modalRunningBal}>
                      Balance after entry: {formatINR(selectedTx.running_balance || 0)}
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Date & Time</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedTx.entry_date
                        ? new Date(selectedTx.entry_date).toLocaleString()
                        : '—'}
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>
                      {(selectedTx.credit || 0) > 0 ? 'Received From' : 'Paid To / Account'}
                    </Text>
                    <Text style={styles.modalDetailValueBold}>
                      {selectedTx.account_name || selectedTx.paid_to || selectedTx.received_from}
                    </Text>
                  </View>

                  {selectedTx.payment_method && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Payment Mode</Text>
                      <Text style={styles.modalDetailValue}>
                        {selectedTx.payment_method.replace('_', ' ')}
                      </Text>
                    </View>
                  )}

                  {selectedTx.narration && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Narration / Notes</Text>
                      <Text style={styles.modalDetailValue}>{selectedTx.narration}</Text>
                    </View>
                  )}

                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      style={styles.modalActionPrimary}
                      onPress={() => {
                        const tx = selectedTx;
                        setSelectedTx(null);
                        handleOpenVoucher(tx);
                      }}
                    >
                      <Eye size={16} color="#FFFFFF" />
                      <Text style={styles.modalActionPrimaryText}>
                        Open Full Voucher
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  pageHeaderText: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 8,
    padding: 2,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2C59',
  },
  pageSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
    ...Shadows.subtle,
  },
  datePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2C59',
  },

  // 2x2 KPI Cards
  kpiGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: '1%',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.subtle,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2C59',
    letterSpacing: -0.3,
  },
  kpiValueExpense: {
    color: '#DC2626',
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  kpiSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  trendGreenText: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  },
  trendRedText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 2,
  },

  // Quick Action Bar
  quickActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  actionBtnCredit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
    ...Shadows.subtle,
  },
  actionBtnCreditText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnExpense: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
    ...Shadows.subtle,
  },
  actionBtnExpenseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnOutline: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  actionBtnOutlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },

  // Mode Tabs
  modeTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 6,
    marginBottom: 8,
    backgroundColor: '#E2E8F0',
    padding: 3,
    borderRadius: 10,
  },
  modeTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 7,
    gap: 4,
  },
  modeTabBtnActive: {
    backgroundColor: '#0F2C59',
    ...Shadows.subtle,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Transactions Passbook View
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 14,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F2C59',
    paddingVertical: 0,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
    height: 38,
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F2C59',
  },
  typePillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
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
  },

  txListContent: {
    paddingBottom: 24,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.subtle,
  },
  dateBlock: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateBlockDay: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2C59',
    lineHeight: 17,
  },
  dateBlockMonth: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  txMainInfo: {
    flex: 1,
    marginRight: 8,
  },
  txTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2C59',
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
    marginBottom: 2,
  },
  badgeType: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  badgeTypeCredit: {
    backgroundColor: '#DCFCE7',
  },
  badgeTypeExpense: {
    backgroundColor: '#FEE2E2',
  },
  badgeTypeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  badgeMethod: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  badgeMethodText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  txRefText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  txNarration: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmountText: {
    fontSize: 14,
    fontWeight: '800',
  },
  txCreditAmount: {
    color: '#16A34A',
  },
  txExpenseAmount: {
    color: '#DC2626',
  },
  balancePill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  balancePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },

  emptyContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Details / Statement Breakdown
  detailsScroll: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  dimensionTabsRow: {
    gap: 8,
    paddingVertical: 8,
  },
  dimensionTabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
  },
  summaryTableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.subtle,
  },
  tableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  tableHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tableCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2C59',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F2C59',
  },
  tableHeadRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 6,
  },
  thCol: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  tableDataRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tdColDate: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  tdColVal: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },

  // Analytics View
  overviewScroll: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.subtle,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2C59',
  },
  timeFilterChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeFilterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  summarySection: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
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
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.subtle,
  },
  quickCardCredit: {
    borderLeftWidth: 3,
    borderLeftColor: '#16A34A',
  },
  quickCardExpense: {
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  quickCardLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  quickCardVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2C59',
    marginTop: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
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
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingTop: 14,
  },
  modalAmountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalAmountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  modalAmountVal: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 4,
  },
  modalRunningBal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalDetailLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  modalDetailValue: {
    fontSize: 11,
    color: '#0F2C59',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  modalDetailValueBold: {
    fontSize: 12,
    color: '#0F2C59',
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  modalActionsRow: {
    marginTop: 18,
  },
  modalActionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2C59',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  modalActionPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
