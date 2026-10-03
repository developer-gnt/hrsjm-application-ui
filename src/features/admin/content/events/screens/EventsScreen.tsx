import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import {
  AppButton,
  AppEmptyState,
  AppErrorState,
  AppSearchBar,
  SkeletonCard,
} from '../../../../../core/components';
import { formatDate } from '../../../../../core/utils';
import { useNavigation } from '@react-navigation/native';
import { EventCard, EventListHeader } from '../components/EventCard';
import { EventFilters } from '../components/EventFilters';
import { EventSummaryStats } from '../components/EventSummaryStats';
import { AdminHeader } from '../../../../../app/navigation';
import { useEvents, useRefreshEvents } from '../hooks/useEvents';
import { SAMPLE_EVENTS, SAMPLE_EVENT_CATEGORIES } from '../data/sample-events';
import type {
  EventListItem,
  EventStatusFilter,
  EventStatsSummary,
  EventsUiState,
} from '../types/events.types';

/** TEMPORARY: local UI demo dataset. Replace with the real useEvents hook data. */
const SAMPLE_DATA_LOAD_DELAY_MS = 800;

/** Skeleton placeholder matching the compact event-row shape (UI-only phase). */
const EventRowSkeleton: React.FC = () => (
  <View style={styles.skeletonRow}>
    <SkeletonCard height={34} borderRadius={8} style={styles.skeletonThumb} />
    <View style={styles.skeletonLines}>
      <SkeletonCard height={10} />
      <SkeletonCard height={10} />
      <SkeletonCard height={8} />
    </View>
  </View>
);

const LoadingListView: React.FC = () => (
  <View style={styles.skeletonList}>
    {[0, 1, 2, 3, 4, 5].map(index => (
      <EventRowSkeleton key={index} />
    ))}
  </View>
);

const EmptyStateView: React.FC<{
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onAddEvent: () => void;
}> = ({ hasActiveFilters, onClearFilters, onAddEvent }) => (
  <View style={styles.emptyContainer}>
    {hasActiveFilters ? (
      <AppEmptyState
        icon="🔍"
        title="No Events Found"
        description="No results match your filters."
        actionTitle="Clear Filters"
        onAction={onClearFilters}
      />
    ) : (
      <AppEmptyState
        icon="📅"
        title="No Events Found"
        description="There are no events to display yet."
        actionTitle="Add Event"
        onAction={onAddEvent}
      />
    )}
  </View>
);

interface EventsScreenProps {
  /**
   * TEMPORARY (UI-only phase): called when the user taps View on an event row.
   * When not provided, a placeholder alert is shown instead. Real navigation
   * will replace this with the shared admin navigation architecture.
   */
  onViewEvent?: (event: EventListItem) => void;
  /**
   * TEMPORARY (UI-only phase): called when the user taps "+ Add Event".
   * When not provided, a placeholder alert is shown instead.
   */
  onAddEvent?: () => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell (e.g. jumping to News). When not provided, the shell shows
   * its preview notice (original behavior). Real navigation replaces this.
   */
  onTabPress?: (tab: string) => void;
}

