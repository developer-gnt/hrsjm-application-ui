import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ScrollViewInstance,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../auth/store/authStore';
import { usersStore } from '../../../admin/users/services/usersStore';
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
  const [hasPendingSeekerApp, setHasPendingSeekerApp] = useState(false);
  const [pendingSeekerAppNumber, setPendingSeekerAppNumber] = useState<string | null>(null);

  const authUser = useAuthStore(state => state.user);
  const isMemberRole = (authUser?.roles ?? []).some(r => r.name.toUpperCase() === 'MEMBER');
  const hasPendingMemberApp =
    (hasApplied && !isReapplying) ||
    (isMemberRole && (authUser?.membership_status === 'PENDING' || authUser?.membership_status === 'UNDER_REVIEW'));

  useEffect(() => {
    try {
      const user = useAuthStore.getState().user;
      const phone = user?.mobile_number?.replace(/\D/g, '');
      const email = user?.email?.toLowerCase();
      const isSeekerRole = (user?.roles ?? []).some(r => ['SEEKER', 'DONATION_SEEKER'].includes(r.name.toUpperCase()));
      const isBackendPending = user?.assistance_status === 'PENDING' || user?.assistance_status === 'UNDER_REVIEW';

      const allUsers = usersStore.getAllUsers();
      const matched = allUsers.find(
        u =>
          u.userType === 'seeker' &&
          u.status === 'pending' &&
          ((phone && u.phone && u.phone.replace(/\D/g, '').includes(phone)) ||
            (email && u.email && u.email.toLowerCase() === email))
      );
      if (matched || (isSeekerRole && isBackendPending) || user?.assistance_status === 'PENDING') {
        setHasPendingSeekerApp(true);
      }
    } catch {
      // test safe
    }
  }, []);

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
    let isMounted = true;
    const safeLoad = async () => {
      if (isMounted) {
        await loadDynamicData();
      }
    };
    safeLoad();

    if (process.env.NODE_ENV === 'test') {
      return () => {
        isMounted = false;
      };
    }

    // Auto-refresh periodically so newly published news and blogs appear automatically in 1st position
    const intervalId = setInterval(safeLoad, 5000);
    if ((intervalId as any)?.unref) {
      (intervalId as any).unref();
    }
    return () => {
      isMounted = false;
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
        activeNav="home"
        onOpenDonate={() => onOpenActionPage?.('donate')}
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
        {hasPendingMemberApp && (
          <TouchableOpacity
            style={styles.seekerPendingBanner}
            activeOpacity={0.85}
            onPress={() => onOpenStatus?.()}
            accessibilityRole="button"
            accessibilityLabel="View Membership Application Status"
          >
            <View style={styles.seekerPendingIconBox}>
              <Text style={styles.seekerPendingEmoji}>📋</Text>
            </View>
            <View style={styles.seekerPendingTextBox}>
              <View style={styles.seekerPendingTitleRow}>
                <Text style={styles.seekerPendingTitle}>
                  Membership Application Under Review
                </Text>
                <View style={styles.seekerAppBadge}>
                  <Text style={styles.seekerAppBadgeText}>Pending</Text>
                </View>
              </View>
              <Text style={styles.seekerPendingDesc}>
                Your membership application is currently being verified by the administration. You can view your live application status anytime. Official ID card and member voting privileges will activate upon approval.
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {hasPendingSeekerApp && (
          <View style={styles.seekerPendingBanner}>
            <View style={styles.seekerPendingIconBox}>
              <Text style={styles.seekerPendingEmoji}>🤲</Text>
            </View>
            <View style={styles.seekerPendingTextBox}>
              <Text style={styles.seekerPendingTitle}>
                Donation Seeker Application Under Review
              </Text>
              <Text style={styles.seekerPendingDesc}>
                Your application and verification documents are being reviewed by the admin. You are currently browsing as a User. Once approved, your role will update to Donation Seeker and your seeker dashboard will unlock automatically.
              </Text>
            </View>
          </View>
        )}

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
              title="Articles and Blogs"
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
    backgroundColor: '#FAF7F0',
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
  seekerPendingBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    backgroundColor: '#FFFDF5',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  seekerPendingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekerPendingEmoji: {
    fontSize: 20,
  },
  seekerPendingTextBox: {
    flex: 1,
  },
  seekerPendingTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  seekerPendingDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: '#78350F',
  },
  seekerPendingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  seekerAppBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  seekerAppBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  seekerPendingBoldRef: {
    fontWeight: '700',
    color: '#92400E',
  },
});
