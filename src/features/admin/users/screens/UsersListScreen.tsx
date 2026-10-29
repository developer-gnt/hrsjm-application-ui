import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AdminColors, BorderRadius, FontFamilies, Spacing } from '../../../../core';
import { AppRoutes } from '../../../../core/constants/routes';
import { AdminSidebar } from '../../../../app/navigation/AdminSidebar';
import { usersStore } from '../services/usersStore';
import { UserItem, UserTypeTabKey, UserStatus, UserFilterOptions } from '../types/user.types';
import { UsersHeader } from '../components/UsersHeader';
import { UsersStatsCards } from '../components/UsersStatsCards';
import { UsersSearchBar } from '../components/UsersSearchBar';
import { UsersTypeTabs } from '../components/UsersTypeTabs';
import { UserCard } from '../components/UserCard';
import { UsersEmptyState } from '../components/UsersEmptyState';
import { UsersBottomNav } from '../components/UsersBottomNav';
import { UserConfirmationModal } from '../components/UserConfirmationModal';
import { UserPasswordResetModal } from '../components/UserPasswordResetModal';
import { UserFilterModal } from '../components/UserFilterModal';

interface UsersListScreenProps {
  onAddUserPress?: () => void;
  onSignUpPress?: () => void;
  onFilterPress?: () => void;
  onUserPress?: (user: UserItem) => void;
  onEditUserPress?: (user: UserItem) => void;
  onVerifyUserPress?: (user: UserItem) => void;
  onBottomTabPress?: (key: string) => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  showBottomNav?: boolean;
}

