import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import {
  AppButton,
  AppEmptyState,
  AppErrorState,
  AppPagination,
  AppSearchBar,
  Calendar,
  ConfirmDialog,
  SkeletonCard,
} from '../../../../../core/components';
import { formatDate } from '../../../../../core/utils';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../../auth/store/authStore';
import { EventCard, EventListHeader } from '../components/EventCard';
import { EventFilters } from '../components/EventFilters';
import { EventSummaryStats } from '../components/EventSummaryStats';
import { AdminHeader } from '../../../../../app/navigation';
import { useEvents, useRefreshEvents, useDeleteEvent } from '../hooks/useEvents';
import { CreateEventScreen } from './CreateEventScreen';
import { EditEventScreen } from './EditEventScreen';
import { SAMPLE_EVENTS, SAMPLE_EVENT_CATEGORIES } from '../data/sample-events';
import { EventDetailsScreen } from './EventDetailsScreen';
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
  allowCreate?: boolean;
}> = ({ hasActiveFilters, onClearFilters, onAddEvent, allowCreate = true }) => (
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
        icon={<Calendar size={42} color={AdminColors.textMuted} strokeWidth={1.5} />}
        title="No Events Found"
        description="There are no events to display yet."
        actionTitle={allowCreate ? 'Add Event' : undefined}
        onAction={allowCreate ? onAddEvent : undefined}
      />
    )}
  </View>
);

interface EventsScreenProps {
  /**
   * Called when the user taps View on an event row.
   * When not provided, opens EventDetailsScreen internally.
   */
  onViewEvent?: (event: EventListItem) => void;
  /**
   * Called when the user taps "+ Add Event".
   */
  onAddEvent?: () => void;
  /**
   * Called when a bottom tab is pressed on the preview shell.
   */
  onTabPress?: (tab: string) => void;
  /**
   * Whether to display the create event action button. Defaults to true for admin, false for members.
   */
  canCreate?: boolean;
}

