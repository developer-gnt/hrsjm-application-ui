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
import { NewsCard, NewsListHeader } from '../components/NewsCard';
import { showNewsActionMenu } from '../components/NewsActionMenu';
import { NewsFilterSheet } from '../components/NewsFilterSheet';
import { NewsStatusTabs } from '../components/NewsStatusTabs';
import { NewsSummaryStats } from '../components/NewsSummaryCard';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import {
  DEMO_NEWS_STATS,
  NEWS_STATUS_TABS,
  SAMPLE_NEWS,
  SAMPLE_NEWS_CATEGORIES,
} from '../data/sample-news';
import type {
  NewsFilterState,
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
  const [uiState, setUiState] = useState<NewsUiState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<NewsStatusFilter>('ALL');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  /** TEMPORARY: replace `newsItems` with the data returned by the real useNews hook. */
  const newsItems = SAMPLE_NEWS;

  // TEMPORARY (UI-only phase): simulated latency so the loading state is
  // demonstrable during review. Remove when the real news hook drives this screen.
  useEffect(() => {
    const timer = setTimeout(() => setUiState('success'), SAMPLE_DATA_LOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Display-only reference numbers (42/30/8/4) — NOT computed from the 8
  // sample rows; replaced by real backend counts when the contract lands.
  const stats = DEMO_NEWS_STATS;

  const appliedFilters = useMemo<NewsFilterState>(
    () => ({ status: activeStatus, category: activeCategory }),
    [activeStatus, activeCategory],
  );

  const filteredNews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return newsItems.filter(news => {
      if (activeStatus !== 'ALL' && news.status !== activeStatus) {
        return false;
      }
      if (activeCategory && news.category !== activeCategory) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = [news.title, news.summary, news.category]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [newsItems, searchQuery, activeStatus, activeCategory]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || activeStatus !== 'ALL' || activeCategory !== null;

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
    Alert.alert(
      'Add News',
      'The Create News screen is not part of this phase. It will be implemented after the backend contract is confirmed.',
    );
  };

  const handleNewsPress = (news: NewsListItem) => {
    if (onViewNews) {
      onViewNews(news);
      return;
    }
    // UI placeholder only: News Details is connected by the host when ready.
    Alert.alert(
      news.title,
      'The News Details screen will be implemented in a later phase after backend integration.',
    );
  };

  const handleNewsMenu = (news: NewsListItem) => showNewsActionMenu(news);

  const handleStatusChange = (status: NewsStatusFilter) => setActiveStatus(status);

  // Preview-shell tabs: hand off to the host for tabs it can navigate to;
  // everything else falls back to the shell's temporary preview notice.
  const handleShellTabPress = (tab: string) => {
    if ((tab === 'events' || tab === 'blogs') && onTabPress) {
      onTabPress(tab);
      return;
    }
    if (tab !== 'news') {
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
        {/* Page header: title/subtitle + Add News */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderText}>
            <Text style={styles.pageTitle}>News</Text>
            <Text
              style={styles.pageSubtitle}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              numberOfLines={1}
            >
              Manage and publish news, updates and announcements.
            </Text>
          </View>
          <AppButton
            title="Add News"
            size="sm"
            onPress={handleAddNews}
            icon={<Text style={styles.addIcon}>+</Text>}
            textStyle={styles.addButtonText}
            style={styles.addButton}
          />
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
            tabs={NEWS_STATUS_TABS}
            activeTab={activeStatus}
            onTabChange={handleStatusChange}
          />
        </View>

        {uiState === 'loading' ? (
          <LoadingListView />
        ) : uiState === 'error' ? (
          <AppErrorState
            title="Unable to load news."
            message="Something went wrong while loading news. Please try again."
            onRetry={handleRetry}
            style={styles.errorState}
          />
        ) : (
          <FlatList
            data={filteredNews}
            keyExtractor={item => item.id}
            ListHeaderComponent={NewsListHeader}
            renderItem={({ item }) => (
              <NewsCard news={item} onPress={handleNewsPress} onMorePress={handleNewsMenu} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppEmptyState
                  icon="🔍"
                  title="No news found"
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