export const UsersListScreen: React.FC<UsersListScreenProps> = ({
  onAddUserPress,
  onSignUpPress,
  onFilterPress,
  onUserPress,
  onEditUserPress,
  onVerifyUserPress,
  onBottomTabPress,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
  showBottomNav = false,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // In the admin tab hierarchy, AdminNavigationBar renders the bottom tab bar.
  // Only render UsersBottomNav if explicitly requested (e.g. standalone dev preview).
  const isBottomNavVisible = showBottomNav === true;

  useEffect(() => {
    usersStore.fetchUsers().catch(() => {});
  }, []);

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

  const handleBottomTabPress = (tabKey: string) => {
    if (onBottomTabPress) {
      onBottomTabPress(tabKey);
      return;
    }
    if (navigation?.navigate) {
      if (tabKey === 'dashboard') navigation.navigate(AppRoutes.ADMIN_DASHBOARD_TAB);
      else if (tabKey === 'members') navigation.navigate(AppRoutes.ADMIN_MEMBERS_TAB);
      else if (tabKey === 'applications') navigation.navigate(AppRoutes.ADMIN_APPLICATIONS_TAB);
      else if (tabKey === 'complaints') navigation.navigate(AppRoutes.ADMIN_COMPLAINTS_TAB);
      else if (tabKey === 'users') navigation.navigate(AppRoutes.USERS);
      else if (tabKey === 'more') navigation.navigate(AppRoutes.ADMIN_MORE_TAB);
    }
  };

  const [activeTab, setActiveTab] = useState<UserTypeTabKey>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | UserStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter modal & advanced filters state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [extraFilters, setExtraFilters] = useState<UserFilterOptions>({});

  // Confirmation modal state for destructive block/unblock actions
  const [confirmModalUser, setConfirmModalUser] = useState<UserItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<'block' | 'unblock' | null>(null);

  // Password reset modal state
  const [passwordResetUser, setPasswordResetUser] = useState<UserItem | null>(null);

  // Subscribe to real-time usersStore
  useSyncExternalStore(
    usersStore.subscribe,
    usersStore.getSnapshot,
    usersStore.getSnapshot,
  );

  const stats = usersStore.getStats();
  const allUsers = usersStore.getAllUsers();

  // Dynamic real-time counts for the type tabs:
  // Reflects users matching active status filters & search query
  const tabStats = useMemo(() => {
    let pool = allUsers;
    if (selectedStatus !== 'all') {
      pool = pool.filter(u => u.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      pool = pool.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        (u.memberId && u.memberId.toLowerCase().includes(q))
      );
    }

    let admins = 0;
    let members = 0;
    let seekers = 0;
    let donors = 0;
    let general = 0;

    for (const u of pool) {
      if (u.userType === 'admin') admins++;
      else if (u.userType === 'member') members++;
      else if (u.userType === 'seeker') seekers++;
      else if (u.userType === 'donor') donors++;
      else if (u.userType === 'general') general++;
    }

    return {
      total: pool.length,
      adminsCount: admins,
      membersCount: members,
      seekersCount: seekers,
      donorsCount: donors,
      generalCount: general,
      active: stats.active,
      approved: stats.approved,
      pending: stats.pending,
      blocked: stats.blocked,
    };
  }, [allUsers, selectedStatus, searchQuery, stats]);

  const usersList = usersStore.getUsers({
    typeTab: activeTab,
    status: selectedStatus,
    searchQuery,
    joinedFrom: extraFilters.joinedFrom,
    joinedTo: extraFilters.joinedTo,
    sortBy: extraFilters.sortBy || 'newest',
  });

  const handleSelectStatusFromCard = (status: 'all' | 'active' | 'pending' | 'blocked') => {
    if (selectedStatus === status && status !== 'all') {
      setSelectedStatus('all');
    } else {
      setSelectedStatus(status);
    }
  };

  const handleToggleBlock = (user: UserItem) => {
    setConfirmModalUser(user);
    setConfirmAction(user.status === 'blocked' ? 'unblock' : 'block');
  };

  const handleConfirmToggleBlock = async () => {
    if (confirmModalUser && confirmAction) {
      const nextStatus: UserStatus = confirmAction === 'block' ? 'blocked' : 'active';
      const targetId = confirmModalUser.id;
      setConfirmModalUser(null);
      setConfirmAction(null);
      await usersStore.updateStatus(targetId, nextStatus);
    } else {
      setConfirmModalUser(null);
      setConfirmAction(null);
    }
  };

  const handleResetFilters = () => {
    setActiveTab('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setExtraFilters({});
  };

  const handleOpenFilterModal = () => {
    setFilterModalVisible(true);
    onFilterPress?.();
  };

  const handleApplyFilterModal = (filters: UserFilterOptions) => {
    setExtraFilters(filters);
    if (filters.typeTab) setActiveTab(filters.typeTab);
    if (filters.status) setSelectedStatus(filters.status);
  };

  let activeFilterCount = 0;
  if (selectedStatus !== 'all') activeFilterCount++;
  if (activeTab !== 'all') activeFilterCount++;
  if (searchQuery.trim().length > 0) activeFilterCount++;
  if (extraFilters.joinedFrom || extraFilters.joinedTo) activeFilterCount++;
  if (extraFilters.sortBy && extraFilters.sortBy !== 'newest') activeFilterCount++;

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <UsersHeader
        paddingTop={insets.top}
        onMenuPress={onMenuPress || (() => setSidebarVisible(true))}
        onNotificationsPress={
          onNotificationsPress ||
          (() => navigation?.navigate?.(AppRoutes.ADMIN_MORE_TAB, { screen: AppRoutes.NOTIFICATIONS }))
        }
        onProfilePress={
          onProfilePress ||
          (() => navigation?.navigate?.(AppRoutes.ADMIN_MORE_TAB, { screen: AppRoutes.MY_PROFILE }))
        }
      />

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 88 },
        ]}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrap}>
          {/* Page Header: Title & Subtitle */}
          <View style={styles.pageHeaderArea}>
            <View style={styles.titleTopRow}>
              <Text style={styles.pageTitle}>Users</Text>
            </View>

            <Text style={styles.pageSubtitle}>
              Manage all mobile app users including members, donation seekers, donors, and general users.
            </Text>
          </View>

          {/* 2x2 Statistics Cards */}
          <UsersStatsCards
            stats={stats}
            selectedStatus={selectedStatus}
            onSelectStatus={handleSelectStatusFromCard}
          />

          {/* Search Bar & Filters Button */}
          <UsersSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            onFilterPress={handleOpenFilterModal}
            activeFilterCount={activeFilterCount}
          />

          {/* User Type Tabs / Filter Chips */}
          <UsersTypeTabs
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            stats={tabStats}
          />

          {/* Active Filters Summary Bar */}
          {activeFilterCount > 0 && (
            <View style={styles.activeFiltersBar}>
              <View style={styles.activeFiltersRow}>
                {selectedStatus !== 'all' && (
                  <TouchableOpacity
                    style={styles.activeFilterPill}
                    onPress={() => {
                      setSelectedStatus('all');
                      setExtraFilters(prev => ({ ...prev, status: 'all' }));
                    }}
                    activeOpacity={0.7}
                    accessibilityLabel="Remove status filter"
                  >
                    <Text style={styles.activeFilterPillText}>
                      {`Status: ${
                        selectedStatus === 'active'
                          ? 'Approved'
                          : selectedStatus === 'pending'
                          ? 'Pending Review'
                          : selectedStatus === 'blocked'
                          ? 'Blocked'
                          : selectedStatus
                      } ✕`}
                    </Text>
                  </TouchableOpacity>
                )}

                {activeTab !== 'all' && (
                  <TouchableOpacity
                    style={styles.activeFilterPill}
                    onPress={() => {
                      setActiveTab('all');
                      setExtraFilters(prev => ({ ...prev, typeTab: 'all' }));
                    }}
                    activeOpacity={0.7}
                    accessibilityLabel="Remove user type filter"
                  >
                    <Text style={styles.activeFilterPillText}>
                      {`Type: ${
                        activeTab === 'admin'
                          ? 'Admins'
                          : activeTab === 'member'
                          ? 'Members'
                          : activeTab === 'seeker'
                          ? 'Donation Seekers'
                          : activeTab === 'donor'
                          ? 'Donors'
                          : activeTab === 'general'
                          ? 'Users'
                          : activeTab
                      } ✕`}
                    </Text>
                  </TouchableOpacity>
                )}

                {searchQuery.trim().length > 0 && (
                  <TouchableOpacity
                    style={styles.activeFilterPill}
                    onPress={() => setSearchQuery('')}
                    activeOpacity={0.7}
                    accessibilityLabel="Clear search query"
                  >
                    <Text style={styles.activeFilterPillText}>
                      {`Search: "${searchQuery.trim()}" ✕`}
                    </Text>
                  </TouchableOpacity>
                )}

                {(extraFilters.joinedFrom || extraFilters.joinedTo) && (
                  <TouchableOpacity
                    style={styles.activeFilterPill}
                    onPress={() =>
                      setExtraFilters(prev => ({
                        ...prev,
                        joinedFrom: undefined,
                        joinedTo: undefined,
                      }))
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.activeFilterPillText}>
                      {`Date: ${extraFilters.joinedFrom || 'Any'} to ${extraFilters.joinedTo || 'Any'} ✕`}
                    </Text>
                  </TouchableOpacity>
                )}

                {extraFilters.sortBy && extraFilters.sortBy !== 'newest' && (
                  <TouchableOpacity
                    style={styles.activeFilterPill}
                    onPress={() =>
                      setExtraFilters(prev => ({
                        ...prev,
                        sortBy: 'newest',
                      }))
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.activeFilterPillText}>
                      {`Sort: ${
                        extraFilters.sortBy === 'oldest'
                          ? 'Oldest First'
                          : extraFilters.sortBy === 'name_asc'
                          ? 'Name (A to Z)'
                          : extraFilters.sortBy === 'name_desc'
                          ? 'Name (Z to A)'
                          : extraFilters.sortBy
                      } ✕`}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handleResetFilters}
                  style={styles.clearAllBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Clear all active filters"
                >
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Users List Cards */}
          <View style={styles.listContainer}>
            {usersList.length > 0 ? (
              usersList.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onPress={
                    onUserPress
                      ? () => onUserPress(user)
                      : () => navigation?.navigate?.(AppRoutes.USER_DETAILS, { userId: user.id })
                  }
                  onEditPress={
                    onEditUserPress
                      ? () => onEditUserPress(user)
                      : () => navigation?.navigate?.(AppRoutes.EDIT_USER, { userId: user.id })
                  }
                  onVerifyPress={
                    onVerifyUserPress
                      ? () => onVerifyUserPress(user)
                      : () => navigation?.navigate?.(AppRoutes.USER_VERIFICATION, { userId: user.id })
                  }
                  onToggleBlockPress={() => handleToggleBlock(user)}
                  onResetPasswordPress={() => setPasswordResetUser(user)}
                  onStatusChange={(targetUser, newStatus) => {
                    usersStore.updateUser(targetUser.id, { status: newStatus });
                  }}
                />
              ))
            ) : allUsers.length === 0 ? (
              <UsersEmptyState
                title="No Registered Users"
                message="No user accounts have been registered yet. Whenever someone registers via the Sign Up flow, their account will automatically appear here."
                onSignUp={onSignUpPress || (() => navigation?.navigate?.(AppRoutes.ADD_USER))}
                onLoadDemo={() => usersStore.seedDevFixtures()}
              />
            ) : (
              <UsersEmptyState
                title="No Users Found"
                message="No users match your active filters or search query."
                onReset={handleResetFilters}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Modal for Block/Unblock */}
      <UserConfirmationModal
        visible={!!confirmModalUser}
        user={confirmModalUser}
        action={confirmAction}
        onConfirm={handleConfirmToggleBlock}
        onCancel={() => {
          setConfirmModalUser(null);
          setConfirmAction(null);
        }}
      />

      {/* Password Reset Modal */}
      <UserPasswordResetModal
        visible={!!passwordResetUser}
        user={passwordResetUser}
        onClose={() => setPasswordResetUser(null)}
      />

      {/* Advanced Filter Modal (Screen 6) */}
      <UserFilterModal
        visible={filterModalVisible}
        currentFilters={{
          typeTab: activeTab,
          status: selectedStatus,
          ...extraFilters,
        }}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilterModal}
        onReset={handleResetFilters}
      />

      {/* Bottom Navigation (Only rendered if standalone or explicitly requested) */}
      {isBottomNavVisible && (
        <View style={styles.bottomNavHost}>
          <UsersBottomNav
            bottomInset={insets.bottom}
            activeKey="users"
            onTabPress={handleBottomTabPress}
          />
        </View>
      )}

      {/* Slide-in Admin Sidebar */}
      <AdminSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onNavigate={handleSidebarNavigate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  contentWrap: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  pageHeaderArea: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  titleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pageTitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 24,
    fontWeight: '700',
    color: '#0B2F52',
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
    lineHeight: 18,
    fontWeight: '400',
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAD465',
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.button,
    gap: 4,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  addUserPlus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#011F39',
    lineHeight: 18,
  },
  addUserText: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#011F39',
  },
  activeFiltersBar: {
    marginVertical: 6,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  activeFilterPill: {
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#DBE5EE',
    minHeight: 32,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterPillText: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#06294D',
  },
  clearAllBtn: {
    minHeight: 32,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllText: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  listContainer: {
    marginTop: 6,
  },
  bottomNavHost: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
