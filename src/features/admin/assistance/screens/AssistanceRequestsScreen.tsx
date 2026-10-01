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
import { AssistanceCard } from '../components/AssistanceCard';
import { AssistanceFilters } from '../components/AssistanceFilters';
import { AssistanceStatsRow } from '../components/AssistanceStats';
import { ASSISTANCE_TABS } from '../assistance.utils';
import { useAssistance } from '../hooks/useAssistance';

type ScreenProps = NativeStackScreenProps<AdminStackParamList, 'AssistanceRequests'>;

export function AssistanceRequestsScreen({ navigation }: ScreenProps) {
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
  } = useAssistance();
  const [filtersVisible, setFiltersVisible] = useState(false);

  if (!can(user, 'assistance.review')) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader title="Donation Seekers" />
        <View style={styles.center}>
          <AppEmptyState
            title="Access Restricted"
            message="You do not have permission to view assistance requests."
          />
        </View>
      </SafeAreaView>
    );
  }

  const tabs = ASSISTANCE_TABS.map(tab => ({
    ...tab,
    count:
      tab.key === 'ALL'
        ? stats.total
        : tab.key === 'UNDER_REVIEW'
          ? stats.underReview
          : tab.key === 'APPROVED'
            ? stats.approved
            : stats.rejected,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title="Donation Seekers"
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SupportTickets')}
              accessibilityRole="button"
              accessibilityLabel="Switch to Support"
              style={styles.switchButton}>
              <Text style={styles.switchText}>Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              style={styles.bellButton}>
              <Text style={styles.bellText}>🔔</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AssistanceCard
            request={item}
            onPress={() => navigation.navigate('AssistanceDetails', { requestId: item.id })}
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
            <Text style={styles.subtitle}>Review welfare assistance requests</Text>
            <AssistanceStatsRow stats={stats} loading={statsLoading} />
            <View style={styles.searchRow}>
              <AppSearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by name / request ID"
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
              title="Unable to load assistance requests"
              message={error}
              onRetry={refresh}
            />
          ) : (
            <AppEmptyState
              title="No Assistance Requests"
              message="There are no requests matching your current filters."
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
      <AssistanceFilters
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

export default AssistanceRequestsScreen;
