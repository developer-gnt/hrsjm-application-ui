import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppEmptyState, AppPagination, Spacing } from '../../../../core';
import { AppRoutes } from '../../../../core/constants/routes';
import { AdminSidebar } from '../../../../app/navigation/AdminSidebar';
import { MembershipApplicationsHeader } from '../components/MembershipApplicationsHeader';
import { MembershipStatsCards } from '../components/MembershipStatsCards';
import { MembershipSearchBar } from '../components/MembershipSearchBar';
import { MembershipStatusTabs, StatusTabKey } from '../components/MembershipStatusTabs';
import { MembershipApplicationCard } from '../components/MembershipApplicationCard';
import { MembershipApplicationsBottomNav } from '../components/MembershipApplicationsBottomNav';
import { MembershipFilterModal, FilterOptions } from '../components/MembershipFilterModal';
import { membershipApplicationsStore } from '../services/membershipApplicationsStore';
import {
  MembershipApplicationItem,
  getApplicationAccountType,
} from '../types/membershipApplications.types';

interface MembershipApplicationsScreenProps {
  onViewApplication?: (application: MembershipApplicationItem) => void;
  onReviewApplication?: (application: MembershipApplicationItem) => void;
  onReconsiderApplication?: (application: MembershipApplicationItem) => void;
  onBottomTabPress?: (tabKey: string) => void;
  onSignupPress?: () => void;
  showBottomNav?: boolean;
}

