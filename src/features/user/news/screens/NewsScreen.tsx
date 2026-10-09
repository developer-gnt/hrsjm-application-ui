import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, FontFamilies, Shadows, Spacing } from '../../../../core/theme';
import { debounce } from '../../../../core/utils/debounce';
import { AppIcon } from '../../components';
import { HomeHeader } from '../../home/components/HomeHeader';
import { SectionHeader } from '../../home/components/SectionHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { NewsArticleCard } from '../components/NewsArticleCard';
import {
  USER_NEWS_ARTICLES,
  USER_NEWS_HERO_SLIDES,
  type UserNewsArticle,
  type UserNewsCategory,
  type UserNewsContentType,
} from '../data/user-news';

type NewsDateFilter = 'All Dates' | 'Today' | 'This Week' | 'This Month' | 'Older';
type CategoryFilter = UserNewsCategory | 'All';
type ContentTypeFilter = UserNewsContentType | 'All';

interface ParsedPublicationDate {
  value: number;
  localDate: Date;
  hasTime: boolean;
}

interface SearchInputHandle {
  focus: () => void;
}

interface NewsScreenProps {
  onOpenArticle: (article: UserNewsArticle) => void;
  onOpenHome: () => void;
  onOpenAbout: () => void;
  onOpenRights: () => void;
  onOpenEvents: () => void;
  onOpenContact: () => void;
}

const DATE_FILTERS: NewsDateFilter[] = [
  'All Dates',
  'Today',
  'This Week',
  'This Month',
  'Older',
];
const SLIDE_INTERVAL_MS = 5000;

const parsePublicationDate = (value: string): ParsedPublicationDate | null => {
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.exec(
    value.trim(),
  );

  let date: Date;
  const hasTime = Boolean(iso?.[4]);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]) - 1;
    const day = Number(iso[3]);
    const hour = Number(iso[4] ?? 0);
    const minute = Number(iso[5] ?? 0);
    const second = Number(iso[6] ?? 0);
    date = iso[7]
      ? new Date(value)
      : new Date(year, month, day, hour, minute, second);
    const localComponentsMatch = iso[7]
      ? true
      : date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day &&
        date.getHours() === hour &&
        date.getMinutes() === minute &&
        date.getSeconds() === second;
    if (
      !Number.isFinite(date.getTime()) ||
      month < 0 ||
      month > 11 ||
      day < 1 ||
      !localComponentsMatch
    ) {
      return null;
    }
  } else {
    const displayDate = /^(\d{1,2})\s+([a-z]{3})\s+(\d{4})$/i.exec(value.trim());
    if (!displayDate) {
      return null;
    }
    const months: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const month = months[displayDate[2].toLowerCase()];
    if (month === undefined) {
      return null;
    }
    const year = Number(displayDate[3]);
    const day = Number(displayDate[1]);
    date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }
  }

  return {
    value: date.getTime(),
    localDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    hasTime,
  };
};

const isDateInFilter = (
  article: UserNewsArticle,
  filter: NewsDateFilter,
  now: Date,
): boolean => {
  if (filter === 'All Dates') {
    return true;
  }

  const publication = parsePublicationDate(article.publishedAt);
  if (!publication) {
    return false;
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const publishedDay = publication.localDate;
  const isFuturePublication = publication.hasTime
    ? publication.value > now.getTime()
    : publishedDay.getTime() > today.getTime();
  if (isFuturePublication) {
    return false;
  }
  if (filter === 'Today') {
    return publishedDay.getTime() === today.getTime();
  }
  if (filter === 'This Week') {
    const weekStart = new Date(today);
    const daysSinceMonday = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - daysSinceMonday);
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return publishedDay >= weekStart && publishedDay < nextWeek;
  }
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  if (filter === 'This Month') {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return publishedDay >= monthStart && publishedDay < nextMonth;
  }
  return publishedDay < monthStart;
};

