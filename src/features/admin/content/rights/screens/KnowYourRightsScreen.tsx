import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import {
  AppEmptyState,
  AppErrorState,
  AppSearchBar,
  SkeletonCard,
  feedback,
} from '../../../../../core';
import {
  House,
  UsersRound,
  FileText,
  MessageSquare,
  LayoutGrid,
  Filter,
  Plus,
} from '../../../../../core/components/icons';
import { AppBottomNavigation } from '../../../../../core/components/common/AppBottomNavigation';
import { AppRoutes } from '../../../../../core/constants/routes';
import { RightsCard, RightsListHeader } from '../components/RightsCard';
import { RightsFilterSheet } from '../components/RightsFilterSheet';
import { RightsStatusTabs } from '../components/RightsStatusTabs';
import { RightsSummaryCard } from '../components/RightsSummaryCard';
import { RightsActionMenu } from '../components/RightsActionMenu';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import {
  getRightsList,
  updateRightApi,
  deleteRightApi,
} from '../services/rights.service';
import {
  DEMO_RIGHTS_STATS,
  SAMPLE_RIGHTS_ARTICLES,
  SAMPLE_RIGHTS_ARTICLE_DETAILS,
  SAMPLE_RIGHTS_CATEGORIES,
} from '../data/sample-rights';
import type {
  RightsArticle,
  RightsFilterState,
  RightsFilterTab,
  RightsListItem,
  RightsStatsSummary,
  RightsStatusFilter,
  RightsUiState,
} from '../types/rights.types';

const BOTTOM_NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', Icon: House },
  { key: 'members', label: 'Members', Icon: UsersRound },
  { key: 'applications', label: 'Applications', Icon: FileText },
  { key: 'complaints', label: 'Complaints', Icon: MessageSquare },
  { key: 'more', label: 'More', Icon: LayoutGrid },
];

/** Date-range window in days for date filter. */
const DATE_FILTER_DAYS: Record<string, number> = { TODAY: 1, WEEK: 7, MONTH: 31 };

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

const rightsDateValue = (date: string): number => {
  const parts = date ? date.split(' ') : [];
  if (parts.length < 3) return 0;
  const [day, month, year] = parts;
  return Date.UTC(Number(year), RIGHTS_MONTH_INDEX[month] ?? 0, Number(day));
};

const RightsRowSkeleton: React.FC = () => (
  <View style={styles.skeletonRow}>
    <SkeletonCard height={58} borderRadius={10} style={styles.skeletonThumb} />
    <View style={styles.skeletonLines}>
      <SkeletonCard height={14} />
      <SkeletonCard height={12} />
      <SkeletonCard height={10} />
    </View>
  </View>
);

const LoadingListView: React.FC = () => (
  <View style={styles.skeletonList}>
    {[0, 1, 2, 3, 4].map(index => (
      <RightsRowSkeleton key={index} />
    ))}
  </View>
);

interface KnowYourRightsScreenProps {
  onAddRights?: () => void;
  onOpenArticle?: (article: RightsArticle) => void;
  onEditArticle?: (article: RightsArticle) => void;
  onTabPress?: (tab: string) => void;
  showBottomNav?: boolean;
}

