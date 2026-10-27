import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Typography, FontFamilies } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { SkeletonCard } from '../../../../core/components/feedback/SkeletonCard';
import { AppErrorState } from '../../../../core/components/feedback/AppErrorState';
import { DashboardHeader } from '../../../../app/navigation/DashboardHeader';
import { AdminStatCard } from '../../../../core/components/admin/AdminStatCard';
import { Users, FileText, MessageSquare, Calendar } from '../../../../core/components/icons';
import { AppRoutes } from '../../../../core/constants/routes';
import {
  useDashboard,
  useDashboardRefresh,
  dashboardErrorMessage,
  useRecentMembers,
  useRecentApplications,
  useUnreadNotifications,
} from '../hooks/useDashboard';
import { useEvents } from '../../content/events/hooks/useEvents';
import {
  computeGrowthPercent,
  toApplicationStatusSegments,
  toComplaintsSegments,
  toGrowthChartPoints,
  toRecentApplicationRows,
} from '../utils/dashboard.utils';
import { MembershipGrowthCard } from '../components/MembershipGrowthCard';
import { StatusDonutCard } from '../components/StatusDonutCard';
import { RecentMembersCard } from '../components/RecentMembersCard';
import { RecentApplicationsCard } from '../components/RecentApplicationsCard';
import { AdminCalendarModal } from '../components/AdminCalendarModal';
import { membershipApplicationsStore } from '../../membershipApplications/services/membershipApplicationsStore';
import { usersStore } from '../../users/services/usersStore';
import type { AdminMemberItem } from '../types/dashboard.types';

const MORE_TAB = 'AdminMoreTab' as const;

/** Generates dynamic rolling 12-month options (newest first). */
const generateMonthOptions = (): Array<{ label: string; value: string }> => {
  const options: Array<{ label: string; value: string }> = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    options.push({ label, value });
  }
  return options;
};

