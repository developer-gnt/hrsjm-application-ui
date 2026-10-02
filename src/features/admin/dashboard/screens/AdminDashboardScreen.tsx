import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing } from '../../../../core/theme/spacing';
import { SkeletonCard } from '../../../../core/components/feedback/SkeletonCard';
import { AppErrorState } from '../../../../core/components/feedback/AppErrorState';
import { DashboardHeader } from '../../../../app/navigation/DashboardHeader';
import { AdminStatCard } from '../../../../core/components/admin/AdminStatCard';
import { can } from '../../../../core/permissions/can';
import { PermissionKeys } from '../../../../core/permissions/permission.constants';
import {
  useDashboard,
  useDashboardRefresh,
  dashboardErrorMessage,
  useRecentMembers,
  useRecentApplications,
  useUnreadNotifications,
} from '../hooks/useDashboard';
import {
  computeGrowthPercent,
  currentMonthLabel,
  toApplicationStatusSegments,
  toComplaintsSegments,
  toGrowthChartPoints,
  toRecentApplicationRows,
} from '../utils/dashboard.utils';
import { MembershipGrowthCard } from '../components/MembershipGrowthCard';
import { StatusDonutCard } from '../components/StatusDonutCard';
import { RevenueSummaryCard } from '../components/RevenueSummaryCard';
import { PendingActionsCard } from '../components/PendingActionsCard';
import { RecentMembersCard } from '../components/RecentMembersCard';
import { RecentApplicationsCard } from '../components/RecentApplicationsCard';

const MORE_TAB = 'AdminMoreTab' as const;

