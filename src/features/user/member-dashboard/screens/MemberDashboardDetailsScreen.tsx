import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import { USER_EVENTS, type UserEvent } from '../../events/data/user-events';
import { RIGHTS_INDEX } from '../../rights/data/rights-content';
import type { HomeTab } from '../../home/types/home.types';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import {
  getUpcomingMemberEvents,
  MOCK_ACTIVE_MEMBERSHIP,
} from '../data/member-dashboard';
import type {
  MemberDashboardTab,
  MemberMembershipRecord,
} from '../types/member-dashboard.types';

const ARTICLE_IMAGE = require('../../../../assets/images/article-rights-book.jpg');
const EVENT_IMAGE = require('../../../../assets/images/event-legal-awareness.jpg');
const COMMUNITY_IMAGE = require('../../../../assets/images/about-hero-community.png');

const DASHBOARD_TABS: Array<{ id: MemberDashboardTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'My Activity' },
  { id: 'learning', label: 'Learning' },
  { id: 'membership', label: 'Membership' },
];

export interface MemberDashboardDetailsContentProps {
  membership: MemberMembershipRecord | null;
  onOpenMembershipInfo: () => void;
  onOpenComplaint: () => void;
  onOpenDonation: () => void;
  onOpenEvents: () => void;
  onOpenRights: () => void;
  onOpenRight: (rightId: string) => void;
  onOpenEvent: (event: UserEvent) => void;
}

export interface MemberDashboardDetailsScreenProps
  extends MemberDashboardDetailsContentProps {
  onBack: () => void;
  onOpenHome: () => void;
  onOpenAbout: () => void;
  onOpenNews: () => void;
  onOpenContact: () => void;
}

const EmptyPanel: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <View style={styles.emptyPanel}>
    <View style={styles.emptyIcon}>
      <AppIcon name="file-text" size={23} color={AdminColors.primaryDark} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.bodyText}>{description}</Text>
  </View>
);

export const MemberDashboardDetailsScreen: React.FC<
  MemberDashboardDetailsScreenProps
