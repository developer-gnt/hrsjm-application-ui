import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { RightsCard, RightsListHeader } from '../components/RightsCard';
import { RightsFilterSheet } from '../components/RightsFilterSheet';
import { RightsStatusTabs } from '../components/RightsStatusTabs';
import { RightsSummaryCard } from '../components/RightsSummaryCard';
import { RightsActionMenu } from '../components/RightsActionMenu';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import { AdminShellHeader } from '../../events/preview/AdminShellHeader';
import { AdminShellTabBar } from '../../events/preview/AdminShellTabBar';
import { getRightsList, deleteRightApi } from '../services/rights.service';
import {
  DEMO_RIGHTS_STATS,
  RIGHTS_STATUS_TABS,
  SAMPLE_RIGHTS_ARTICLES,
  SAMPLE_RIGHTS_ARTICLE_DETAILS,
  SAMPLE_RIGHTS_CATEGORIES,
} from '../data/sample-rights';
import type {
  RightsArticle,
  RightsFilterState,
  RightsListItem,
  RightsStatsSummary,
  RightsStatusFilter,
  RightsUiState,
} from '../types/rights.types';

/** TEMPORARY: local UI demo dataset. Replace with the real useRights hook data. */
const SAMPLE_DATA_LOAD_DELAY_MS = 800;

/** Date-range window in days for the UI-only date filter (approximate). */
const DATE_FILTER_DAYS: Record<string, number> = { TODAY: 1, WEEK: 7, MONTH: 31 };

