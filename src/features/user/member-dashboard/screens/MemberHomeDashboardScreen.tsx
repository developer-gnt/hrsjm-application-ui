import React, { useMemo } from 'react';
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
import { USER_EVENTS } from '../../events/data/user-events';
import type { UserEvent } from '../../events/data/user-events';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import {
  getUpcomingMemberEvents,
  MOCK_ACTIVE_MEMBERSHIP,
} from '../data/member-dashboard';
import type { MemberMembershipRecord } from '../types/member-dashboard.types';

const MEMBER_HERO_IMAGE = require('../../../../assets/images/member-hero-rally.jpg');

interface QuickAction {
  title: string;
  icon: React.ComponentProps<typeof AppIcon>['name'];
  onPress: () => void;
}

export interface MemberHomeDashboardScreenProps {
  membership?: MemberMembershipRecord | null;
  onBack: () => void;
  onOpenMembershipInfo: () => void;
  onOpenMembershipDetails: () => void;
  onOpenRight: (rightId: string) => void;
  onOpenRights: () => void;
  onOpenComplaint: () => void;
  onOpenEvents: () => void;
  onOpenEvent: (event: UserEvent) => void;
  onOpenDonation: () => void;
  onOpenHome: () => void;
  onOpenAbout: () => void;
  onOpenNews: () => void;
  onOpenContact: () => void;
}

const SectionHeading: React.FC<{
  title: string;
  linkLabel?: string;
  onLinkPress?: () => void;
}> = ({ title, linkLabel, onLinkPress }) => (
  <View style={styles.sectionHeading}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {linkLabel && onLinkPress ? (
      <Pressable
        onPress={onLinkPress}
        accessibilityRole="button"
        accessibilityLabel={linkLabel}
        hitSlop={8}
        style={styles.headingLink}
      >
        <Text style={styles.headingLinkText}>{linkLabel}</Text>
        <AppIcon name="arrow-right" size={13} color={AdminColors.primaryDark} />
      </Pressable>
    ) : null}
  </View>
);

const DashboardCard: React.FC<React.PropsWithChildren> = ({ children }) => (
  <View style={styles.card}>{children}</View>
);

