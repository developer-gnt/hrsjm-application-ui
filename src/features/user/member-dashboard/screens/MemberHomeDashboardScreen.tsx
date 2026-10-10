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
import { getUpcomingMemberEvents } from '../data/member-dashboard';
import { MemberDashboardDetailsContent } from './MemberDashboardDetailsScreen';
import type { MemberMembershipRecord } from '../types/member-dashboard.types';

const MEMBER_HERO_IMAGE = require('../../../../assets/images/about-hero-community.png');

interface QuickAction {
  title: string;
  icon: React.ComponentProps<typeof AppIcon>['name'];
  onPress: () => void;
}

export interface MemberHomeDashboardScreenProps {
  membership: MemberMembershipRecord | null;
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
        <AppIcon name="arrow-right" size={15} color={AdminColors.accentGold} />
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
  <Pressable
    style={styles.eventCard}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Open event: ${event.title}, ${event.date}`}
  >
    <View style={styles.eventMedia}>
      <Image source={event.image} style={styles.eventImage} resizeMode="cover" />
      <View style={styles.eventDateBadge}>
        <Text style={styles.eventDateBadgeText}>{event.date}</Text>
      </View>
    </View>
    <View style={styles.eventBody}>
      <Text style={styles.eventCategory}>{event.category}</Text>
      <Text style={styles.eventTitle} numberOfLines={2}>
        {event.title}
      </Text>
      <View style={styles.eventLocation}>
        <AppIcon name="map-pin" size={14} color={AdminColors.textSecondary} />
        <Text style={styles.eventLocationText} numberOfLines={1}>
          {event.location}
        </Text>
      </View>
      <View style={styles.eventAction}>
        <Text style={styles.eventActionText}>View Event</Text>
        <AppIcon name="arrow-right" size={13} color={AdminColors.primaryDark} />
      </View>
    </View>
  </Pressable>
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
  const upcomingEvents = useMemo(
    () => getUpcomingMemberEvents(USER_EVENTS, new Date()).slice(0, 4),
    [],
  );
  const quickActions: QuickAction[] = [
    { title: 'Know Your Rights', icon: 'scale', onPress: onOpenRights },
    { title: 'File a Complaint', icon: 'file-text', onPress: onOpenComplaint },
    { title: 'Events', icon: 'calendar', onPress: onOpenEvents },
    { title: 'Resources', icon: 'book-open', onPress: onOpenRights },
  ];
  const statusLabel = membership
    ? {
        active: 'Active Member',
        pending: 'Application Pending',
        inactive: 'Inactive Membership',
      }[membership.status]
    : 'Membership status unavailable';
  const statusColor =
    membership?.status === 'active'
      ? AdminColors.statusActive
      : membership?.status === 'pending'
        ? AdminColors.statusPending
        : AdminColors.textSecondary;

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
              Amaan Shaikh
            </Text>
            <Text style={styles.heroDescription}>
              {membership?.status === 'active'
                ? 'Thank you for being a valued member of HRSJM. Together, we work for a fairer, more just and equal society.'
                : 'Join HRSJM. Together, we work for a fairer, more just and equal society.'}
            </Text>
            {membership?.joinedDate ? (
              <View style={styles.memberSince}>
                <AppIcon
                  name="calendar"
                  size={13}
                  color={AdminColors.textOnDark}
                />
                <Text style={styles.memberSinceText}>
                  Member Since  |  {membership.joinedDate}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <DashboardCard>
            <View style={styles.statusTop}>
              <View style={styles.statusIcon}>
                <AppIcon
                  name="user"
                  size={22}
                  color={AdminColors.primaryDark}
                />
              </View>
              <View style={styles.statusCopy}>
                <Text style={styles.cardEyebrow}>MEMBERSHIP</Text>
                <Text style={styles.statusTitle}>
                  {membership ? statusLabel : 'Become a Member'}
                </Text>
                <Text style={styles.bodyText}>
                  {membership
                    ? membership.category
                    : 'Explore membership information and the application process.'}
                </Text>
              </View>
              <Pressable
                style={styles.membershipAction}
                onPress={membership ? onOpenMembershipDetails : onOpenMembershipInfo}
                accessibilityRole="button"
                accessibilityLabel={
                  membership ? 'View membership' : 'Explore membership information'
                }
              >
                <Text style={styles.membershipActionText}>
                  {membership ? 'View Membership' : 'Explore Membership'}
                </Text>
                <AppIcon
                  name="arrow-right"
                  size={15}
                  color={AdminColors.primaryDark}
                />
              </Pressable>
            </View>
            {!membership ? (
              <View style={styles.statusNote}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={styles.availabilityNote}>
                  Membership status has not been verified.
                </Text>
                <Pressable
                  onPress={onOpenMembershipDetails}
                  accessibilityRole="button"
                  accessibilityLabel="View membership details"
                  hitSlop={8}
                >
                  <AppIcon
                    name="chevron-right"
                    size={17}
                    color={AdminColors.textSecondary}
                  />
                </Pressable>
              </View>
            ) : (
              <View style={styles.memberFacts}>
                {membership.memberId ? (
                  <Text style={styles.memberMeta}>
                    Member ID: {membership.memberId}
                  </Text>
                ) : null}
                {membership.joinedDate ? (
                  <Text style={styles.memberMeta}>
                    Member since {membership.joinedDate}
                  </Text>
                ) : null}
              </View>
            )}
          </DashboardCard>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Quick Actions" />
          <View style={styles.quickGrid}>
            {quickActions.map(action => (
              <Pressable
                key={action.title}
                style={styles.quickCard}
                onPress={action.onPress}
                accessibilityRole="button"
                accessibilityLabel={action.title}
              >
                <View style={styles.quickIcon}>
                  <AppIcon
                    name={action.icon}
                    size={21}
                    color={AdminColors.primaryDark}
                  />
                </View>
                <Text style={styles.quickTitle} numberOfLines={2}>
                  {action.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <DashboardCard>
            <Text style={styles.impactTitle}>Your Impact</Text>
            <View style={styles.metrics}>
              {[
                { label: 'Events Attended', icon: 'users' as const },
                { label: 'Causes Supported', icon: 'heart' as const },
                { label: 'Complaint Submitted', icon: 'file-text' as const },
                { label: 'Hours Volunteered', icon: 'clock' as const },
              ].map(({ label, icon }) => (
                <View key={label} style={styles.metric}>
                  <View style={styles.metricIcon}>
                    <AppIcon
                      name={icon}
                      size={15}
                      color={AdminColors.primaryDark}
                    />
                  </View>
                  <Text style={styles.metricValue}>—</Text>
                  <Text style={styles.metricLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </DashboardCard>
        </View>

        <View style={styles.section}>
          <SectionHeading
            title="Upcoming Events"
            linkLabel="View All"
            onLinkPress={onOpenEvents}
          />
          {upcomingEvents.length > 0 ? (
            <View style={styles.eventList}>
              {upcomingEvents.map(event => (
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

        <View style={[styles.section, styles.recommendations]}>
          <RecommendationCard
            icon="book-open"
            title="Continue Learning"
            description="Explore rights education and guidance available in HRSJM."
            action="Browse Resources"
            onPress={onOpenRights}
          />
          <RecommendationCard
            icon="heart"
            title="Make a Difference"
            description="Learn about ways to support HRSJM’s work."
            action="Donate Now"
            onPress={onOpenDonation}
          />
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
    <View style={styles.recommendationIcon}>
      <AppIcon name={icon} size={21} color={AdminColors.primaryDark} />
    </View>
    <Text style={styles.recommendationTitle}>{title}</Text>
    <Text style={styles.bodyText}>{description}</Text>
    <Pressable
      style={styles.recommendationAction}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={action}
    >
      <Text style={styles.recommendationActionText}>{action}</Text>
      <AppIcon name="arrow-right" size={15} color={AdminColors.primaryDark} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AdminColors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  hero: {
    height: 150,
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryDark,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  heroImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 39, 77, 0.62)',
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  heroGreeting: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 21,
  },
  heroName: {
    maxWidth: '75%',
    color: '#E8B83F',
    fontFamily: FontFamilies.serif,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 27,
  },
  heroDescription: {
    maxWidth: '68%',
    marginTop: 2,
    color: AdminColors.textOnDark,
    fontSize: 10,
    lineHeight: 14,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5,
  },
  memberSinceText: {
    color: AdminColors.textOnDark,
    fontSize: 9,
    lineHeight: 12,
  },
  section: { marginTop: Spacing.md, paddingHorizontal: Spacing.base },
  sectionHeading: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 21,
    fontWeight: '700',
  },
  headingLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headingLinkText: { color: AdminColors.primaryDark, fontSize: 13, fontWeight: '600' },
  card: {
    padding: Spacing.sm,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  statusTop: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  statusCopy: { flex: 1, marginRight: Spacing.xs },
  cardEyebrow: {
    color: AdminColors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusTitle: {
    color: AdminColors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  bodyText: { color: AdminColors.textSecondary, fontSize: 11, lineHeight: 15 },
  memberMeta: { marginTop: 4, color: AdminColors.textSecondary, fontSize: 12 },
  availabilityNote: {
    marginTop: Spacing.sm,
    color: AdminColors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  membershipAction: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    backgroundColor: AdminColors.background,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
  },
  membershipActionText: {
    color: AdminColors.primaryDark,
    fontSize: 10,
    fontWeight: '700',
  },
  statusNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AdminColors.border,
  },
  memberFacts: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  quickGrid: { flexDirection: 'row', gap: Spacing.xs },
  quickCard: {
    flex: 1,
    minHeight: 82,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    paddingVertical: Spacing.xs,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
  },
  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.accentGoldLight,
  },
  quickTitle: {
    marginTop: Spacing.xs,
    color: AdminColors.primaryDark,
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 12,
    textAlign: 'center',
  },
  impactTitle: {
    marginBottom: 2,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 13,
    fontWeight: '700',
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 1,
    paddingTop: 1,
  },
  metricIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
    borderRadius: 13,
    backgroundColor: AdminColors.accentGoldLight,
  },
  metricValue: {
    color: AdminColors.primaryDark,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '700',
  },
  metricLabel: {
    width: '100%',
    marginTop: 1,
    color: AdminColors.textSecondary,
    fontSize: 8,
    lineHeight: 10,
    textAlign: 'center',
  },
  eventList: { gap: Spacing.sm },
  eventCard: {
    minHeight: 128,
    flexDirection: 'row',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  eventMedia: {
    width: 112,
    height: 128,
    backgroundColor: AdminColors.primaryLight,
  },
  eventImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  eventDateBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    maxWidth: 96,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: AdminColors.cardSurface,
  },
  eventDateBadgeText: {
    color: AdminColors.primaryDark,
    fontSize: 9,
    fontWeight: '700',
  },
  eventBody: { flex: 1, justifyContent: 'center', padding: Spacing.sm },
  eventCategory: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    color: AdminColors.primaryDark,
    backgroundColor: AdminColors.accentGoldLight,
    borderRadius: BorderRadius.xs,
    fontSize: 9,
    fontWeight: '700',
  },
  eventTitle: {
    marginTop: 4,
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  eventLocation: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  eventLocationText: {
    flex: 1,
    marginLeft: 4,
    color: AdminColors.textSecondary,
    fontSize: 9,
  },
  eventAction: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: Spacing.xs,
  },
  eventActionText: { color: AdminColors.primaryDark, fontSize: 10, fontWeight: '700' },
  recommendations: { flexDirection: 'row', gap: Spacing.sm },
  recommendationCard: {
    flex: 1,
    minHeight: 162,
    padding: Spacing.sm,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  recommendationIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.accentGoldLight,
  },
  recommendationTitle: {
    marginTop: Spacing.sm,
    marginBottom: 3,
    color: AdminColors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  recommendationAction: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: Spacing.xs,
  },
  recommendationActionText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
});