export const EventsScreen: React.FC<EventsScreenProps> = ({ onViewEvent, onAddEvent, onTabPress }) => {
  const navigation = useNavigation<any>();
  const [uiState, setUiState] = useState<EventsUiState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<EventStatusFilter>('ALL');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useEvents({
    status: activeStatus,
    category: activeCategory || undefined,
    search: searchQuery,
  });

  const refreshEvents = useRefreshEvents({
    status: activeStatus,
    category: activeCategory || undefined,
    search: searchQuery,
  });

  const events = data?.events ?? SAMPLE_EVENTS;
  const stats: EventStatsSummary = data?.stats ?? {
    total: events.length,
    upcoming: events.filter(event => event.status === 'UPCOMING').length,
    completed: events.filter(event => event.status === 'COMPLETED').length,
    cancelled: events.filter(event => event.status === 'CANCELLED').length,
  };

  const statusTabs = useMemo(
    () => [
      { key: 'ALL' as EventStatusFilter, label: 'All', count: stats.total },
      { key: 'UPCOMING' as EventStatusFilter, label: 'Upcoming', count: stats.upcoming },
      { key: 'COMPLETED' as EventStatusFilter, label: 'Completed', count: stats.completed },
      { key: 'CANCELLED' as EventStatusFilter, label: 'Cancelled', count: stats.cancelled },
    ],
    [stats],
  );

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return events.filter(event => {
      if (activeStatus !== 'ALL' && event.status !== activeStatus) {
        return false;
      }
      if (activeCategory && event.category !== activeCategory) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = [
        event.title,
        event.location,
        event.category,
        formatDate(event.startAt),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [events, searchQuery, activeStatus, activeCategory]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || activeStatus !== 'ALL' || activeCategory !== null;

  const handleSearch = (text: string) => setSearchQuery(text);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveStatus('ALL');
    setActiveCategory(null);
  };

  // Placeholder handlers — the Create/Details/Edit/Delete screens arrive in the
  // next phase of the Events module.
  const handleAddEvent = () => {
    if (onAddEvent) {
      onAddEvent();
      return;
    }
    Alert.alert(
      'Add Event',
      'The Create Event screen will be implemented in the next phase of the Events module.',
    );
  };

  const handleEventPress = (event: EventListItem) => {
    if (onViewEvent) {
      onViewEvent(event);
      return;
    }
    Alert.alert(
      event.title,
      'The Event Details screen will be implemented in the next phase of the Events module.',
    );
  };

  const handleEventMenu = (event: EventListItem) => {
    Alert.alert(event.title, undefined, [
      { text: 'View Details', onPress: () => handleEventPress(event) },
      {
        text: 'Edit Event',
        onPress: () =>
          Alert.alert(
            'Edit Event',
            'The Edit Event screen will be implemented in the next phase of the Events module.',
          ),
      },
      {
        text: 'Delete Event',
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            'Delete Event',
            'Deleting events will be connected to the backend in a later phase.',
          ),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleStatusChange = (status: EventStatusFilter) => setActiveStatus(status);

  const handleRetry = () => {
    refetch();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshEvents();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDrawerNavigate = (target: string) => {
    if (
      target === 'AdminDashboardTab' ||
      target === 'AdminMembersTab' ||
      target === 'AdminApplicationsTab' ||
      target === 'AdminComplaintsTab'
    ) {
      (navigation.getParent() as any)?.jumpTo(target);
    } else if (target === 'AdminMoreTab') {
      navigation.navigate('MoreMenu' as any);
    } else {
      navigation.navigate(target as any);
    }
  };

  return (
    <View style={styles.root}>
      {/* Unified official Admin Header */}
      <AdminHeader onNavigate={handleDrawerNavigate} unreadCount={3} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        {/* Page header: title/subtitle + Add Event */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderText}>
            <Text style={styles.pageTitle}>Events</Text>
            <Text
              style={styles.pageSubtitle}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              numberOfLines={1}
            >
              Manage and view all events and activities.
            </Text>
          </View>
          <AppButton
            title="Add Event"
            size="sm"
            onPress={handleAddEvent}
            icon={<Text style={styles.addIcon}>+</Text>}
            textStyle={styles.addButtonText}
            style={styles.addButton}
          />
        </View>

        <View style={styles.statsSection}>
          <EventSummaryStats stats={stats} />
        </View>

        <View style={styles.searchRow}>
          <AppSearchBar
            placeholder="Search by event name, location or date..."
            value={searchQuery}
            onSearch={handleSearch}
            containerStyle={styles.searchBar}
          />
          <TouchableOpacity
            style={[
              styles.filterButton,
              (filtersExpanded || activeCategory !== null) && styles.filterButtonActive,
            ]}
            onPress={() => setFiltersExpanded(previous => !previous)}
            accessibilityRole="button"
            accessibilityLabel="Filters"
            accessibilityState={{ expanded: filtersExpanded }}
          >
            <Text style={styles.filterIcon}>{filtersExpanded ? '▴' : '▾'}</Text>
            <Text style={styles.filterText}>Filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersSection}>
          <EventFilters
            tabs={statusTabs}
            activeTab={activeStatus}
            onTabChange={handleStatusChange}
            expanded={filtersExpanded}
            categories={SAMPLE_EVENT_CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onApply={() => setFiltersExpanded(false)}
          />
        </View>

        {isLoading && !data ? (
          <LoadingListView />
        ) : isError && !data ? (
          <AppErrorState
            title="Unable to load events."
            message="Something went wrong while loading events. Please try again."
            onRetry={handleRetry}
            style={styles.errorState}
          />
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={item => item.id}
            ListHeaderComponent={EventListHeader}
            renderItem={({ item }) => (
              <EventCard event={item} onPress={handleEventPress} onMorePress={handleEventMenu} />
            )}
            ListEmptyComponent={
              <EmptyStateView
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                onAddEvent={handleAddEvent}
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={AdminColors.primary}
                colors={[AdminColors.primary]}
              />
            }
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AdminColors.cardSurface,
  },
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  pageHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    ...Typography.screenTitle,
    fontSize: 20,
    lineHeight: 25,
    color: AdminColors.primaryDark,
  },
  pageSubtitle: {
    ...Typography.secondary,
    fontSize: 11,
    lineHeight: 15,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    minHeight: 34,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  addIcon: {
    color: AdminColors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
    marginTop: -1,
  },
  addButtonText: {
    ...Typography.secondaryMedium,
    fontWeight: '600',
  },
  statsSection: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  searchBar: {
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  filterButtonActive: {
    backgroundColor: AdminColors.primaryLight,
    borderColor: AdminColors.primary,
  },
  filterIcon: {
    fontSize: 10,
    color: AdminColors.primary,
    fontWeight: '700',
  },
  filterText: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
  },
  filtersSection: {
    marginTop: Spacing.sm,
  },
  skeletonList: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    gap: Spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base + Spacing.sm,
  },
  skeletonThumb: {
    width: 34,
  },
  skeletonLines: {
    flex: 1,
    gap: Spacing.xs,
  },
  errorState: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});