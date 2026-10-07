import React, { useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Shadows, Spacing } from '../../../../core/theme';
import {
  AppButton,
  AppEmptyState,
  AppErrorState,
  AppSearchBar,
  SkeletonCard,
} from '../../../../core/components';
import {
  ChevronLeft,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
} from '../../../../core/components/icons';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { formatINR } from '../../../../core/utils/currency';
import { useAccounts } from '../hooks/useAccounts';
import { useTrialBalance } from '../../reports/hooks/useReports';
import { AccountTree } from '../components/AccountTree';
import { CreateAccountModal } from '../components/CreateAccountModal';
import { AccountDetailsSheet } from '../components/AccountDetailsSheet';
import type {
  AccountCategory,
  AccountTreeNode,
  AccountType,
} from '../types/accounting.types';
import type { TrialBalanceAccountItem } from '../../reports/types/reports.types';

interface ChartOfAccountsScreenProps {
  onBack?: () => void;
  onViewAccountLedger?: (account: AccountTreeNode) => void;
  onNavigate?: (target: string) => void;
}

const CATEGORY_TABS: Array<{ key: AccountCategory; label: string }> = [
  { key: 'ALL', label: 'All Accounts' },
  { key: 'ASSET', label: 'Assets' },
  { key: 'LIABILITY', label: 'Liabilities' },
  { key: 'FUND_EQUITY', label: 'Equity' },
  { key: 'INCOME', label: 'Income' },
  { key: 'EXPENSE', label: 'Expenses' },
];

const TODAY_ISO = new Date().toISOString().slice(0, 10);

