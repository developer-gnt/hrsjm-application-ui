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
import type { IconName } from '../../components/icons';
import { USER_EVENTS, type UserEvent } from '../../events/data/user-events';
import { RIGHTS_INDEX } from '../../rights/data/rights-content';
import type { HomeTab } from '../../home/types/home.types';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import { getUpcomingMemberEvents } from '../data/member-dashboard';
import type {
  MemberDashboardTab,
  MemberMembershipRecord,
} from '../types/member-dashboard.types';

const COMMUNITY_IMAGE = require('../../../../assets/images/about-hero-community.png');

const DASHBOARD_TABS: Array<{ id: MemberDashboardTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'My Activity' },
  { id: 'learning', label: 'Learning' },
  { id: 'membership', label: 'Membership' },
];
const ACTIVITY_ITEMS: Array<{ icon: IconName; label: string }> = [
  { icon: 'calendar', label: 'Events Attended' },
  { icon: 'file-text', label: 'Complaints Submitted' },
  { icon: 'heart', label: 'Donations Made' },
  { icon: 'clock', label: 'Volunteer Hours' },
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

const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

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

const MembershipDetails: React.FC<{
  membership: MemberMembershipRecord | null;
  onOpenMembershipInfo: () => void;
}> = ({ membership, onOpenMembershipInfo }) => {
  if (!membership) {
    return (
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <AppIcon name="user" size={21} color={AdminColors.primaryDark} />
          <Text style={styles.cardTitle}>Membership Details</Text>
        </View>
        <Text style={styles.bodyText}>
          An authenticated membership record is not available in this app. No
          member ID, category, status or membership dates can be shown.
        </Text>
        <ActionLink
          label="Explore membership information"
          onPress={onOpenMembershipInfo}
        />
      </View>
    );
  }

  const statusLabel = {
    active: 'Active',
    pending: 'Pending',
    inactive: 'Inactive',
  }[membership.status];
  const fields = [
    ['Category', membership.category],
    ['Status', statusLabel],
    ...(membership.memberId ? [['Member ID', membership.memberId]] : []),
    ...(membership.joinedDate ? [['Joined', membership.joinedDate]] : []),
    ...(membership.validUntil ? [['Valid until', membership.validUntil]] : []),
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        <AppIcon name="user" size={21} color={AdminColors.primaryDark} />
        <Text style={styles.cardTitle}>Membership Details</Text>
      </View>
      {fields.map(([label, value]) => (
        <View key={label} style={styles.detailRow}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
};

const ActionLink: React.FC<{ label: string; onPress: () => void }> = ({
  label,
  onPress,
}) => (
  <Pressable
    style={styles.actionLink}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Text style={styles.actionLinkText}>{label}</Text>
    <AppIcon name="arrow-right" size={16} color={AdminColors.primaryDark} />
  </Pressable>
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
        <View style={styles.pageHeading}>
          <Text style={styles.eyebrow}>MEMBER AREA</Text>
          <Text style={styles.pageTitle}>Membership & Activity</Text>
          <Text style={styles.bodyText}>
            View membership and activity information when it is available.
          </Text>
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

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabList}
        accessibilityRole="tablist"
      >
        {DASHBOARD_TABS.map(tab => {
          const selected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, selected && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
              testID={`member-dashboard-tab-${tab.id}`}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.label}
            >
              <Text style={[styles.tabText, selected && styles.activeTabText]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {activeTab === 'overview' ? (
        <View style={styles.content}>
          <SectionHeading title="Membership Details" />
          <MembershipDetails
            membership={membership}
            onOpenMembershipInfo={onOpenMembershipInfo}
          />

          <View style={styles.sectionBlock}>
            <View style={styles.headingRow}>
              <SectionHeading title="My Activity" />
              <Text style={styles.notAvailableTag}>Not connected</Text>
            </View>
            <View style={styles.card}>
              {ACTIVITY_ITEMS.map(({ icon, label }) => (
                <View key={label} style={styles.activityRow}>
                  <View style={styles.activityIcon}>
                    <AppIcon name={icon} size={17} color={AdminColors.primaryDark} />
                  </View>
                  <Text style={styles.activityLabel}>{label}</Text>
                  <Text style={styles.activityValue}>—</Text>
                </View>
              ))}
              <Text style={styles.availabilityNote}>
                Activity history is not available in this app.
              </Text>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeading title="Quick Actions" />
            <View style={styles.quickActions}>
              <QuickAction
                icon="file-text"
                title="File a Complaint"
                onPress={onOpenComplaint}
              />
              <QuickAction
                icon="heart"
                title="Make a Donation"
                onPress={onOpenDonation}
              />
              <QuickAction
                icon="calendar"
                title="Join an Event"
                onPress={onOpenEvents}
              />
              <QuickAction
                icon="book-open"
                title="Browse Resources"
                onPress={onOpenRights}
              />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.headingRow}>
              <SectionHeading title="Recommended for You" />
              <ActionLink label="View All" onPress={onOpenRights} />
            </View>
            <RecommendedContent
              onOpenRight={onOpenRight}
              onOpenEvent={onOpenEvent}
            />
          </View>
        </View>
      ) : null}

      {activeTab === 'activity' ? (
        <View style={styles.content}>
          <SectionHeading title="My Activity" />
          <EmptyPanel
            title="Activity history unavailable"
            description="No activity records are available because member activity data is not connected. Complaint and donation information is not shown without an authorized member service."
          />
        </View>
      ) : null}

      {activeTab === 'learning' ? (
        <View style={styles.content}>
          <SectionHeading title="Rights Education" />
          <Text style={[styles.bodyText, styles.learningIntro]}>
            Browse the rights education content currently available in HRSJM.
          </Text>
          <RecommendedContent onOpenRight={onOpenRight} expanded />
        </View>
      ) : null}

      {activeTab === 'membership' ? (
        <View style={styles.content}>
          <SectionHeading title="Membership" />
          <MembershipDetails
            membership={membership}
            onOpenMembershipInfo={onOpenMembershipInfo}
          />
          {!membership ? (
            <EmptyPanel
              title="No membership record available"
              description="The app does not currently connect to an authenticated membership record. Explore the membership information page for available details."
            />
          ) : null}
        </View>
      ) : null}
    </>
  );
};

const QuickAction: React.FC<{
  icon: React.ComponentProps<typeof AppIcon>['name'];
  title: string;
  onPress: () => void;
}> = ({ icon, title, onPress }) => (
  <Pressable
    style={styles.quickAction}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    <View style={styles.quickIcon}>
      <AppIcon name={icon} size={20} color={AdminColors.primaryDark} />
    </View>
    <Text style={styles.quickTitle}>{title}</Text>
  </Pressable>
);

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
            style={styles.recommendationImage}
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
            style={styles.recommendationImage}
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
  safeArea: { flex: 1, backgroundColor: AdminColors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  pageHeading: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg },
  eyebrow: {
    color: AdminColors.accentGold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pageTitle: {
    marginTop: 5,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 25,
    fontWeight: '700',
  },
  bodyText: { color: AdminColors.textSecondary, fontSize: 13, lineHeight: 19 },
  tabList: { paddingHorizontal: Spacing.base, gap: Spacing.xs, paddingVertical: Spacing.md },
  tab: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    backgroundColor: '#EDF1F6',
  },
  activeTab: { backgroundColor: AdminColors.accentGold },
  tabText: { color: AdminColors.textSecondary, fontSize: 12, fontWeight: '600' },
  activeTabText: { color: AdminColors.primaryDark, fontWeight: '700' },
  content: { paddingHorizontal: Spacing.base },
  sectionTitle: {
    marginBottom: Spacing.sm,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    padding: Spacing.md,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  cardTitle: { color: AdminColors.primaryDark, fontSize: 16, fontWeight: '700' },
  actionLink: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: Spacing.xs,
  },
  actionLinkText: { color: AdminColors.primaryDark, fontSize: 12, fontWeight: '700' },
  detailRow: {
    minHeight: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AdminColors.border,
  },
  detailLabel: { color: AdminColors.textSecondary, fontSize: 12 },
  detailValue: {
    flexShrink: 1,
    marginLeft: Spacing.sm,
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  sectionBlock: { marginTop: Spacing.lg },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  notAvailableTag: {
    marginBottom: Spacing.sm,
    color: AdminColors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  activityRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    backgroundColor: AdminColors.accentGoldLight,
  },
  activityLabel: { flex: 1, color: AdminColors.primaryDark, fontSize: 12 },
  activityValue: { color: AdminColors.textSecondary, fontSize: 14, fontWeight: '700' },
  availabilityNote: {
    marginTop: Spacing.sm,
    color: AdminColors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickAction: {
    width: '48%',
    minHeight: 102,
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.sm,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  quickIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: AdminColors.accentGoldLight,
  },
  quickTitle: {
    marginTop: Spacing.xs,
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationList: { gap: Spacing.sm },
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
  recommendationImage: {
    width: 66,
    height: 72,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primaryLight,
  },
  recommendationCopy: { flex: 1, marginHorizontal: Spacing.sm },
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
  learningIntro: { marginBottom: Spacing.md },
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
