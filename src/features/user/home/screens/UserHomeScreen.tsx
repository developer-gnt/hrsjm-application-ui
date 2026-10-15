import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, Spacing } from '../../../../core/theme';
import { HomeHeader } from '../components/HomeHeader';
import { HeroBanner } from '../components/HeroBanner';
import { QuickActionsRow } from '../components/QuickActionCard';
import { AboutSection } from '../components/AboutSection';
import { CategoryIconRow } from '../components/CategoryIconCard';
import { SectionHeader } from '../components/SectionHeader';
import { ImpactSection } from '../components/ImpactSection';
import { HomeEventCard } from '../components/HomeEventCard';
import { NewsCard } from '../components/NewsCard';
import { BlogArticleCard } from '../components/BlogArticleCard';
import { DonationBanner } from '../components/DonationBanner';
import { UserBottomNavigation } from '../components/UserBottomNavigation';
import {
  GUEST_QUICK_ACTIONS,
  LATEST_NEWS,
  RIGHTS_CATEGORIES,
  UPCOMING_EVENTS,
  WHAT_WE_DO_ITEMS,
} from '../data/home-preview-data';
import { USER_EVENTS, type UserEvent } from '../../events/data/user-events';
import { fetchLatestPublishedNews } from '../../news/services/user-news.service';
import {
  fetchPublishedBlogs,
  DEFAULT_HOME_BLOGS,
} from '../services/user-blogs.service';
import { getImpactStats } from '../data/impact-stats-provider';
import { getEventsList } from '../../../admin/content/events/services/events.service';
import type { EventListItem } from '../../../admin/content/events/types/events.types';
import type { HomeBlogItem, HomeEvent, HomeNewsItem, HomeTab } from '../types/home.types';
import type { WhatWeDoId } from '../../what-we-do';
import type { ActionPageId } from '../../action-pages';
import { getHomeActionDestination } from '../utils/home-action-destination';
import { useMembership } from '../../../membership/context/MembershipContext';

const mapEventToHomeEvent = (item: EventListItem): HomeEvent => {
  let day = '25';
  let month = 'OCT';
  if (item.startAt) {
    try {
      const d = new Date(item.startAt);
      if (!isNaN(d.getTime())) {
        day = String(d.getDate()).padStart(2, '0');
        month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      }
    } catch {
      // fallback
    }
  }

  return {
    id: item.id,
    title: item.title,
    day,
    month,
    location: item.location || 'Mumbai, Maharashtra',
    imageAssetName: 'home/events/rights-workshop.png',
    imageUrl: item.coverImageUrl || undefined,
  };
};

export interface UserHomeScreenProps {
  /**
   * Opens the Contact Us screen (Contact tab in the shared six-tab
   * bottom navigation).
   */
  onOpenContact?: () => void;
  onOpenRights?: () => void;
  /** Opens the About page (About tab in the shared six-tab navigation). */
  onOpenAbout?: () => void;
  /** Hides the built-in preview bottom bar when hosted in a tab navigator. */
  hideBottomNav?: boolean;
  /** Opens the Get Help flow from the existing Home quick action card. */
  onOpenGetHelp?: () => void;
  onOpenEvents?: () => void;
  onOpenEvent?: (event: UserEvent) => void;
  onOpenNotifications?: () => void;
  onOpenNews?: () => void;
  onOpenBlogs?: () => void;
  onOpenArticle?: (article: any) => void;
  onOpenRight?: (rightId: string) => void;
  onOpenWhatWeDo?: (contentId: WhatWeDoId) => void;
  onOpenActionPage?: (pageId: ActionPageId) => void;
  onOpenProfile?: () => void;
  onOpenStatus?: () => void;
  initialScrollOffset?: number;
  onScrollOffsetChange?: (offset: number) => void;
}

