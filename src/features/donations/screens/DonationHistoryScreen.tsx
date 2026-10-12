import React, { useMemo, useState } from 'react';
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
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminTopBar } from '../../../core/components/admin/AdminTopBar';
import { Icon } from '../../../core/components/common/Icon';
import { AppEmptyState } from '../../../core/components/common/AppEmptyState';
import { colors, serif, spacing, radius } from '../../../core/theme/theme';
import type { AppStackParamList, TabsParamList } from '../../../core/navigation/types';
import { MOCK_DONATION_RECORDS } from '../data/donations.mock';
import type {
  DonationFilterState,
  DonationFilterTab,
  DonationRecord,
  DonationStatus,
} from '../types/donation.types';
import { DonationHistoryCard } from '../components/DonationHistoryCard';
import { DonationFilterSheet } from '../components/DonationFilterSheet';
import { DonationListSkeleton } from '../components/DonationCardSkeleton';
import { DonationHeaderBanner } from '../components/DonationHeaderBanner';

type TabProps = BottomTabScreenProps<TabsParamList, 'DonationSeekersTab'>;
type NavProp = CompositeNavigationProp<
  TabProps['navigation'],
  NativeStackNavigationProp<AppStackParamList>
>;

const INITIAL_FILTERS: DonationFilterState = {
  status: 'ALL',
};

export function DonationHistoryScreen() {
  const navigation = useNavigation<NavProp>();
  const [activeTab, setActiveTab] = useState<DonationFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<DonationFilterState>(INITIAL_FILTERS);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter donations: only personal donations (type === 'Donation') appear in Donation History
  const donationRecords = useMemo(
    () => MOCK_DONATION_RECORDS.filter(item => item.type === 'Donation'),
    []
  );

  // Compute active filters count (excluding default status 'ALL')
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status !== 'ALL') count++;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    if (filters.category && filters.category !== 'All Causes') count++;
    if (filters.minAmount !== undefined) count++;
    if (filters.maxAmount !== undefined) count++;
    return count;
  }, [filters]);

  // Compute total contributed amount from completed records
  const totalDonationAmount = useMemo(() => {
    return donationRecords
      .filter(d => d.status === 'Completed')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [donationRecords]);

  // Dynamic counts for status tabs based on the dataset
  const tabCounts = useMemo(() => {
    const all = donationRecords.length;
    const completed = donationRecords.filter(d => d.status === 'Completed').length;
    const pending = donationRecords.filter(d => d.status === 'Pending').length;
    const failed = donationRecords.filter(d => d.status === 'Failed').length;
    return { all, completed, pending, failed };
  }, [donationRecords]);

  // Tab definitions
  const tabs: Array<{ key: DonationFilterTab; label: string; count: number }> = [
    { key: 'ALL', label: 'All', count: tabCounts.all },
    { key: 'Completed', label: 'Completed', count: tabCounts.completed },
    { key: 'Pending', label: 'Pending', count: tabCounts.pending },
    { key: 'Failed', label: 'Failed', count: tabCounts.failed },
  ];

  // Combined filtering: Tab + Search + Filters
  const filteredDonations = useMemo(() => {
    return donationRecords.filter(item => {
      // 1. Status Tab filter (quick tabs)
      if (activeTab !== 'ALL' && item.status !== activeTab) {
        return false;
      }

      // 2. Sheet Status filter (if set specifically in modal)
      if (filters.status && filters.status !== 'ALL' && item.status !== filters.status) {
        return false;
      }

      // 3. Category / Cause filter
      if (filters.category && filters.category !== 'All Causes') {
        if (
          item.category.toLowerCase() !== filters.category.toLowerCase() &&
          item.cause.toLowerCase() !== filters.category.toLowerCase()
        ) {
          return false;
        }
      }

      // 4. Amount Range
      if (filters.minAmount !== undefined && item.amount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount !== undefined && item.amount > filters.maxAmount) {
        return false;
      }

      // 5. Date Range (supports DD Mon YYYY or YYYY-MM-DD or partial search)
      if (filters.fromDate && item.isoDate < filters.fromDate) {
        return false;
      }
      if (filters.toDate && item.isoDate > filters.toDate) {
        return false;
      }

      // 6. Search Query (cause/title, receipt number, date, amount)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCause = item.cause.toLowerCase().includes(query);
        const matchesReceipt = item.receiptNo.toLowerCase().includes(query);
        const matchesDate = item.dateTime.toLowerCase().includes(query);
        const matchesAmount = item.amount.toString().includes(query);
        if (
          !matchesTitle &&
          !matchesCause &&
          !matchesReceipt &&
          !matchesDate &&
          !matchesAmount
        ) {
          return false;
        }
      }

      return true;
    });
  }, [donationRecords, activeTab, filters, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleApplyFilters = (newFilters: DonationFilterState) => {
    setFilters(newFilters);
    // If modal status was changed, synchronize with quick tab
    if (newFilters.status) {
      setActiveTab(newFilters.status);
    }
    setFilterSheetVisible(false);
  };

  const handleClearAll = () => {
    setFilters(INITIAL_FILTERS);
    setActiveTab('ALL');
    setSearchQuery('');
  };

  const handleCardPress = (donation: DonationRecord) => {
    navigation.navigate('DonationDetail', { donationId: donation.id });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminTopBar />

      {loading ? (
        <View style={styles.skeletonContainer}>
          <DonationListSkeleton count={5} />
        </View>
      ) : (
        <FlatList
          data={filteredDonations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <DonationHistoryCard
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
              {/* Dynamic Header Image Banner */}
              <DonationHeaderBanner
                title="Donation History"
                subtitle="Track your contributions & social justice impact."
                totalDonations={donationRecords.length}
                totalAmount={totalDonationAmount}
              />

              {/* Search and Filter Row */}
              <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                  <Icon name="search" size={18} color={colors.textMuted} strokeWidth={2} />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by cause, date or amount..."
                    placeholderTextColor={colors.textMuted}
                    accessibilityLabel="Search donations"
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
                      ? `Filter donations, ${activeFilterCount} active filters`
                      : 'Filter donations'
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

              {/* Status Pills Row */}
              <View style={styles.tabsRow}>
                {tabs.map(tab => {
                  const active = tab.key === activeTab;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => {
                        setActiveTab(tab.key);
                        setFilters(prev => ({ ...prev, status: tab.key }));
                      }}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`${tab.label}, ${tab.count} items`}
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
                title="No Donations Found"
                message={
                  searchQuery.length > 0
                    ? `No donations found matching "${searchQuery}".`
                    : 'There are no donation records matching your current filters.'
                }
                actionLabel="Clear All Filters"
                onAction={handleClearAll}
              />
            </View>
          }
        />
      )}

      {/* Filter Bottom Sheet Modal */}
      <DonationFilterSheet
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
  headerSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  tabPill: {
    flex: 1,
    minHeight: 36,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabPillText: {
    fontSize: 12,
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

export default DonationHistoryScreen;