> = ({
  membership,
  onBack,
  onOpenMembershipInfo,
  onOpenComplaint,
  onOpenDonation,
  onOpenEvents,
  onOpenRights,
  onOpenRight,
  onOpenEvent,
  onOpenHome,
  onOpenAbout,
  onOpenNews,
  onOpenContact,
}) => {
  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') onOpenHome();
    else if (tab.id === 'about') onOpenAbout();
    else if (tab.id === 'rights') onOpenRights();
    else if (tab.id === 'events') onOpenEvents();
    else if (tab.id === 'news') onOpenNews();
    else if (tab.id === 'contact') onOpenContact();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MemberDashboardDetailsContent
          membership={membership}
          onOpenMembershipInfo={onOpenMembershipInfo}
          onOpenComplaint={onOpenComplaint}
          onOpenDonation={onOpenDonation}
          onOpenEvents={onOpenEvents}
          onOpenRights={onOpenRights}
          onOpenRight={onOpenRight}
          onOpenEvent={onOpenEvent}
        />
      </ScrollView>
      <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

export const MemberDashboardDetailsContent: React.FC<
  MemberDashboardDetailsContentProps
> = ({
  membership,
  onOpenMembershipInfo,
  onOpenComplaint,
  onOpenDonation,
  onOpenEvents,
  onOpenRights,
  onOpenRight,
  onOpenEvent,
}) => {
  const [activeTab, setActiveTab] = useState<MemberDashboardTab>('overview');
  const [bookmarkedArticle, setBookmarkedArticle] = useState(false);
  const [bookmarkedEvent, setBookmarkedEvent] = useState(false);

  const currentMembership = membership ?? MOCK_ACTIVE_MEMBERSHIP;

  const activityMetrics = [
    {
      id: 'events',
      icon: 'calendar' as const,
      title: 'Events Attended',
      subtitle: '3 events',
      onPress: onOpenEvents,
    },
    {
      id: 'complaints',
      icon: 'file-text' as const,
      title: 'Complaints Submitted',
      subtitle: '1 complaint',
      onPress: onOpenComplaint,
    },
    {
      id: 'donations',
      icon: 'shield-check' as const,
      title: 'Donations Made',
      subtitle: '₹1,000',
      onPress: onOpenDonation,
    },
    {
      id: 'volunteer',
      icon: 'clock' as const,
      title: 'Volunteer Hours',
      subtitle: '12 hours',
      onPress: onOpenEvents,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Top Rounded Pill Tabs */}
      <View style={styles.tabsRow} accessibilityRole="tablist">
        {DASHBOARD_TABS.map(tab => {
          const selected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tabPill, selected && styles.activeTabPill]}
              onPress={() => setActiveTab(tab.id)}
              testID={`member-dashboard-tab-${tab.id}`}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.label}
            >
              <Text
                style={[
                  styles.tabPillText,
                  selected && styles.activeTabPillText,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'overview' ? (
        <View style={styles.content}>
          {/* Section 1: Membership Details */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Membership Details</Text>
              <Pressable
                style={styles.manageButton}
                onPress={onOpenMembershipInfo}
                accessibilityRole="button"
                accessibilityLabel="Manage membership"
              >
                <Text style={styles.manageButtonText}>Manage</Text>
              </Pressable>
            </View>

            <View style={styles.membershipCard}>
              <View style={styles.idCardIconContainer}>
                <AppIcon name="id-card" size={28} color="#0F2042" />
              </View>
              <View style={styles.membershipInfoCol}>
                <View style={styles.memberTypeRow}>
                  <Text style={styles.memberTypeText}>
                    {currentMembership.category || 'Individual Member'}
                  </Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>
                      {currentMembership.status === 'active'
                        ? 'Active'
                        : currentMembership.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.memberMetaText}>
                  Member ID: {currentMembership.memberId || 'HRSJM202600123'}
                </Text>
                <Text style={styles.memberMetaText}>
                  Joined on: {currentMembership.joinedDate || '15 Sep 2026'}
                </Text>
                <Text style={styles.memberMetaText}>
                  Valid till: {currentMembership.validUntil || '15 Sep 2027'}
                </Text>
              </View>
            </View>
          </View>

          {/* Section 2: My Activity */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My Activity</Text>
              <Pressable
                style={styles.viewAllRow}
                onPress={() => setActiveTab('activity')}
                accessibilityRole="button"
                accessibilityLabel="View all activity"
              >
                <Text style={styles.viewAllText}>View All</Text>
                <AppIcon name="arrow-right" size={14} color="#0F2042" />
              </Pressable>
            </View>

            <View style={styles.activityList}>
              {activityMetrics.map(item => (
                <Pressable
                  key={item.id}
                  style={styles.activityCard}
                  onPress={item.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}, ${item.subtitle}`}
                >
                  <View style={styles.creamIconCircle}>
                    <AppIcon name={item.icon} size={18} color="#0F2042" />
                  </View>
                  <View style={styles.activityCardContent}>
                    <Text style={styles.activityCardTitle}>{item.title}</Text>
                    <Text style={styles.activityCardSubtitle}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <AppIcon name="chevron-right" size={16} color="#0F2042" />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Section 3: Quick Actions */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <View style={styles.quickActionsRow}>
                <Pressable
                  style={styles.quickActionCard}
                  onPress={onOpenComplaint}
                  accessibilityRole="button"
                  accessibilityLabel="File a Complaint"
                >
                  <View style={styles.creamIconCircleSmall}>
                    <AppIcon name="file-text" size={18} color="#0F2042" />
                  </View>
                  <Text style={styles.quickActionTitle} numberOfLines={2}>
                    File a Complaint
                  </Text>
                  <AppIcon name="chevron-right" size={15} color="#0F2042" />
                </Pressable>
                <Pressable
                  style={styles.quickActionCard}
                  onPress={onOpenDonation}
                  accessibilityRole="button"
                  accessibilityLabel="Make a Donation"
                >
                  <View style={styles.creamIconCircleSmall}>
                    <AppIcon name="heart" size={18} color="#0F2042" />
                  </View>
                  <Text style={styles.quickActionTitle} numberOfLines={2}>
                    Make a Donation
                  </Text>
                  <AppIcon name="chevron-right" size={15} color="#0F2042" />
                </Pressable>
              </View>
              <View style={styles.quickActionsRow}>
                <Pressable
                  style={styles.quickActionCard}
                  onPress={onOpenEvents}
                  accessibilityRole="button"
                  accessibilityLabel="Join an Event"
                >
                  <View style={styles.creamIconCircleSmall}>
                    <AppIcon name="users" size={18} color="#0F2042" />
                  </View>
                  <Text style={styles.quickActionTitle} numberOfLines={2}>
                    Join an Event
                  </Text>
                  <AppIcon name="chevron-right" size={15} color="#0F2042" />
                </Pressable>
                <Pressable
                  style={styles.quickActionCard}
                  onPress={onOpenRights}
                  accessibilityRole="button"
                  accessibilityLabel="Download Resources"
                >
                  <View style={styles.creamIconCircleSmall}>
                    <AppIcon name="download" size={18} color="#0F2042" />
                  </View>
                  <Text style={styles.quickActionTitle} numberOfLines={2}>
                    Download Resources
                  </Text>
                  <AppIcon name="chevron-right" size={15} color="#0F2042" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Section 4: Recommended for You */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <Pressable
                style={styles.viewAllRow}
                onPress={onOpenRights}
                accessibilityRole="button"
                accessibilityLabel="View all recommendations"
              >
                <Text style={styles.viewAllText}>View All</Text>
                <AppIcon name="arrow-right" size={14} color="#0F2042" />
              </Pressable>
            </View>

            <View style={styles.recommendedRow}>
              {/* Card 1: Article */}
              <Pressable
                style={styles.recommendedCard}
                onPress={() => onOpenRight('womens-rights')}
                accessibilityRole="button"
                accessibilityLabel="Understanding Your Fundamental Rights article"
              >
                <Image
                  source={ARTICLE_IMAGE}
                  style={styles.recommendedThumb}
                  resizeMode="cover"
                />
                <View style={styles.recommendedInfo}>
                  <View style={styles.articleBadge}>
                    <Text style={styles.articleBadgeText}>ARTICLE</Text>
                  </View>
                  <Text style={styles.recommendedTitle} numberOfLines={2}>
                    Understanding Your Fundamental Rights
                  </Text>
                  <View style={styles.recommendedFooter}>
                    <View style={styles.recommendedMetaRow}>
                      <AppIcon name="clock" size={12} color="#64748B" />
                      <Text style={styles.recommendedMetaText}>5 min read</Text>
                    </View>
                    <Pressable
                      hitSlop={8}
                      onPress={() => setBookmarkedArticle(prev => !prev)}
                      accessibilityRole="button"
                      accessibilityLabel="Bookmark article"
                    >
                      <AppIcon
                        name="bookmark"
                        size={14}
                        color={bookmarkedArticle ? AdminColors.accentGold : '#0F2042'}
                      />
                    </Pressable>
                  </View>
                </View>
              </Pressable>

              {/* Card 2: Event */}
              <Pressable
                style={styles.recommendedCard}
                onPress={() => onOpenEvent(USER_EVENTS[0])}
                accessibilityRole="button"
                accessibilityLabel="Community Legal Awareness Drive event"
              >
                <Image
                  source={EVENT_IMAGE}
                  style={styles.recommendedThumb}
                  resizeMode="cover"
                />
                <View style={styles.recommendedInfo}>
                  <View style={styles.eventBadge}>
                    <Text style={styles.eventBadgeText}>EVENT</Text>
                  </View>
                  <Text style={styles.recommendedTitle} numberOfLines={2}>
                    Community Legal Awareness Drive
                  </Text>
                  <View style={styles.recommendedFooter}>
                    <View style={styles.recommendedMetaRow}>
                      <AppIcon name="calendar" size={12} color="#64748B" />
                      <Text style={styles.recommendedMetaText}>25 Oct 2026</Text>
                    </View>
                    <Pressable
                      hitSlop={8}
                      onPress={() => setBookmarkedEvent(prev => !prev)}
                      accessibilityRole="button"
                      accessibilityLabel="Bookmark event"
                    >
                      <AppIcon
                        name="bookmark"
                        size={14}
                        color={bookmarkedEvent ? AdminColors.accentGold : '#0F2042'}
                      />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {activeTab === 'activity' ? (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>My Activity</Text>
          <EmptyPanel
            title="Activity history unavailable"
            description="No activity records are available because member activity data is not connected. Complaint and donation information is not shown without an authorized member service."
          />
        </View>
      ) : null}

      {activeTab === 'learning' ? (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Rights Education</Text>
          <Text style={[styles.bodyText, styles.learningIntro]}>
            Browse the rights education content currently available in HRSJM.
          </Text>
          <RecommendedContent onOpenRight={onOpenRight} expanded />
        </View>
      ) : null}

      {activeTab === 'membership' ? (
        <View style={styles.content}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Membership</Text>
            <Pressable
              style={styles.manageButton}
              onPress={onOpenMembershipInfo}
              accessibilityRole="button"
              accessibilityLabel="Manage membership"
            >
              <Text style={styles.manageButtonText}>Manage</Text>
            </Pressable>
          </View>

          <View style={styles.membershipCard}>
            <View style={styles.idCardIconContainer}>
              <AppIcon name="id-card" size={28} color="#0F2042" />
            </View>
            <View style={styles.membershipInfoCol}>
              <View style={styles.memberTypeRow}>
                <Text style={styles.memberTypeText}>
                  {currentMembership.category || 'Individual Member'}
                </Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>
                    {currentMembership.status === 'active'
                      ? 'Active'
                      : currentMembership.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.memberMetaText}>
                Member ID: {currentMembership.memberId || 'HRSJM202600123'}
              </Text>
              <Text style={styles.memberMetaText}>
                Joined on: {currentMembership.joinedDate || '15 Sep 2026'}
              </Text>
              <Text style={styles.memberMetaText}>
                Valid till: {currentMembership.validUntil || '15 Sep 2027'}
              </Text>
            </View>
          </View>

          {!membership ? (
            <View style={{ marginTop: Spacing.md }}>
              <EmptyPanel
                title="No membership record available"
                description="The app does not currently connect to an authenticated membership record. Explore the membership information page for available details."
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const RecommendedContent: React.FC<{
  onOpenRight: (rightId: string) => void;
  onOpenEvent?: (event: UserEvent) => void;
  expanded?: boolean;
}> = ({ onOpenRight, onOpenEvent, expanded = false }) => {
  const rights = RIGHTS_INDEX.slice(0, expanded ? RIGHTS_INDEX.length : 3);
  const events = onOpenEvent
    ? getUpcomingMemberEvents(USER_EVENTS, new Date()).slice(0, 2)
    : [];

  return (
    <View style={styles.recommendationList}>
      {rights.map(item => (
        <Pressable
          key={item.id}
          style={styles.recommendation}
          onPress={() => onOpenRight(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.title} rights education`}
        >
          <Image
            source={COMMUNITY_IMAGE}
            style={styles.learningThumb}
            resizeMode="cover"
            accessible={false}
          />
          <View style={styles.recommendationCopy}>
            <Text style={styles.recommendationCategory}>RIGHTS EDUCATION</Text>
            <Text style={styles.recommendationTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.recommendationDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <AppIcon name="chevron-right" size={17} color={AdminColors.primaryDark} />
        </Pressable>
      ))}
      {events.map(event => (
        <Pressable
          key={event.id}
          style={styles.recommendation}
          onPress={() => onOpenEvent?.(event)}
          accessibilityRole="button"
          accessibilityLabel={`Open event: ${event.title}`}
        >
          <Image
            source={event.image}
            style={styles.learningThumb}
            resizeMode="cover"
            accessible={false}
          />
          <View style={styles.recommendationCopy}>
            <Text style={styles.recommendationCategory}>
              {event.category.toUpperCase()} · {event.date}
            </Text>
            <Text style={styles.recommendationTitle} numberOfLines={2}>
              {event.title}
            </Text>
            <Text style={styles.recommendationDescription} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
          <AppIcon name="chevron-right" size={17} color={AdminColors.primaryDark} />
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  container: {
    paddingTop: Spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    gap: 6,
  },
  tabPill: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F4F9',
  },
  activeTabPill: {
    backgroundColor: '#EAA532',
  },
  tabPillText: {
    color: '#1A2438',
    fontSize: 12.5,
    fontWeight: '600',
  },
  activeTabPillText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.base,
  },
  sectionBlock: {
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0F2042',
    fontFamily: FontFamilies.serif,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  manageButton: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  manageButtonText: {
    color: '#0F2042',
    fontSize: 12.5,
    fontWeight: '600',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: '#0F2042',
    fontSize: 13,
    fontWeight: '600',
  },
  membershipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  idCardIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FEF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  membershipInfoCol: {
    flex: 1,
  },
  memberTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberTypeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2042',
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '600',
  },
  memberMetaText: {
    color: '#64748B',
    fontSize: 12.5,
    lineHeight: 18,
  },
  activityList: {
    gap: 8,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  creamIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityCardContent: {
    flex: 1,
  },
  activityCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2042',
  },
  activityCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  quickActionsGrid: {
    marginTop: 10,
    gap: 10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    ...Shadows.card,
  },
  creamIconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  quickActionTitle: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F2042',
    marginRight: 4,
  },
  recommendedRow: {
    flexDirection: 'row',
    gap: 10,
  },
  recommendedCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 88,
    ...Shadows.card,
  },
  recommendedThumb: {
    width: 58,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#EDF2F7',
  },
  recommendedInfo: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'space-between',
    height: 72,
  },
  articleBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  articleBadgeText: {
    color: '#6D28D9',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  eventBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  eventBadgeText: {
    color: '#B45309',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recommendedTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F2042',
    lineHeight: 15,
    marginTop: 2,
  },
  recommendedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  recommendedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recommendedMetaText: {
    fontSize: 10,
    color: '#64748B',
  },
  bodyText: {
    color: AdminColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  learningIntro: {
    marginVertical: Spacing.sm,
  },
  recommendationList: {
    gap: Spacing.sm,
  },
  recommendation: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  learningThumb: {
    width: 66,
    height: 72,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primaryLight,
  },
  recommendationCopy: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  recommendationCategory: {
    color: AdminColors.accentGold,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recommendationTitle: {
    marginTop: 3,
    color: AdminColors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  recommendationDescription: {
    marginTop: 3,
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  emptyPanel: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    marginBottom: Spacing.sm,
    backgroundColor: AdminColors.accentGoldLight,
  },
  emptyTitle: {
    marginBottom: 4,
    color: AdminColors.primaryDark,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