export const MembershipApplicationsScreen: React.FC<MembershipApplicationsScreenProps> = ({
  onViewApplication,
  onReviewApplication,
  onReconsiderApplication,
  onBottomTabPress,
  onSignupPress,
  showBottomNav = false,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleBottomTabPress = (tabKey: string) => {
    if (onBottomTabPress) {
      onBottomTabPress(tabKey);
      return;
    }
    if (navigation?.navigate) {
      if (tabKey === 'dashboard') navigation.navigate(AppRoutes.ADMIN_DASHBOARD_TAB);
      else if (tabKey === 'members') navigation.navigate(AppRoutes.MEMBERS_DIRECTORY);
      else if (tabKey === 'applications') navigation.navigate(AppRoutes.MEMBERSHIP_APPLICATIONS);
      else if (tabKey === 'complaints') navigation.navigate(AppRoutes.ADMIN_COMPLAINTS_TAB);
      else if (tabKey === 'more') navigation.navigate(AppRoutes.ADMIN_MORE_TAB);
    }
  };

  const handleViewApplication = (app: MembershipApplicationItem) => {
    if (onViewApplication) {
      onViewApplication(app);
    } else if (navigation?.navigate) {
      navigation.navigate(AppRoutes.MEMBERSHIP_APPLICATION_DETAILS, {
        applicationId: app.applicationId || app.id,
      });
    }
  };
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTabKey>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    type: 'all',
    accountType: 'all',
    memberType: 'All Types',
    membershipType: 'All Types',
    sortBy: 'newest',
  });

  const [applications, setApplications] = useState<MembershipApplicationItem[]>(() =>
    membershipApplicationsStore.getAllApplications()
  );
  const [stats, setStats] = useState(() => membershipApplicationsStore.getStats());

  useEffect(() => {
    membershipApplicationsStore.fetchApplications();
    const unsubscribe = membershipApplicationsStore.subscribe(() => {
      setApplications(membershipApplicationsStore.getAllApplications());
      setStats(membershipApplicationsStore.getStats());
    });

    // Sync on window focus and storage changes
    const handleSync = () => {
      membershipApplicationsStore.fetchApplications().catch(() => {});
    };

    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : null;
    if (win && typeof win.addEventListener === 'function') {
      win.addEventListener('focus', handleSync);
      win.addEventListener('storage', handleSync);
    }

    return () => {
      unsubscribe();
      if (win && typeof win.removeEventListener === 'function') {
        win.removeEventListener('focus', handleSync);
        win.removeEventListener('storage', handleSync);
      }
    };
  }, []);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeTab, filterOptions]);

  // When top tab is selected, sync with filter options
  const handleSelectTab = (tab: StatusTabKey) => {
    setActiveTab(tab);
    setFilterOptions(prev => ({ ...prev, status: tab }));
  };

  // When modal filters are applied, sync status tab
  const handleApplyFilters = (filters: FilterOptions) => {
    setFilterOptions(filters);
    setActiveTab(filters.status);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
    setFilterOptions({
      status: 'all',
      type: 'all',
      accountType: 'all',
      memberType: 'All Types',
      membershipType: 'All Types',
      sortBy: 'newest',
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await membershipApplicationsStore.fetchApplications();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReconsider = async (app: MembershipApplicationItem) => {
    await membershipApplicationsStore.updateStatus(app.id, 'under_review');
    if (onReconsiderApplication) {
      onReconsiderApplication(app);
    }
  };

  const hasActiveFilters =
    (filterOptions.type && filterOptions.type !== 'all') ||
    (filterOptions.accountType && filterOptions.accountType !== 'all') ||
    filterOptions.sortBy !== 'newest';

  const memberAppsCount = useMemo(
    () =>
      applications.filter(
        a =>
          !a.membershipType?.toLowerCase().includes('seeker') &&
          !a.applicationId?.startsWith('HRSJM-SEK'),
      ).length,
    [applications],
  );

  const seekerAppsCount = useMemo(
    () =>
      applications.filter(
        a =>
          a.membershipType?.toLowerCase().includes('seeker') ||
          a.applicationId?.startsWith('HRSJM-SEK'),
      ).length,
    [applications],
  );

  // Filter and sort applications list
  const filteredApplications = useMemo(() => {
    const list = applications.filter(app => {
      // Status filter
      if (activeTab === 'under_review') {
        if (app.status !== 'under_review' && (app.status as string) !== 'submitted') {
          return false;
        }
      } else if (activeTab !== 'all' && app.status !== activeTab) {
        return false;
      }
      const isSeeker =
        (app.membershipType?.toLowerCase().includes('seeker') ||
        app.applicationId?.startsWith('HRSJM-SEK')) ?? false;

      // Category chip filter: Members vs Donation Seeker
      if (filterOptions.membershipType === 'Donation Seeker' && !isSeeker) {
        return false;
      } else if (filterOptions.membershipType === 'Members' && isSeeker) {
        return false;
      }

      // Modal Type filter: All, Membership, Donor Seeker
      const selectedType = filterOptions.type || filterOptions.accountType;
      if (selectedType && selectedType !== 'all') {
        const appAccountType = isSeeker ? 'seeker' : 'membership';
        if (appAccountType !== selectedType) {
          return false;
        }
      }

      // Search query filter (matches name, application ID, ID, membership type, phone, or email)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = (app.applicantName || '').toLowerCase().includes(query);
        const matchAppId = (app.applicationId || '').toLowerCase().includes(query);
        const matchId = (app.id || '').toLowerCase().includes(query);
        const matchType = (app.membershipType || '').toLowerCase().includes(query);
        const matchPhone = app.phone ? String(app.phone).toLowerCase().includes(query) : false;
        const matchEmail = app.email ? String(app.email).toLowerCase().includes(query) : false;
        return matchName || matchAppId || matchId || matchType || matchPhone || matchEmail;
      }
      return true;
    });

    // Sorting
    return [...list].sort((a, b) => {
      if (filterOptions.sortBy === 'name_asc') {
        return (a.applicantName || '').localeCompare(b.applicantName || '');
      }
      const timeA = new Date(a.submittedDate || 0).getTime() || 0;
      const timeB = new Date(b.submittedDate || 0).getTime() || 0;
      if (filterOptions.sortBy === 'oldest') {
        return timeA - timeB;
      }
      // Default: newest
      return timeB - timeA;
    });
  }, [applications, activeTab, filterOptions, searchQuery]);

  const paginatedApplications = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredApplications.slice(startIndex, startIndex + pageSize);
  }, [filteredApplications, page, pageSize]);

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <MembershipStatsCards stats={stats} />
      <MembershipSearchBar
        query={searchQuery}
        onChangeQuery={setSearchQuery}
        onFilterPress={() => setFilterModalVisible(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Category Type Color Filter Bar: Member (Dark White) vs Seeker (Light White) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilterScroll}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            filterOptions.membershipType === 'All Types' && styles.categoryChipActiveAll,
          ]}
          onPress={() => setFilterOptions(prev => ({ ...prev, membershipType: 'All Types' }))}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.categoryChipText,
              filterOptions.membershipType === 'All Types' && styles.categoryChipTextActive,
            ]}
          >
            All Types ({applications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryChip,
            styles.categoryChipMember,
            filterOptions.membershipType === 'Members' && styles.categoryChipActiveMember,
          ]}
          onPress={() =>
            setFilterOptions(prev => ({
              ...prev,
              membershipType: prev.membershipType === 'Members' ? 'All Types' : 'Members',
            }))
          }
          activeOpacity={0.8}
        >
          <View style={styles.colorDotMember} />
          <Text
            style={[
              styles.categoryChipText,
              styles.categoryChipTextMember,
              filterOptions.membershipType === 'Members' && styles.categoryChipTextActive,
            ]}
          >
            Members ({memberAppsCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryChip,
            styles.categoryChipSeeker,
            filterOptions.membershipType === 'Donation Seeker' && styles.categoryChipActiveSeeker,
          ]}
          onPress={() =>
            setFilterOptions(prev => ({
              ...prev,
              membershipType: prev.membershipType === 'Donation Seeker' ? 'All Types' : 'Donation Seeker',
            }))
          }
          activeOpacity={0.8}
        >
          <View style={styles.colorDotSeeker} />
          <Text
            style={[
              styles.categoryChipText,
              styles.categoryChipTextSeeker,
              filterOptions.membershipType === 'Donation Seeker' && styles.categoryChipTextActive,
            ]}
          >
            Donation Seekers ({seekerAppsCount})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <MembershipStatusTabs
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        stats={stats}
      />
      <View style={styles.listSpacer} />
    </View>
  );

  const renderEmptyState = () => (
    <AppEmptyState
      icon="🔍"
      title="No Applications Found"
      description={
        searchQuery.trim()
          ? `No applications found matching "${searchQuery}".`
          : 'No applications match the selected status and filter criteria.'
      }
      actionTitle="Reset All Filters"
      onAction={handleResetFilters}
      style={styles.emptyContainer}
    />
  );

  const handleSidebarNavigate = (target: string) => {
    setSidebarVisible(false);
    if (navigation?.navigate) {
      if (
        target === AppRoutes.ADMIN_DASHBOARD_TAB ||
        target === AppRoutes.ADMIN_MEMBERS_TAB ||
        target === AppRoutes.ADMIN_APPLICATIONS_TAB ||
        target === AppRoutes.ADMIN_COMPLAINTS_TAB ||
        target === AppRoutes.ADMIN_MORE_TAB
      ) {
        navigation.navigate(target);
      } else {
        navigation.navigate(AppRoutes.ADMIN_MORE_TAB, { screen: target });
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MembershipApplicationsHeader
        paddingTop={insets.top}
        title="Membership Applications"
        subtitle="Review, verify and manage membership applications."
        onMenuPress={() => setSidebarVisible(true)}
        onNotificationsPress={() => {
          if (navigation?.navigate) {
            navigation.navigate(AppRoutes.ADMIN_MORE_TAB, { screen: AppRoutes.NOTIFICATIONS });
          }
        }}
        onProfilePress={() => {
          if (navigation?.navigate) {
            navigation.navigate(AppRoutes.ADMIN_MORE_TAB, { screen: AppRoutes.MY_PROFILE });
          }
        }}
        onSignupPress={onSignupPress}
      />

      <FlatList
        data={paginatedApplications}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmptyState}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          filteredApplications.length > 0 ? (
            <AppPagination
              currentPage={page}
              totalItems={filteredApplications.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="applications"
            />
          ) : undefined
        }
        renderItem={({ item }) => (
          <MembershipApplicationCard
            application={item}
            onView={handleViewApplication}
            onReview={onReviewApplication || handleViewApplication}
            onReconsider={handleReconsider}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#0F2860"
            colors={['#0F2860']}
          />
        }
      />

      <MembershipFilterModal
        visible={filterModalVisible}
        currentFilters={filterOptions}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {showBottomNav && (
        <MembershipApplicationsBottomNav
          bottomInset={insets.bottom}
          activeKey="applications"
          onTabPress={handleBottomTabPress}
        />
      )}

      <AdminSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onNavigate={handleSidebarNavigate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  headerArea: {
    paddingBottom: 4,
  },
  categoryFilterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE5EE',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  categoryChipActiveAll: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  categoryChipMember: {
    backgroundColor: '#EEF2F6', // little dark white
    borderColor: '#C8D5E5',
  },
  categoryChipActiveMember: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  categoryChipSeeker: {
    backgroundColor: '#FFFFFF', // little light white
    borderColor: '#EFE7DA',
  },
  categoryChipActiveSeeker: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  categoryChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  categoryChipTextMember: {
    color: '#0F2860',
  },
  categoryChipTextSeeker: {
    color: '#92400E',
  },
  colorDotMember: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F2860',
  },
  colorDotSeeker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D97706',
  },
  listSpacer: {
    height: 8,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyContainer: {
    paddingVertical: 32,
  },
});
