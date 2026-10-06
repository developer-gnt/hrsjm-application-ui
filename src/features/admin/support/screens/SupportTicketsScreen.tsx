import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
import { can } from '../../../../core/permissions/permissions';
import { BrandColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { Plus, ListFilter, X } from '../../../../core/components/icons';
import type { AppStackParamList, TabsParamList } from '../../../../core/navigation/types';
import { TicketCard } from '../components/TicketCard';
import { TicketFilters } from '../components/TicketFilters';
import { TicketStatsRow } from '../components/TicketStats';
import { CreateTicketModal } from '../components/CreateTicketModal';
import { TICKET_TABS } from '../support.utils';
import { useSupportTickets } from '../hooks/useSupportTickets';
import { AppEmptyState, AppErrorState } from '../../../../core';

type TabProps = BottomTabScreenProps<TabsParamList, 'ComplaintsTab'>;
type NavProp = CompositeNavigationProp<
  TabProps['navigation'],
  NativeStackNavigationProp<AppStackParamList>
>;

export function SupportTicketsScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
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

  if (!can(user, 'support.manage')) {
    return (
      <View style={styles.flex}>
        <AdminHeader />
        <View style={styles.center}>
          <AppEmptyState
            title="Access Restricted"
            message="You do not have permission to view support tickets."
          />
        </View>
      </View>
    );
  }

  const tabs = TICKET_TABS.map(tab => ({
    ...tab,
    count:
      tab.key === 'ALL'
        ? stats.total
        : tab.key === 'SUBMITTED'
          ? stats.open
          : tab.key === 'UNDER_REVIEW'
            ? stats.inProgress
            : tab.key === 'RESOLVED'
              ? stats.resolved
              : (stats.closed ?? 0),
  }));

  const hasActiveFilterChips =
    (filterState.category && filterState.category !== 'ALL') ||
    (filterState.dateRange && filterState.dateRange !== 'ALL');

  return (
    <View style={styles.flex}>
      <AdminHeader />

      <FlatList
        style={styles.list}
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TicketCard
            ticket={item}
            onPress={() => navigation.navigate('TicketDetails', { ticketId: item.id })}
          />
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
            {/* Page Context Banner & Action Header */}
            <View style={styles.headerArea}>
              <View style={styles.headerTitleCol}>
                <Text style={styles.pageTitle}>Complaints & Support</Text>
                <Text style={styles.pageSubtitle}>
                  Review, track and resolve support tickets.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setCreateModalVisible(true)}
                activeOpacity={0.85}
              >
                <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.addBtnText}>New Complaint</Text>
              </TouchableOpacity>
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
                />
              </View>
              <TouchableOpacity
                onPress={() => setFiltersVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Open filters"
                style={[
                  styles.filtersButton,
                  activeFiltersCount > 0 && styles.filtersButtonActive,
                ]}
                activeOpacity={0.85}
              >
                <ListFilter
                  size={15}
                  color={activeFiltersCount > 0 ? '#1D4ED8' : '#0F2C59'}
                />
                <Text
                  style={[
                    styles.filtersText,
                    activeFiltersCount > 0 && styles.filtersTextActive,
                  ]}
                >
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

            {/* Filter Tabs */}
            <View style={styles.tabsContainer}>
              <AdminFilterTabs
                tabs={tabs}
                activeKey={activeTab}
                onSelect={setActiveTab}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          initialLoading ? (
            <SkeletonList count={4} />
          ) : error ? (
            <AppErrorState
              title="Unable to load support tickets"
              message={error}
              onRetry={refresh}
            />
          ) : (
            <AppEmptyState
              title="No Support Tickets"
              message="There are no tickets matching your current filters."
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          )
        }
        ListFooterComponent={
          loadingMore ? <Text style={styles.loadingMore}>Loading more…</Text> : undefined
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
    backgroundColor: '#F8FAFC',
  },
  list: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  headerArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  headerTitleCol: {
    flex: 1,
  },
  pageTitle: {
    ...Typography.screenTitle,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2C59',
  },
  pageSubtitle: {
    ...Typography.body,
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F2C59',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: BorderRadius.lg,
  },
  filtersButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  filtersText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2C59',
  },
  filtersTextActive: {
    color: '#1D4ED8',
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
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
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
  listContent: {
    paddingHorizontal: Spacing.base,
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
