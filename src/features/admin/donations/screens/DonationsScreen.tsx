import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Typography,
  Spacing,
  AppButton,
  AppEmptyState,
  AppErrorState,
  SkeletonCard,
  formatDate,
} from '../../../../core';
import {
  useDonations,
  useCreateDonation,
  useRefundDonation,
  computeLiveStats,
} from '../hooks/useDonations';
import {
  CreateDonationInput,
  DonationCategory,
  DonationRowModel,
  DonationStatus,
  DateRange,
} from '../types/donations.types';
import {
  DonationStats,
  DonationStatItem,
} from '../components/DonationStats';
import { DonationSearch } from '../components/DonationSearch';
import { DonationFilters } from '../components/DonationFilters';
import { DonationCard } from '../components/DonationCard';
import { DonationSummary } from '../components/DonationSummary';
import { DonationsTopBar } from '../components/DonationsTopBar';
import { DonationsBottomNav } from '../components/DonationsBottomNav';
import { DonationsDateSelector } from '../components/DonationsDateSelector';
import { DateRangePickerModal } from '../components/DateRangePickerModal';
import { AddDonationModal } from '../components/AddDonationModal';
import { DonationDetailsModal } from '../components/DonationDetailsModal';
import { navigateToReceipt, navigateToProfile } from '../navigation';
import {
  addPreviewDonation,
  filterPreviewRowsAdvanced,
  getPreviewStats,
  getPreviewTabCounts,
} from '../services/donations.preview';
import {
  DonationRow,
  DonationTableHeader,
  toDonationRowModel,
} from '../components/DonationRow';

interface TabItem {
  key: DonationCategory;
  label: string;
  count: number;
}

