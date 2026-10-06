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
  Spacing,
  Typography,
} from '../../../../../core/theme';
import {
  AppButton,
  AppEmptyState,
  AppErrorState,
  AppSearchBar,
  SkeletonCard,
  feedback,
} from '../../../../../core';
import { BlogCard, BlogListHeader } from '../components/BlogCard';
import { BlogFilterSheet } from '../components/BlogFilterSheet';
import { BlogStatusTabs } from '../components/BlogStatusTabs';
import { BlogSummaryCard } from '../components/BlogSummaryCard';
import { BlogActionMenu } from '../components/BlogActionMenu';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import { SAMPLE_BLOG_CATEGORIES } from '../data/sample-blogs';
import { useBlogs } from '../hooks/useBlogs';
import type {
  BlogFilterState,
  BlogFilterTab,
  BlogListItem,
  BlogStatusFilter,
  BlogsUiState,
} from '../types/blog.types';

/** TEMPORARY: local UI demo dataset. Replace with the real useBlogs hook data. */
const SAMPLE_DATA_LOAD_DELAY_MS = 800;

/** Skeleton placeholder matching the compact blog-row shape (UI-only phase). */
const BlogRowSkeleton: React.FC = () => (
  <View style={styles.skeletonRow}>
    <SkeletonCard height={44} borderRadius={8} style={styles.skeletonThumb} />
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
      <BlogRowSkeleton key={index} />
    ))}
  </View>
);

interface BlogsListScreenProps {
  /**
   * TEMPORARY (UI-only phase): called when the user taps "+ Add Blog".
   * When not provided, a placeholder alert is shown instead. The Create Blog
   * screen does not exist yet and is intentionally NOT built in this phase.
   */
  onAddBlog?: () => void;
  /**
   * TEMPORARY (UI-only phase): called when the user taps a blog row, to open
   * the Blog Details screen. When not provided, a placeholder alert is shown.
   */
  onOpenBlog?: (blog: BlogListItem) => void;
  /**
   * Called when the user taps a row's Edit button: opens the shared
   * Edit Blog screen for that blog (same screen as Blog Details → Edit).
   */
  onEditBlog?: (blog: BlogListItem) => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell (e.g. jumping back to Events/News). Tabs this screen does
   * not handle fall back to the shell's preview notice.
   */
  onTabPress?: (tab: string) => void;
}

/** Date-range window in days for the UI-only date filter (approximate). */
const DATE_FILTER_DAYS: Record<string, number> = { TODAY: 1, WEEK: 7, MONTH: 31 };

/** Month abbreviations used by the sample display dates ("28 Sep 2026"). */
const BLOG_MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

/** Display date -> timestamp so recent-first sorting is calendar-correct. */
const blogDateValue = (date: string): number => {
  const [day, month, year] = date.split(' ');
  return Date.UTC(Number(year), BLOG_MONTH_INDEX[month] ?? 0, Number(day));
};

/**
 * Blogs List screen (UI-only phase).
 *
 * Local sample data + local filtering only — NO backend calls. The list is
 * structured (FlatList + data/view-model split) so backend pagination and the
 * real blogs hook can replace the sample source without UI changes.
 */