export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({
  onOpenContact,
  onOpenRights,
  onOpenAbout,
  hideBottomNav = true,
  onOpenGetHelp,
  onOpenEvents,
  onOpenEvent,
  onOpenNotifications,
  onOpenNews,
  onOpenBlogs,
  onOpenArticle,
  onOpenRight,
  onOpenWhatWeDo,
  onOpenActionPage,
  onOpenProfile,
  onOpenStatus,
  initialScrollOffset = 0,
  onScrollOffsetChange,
}) => {
  let hasApplied = false;
  let isReapplying = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const membershipCtx = useMembership();
    hasApplied = Boolean(membershipCtx?.hasApplied);
    isReapplying = Boolean(membershipCtx?.isReapplying);
  } catch {
    // isolated test environment without provider
  }

  const hasRestoredScroll = useRef(false);
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const [latestNews, setLatestNews] = useState<HomeNewsItem[]>(LATEST_NEWS);
  const [blogs, setBlogs] = useState<HomeBlogItem[]>(DEFAULT_HOME_BLOGS);
  const [upcomingEvents, setUpcomingEvents] = useState<HomeEvent[]>(UPCOMING_EVENTS);

  const loadDynamicData = React.useCallback(async () => {
    try {
      const [newsItems, blogItems, eventsRes] = await Promise.all([
        fetchLatestPublishedNews(5),
        fetchPublishedBlogs(8),
        getEventsList({ limit: 10 }),
      ]);
      if (newsItems.length > 0) {
        setLatestNews(newsItems);
      }
      if (blogItems.length > 0) {
        setBlogs(blogItems);
      }
      if (eventsRes && Array.isArray(eventsRes.events) && eventsRes.events.length > 0) {
        const upcomingList = eventsRes.events.filter(e => e.status === 'UPCOMING');
        const listToDisplay = upcomingList.length > 0 ? upcomingList : eventsRes.events;
        setUpcomingEvents(listToDisplay.map(mapEventToHomeEvent));
      }
    } catch (err) {
      console.warn('Error loading dynamic home content:', err);
    }
  }, []);

  useEffect(() => {
    loadDynamicData();

    // Auto-refresh periodically so newly published news and blogs appear automatically in 1st position
    const intervalId = setInterval(loadDynamicData, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, [loadDynamicData]);

  const handleNewsCardPress = (item: HomeNewsItem) => {
    if (item.article && onOpenArticle) {
      onOpenArticle(item.article);
    } else if (onOpenNews) {
      onOpenNews();
    }
  };

  const handleBlogCardPress = (item: HomeBlogItem) => {
    if (item.article && onOpenArticle) {
      onOpenArticle(item.article);
    } else if (onOpenBlogs) {
      onOpenBlogs();
    } else if (onOpenNews) {
      onOpenNews();
    }
  };

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, `"${feature}" is part of an upcoming Home phase.`);
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'contact') {
      onOpenContact?.();
    } else if (tab.id === 'rights') {
      onOpenRights?.();
    } else if (tab.id === 'about') {
      onOpenAbout?.();
    } else if (tab.id === 'events') {
      onOpenEvents?.();
    } else if (tab.id === 'news') {
      onOpenNews?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        onPressSearch={() => onOpenRights?.()}
        onPressNotifications={() => {
          if (onOpenNotifications) {
            onOpenNotifications();
          } else {
            onOpenProfile?.();
          }
        }}
        onPressProfile={onOpenProfile}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={event =>
          onScrollOffsetChange?.(event.nativeEvent.contentOffset.y)
        }
        scrollEventThrottle={16}
        onContentSizeChange={() => {
          if (!hasRestoredScroll.current && initialScrollOffset > 0) {
            hasRestoredScroll.current = true;
            // The content height is available now, so this also restores offsets
            // near the bottom reliably after returning from a destination page.
            requestAnimationFrame(() => {
              scrollRef.current?.scrollTo({
                y: initialScrollOffset,
                animated: false,
              });
            });
          }
        }}
        ref={scrollRef}
      >
        <HeroBanner
          onCtaPress={() => {
            if (hasApplied && !isReapplying) {
              if (onOpenStatus) {
                onOpenStatus();
                return;
              }
            }
            if (onOpenActionPage) {
              onOpenActionPage('join');
            } else {
              showComingSoon('Join the Movement');
            }
          }}
        />

        <View style={styles.quickActionsSection}>
          <QuickActionsRow
            actions={GUEST_QUICK_ACTIONS}
            onPressAction={action => {
              if (
                (action.id === 'join' || action.id === 'renew' || action.id === 'membership') &&
                hasApplied &&
                !isReapplying
              ) {
                if (onOpenStatus) {
                  onOpenStatus();
                  return;
                }
              }

              const destination = getHomeActionDestination(action.id);
              if (destination) {
                if ((destination === 'join' || destination === 'membership') && hasApplied && !isReapplying) {
                  if (onOpenStatus) {
                    onOpenStatus();
                    return;
                  }
                }
                onOpenActionPage?.(destination);
                return;
              }
              if (action.id === 'complaint') {
                onOpenGetHelp?.();
                return;
              }
              showComingSoon(action.label);
            }}
          />
        </View>

        <View style={styles.section}>
          <AboutSection
            onMorePress={() => onOpenAbout?.()}
            onMediaPress={() => showComingSoon('Introduction video')}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Know Your Rights"
              linkLabel="View All"
              onLinkPress={() => onOpenRights?.()}
            />
            <CategoryIconRow
              items={RIGHTS_CATEGORIES}
              onPressItem={item => onOpenRight?.(item.id)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="What HRSJM Does"
              linkLabel="View All"
              onLinkPress={() => onOpenAbout?.()}
            />
            <CategoryIconRow
              items={WHAT_WE_DO_ITEMS}
              onPressItem={item => onOpenWhatWeDo?.(item.id)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ImpactSection
            stats={getImpactStats()}
            onDetailsPress={() => onOpenAbout?.()}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Upcoming Events"
              linkLabel="View All"
              onLinkPress={() => onOpenEvents?.()}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {upcomingEvents.map(event => (
                <HomeEventCard
                  key={event.id}
                  event={event}
                  onPress={() => {
                    const matched =
                      USER_EVENTS.find(e => e.id === 'legal-awareness-workshop') ||
                      USER_EVENTS[0];
                    if (onOpenEvent) {
                      onOpenEvent(matched);
                    } else if (onOpenEvents) {
                      onOpenEvents();
                    }
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Latest News"
              linkLabel="View All"
              onLinkPress={() => onOpenNews?.()}
            />
            <View style={styles.updatesList}>
              {latestNews.slice(0, 2).map(item => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onPress={() => handleNewsCardPress(item)}
                />
              ))}
            </View>
          </View>
        </View>


        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Articles & Blogs"
              linkLabel="View All"
              onLinkPress={() => {
                if (onOpenBlogs) {
                  onOpenBlogs();
                } else if (onOpenNews) {
                  onOpenNews();
                }
              }}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {blogs.map(item => (
                <BlogArticleCard
                  key={item.id}
                  item={item}
                  onPress={() => handleBlogCardPress(item)}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.donationSection}>
          <DonationBanner
            onPress={() => onOpenActionPage?.('donate')}
          />
        </View>
      </ScrollView>

      {!hideBottomNav && (
        <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.cardSurface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  section: {
    marginTop: Spacing.sm,
  },
  donationSection: {
    marginTop: Spacing.lg,
  },
  quickActionsSection: {
    marginTop: Spacing.sm,
  },
  sectionInset: {
    paddingHorizontal: Spacing.base,
  },
  carousel: {
    paddingRight: Spacing.base,
    gap: Spacing.sm,
  },
  updatesList: {
    gap: Spacing.sm,
  },
});
