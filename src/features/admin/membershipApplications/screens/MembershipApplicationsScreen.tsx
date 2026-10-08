import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppEmptyState } from '../../../../core';
import { MembershipApplicationsHeader } from '../components/MembershipApplicationsHeader';
import { MembershipStatsCards } from '../components/MembershipStatsCards';
import { MembershipSearchBar } from '../components/MembershipSearchBar';
import { MembershipStatusTabs, StatusTabKey } from '../components/MembershipStatusTabs';
import { MembershipApplicationCard } from '../components/MembershipApplicationCard';
import { MembershipApplicationsBottomNav } from '../components/MembershipApplicationsBottomNav';
import { MembershipFilterModal, FilterOptions } from '../components/MembershipFilterModal';
import { membershipApplicationsStore } from '../services/membershipApplicationsStore';
import { MembershipApplicationItem } from '../types/membershipApplications.types';

interface MembershipApplicationsScreenProps {
  onViewApplication?: (application: MembershipApplicationItem) => void;
  onReviewApplication?: (application: MembershipApplicationItem) => void;
  onReconsiderApplication?: (application: MembershipApplicationItem) => void;
  onBottomTabPress?: (tabKey: string) => void;
  onSignupPress?: () => void;
}

export const MembershipApplicationsScreen: React.FC<MembershipApplicationsScreenProps> = ({
  onViewApplication,
  onReviewApplication,
  onReconsiderApplication,
  onBottomTabPress,
  onSignupPress,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTabKey>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    membershipType: 'All Types',
    sortBy: 'newest',
  });

  const [applications, setApplications] = useState<MembershipApplicationItem[]>(() =>
    membershipApplicationsStore.getApplications()
  );
  const [stats, setStats] = useState(() => membershipApplicationsStore.getStats());

  useEffect(() => {
    const unsubscribe = membershipApplicationsStore.subscribe(() => {
      setApplications(membershipApplicationsStore.getApplications());
      setStats(membershipApplicationsStore.getStats());
    });
    return unsubscribe;
  }, []);

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
      membershipType: 'All Types',
      sortBy: 'newest',
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setApplications(membershipApplicationsStore.getApplications());
      setStats(membershipApplicationsStore.getStats());
      setIsRefreshing(false);
    }, 400);
  };

  const handleReconsider = (app: MembershipApplicationItem) => {
    membershipApplicationsStore.updateStatus(app.id, 'under_review');
    if (onReconsiderApplication) {
      onReconsiderApplication(app);
    }
  };

  const hasActiveFilters =
    filterOptions.membershipType !== 'All Types' ||
    filterOptions.sortBy !== 'newest';

  // Filter and sort applications list
  const filteredApplications = useMemo(() => {
    const list = applications.filter(app => {
      // Status filter
      if (activeTab !== 'all' && app.status !== activeTab) {
        return false;
      }
      // Membership type filter
      if (
        filterOptions.membershipType !== 'All Types' &&
        app.membershipType !== filterOptions.membershipType
      ) {
        return false;
      }
      // Search query filter (matches name, application ID, phone, or email)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = app.applicantName.toLowerCase().includes(query);
        const matchAppId = app.applicationId.toLowerCase().includes(query);
        const matchPhone = app.phone ? app.phone.toLowerCase().includes(query) : false;
        const matchEmail = app.email ? app.email.toLowerCase().includes(query) : false;
        return matchName || matchAppId || matchPhone || matchEmail;
      }
      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (filterOptions.sortBy === 'name_asc') {
        return a.applicantName.localeCompare(b.applicantName);
      }
      if (filterOptions.sortBy === 'oldest') {
        return new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
      }
      // Default: newest
      return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
    });
  }, [applications, activeTab, filterOptions, searchQuery]);

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <MembershipStatsCards stats={stats} />
      <MembershipSearchBar
        query={searchQuery}
        onChangeQuery={setSearchQuery}
        onFilterPress={() => setFilterModalVisible(true)}
        hasActiveFilters={hasActiveFilters}
      />
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MembershipApplicationsHeader
        paddingTop={insets.top}
        onMenuPress={() => {}}
        onNotificationsPress={() => {}}
        onProfilePress={() => {}}
        onSignupPress={onSignupPress}
      />

      <FlatList
        data={filteredApplications}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => (
          <MembershipApplicationCard
            application={item}
            onView={onViewApplication}
            onReview={onReviewApplication || onViewApplication}
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

      <MembershipApplicationsBottomNav
        bottomInset={insets.bottom}
        activeKey="applications"
        onTabPress={onBottomTabPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerArea: {
    paddingBottom: 4,
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