export const ChartOfAccountsScreen: React.FC<ChartOfAccountsScreenProps> = ({
  onBack,
  onViewAccountLedger,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<AccountTreeNode | null>(null);
  const [detailsSheetVisible, setDetailsSheetVisible] = useState(false);

  const {
    accounts,
    tree,
    loading,
    error,
    refresh,
    createAccount,
    toggleAccountStatus,
  } = useAccounts(selectedCategory, searchQuery);

  const {
    data: trialBalanceData,
    refetch: refetchBalances,
    isLoading: balancesLoading,
  } = useTrialBalance(TODAY_ISO, true);

  // Map of account ID to live balance item
  const balanceMap = useMemo(() => {
    const map = new Map<string, TrialBalanceAccountItem>();
    trialBalanceData?.accounts?.forEach(item => {
      map.set(item.account.id, item);
    });
    return map;
  }, [trialBalanceData]);

  // Aggregate KPI stats across current filtered/displayed accounts
  const summaryKpi = useMemo(() => {
    let totalCredit = 0;
    let totalDebit = 0;
    let totalClosing = 0;

    accounts.forEach(acc => {
      const b = balanceMap.get(acc.id);
      if (b) {
        totalCredit += b.gross_credit || 0;
        totalDebit += b.gross_debit || 0;
        const isDebitNormal = acc.account_type === 'ASSET' || acc.account_type === 'EXPENSE';
        totalClosing += isDebitNormal ? (b.debit_balance || 0) : (b.credit_balance || 0);
      }
    });

    return {
      totalCredit,
      totalDebit,
      totalClosing,
      accountCount: accounts.length,
    };
  }, [accounts, balanceMap]);

  const handleRefresh = async () => {
    await Promise.all([refresh(), refetchBalances()]);
  };

  const handleNodePress = (node: AccountTreeNode) => {
    setSelectedNode(node);
    setDetailsSheetVisible(true);
  };

  const handleToggleStatus = async (node: AccountTreeNode) => {
    try {
      await toggleAccountStatus(node.id, node.is_active);
      Alert.alert(
        'Status Updated',
        `Account has been ${node.is_active ? 'deactivated' : 'activated'}.`,
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update account status.');
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
        {/* Page Header */}
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
              <Text style={styles.pageTitle}>Chart of Accounts & Balances</Text>
            </View>
            <Text style={styles.pageSubtitle}>
              Live financial balances, incoming credits, and expenses across accounts.
            </Text>
          </View>

          <AppButton
            title="Add Account"
            size="sm"
            onPress={() => setCreateModalVisible(true)}
            icon={<Plus size={15} color="#FFFFFF" />}
            style={styles.addButton}
          />
        </View>

        {/* Top KPI Financial Summary Cards */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <ArrowDownLeft size={16} color="#16A34A" />
            </View>
            <Text style={styles.kpiLabel}>TOTAL INCOMING</Text>
            <Text style={[styles.kpiValue, styles.kpiValueCredit]} numberOfLines={1}>
              {formatINR(summaryKpi.totalCredit, { noDecimals: true, compact: true })}
            </Text>
            <Text style={styles.kpiSub}>Credits / Receipts</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#FEF2F2' }]}>
              <ArrowUpRight size={16} color="#DC2626" />
            </View>
            <Text style={styles.kpiLabel}>TOTAL EXPENSES</Text>
            <Text style={[styles.kpiValue, styles.kpiValueDebit]} numberOfLines={1}>
              {formatINR(summaryKpi.totalDebit, { noDecimals: true, compact: true })}
            </Text>
            <Text style={styles.kpiSub}>Debits / Outgoing</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Scale size={16} color="#2563EB" />
            </View>
            <Text style={styles.kpiLabel}>NET BALANCE</Text>
            <Text style={[styles.kpiValue, styles.kpiValueClosing]} numberOfLines={1}>
              {formatINR(summaryKpi.totalClosing, { noDecimals: true, compact: true })}
            </Text>
            <Text style={styles.kpiSub}>{summaryKpi.accountCount} Accounts</Text>
          </View>
        </View>

        {/* Search & Filter Tabs */}
        <View style={styles.searchSection}>
          <AppSearchBar
            placeholder="Search account by name or code..."
            value={searchQuery}
            onSearch={setSearchQuery}
            containerStyle={styles.searchBar}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {CATEGORY_TABS.map(tab => {
              const isSelected = selectedCategory === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabChip, isSelected && styles.tabChipSelected]}
                  onPress={() => setSelectedCategory(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabChipText, isSelected && styles.tabChipTextSelected]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content Body */}
        {loading || balancesLoading ? (
          <View style={styles.skeletonContainer}>
            <SkeletonCard height={90} borderRadius={14} />
            <SkeletonCard height={90} borderRadius={14} />
            <SkeletonCard height={90} borderRadius={14} />
          </View>
        ) : error ? (
          <AppErrorState
            title="Unable to load chart of accounts"
            message={error}
            onRetry={handleRefresh}
          />
        ) : tree.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppEmptyState
              icon="📚"
              title="No Accounts Found"
              description={searchQuery ? 'No accounts match your search or filter.' : 'Create your first account to start tracking financial records.'}
              actionTitle="Add Account"
              onAction={() => setCreateModalVisible(true)}
            />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.treeScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={handleRefresh}
                tintColor={AdminColors.primary}
                colors={[AdminColors.primary]}
              />
            }
          >
            <AccountTree
              nodes={tree}
              onSelectNode={handleNodePress}
              balanceMap={balanceMap}
            />
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Create Account Modal */}
      <CreateAccountModal
        visible={createModalVisible}
        parentAccounts={accounts}
        defaultType={selectedCategory !== 'ALL' ? (selectedCategory as AccountType) : 'EXPENSE'}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={async payload => {
          await createAccount(payload);
          await handleRefresh();
          Alert.alert('Success', 'Account created successfully.');
        }}
      />

      {/* Account Details & Action Sheet */}
      <AccountDetailsSheet
        visible={detailsSheetVisible}
        account={selectedNode}
        onClose={() => setDetailsSheetVisible(false)}
        onViewLedger={node => {
          if (onViewAccountLedger) {
            onViewAccountLedger(node);
          }
        }}
        onToggleStatus={handleToggleStatus}
      />
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
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  pageHeaderText: {
    flex: 1,
    paddingRight: Spacing.sm,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2C59',
    letterSpacing: -0.2,
  },
  pageSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  addButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
  },
  kpiContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: 8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  kpiCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 2,
  },
  kpiValueCredit: {
    color: '#16A34A',
  },
  kpiValueDebit: {
    color: '#DC2626',
  },
  kpiValueClosing: {
    color: '#0F2C59',
  },
  kpiSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
  },
  searchSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    marginBottom: 8,
  },
  tabScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: Spacing.base,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  tabChipSelected: {
    backgroundColor: '#0F2C59',
    borderColor: '#0F2C59',
  },
  tabChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  skeletonContainer: {
    padding: Spacing.base,
    gap: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.base,
  },
  treeScrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl + 40,
  },
});