export const DonationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  // Wide viewports render the compact reference table; narrow phones
  // keep the stacked donation cards.
  const isWide = windowWidth >= 420;
  // Mobile: 2x2 stat grid like the approved reference; wide: 4-across.
  const statCardWidth = isWide
    ? Math.floor((windowWidth - 2 * Spacing.lg - 3 * Spacing.sm) / 4)
    : Math.floor((windowWidth - 2 * Spacing.lg - 3 * Spacing.sm) / 2);

  const [search, setSearch] = useState<string | null>(null);
  const [status, setStatus] = useState<DonationStatus | null>(null);
  const [activeTab, setActiveTab] = useState<DonationCategory>('ALL');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  // Modals state
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedRowForDetails, setSelectedRowForDetails] =
    useState<DonationRowModel | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewRefreshCount, setPreviewRefreshCount] = useState(0);

  // Queries & Mutations
  const {
    donations,
    rawDonations,
    total,
    isLoading,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage,
    error,
    refetch,
    fetchNextPage,
  } = useDonations({
    search,
    status,
    category: activeTab === 'ALL' ? null : activeTab,
    dateRange,
  });

  const createDonationMutation = useCreateDonation();
  const refundDonationMutation = useRefundDonation();

  // Fallback to preview data when API is unreachable or returned empty
  const previewMode = Boolean(error) && rawDonations.length === 0 && !isLoading;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Process rows
  const rows: DonationRowModel[] = useMemo(() => {
    if (previewMode) {
      return filterPreviewRowsAdvanced({
        tab: activeTab,
        search,
        status,
        from: dateRange.from,
        to: dateRange.to,
      });
    }
    return donations.map(toDonationRowModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    previewMode,
    activeTab,
    search,
    status,
    dateRange,
    donations,
    previewRefreshCount,
  ]);

  // Tab counts
  const tabCounts = useMemo(() => {
    if (previewMode) {
      return getPreviewTabCounts(dateRange);
    }
    return computeLiveStats(rawDonations, dateRange).counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewMode, rawDonations, dateRange, previewRefreshCount]);

  const tabs: TabItem[] = [
    { key: 'ALL', label: 'All', count: tabCounts.all },
    { key: 'ONE_TIME', label: 'One-time', count: tabCounts.oneTime },
    { key: 'RECURRING', label: 'Recurring', count: tabCounts.recurring },
    { key: 'OFFLINE', label: 'Offline', count: tabCounts.offline },
  ];

  // Statistics cards
  const stats: DonationStatItem[] = useMemo(() => {
    if (previewMode) {
      return getPreviewStats(dateRange);
    }
    return computeLiveStats(rawDonations, dateRange).stats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewMode, rawDonations, dateRange, previewRefreshCount]);

  // Pill label for the custom From–To date range (falls back to the
  // current month when no range is set).
  const dateRangeLabel = useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
    }
    if (dateRange.from) {
      return `From ${formatDate(dateRange.from)}`;
    }
    if (dateRange.to) {
      return `Until ${formatDate(dateRange.to)}`;
    }
    return undefined;
  }, [dateRange]);

  const handleRefresh = () => {
    refetch();
    setPreviewRefreshCount(c => c + 1);
  };

  const handleClearFilters = () => {
    setSearch(null);
    setStatus(null);
    setActiveTab('ALL');
  };

  const handleTabPress = (key: DonationCategory) => {
    setActiveTab(key);
  };

  // Opens the Receipt Details page for the selected donation (replaces
  // the old receipt popup).
  const handleViewReceipt = (row: DonationRowModel) => {
    navigateToReceipt(row.id);
  };

  const handleViewDetails = (row: DonationRowModel) => {
    setSelectedRowForDetails(row);
    setDetailsModalVisible(true);
  };

  const handleRefund = (row: DonationRowModel) => {
    Alert.alert(
      'Confirm Refund',
      `Are you sure you want to refund ₹${row.amount.toLocaleString(
        'en-IN',
      )} to ${row.donorName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!previewMode) {
                await refundDonationMutation.mutateAsync({
                  id: row.id,
                  reason: 'Admin initiated refund from Donations screen',
                });
              }
              showToast(`Refund processed for ${row.donorName}.`);
              handleRefresh();
            } catch {
              showToast('Unable to complete refund. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleAddDonation = async (input: CreateDonationInput) => {
    try {
      if (previewMode) {
        addPreviewDonation(input);
        setPreviewRefreshCount(c => c + 1);
        showToast(
          `Donation of ₹${input.amount.toLocaleString(
            'en-IN',
          )} recorded for ${input.donor_name}.`,
        );
      } else {
        await createDonationMutation.mutateAsync(input);
        showToast(
          `Donation of ₹${input.amount.toLocaleString(
            'en-IN',
          )} recorded for ${input.donor_name}.`,
        );
        refetch();
      }
    } catch {
      showToast('Error recording donation. Please check details and try again.');
    }
  };

  const activeStatusLabel = status
    ? status === 'SUCCESS'
      ? 'Completed'
      : status === 'PENDING'
      ? 'Pending'
      : status === 'REFUNDED'
      ? 'Refunded'
      : status
    : null;

  const isFiltered = Boolean(search || status || activeTab !== 'ALL');

  const renderHeader = () => (
    <View>
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <Text style={styles.pageTitle}>Donations</Text>
          <Text style={styles.pageSubtitle}>
            View and manage all donations received.
          </Text>
        </View>
        <View style={styles.pageHeaderControls}>
          <DonationsDateSelector
            label={dateRangeLabel}
            onPress={() => setDatePickerVisible(true)}
          />
          <AppButton
            title="Add Donation"
            size="md"
            icon={<Text style={styles.addIcon}>＋</Text>}
            onPress={() => setAddModalVisible(true)}
            style={styles.addButton}
          />
        </View>
      </View>

      <DonationStats
        stats={stats}
        loading={isLoading && !previewMode}
        cardWidth={statCardWidth}
        layout={isWide ? 'scroll' : 'grid'}
      />

      <DonationSearch
        value={search ?? ''}
        onSearch={setSearch}
        onFiltersPress={() => setFiltersVisible(true)}
      />

      <View style={styles.tabsRow}>
        {tabs.map((tab, index) => {
          const active = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                active && styles.tabActive,
                index === tabs.length - 1 && styles.tabLast,
              ]}
              onPress={() => handleTabPress(tab.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[styles.tabLabel, active && styles.tabLabelActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {`${tab.label} (${tab.count})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!previewMode ? (
        <View style={styles.summaryRow}>
          <DonationSummary
            total={total}
            statusLabel={activeStatusLabel}
            search={search}
          />
        </View>
      ) : (
        <Text style={styles.previewBanner}>
          Preview data — API unavailable.
        </Text>
      )}

      {isWide ? <DonationTableHeader /> : null}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading && !previewMode) {
      return (
        <View>
          {[0, 1, 2, 3, 4].map(index => (
            <SkeletonCard
              key={index}
              height={130}
              style={styles.listSkeleton}
            />
          ))}
        </View>
      );
    }

    if (error && !previewMode) {
      return (
        <AppErrorState
          title="Unable to load donations."
          message="Please check your connection and try again."
          onRetry={handleRefresh}
          retryTitle="Retry"
        />
      );
    }

    return (
      <AppEmptyState
        title="No Donations Found"
        description="Try changing your search or filters."
        icon="🔍"
        actionTitle={isFiltered ? 'Clear Filters' : undefined}
        onAction={isFiltered ? handleClearFilters : undefined}
      />
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBarHost}>
        <DonationsTopBar
          paddingTop={insets.top}
          onMenuPress={() => showToast('Menu')}
          onBellPress={() => showToast('You have 3 notifications')}
          onProfilePress={navigateToProfile}
        />
      </View>

      {toastMessage && (
        <View style={[styles.toastContainer, { top: insets.top + 70 }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <FlatList
        style={styles.list}
        data={rows}
        keyExtractor={item => item.id}
        renderItem={({ item }) =>
          isWide ? (
            <View style={styles.tableRowWrap}>
              <DonationRow
                row={item}
                variant="table"
                onViewDetails={handleViewDetails}
                onViewReceipt={handleViewReceipt}
                onRefund={handleRefund}
              />
            </View>
          ) : (
            <DonationCard
              row={item}
              onViewDetails={handleViewDetails}
              onViewReceipt={handleViewReceipt}
              onRefund={handleRefund}
            />
          )
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isFetchingNextPage && !previewMode ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator
                size="small"
                color={AdminColors.primary}
              />
            </View>
          ) : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing && !previewMode}
            onRefresh={handleRefresh}
            tintColor={AdminColors.primary}
            colors={[AdminColors.primary]}
          />
        }
        onEndReached={() => {
          if (!previewMode && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: insets.top + 81,
            paddingBottom: insets.bottom + 79,
          },
        ]}
      />

      <View style={styles.bottomNavHost}>
        <DonationsBottomNav
          bottomInset={insets.bottom}
          activeKey="donations"
          onTabPress={key => {
            if (key === 'donations') {
              handleRefresh();
            } else {
              showToast(`${key.replace('_', ' ').toUpperCase()} tab`);
            }
          }}
        />
      </View>

      <DonationFilters
        visible={filtersVisible}
        selectedStatus={status}
        selectedCategory={activeTab === 'ALL' ? null : activeTab}
        onClose={() => setFiltersVisible(false)}
        onApply={({ status: appliedStatus, category: appliedCategory }) => {
          setStatus(appliedStatus);
          if (appliedCategory) {
            setActiveTab(appliedCategory);
          }
          setFiltersVisible(false);
        }}
      />

      <DateRangePickerModal
        visible={datePickerVisible}
        from={dateRange.from}
        to={dateRange.to}
        onApply={range => setDateRange(range)}
        onClose={() => setDatePickerVisible(false)}
      />

      <AddDonationModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={handleAddDonation}
        isSubmitting={createDonationMutation.isPending}
      />

      <DonationDetailsModal
        visible={detailsModalVisible}
        row={selectedRowForDetails}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedRowForDetails(null);
        }}
        onViewReceipt={handleViewReceipt}
        onRefund={handleRefund}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  topBarHost: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
  bottomNavHost: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
  toastContainer: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 99,
    elevation: 20,
    backgroundColor: AdminColors.primaryDark,
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  toastText: {
    ...Typography.secondaryMedium,
    color: AdminColors.textOnDark,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  tableRowWrap: {
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.divider,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  pageHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  pageHeaderText: {
    flex: 1,
    minWidth: 150,
    marginRight: Spacing.sm,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: AdminColors.primaryDark,
  },
  pageSubtitle: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginTop: 3,
  },
  pageHeaderControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    marginLeft: Spacing.sm,
    minHeight: 44,
    borderRadius: BorderRadius.lg,
  },
  addIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  tabsRow: {
    flexDirection: 'row',
    marginVertical: Spacing.base,
  },
  tab: {
    flex: 1,
    backgroundColor: AdminColors.divider,
    borderRadius: BorderRadius.lg,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginRight: 6,
  },
  tabLast: {
    marginRight: 0,
  },
  tabActive: {
    backgroundColor: AdminColors.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AdminColors.primary,
  },
  tabLabelActive: {
    color: AdminColors.textOnDark,
    fontWeight: '700',
  },
  summaryRow: {
    marginBottom: Spacing.sm,
  },
  previewBanner: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    marginTop: Spacing.sm,
  },
  listSkeleton: {
    marginBottom: Spacing.sm,
  },
  footerLoader: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
});

export default DonationsScreen;