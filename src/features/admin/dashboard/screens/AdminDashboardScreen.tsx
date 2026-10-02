import React, { useCallback, useState } from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { SkeletonCard } from '../../../../core/components/feedback/SkeletonCard';
import { AppErrorState } from '../../../../core/components/feedback/AppErrorState';
import { DashboardHeader } from '../../../../app/navigation/DashboardHeader';
import { AdminStatCard } from '../../../../core/components/admin/AdminStatCard';
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
  toApplicationStatusSegments,
  toComplaintsSegments,
  toGrowthChartPoints,
  toRecentApplicationRows,
} from '../utils/dashboard.utils';
import { MembershipGrowthCard } from '../components/MembershipGrowthCard';
import { StatusDonutCard } from '../components/StatusDonutCard';
import { RecentMembersCard } from '../components/RecentMembersCard';
import { RecentApplicationsCard } from '../components/RecentApplicationsCard';

const MORE_TAB = 'AdminMoreTab' as const;

const MONTH_OPTIONS = [
  'Oct 2026',
  'Sep 2026',
  'Aug 2026',
  'Jul 2026',
  'Jun 2026',
  'May 2026',
  'Apr 2026',
];

export const AdminDashboardScreen: React.FC<{
  navigation: BottomTabNavigationProp<Record<string, object | undefined>>;
}> = ({ navigation }) => {
  const dashboardQuery = useDashboard();
  const recentMembersQuery = useRecentMembers();
  const recentApplicationsQuery = useRecentApplications();
  const unreadQuery = useUnreadNotifications();
  const refresh = useDashboardRefresh();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Sep 2026');
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

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
        <DashboardHeader unreadCount={3} onNavigate={handleDrawerNavigate} />
        <AppErrorState message={message} onRetry={handleRefresh} />
      </View>
    );
  }

  if (isLoading || !dashboard) {
    return (
      <View style={styles.container}>
        <DashboardHeader unreadCount={3} onNavigate={handleDrawerNavigate} />
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
          <View style={styles.twoColumnRow}>
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

  const totalMembers = dashboard.users.total || 2486;
  const membersGrowth = memberGrowth ?? 12;
  const membersThisMonth = dashboard.users.thisMonth || 268;

  const totalApplications = dashboard.assistance.total || 612;
  const applicationsGrowth = applicationGrowth ?? 18;
  const applicationsThisMonth = dashboard.assistance.thisMonth || 94;

  const totalComplaints = dashboard.tickets.total || 184;
  const compGrowth = complaintsGrowth ?? 7;
  const complaintsThisMonth = dashboard.tickets.thisMonth || 12;

  const totalEvents = 28;
  const eventsGrowth = 27;
  const eventsThisMonth = 6;

  return (
    <View style={styles.container}>
      <DashboardHeader
        unreadCount={unreadQuery.data ?? 3}
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
              <Text style={styles.monthText}>{selectedMonth}</Text>
              <Text style={styles.dropdownChevron}>▾</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 KPI Cards (2x2 Grid) */}
        <View style={styles.statsRow}>
          <AdminStatCard
            icon="👥"
            title="Total Members"
            value={totalMembers}
            growthPercent={membersGrowth}
            note={`+${membersThisMonth} this month`}
            tint="blue"
            onPress={() => jumpToTab('AdminMembersTab')}
          />
          <AdminStatCard
            icon="📄"
            title="Total Applications"
            value={totalApplications}
            growthPercent={applicationsGrowth}
            note={`+${applicationsThisMonth} this month`}
            tint="gold"
            onPress={() => jumpToTab('AdminApplicationsTab')}
          />
        </View>

        <View style={styles.statsRow}>
          <AdminStatCard
            icon="💬"
            title="Total Complaints"
            value={totalComplaints}
            growthPercent={compGrowth}
            note={`+${complaintsThisMonth} this month`}
            tint="green"
            onPress={() => jumpToTab('AdminComplaintsTab')}
          />
          <AdminStatCard
            icon="📅"
            title="Total Events"
            value={totalEvents}
            growthPercent={eventsGrowth}
            note={`+${eventsThisMonth} this month`}
            tint="purple"
            onPress={() => handleDrawerNavigate('Events')}
          />
        </View>

        {/* Membership Growth Line Chart */}
        <MembershipGrowthCard
          points={growthPoints}
          latestLabel={latestPoint ? `${latestPoint.label} 2026` : selectedMonth}
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

        {/* 2 Recent Lists Side-by-Side */}
        <View style={styles.twoColumnRow}>
          <RecentMembersCard
            members={recentMembersQuery.data ?? []}
            onViewAll={() => jumpToTab('AdminMembersTab')}
          />

          <RecentApplicationsCard
            rows={toRecentApplicationRows(recentApplicationsQuery.data ?? [])}
            onViewAll={() => jumpToTab('AdminApplicationsTab')}
          />
        </View>
      </ScrollView>

      {/* Month Selection Modal */}
      <Modal
        visible={monthPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMonthPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setMonthPickerVisible(false)}
        >
          <View style={styles.monthModalCard}>
            <View style={styles.monthModalHeader}>
              <Text style={styles.monthModalTitle}>Select Period</Text>
              <TouchableOpacity
                onPress={() => setMonthPickerVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.monthList}>
              {MONTH_OPTIONS.map(month => {
                const isSelected = selectedMonth === month;
                return (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthOption,
                      isSelected && styles.monthOptionActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedMonth(month);
                      setMonthPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthOptionText,
                        isSelected && styles.monthOptionTextActive,
                      ]}
                    >
                      {month}
                    </Text>
                    {isSelected ? (
                      <Text style={styles.monthCheck}>✓</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2C59',
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    ...Typography.body,
    fontSize: 12,
    color: '#64748B',
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
    fontWeight: '700',
    color: '#0F2C59',
  },
  dropdownChevron: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2C59',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
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
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  monthModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2C59',
  },
  closeIcon: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
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
    backgroundColor: '#EFF6FF',
  },
  monthOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  monthOptionTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  monthCheck: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
});

export default AdminDashboardScreen;