export const NewsScreen: React.FC<NewsScreenProps> = ({
  onOpenArticle,
  onOpenHome,
  onOpenAbout,
  onOpenRights,
  onOpenEvents,
  onOpenContact,
}) => {
  const { width } = useWindowDimensions();
  const slideWidth = width;
  const searchRef = useRef<SearchInputHandle | null>(null);
  const heroRef = useRef<ScrollViewInstance | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [contentType, setContentType] = useState<ContentTypeFilter>('All');
  const [dateFilter, setDateFilter] = useState<NewsDateFilter>('All Dates');
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState<CategoryFilter>('All');
  const [draftContentType, setDraftContentType] = useState<ContentTypeFilter>('All');
  const [draftDateFilter, setDraftDateFilter] = useState<NewsDateFilter>('All Dates');
  const debouncedSearch = useMemo(() => debounce(setSearch, 300), []);
  const categories = useMemo(
    () => [...new Set(USER_NEWS_ARTICLES.map(article => article.category))],
    [],
  );
  const contentTypes = useMemo(
    () => [...new Set(USER_NEWS_ARTICLES.map(article => article.contentType))],
    [],
  );

  const handleBack = useCallback(() => {
    onOpenHome();
  }, [onOpenHome]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (filterOpen) {
        setFilterOpen(false);
        return true;
      }
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [filterOpen, handleBack]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(current => {
        const next = (current + 1) % USER_NEWS_HERO_SLIDES.length;
        heroRef.current?.scrollTo({ x: next * slideWidth, animated: true });
        return next;
      });
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slideWidth]);

  const visibleArticles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return USER_NEWS_ARTICLES
      .filter(article => {
        const matchesCategory = category === 'All' || article.category === category;
        const matchesType = contentType === 'All' || article.contentType === contentType;
        const matchesDate = isDateInFilter(article, dateFilter, now);
        const searchableText = [
          article.title,
          article.excerpt,
          article.category,
          ...article.tags,
        ].join(' ').toLocaleLowerCase();
        return (
          matchesCategory &&
          matchesDate &&
          matchesType &&
          (!query || searchableText.includes(query))
        );
      })
      .sort((a, b) => {
        const aDate = parsePublicationDate(a.publishedAt);
        const bDate = parsePublicationDate(b.publishedAt);
        if (!aDate || !bDate) {
          return aDate ? -1 : bDate ? 1 : 0;
        }
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const aIsFuture = aDate.hasTime
          ? aDate.value > now.getTime()
          : aDate.localDate.getTime() > today;
        const bIsFuture = bDate.hasTime
          ? bDate.value > now.getTime()
          : bDate.localDate.getTime() > today;
        if (aIsFuture !== bIsFuture) {
          return aIsFuture ? 1 : -1;
        }
        if (aIsFuture) {
          return aDate.value - bDate.value;
        }
        return bDate.value - aDate.value;
      });
  }, [category, contentType, dateFilter, now, search]);

  const filtersActive =
    category !== 'All' || contentType !== 'All' || dateFilter !== 'All Dates';

  const openFilters = () => {
    setDraftCategory(category);
    setDraftContentType(contentType);
    setDraftDateFilter(dateFilter);
    setFilterOpen(true);
  };

  const clearFilters = (clearSearch = false) => {
    setCategory('All');
    setContentType('All');
    setDateFilter('All Dates');
    setFilterOpen(false);
    if (clearSearch) {
      setSearchText('');
      setSearch('');
      debouncedSearch('');
    }
  };

  const applyFilters = () => {
    setCategory(draftCategory);
    setContentType(draftContentType);
    setDateFilter(draftDateFilter);
    setFilterOpen(false);
  };

  const handleHeroScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setActiveSlide(Math.max(0, Math.min(nextIndex, USER_NEWS_HERO_SLIDES.length - 1)));
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome();
    } else if (tab.id === 'about') {
      onOpenAbout();
    } else if (tab.id === 'rights') {
      onOpenRights();
    } else if (tab.id === 'events') {
      onOpenEvents();
    } else if (tab.id === 'contact') {
      onOpenContact();
    }
  };

  const listHeader = (
    <>
      <View style={styles.hero}>
        <ScrollView
          ref={scroll => {
            heroRef.current = scroll;
          }}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleHeroScroll}
          accessibilityLabel="Latest News highlights"
        >
          {USER_NEWS_HERO_SLIDES.map(slide => (
            <ImageBackground
              key={slide.id}
              source={slide.image}
              style={[styles.heroSlide, { width: slideWidth }]}
              imageStyle={styles.heroImage}
              resizeMode="cover"
            >
              <View style={styles.heroShade} />
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>
                  {slide.title}{' '}
                  <Text style={styles.heroAccent}>{slide.accent}</Text>
                </Text>
                <Text style={styles.heroDescription}>{slide.description}</Text>
              </View>
              <View style={styles.pagination}>
                {USER_NEWS_HERO_SLIDES.map((dot, index) => (
                  <TouchableOpacity
                    key={dot.id}
                    style={[styles.dot, index === activeSlide && styles.activeDot]}
                    onPress={() => heroRef.current?.scrollTo({ x: index * slideWidth, animated: true })}
                    accessibilityRole="button"
                    accessibilityLabel={`Show highlight ${index + 1}`}
                    accessibilityState={{ selected: index === activeSlide }}
                  />
                ))}
              </View>
            </ImageBackground>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        accessibilityLabel="News categories"
      >
        {(['All', ...categories] as CategoryFilter[]).map(item => {
          const selected = category === item;
          return (
            <TouchableOpacity
              key={item}
              style={[styles.categoryChip, selected && styles.categoryChipSelected]}
              onPress={() => setCategory(item)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Filter news by ${item}`}
              accessibilityState={{ selected }}
            >
              <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <AppIcon name="search" size={19} color={AdminColors.primaryDark} />
          <TextInput
            ref={input => {
              searchRef.current = input;
            }}
            value={searchText}
            onChangeText={value => {
              setSearchText(value);
              debouncedSearch(value);
            }}
            placeholder="Search news..."
            placeholderTextColor={AdminColors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search news by title, excerpt, category or tag"
          />
          {searchText.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setSearch('');
                debouncedSearch('');
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearSearch}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, filtersActive && styles.filterButtonActive]}
          onPress={openFilters}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open news filters"
        >
          <AppIcon name="filter" size={20} color={AdminColors.primaryDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <SectionHeader
          title="Latest News"
          linkLabel="View All"
          onLinkPress={() => clearFilters(true)}
        />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        onBack={handleBack}
        onPressSearch={() => searchRef.current?.focus()}
      />
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={visibleArticles}
        keyExtractor={article => article.id}
        renderItem={({ item }) => (
          <NewsArticleCard article={item} onPress={onOpenArticle} />
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <AppIcon name="news" size={34} color={AdminColors.textSecondary} />
            <Text style={styles.emptyTitle}>No news found</Text>
            <Text style={styles.emptyDescription}>Try changing your search or filter.</Text>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => clearFilters(true)}
              accessibilityRole="button"
              accessibilityLabel="Clear filters and search"
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
      <UserBottomNavigation activeTab="news" onTabPress={handleTabPress} />

      <Modal
        visible={filterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setFilterOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close news filters"
          />
          <View style={styles.filterSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter News</Text>
            <ScrollView
              style={styles.filterOptions}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.optionWrap}>
                {(['All', ...categories] as CategoryFilter[]).map(item => (
                  <FilterOption
                    key={item}
                    label={item}
                    selected={draftCategory === item}
                    onPress={() => setDraftCategory(item)}
                  />
                ))}
              </View>
              <Text style={styles.filterLabel}>Content Type</Text>
              <View style={styles.optionWrap}>
                {(['All', ...contentTypes] as ContentTypeFilter[]).map(item => (
                  <FilterOption
                    key={item}
                    label={item}
                    selected={draftContentType === item}
                    onPress={() => setDraftContentType(item)}
                  />
                ))}
              </View>
              <Text style={styles.filterLabel}>Date</Text>
              <View style={styles.optionWrap}>
                {DATE_FILTERS.map(item => (
                  <FilterOption
                    key={item}
                    label={item}
                    selected={draftDateFilter === item}
                    onPress={() => setDraftDateFilter(item)}
                  />
                ))}
              </View>
            </ScrollView>
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.clearSheetButton}
                onPress={() => clearFilters()}
                accessibilityRole="button"
                accessibilityLabel="Clear filters"
              >
                <Text style={styles.clearSheetText}>Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
                accessibilityRole="button"
                accessibilityLabel="Apply filters"
              >
                <Text style={styles.applyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

interface FilterOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const FilterOption: React.FC<FilterOptionProps> = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.filterOption, selected && styles.filterOptionSelected]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="radio"
    accessibilityLabel={label}
    accessibilityState={{ selected }}
  >
    <Text style={[styles.filterOptionText, selected && styles.filterOptionTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.md,
  },
  hero: {
    marginTop: Spacing.md,
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryDark,
  },
  heroSlide: {
    height: 178,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    borderRadius: 0,
  },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 40, 96, 0.25)',
  },
  heroCopy: {
    width: '74%',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  heroTitle: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  heroAccent: {
    color: AdminColors.accentGold,
  },
  heroDescription: {
    color: AdminColors.textOnDark,
    fontSize: 13,
    lineHeight: 19,
    marginTop: Spacing.xs,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.base,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.55)',
    marginRight: Spacing.xs,
  },
  activeDot: {
    backgroundColor: AdminColors.accentGold,
    width: 9,
    height: 9,
  },
  categoryRow: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: AdminColors.cardSurface,
    borderColor: AdminColors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.xs,
  },
  categoryChipSelected: {
    backgroundColor: AdminColors.accentGold,
    borderColor: AdminColors.accentGold,
  },
  categoryText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: AdminColors.primaryDark,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.sm,
  },
  searchBox: {
    minHeight: 46,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderColor: AdminColors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: AdminColors.textPrimary,
    fontSize: 14,
    paddingVertical: 0,
    paddingHorizontal: Spacing.sm,
  },
  clearSearch: {
    color: AdminColors.primary,
    fontSize: 12,
    fontWeight: '600',
    paddingLeft: Spacing.xs,
  },
  filterButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
    borderColor: AdminColors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.cardSurface,
  },
  filterButtonActive: {
    backgroundColor: AdminColors.accentGoldLight,
    borderColor: AdminColors.accentGold,
  },
  sectionHeader: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  emptyDescription: {
    color: AdminColors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    marginTop: Spacing.xs,
  },
  clearFiltersButton: {
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.accentGold,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  clearFiltersText: {
    color: AdminColors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  filterSheet: {
    maxHeight: '85%',
    backgroundColor: AdminColors.cardSurface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    ...Shadows.floating,
  },
  filterOptions: {
    flexShrink: 1,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.border,
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: Spacing.base,
  },
  filterLabel: {
    color: AdminColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  filterOptionSelected: {
    backgroundColor: AdminColors.accentGoldLight,
    borderColor: AdminColors.accentGold,
  },
  filterOptionText: {
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  filterOptionTextSelected: {
    color: AdminColors.primaryDark,
    fontWeight: '700',
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  clearSheetButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  clearSheetText: {
    color: AdminColors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  applyButton: {
    backgroundColor: AdminColors.accentGold,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  applyText: {
    color: AdminColors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
});