export const AdminDashboardScreen: React.FC<{
  navigation: BottomTabNavigationProp<Record<string, object | undefined>>;
}> = ({ navigation }) => {
  const dashboardQuery = useDashboard();
  const recentMembersQuery = useRecentMembers();
  const recentApplicationsQuery = useRecentApplications();
  const unreadQuery = useUnreadNotifications();
  const refresh = useDashboardRefresh();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

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

  if (isError) {
    const message = dashboardQuery.error
      ? dashboardErrorMessage(dashboardQuery.error)
      : 'Something went wrong while loading the dashboard. Please try again.';
    return (
      <View style={styles.container}>
        <DashboardHeader unreadCount={0} onOpenMore={() => jumpToTab(MORE_TAB)} />
        <AppErrorState message={message} onRetry={handleRefresh} />
      </View>
    );
  }

  if (isLoading || !dashboard) {
    return (
      <View style={styles.container}>
        <DashboardHeader unreadCount={0} onOpenMore={() => jumpToTab(MORE_TAB)} />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeBlock}>
            <SkeletonCard height={22} lines={1} style={styles.skeletonTitle} />
            <SkeletonCard height={14} lines={1} style={styles.skeletonSubtitle} />
          </View>
          <View style={styles.statsRow}>
            <SkeletonCard height={104} lines={1} />
            <SkeletonCard height={104} lines={1} />
          </View>
          <View style={styles.statsRow}>
            <SkeletonCard height={104} lines={1} />
            <SkeletonCard height={104} lines={1} />
          </View>
          <SkeletonCard height={220} lines={1} />
          <View style={styles.donutsRow}>
            <SkeletonCard height={200} lines={1} />
            <SkeletonCard height={200} lines={1} />
          </View>
          <SkeletonCard height={240} lines={1} />
          <SkeletonCard height={230} lines={1} />
          <SkeletonCard height={230} lines={1} />
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
  const donationGrowth = computeGrowthPercent(
    dashboard.donations.thisMonth,
    dashboard.donations.prevMonth,
  );

  const growthPoints = toGrowthChartPoints(dashboard.memberGrowth);
  const latestPoint = growthPoints[growthPoints.length - 1];

  const pendingActionItems = [
    {
      icon: '👥',
      title: 'Membership Approvals',
      count: dashboard.memberships.pending,
      onPress: can(PermissionKeys.MEMBERSHIP_APPROVE)
        ? () => jumpToTab('AdminMembersTab')
        : undefined,
    },
    {
      icon: '💳',
      title: 'Payment Verification',
      count: dashboard.membershipPayments.pending,
      onPress: can(PermissionKeys.PAYMENT_READ) ? () => jumpToTab(MORE_TAB) : undefined,
    },
    {
      icon: '📋',
      title: 'Assistance Requests',
      count: dashboard.assistance.pending,
      onPress: can(PermissionKeys.ASSISTANCE_REVIEW)
        ? () => jumpToTab('AdminApplicationsTab')
        : undefined,
    },
  ];

  return (
    <View style={styles.container}>
      <DashboardHeader
        unreadCount={unreadQuery.data ?? 0}
        onOpenMore={() => jumpToTab(MORE_TAB)}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.welcomeBlock}>
          <View style={styles.welcomeHeaderRow}>
            <View style={styles.welcomeTextWrap}>
              <Text style={styles.welcomeTitle}>Welcome, Admin</Text>
              <Text style={styles.welcomeSubtitle}>
                Here's an overview of HRSJM activities and impact.
              </Text>
            </View>
            <View style={styles.monthChip}>
              <Text style={styles.calendarIcon}>📅</Text>
              <Text style={styles.monthText}>{currentMonthLabel()}</Text>
              <Text style={styles.dropdownChevron}>▾</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <AdminStatCard
            icon="👥"
            title="Total Members"
            value={dashboard.users.total}
            growthPercent={memberGrowth ?? undefined}
            note={
              dashboard.users.thisMonth > 0
                ? `+${dashboard.users.thisMonth} this month`
                : undefined
            }
            tint="blue"
            onPress={() => jumpToTab('AdminMembersTab')}
          />
          <AdminStatCard
            icon="📄"
            title="Total Applications"
            value={dashboard.assistance.total}
            growthPercent={applicationGrowth ?? undefined}
            note={
              dashboard.assistance.thisMonth > 0
                ? `+${dashboard.assistance.thisMonth} this month`
                : undefined
            }
            tint="gold"
            onPress={() => jumpToTab('AdminApplicationsTab')}
          />
        </View>

        <View style={styles.statsRow}>
          <AdminStatCard
            icon="💬"
            title="Total Complaints"
            value={dashboard.tickets.total}
            growthPercent={complaintsGrowth ?? undefined}
            note={
              dashboard.tickets.thisMonth > 0
                ? `+${dashboard.tickets.thisMonth} this month`
                : undefined
            }
            tint="green"
            onPress={() => jumpToTab('AdminComplaintsTab')}
          />
          <AdminStatCard
            icon="🎁"
            title="Total Donations"
            value={dashboard.donations.total}
            growthPercent={donationGrowth ?? undefined}
            note={
              dashboard.donations.thisMonth > 0
                ? `+${dashboard.donations.thisMonth} this month`
                : undefined
            }
            tint="purple"
            onPress={() => jumpToTab(MORE_TAB)}
          />
        </View>

        <MembershipGrowthCard
          points={growthPoints}
          latestLabel={latestPoint ? `${latestPoint.label} 2026` : undefined}
        />

        <View style={styles.donutsRow}>
          <StatusDonutCard
            title="Application Status"
            segments={toApplicationStatusSegments(dashboard.applicationsByStatus)}
          />
          <StatusDonutCard
            title="Complaints Overview"
            segments={toComplaintsSegments(dashboard.ticketsByStatus)}
          />
        </View>

        <RevenueSummaryCard
          membershipIncome={dashboard.revenue.membershipIncome}
          donationIncome={dashboard.revenue.donationIncome}
        />

        <PendingActionsCard items={pendingActionItems} />

        <RecentMembersCard
          members={recentMembersQuery.data ?? []}
          onViewAll={() => jumpToTab('AdminMembersTab')}
        />

        <RecentApplicationsCard
          rows={toRecentApplicationRows(recentApplicationsQuery.data ?? [])}
          onViewAll={() => jumpToTab('AdminApplicationsTab')}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
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
    ...Typography.screenTitle,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2C59',
  },
  welcomeSubtitle: {
    ...Typography.body,
    fontSize: 12,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  monthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  calendarIcon: {
    fontSize: 12,
  },
  monthText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A365D',
  },
  dropdownChevron: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A365D',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  donutsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  skeletonTitle: {
    width: 180,
  },
  skeletonSubtitle: {
    width: 260,
  },
});

export default AdminDashboardScreen;