export const KnowYourRightsScreen: React.FC<KnowYourRightsScreenProps> = ({
  onAddRights,
  onOpenArticle,
  onEditArticle,
  onTabPress,
  showBottomNav = false,
}) => {
  const navigation = useNavigation<any>();
  const { width: windowWidth } = useWindowDimensions();

  const [uiState, setUiState] = useState<RightsUiState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<RightsStatusFilter>('ALL');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDateRange, setActiveDateRange] = useState('ANY');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const [actionMenuArticle, setActionMenuArticle] = useState<RightsListItem | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);

  const [articles, setArticles] = useState<RightsArticle[]>([]);
  const [stats, setStats] = useState<RightsStatsSummary>({
    total: 12,
    published: 8,
    drafts: 2,
    archived: 2,
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
      if (data.stats && (data.stats.total > 0 || data.rights.length > 0)) {
        setStats(data.stats);
      } else {
        // Compute dynamic stats from loaded articles
        const total = data.rights.length;
        const published = data.rights.filter(r => r.status === 'PUBLISHED').length;
        const drafts = data.rights.filter(r => r.status === 'DRAFT').length;
        const archived = data.rights.filter(r => r.status === 'ARCHIVED').length;
        setStats({ total, published, drafts, archived });
      }
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

  const statusTabs = useMemo<RightsFilterTab[]>(
    () => [
      { key: 'ALL', label: 'All', count: stats.total },
      { key: 'PUBLISHED', label: 'Published', count: stats.published },
      { key: 'DRAFT', label: 'Drafts', count: stats.drafts },
      { key: 'ARCHIVED', label: 'Archived', count: stats.archived },
    ],
    [stats],
  );

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
    const daysLimit = activeDateRange !== 'ANY' ? DATE_FILTER_DAYS[activeDateRange] : null;
    const minTimestamp = daysLimit ? Date.now() - daysLimit * 24 * 60 * 60 * 1000 : null;

    return articles
      .filter(article => {
        if (activeStatus !== 'ALL' && article.status !== activeStatus) {
          return false;
        }
        if (activeCategory && article.category.toLowerCase() !== activeCategory.toLowerCase()) {
          return false;
        }
        if (minTimestamp !== null && rightsDateValue(article.lastUpdatedDate) < minTimestamp) {
          return false;
        }
        if (!query) {
          return true;
        }
        const haystack = [article.title, article.description, article.category, article.author, ...(article.tags ?? [])]
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
    if (navigation?.navigate) {
      navigation.navigate(AppRoutes.CREATE_RIGHT);
      return;
    }
    Alert.alert(
      'Add Rights Content',
      'The Create Rights screen will be implemented in the next phase.',
    );
  };

  const handleArticlePress = (article: RightsListItem) => {
    if (onOpenArticle) {
      onOpenArticle(article as RightsArticle);
      return;
    }
    if (navigation?.navigate) {
      navigation.navigate(AppRoutes.RIGHT_DETAILS, { article });
      return;
    }
    Alert.alert(article.title, article.description);
  };

  const handleArticleEdit = (article: RightsListItem) => {
    if (onEditArticle) {
      onEditArticle(article as RightsArticle);
      return;
    }
    if (navigation?.navigate) {
      navigation.navigate(AppRoutes.EDIT_RIGHT, { article });
    }
  };

  const handleArticleMenu = (
    article: RightsListItem,
    anchor?: { x: number; y: number; width: number; height: number },
  ) => {
    setActionMenuArticle(article);
    setActionMenuAnchor(anchor || null);
    setActionMenuVisible(true);
  };

  const handleArticleAction = async (action: string) => {
    if (!actionMenuArticle) return;
    const current = actionMenuArticle;

    try {
      if (action === 'edit') {
        handleArticleEdit(current);
      } else if (action === 'publish') {
        await updateRightApi(current.id, { status: 'PUBLISHED' });
        feedback.success('Published', 'Article has been published live.');
        fetchArticles();
      } else if (action === 'unpublish') {
        await updateRightApi(current.id, { status: 'DRAFT' });
        feedback.warning('Unpublished', 'Article reverted to draft.');
        fetchArticles();
      } else if (action === 'archive') {
        await updateRightApi(current.id, { status: 'ARCHIVED' });
        feedback.info('Archived', 'Article has been archived.');
        fetchArticles();
      } else if (action === 'restore') {
        await updateRightApi(current.id, { status: 'PUBLISHED' });
        feedback.success('Restored', 'Article restored to published.');
        fetchArticles();
      } else if (action === 'delete') {
        Alert.alert(
          'Delete Rights Article',
          `Are you sure you want to delete "${current.title}"? This action cannot be undone.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteRightApi(current.id);
                  feedback.success('Deleted', 'Article has been removed.');
                  fetchArticles();
                } catch (err: any) {
                  Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to delete');
                }
              },
            },
          ],
        );
      }
    } catch (err: any) {
      feedback.error('Error', err?.message || 'Action failed.');
    }
  };

  const handleBottomNavPress = (key: string) => {
    if (onTabPress) {
      onTabPress(key);
      return;
    }
    if (key === 'dashboard') {
      navigation.navigate(AppRoutes.ADMIN_DASHBOARD_TAB);
    } else if (key === 'members') {
      navigation.navigate(AppRoutes.MEMBERS_DIRECTORY);
    } else if (key === 'applications') {
      navigation.navigate(AppRoutes.ADMIN_APPLICATIONS_TAB);
    } else if (key === 'complaints') {
      navigation.navigate(AppRoutes.ADMIN_COMPLAINTS_TAB);
    } else if (key === 'more') {
      navigation.navigate(AppRoutes.ADMIN_MORE_TAB);
    }
  };

  const handleRetry = () => {
    fetchArticles();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArticles();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* 1. Page title, description and Add Article button */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <Text style={styles.pageTitle}>Know Your Rights</Text>
          <Text style={styles.pageSubtitle} numberOfLines={2}>
            Manage and publish rights information and resources.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddRights}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add Rights Content"
        >
          <Plus size={16} color="#011F39" strokeWidth={2.6} />
          <Text style={styles.addBtnText}>Add Article</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Four statistics cards in 2x2 grid */}
      <View style={styles.statsSection}>
        <RightsSummaryCard stats={stats} />
      </View>

      {/* 3. Search and Filters row */}
      <View style={styles.searchRow}>
        <AppSearchBar
          placeholder={windowWidth < 380 ? 'Search rights...' : 'Search by title, category or keyword...'}
          value={searchQuery}
          onSearch={setSearchQuery}
          containerStyle={styles.searchBar}
          inputStyle={styles.searchInput}
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
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Filters"
          accessibilityState={{ expanded: filterSheetVisible }}
        >
          <Filter size={16} color="#06294D" strokeWidth={2.2} />
          <Text style={styles.filterText} numberOfLines={1}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Horizontally scrollable status selectors */}
      <View style={styles.tabsSection}>
        <RightsStatusTabs
          tabs={statusTabs}
          activeTab={activeStatus}
          onTabChange={handleStatusChange}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Official HRSJM Admin Header with unread notification badge */}
      <AdminHeader />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        {uiState === 'loading' && articles.length === 0 ? (
          <View style={styles.loadingWrapper}>
            {renderHeader()}
            <LoadingListView />
          </View>
        ) : uiState === 'error' && articles.length === 0 ? (
          <View style={styles.errorWrapper}>
            {renderHeader()}
            <AppErrorState
              title="Unable to load articles."
              message="Something went wrong while loading rights articles. Please try again."
              onRetry={handleRetry}
              style={styles.errorState}
            />
          </View>
        ) : (
          <FlatList
            data={filteredArticles}
            keyExtractor={item => item.id}
            ListHeaderComponent={renderHeader()}
            
            renderItem={({ item }) => (
              <RightsCard
                article={item}
                onPress={handleArticlePress}
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
            
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>

      {/* Fixed bottom navigation with More highlighted in gold (only when requested) */}
      {showBottomNav && (
        <AppBottomNavigation
          items={BOTTOM_NAV_ITEMS}
          activeKey="more"
          onItemPress={handleBottomNavPress}
        />
      )}

      {/* Slide-out Filter Sheet */}
      <RightsFilterSheet
        visible={filterSheetVisible}
        categories={SAMPLE_RIGHTS_CATEGORIES}
        applied={appliedFilters}
        onApply={handleApplyFilters}
        onReset={clearFilters}
        onClose={() => setFilterSheetVisible(false)}
      />

      {/* Anchored floating action popover menu */}
      <RightsActionMenu
        visible={actionMenuVisible}
        article={actionMenuArticle}
        anchor={actionMenuAnchor}
        onAction={handleArticleAction}
        onClose={() => {
          setActionMenuVisible(false);
          setActionMenuArticle(null);
          setActionMenuAnchor(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF7F0', // HRSJM Warm Ivory
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  headerContainer: {
    paddingBottom: 4,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 10,
    gap: 12,
  },
  pageHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: '#0B2F52',
    lineHeight: 28,
  },
  pageSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#34516D',
    marginTop: 3,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAD465', // HRSJM Gold
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    flexShrink: 0,
  },
  addBtnIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#011F39',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#011F39',
  },
  statsSection: {
    marginTop: 6,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    minWidth: 0,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#DCE4EC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  searchInput: {
    minWidth: 0,
    fontSize: 13.5,
    color: '#0B2F52',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    paddingHorizontal: 14,
    gap: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#DCE4EC',
    flexShrink: 0,
  },
  filterButtonActive: {
    backgroundColor: '#EDF2F7',
    borderColor: '#06294D',
  },
  filterText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#06294D',
  },
  tabsSection: {
    marginBottom: 6,
    marginHorizontal: -16,
  },
  tableHeaderSection: {
    paddingHorizontal: 2,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  loadingWrapper: {
    flex: 1,
  },
  errorWrapper: {
    flex: 1,
  },
  skeletonList: {
    gap: 10,
    marginTop: 8,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
  },
  skeletonThumb: {
    width: 58,
  },
  skeletonLines: {
    flex: 1,
    gap: 6,
  },
  errorState: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 36,
  },
});
