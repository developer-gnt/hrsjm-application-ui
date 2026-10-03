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
import { AppBottomSheet } from '../../../../core/components/common/AppBottomSheet';
import { AppEmptyState } from '../../../../core/components/common/AppEmptyState';
import { AppErrorState } from '../../../../core/components/common/AppErrorState';
import { AppSearchBar } from '../../../../core/components/common/AppSearchBar';
import { SkeletonList } from '../../../../core/components/common/AppSkeleton';
import { AdminFilterTabs } from '../../../../core/components/admin/AdminFilterTabs';
import { useAuth } from '../../../../core/auth/AuthContext';
import { can } from '../../../../core/permissions/permissions';
import { AdminColors, BrandColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import type { AppStackParamList, TabsParamList } from '../../../../core/navigation/types';
import { AssistanceCard } from '../components/AssistanceCard';
import { AssistanceFilters } from '../components/AssistanceFilters';
import { AssistanceStatsRow } from '../components/AssistanceStats';
import { ASSISTANCE_TABS } from '../assistance.utils';
import { useAssistance } from '../hooks/useAssistance';

type TabProps = BottomTabScreenProps<TabsParamList, 'DonationSeekersTab'>;
type NavProp = CompositeNavigationProp<
  TabProps['navigation'],
  NativeStackNavigationProp<AppStackParamList>
>;

export function AssistanceRequestsScreen() {
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
  } = useAssistance();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [addSeekerVisible, setAddSeekerVisible] = useState(false);

  const canReview = can(user, 'assistance.review');

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

  const openDetails = (requestId: string) =>
    navigation.navigate('AssistanceDetails', { requestId });

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
          <AssistanceCard
            request={item}
            onPress={() => openDetails(item.id)}
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
              <View style={styles.titleRow}>
                <View style={styles.titleBlock}>
                  <Text style={styles.pageTitle}>Donation Seekers</Text>
                  <Text style={styles.pageSubtitle}>
                    Review, verify and manage donation requests.
                  </Text>
                </View>
                {canReview ? (
                  <TouchableOpacity
                    onPress={() => setAddSeekerVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Add Seeker"
                    style={styles.addButton}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.addButtonPlus}>+</Text>
                    <Text style={styles.addButtonText}>Add Seeker</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* 4-Column Executive KPI Cards */}
            <AssistanceStatsRow stats={stats} loading={statsLoading} />

            {/* Search and Filters Bar */}
            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <AppSearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name, ID, cause..."
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
          loadingMore ? <Text style={styles.loadingMore}>Loading more…</Text> : null
        }
        contentContainerStyle={styles.listContent}
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

      <AppBottomSheet
        visible={addSeekerVisible}
        title="Add Seeker"
        onClose={() => setAddSeekerVisible(false)}
      >
        <Text style={styles.addSeekerNote}>
          Creating assistance requests on behalf of seekers is not supported by
          the backend yet. Seekers submit their own requests from their app, and
          they appear here for review.
        </Text>
      </AppBottomSheet>
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
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl * 2,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F2C59',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  addButtonPlus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
  loadingMore: {
    textAlign: 'center',
    color: '#94A3B8',
    paddingVertical: Spacing.md,
    fontSize: 12,
  },
  addSeekerNote: {
    ...Typography.body,
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    padding: Spacing.base,
  },
});

export default AssistanceRequestsScreen;