export const EventsScreen: React.FC<EventsScreenProps> = ({
  onViewEvent,
  onAddEvent,
  onTabPress,
  canCreate,
}) => {
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.roles?.some(r =>
    ['admin', 'superadmin', 'super_admin'].includes(r.name.toLowerCase()),
  );
  const allowCreate = canCreate !== undefined ? canCreate : Boolean(isAdmin);

  const [internalSelectedEvent, setInternalSelectedEvent] = useState<EventListItem | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventListItem | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventListItem | null>(null);
  const deleteMutation = useDeleteEvent();
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
    const nowTime = Date.now();

    const isUpcoming = (event: EventListItem) => {
      if (event.status === 'COMPLETED' || event.status === 'CANCELLED') return false;
      if (!event.startAt) return false;
      const startTime = new Date(event.startAt).getTime();
      if (isNaN(startTime)) return false;
      const endTime = event.endAt ? new Date(event.endAt).getTime() : startTime + 4 * 60 * 60 * 1000;
      return endTime >= nowTime;
    };

    return events
      .filter(event => {
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
      })
      .sort((a, b) => {
        const aUpcoming = isUpcoming(a);
        const bUpcoming = isUpcoming(b);

        // Upcoming events come first
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;

        const aTime = new Date(a.startAt).getTime() || 0;
        const bTime = new Date(b.startAt).getTime() || 0;

        // Among upcoming events: chronological order (nearest first)
        if (aUpcoming && bUpcoming) {
          return aTime - bTime;
        }

        // Among completed/past events: most recent past first
        return bTime - aTime;
      });
  }, [events, searchQuery, activeStatus, activeCategory]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const paginatedEvents = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredEvents.slice(startIndex, startIndex + pageSize);
  }, [filteredEvents, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeStatus, activeCategory]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || activeStatus !== 'ALL' || activeCategory !== null;

  const handleSearch = (text: string) => setSearchQuery(text);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveStatus('ALL');
    setActiveCategory(null);
  };

  const handleAddEvent = () => {
    if (onAddEvent) {
      onAddEvent();
      return;
    }
    setCreatingEvent(true);
  };

  const handleEventPress = (event: EventListItem) => {
    if (onViewEvent) {
      onViewEvent(event);
      return;
    }
    setInternalSelectedEvent(event);
  };

  const handleEditEvent = (event: EventListItem) => {
    setEditingEvent(event);
  };

  const handleDeleteEvent = (event: EventListItem) => {
    setEventToDelete(event);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteMutation.mutateAsync(eventToDelete.id);
      setEventToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      Alert.alert('Error', err?.message || 'Failed to delete event. Please try again.');
    }
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

  if (creatingEvent) {
    return (
      <CreateEventScreen
        onCancel={() => {
          setCreatingEvent(false);
          refetch();
        }}
      />
    );
  }

  if (editingEvent) {
    return (
      <EditEventScreen
        event={editingEvent}
        onBack={() => {
          setEditingEvent(null);
          refetch();
        }}
      />
    );
  }

  if (internalSelectedEvent) {
    return (
      <EventDetailsScreen
        event={internalSelectedEvent}
        onBack={() => setInternalSelectedEvent(null)}
        onEdit={() => {
          setEditingEvent(internalSelectedEvent);
          setInternalSelectedEvent(null);
        }}
        onDelete={(ev) => {
          setEventToDelete(ev);
        }}
        canManage={allowCreate}
      />
    );
  }

  const renderListHeader = () => (
    <View>
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
            {allowCreate
              ? 'Manage and view all events and activities.'
              : 'View and participate in all events and activities.'}
          </Text>
        </View>
        {allowCreate && (
          <AppButton
            title="Add Event"
            variant="gold"
            size="sm"
            onPress={handleAddEvent}
            icon={<Text style={styles.addIcon}>+</Text>}
            textStyle={styles.addButtonText}
            style={styles.addButton}
          />
        )}
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

      <EventListHeader />
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Unified official Admin Header - Fixed at Top */}
      <AdminHeader onNavigate={handleDrawerNavigate} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <FlatList
          data={isLoading && !data ? [] : paginatedEvents}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={
            filteredEvents.length > 0 ? (
              <AppPagination
                currentPage={page}
                totalItems={filteredEvents.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                itemLabel="events"
              />
            ) : undefined
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={handleEventPress}
              onEditPress={handleEditEvent}
              onDeletePress={handleDeleteEvent}
            />
          )}
          ListEmptyComponent={
            isLoading && !data ? (
              <LoadingListView />
            ) : isError && !data ? (
              <AppErrorState
                title="Unable to load events."
                message="Something went wrong while loading events. Please try again."
                onRetry={handleRetry}
                style={styles.errorState}
              />
            ) : (
              <EmptyStateView
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                onAddEvent={handleAddEvent}
                allowCreate={allowCreate}
              />
            )
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
      </SafeAreaView>

      <ConfirmDialog
        visible={Boolean(eventToDelete)}
        title="Delete Event"
        message={`Are you sure you want to delete "${eventToDelete?.title}"? This action cannot be undone.`}
        confirmTitle="Delete"
        cancelTitle="Cancel"
        loading={deleteMutation.isPending}
        onCancel={() => setEventToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
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
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  pageHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    fontFamily: FontFamilies.serif,
    fontSize: 22,
    lineHeight: 28,
    color: AdminColors.textPrimary,
    fontWeight: '700',
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
    borderRadius: BorderRadius.button,
  },
  addIcon: {
    color: '#011F39',
    fontSize: 16,
    fontWeight: '700',
    marginTop: -1,
  },
  addButtonText: {
    ...Typography.secondaryMedium,
    fontWeight: '700',
    color: '#011F39',
  },
  statsSection: {
    marginTop: Spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
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
    marginHorizontal: -16,
  },
  skeletonList: {
    paddingTop: Spacing.base,
    gap: Spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
    paddingHorizontal: 16,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});