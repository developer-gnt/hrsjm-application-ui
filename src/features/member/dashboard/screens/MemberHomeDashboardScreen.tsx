import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { AppIcon } from '../../../user/components';
import { HomeHeader } from '../../../user/home/components/HomeHeader';
import { UserBottomNavigation } from '../../../user/home/components/UserBottomNavigation';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { useNotifications } from '../../../admin/notifications';
import { useAuthStore } from '../../../auth/store/authStore';
import { useProfileStore } from '../../../admin/profile/profileStore';
import { apiClient } from '../../../../core/api/client';
import type { HomeTab } from '../../../user/home/types/home.types';
import { MOCK_ACTIVE_MEMBERSHIP } from '../data/member-dashboard';
import type { MemberMembershipRecord } from '../types/member-dashboard.types';
import { getEventsList } from '../../../admin/content/events/services/events.service';
import type { EventListItem } from '../../../admin/content/events/types/events.types';
import { supportService } from '../../../admin/support/services/support.service';
import { api, unwrap } from '../../../../core/api/client';
import { supportTicketsStore } from '../../../support/services/supportTicketsStore';
import { receiptsService } from '../../../receipts/services/receipts.service';

const formatStartDate = (dateVal?: string | Date | null): string | undefined => {
  if (!dateVal) return undefined;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) {
      return typeof dateVal === 'string' ? dateVal : undefined;
    }
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return undefined;
  }
};

const MEMBER_HERO_IMAGE = require('../../../../assets/images/member-hero-rally.jpg');
const DEFAULT_EVENT_IMAGE = require('../../../../assets/images/event-legal-awareness.jpg');

interface QuickAction {
  title: string;
  icon: React.ComponentProps<typeof AppIcon>['name'];
  onPress: () => void;
}