export const BlogsListScreen: React.FC<BlogsListScreenProps> = ({
  onAddBlog,
  onOpenBlog,
  onEditBlog,
  onTabPress,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<BlogStatusFilter>('ALL');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDateRange, setActiveDateRange] = useState('ANY');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [actionMenuBlog, setActionMenuBlog] = useState<BlogListItem | null>(null);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);

  const {
    blogs: filteredBlogs,
    stats,
    state: uiState,
    refresh,
    updateBlog,
    deleteBlog,
  } = useBlogs({
    status: activeStatus,
    category: activeCategory,
    dateRange: activeDateRange as any,
    search: searchQuery,
  });

  const statusTabs = useMemo<BlogFilterTab[]>(
    () => [
      { key: 'ALL', label: 'All', count: stats.total },
      { key: 'PUBLISHED', label: 'Published', count: stats.published },
      { key: 'DRAFT', label: 'Drafts', count: stats.drafts },
      { key: 'ARCHIVED', label: 'Archived', count: stats.archived },
    ],
    [stats],
  );

  const appliedFilters = useMemo<BlogFilterState>(
    () => ({ status: activeStatus, category: activeCategory, dateRange: activeDateRange as BlogFilterState['dateRange'] }),
    [activeStatus, activeCategory, activeDateRange],
  );

  const hasActiveFilters =
    searchQuery.trim() !== '' || activeStatus !== 'ALL' || activeCategory !== null || activeDateRange !== 'ANY';

  const handleApplyFilters = (filters: BlogFilterState) => {
    setActiveStatus(filters.status);
    setActiveCategory(filters.category);
    setActiveDateRange(filters.dateRange);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveStatus('ALL');
    setActiveCategory(null);
    setActiveDateRange('ANY');
  };

  const handleAddBlog = () => {
    if (onAddBlog) {
      onAddBlog();
      return;
    }
    feedback.info('Add Blog', 'Create Blog is not configured.');
  };

  const handleBlogPress = (blog: BlogListItem) => {
    if (onOpenBlog) {
      onOpenBlog(blog);
      return;
    }
    feedback.info(blog.title, blog.excerpt);
  };

  const handleBlogEdit = (blog: BlogListItem) => {
    onEditBlog?.(blog);
  };

  const handleBlogMenu = (blog: BlogListItem) => {
    setActionMenuBlog(blog);
    setActionMenuVisible(true);
  };

  const handleActionMenuSelect = async (actionKey: string) => {
    if (!actionMenuBlog) return;
    const current = actionMenuBlog;
    try {
      if (actionKey === 'edit') {
        onEditBlog?.(current);
      } else if (actionKey === 'publish') {
        await updateBlog(current.id, { status: 'PUBLISHED' });
        feedback.success('Published', 'Article has been published successfully.');
      } else if (actionKey === 'unpublish') {
        await updateBlog(current.id, { status: 'DRAFT' });
        feedback.warning('Unpublished', 'Article reverted to draft mode.');
      } else if (actionKey === 'archive') {
        await updateBlog(current.id, { status: 'ARCHIVED' });
        feedback.info('Archived', 'Article has been archived.');
      } else if (actionKey === 'restore') {
        await updateBlog(current.id, { status: 'PUBLISHED' });
        feedback.success('Restored', 'Article restored to published.');
      } else if (actionKey === 'delete') {
        await deleteBlog(current.id);
        feedback.success('Deleted', 'Article has been removed.');
      }
    } catch (err: any) {
      feedback.error('Error', err?.message || 'Action failed.');
    }
  };

  const handleStatusChange = (status: BlogStatusFilter) => setActiveStatus(status);

  const handleShellTabPress = (tab: string) => {
    if ((tab === 'events' || tab === 'news' || tab === 'rights') && onTabPress) {
      onTabPress(tab);
      return;
    }
    if (tab !== 'blogs') {
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
      {/* Page header: title/subtitle + Add Blog */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <Text style={styles.pageTitle}>Blogs</Text>
          <Text
            style={styles.pageSubtitle}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            numberOfLines={1}
          >
            Create, manage and publish blog articles.
          </Text>
        </View>
        <AppButton
          title="Add Blog"
          size="sm"
          onPress={handleAddBlog}
          icon={<Text style={styles.addIcon}>+</Text>}
          textStyle={styles.addButtonText}
          style={styles.addButton}
        />
      </View>

      <View style={styles.statsSection}>
        <BlogSummaryCard stats={stats} />
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
            (filterSheetVisible || activeCategory !== null || activeStatus !== 'ALL' || activeDateRange !== 'ANY') &&
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
        <BlogStatusTabs
          tabs={statusTabs}
          activeTab={activeStatus}
          onTabChange={handleStatusChange}
        />
      </View>

      <BlogListHeader />
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Unified official Admin Header - Fixed at Top */}
      <AdminHeader />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <FlatList
          data={uiState === 'loading' ? [] : filteredBlogs}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderListHeader}
          renderItem={({ item }) => (
            <BlogCard
              blog={item}
              onPress={handleBlogPress}
              onEditPress={handleBlogEdit}
              onMorePress={handleBlogMenu}
            />
          )}
          ListEmptyComponent={
            uiState === 'loading' ? (
              <LoadingListView />
            ) : uiState === 'error' ? (
              <AppErrorState
                title="Unable to load blogs."
                message="Something went wrong while loading blogs. Please try again."
                onRetry={handleRetry}
                style={styles.errorState}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <AppEmptyState
                  icon="🔍"
                  title="No blogs found"
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

      <BlogFilterSheet
        visible={filterSheetVisible}
        categories={SAMPLE_BLOG_CATEGORIES}
        applied={appliedFilters}
        onApply={handleApplyFilters}
        onReset={clearFilters}
        onClose={() => setFilterSheetVisible(false)}
      />

      <BlogActionMenu
        visible={actionMenuVisible}
        blog={actionMenuBlog}
        onAction={handleActionMenuSelect}
        onClose={() => {
          setActionMenuVisible(false);
          setActionMenuBlog(null);
        }}
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
    width: 44,
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