/** Month abbreviations used by the sample display dates ("28 Sep 2026"). */
const RIGHTS_MONTH_INDEX: Record<string, number> = {
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
const rightsDateValue = (date: string): number => {
  const [day, month, year] = date.split(' ');
  return Date.UTC(Number(year), RIGHTS_MONTH_INDEX[month] ?? 0, Number(day));
};

/** Skeleton placeholder matching the compact article-row shape (UI-only phase). */
const RightsRowSkeleton: React.FC = () => (
  <View style={styles.skeletonRow}>
    <SkeletonCard height={44} borderRadius={8} style={styles.skeletonThumb} />
    <View style={styles.skeletonLines}>
      <SkeletonCard height={10} />
      <SkeletonCard height={10} />
      <SkeletonCard height={8} />
    </View>
  </View>
);

/**
 * Full details for a selected row: the reference article carries demo
 * details, other rows fall back to the row data until the backend contract
 * lands. Used by both the details and the Edit navigation paths so every
 * entry point passes the SAME resolved article.
 */
const resolveArticleDetails = (article: RightsListItem): RightsArticle =>
  SAMPLE_RIGHTS_ARTICLE_DETAILS[article.id] ?? {
    ...article,
    author: 'HRSJM Admin',
    authorRole: 'Admin',
    organization: 'HRSJM',
    content: [article.description],
    highlights: [],
  };

const LoadingListView: React.FC = () => (
  <View style={styles.skeletonList}>
    {[0, 1, 2, 3, 4, 5].map(index => (
      <RightsRowSkeleton key={index} />
    ))}
  </View>
);

interface KnowYourRightsScreenProps {
  /**
   * TEMPORARY (UI-only phase): called when the user taps "+ Add Rights
   * Content". When not provided, a placeholder alert is shown instead. The
   * Create Rights screen does not exist yet and is intentionally NOT built
   * in this phase.
   */
  onAddRights?: () => void;
  /**
   * Called when the user taps a row (opens the Right Article Details screen).
   * When not provided, a placeholder alert is shown.
   */
  onOpenArticle?: (article: RightsArticle) => void;
  /**
   * Called when the user taps a row's Edit button: opens the shared Edit
   * Rights Article screen for that article (same screen as Right Article
   * Details → Edit). Receives the resolved full article details.
   */
  onEditArticle?: (article: RightsArticle) => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell (e.g. jumping to Events/News/Blogs). Tabs this screen does
   * not handle fall back to the shell's preview notice.
   */
  onTabPress?: (tab: string) => void;
  showBottomNav?: boolean;
}

/**
 * Know Your Rights screen (admin content-management list, UI-only phase).
 *
 * Local sample data + local filtering only — NO backend calls. The list is
 * structured (FlatList + data/view-model split) so backend pagination and the
 * real rights hook can replace the sample source without UI changes.
 */
export const KnowYourRightsScreen: React.FC<KnowYourRightsScreenProps> = ({
  onAddRights,
  onOpenArticle,
  onEditArticle,
  onTabPress,
  showBottomNav = false,
}) => {
  const [uiState, setUiState] = useState<RightsUiState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<RightsStatusFilter>('ALL');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDateRange, setActiveDateRange] = useState('ANY');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  // Action sheet state: the article is kept while the sheet closes so the
  // slide-out animation still shows it.
  const [actionMenuArticle, setActionMenuArticle] = useState<RightsListItem | null>(null);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);

  const [articles, setArticles] = useState<RightsArticle[]>([]);
  const [stats, setStats] = useState<RightsStatsSummary>({
    total: 0,
    published: 0,
    drafts: 0,
    archived: 0,
  });

  const fetchArticles = useCallback(async () => {
    try {
      setUiState('loading');
      const data = await getRightsList({
        status: activeStatus !== 'ALL' ? activeStatus : undefined,
        category: activeCategory || undefined,
        dateRange: activeDateRange !== 'ANY' ? activeDateRange : undefined,
        search: searchQuery.trim() || undefined,
      });
      setArticles(data.rights);
      setStats(data.stats);
      setUiState('success');
    } catch (err) {
      console.error('Failed to load rights from API, using fallback:', err);
      setArticles(SAMPLE_RIGHTS_ARTICLES as any);
      setStats(DEMO_RIGHTS_STATS);
      setUiState('success');
    }
  }, [activeStatus, activeCategory, activeDateRange, searchQuery]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const appliedFilters = useMemo<RightsFilterState>(
    () => ({
      status: activeStatus,
      category: activeCategory,
      dateRange: activeDateRange as RightsFilterState['dateRange'],
    }),
    [activeStatus, activeCategory, activeDateRange],
  );

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // UI-only date filter: sample dates sit in Sep 2026, so a real calendar
    // comparison would empty the list. Approximate: "Today/Week/Month" narrow
    // to the N most recent sample records until the backend defines real date
    // semantics. Sorted by the parsed display date, not the raw string.
    let recentIds: Set<string> | null = null;
    if (activeDateRange !== 'ANY') {
      const sortedByDate = [...articles].sort(
        (a, b) => rightsDateValue(b.lastUpdatedDate) - rightsDateValue(a.lastUpdatedDate),
      );
      const limit = DATE_FILTER_DAYS[activeDateRange] ?? 0;
      recentIds = new Set(
        sortedByDate.slice(0, Math.max(1, Math.min(limit, 4))).map(item => item.id),
      );
    }

    return articles
      .filter(article => {
        if (activeStatus !== 'ALL' && article.status !== activeStatus) {
          return false;
        }
        if (activeCategory && article.category !== activeCategory) {
          return false;
        }
        if (recentIds && !recentIds.has(article.id)) {
          return false;
        }
        if (!query) {
          return true;
        }
        const haystack = [article.title, article.description, article.category]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => rightsDateValue(b.lastUpdatedDate) - rightsDateValue(a.lastUpdatedDate));
  }, [articles, searchQuery, activeStatus, activeCategory, activeDateRange]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    activeStatus !== 'ALL' ||
    activeCategory !== null ||
    activeDateRange !== 'ANY';

  const handleApplyFilters = (filters: RightsFilterState) => {
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

  const handleStatusChange = (status: RightsStatusFilter) => setActiveStatus(status);

  const handleAddRights = () => {
    if (onAddRights) {
      onAddRights();
      return;
    }
    Alert.alert(
      'Add Rights Content',
      'The Create Rights screen is not part of this phase. It will be implemented after the backend contract is confirmed.',
    );
  };

  const handleArticlePress = (article: RightsListItem) => {
    if (onOpenArticle) {
      onOpenArticle(article as RightsArticle);
      return;
    }
    Alert.alert(article.title, article.description);
  };

  const handleArticleEdit = (article: RightsListItem) => {
    onEditArticle?.(article as RightsArticle);
  };

  const handleArticleMenu = (article: RightsListItem) => {
    setActionMenuArticle(article);
    setActionMenuVisible(true);
  };

  const handleArticleAction = (action: string) => {
    if (action === 'edit') {
      if (actionMenuArticle) {
        handleArticleEdit(actionMenuArticle);
      }
      return;
    }
    if (action === 'delete') {
      if (!actionMenuArticle) return;
      Alert.alert(
        'Delete Rights Guide',
        `Are you sure you want to delete "${actionMenuArticle.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteRightApi(actionMenuArticle.id);
                fetchArticles();
              } catch (err: any) {
                Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to delete');
              }
            },
          },
        ],
      );
      return;
    }
    Alert.alert(
      action.charAt(0).toUpperCase() + action.slice(1),
      `Action "${action}" completed.`,
    );
  };

  // Preview-shell tabs: hand off to the host for tabs it can navigate to;
  // everything else falls back to the shell's temporary preview notice.
  const handleShellTabPress = (tab: string) => {
    if (tab === 'rights') {
      return;
    }
    if ((tab === 'events' || tab === 'news' || tab === 'blogs') && onTabPress) {
      onTabPress(tab);
      return;
    }
    Alert.alert(
      'Preview shell',
      'Global navigation is owned by the app-level architecture. This bar is a temporary visual preview only.',
    );
  };

  const handleRetry = () => {
    fetchArticles();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArticles();
    setRefreshing(false);
  };

  return (
    <View style={styles.root}>
      <AdminHeader unreadCount={1} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        {/* Page header: title/subtitle + Add Rights Content */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderText}>
            <Text style={styles.pageTitle}>Know Your Rights</Text>
            <Text
              style={styles.pageSubtitle}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              numberOfLines={1}
            >
              Manage informational content about human rights.
            </Text>
          </View>
          <AppButton
            title="Add Rights Content"
            size="sm"
            onPress={handleAddRights}
            icon={<Text style={styles.addIcon}>+</Text>}
            textStyle={styles.addButtonText}
            style={styles.addButton}
          />
        </View>

        <View style={styles.statsSection}>
          <RightsSummaryCard stats={stats} />
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
              (filterSheetVisible ||
                activeCategory !== null ||
                activeStatus !== 'ALL' ||
                activeDateRange !== 'ANY') &&
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
          <RightsStatusTabs
            tabs={RIGHTS_STATUS_TABS}
            activeTab={activeStatus}
            onTabChange={handleStatusChange}
          />
        </View>

        {uiState === 'loading' ? (
          <LoadingListView />
        ) : uiState === 'error' ? (
          <AppErrorState
            title="Unable to load articles."
            message="Something went wrong while loading rights articles. Please try again."
            onRetry={handleRetry}
            style={styles.errorState}
          />
        ) : (
          <FlatList
            data={filteredArticles}
            keyExtractor={item => item.id}
            ListHeaderComponent={RightsListHeader}
            renderItem={({ item }) => (
              <RightsCard
                article={item}
                onPress={handleArticlePress}
                onEditPress={handleArticleEdit}
                onMorePress={handleArticleMenu}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppEmptyState
                  icon="🔍"
                  title="No articles found"
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

      {showBottomNav ? (
        <AdminShellTabBar activeTab="rights" onTabPress={handleShellTabPress} />
      ) : null}

      <RightsFilterSheet
        visible={filterSheetVisible}
        categories={SAMPLE_RIGHTS_CATEGORIES}
        applied={appliedFilters}
        onApply={handleApplyFilters}
        onReset={clearFilters}
        onClose={() => setFilterSheetVisible(false)}
      />

      <RightsActionMenu
        visible={actionMenuVisible}
        article={actionMenuArticle}
        onAction={handleArticleAction}
        onClose={() => setActionMenuVisible(false)}
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
