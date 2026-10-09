import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, FontFamilies, Shadows, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import { ContactHeader } from '../../contact/components/ContactHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import {
  USER_EVENT_CATEGORIES,
  USER_EVENTS,
  type UserEvent,
  type UserEventCategory,
} from '../data/user-events';

interface UserEventsScreenProps {
  onBack: () => void;
  onOpenEvent: (event: UserEvent) => void;
  onOpenAbout: () => void;
  onOpenRights: () => void;
  onOpenContact: () => void;
  onOpenNews: () => void;
}

interface SearchInputHandle {
  focus: () => void;
}

type EventDateFilter = 'All Dates' | 'Today' | 'Upcoming' | 'Past';
type EventCategoryFilter = 'All' | UserEventCategory;
type EventLocationFilter = 'All Locations' | string;

const CATEGORY_COLORS: Record<UserEventCategory, { background: string; text: string }> = {
  Workshop: { background: '#FFF1C9', text: '#8A5A00' },
  Awareness: { background: '#FCE9DF', text: '#9C4F2E' },
  Community: { background: '#E7F4E8', text: '#397047' },
  Education: { background: '#E8F0FB', text: '#315A90' },
};

const MONTHS: Record<string, number> = {
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

const DATE_FILTERS: EventDateFilter[] = ['All Dates', 'Today', 'Upcoming', 'Past'];

const parseEventDate = (
  event: UserEvent,
): { value: number; date: Date; hasTime: boolean } | null => {
  const match = /^(\d{1,2})\s+([a-z]{3})\s+(\d{4})$/i.exec(event.date.trim());
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = MONTHS[match[2].toLowerCase()];
  const year = Number(match[3]);
  if (month === undefined) {
    return null;
  }

  const timeText = event.time.split(/[–—-]/, 1)[0].trim();
  const timeMatch = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i.exec(timeText);
  let hour = 0;
  let minute = 0;
  if (timeMatch) {
    const hour12 = Number(timeMatch[1]);
    minute = Number(timeMatch[2] ?? 0);
    if (hour12 < 1 || hour12 > 12 || minute > 59) {
      return null;
    }
    hour = (hour12 % 12) + (timeMatch[3].toUpperCase() === 'PM' ? 12 : 0);
  }

  const date = new Date(year, month, day, hour, minute);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { value: date.getTime(), date, hasTime: Boolean(timeMatch) };
};

const getEventDateState = (
  event: UserEvent,
  now: Date,
): 'today' | 'upcoming' | 'past' | 'invalid' => {
  const parsed = parseEventDate(event);
  if (!parsed) {
    return 'invalid';
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const eventDay = new Date(
    parsed.date.getFullYear(),
    parsed.date.getMonth(),
    parsed.date.getDate(),
  ).getTime();

  if (eventDay < today) {
    return 'past';
  }
  if (eventDay > today) {
    return 'upcoming';
  }
  return !parsed.hasTime || parsed.value >= now.getTime() ? 'today' : 'past';
};

const compareEventsByDate = (a: UserEvent, b: UserEvent, now: Date): number => {
  const aDate = parseEventDate(a);
  const bDate = parseEventDate(b);
  if (!aDate || !bDate) {
    return aDate ? -1 : bDate ? 1 : 0;
  }

  const order = { today: 0, upcoming: 1, past: 2, invalid: 3 };
  const aState = getEventDateState(a, now);
  const bState = getEventDateState(b, now);
  if (aState !== bState) {
    return order[aState] - order[bState];
  }

  return aState === 'past'
    ? bDate.value - aDate.value
    : aDate.value - bDate.value;
};

const getEventCity = (location: string): string =>
  location.split(',')[0].trim() || location.trim();

export const UserEventsScreen: React.FC<UserEventsScreenProps> = ({
  onBack,
  onOpenEvent,
  onOpenAbout,
  onOpenRights,
  onOpenContact,
  onOpenNews,
}) => {
  const searchRef = useRef<SearchInputHandle | null>(null);
  const [search, setSearch] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [category, setCategory] = useState<EventCategoryFilter>('All');
  const [dateFilter, setDateFilter] = useState<EventDateFilter>('All Dates');
  const [location, setLocation] = useState<EventLocationFilter>('All Locations');
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState<EventCategoryFilter>('All');
  const [draftDateFilter, setDraftDateFilter] = useState<EventDateFilter>('All Dates');
  const [draftLocation, setDraftLocation] = useState<EventLocationFilter>('All Locations');

  const categories = useMemo(
    () => [...new Set(USER_EVENTS.map(event => event.category))],
    [],
  );
  const locations = useMemo(
    () => [...new Set(USER_EVENTS.map(event => getEventCity(event.location)))].sort(),
    [],
  );

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (filterOpen) {
        setFilterOpen(false);
        return true;
      }
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [filterOpen, onBack]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const events = useMemo(() => {
    const query = search.trim().toLowerCase();
    return USER_EVENTS.filter(event => {
      const state = getEventDateState(event, now);
      const matchesCategory = category === 'All' || event.category === category;
      const matchesDate =
        dateFilter === 'All Dates' ||
        (dateFilter === 'Today' && state === 'today') ||
        (dateFilter === 'Upcoming' && (state === 'today' || state === 'upcoming')) ||
        (dateFilter === 'Past' && state === 'past');
      const matchesLocation =
        location === 'All Locations' || getEventCity(event.location) === location;
      const matchesQuery =
        !query ||
        `${event.title} ${event.location} ${event.tag} ${event.category}`
          .toLowerCase()
          .includes(query);
      return matchesQuery && matchesCategory && matchesDate && matchesLocation;
    }).sort((a, b) => compareEventsByDate(a, b, now));
  }, [category, dateFilter, location, now, search]);

  const filtersActive =
    category !== 'All' || dateFilter !== 'All Dates' || location !== 'All Locations';

  const openFilters = () => {
    setDraftCategory(category);
    setDraftDateFilter(dateFilter);
    setDraftLocation(location);
    setFilterOpen(true);
  };

  const clearFilters = () => {
    setCategory('All');
    setDateFilter('All Dates');
    setLocation('All Locations');
    setSearch('');
    setFilterOpen(false);
  };

  const applyFilters = () => {
    setCategory(draftCategory);
    setDateFilter(draftDateFilter);
    setLocation(draftLocation);
    setFilterOpen(false);
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onBack();
    } else if (tab.id === 'about') {
      onOpenAbout();
    } else if (tab.id === 'rights') {
      onOpenRights();
    } else if (tab.id === 'contact') {
      onOpenContact();
    } else if (tab.id === 'news') {
      onOpenNews();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ContactHeader onBack={onBack} onPressSearch={() => searchRef.current?.focus()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={USER_EVENTS[0].image} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroShade} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              Events &amp;{'\n'}
              <Text style={styles.heroTitleAccent}>Activities</Text>
            </Text>
            <Text style={styles.heroDescription}>
              Join our events, workshops and community programs to learn, engage and create real change.
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {USER_EVENT_CATEGORIES.map(item => {
            const selected =
              item === 'Upcoming'
                ? dateFilter === 'Upcoming'
                : item === 'All'
                  ? category === 'All' && dateFilter !== 'Upcoming'
                  : item === category;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                onPress={() => {
                  if (item === 'All') {
                    setCategory('All');
                    setDateFilter('All Dates');
                    setLocation('All Locations');
                  } else if (item === 'Upcoming') {
                    setCategory('All');
                    setDateFilter('Upcoming');
                  } else {
                    setCategory(item);
                  }
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                  {item === 'Workshop' ? 'Workshops' : item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <AppIcon name="search" size={18} color={AdminColors.primaryDark} />
            <TextInput
              ref={input => {
                searchRef.current = input;
              }}
              value={search}
              onChangeText={setSearch}
              placeholder="Search events (e.g. legal awareness, workshop...)"
              placeholderTextColor={AdminColors.textMuted}
              style={styles.searchInput}
              returnKeyType="search"
              accessibilityLabel="Search events"
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, filtersActive && styles.filterButtonActive]}
            onPress={openFilters}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Filter events"
            accessibilityState={{ selected: filtersActive }}
          >
            <AppIcon
              name="filter"
              size={19}
              color={AdminColors.primaryDark}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity
            onPress={clearFilters}
            accessibilityRole="button"
            accessibilityLabel="View all events"
          >
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventList}>
          {events.map(event => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => onOpenEvent(event)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={`View event: ${event.title}`}
            >
              <View style={styles.eventImageWrap}>
                <Image source={event.image} style={styles.eventImage} resizeMode="cover" />
                <View style={styles.dateBadge}>
                  <Text style={styles.dateDay}>{event.day}</Text>
                  <Text style={styles.dateMonth}>{event.month}</Text>
                </View>
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </Text>
                <View style={styles.eventMeta}>
                  <AppIcon name="calendar" size={12} color={AdminColors.textSecondary} />
                  <Text style={styles.eventMetaText} numberOfLines={1}>
                    {event.date}  |  {event.time}
                  </Text>
                </View>
                <View style={styles.eventMeta}>
                  <AppIcon name="map-pin" size={12} color={AdminColors.textSecondary} />
                  <Text style={styles.eventMetaText} numberOfLines={1}>
                    {event.location}
                  </Text>
                </View>
                <View style={styles.tagRow}>
                  <Text style={[styles.eventTag, { backgroundColor: CATEGORY_COLORS[event.category].background, color: CATEGORY_COLORS[event.category].text }]}>
                    {event.category}
                  </Text>
                  <Text style={[styles.eventTag, styles.secondaryTag]} numberOfLines={1}>
                    {event.tag}
                  </Text>
                </View>
              </View>
              <View style={styles.eventArrow}>
                <AppIcon name="arrow-right" size={16} color={AdminColors.textOnDark} />
              </View>
            </TouchableOpacity>
          ))}
          {events.length === 0 ? (
            <Text style={styles.emptyText}>No events match your search or filters.</Text>
          ) : null}
        </View>
      </ScrollView>

      <UserBottomNavigation activeTab="events" onTabPress={handleTabPress} />

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
            accessibilityLabel="Close event filters"
          />
          <View style={styles.filterSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>FILTER EVENTS</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.optionWrap}>
                {(['All', ...categories] as EventCategoryFilter[]).map(item => (
                  <FilterOption
                    key={item}
                    label={item}
                    selected={draftCategory === item}
                    onPress={() => setDraftCategory(item)}
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
              <Text style={styles.filterLabel}>Location</Text>
              <View style={styles.optionWrap}>
                {(['All Locations', ...locations] as EventLocationFilter[]).map(item => (
                  <FilterOption
                    key={item}
                    label={item}
                    selected={draftLocation === item}
                    onPress={() => setDraftLocation(item)}
                  />
                ))}
              </View>
            </ScrollView>
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.clearSheetButton}
                onPress={clearFilters}
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
    accessibilityRole="button"
    accessibilityState={{ selected }}
  >
    <Text style={[styles.filterOptionText, selected && styles.filterOptionTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  hero: {
    width: '100%',
    height: 170,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryDark,
    justifyContent: 'center',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 29, 64, 0.28)',
  },
  heroCopy: {
    width: '63%',
    paddingLeft: Spacing.md,
  },
  heroTitle: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '700',
  },
  heroTitleAccent: {
    color: AdminColors.accentGold,
  },
  heroDescription: {
    color: AdminColors.textOnDark,
    fontSize: 11,
    lineHeight: 15,
    marginTop: Spacing.xs,
  },
  categoryRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  categoryChip: {
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    minHeight: 30,
    justifyContent: 'center',
  },
  categoryChipSelected: {
    backgroundColor: AdminColors.accentGold,
  },
  categoryText: {
    color: AdminColors.primaryDark,
    fontSize: 10,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: AdminColors.primaryDark,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchBox: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
    paddingHorizontal: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: Spacing.sm,
    color: AdminColors.textPrimary,
    fontSize: 11,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.cardSurface,
  },
  filterButtonActive: {
    borderColor: AdminColors.accentGold,
    backgroundColor: AdminColors.accentGoldLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 18,
    fontWeight: '700',
  },
  viewAll: {
    color: AdminColors.primaryDark,
    fontSize: 10,
    fontWeight: '700',
  },
  eventList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  eventCard: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    ...Shadows.card,
  },
  eventImageWrap: {
    width: 96,
    height: 86,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryLight,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  dateBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    minWidth: 31,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xs,
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  dateDay: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
  },
  dateMonth: {
    color: AdminColors.primaryDark,
    fontSize: 7,
    lineHeight: 9,
    fontWeight: '700',
  },
  eventContent: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  eventTitle: {
    color: AdminColors.primaryDark,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  eventMetaText: {
    flex: 1,
    minWidth: 0,
    color: AdminColors.textSecondary,
    fontSize: 8.5,
    lineHeight: 11,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  eventTag: {
    overflow: 'hidden',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: '600',
  },
  secondaryTag: {
    maxWidth: 108,
    backgroundColor: AdminColors.accentGoldLight,
    color: '#8A5A00',
  },
  eventArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  emptyText: {
    color: AdminColors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: Spacing.xxl,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  filterSheet: {
    maxHeight: '82%',
    backgroundColor: AdminColors.background,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    ...Shadows.floating,
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
    fontSize: 21,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  filterLabel: {
    color: AdminColors.textPrimary,
    fontSize: 13,
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
    marginTop: Spacing.md,
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
