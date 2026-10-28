import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  Shadows,
  Spacing,
  UserFontFamilies,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import { Calendar } from '../../../../core/components/icons';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeBlogItem, HomeTab } from '../../home/types/home.types';
import {
  fetchPublishedBlogs,
  DEFAULT_HOME_BLOGS,
} from '../../home/services/user-blogs.service';

const FALLBACK_BLOG_IMAGE = require('../../../../assets/images/article-rights-book.jpg');

export interface UserBlogsScreenProps {
  onBack: () => void;
  onOpenBlog: (blog: HomeBlogItem) => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenRights?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenContact?: () => void;
  showBottomNav?: boolean;
  hideBottomNav?: boolean;
}

export const UserBlogsScreen: React.FC<UserBlogsScreenProps> = ({
  onBack,
  onOpenBlog,
  onOpenHome,
  onOpenAbout,
  onOpenRights,
  onOpenEvents,
  onOpenNews,
  onOpenContact,
  showBottomNav = false,
  hideBottomNav = true,
}) => {
  const [blogs, setBlogs] = useState<HomeBlogItem[]>(DEFAULT_HOME_BLOGS);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const loadBlogs = useCallback(async () => {
    try {
      const items = await fetchPublishedBlogs(30);
      if (items && items.length > 0) {
        setBlogs(items);
      }
    } catch (err) {
      console.warn('Failed to load published blogs:', err);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
    const interval = setInterval(loadBlogs, 5000);
    return () => clearInterval(interval);
  }, [loadBlogs]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBlogs();
    setRefreshing(false);
  };

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('ALL');
    blogs.forEach(b => {
      if (b.category) cats.add(b.category);
    });
    return Array.from(cats);
  }, [blogs]);

  // Filtered blogs based on search query and category
  const filteredBlogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return blogs.filter(b => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        b.category.toUpperCase() === selectedCategory.toUpperCase();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [blogs, searchQuery, selectedCategory]);

  const featuredBlog = filteredBlogs[0];
  const regularBlogs = filteredBlogs.slice(1);

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome ? onOpenHome() : onBack();
    } else if (tab.id === 'about') {
      onOpenAbout?.();
    } else if (tab.id === 'rights') {
      onOpenRights?.();
    } else if (tab.id === 'events') {
      onOpenEvents?.();
    } else if (tab.id === 'news') {
      onOpenNews?.();
    } else if (tab.id === 'contact') {
      onOpenContact?.();
    }
  };

  const renderBlogItem = ({ item }: { item: HomeBlogItem }) => {
    const imageSource = item.thumbnailUrl
      ? { uri: item.thumbnailUrl }
      : FALLBACK_BLOG_IMAGE;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onOpenBlog(item)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Article: ${item.title}`}
      >
        <Image source={imageSource} style={styles.cardThumb} resizeMode="cover" />
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardCategory} numberOfLines={1}>
              {item.category}
            </Text>
            <Text style={styles.cardDate}>{item.date}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.cardExcerpt} numberOfLines={2}>
            {item.excerpt}
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.cardAuthorRow}>
              <AppIcon name="user" size={12} color={AdminColors.textMuted} />
              <Text style={styles.cardAuthor} numberOfLines={1}>
                {item.author}
              </Text>
            </View>
            <View style={styles.readMorePill}>
              <Text style={styles.readMoreText}>Read Article</Text>
              <AppIcon name="arrow-right" size={11} color={AdminColors.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <AppIcon name="search" size={17} color={AdminColors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search articles, guides and blogs..."
          placeholderTextColor={AdminColors.textMuted}
          returnKeyType="search"
          accessibilityLabel="Search articles and blogs"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Clear search"
          >
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={item => `cat-${item}`}
        contentContainerStyle={styles.categoryScroll}
        renderItem={({ item }) => {
          const isSelected = selectedCategory === item;
          return (
            <TouchableOpacity
              style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextActive,
                ]}
              >
                {item === 'ALL' ? 'All Articles' : item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Hero Featured Article Card */}
      {featuredBlog && !searchQuery && selectedCategory === 'ALL' && (
        <View style={styles.featuredSection}>
          <View style={styles.featuredBadgeRow}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>FEATURED ARTICLE</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => onOpenBlog(featuredBlog)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Featured: ${featuredBlog.title}`}
          >
            <Image
              source={
                featuredBlog.thumbnailUrl
                  ? { uri: featuredBlog.thumbnailUrl }
                  : FALLBACK_BLOG_IMAGE
              }
              style={styles.featuredCover}
              resizeMode="cover"
            />
            <View style={styles.featuredOverlay} />
            <View style={styles.featuredBody}>
              <View style={styles.featuredCategoryPill}>
                <Text style={styles.featuredCategoryText}>
                  {featuredBlog.category}
                </Text>
              </View>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {featuredBlog.title}
              </Text>
              <Text style={styles.featuredExcerpt} numberOfLines={2}>
                {featuredBlog.excerpt}
              </Text>
              <View style={styles.featuredMetaRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Calendar size={12} color={AdminColors.textOnDark} style={{ marginRight: 4 }} />
                  <Text style={styles.featuredMetaText}>
                    {featuredBlog.date} • ✍️ {featuredBlog.author}
                  </Text>
                </View>
                <View style={styles.featuredArrow}>
                  <AppIcon name="arrow-right" size={14} color={AdminColors.textOnDark} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.allArticlesHeaderRow}>
        <Text style={styles.allArticlesHeading}>
          {searchQuery
            ? `Search Results (${filteredBlogs.length})`
            : selectedCategory === 'ALL'
            ? 'All Publications'
            : selectedCategory}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader onBack={onBack} activeNav="news" />

      <FlatList
        data={!searchQuery && selectedCategory === 'ALL' && featuredBlog ? regularBlogs : filteredBlogs}
        keyExtractor={item => `blog-${item.id}`}
        ListHeaderComponent={renderHeader()}
        keyboardShouldPersistTaps="handled"
        renderItem={renderBlogItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[AdminColors.primary]}
            tintColor={AdminColors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No articles found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query or choosing a different category.
            </Text>
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
              >
                <Text style={styles.resetButtonText}>View All Articles</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {showBottomNav && !hideBottomNav && (
        <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
  },
  navRightPlaceholder: {
    width: 36,
  },
  listContent: {
    paddingBottom: Spacing.xxl + 10,
  },
  listHeader: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm + 2,
    height: 44,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AdminColors.primaryDark,
    marginLeft: Spacing.xs,
    paddingVertical: 0,
  },
  clearSearch: {
    fontSize: 14,
    color: AdminColors.textMuted,
    fontWeight: '700',
    padding: Spacing.xs,
  },
  categoryScroll: {
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    marginRight: Spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: AdminColors.textSecondary,
  },
  categoryChipTextActive: {
    color: AdminColors.textOnDark,
    fontWeight: '700',
  },
  featuredSection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  featuredBadgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  featuredBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  featuredBadgeText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredCard: {
    height: 210,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: AdminColors.primaryDark,
    ...Shadows.card,
  },
  featuredCover: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  featuredBody: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
  },
  featuredCategoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: AdminColors.accentGold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginBottom: 6,
  },
  featuredCategoryText: {
    color: AdminColors.primaryDark,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    color: AdminColors.textOnDark,
    fontFamily: UserFontFamilies.heading,
    marginBottom: 4,
  },
  featuredExcerpt: {
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredMetaText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },
  featuredArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allArticlesHeaderRow: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  allArticlesHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm + 2,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  cardThumb: {
    width: 108,
    height: '100%',
    minHeight: 116,
    backgroundColor: AdminColors.primaryLight,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  cardCategory: {
    fontSize: 9.5,
    fontWeight: '700',
    color: AdminColors.primary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    flex: 1,
    marginRight: 4,
  },
  cardDate: {
    fontSize: 10,
    color: AdminColors.textMuted,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 17.5,
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
  },
  cardExcerpt: {
    fontSize: 11,
    lineHeight: 15,
    color: AdminColors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.xs,
  },
  cardAuthor: {
    fontSize: 10,
    color: AdminColors.textMuted,
    marginLeft: 4,
    fontWeight: '500',
  },
  readMorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  readMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  resetButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.full,
  },
  resetButtonText: {
    color: AdminColors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
