import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppEmptyState } from '../../../../core/components/common/AppEmptyState';
import { AppErrorState } from '../../../../core/components/common/AppErrorState';
import { AppHeader } from '../../../../core/components/common/AppHeader';
import { AppSearchBar } from '../../../../core/components/common/AppSearchBar';
import { SkeletonList } from '../../../../core/components/common/AppSkeleton';
import { AdminFilterTabs } from '../../../../core/components/admin/AdminFilterTabs';
import { useAuth } from '../../../../core/auth/AuthContext';
import { can } from '../../../../core/permissions/permissions';
import { colors, spacing, typography } from '../../../../core/theme/theme';
import type { AdminStackParamList } from '../../../../core/navigation/types';
import { TicketCard } from '../components/TicketCard';
import { TicketFilters } from '../components/TicketFilters';
import { TicketStatsRow } from '../components/TicketStats';
import { TICKET_TABS } from '../support.utils';
import { useSupportTickets } from '../hooks/useSupportTickets';

type ScreenProps = NativeStackScreenProps<AdminStackParamList, 'SupportTickets'>;

export function SupportTicketsScreen({ navigation }: ScreenProps) {
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
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader title="Support" />
        <View style={styles.center}>
          <AppEmptyState
            title="Access Restricted"
            message="You do not have permission to view support tickets."
          />
        </View>
      </SafeAreaView>
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title="Support"
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AssistanceRequests')}
              accessibilityRole="button"
              accessibilityLabel="Switch to Donation Seekers"
              style={styles.switchButton}>
              <Text style={styles.switchText}>Seekers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              style={styles.bellButton}>
              <Text style={styles.bellText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              accessibilityRole="button"
              accessibilityLabel="Open profile and settings"
              style={styles.bellButton}>
              <Text style={styles.bellText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <FlatList
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
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View>
            <Text style={styles.subtitle}>Review complaints and support requests</Text>
            <TicketStatsRow stats={stats} loading={statsLoading} />
            <View style={styles.searchRow}>
              <AppSearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by ticket ID / subject / user"
              />
              <TouchableOpacity
                onPress={() => setFiltersVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Open filters"
                style={styles.filterButton}>
                <Text style={styles.filterText}>Filters</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tabs}>
              <AdminFilterTabs tabs={tabs} activeKey={activeTab} onSelect={setActiveTab} />
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
        contentContainerStyle={[
          styles.listContent,
          filteredItems.length === 0 && styles.emptyList,
        ]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  tabs: {
    marginBottom: spacing.lg,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingMore: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
  switchButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  switchText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bellButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  bellText: {
    fontSize: 14,
  },
});

export default SupportTicketsScreen;
