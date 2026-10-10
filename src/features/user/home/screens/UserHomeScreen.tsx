import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
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
import { DonationBanner } from '../components/DonationBanner';
import { ActivitiesRow } from '../components/ActivityCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { UserBottomNavigation } from '../components/UserBottomNavigation';
import {
  GUEST_QUICK_ACTIONS,
  IMPACT_STATS,
  LATEST_NEWS,
  LATEST_UPDATES,
  MEMBER_ACTIVITIES,
  RECOMMENDATIONS,
  RIGHTS_CATEGORIES,
  UPCOMING_EVENTS,
  WHAT_WE_DO_ITEMS,
} from '../data/home-preview-data';
import type { HomeTab } from '../types/home.types';

export interface UserHomeScreenProps {
  /**
   * Opens the Contact Us screen (Contact tab in the shared six-tab
   * bottom navigation).
   */
  onOpenContact?: () => void;
  onOpenRights?: () => void;
}

/**
 * User-facing Home screen — single reference-locked composition:
 * header, hero, guest quick actions, My Activities, Recommended for You,
 * About, Know Your Rights, What HRSJM Does, Our Impact, Upcoming Events and
 * Latest News, with the guest bottom navigation (Home · About · Rights ·
 * Events · News). Contact lives on its own screen (see the contact feature).
 *
 * Content comes from the isolated preview data modules until the backend
 * integration phase. Member-profile sections (greeting, membership card,
 * member quick actions) are intentionally NOT part of this composition —
 * their components remain in the codebase for the future Member Home.
 */
export const UserHomeScreen: React.FC<UserHomeScreenProps> = ({
  onOpenContact,
  onOpenRights,
}) => {
  const showComingSoon = (feature: string) => {
    Alert.alert(feature, `"${feature}" is part of an upcoming Home phase.`);
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'contact') {
      onOpenContact?.();
    } else if (tab.id === 'rights') {
      onOpenRights?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        onPressSearch={() => showComingSoon('Search')}
        onPressNotifications={() => showComingSoon('Notifications')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroBanner onCtaPress={() => showComingSoon('Join the Movement')} />

        <View style={styles.section}>
          <QuickActionsRow
            actions={GUEST_QUICK_ACTIONS}
            onPressAction={action => showComingSoon(action.label)}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="My Activities"
              linkLabel="View All"
              onLinkPress={() => showComingSoon('My Activities')}
            />
            <ActivitiesRow
              activities={MEMBER_ACTIVITIES}
              onPressActivity={activity => showComingSoon(activity.label)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Recommended for You"
              linkLabel="View All"
              onLinkPress={() => showComingSoon('Recommended for You')}
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
                  onPress={() => showComingSoon(item.title)}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <AboutSection
            onMorePress={() => showComingSoon('About HRSJM')}
            onMediaPress={() => showComingSoon('Introduction video')}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Know Your Rights"
              linkLabel="View All"
              onLinkPress={() => showComingSoon('Know Your Rights')}
            />
            <CategoryIconRow
              items={RIGHTS_CATEGORIES}
              onPressItem={item => showComingSoon(item.title)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="What HRSJM Does"
              linkLabel="View All"
              onLinkPress={() => showComingSoon('What HRSJM Does')}
            />
            <CategoryIconRow
              items={WHAT_WE_DO_ITEMS}
              onPressItem={item => showComingSoon(item.title)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ImpactSection
            stats={IMPACT_STATS}
            onDetailsPress={() => showComingSoon('Our Impact')}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Upcoming Events"
              linkLabel="View All"
              onLinkPress={() => showComingSoon('Upcoming Events')}
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
                  onPress={() => showComingSoon(event.title)}
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
              onLinkPress={() => showComingSoon('Latest News')}
            />
            <View style={styles.updatesList}>
              {LATEST_NEWS.map(item => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onPress={() => showComingSoon(item.title)}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInset}>
            <SectionHeader
              title="Latest Updates"
              linkLabel="View All"
              onLinkPress={() => showComingSoon('Latest Updates')}
            />
            <View style={styles.updatesList}>
              {LATEST_UPDATES.map(item => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onPress={() => showComingSoon(item.title)}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <DonationBanner onPress={() => showComingSoon('Make a Donation')} />
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