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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminTopBar } from '../../../core/components/admin/AdminTopBar';
import { Icon } from '../../../core/components/common/Icon';
import { AppEmptyState } from '../../../core/components/common/AppEmptyState';
import { colors, serif, spacing, radius } from '../../../core/theme/theme';
import type { AppStackParamList, TabsParamList } from '../../../core/navigation/types';
import { apiClient } from '../../../core/api/client';
import { cashfreeApi } from '../../payments/api/cashfree.api';
import { receiptsService } from '../../receipts/services/receipts.service';
import { recentDonationsStore } from '../services/recent-donations.store';
import { amountToWords } from '../../../core/utils/format';
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

export interface DonationHistoryScreenProps {
  customHeader?: React.ReactNode;
  onNavigateHome?: () => void;
  onNavigateDonate?: () => void;
}

export function DonationHistoryScreen({
  customHeader,
  onNavigateHome,
  onNavigateDonate,
}: DonationHistoryScreenProps = {}) {
  const navigation = useNavigation<NavProp>();
  const [activeTab, setActiveTab] = useState<DonationFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<DonationFilterState>(INITIAL_FILTERS);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donationRecords, setDonationRecords] = useState<DonationRecord[]>([]);

  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>('/donation-payments');
      const rawItems = res?.data?.items || (res as any)?.items || [];

      // 1. Verify any pending payments with Cashfree
      const pendingItems = rawItems.filter(
        (it: any) => it.payment_status === 'PENDING' && it.gateway_order_id,
      );

      if (pendingItems.length > 0) {
        await Promise.allSettled(
          pendingItems.map(async (it: any) => {
            try {
              const vRes = await cashfreeApi.verifyOrder(it.gateway_order_id);
              if (
                vRes?.status === 'SUCCESS' ||
                (vRes as any)?.payment?.payment_status === 'SUCCESS'
              ) {
                it.payment_status = 'SUCCESS';
              } else {
                it.payment_status = 'FAILED';
              }
            } catch {
              it.payment_status = 'FAILED';
            }
          }),
        );
      }

      // Any remaining pending item without order or unconfirmed is marked FAILED
      for (const it of rawItems) {
        if (it.payment_status === 'PENDING') {
          it.payment_status = 'FAILED';
        }
      }

      let realRecords: DonationRecord[] = [];
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        realRecords = rawItems.map((item: any) => {
          const dDate = new Date(item.created_at);
          const dateStr = !isNaN(dDate.getTime())
            ? dDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Recent';
          const timeStr = !isNaN(dDate.getTime())
            ? dDate.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
            : '';
          const amt = Number(item.amount) || 0;
          return {
            id: item.id,
            receiptNo: item.gateway_order_id || `REC-${item.id.slice(0, 8).toUpperCase()}`,
            type: 'Donation' as const,
            title: item.donation?.cause || 'HRSJM Donation',
            cause: item.donation?.cause || 'Social Justice & Human Rights Support',
            category: 'Donation',
            description: item.donation?.remark || `Donation contribution of ₹${amt.toLocaleString('en-IN')}`,
            amount: amt,
            amountInWords: amountToWords(amt),
            date: dateStr,
            time: timeStr,
            dateTime: `${dateStr}${timeStr ? `, ${timeStr}` : ''}`,
            isoDate: !isNaN(dDate.getTime()) ? dDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: item.payment_status === 'SUCCESS' ? 'Completed' : 'Failed',
            paymentMethod: item.payment_method || 'Online',
            transactionId: item.gateway_payment_id || item.gateway_order_id || item.id,
            donorName: item.donation?.donor_name || 'Donor',
            donorEmail: item.donation?.donor_email,
            donorPhone: item.donation?.donor_mobile,
            imageType: 'education' as const,
          };
        });
      }

      try {
        const receipts = await receiptsService.getMyReceipts();
        const donationReceipts = receipts.filter(r => r.type === 'Donation');
        for (const dr of donationReceipts) {
          if (!realRecords.some(r => r.id === dr.id || (dr.transactionId && r.transactionId === dr.transactionId))) {
            realRecords.push(dr);
          }
        }
      } catch {}

      // Merge with live donations made in the active session
      const recentLive = recentDonationsStore.getRecentDonations();
      for (const rd of recentLive) {
        if (!realRecords.some(r => r.id === rd.id || (rd.transactionId && r.transactionId === rd.transactionId))) {
          realRecords.unshift(rd);
        }
      }

      if (realRecords.length > 0) {
        setDonationRecords(realRecords);
      } else {
        setDonationRecords(MOCK_DONATION_RECORDS.filter(item => item.type === 'Donation'));
      }
    } catch (err) {
      setDonationRecords(MOCK_DONATION_RECORDS.filter(item => item.type === 'Donation'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Live polling whenever screen is in focus: instant refresh on tab focus + 3s ticker
  useFocusEffect(
    useCallback(() => {
      loadDonations();
      const ticker = setInterval(() => {
        loadDonations();
      }, 3500);
      return () => clearInterval(ticker);
    }, [loadDonations]),
  );

  // Instant update whenever a new donation is recorded in the session
  useEffect(() => {
    return recentDonationsStore.subscribe(() => {
      loadDonations();
    });
  }, [loadDonations]);

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
    const failed = donationRecords.filter(d => d.status === 'Failed').length;
    return { all, completed, failed };
  }, [donationRecords]);

  // Tab definitions: All, Done (Completed), Failed
  const tabs: Array<{ key: DonationFilterTab; label: string; count: number }> = [
    { key: 'ALL', label: 'All', count: tabCounts.all },
    { key: 'Completed', label: 'Done', count: tabCounts.completed },
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
    loadDonations();
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
    (navigation as any).navigate('DonationDetail', { donationId: donation.id, donation });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {customHeader ? customHeader : <AdminTopBar />}

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
                title={searchQuery.length > 0 || activeFilterCount > 0 ? "No Matching Donations" : "No Donation Payments Yet"}
                message={
                  searchQuery.length > 0
                    ? `No donations found matching "${searchQuery}".`
                    : activeFilterCount > 0
                    ? 'There are no donation records matching your current filters.'
                    : "You haven't made any donation payments yet. Your contributions help support human rights and community aid."
                }
                actionLabel={searchQuery.length > 0 || activeFilterCount > 0 ? "Clear All Filters" : "Donate Now"}
                onAction={
                  searchQuery.length > 0 || activeFilterCount > 0
                    ? handleClearAll
                    : (onNavigateDonate || (() => (navigation as any).navigate('UserActionPage', { pageId: 'donate' })))
                }
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
    color: '#011F39',
    fontSize: 10,
    fontWeight: '800',
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
