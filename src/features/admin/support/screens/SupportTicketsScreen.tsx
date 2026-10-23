import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppSearchBar } from '../../../../core/components/common/AppSearchBar';
import { SkeletonList } from '../../../../core/components/common/AppSkeleton';
import { AdminFilterTabs } from '../../../../core/components/admin/AdminFilterTabs';
import { useAuth } from '../../../../core/auth/AuthContext';
import { BrandColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { Plus, ListFilter, Filter, X, MessageSquare, SearchX } from '../../../../core/components/icons';
import type { AppStackParamList, TabsParamList } from '../../../../core/navigation/types';
import { TicketCard } from '../components/TicketCard';
import { TicketFilters } from '../components/TicketFilters';
import { TicketStatsRow } from '../components/TicketStats';
import { CreateTicketModal } from '../components/CreateTicketModal';
import { TICKET_TABS } from '../support.utils';
import { useSupportTickets } from '../hooks/useSupportTickets';
import { AppEmptyState, AppErrorState, AppPagination } from '../../../../core';
import Svg, { Path } from 'react-native-svg';

function EmptyTicketIllustration() {
  return (
    <Svg width={72} height={60} viewBox="0 0 72 60" fill="none">
      {/* 3 Radiating Burst Lines at top */}
      <Path d="M36 4V10" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />
      <Path d="M25 7L28 12" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />
      <Path d="M47 7L44 12" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />

      {/* Ticket Body with side notches tilted ~-8 deg */}
      <Path
        d="M21 21 C21 18 23 16 26 16 L46 16 C49 16 51 18 51 21 L51 25.5 C48.8 25.5 47 27.3 47 29.5 C47 31.7 48.8 33.5 51 33.5 L51 38 C51 41 49 43 46 43 L26 43 C23 43 21 41 21 38 L21 33.5 C23.2 33.5 25 31.7 25 29.5 C25 27.3 23.2 25.5 21 25.5 Z"
        stroke="#475569"
        strokeWidth="2.4"
        strokeLinejoin="round"
        fill="#FFFFFF"
        transform="rotate(-8 36 30)"
      />
      {/* Dashed line inside ticket */}
      <Path
        d="M36 19 L36 40"
        stroke="#94A3B8"
        strokeWidth="2"
        strokeDasharray="2 3"
        strokeLinecap="round"
        transform="rotate(-8 36 30)"
      />
    </Svg>
  );
}

type TabProps = BottomTabScreenProps<TabsParamList, 'ComplaintsTab'>;
type NavProp = CompositeNavigationProp<
  TabProps['navigation'],
  NativeStackNavigationProp<AppStackParamList>
>;

export function SupportTicketsScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isNarrow = width < 420;

  const {
    filteredItems,
    stats,
    statsLoading,
    activeTab,
    searchQuery,
    initialLoading,
    refreshing,
    loadingMore,
    error,
    filterState,
    activeFiltersCount,
    setSearchQuery,
    setActiveTab,
    applyFilters,
    refresh,
    loadMore,
    clearFilters,
  } = useSupportTickets();

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const paginatedItems = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, page, pageSize]);

  // Reset to page 1 on filter/tab changes
  React.useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, filterState]);

  if (!user) {
    return (
      <View style={styles.flex}>
        <AdminHeader />
        <View style={styles.center}>
          <AppEmptyState
            title="Sign In Required"
            message="Please log in to review and submit support tickets."
          />
        </View>
      </View>
    );
  }

  // 4 Authorized tabs per wireframe & Master Prompt: All, Open, In Progress, Resolved
  const tabs = TICKET_TABS.filter(tab => tab.key !== 'CLOSED').map(tab => ({
    ...tab,
    count:
      tab.key === 'ALL'
        ? stats.total
        : tab.key === 'SUBMITTED'
          ? stats.open
          : tab.key === 'UNDER_REVIEW'
            ? stats.inProgress
            : stats.resolved,
  }));

  const hasActiveFilterChips =
    (filterState.category && filterState.category !== 'ALL') ||
    (filterState.dateRange && filterState.dateRange !== 'ALL');

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    activeTab !== 'ALL' ||
    hasActiveFilterChips;

  return (
    <View style={styles.flex}>
      <AdminHeader />

      <FlatList
        style={styles.list}
        data={paginatedItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <TicketCard
              ticket={item}
              onPress={() => navigation.navigate('TicketDetails', { ticketId: item.id })}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={BrandColors.navy}
            colors={[BrandColors.navy]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View>
            {/* Page Context Banner & Action Header matching Donation Seekers layout */}
            <View style={styles.headerArea}>
              <View style={styles.titleRow}>
                <View style={styles.titleBlock}>
                  <Text style={styles.pageTitle}>Complaints & Support</Text>
                  <Text style={styles.pageSubtitle}>
                    Review, track and resolve support tickets.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setCreateModalVisible(true)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="New Complaint"
                >
                  <Text style={styles.addButtonPlus}>+</Text>
                  <Text style={styles.addButtonText}>New Complaint</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4-Column Executive KPI Cards */}
            <TicketStatsRow stats={stats} loading={statsLoading} />

            {/* Search and Filters Bar */}
            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <AppSearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by ticket ID, subject..."
                  containerStyle={styles.searchBarContainer}
                  inputStyle={styles.searchBarInput}
                />
              </View>
              <TouchableOpacity
                onPress={() => setFiltersVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Open filters"
                style={styles.filtersButton}
                activeOpacity={0.85}
              >
                <Filter
                  size={16}
                  color="#06294D"
                  strokeWidth={2.2}
                />
                <Text style={styles.filtersText}>
                  Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Active Filter Chips Banner */}
            {hasActiveFilterChips ? (
              <View style={styles.activeFilterPillsRow}>
                {filterState.category && filterState.category !== 'ALL' ? (
                  <View style={styles.filterPill}>
                    <Text style={styles.filterPillText}>
                      Category: {filterState.category}
                    </Text>
                  </View>
                ) : null}
                {filterState.dateRange && filterState.dateRange !== 'ALL' ? (
                  <View style={styles.filterPill}>
                    <Text style={styles.filterPillText}>
                      Period: {filterState.dateRange}
                    </Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  onPress={clearFilters}
                  style={styles.clearAllBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearAllText}>Clear</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Status Filter Tabs matching reference screenshot */}
            <View style={styles.tabsContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={tabs}
                keyExtractor={item => item.key}
                contentContainerStyle={styles.tabsRow}
                renderItem={({ item: tab }) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setActiveTab(tab.key)}
                      activeOpacity={0.8}
                      style={[
                        styles.tabPill,
                        isActive ? styles.tabPillActive : styles.tabPillInactive,
                      ]}
                    >
                      {isActive ? <View style={styles.tabGoldDot} /> : null}
                      <Text
                        style={[
                          styles.tabLabel,
                          isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                        ]}
                      >
                        {tab.label} ({tab.count})
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          initialLoading ? (
            <View style={styles.stateWrapper}>
              <SkeletonList count={4} />
            </View>
          ) : error ? (
            <View style={styles.stateWrapper}>
              <AppErrorState
                title="Unable to load support tickets"
                message={error}
                onRetry={refresh}
              />
            </View>
          ) : isFiltered ? (
            <View style={styles.stateWrapper}>
              <AppEmptyState
                icon={<SearchX size={44} color="#64748B" />}
                title="No complaints found"
                message="There are no tickets matching your current search or filters."
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            </View>
          ) : (
            <View style={styles.emptyCardContainer}>
              <EmptyTicketIllustration />
              <Text style={styles.emptyTitle}>No complaints yet</Text>
              <Text style={styles.emptyDescription}>
                Your submitted complaints will appear here.
              </Text>
              <TouchableOpacity
                style={styles.emptyCreateBtn}
                onPress={() => setCreateModalVisible(true)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Create Complaint"
              >
                <Text style={styles.emptyCreateBtnText}>Create Complaint</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListFooterComponent={
          filteredItems.length > 0 ? (
            <View style={styles.paginationWrapper}>
              <AppPagination
                currentPage={page}
                totalItems={filteredItems.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                itemLabel="tickets"
              />
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Filter Bottom Sheet */}
      <TicketFilters
        visible={filtersVisible}
        filters={filterState}
        onClose={() => setFiltersVisible(false)}
        onApply={(newFilters) => {
          applyFilters(newFilters);
          setFiltersVisible(false);
        }}
        onReset={() => {
          clearFilters();
          setFiltersVisible(false);
        }}
      />

      {/* New Complaint / Ticket Modal */}
      <CreateTicketModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          refresh();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  list: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  headerArea: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  pageTitle: {
    ...Typography.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#0B2F52',
  },
  pageSubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
    lineHeight: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAD465',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.button,
    elevation: 2,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  addButtonPlus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#011F39',
    lineHeight: 18,
  },
  addButtonText: {
    ...Typography.button,
    fontSize: 13,
    fontWeight: '700',
    color: '#011F39',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
  },
  searchBarContainer: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  searchBarInput: {
    fontSize: 13,
    color: '#0F172A',
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#06294D',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
  },
  filtersText: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
  activeFilterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  filterPill: {
    backgroundColor: '#EDF2F7',
    borderColor: '#DBE5EE',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  filterPillText: {
    ...Typography.body,
    fontSize: 11,
    fontWeight: '600',
    color: '#06294D',
  },
  clearAllBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  tabsContainer: {
    marginBottom: Spacing.md,
  },
  tabsRow: {
    paddingHorizontal: Spacing.base,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  tabPillActive: {
    backgroundColor: '#06294D',
  },
  tabPillInactive: {
    backgroundColor: '#E8F1FC',
  },
  tabGoldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD447',
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 12.5,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: '#06294D',
    fontWeight: '700',
  },
  cardWrapper: {
    paddingHorizontal: Spacing.base,
  },
  stateWrapper: {
    paddingHorizontal: Spacing.base,
  },
  paginationWrapper: {
    paddingHorizontal: Spacing.base,
  },
  emptyCardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DCEBFA',
    borderStyle: 'dashed',
    borderRadius: 24,
    marginHorizontal: Spacing.base,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...Typography.sectionHeader,
    fontSize: 18,
    fontWeight: '800',
    color: '#06294D',
    textAlign: 'center',
    marginTop: 14,
  },
  emptyDescription: {
    ...Typography.body,
    fontSize: 13.5,
    color: '#718096',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  emptyCreateBtn: {
    backgroundColor: '#FAD465',
    paddingHorizontal: 28,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  emptyCreateBtnText: {
    color: '#06294D',
    fontSize: 13.5,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  loadingMore: {
    textAlign: 'center',
    color: '#94A3B8',
    paddingVertical: Spacing.md,
    fontSize: 12,
  },
});

export default SupportTicketsScreen;