export interface MemberHomeDashboardScreenProps {
  membership?: MemberMembershipRecord | null;
  onBack?: () => void;
  onOpenMembershipInfo?: () => void;
  onOpenMembershipDetails?: () => void;
  onOpenRight?: (rightId: string) => void;
  onOpenRights?: () => void;
  onOpenComplaint?: () => void;
  onOpenTickets?: () => void;
  onOpenEvents?: () => void;
  onOpenEvent?: (event: EventListItem) => void;
  onOpenDonation?: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenNews?: () => void;
  onOpenContact?: () => void;
  onOpenResources?: () => void;
  onOpenNotifications?: () => void;
  showBottomNav?: boolean;
  useAdminHeader?: boolean;
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
  event: EventListItem;
  onPress: () => void;
}> = ({ event, onPress }) => {
  const eventDate = new Date(event.startAt);
  const isValidDate = !isNaN(eventDate.getTime());
  const day = isValidDate ? eventDate.getDate().toString() : '—';
  const month = isValidDate
    ? eventDate.toLocaleDateString('en-US', { month: 'short' })
    : '—';

  const imageSource = event.coverImageUrl
    ? { uri: event.coverImageUrl }
    : DEFAULT_EVENT_IMAGE;

  return (
    <Pressable
      style={styles.eventCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Event: ${event.title}`}
    >
      <View style={styles.eventMedia}>
        <Image
          source={imageSource}
          style={styles.eventImage}
          resizeMode="cover"
        />
        <View style={styles.eventDateBadge}>
          <Text style={styles.eventDayText}>{day}</Text>
          <Text style={styles.eventMonthText}>{month}</Text>
        </View>
      </View>
      <View style={styles.eventBody}>
        <View style={styles.eventTagsRow}>
          <View style={styles.tagWorkshop}>
            <Text style={styles.tagWorkshopText}>
              {event.category || 'Workshop'}
            </Text>
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
            {event.location || 'Mumbai, Maharashtra'}
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
    </Pressable>
  );
};

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
  onOpenTickets,
  onOpenEvents,
  onOpenEvent,
  onOpenDonation,
  onOpenHome,
  onOpenAbout,
  onOpenNews,
  onOpenContact,
  onOpenResources,
  onOpenNotifications,
  showBottomNav = false,
  useAdminHeader = true,
}) => {
  const user = useAuthStore(state => state.user);
  const profileMemberSince = useProfileStore(state => state.profile?.memberSince);
  const { unreadCount } = useNotifications();

  const [apiMembership, setApiMembership] = useState<any>(null);
  const [apiStartDate, setApiStartDate] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMembershipData = async () => {
      try {
        const res: any = await apiClient.get<any>('/memberships/my');
        const data = res?.data !== undefined ? res.data : res;
        if (isMounted && data) {
          setApiMembership(data);
          const rawStart = data.start_date || data.startDate || data.applied_at || data.created_at;
          if (rawStart) {
            const formatted = formatStartDate(rawStart);
            if (formatted) {
              setApiStartDate(formatted);
            }
          }
        }
      } catch {
        try {
          const res: any = await apiClient.get<any>('/users/me/membership');
          const data = res?.data !== undefined ? res.data : res;
          if (isMounted && data) {
            setApiMembership(data);
            const rawStart = data.start_date || data.startDate || data.applied_at || data.created_at;
            if (rawStart) {
              const formatted = formatStartDate(rawStart);
              if (formatted) {
                setApiStartDate(formatted);
              }
            }
          }
        } catch {
          // Keep offline/default state
        }
      }
    };

    fetchMembershipData();
    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedJoinedDate =
    apiStartDate ||
    (membership?.joinedDate && membership.joinedDate !== MOCK_ACTIVE_MEMBERSHIP.joinedDate ? membership.joinedDate : undefined) ||
    (profileMemberSince ? profileMemberSince : undefined) ||
    (membership?.joinedDate ? membership.joinedDate : undefined);

  const currentMembership: MemberMembershipRecord = {
    ...MOCK_ACTIVE_MEMBERSHIP,
    memberName:
      user?.full_name ||
      apiMembership?.user?.full_name ||
      (membership?.memberName ?? MOCK_ACTIVE_MEMBERSHIP.memberName),
    memberId:
      apiMembership?.membership_number ||
      (user as any)?.member_id ||
      (user as any)?.custom_id ||
      (membership?.memberId ?? MOCK_ACTIVE_MEMBERSHIP.memberId),
    status:
      membership?.status ??
      (apiMembership?.status
        ? String(apiMembership.status).toLowerCase() === 'active' || String(apiMembership.status).toLowerCase() === 'approved'
          ? 'active'
          : 'pending'
        : MOCK_ACTIVE_MEMBERSHIP.status),
    category:
      membership?.category ??
      apiMembership?.category?.name ??
      MOCK_ACTIVE_MEMBERSHIP.category,
    joinedDate: resolvedJoinedDate,
    validUntil:
      formatStartDate(apiMembership?.expiry_date || apiMembership?.expiryDate) ||
      membership?.validUntil ||
      MOCK_ACTIVE_MEMBERSHIP.validUntil,
  };

  const [dbEvents, setDbEvents] = useState<EventListItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true);
  const [impactStats, setImpactStats] = useState({
    eventsAttended: 0,
    complaintsSubmitted: 0,
    causesSupported: 0,
    hoursVolunteered: 0,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchUpcomingEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const res = await getEventsList({ limit: 50 });
        if (isMounted) {
          setDbEvents(res.events || []);
        }
      } catch (err) {
        if (isMounted) {
          setDbEvents([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingEvents(false);
        }
      }
    };

    fetchUpcomingEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch dynamic impact stats from backend
  const fetchImpactStats = useCallback(async () => {
    try {
      // 1. Primary: Dedicated user impact endpoint from backend
      const res = await api.get<any>('/auth/me/impact');
      const data = unwrap(res) || (res as any)?.data || res;
      if (data && typeof data === 'object') {
        setImpactStats({
          eventsAttended: data.eventsAttended ?? 0,
          causesSupported: data.causesSupported ?? 0,
          complaintsSubmitted: data.complaintsSubmitted ?? 0,
          hoursVolunteered: data.hoursVolunteered ?? 0,
          isLoading: false,
        });
        return;
      }
    } catch {
      // Fallback to service-level computation below
    }

    try {
      const [tickets, receipts, eventsData] = await Promise.allSettled([
        supportTicketsStore.fetchTickets(),
        receiptsService.getMyReceipts(),
        getEventsList({ limit: 50 }),
      ]);

      const complaints =
        tickets.status === 'fulfilled' && Array.isArray(tickets.value)
          ? tickets.value.length
          : 0;

      const causes =
        receipts.status === 'fulfilled' && Array.isArray(receipts.value)
          ? new Set(
              receipts.value
                .filter(r => r.type === 'Donation')
                .map(r => r.cause || r.id)
            ).size || receipts.value.filter(r => r.type === 'Donation').length
          : 0;

      const eventsCount =
        eventsData.status === 'fulfilled'
          ? (eventsData.value.events?.length ?? 0)
          : 0;

      setImpactStats({
        eventsAttended: eventsCount,
        complaintsSubmitted: complaints,
        causesSupported: causes,
        hoursVolunteered: 0,
        isLoading: false,
      });
    } catch {
      setImpactStats(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    fetchImpactStats();
    const unsubscribe = supportTicketsStore.subscribe(() => {
      fetchImpactStats();
    });
    return () => {
      unsubscribe();
    };
  }, [fetchImpactStats]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return dbEvents
      .filter(event => {
        if (!event.startAt) return false;
        const startTime = new Date(event.startAt).getTime();
        if (isNaN(startTime)) return false;
        const endTime = event.endAt ? new Date(event.endAt).getTime() : startTime + 4 * 60 * 60 * 1000;

        // An event is upcoming if it has not ended yet and starts today or in the future
        const isUpcoming = endTime >= now.getTime() || startTime >= startOfToday;
        return isUpcoming && event.status !== 'CANCELLED' && event.status !== 'COMPLETED';
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [dbEvents]);
  // Quick actions – 3 items (Resources removed)
  const quickActions: QuickAction[] = [
    { title: 'Know Your Rights', icon: 'book-open', onPress: onOpenRights || (() => undefined) },
    { title: 'File a Complaint', icon: 'file-text', onPress: onOpenComplaint || (() => undefined) },
    { title: 'Events', icon: 'calendar', onPress: onOpenEvents || (() => undefined) },
  ];
  const impactMetrics = [
    {
      value: impactStats.isLoading ? '—' : String(impactStats.eventsAttended),
      label: 'Events\nAttended',
      icon: 'users' as const,
      onPress: onOpenEvents,
    },
    {
      value: impactStats.isLoading ? '—' : String(impactStats.causesSupported),
      label: 'Causes\nSupported',
      icon: 'heart' as const,
      onPress: onOpenDonation,
    },
    {
      value: impactStats.isLoading ? '—' : String(impactStats.complaintsSubmitted),
      label: 'Complaint\nSubmitted',
      icon: 'file-text' as const,
      onPress: onOpenTickets || onOpenComplaint,
    },
  ];

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') onOpenHome?.();
    else if (tab.id === 'about') onOpenAbout?.();
    else if (tab.id === 'rights') onOpenRights?.();
    else if (tab.id === 'events') onOpenEvents?.();
    else if (tab.id === 'news') onOpenNews?.();
    else if (tab.id === 'contact') onOpenContact?.();
  };

  const kitData = (apiMembership as any)?.kit_fulfillment || (apiMembership as any)?.application_data?.kit_fulfillment;
  const kitStatus = kitData?.status || 'PROCESSING';
  const kitStatusLabel =
    kitStatus === 'DELIVERED'
      ? 'Delivered'
      : kitStatus === 'DISPATCHED'
      ? `Dispatched (${kitData?.tracking_number ? kitData.tracking_number : 'Speed Post'})`
      : 'In Preparation / Dispatch Pending';
  return (
    <View style={styles.safeArea}>
      {useAdminHeader ? (
        <AdminHeader
          isMemberHeader={true}
          unreadCount={unreadCount}
          onPressNotifications={onOpenNotifications}
          showDonate={true}
          onPressDonate={onOpenDonation}
        />
      ) : (
        <HomeHeader
          onBack={onBack}
          onNavigateNav={(id: string) => {
            if (id === 'home') onOpenHome?.();
            else if (id === 'about') onOpenAbout?.();
            else if (id === 'rights') onOpenRights?.();
            else if (id === 'events') onOpenEvents?.();
            else if (id === 'news') onOpenNews?.();
            else if (id === 'contact') onOpenContact?.();
          }}
        />
      )}
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
              {currentMembership.memberName || user?.full_name || 'Member'}
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
                Member Since  |  {currentMembership.joinedDate || '—'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sheetContainer}>
          {/* Active Member Status Card */}
          <Pressable
            style={styles.membershipStatusCard}
            onPress={onOpenMembershipDetails || onOpenMembershipInfo || (() => undefined)}
            accessibilityRole="button"
            accessibilityLabel="View Membership Details"
          >
            <View style={styles.membershipStatusLeft}>
              <View style={styles.starBadge}>
                <AppIcon name="star" size={18} color="#FFFFFF" filled />
              </View>
              <View style={styles.statusTextGroup}>
                <Text
                  style={styles.statusTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {currentMembership.status === 'active' ? 'Active Member' : 'Member'}
                </Text>
                <Text
                  style={styles.statusCategory}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {currentMembership.category || 'Individual Member'}
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.viewMembershipButton}
              onPress={onOpenMembershipDetails || onOpenMembershipInfo || (() => undefined)}
              accessibilityRole="button"
              accessibilityLabel="View Membership"
            >
              <Text style={styles.viewMembershipText} numberOfLines={1}>View Membership</Text>
              <AppIcon
                name="arrow-right"
                size={12}
                color={AdminColors.primaryDark}
              />
            </Pressable>
          </Pressable>

          {/* Welcome Kit Dispatch Status Banner */}
          <Pressable
            style={styles.kitFulfillmentCard}
            onPress={onOpenMembershipDetails || onOpenMembershipInfo || (() => undefined)}
            accessibilityRole="button"
            accessibilityLabel="Membership Welcome Kit Status"
          >
            <View style={styles.kitFulfillmentLeft}>
              <View style={styles.kitIconCircle}>
                <AppIcon name="star" size={15} color={AdminColors.primaryDark} />
              </View>
              <View style={styles.kitTextGroup}>
                <Text style={styles.kitFulfillmentTitle} numberOfLines={1}>
                  Physical Welcome Kit
                </Text>
                <Text style={styles.kitFulfillmentStatus} numberOfLines={1}>
                  {kitStatusLabel}
                </Text>
              </View>
            </View>
            <View style={styles.kitActionRight}>
              <Text style={styles.kitActionText}>View Kit</Text>
              <AppIcon name="arrow-right" size={12} color={AdminColors.primaryDark} />
            </View>
          </Pressable>

          {/* Quick Actions – 3 equal cards side by side */}
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
                <Pressable
                  key={item.label}
                  style={styles.impactMetricCol}
                  onPress={item.onPress || (() => undefined)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
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
                </Pressable>
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
            {isLoadingEvents ? (
              <View style={styles.noEventsCard}>
                <Text style={styles.noEventsSubtitle}>Loading upcoming events...</Text>
              </View>
            ) : upcomingEvents.length > 0 ? (
              <View style={styles.eventList}>
                {upcomingEvents.slice(0, 1).map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onPress={() => onOpenEvent?.(event)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.noEventsCard}>
                <AppIcon name="calendar" size={28} color="#94A3B8" />
                <Text style={styles.noEventsTitle}>No events yet</Text>
                <Text style={styles.noEventsSubtitle}>
                  There are no upcoming events scheduled at the moment.
                </Text>
              </View>
            )}
          </View>

          {/* Recommendations Row – dynamic data */}
          <View style={styles.recommendationsRow}>
            <RecommendationCard
              icon="calendar"
              title="Upcoming Events"
              description={
                impactStats.isLoading
                  ? 'Loading…'
                  : impactStats.eventsAttended > 0
                  ? `${impactStats.eventsAttended} event${impactStats.eventsAttended === 1 ? '' : 's'} available to join.`
                  : 'No upcoming events. Check back soon!'
              }
              action="Browse Events"
              onPress={onOpenEvents || (() => undefined)}
            />
            <RecommendationCard
              icon="heart"
              title="Make a Difference"
              description={
                impactStats.isLoading
                  ? 'Loading…'
                  : impactStats.complaintsSubmitted > 0
                  ? `${impactStats.complaintsSubmitted} ticket${impactStats.complaintsSubmitted === 1 ? '' : 's'} tracked. Keep supporting.`
                  : 'Support our programs through donation.'
              }
              action="Donate Now"
              onPress={onOpenDonation || (() => undefined)}
            />
          </View>
        </View>
      </ScrollView>
      {showBottomNav && (
        <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
      )}
    </View>
  );
};

const RecommendationCard: React.FC<{
  icon: React.ComponentProps<typeof AppIcon>['name'];
  title: string;
  description: string;
  action: string;
  onPress: () => void;
}> = ({ icon, title, description, action, onPress }) => (
  <Pressable
    style={styles.recommendationCard}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    <View style={styles.recommendationHeader}>
      <View style={styles.recommendationIcon}>
        <AppIcon name={icon} size={18} color={AdminColors.primaryDark} />
      </View>
      <Text style={styles.recommendationTitle}>{title}</Text>
    </View>
    <Text style={styles.recommendationDescription}>{description}</Text>
    <View style={styles.recommendationAction}>
      <Text style={styles.recommendationActionText}>{action}</Text>
      <AppIcon name="arrow-right" size={12} color="#0284C7" />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AdminColors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  hero: {
    height: 224,
    overflow: 'hidden',
    backgroundColor: '#011F39',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(3, 27, 49, 0.52)',
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
    color: '#FAD465',
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
    backgroundColor: '#FAF7F0',
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
    borderColor: '#DCE4EC',
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    ...Shadows.card,
  },
  membershipStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  starBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  statusTextGroup: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  statusTitle: {
    color: AdminColors.primaryDark,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 19,
  },
  statusCategory: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
  viewMembershipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    backgroundColor: '#EDF2F7',
    gap: 4,
    flexShrink: 0,
  },
  viewMembershipText: {
    color: AdminColors.primaryDark,
    fontSize: 11.5,
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
    borderColor: '#DCE4EC',
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
    backgroundColor: '#FFF9E6',
    borderWidth: 1.5,
    borderColor: '#C9971A',
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
    borderColor: '#DCE4EC',
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
    backgroundColor: '#FFF9E6',
    borderWidth: 1.5,
    borderColor: '#C9971A',
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
    color: '#718096',
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
    borderColor: '#DCE4EC',
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
    backgroundColor: '#011F39',
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
    color: '#06294D',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  eventMonthText: {
    color: '#718096',
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
  noEventsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...Shadows.subtle,
  },
  noEventsTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  noEventsSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  kitFulfillmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kitFulfillmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  kitIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF2DC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDE4B8',
  },
  kitTextGroup: {
    flex: 1,
  },
  kitFulfillmentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
  },
  kitFulfillmentStatus: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  kitActionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kitActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
});
