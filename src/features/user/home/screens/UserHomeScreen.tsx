import React, { useRef } from 'react';
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
import { ActivitiesRow } from '../components/ActivityCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { EmergencyHelplinesSection } from '../components/EmergencyHelplinesSection';
import { QuickRightsAwarenessSection } from '../components/QuickRightsAwarenessSection';
import { SuccessStoriesSection } from '../components/SuccessStoriesSection';
import { JoinMovementBanner } from '../components/JoinMovementBanner';
import { DonationBanner } from '../components/DonationBanner';
import { UserBottomNavigation } from '../components/UserBottomNavigation';
import {
  GUEST_QUICK_ACTIONS,
  LATEST_NEWS,
  LATEST_UPDATES,
  MEMBER_ACTIVITIES,
  RECOMMENDATIONS,
  RIGHTS_CATEGORIES,
  UPCOMING_EVENTS,
  WHAT_WE_DO_ITEMS,
} from '../data/home-preview-data';
import { getImpactStats } from '../data/impact-stats-provider';
import type { HomeTab } from '../types/home.types';
import type { WhatWeDoId } from '../../what-we-do';
import type { ActionPageId } from '../../action-pages';
import { getHomeActionDestination } from '../utils/home-action-destination';

import type { UserEvent } from '../../events/data/user-events';
import type { UserNewsArticle } from '../../news/data/user-news';
import { USER_EVENTS } from '../../events/data/user-events';
import { USER_NEWS_ARTICLES } from '../../news/data/user-news';

export interface UserHomeScreenProps {
  /**
   * Opens the Contact Us screen (Contact tab in the shared six-tab
   * bottom navigation).
   */
  onOpenContact?: () => void;
  onOpenRights?: () => void;
  /** Opens the About page (About tab in the shared six-tab navigation). */
  onOpenAbout?: () => void;
  /** Opens the Get Help flow from the existing Home quick action card. */
  onOpenGetHelp?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenEvent?: (event: UserEvent) => void;
  onOpenNewsArticle?: (article: UserNewsArticle) => void;
  onOpenRight?: (rightId: string) => void;
  onOpenWhatWeDo?: (contentId: WhatWeDoId) => void;
  onOpenActionPage?: (pageId: ActionPageId) => void;
  initialScrollOffset?: number;
  onScrollOffsetChange?: (offset: number) => void;
}

/**
 * User-facing Home screen — single reference-locked composition:
 * header, hero, guest quick actions, About, Know Your Rights,
 * What HRSJM Does, Our Impact and the shared six-tab bottom navigation.
 *
 * Content comes from the isolated preview data modules until the backend
 * integration phase. Member-profile sections (greeting, membership card,
 * member quick actions) are intentionally NOT part of this composition —
 * their components remain in the codebase for the future Member Home.
 */