export const AdminDashboardScreen: React.FC<{
  navigation: BottomTabNavigationProp<Record<string, object | undefined>>;
}> = ({ navigation }) => {
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [selectedMonthOption, setSelectedMonthOption] = useState(monthOptions[0]);
  const [selectedRangeMonths, setSelectedRangeMonths] = useState(6);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-23');

  const { width } = useWindowDimensions();
  const isMobile = width < 680;

  const dashboardQuery = useDashboard(selectedMonthOption.value, selectedRangeMonths);
  const recentMembersQuery = useRecentMembers();
  const recentApplicationsQuery = useRecentApplications();
  const unreadQuery = useUnreadNotifications();
  const eventsQuery = useEvents();
  const refresh = useDashboardRefresh();
  const [refreshing, setRefreshing] = useState(false);
  const [storeTick, setStoreTick] = useState(0);

  useEffect(() => {
    membershipApplicationsStore.loadPersistedApplications();
    membershipApplicationsStore.fetchApplications().catch(() => {});
    usersStore.fetchUsers().catch(() => {});

    const unsubscribeApps = membershipApplicationsStore.subscribe(() => {
      setStoreTick((t) => t + 1);
    });

    const unsubscribeUsers = usersStore.subscribe(() => {
      setStoreTick((t) => t + 1);
    });

    return () => {
      unsubscribeApps();
      unsubscribeUsers();
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refresh(),
        eventsQuery.refetch(),
        recentMembersQuery.refetch().catch(() => {}),
        membershipApplicationsStore.fetchApplications().catch(() => {}),
        recentApplicationsQuery.refetch().catch(() => {}),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refresh, eventsQuery, recentMembersQuery, recentApplicationsQuery]);

  const recentApprovedMembers = useMemo(() => {
    const backendMembers = recentMembersQuery.data ?? [];
    const storeApps = membershipApplicationsStore.getApplications();

    // Approved member applications from store (keeping Donation Seekers strictly separate)
    const approvedStoreMembers = (storeApps || [])
      .filter((a) => {
        const st = (a.status || '').toLowerCase();
        const isApproved = st === 'approved' || st === 'active';
        const isSeeker =
          (a as any).membership_type?.toLowerCase?.().includes('seeker') ||
          (a as any).type === 'DONATION_SEEKER';
        return isApproved && !isSeeker;
      })
      .map((a) => ({
        id: a.id || a.applicationId,
        full_name: a.applicantName || 'Member',
        mobile_number: a.phone || '',
        email: a.email || null,
        status: 'ACTIVE' as const,
        roles: [{ name: 'MEMBER' }],
        created_at: a.submittedDate || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        membership: {
          id: a.id,
          membershipNumber: a.applicationId,
          category: a.membershipType || 'Member',
          status: 'ACTIVE',
        },
      }));

    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const combined: AdminMemberItem[] = [];

    // Authoritative backend records first
    for (const m of backendMembers) {
      const memStatus = String(m.membership?.status || m.status || '').toUpperCase();
      if (memStatus === 'ACTIVE' || memStatus === 'APPROVED') {
        const key = m.id || m.mobile_number || m.full_name;
        const nameKey = (m.full_name || '').toLowerCase().trim();
        if (!seenIds.has(key)) {
          seenIds.add(key);
          if (nameKey) seenNames.add(nameKey);
          combined.push(m);
        }
      }
    }

    // Then approved store members (if not already in backend list)
    for (const app of approvedStoreMembers) {
      const nameKey = app.full_name.toLowerCase().trim();
      const idKey = app.id;
      if (!seenIds.has(idKey) && !seenNames.has(nameKey)) {
        seenIds.add(idKey);
        seenNames.add(nameKey);
        combined.push(app as any);
      }
    }

    return combined;
  }, [recentMembersQuery.data, storeTick]);

  const recentApplicationRows = useMemo(() => {
    const storeApps = membershipApplicationsStore.getApplications();
    const queryItems = recentApplicationsQuery.data ?? [];

    if (storeApps && storeApps.length > 0) {
      const statusMap = new Map<string, string>();
      storeApps.forEach((a) => {
        if (a.id) statusMap.set(a.id, a.status);
        if (a.applicationId) statusMap.set(a.applicationId, a.status);
      });

      if (queryItems.length > 0) {
        return toRecentApplicationRows(queryItems)
          .map((row) => {
            const matchedStatus = statusMap.get(row.id);
            if (matchedStatus) {
              const up = matchedStatus.toUpperCase();
              const mappedStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CLOSED' =
                up === 'APPROVED' || up === 'ACTIVE'
                  ? 'APPROVED'
                  : up === 'UNDER_REVIEW'
                  ? 'UNDER_REVIEW'
                  : up === 'REJECTED'
                  ? 'REJECTED'
                  : 'PENDING';
              return { ...row, status: mappedStatus };
            }
            return row;
          })
          .filter((row) => row.status === 'PENDING' || row.status === 'UNDER_REVIEW');
      }

      // Only show applications awaiting review (submitted / under review)
      const pendingStoreApps = storeApps.filter(
        (app) => app.status === 'submitted' || app.status === 'under_review',
      );

      const sortedStoreApps = [...pendingStoreApps].sort((a, b) => {
        const timeA = new Date(a.submittedDate || 0).getTime() || 0;
        const timeB = new Date(b.submittedDate || 0).getTime() || 0;
        return timeB - timeA;
      });

      return sortedStoreApps.slice(0, 5).map((app) => {
        const up = (app.status || '').toUpperCase();
        const mappedStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CLOSED' =
          up === 'UNDER_REVIEW' ? 'UNDER_REVIEW' : 'PENDING';
        return {
          id: app.applicationId || app.id,
          created_at: app.submittedDate || new Date().toISOString(),
          status: mappedStatus,
          full_name: app.applicantName,
        };
      });
    }

    return toRecentApplicationRows(queryItems).filter(
      (row) => row.status === 'PENDING' || row.status === 'UNDER_REVIEW',
    );
  }, [recentApplicationsQuery.data, storeTick]);

  const dashboard = dashboardQuery.data;
  const isLoading = dashboardQuery.isLoading && !dashboard;
  const isError = dashboardQuery.isError && !dashboard;

  const jumpToTab = (tabName: string) => navigation.jumpTo(tabName);

  const handleDrawerNavigate = (target: string) => {
    if (
      target === 'AdminDashboardTab' ||
      target === 'AdminMembersTab' ||
      target === 'AdminApplicationsTab' ||
      target === 'AdminComplaintsTab' ||
      target === 'AdminMoreTab'
    ) {
      jumpToTab(target);
    } else {
      (navigation as any).navigate(MORE_TAB, { screen: target });
    }
  };

  if (isError) {
    const message = dashboardQuery.error
      ? dashboardErrorMessage(dashboardQuery.error)
      : 'Something went wrong while loading the dashboard. Please try again.';
    return (
      <View style={styles.container}>
        <DashboardHeader onNavigate={handleDrawerNavigate} />
        <AppErrorState message={message} onRetry={handleRefresh} />
      </View>
    );
  }

  if (isLoading || !dashboard) {
    return (
      <View style={styles.container}>
        <DashboardHeader onNavigate={handleDrawerNavigate} />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeBlock}>
            <SkeletonCard height={22} lines={1} style={styles.skeletonTitle} />
            <SkeletonCard height={14} lines={1} style={styles.skeletonSubtitle} />
          </View>
          <View style={styles.statsRow}>
            <SkeletonCard height={88} lines={1} />
            <SkeletonCard height={88} lines={1} />
          </View>
          <View style={styles.statsRow}>
            <SkeletonCard height={88} lines={1} />
            <SkeletonCard height={88} lines={1} />
          </View>
          <SkeletonCard height={200} lines={1} />
          <View style={styles.twoColumnRow}>
            <SkeletonCard height={180} lines={1} />
            <SkeletonCard height={180} lines={1} />
          </View>
          <View style={isMobile ? styles.singleColumn : styles.twoColumnRow}>
            <SkeletonCard height={180} lines={1} />
            <SkeletonCard height={180} lines={1} />
          </View>
        </ScrollView>
      </View>
    );
  }

  const memberGrowth = computeGrowthPercent(
    dashboard.users.thisMonth,
    dashboard.users.prevMonth,
  );
  const applicationGrowth = computeGrowthPercent(
    dashboard.assistance.thisMonth,
    dashboard.assistance.prevMonth,
  );
  const complaintsGrowth = computeGrowthPercent(
    dashboard.tickets.thisMonth,
    dashboard.tickets.prevMonth,
  );

  const growthPoints = toGrowthChartPoints(dashboard.memberGrowth);
  const latestPoint = growthPoints[growthPoints.length - 1];

  const approvedStoreCount = (membershipApplicationsStore.getApplications() || []).filter(
    (a) => {
      const st = (a.status || '').toLowerCase();
      const isApproved = st === 'approved' || st === 'active';
      const isSeeker =
        (a as any).membership_type?.toLowerCase?.().includes('seeker') ||
        (a as any).type === 'DONATION_SEEKER';
      return isApproved && !isSeeker;
    },
  ).length;

  const totalMembers = Math.max(
    dashboard.memberships?.total ?? dashboard.users?.total ?? 0,
    recentApprovedMembers.length,
    approvedStoreCount,
  );
  const membersThisMonth = dashboard.memberships?.thisMonth ?? dashboard.users?.thisMonth ?? 0;

  // 1. Membership applications (from backend memberships or applications store)
  const storeMemberAppsCount = (membershipApplicationsStore.getApplications() || []).filter(
    (a) =>
      a.membershipType !== 'Donation Seeker' &&
      !a.applicationId?.startsWith('HRSJM-SEK'),
  ).length;
  const membershipAppsTotal = Math.max(
    dashboard.applications?.memberships ?? dashboard.memberships?.total ?? 0,
    membershipApplicationsStore.getStats().total ?? 0,
    storeMemberAppsCount,
  );
  const membershipAppsThisMonth = dashboard.memberships?.thisMonth ?? 0;

  // 2. Donor Seeker applications (from backend assistance requests or applications store)
  const storeSeekerAppsCount = (
    membershipApplicationsStore.getAllApplications?.() ||
    membershipApplicationsStore.getApplications() ||
    []
  ).filter(
    (a) =>
      a.membershipType === 'Donation Seeker' ||
      a.applicationId?.startsWith('HRSJM-SEK'),
  ).length;
  const seekerAppsTotal = Math.max(
    dashboard.applications?.assistance ?? dashboard.assistance?.total ?? 0,
    storeSeekerAppsCount,
  );
  const seekerAppsThisMonth = dashboard.assistance?.thisMonth ?? 0;

  // 3. User Signup applications (pending verification signups in usersStore)
  const userStats = usersStore.getStats();
  const signupAppsTotal = Math.max(
    dashboard.applications?.signups ?? 0,
    userStats.pending,
  );
  const signupAppsThisMonth = dashboard.users?.thisMonth ?? 0;

  // Comprehensive Total Applications KPI:
  // Combines (1) Membership applications + (2) Donor Seeker applications + (3) Signup applications
  const totalApplications =
    dashboard.applications?.total &&
    dashboard.applications.total >= (membershipAppsTotal + seekerAppsTotal + signupAppsTotal)
      ? dashboard.applications.total
      : (membershipAppsTotal + seekerAppsTotal + signupAppsTotal);

  const applicationsThisMonth =
    (membershipAppsThisMonth + seekerAppsThisMonth + (signupAppsTotal > 0 ? signupAppsThisMonth : 0)) ||
    (dashboard.applications?.thisMonth ?? dashboard.assistance?.thisMonth ?? 0);

  const totalComplaints = dashboard.tickets?.total ?? 0;
  const complaintsThisMonth = dashboard.tickets?.thisMonth ?? 0;

  const eventsStats = eventsQuery.data?.stats;
  const totalEvents = dashboard.events?.total ?? eventsStats?.total ?? eventsQuery.data?.events.length ?? 0;
   const upcomingEvents = dashboard.events?.upcoming ?? eventsStats?.upcoming ?? 0;
  const eventsThisMonth = dashboard.events?.thisMonth ?? 0;

  return (
    <View style={styles.container}>
      <DashboardHeader
        onNavigate={handleDrawerNavigate}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeBlock}>
          <View style={styles.welcomeHeaderRow}>
            <View style={styles.welcomeTextWrap}>
              <Text style={styles.welcomeTitle}>Welcome, Admin</Text>
              <Text style={styles.welcomeSubtitle}>
                Here's an overview of HRSJM activities and impact.
              </Text>
            </View>

            {/* Clickable Calendar Month Chip */}
            <TouchableOpacity
              style={styles.monthChip}
              onPress={() => setMonthPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Calendar size={14} color="#06294D" strokeWidth={2} style={styles.calendarIcon} />
              <Text style={styles.monthText}>{selectedMonthOption.label}</Text>
              <Text style={styles.dropdownChevron}>▾</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 KPI Cards (2x2 Grid) */}
        <View style={styles.statsRow}>
          <AdminStatCard
            Icon={Users}
            title="Total Members"
            value={totalMembers}
            note={`+${membersThisMonth} this month`}
            tone="navy"
            onPress={() => jumpToTab('AdminMembersTab')}
          />
          <AdminStatCard
            Icon={FileText}
            title="Total Applications"
            value={totalApplications}
            note={`+${applicationsThisMonth} this month`}
            tone="warning"
            onPress={() => {
              (navigation as any).navigate(MORE_TAB, {
                screen: AppRoutes.MEMBERSHIP_APPLICATIONS,
              });
            }}
          />
        </View>

        <View style={styles.statsRow}>
          <AdminStatCard
            Icon={MessageSquare}
            title="Total Complaints"
            value={totalComplaints}
            note={`+${complaintsThisMonth} this month`}
            tone="success"
            onPress={() => jumpToTab('AdminComplaintsTab')}
          />
          <AdminStatCard
            Icon={Calendar}
            title="Total Events"
            value={totalEvents}
            note={upcomingEvents > 0 ? `${upcomingEvents} upcoming` : `+${eventsThisMonth} this month`}
            tone="gold"
            onPress={() => handleDrawerNavigate('Events')}
          />
        </View>

        {/* Membership Growth Line Chart */}
        <MembershipGrowthCard
          points={growthPoints}
          latestLabel={latestPoint ? `${latestPoint.label} 2026` : selectedMonthOption.label}
          selectedRangeMonths={selectedRangeMonths}
          onRangeMonthsChange={setSelectedRangeMonths}
        />

        {/* 2 Donut Charts Side-by-Side */}
        <View style={styles.twoColumnRow}>
          <StatusDonutCard
            title="Application Status"
            segments={toApplicationStatusSegments(dashboard.applicationsByStatus, {
              approved: Math.max(dashboard.memberships?.active ?? 0, 0),
              pending: Math.max(dashboard.memberships?.pending ?? 0, signupAppsTotal),
            })}
          />
          <StatusDonutCard
            title="Complaints Overview"
            segments={toComplaintsSegments(dashboard.ticketsByStatus)}
          />
        </View>

        {/* 2 Recent Lists (Stacked on Mobile, 2-Column on Tablet/Desktop) */}
        <View style={isMobile ? styles.singleColumn : styles.twoColumnRow}>
          <View style={isMobile ? undefined : styles.twoColumnItem}>
            <RecentMembersCard
              members={recentApprovedMembers}
              onViewAll={() => jumpToTab('AdminMembersTab')}
              onPressRow={() => jumpToTab('AdminMembersTab')}
            />
          </View>

          <View style={isMobile ? undefined : styles.twoColumnItem}>
            <RecentApplicationsCard
              rows={recentApplicationRows}
              onViewAll={() => {
                (navigation as any).navigate(MORE_TAB, {
                  screen: AppRoutes.MEMBERSHIP_APPLICATIONS,
                });
              }}
              onPressRow={(rowId) => {
                (navigation as any).navigate(MORE_TAB, {
                  screen: AppRoutes.MEMBERSHIP_APPLICATION_DETAILS,
                  params: { applicationId: rowId },
                });
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Complete Interactive Calendar & Period Modal */}
      <AdminCalendarModal
        visible={monthPickerVisible}
        onClose={() => setMonthPickerVisible(false)}
        selectedMonthOption={selectedMonthOption}
        onSelectMonthOption={setSelectedMonthOption}
        monthOptions={monthOptions}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        events={eventsQuery.data?.events ?? []}
        onNavigateToEvents={() => handleDrawerNavigate('Events')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl + 20,
    gap: 12,
  },
  welcomeBlock: {
    marginTop: Spacing.xs,
  },
  welcomeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  welcomeTextWrap: {
    flex: 1,
  },
  welcomeTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#0B2F52',
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    ...Typography.body,
    fontSize: 12,
    color: '#34516D',
    marginTop: 2,
  },
  monthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    elevation: 1,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  calendarIcon: {
    marginRight: 2,
  },
  monthText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06294D',
  },
  dropdownChevron: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06294D',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  twoColumnItem: {
    flex: 1,
  },
  singleColumn: {
    flexDirection: 'column',
    gap: 12,
  },
  skeletonTitle: {
    width: 180,
  },
  skeletonSubtitle: {
    width: 260,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  monthModalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.floating,
  },
  monthModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#DBE5EE',
    marginBottom: 6,
  },
  monthModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B2F52',
  },
  closeIcon: {
    fontSize: 15,
    fontWeight: '700',
    color: '#718096',
  },
  monthList: {
    gap: 4,
  },
  monthOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  monthOptionActive: {
    backgroundColor: '#EDF2F7',
  },
  monthOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34516D',
  },
  monthOptionTextActive: {
    color: '#06294D',
    fontWeight: '800',
  },
  monthCheck: {
    fontSize: 14,
    fontWeight: '800',
    color: '#06294D',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    ...Shadows.card,
  },
  quickActionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.base,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  quickActionIcon: {
    fontSize: 18,
  },
  quickActionTextCol: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2F52',
  },
  quickActionSubtitle: {
    fontSize: 10,
    color: '#718096',
    marginTop: 1,
  },
  quickActionChevron: {
    fontSize: 16,
    fontWeight: '700',
    color: '#718096',
    marginLeft: 2,
  },
});

export default AdminDashboardScreen;
