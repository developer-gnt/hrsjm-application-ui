import React, { useEffect, useMemo, useState } from 'react';
import {
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
  SkeletonCard,
  feedback,
} from '../../../../../core';
import { NewsCard, NewsListHeader } from '../components/NewsCard';
import { showNewsActionMenu } from '../components/NewsActionMenu';
import { NewsFilterSheet } from '../components/NewsFilterSheet';
import { NewsStatusTabs } from '../components/NewsStatusTabs';
import { NewsSummaryStats } from '../components/NewsSummaryCard';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import { SAMPLE_NEWS_CATEGORIES } from '../data/sample-news';
import { useNews } from '../hooks/useNews';
import type {
  NewsFilterState,
  NewsFilterTab,
  NewsListItem,
  NewsStatusFilter,
  NewsUiState,
} from '../types/news.types';

/** TEMPORARY: local UI demo dataset. Replace with the real useNews hook data. */
const SAMPLE_DATA_LOAD_DELAY_MS = 800;

/** Skeleton placeholder matching the compact news-row shape (UI-only phase). */
const NewsRowSkeleton: React.FC = () => (
  <View style={styles.skeletonRow}>
    <SkeletonCard height={48} borderRadius={8} style={styles.skeletonThumb} />
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
      <NewsRowSkeleton key={index} />
    ))}
  </View>
);

interface NewsListScreenProps {
  /**
   * TEMPORARY (UI-only phase): called when the user taps "+ Add News".
   * When not provided, a placeholder alert is shown instead. The Create News
   * screen does not exist yet and is intentionally NOT built in this phase.
   */
  onAddNews?: () => void;
  /**
   * TEMPORARY (UI-only phase): called when the user taps a news row (or its
   * Edit/Restore action). When not provided, a placeholder alert is shown.
   */
  onViewNews?: (news: NewsListItem) => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell (e.g. jumping back to Events). Tabs this screen does not
   * handle fall back to the shell's preview notice.
   */
  onTabPress?: (tab: string) => void;
}

/**
 * News List screen (UI-only phase).
 *
 * Local sample data + local filtering only — NO backend calls. The list is
 * structured (FlatList + data/view-model split) so backend pagination and the
 * real news hook can replace the sample source without UI changes.
 */
export const NewsListScreen: React.FC<NewsListScreenProps> = ({
  onAddNews,
  onViewNews,
  onTabPress,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<NewsStatusFilter>('ALL');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const {
    news: filteredNews,
    stats,
    state: uiState,
    refresh,
  } = useNews({
    status: activeStatus,
    category: activeCategory,
    search: searchQuery,
  });

  const statusTabs = useMemo<NewsFilterTab[]>(
    () => [
      { key: 'ALL', label: 'All', count: stats.total },
      { key: 'PUBLISHED', label: 'Published', count: stats.published },
      { key: 'DRAFT', label: 'Drafts', count: stats.drafts },
      { key: 'ARCHIVED', label: 'Archived', count: stats.archived },
    ],
    [stats],
  );

  const appliedFilters = useMemo<NewsFilterState>(
    () => ({ status: activeStatus, category: activeCategory }),
    [activeStatus, activeCategory],
  );

  const hasActiveFilters =
    searchQuery.trim() !== '' || activeStatus !== 'ALL' || activeCategory !== null;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const paginatedNews = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredNews.slice(startIndex, startIndex + pageSize);
  }, [filteredNews, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeStatus, activeCategory]);

  const handleApplyFilters = (filters: NewsFilterState) => {
    setActiveStatus(filters.status);
    setActiveCategory(filters.category);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveStatus('ALL');
    setActiveCategory(null);
  };

  const handleAddNews = () => {
    if (onAddNews) {
      onAddNews();
      return;
    }
    feedback.info('Add News', 'Create News is not configured.');
  };

  const handleNewsPress = (news: NewsListItem) => {
    if (onViewNews) {
      onViewNews(news);
      return;
    }
    feedback.info(news.title, news.summary);
  };

  const handleNewsMenu = (news: NewsListItem) => showNewsActionMenu(news);

  const handleStatusChange = (status: NewsStatusFilter) => setActiveStatus(status);

  const handleShellTabPress = (tab: string) => {
    if ((tab === 'events' || tab === 'blogs' || tab === 'rights') && onTabPress) {
      onTabPress(tab);
      return;
    }
    if (tab !== 'news') {
      feedback.info(
        'Navigation',
        'Use the bottom navigation bar to switch between modules.',
      );
    }
  };

  const handleRetry = () => {
    refresh();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderListHeader = () => (
    <View>
      {/* Page header matching Donation Seekers layout and typography */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <Text style={styles.pageTitle}>News & Updates</Text>
          <Text style={styles.pageSubtitle}>
            Manage and publish news, updates and announcements.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNews}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add News"
        >
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addButtonText}>Add News</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <NewsSummaryStats stats={stats} />
      </View>

      <View style={styles.searchRow}>
        <AppSearchBar
          placeholder="Search by title, category or keyword..."
          value={searchQuery}
          onSearch={setSearchQuery}
          containerStyle={styles.searchBar}
        />
        <TouchableOpacity
          style={[
            styles.filterButton,
            (filterSheetVisible || activeCategory !== null || activeStatus !== 'ALL') &&
              styles.filterButtonActive,
          ]}
          onPress={() => setFilterSheetVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Filters"
          accessibilityState={{ expanded: filterSheetVisible }}
        >
          <Text style={styles.filterIcon}>▾</Text>
          <Text style={styles.filterText}>Filters</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsSection}>
        <NewsStatusTabs
          tabs={statusTabs}
          activeTab={activeStatus}
          onTabChange={handleStatusChange}
        />
      </View>

      <NewsListHeader />
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Unified official Admin Header - Fixed at Top */}
      <AdminHeader />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <FlatList
          data={uiState === 'loading' ? [] : paginatedNews}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={
            filteredNews.length > 0 ? (
              <AppPagination
                currentPage={page}
                totalItems={filteredNews.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                itemLabel="news"
              />
            ) : undefined
          }
          renderItem={({ item }) => (
            <NewsCard news={item} onPress={handleNewsPress} onMorePress={handleNewsMenu} />
          )}
          ListEmptyComponent={
            uiState === 'loading' ? (
              <LoadingListView />
            ) : uiState === 'error' ? (
              <AppErrorState
                title="Unable to load news."
                message="Something went wrong while loading news. Please try again."
                onRetry={handleRetry}
                style={styles.errorState}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <AppEmptyState
                  icon="🔍"
                  title="No news found"
                  description="Try changing your search or filters."
                  actionTitle={hasActiveFilters ? 'Clear Filters' : undefined}
                  onAction={hasActiveFilters ? clearFilters : undefined}
                />
              </View>
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

      <NewsFilterSheet
        visible={filterSheetVisible}
        categories={SAMPLE_NEWS_CATEGORIES}
        applied={appliedFilters}
        onApply={handleApplyFilters}
        onClose={() => setFilterSheetVisible(false)}
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  pageHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    ...Typography.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#0B2F52',
    lineHeight: 28,
  },
  pageSubtitle: {
    ...Typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: '#718096',
    marginTop: 2,
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
  addIcon: {
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
  tabsSection: {
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
    width: 48,
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
