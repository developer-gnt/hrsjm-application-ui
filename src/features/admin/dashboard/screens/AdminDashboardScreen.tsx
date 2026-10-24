import React, { useCallback, useMemo, useState } from 'react';
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refresh(), eventsQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [refresh, eventsQuery]);

  const dashboard = dashboardQuery.data;
  const isLoading =
    dashboardQuery.isLoading ||
    recentMembersQuery.isLoading ||
    recentApplicationsQuery.isLoading;
  const isError =
    dashboardQuery.isError ||
    recentMembersQuery.isError ||
    recentApplicationsQuery.isError;

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
        <DashboardHeader unreadCount={unreadQuery.data ?? 0} onNavigate={handleDrawerNavigate} />
        <AppErrorState message={message} onRetry={handleRefresh} />
      </View>
    );
  }

  if (isLoading || !dashboard) {
    return (
      <View style={styles.container}>
        <DashboardHeader unreadCount={unreadQuery.data ?? 0} onNavigate={handleDrawerNavigate} />
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

  const totalMembers = dashboard.memberships?.total ?? dashboard.users?.total ?? 0;
  const membersThisMonth = dashboard.memberships?.thisMonth ?? dashboard.users?.thisMonth ?? 0;

  const totalApplications = dashboard.assistance?.total ?? 0;
  const applicationsThisMonth = dashboard.assistance?.thisMonth ?? 0;

  const totalComplaints = dashboard.tickets?.total ?? 0;
  const complaintsThisMonth = dashboard.tickets?.thisMonth ?? 0;

  const eventsStats = eventsQuery.data?.stats;
  const totalEvents = dashboard.events?.total ?? eventsStats?.total ?? eventsQuery.data?.events.length ?? 0;
   const upcomingEvents = dashboard.events?.upcoming ?? eventsStats?.upcoming ?? 0;
  const eventsThisMonth = dashboard.events?.thisMonth ?? 0;

  return (
    <View style={styles.container}>
      <DashboardHeader
        unreadCount={unreadQuery.data ?? 0}
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
              <Text style={styles.calendarIcon}>📅</Text>
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
            onPress={() => jumpToTab('AdminApplicationsTab')}
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
            segments={toApplicationStatusSegments(dashboard.applicationsByStatus)}
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
              members={recentMembersQuery.data ?? []}
              onViewAll={() => jumpToTab('AdminMembersTab')}
            />
          </View>

          <View style={isMobile ? undefined : styles.twoColumnItem}>
            <RecentApplicationsCard
              rows={toRecentApplicationRows(recentApplicationsQuery.data ?? [])}
              onViewAll={() => jumpToTab('AdminApplicationsTab')}
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
    fontSize: 12,
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
