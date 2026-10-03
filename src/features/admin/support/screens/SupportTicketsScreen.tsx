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
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import type { AppStackParamList, TabsParamList } from '../../../../core/navigation/types';
import { TicketCard } from '../components/TicketCard';
import { TicketFilters } from '../components/TicketFilters';
import { TicketStatsRow } from '../components/TicketStats';
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
    setSearchQuery,
    setActiveTab,
    refresh,
    loadMore,
    clearFilters,
  } = useSupportTickets();
  const [filtersVisible, setFiltersVisible] = useState(false);

  if (!can(user, 'support.manage')) {
    return (
      <View style={styles.flex}>
        <AdminHeader onNavigate={target => navigation.navigate(target as any)} />
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
            : stats.resolved,
  }));

  return (
    <View style={styles.flex}>
      <AdminHeader
        onNavigate={target => navigation.navigate(target as any)}
      />

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
            {/* Page Context Banner */}
            <View style={styles.headerArea}>
              <Text style={styles.pageTitle}>Complaints & Support</Text>
              <Text style={styles.pageSubtitle}>
                Review, track and resolve support tickets.
              </Text>
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
                style={styles.filtersButton}
                activeOpacity={0.85}
              >
                <Text style={styles.filterIcon}>⚙️</Text>
                <Text style={styles.filtersText}>Filters</Text>
              </TouchableOpacity>
            </View>

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

      <TicketFilters
        visible={filtersVisible}
        currentTab={activeTab}
        onClose={() => setFiltersVisible(false)}
        onApply={tab => {
          setActiveTab(tab);
          setFiltersVisible(false);
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
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  pageTitle: {
    ...Typography.screenTitle,
    fontSize: 24,
    color: '#0F2C59',
  },
  pageSubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
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
    paddingHorizontal: 14,
    height: 44,
    borderRadius: BorderRadius.lg,
  },
  filterIcon: {
    fontSize: 13,
  },
  filtersText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2C59',
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
