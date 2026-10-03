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
import { BlogCard, BlogListHeader } from '../components/BlogCard';
import { showBlogActionMenu } from '../components/BlogActionMenu';
import { BlogFilterSheet } from '../components/BlogFilterSheet';
import { BlogStatusTabs } from '../components/BlogStatusTabs';
import { BlogSummaryCard } from '../components/BlogSummaryCard';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import {
  BLOG_STATUS_TABS,
  DEMO_BLOG_STATS,
  SAMPLE_BLOGS,
  SAMPLE_BLOG_CATEGORIES,
} from '../data/sample-blogs';
import type {
  BlogFilterState,
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
   * TEMPORARY (UI-only phase): called when the user taps a blog row (or its
   * Edit action). When not provided, a placeholder alert is shown.
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

/**
 * Blogs List screen (UI-only phase).
 *
 * Local sample data + local filtering only — NO backend calls. The list is
 * structured (FlatList + data/view-model split) so backend pagination and the
 * real blogs hook can replace the sample source without UI changes.
 */
export const BlogsListScreen: React.FC<BlogsListScreenProps> = ({
  onAddBlog,
  onEditBlog,
  onTabPress,
}) => {
  const [uiState, setUiState] = useState<BlogsUiState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<BlogStatusFilter>('ALL');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDateRange, setActiveDateRange] = useState('ANY');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  /** TEMPORARY: replace `blogs` with the data returned by the real useBlogs hook. */
  const blogs = SAMPLE_BLOGS;

  // TEMPORARY (UI-only phase): simulated latency so the loading state is
  // demonstrable during review. Remove when the real blogs hook drives this screen.
  useEffect(() => {
    const timer = setTimeout(() => setUiState('success'), SAMPLE_DATA_LOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Display-only reference numbers (28/6/18/4) — NOT computed from the 8
  // sample rows; replaced by real backend counts when the contract lands.
  const stats = DEMO_BLOG_STATS;

  const appliedFilters = useMemo<BlogFilterState>(
    () => ({ status: activeStatus, category: activeCategory, dateRange: activeDateRange as BlogFilterState['dateRange'] }),
    [activeStatus, activeCategory, activeDateRange],
  );

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return blogs.filter(blog => {
      if (activeStatus !== 'ALL' && blog.status !== activeStatus) {
        return false;
      }
      if (activeCategory && blog.category !== activeCategory) {
        return false;
      }
      // UI-only date filter: sample dates sit in Sep–Aug 2026, so a real
      // calendar comparison would empty the list. Approximate: "Today/Week/
      // Month" narrow to the most recent sample records until the backend
      // defines real date semantics.
      if (activeDateRange !== 'ANY') {
        const sortedByDate = [...blogs].sort((a, b) => b.date.localeCompare(a.date));
        const limit = DATE_FILTER_DAYS[activeDateRange] ?? 0;
        const recentIds = new Set(sortedByDate.slice(0, Math.max(1, Math.min(limit, 4))).map(item => item.id));
        if (!recentIds.has(blog.id)) {
          return false;
        }
      }
      if (!query) {
        return true;
      }
      const haystack = [blog.title, blog.excerpt, blog.category]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [blogs, searchQuery, activeStatus, activeCategory, activeDateRange]);

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
    Alert.alert(
      'Add Blog',
      'The Create Blog screen is not part of this phase. It will be implemented after the backend contract is confirmed.',
    );
  };

  const handleBlogPress = (blog: BlogListItem) => {
    if (onEditBlog) {
      onEditBlog(blog);
      return;
    }
    // UI placeholder only: Edit Blog is a later phase (no backend yet).
    Alert.alert(
      blog.title,
      'The Edit Blog screen will be implemented in a later phase after backend integration.',
    );
  };

  const handleBlogMenu = (blog: BlogListItem) => showBlogActionMenu(blog);

  const handleStatusChange = (status: BlogStatusFilter) => setActiveStatus(status);

  // Preview-shell tabs: hand off to the host for tabs it can navigate to;
  // everything else falls back to the shell's temporary preview notice.
  const handleShellTabPress = (tab: string) => {
    if ((tab === 'events' || tab === 'news') && onTabPress) {
      onTabPress(tab);
      return;
    }
    if (tab !== 'blogs') {
      Alert.alert(
        'Preview shell',
        'Global navigation is owned by the app-level architecture. This bar is a temporary visual preview only.',
      );
    }
  };

  const handleRetry = () => {
    setUiState('loading');
    // TEMPORARY (UI-only phase): retry returns to the sample data — no API call yet.
    setTimeout(() => setUiState('success'), SAMPLE_DATA_LOAD_DELAY_MS);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // TEMPORARY (UI-only phase): simulated refresh latency — no API call yet.
    setTimeout(() => setRefreshing(false), SAMPLE_DATA_LOAD_DELAY_MS);
  };

  return (
    <View style={styles.root}>
      <AdminHeader />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
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
            tabs={BLOG_STATUS_TABS}
            activeTab={activeStatus}
            onTabChange={handleStatusChange}
          />
        </View>

        {uiState === 'loading' ? (
          <LoadingListView />
        ) : uiState === 'error' ? (
          <AppErrorState
            title="Unable to load blogs."
            message="Something went wrong while loading blogs. Please try again."
            onRetry={handleRetry}
            style={styles.errorState}
          />
        ) : (
          <FlatList
            data={filteredBlogs}
            keyExtractor={item => item.id}
            ListHeaderComponent={BlogListHeader}
            renderItem={({ item }) => (
              <BlogCard blog={item} onPress={handleBlogPress} onMorePress={handleBlogMenu} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppEmptyState
                  icon="🔍"
                  title="No blogs found"
                  description="Try changing your search or filters."
                  actionTitle={hasActiveFilters ? 'Clear Filters' : undefined}
                  onAction={hasActiveFilters ? clearFilters : undefined}
                />
              </View>
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

      <BlogFilterSheet
        visible={filterSheetVisible}
        categories={SAMPLE_BLOG_CATEGORIES}
        applied={appliedFilters}
        onApply={handleApplyFilters}
        onReset={clearFilters}
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
