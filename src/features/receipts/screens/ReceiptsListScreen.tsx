import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminHeader } from '../../../app/navigation/AdminHeader';
import { Icon } from '../../../core/components/common/Icon';
import { AppEmptyState } from '../../../core/components/common/AppEmptyState';
import { colors, serif, spacing, radius } from '../../../core/theme/theme';
import type { AppStackParamList } from '../../../core/navigation/types';
import { receiptsService } from '../services/receipts.service';
import type {
  DonationRecord,
  ReceiptFilterState,
  ReceiptFilterTab,
} from '../../donations/types/donation.types';
import { ReceiptCard } from '../components/ReceiptCard';
import { ReceiptFilterSheet } from '../components/ReceiptFilterSheet';
import { DonationListSkeleton } from '../../donations/components/DonationCardSkeleton';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

const INITIAL_RECEIPT_FILTERS: ReceiptFilterState = {
  type: 'ALL',
  status: 'ALL',
};

export function ReceiptsListScreen() {
  const navigation = useNavigation<NavProp>();
  const [receipts, setReceipts] = useState<DonationRecord[]>([]);
  const [activeTab, setActiveTab] = useState<ReceiptFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ReceiptFilterState>(INITIAL_RECEIPT_FILTERS);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadReceipts = useCallback(async () => {
    try {
      const data = await receiptsService.getMyReceipts();
      setReceipts(data);
    } catch (err) {
      console.warn('Error loading receipts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  // Dynamic counts for receipt document types
  const tabCounts = useMemo(() => {
    const all = receipts.length;
    const membership = receipts.filter(
      r => r.type === 'Membership'
    ).length;
    const renewal = receipts.filter(
      r => r.type === 'Renewal'
    ).length;
    const donation = receipts.filter(
      r => r.type === 'Donation'
    ).length;
    return { all, membership, renewal, donation };
  }, [receipts]);

  const tabs: Array<{ key: ReceiptFilterTab; label: string; count: number }> = [
    { key: 'ALL', label: 'All', count: tabCounts.all },
    { key: 'Membership', label: 'Membership', count: tabCounts.membership },
    { key: 'Renewal', label: 'Renewal', count: tabCounts.renewal },
    { key: 'Donation', label: 'Donation', count: tabCounts.donation },
  ];

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type && filters.type !== 'ALL') count++;
    if (filters.status && filters.status !== 'ALL') count++;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    if (filters.paymentMethod && filters.paymentMethod !== 'All Payment Methods') count++;
    if (filters.minAmount !== undefined) count++;
    if (filters.maxAmount !== undefined) count++;
    return count;
  }, [filters]);

  // Combined Filter evaluation
  const filteredReceipts = useMemo(() => {
    return receipts.filter(item => {
      // 1. Quick Tabs
      if (activeTab === 'Membership' && item.type !== 'Membership') {
        return false;
      }
      if (activeTab === 'Renewal' && item.type !== 'Renewal') {
        return false;
      }
      if (activeTab === 'Donation' && item.type !== 'Donation') {
        return false;
      }

      // 2. Sheet Type
      if (filters.type && filters.type !== 'ALL' && item.type !== filters.type) {
        return false;
      }

      // 3. Status
      if (filters.status && filters.status !== 'ALL' && item.status !== filters.status) {
        return false;
      }

      // 4. Payment Method
      if (
        filters.paymentMethod &&
        filters.paymentMethod !== 'All Payment Methods' &&
        item.paymentMethod.toLowerCase() !== filters.paymentMethod.toLowerCase()
      ) {
        return false;
      }

      // 5. Amount Range
      if (filters.minAmount !== undefined && item.amount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount !== undefined && item.amount > filters.maxAmount) {
        return false;
      }

      // 6. Date Range
      if (filters.fromDate && item.isoDate < filters.fromDate) {
        return false;
      }
      if (filters.toDate && item.isoDate > filters.toDate) {
        return false;
      }

      // 7. Search Query (receipt no., type, date, cause, or amount)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesReceipt = item.receiptNo.toLowerCase().includes(query);
        const matchesType = item.type.toLowerCase().includes(query);
        const matchesDate = item.dateTime.toLowerCase().includes(query);
        const matchesCause = item.cause.toLowerCase().includes(query);
        const matchesPayment = item.paymentMethod.toLowerCase().includes(query);
        const matchesAmount = item.amount.toString().includes(query);

        if (
          !matchesReceipt &&
          !matchesType &&
          !matchesDate &&
          !matchesCause &&
          !matchesPayment &&
          !matchesAmount
        ) {
          return false;
        }
      }

      return true;
    });
  }, [receipts, activeTab, filters, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReceipts();
  };

  const handleApplyFilters = (newFilters: ReceiptFilterState) => {
    setFilters(newFilters);
    if (newFilters.type) {
      setActiveTab(newFilters.type);
    }
    setFilterSheetVisible(false);
  };

  const handleClearAll = () => {
    setFilters(INITIAL_RECEIPT_FILTERS);
    setActiveTab('ALL');
    setSearchQuery('');
  };

  const handleCardPress = (record: DonationRecord) => {
    navigation.navigate('ReceiptDetail', {
      receiptNo: record.receiptNo,
      record,
      fromScreen: 'ReceiptsList',
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader />

      {loading ? (
        <View style={styles.skeletonContainer}>
          <DonationListSkeleton count={5} />
        </View>
      ) : (
        <FlatList
          data={filteredReceipts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ReceiptCard
              item={item}
              onPress={() => handleCardPress(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerSection}>
              {/* Title & Subtitle */}
              <View style={styles.titleWrap}>
                <Text style={styles.title}>Receipts List</Text>
                <Text style={styles.subtitle}>
                  View and manage all your membership and donation receipts.
                </Text>
              </View>

              {/* Transaction History Banner */}
              <TouchableOpacity
                style={styles.txnHistoryBanner}
                onPress={() => (navigation as any).navigate('TransactionHistory')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="View Transaction History"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.txnHistoryIconWrap}>
                    <Icon name="clock" size={18} color="#0B2F52" />
                  </View>
                  <View>
                    <Text style={styles.txnHistoryTitle}>Transaction History</Text>
                    <Text style={styles.txnHistorySubtitle}>
                      View complete payment logs & audit trail
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={18} color="#0B2F52" />
              </TouchableOpacity>

              {/* Search and Filter Row */}
              <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                  <Icon name="search" size={18} color={colors.textMuted} strokeWidth={2} />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by receipt no., type or date..."
                    placeholderTextColor={colors.textMuted}
                    accessibilityLabel="Search receipts"
                    returnKeyType="search"
                    autoCorrect={false}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      accessibilityRole="button"
                      accessibilityLabel="Clear search"
                      style={styles.clearBtn}>
                      <Text style={styles.clearBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => setFilterSheetVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    activeFilterCount > 0
                      ? `Filter receipts, ${activeFilterCount} active filters`
                      : 'Filter receipts'
                  }
                  style={[
                    styles.filterButton,
                    activeFilterCount > 0 && styles.filterButtonActive,
                  ]}>
                  <Icon
                    name="filter"
                    size={20}
                    color={activeFilterCount > 0 ? colors.white : colors.primary}
                    strokeWidth={2}
                  />
                  {activeFilterCount > 0 && (
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Document Type Tabs Row */}
              <View style={styles.tabsRow}>
                {tabs.map(tab => {
                  const active = tab.key === activeTab;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => {
                        setActiveTab(tab.key);
                        setFilters(prev => ({ ...prev, type: tab.key }));
                      }}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`${tab.label}, ${tab.count} receipts`}
                      style={[styles.tabPill, active && styles.tabPillActive]}>
                      <Text
                        style={[
                          styles.tabPillText,
                          active && styles.tabPillTextActive,
                        ]}
                        numberOfLines={1}>
                        {tab.label} ({tab.count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <AppEmptyState
                title="No Receipts Found"
                message={
                  searchQuery.length > 0
                    ? `No receipts found matching "${searchQuery}".`
                    : 'You do not have any receipts yet. When you purchase a membership or make a donation, your official receipts will appear here.'
                }
                actionLabel={searchQuery.length > 0 ? 'Clear All Filters' : undefined}
                onAction={searchQuery.length > 0 ? handleClearAll : undefined}
              />
            </View>
          }
        />
      )}

      {/* Filter Bottom Sheet Modal */}
      <ReceiptFilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onClear={handleClearAll}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.card,
  },
  skeletonContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    backgroundColor: colors.background,
    minHeight: '100%',
  },
  txnHistoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: '#E9B82E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  txnHistoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnHistoryTitle: {
    fontFamily: 'Inter',
    fontSize: 13.5,
    fontWeight: '700',
    color: '#06294D',
  },
  txnHistorySubtitle: {
    fontFamily: 'Inter',
    fontSize: 11.5,
    color: '#718096',
    marginTop: 1,
  },
  headerSection: {
    paddingVertical: spacing.lg,
  },
  titleWrap: {
    marginBottom: spacing.md,
  },
  title: {
    ...serif,
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accentGold,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    color: '#011F39',
    fontSize: 10,
    fontWeight: '800',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tabPill: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.primary,
  },
  tabPillTextActive: {
    color: colors.white,
  },
  emptyWrap: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
});

export default ReceiptsListScreen;