const EventCard: React.FC<{
  event: UserEvent;
  onPress: () => void;
}> = ({ event, onPress }) => (
  <View style={styles.eventCard}>
    <View style={styles.eventMedia}>
      <Image
        source={event.image}
        style={styles.eventImage}
        resizeMode="cover"
      />
      <View style={styles.eventDateBadge}>
        <Text style={styles.eventDayText}>{event.day || '18'}</Text>
        <Text style={styles.eventMonthText}>{event.month || 'Oct'}</Text>
      </View>
    </View>
    <View style={styles.eventBody}>
      <View style={styles.eventTagsRow}>
        <View style={styles.tagWorkshop}>
          <Text style={styles.tagWorkshopText}>{event.category || 'Workshop'}</Text>
        </View>
        <View style={styles.tagInPerson}>
          <Text style={styles.tagInPersonText}>In Person</Text>
        </View>
      </View>
      <Text style={styles.eventTitle} numberOfLines={2}>
        {event.title}
      </Text>
      <View style={styles.eventLocation}>
        <AppIcon name="map-pin" size={13} color="#64748B" />
        <Text style={styles.eventLocationText} numberOfLines={1}>
          {event.location}
        </Text>
      </View>
      <Pressable
        style={styles.registerButton}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Register for ${event.title}`}
      >
        <Text style={styles.registerButtonText}>Register Now</Text>
        <AppIcon name="arrow-right" size={12} color={AdminColors.primaryDark} />
      </Pressable>
    </View>
  </View>
);

export const MemberHomeDashboardScreen: React.FC<
  MemberHomeDashboardScreenProps
> = ({
  membership,
  onBack,
  onOpenMembershipInfo,
  onOpenMembershipDetails,
  onOpenRight,
  onOpenRights,
  onOpenComplaint,
  onOpenEvents,
  onOpenEvent,
  onOpenDonation,
  onOpenHome,
  onOpenAbout,
  onOpenNews,
  onOpenContact,
}) => {
  const currentMembership = membership ?? MOCK_ACTIVE_MEMBERSHIP;
  const upcomingEvents = useMemo(
    () => getUpcomingMemberEvents(USER_EVENTS, new Date()).slice(0, 4),
    [],
  );
  const quickActions: QuickAction[] = [
    { title: 'Know Your Rights', icon: 'book-open', onPress: onOpenRights },
    { title: 'File a Complaint', icon: 'file-text', onPress: onOpenComplaint },
    { title: 'Events', icon: 'calendar', onPress: onOpenEvents },
    { title: 'Resources', icon: 'download', onPress: onOpenRights },
  ];
  const impactMetrics = [
    { value: '3', label: 'Events\nAttended', icon: 'users' as const },
    { value: '2', label: 'Causes\nSupported', icon: 'heart' as const },
    { value: '1', label: 'Complaint\nSubmitted', icon: 'file-text' as const },
    { value: '12', label: 'Hours\nVolunteered', icon: 'clock' as const },
  ];

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
        <View style={styles.hero}>
          <Image
            source={MEMBER_HERO_IMAGE}
            style={styles.heroImage}
            resizeMode="cover"
            accessible={false}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroGreeting}>Welcome,</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {currentMembership.memberName || 'Amaan Shaikh'}
            </Text>
            <Text style={styles.heroDescription}>
              Thank you for being a valued member of HRSJM. Together, we work for a fairer, more just and equal society.
            </Text>
            <View style={styles.memberSince}>
              <AppIcon
                name="calendar"
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.memberSinceText}>
                Member Since  |  {currentMembership.joinedDate || 'Sep 2026'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sheetContainer}>
          {/* Active Member Status Card */}
          <View style={styles.membershipStatusCard}>
            <View style={styles.membershipStatusLeft}>
              <View style={styles.starBadge}>
                <AppIcon name="star" size={20} color="#FFFFFF" filled />
              </View>
              <View style={styles.statusTextGroup}>
                <Text style={styles.statusTitle}>
                  {currentMembership.status === 'active' ? 'Active Member' : 'Member'}
                </Text>
                <Text style={styles.statusCategory}>
                  {currentMembership.category || 'Individual Member'}
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.viewMembershipButton}
              onPress={onOpenMembershipDetails}
              accessibilityRole="button"
              accessibilityLabel="View Membership"
            >
              <Text style={styles.viewMembershipText}>View Membership</Text>
              <AppIcon
                name="arrow-right"
                size={13}
                color={AdminColors.primaryDark}
              />
            </Pressable>
          </View>

          {/* Quick Actions (4 in a row) */}
          <View style={styles.quickActionsRow}>
            {quickActions.map(action => (
              <Pressable
                key={action.title}
                style={styles.quickActionCard}
                onPress={action.onPress}
                accessibilityRole="button"
                accessibilityLabel={action.title}
              >
                <View style={styles.quickActionIconCircle}>
                  <AppIcon
                    name={action.icon}
                    size={22}
                    color={AdminColors.primaryDark}
                  />
                </View>
                <Text style={styles.quickActionLabel} numberOfLines={2}>
                  {action.title}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Your Impact Card */}
          <View style={styles.impactCard}>
            <Text style={styles.impactTitle}>Your Impact</Text>
            <View style={styles.impactMetricsRow}>
              {impactMetrics.map(item => (
                <View key={item.label} style={styles.impactMetricCol}>
                  <View style={styles.impactIconCircle}>
                    <AppIcon
                      name={item.icon}
                      size={20}
                      color={AdminColors.primaryDark}
                    />
                  </View>
                  <Text style={styles.impactValue}>{item.value}</Text>
                  <Text style={styles.impactLabel} numberOfLines={2}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          {/* Upcoming Events */}
          <View style={styles.upcomingSection}>
            <SectionHeading
              title="Upcoming Events"
              linkLabel="View All"
              onLinkPress={onOpenEvents}
            />
            {upcomingEvents.length > 0 ? (
              <View style={styles.eventList}>
                {upcomingEvents.slice(0, 1).map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onPress={() => onOpenEvent(event)}
                  />
                ))}
              </View>
            ) : (
              <DashboardCard>
                <Text style={styles.bodyText}>No upcoming events are available.</Text>
              </DashboardCard>
            )}
          </View>

          {/* Recommendations Row */}
          <View style={styles.recommendationsRow}>
            <RecommendationCard
              icon="book-open"
              title="Continue Learning"
              description="Explore articles, guides and legal resources."
              action="Browse Resources"
              onPress={onOpenRights}
            />
            <RecommendationCard
              icon="heart"
              title="Make a Difference"
              description="Support our programs through donation."
              action="Donate Now"
              onPress={onOpenDonation}
            />
          </View>
        </View>
      </ScrollView>
      <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const RecommendationCard: React.FC<{
  icon: React.ComponentProps<typeof AppIcon>['name'];
  title: string;
  description: string;
  action: string;
  onPress: () => void;
}> = ({ icon, title, description, action, onPress }) => (
  <View style={styles.recommendationCard}>
    <View style={styles.recommendationHeader}>
      <View style={styles.recommendationIcon}>
        <AppIcon name={icon} size={18} color={AdminColors.primaryDark} />
      </View>
      <Text style={styles.recommendationTitle}>{title}</Text>
    </View>
    <Text style={styles.recommendationDescription}>{description}</Text>
    <Pressable
      style={styles.recommendationAction}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={action}
      hitSlop={6}
    >
      <Text style={styles.recommendationActionText}>{action}</Text>
      <AppIcon name="arrow-right" size={12} color="#0284C7" />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AdminColors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  hero: {
    height: 224,
    overflow: 'hidden',
    backgroundColor: '#041A35',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 26, 53, 0.4)',
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Spacing.xs,
    paddingBottom: 28,
  },
  heroGreeting: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
  },
  heroName: {
    color: '#E5A93C',
    fontFamily: FontFamilies.serif,
    fontSize: 27,
    fontWeight: '700',
    lineHeight: 33,
    marginTop: 2,
    marginBottom: 6,
  },
  heroDescription: {
    maxWidth: '72%',
    color: '#FFFFFF',
    fontSize: 12.5,
    lineHeight: 18,
    opacity: 0.95,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  memberSinceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.95,
  },
  sheetContainer: {
    backgroundColor: AdminColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 16,
    paddingHorizontal: Spacing.base,
  },
  membershipStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  membershipStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  starBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAA532',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusTextGroup: {
    justifyContent: 'center',
  },
  statusTitle: {
    color: AdminColors.primaryDark,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  statusCategory: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  viewMembershipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  viewMembershipText: {
    color: AdminColors.primaryDark,
    fontSize: 12.5,
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 102,
    ...Shadows.card,
  },
  quickActionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    marginTop: 10,
    color: AdminColors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  impactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    marginTop: 14,
    ...Shadows.card,
  },
  impactTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  impactMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  impactMetricCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  impactIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactValue: {
    color: AdminColors.primaryDark,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  impactLabel: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  upcomingSection: {
    marginTop: 18,
  },
  sectionHeading: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    fontWeight: '700',
  },
  headingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headingLinkText: {
    color: AdminColors.primaryDark,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    padding: Spacing.sm,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  bodyText: {
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  eventList: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  eventMedia: {
    width: 124,
    height: 114,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#041A35',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventDateBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  eventDayText: {
    color: '#0A2540',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  eventMonthText: {
    color: '#475569',
    fontSize: 10.5,
    fontWeight: '600',
    lineHeight: 13,
  },
  eventBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
    minHeight: 114,
  },
  eventTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  tagWorkshop: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  tagWorkshopText: {
    color: '#92400E',
    fontSize: 10.5,
    fontWeight: '600',
  },
  tagInPerson: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  tagInPersonText: {
    color: '#0284C7',
    fontSize: 10.5,
    fontWeight: '600',
  },
  eventTitle: {
    color: '#0A2540',
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  eventLocationText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  registerButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAA532',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
    gap: 5,
  },
  registerButtonText: {
    color: AdminColors.primaryDark,
    fontSize: 11.5,
    fontWeight: '700',
  },
  recommendationsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  recommendationCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 128,
    ...Shadows.card,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationTitle: {
    flex: 1,
    color: AdminColors.primaryDark,
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 16,
  },
  recommendationDescription: {
    color: '#64748B',
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 6,
  },
  recommendationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  recommendationActionText: {
    color: '#0284C7',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
