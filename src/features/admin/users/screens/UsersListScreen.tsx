import React, { useState, useSyncExternalStore } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../../../../core';
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
}) => {
  const insets = useSafeAreaInsets();

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

  const usersList = usersStore.getUsers({
    typeTab: activeTab,
    status: selectedStatus,
    searchQuery,
    joinedFrom: extraFilters.joinedFrom,
    joinedTo: extraFilters.joinedTo,
    sortBy: extraFilters.sortBy,
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

  const handleConfirmToggleBlock = () => {
    if (confirmModalUser && confirmAction) {
      const nextStatus: UserStatus = confirmAction === 'block' ? 'blocked' : 'active';
      usersStore.updateStatus(confirmModalUser.id, nextStatus);
    }
    setConfirmModalUser(null);
    setConfirmAction(null);
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
  if (extraFilters.joinedFrom || extraFilters.joinedTo) activeFilterCount++;
  if (extraFilters.sortBy && extraFilters.sortBy !== 'newest') activeFilterCount++;

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <UsersHeader
        paddingTop={insets.top}
        onMenuPress={onMenuPress}
        onNotificationsPress={onNotificationsPress}
        onProfilePress={onProfilePress}
      />

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 84 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* Title Row: Title, Subtitle & "+ Add User" Button */}
          <View style={styles.titleRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.pageTitle}>Users</Text>
              <Text style={styles.pageSubtitle}>
                Manage all mobile app users including members, donation seekers, donors, and general users.
              </Text>
            </View>

            <View style={styles.headerButtonsCol}>
              <TouchableOpacity
                style={styles.addUserButton}
                onPress={onAddUserPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Add New User"
              >
                <Text style={styles.addUserPlus}>+</Text>
                <Text style={styles.addUserText}>Add User</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={onSignUpPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Sign Up New User"
              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
            stats={stats}
          />

          {/* Active Filters Summary Bar */}
          {activeFilterCount > 0 && (
            <View style={styles.activeFiltersBar}>
              <View style={styles.activeFiltersRow}>
                {selectedStatus !== 'all' && (
                  <TouchableOpacity
                    style={styles.activeFilterPill}
                    onPress={() => setSelectedStatus('all')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.activeFilterPillText}>
                      {`Status: ${selectedStatus.toUpperCase()} ✕`}
                    </Text>
                  </TouchableOpacity>
                )}

                {activeTab !== 'all' && (
                  <TouchableOpacity
                    style={styles.activeFilterPill}
                    onPress={() => setActiveTab('all')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.activeFilterPillText}>
                      {`Type: ${activeTab.toUpperCase()} ✕`}
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
                      {`Sort: ${extraFilters.sortBy} ✕`}
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
                  onPress={onUserPress ? () => onUserPress(user) : () => {}}
                  onEditPress={onEditUserPress ? () => onEditUserPress(user) : () => {}}
                  onVerifyPress={onVerifyUserPress ? () => onVerifyUserPress(user) : () => {}}
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
                onSignUp={onSignUpPress}
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

      {/* Bottom Navigation with Users highlighted */}
      <View style={styles.bottomNavHost}>
        <UsersBottomNav
          bottomInset={insets.bottom}
          activeKey="users"
          onTabPress={onBottomTabPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: Spacing.xs,
    gap: 12,
  },
  titleColumn: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
    fontWeight: '500',
  },
  headerButtonsCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  addUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2860',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    gap: 4,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 2,
  },
  addUserPlus: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  addUserText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    width: '100%',
  },
  signUpButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  activeFiltersBar: {
    marginVertical: 6,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  activeFilterPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
  },
  activeFilterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
  },
  clearAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
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