export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({
  onOpenContact,
  onOpenRights,
  onOpenAbout,
  onOpenGetHelp,
  onOpenEvents,
  onOpenNews,
  onOpenEvent,
  onOpenNewsArticle,
  onOpenRight,
  onOpenWhatWeDo,
  onOpenActionPage,
  initialScrollOffset = 0,
  onScrollOffsetChange,
}) => {
  const hasRestoredScroll = useRef(false);
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const showComingSoon = (feature: string) => {
    Alert.alert(feature, `"${feature}" is part of an upcoming Home phase.`);
  };

  const handleOpenEventCard = (homeEventId: string) => {
    const matched =
      USER_EVENTS.find(e => e.id === homeEventId) ??
      (homeEventId === 'event-1' ? USER_EVENTS[0] : undefined) ??
      (homeEventId === 'event-2' ? USER_EVENTS[1] : undefined) ??
      (homeEventId === 'event-3' ? USER_EVENTS[2] : undefined) ??
      USER_EVENTS[0];

    if (matched && onOpenEvent) {
      onOpenEvent(matched);
    } else {
      onOpenEvents?.();
    }
  };

  const handleOpenNewsCard = (homeNewsId: string) => {
    const matched =
      USER_NEWS_ARTICLES.find(a => a.id === homeNewsId) ??
      (homeNewsId === 'news-1' || homeNewsId === 'update-1'
        ? USER_NEWS_ARTICLES[0]
        : homeNewsId === 'update-2'
          ? USER_NEWS_ARTICLES[1]
          : undefined) ??
      USER_NEWS_ARTICLES[0];

    if (matched && onOpenNewsArticle) {
      onOpenNewsArticle(matched);
    } else {
      onOpenNews?.();
    }
  };

  const handleActivityPress = (activityId: string) => {
    if (activityId === 'complaints') {
      onOpenGetHelp?.();
    } else if (activityId === 'events') {
      onOpenEvents?.();
    } else if (activityId === 'membership') {
      onOpenActionPage?.('membership');
    } else if (activityId === 'certificates') {
      onOpenActionPage?.('membership');
    } else {
      onOpenActionPage?.('membership');
    }
  };

  const handleRecommendationPress = (recId: string) => {
    if (recId === 'rec-1') {
      if (USER_EVENTS[0] && onOpenEvent) {
        onOpenEvent(USER_EVENTS[0]);
      } else {
        onOpenEvents?.();
      }
    } else if (recId === 'rec-2') {
      onOpenRight?.('right-to-education');
    } else if (recId === 'rec-3') {
      onOpenActionPage?.('membership');
    } else {
      onOpenAbout?.();
    }
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
      <HomeHeader />

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
              const destination = getHomeActionDestination(action.id);
              if (destination) {
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
            onMediaPress={() => {
              Alert.alert(
                'HRSJM Introduction',
                'Human Rights & Social Justice Mission video introduction.\n\nWorking for equality, human dignity, and social justice across communities.',
              );
            }}
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

        {/* NEW SECTION 1: Legal Awareness & Citizen Rights Tips */}
        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Legal Awareness & Tips"
              linkLabel="Learn More"
              onLinkPress={() => onOpenRights?.()}
            />
            <QuickRightsAwarenessSection onOpenRight={onOpenRight} />
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

        <View style={styles.impactSection}>
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
              {UPCOMING_EVENTS.map(event => (
                <HomeEventCard
                  key={event.id}
                  event={event}
                  onPress={() => handleOpenEventCard(event.id)}
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
              {LATEST_NEWS.map(item => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onPress={() => handleOpenNewsCard(item.id)}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="My Activities"
              linkLabel="View All"
              onLinkPress={() => onOpenActionPage?.('membership')}
            />
            <ActivitiesRow
              activities={MEMBER_ACTIVITIES}
              onPressActivity={activity => handleActivityPress(activity.id)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Recommended for You"
              linkLabel="View All"
              onLinkPress={() => onOpenEvents?.()}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {RECOMMENDATIONS.map(item => (
                <RecommendationCard
                  key={item.id}
                  item={item}
                  onPress={() => handleRecommendationPress(item.id)}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Latest Updates"
              linkLabel="View All"
              onLinkPress={() => onOpenNews?.()}
            />
            <View style={styles.updatesList}>
              {LATEST_UPDATES.map(item => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onPress={() => handleOpenNewsCard(item.id)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Emergency Helplines & Quick Support */}
        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Emergency Helplines"
              linkLabel="Contact Us"
              onLinkPress={() => onOpenContact?.()}
            />
            <EmergencyHelplinesSection />
          </View>
        </View>

        {/* NEW SECTION: Success Stories */}
        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Impact Stories"
              linkLabel="View All"
              onLinkPress={() => onOpenAbout?.()}
            />
          </View>
          <SuccessStoriesSection />
        </View>

        {/* NEW SECTION: Join the Movement CTA */}
        <View style={styles.joinSection}>
          <JoinMovementBanner
            onJoinPress={() => onOpenActionPage?.('join')}
            onLearnMorePress={() => onOpenAbout?.()}
          />
        </View>

        <View style={styles.donationSection}>
          <DonationBanner
            onPress={() => onOpenActionPage?.('donate')}
          />
        </View>
      </ScrollView>

      <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
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
    marginTop: Spacing.lg,
  },
  impactSection: {
    marginTop: Spacing.xl,
  },
  joinSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  donationSection: {
    marginTop: Spacing.lg,
  },
  quickActionsSection: {
    marginTop: Spacing.md,
  },
  sectionInset: {
    paddingHorizontal: Spacing.base,
  },
  carousel: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    gap: Spacing.sm,
  },
  updatesList: {
    gap: Spacing.sm,
  },
});
