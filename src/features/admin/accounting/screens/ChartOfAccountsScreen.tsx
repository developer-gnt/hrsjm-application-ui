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
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import {
  AppButton,
  AppEmptyState,
  AppErrorState,
  AppSearchBar,
  SkeletonCard,
} from '../../../../core/components';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { useAccounts } from '../hooks/useAccounts';
import { AccountTree } from '../components/AccountTree';
import { CreateAccountModal } from '../components/CreateAccountModal';
import { AccountDetailsSheet } from '../components/AccountDetailsSheet';
import type {
  AccountCategory,
  AccountTreeNode,
  AccountType,
} from '../types/accounting.types';

interface ChartOfAccountsScreenProps {
  onBack?: () => void;
  onViewAccountLedger?: (account: AccountTreeNode) => void;
  onNavigate?: (target: string) => void;
}

const CATEGORY_TABS: Array<{ key: AccountCategory; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'ASSET', label: 'Assets' },
  { key: 'LIABILITY', label: 'Liabilities' },
  { key: 'FUND_EQUITY', label: 'Equity' },
  { key: 'INCOME', label: 'Income' },
  { key: 'EXPENSE', label: 'Expenses' },
];

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
                <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.backChevron}>‹</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.pageTitle}>Chart of Accounts</Text>
            </View>
            <Text style={styles.pageSubtitle}>
              Hierarchical organizational accounts and general ledger structure.
            </Text>
          </View>

          <AppButton
            title="Add Account"
            size="sm"
            onPress={() => setCreateModalVisible(true)}
            icon={<Text style={styles.addIcon}>+</Text>}
            style={styles.addButton}
          />
        </View>

        {/* Search & Filter Tabs */}
        <View style={styles.searchSection}>
          <AppSearchBar
            placeholder="Search account by name or code..."
            value={searchQuery}
            onSearch={setSearchQuery}
            containerStyle={styles.searchBar}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
            {CATEGORY_TABS.map(tab => {
              const isSelected = selectedCategory === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabChip, isSelected && styles.tabChipSelected]}
                  onPress={() => setSelectedCategory(tab.key)}
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
        {loading ? (
          <View style={styles.skeletonContainer}>
            <SkeletonCard height={60} borderRadius={8} />
            <SkeletonCard height={60} borderRadius={8} />
            <SkeletonCard height={60} borderRadius={8} />
            <SkeletonCard height={60} borderRadius={8} />
          </View>
        ) : error ? (
          <AppErrorState
            title="Unable to load chart of accounts"
            message={error}
            onRetry={refresh}
          />
        ) : tree.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppEmptyState
              icon="📚"
              title="No Accounts Found"
              description={searchQuery ? 'No accounts match your search.' : 'Create your first account.'}
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
                onRefresh={refresh}
                tintColor={AdminColors.primary}
                colors={[AdminColors.primary]}
              />
            }
          >
            <AccountTree nodes={tree} onSelectNode={handleNodePress} />
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
    paddingRight: 4,
  },
  backChevron: {
    fontSize: 26,
    color: '#0F2C59',
    fontWeight: '300',
    marginTop: -4,
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
  addIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  addButton: {
    height: 36,
    paddingHorizontal: 12,
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
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  tabChipSelected: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
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
    paddingBottom: Spacing.xxl + 20,
  },
});
