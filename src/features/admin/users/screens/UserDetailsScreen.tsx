import React, { useState, useSyncExternalStore } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../../../../core';
import { usersStore } from '../services/usersStore';
import { UserItem, UserType, UserStatus } from '../types/user.types';
import { UsersHeader } from '../components/UsersHeader';
import { UsersBottomNav } from '../components/UsersBottomNav';
import { UserConfirmationModal } from '../components/UserConfirmationModal';
import { UserPasswordResetModal } from '../components/UserPasswordResetModal';
import { ChevronLeftIcon } from '../../../auth/components/AuthIcons';

interface UserDetailsScreenProps {
  userId?: string;
  onBack?: () => void;
  onEditPress?: (user: UserItem) => void;
  onVerifyPress?: (user: UserItem) => void;
  onBottomTabPress?: (key: string) => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const UserDetailsScreen: React.FC<UserDetailsScreenProps> = ({
  userId,
  onBack,
  onEditPress,
  onVerifyPress,
  onBottomTabPress,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();

  // Subscribe to reactive usersStore updates
  useSyncExternalStore(usersStore.subscribe, usersStore.getSnapshot, usersStore.getSnapshot);

  const user = userId ? usersStore.getUserById(userId) : undefined;

  // Modals state
  const [confirmAction, setConfirmAction] = useState<'block' | 'unblock' | 'delete' | null>(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  if (!user) {
    return (
      <View style={styles.screen}>
        <UsersHeader
          paddingTop={insets.top}
          onMenuPress={onMenuPress}
          onNotificationsPress={onNotificationsPress}
          onProfilePress={onProfilePress}
        />
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>User Not Found</Text>
          <Text style={styles.notFoundMessage}>
            The user record you are trying to view does not exist or has been removed.
          </Text>
          <TouchableOpacity
            style={styles.backLinkBtn}
            onPress={onBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Back to Users list"
          >
            <ChevronLeftIcon size={16} color="#FFFFFF" />
            <Text style={styles.backLinkText}>Return to Users List</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomNavHost}>
          <UsersBottomNav
            bottomInset={insets.bottom}
            activeKey="users"
            onTabPress={onBottomTabPress}
          />
        </View>
      </View>
    );
  }

  // Handle status toggle (Block / Unblock / Delete)
  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction === 'delete') {
      usersStore.deleteUser(user.id);
      setConfirmAction(null);
      if (onBack) onBack();
    } else if (confirmAction === 'block') {
      usersStore.updateStatus(user.id, 'blocked');
      setConfirmAction(null);
    } else if (confirmAction === 'unblock') {
      usersStore.updateStatus(user.id, 'active');
      setConfirmAction(null);
    }
  };

  const isMember = user.userType === 'member';

  const userTypeLabels: Record<UserType, string> = {
    member: 'Member',
    seeker: 'Donation Seeker',
    donor: 'Donor',
    general: 'General User',
  };

  const statusStyles: Record<
    UserStatus,
    { badgeBg: string; text: string; dot: string; label: string }
  > = {
    active: { badgeBg: '#ECFDF5', text: '#059669', dot: '#10B981', label: 'Active' },
    pending: { badgeBg: '#FFFBEB', text: '#D97706', dot: '#F59E0B', label: 'Pending' },
    blocked: { badgeBg: '#FEF2F2', text: '#DC2626', dot: '#EF4444', label: 'Blocked' },
  };

  const typeStyles: Record<UserType, { badgeBg: string; text: string }> = {
    member: { badgeBg: '#EFF6FF', text: '#1D4ED8' },
    seeker: { badgeBg: '#FEF3C7', text: '#B45309' },
    donor: { badgeBg: '#ECFDF5', text: '#047857' },
    general: { badgeBg: '#F1F5F9', text: '#475569' },
  };

  const currentStatusStyle = statusStyles[user.status] || statusStyles.active;
  const currentTypeStyle = typeStyles[user.userType] || typeStyles.general;

  // Format joined date & time
  const formatJoined = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const dateFormatted = d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const timeFormatted = d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        return { date: dateFormatted, time: timeFormatted };
      }
    } catch {
      // fallback
    }
    if (dateStr.includes('T')) {
      return { date: dateStr.split('T')[0], time: '' };
    }
    return { date: dateStr, time: '' };
  };

  const joinedInfo = formatJoined(user.joinedDate);

  // Format last login
  const formatLastLogin = (loginStr?: string) => {
    if (!loginStr) return { date: 'Active recently', time: '' };
    if (loginStr.includes(',')) {
      const parts = loginStr.split(',');
      return { date: parts[0].trim(), time: parts[1]?.trim() || '' };
    }
    return { date: loginStr, time: '' };
  };

  const loginInfo = formatLastLogin(user.lastLogin);

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <UsersHeader
        paddingTop={insets.top}
        onMenuPress={onMenuPress}
        onNotificationsPress={onNotificationsPress}
        onProfilePress={onProfilePress}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* Sub-header Bar: Back Link on left + Top Edit Button on right */}
          <View style={styles.subHeaderRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back to Users list"
            >
              <ChevronLeftIcon size={18} color="#0F2860" />
              <Text style={styles.backButtonText}>Back to Users</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topEditBtn}
              onPress={() => onEditPress?.(user)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Edit User"
            >
              <Text style={styles.topEditBtnIcon}>✎</Text>
              <Text style={styles.topEditBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* User Profile Header (Uncarded / Clean Layout per Reference Image) */}
          <View style={styles.profileHeaderBlock}>
            {/* Avatar Circle / Photo */}
            <View style={styles.avatarWrap}>
              {user.avatarUrl && !avatarError ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={styles.avatarImage}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <View style={styles.avatarInitialsCircle}>
                  <Text style={styles.avatarInitialsText}>{initials || 'U'}</Text>
                </View>
              )}
            </View>

            {/* Profile Info Right Column */}
            <View style={styles.profileHeaderInfo}>
              <Text style={styles.profileHeaderName}>{user.name}</Text>
              <Text style={styles.profileHeaderMeta}>{user.email}</Text>
              <Text style={styles.profileHeaderMeta}>{user.phone}</Text>

              {/* Badges Pill Row */}
              <View style={styles.badgesRow}>
                <View
                  style={[
                    styles.typePill,
                    { backgroundColor: currentTypeStyle.badgeBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      { color: currentTypeStyle.text },
                    ]}
                  >
                    {userTypeLabels[user.userType]}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: currentStatusStyle.badgeBg },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: currentStatusStyle.dot },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: currentStatusStyle.text },
                    ]}
                  >
                    {currentStatusStyle.label}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 2x2 Metric Cards Grid (Matching Exact Reference Layout) */}
          <View style={styles.metricsGrid}>
            {/* Card 1: Member ID or User ID */}
            <View style={styles.metricCard}>
              <View style={styles.metricIconCircle}>
                <Text style={styles.metricIcon}>🪪</Text>
              </View>
              <View style={styles.metricTextWrap}>
                <Text style={styles.metricLabel}>
                  {isMember && user.memberId ? 'Member ID' : 'User ID'}
                </Text>
                <Text style={styles.metricValue} numberOfLines={1}>
                  {isMember && user.memberId ? user.memberId : `#${user.id}`}
                </Text>
              </View>
            </View>

            {/* Card 2: Joined On */}
            <View style={styles.metricCard}>
              <View style={styles.metricIconCircle}>
                <Text style={styles.metricIcon}>⏰</Text>
              </View>
              <View style={styles.metricTextWrap}>
                <Text style={styles.metricLabel}>Joined On</Text>
                <Text style={styles.metricValue} numberOfLines={1}>
                  {joinedInfo.date}
                </Text>
                {joinedInfo.time ? (
                  <Text style={styles.metricSubValue}>{joinedInfo.time}</Text>
                ) : null}
              </View>
            </View>

            {/* Card 3: Last Login */}
            <View style={styles.metricCard}>
              <View style={styles.metricIconCircle}>
                <Text style={styles.metricIcon}>🕐</Text>
              </View>
              <View style={styles.metricTextWrap}>
                <Text style={styles.metricLabel}>Last Login</Text>
                <Text style={styles.metricValue} numberOfLines={1}>
                  {loginInfo.date}
                </Text>
                {loginInfo.time ? (
                  <Text style={styles.metricSubValue}>{loginInfo.time}</Text>
                ) : null}
              </View>
            </View>

            {/* Card 4: Total Donations / Contribution */}
            <View style={styles.metricCard}>
              <View style={styles.metricIconCircle}>
                <Text style={styles.metricIcon}>💳</Text>
              </View>
              <View style={styles.metricTextWrap}>
                <Text style={styles.metricLabel}>Total Donations</Text>
                <Text style={styles.metricValue} numberOfLines={1}>
                  {`₹ ${(user.totalDonations ?? 0).toLocaleString('en-IN')}`}
                </Text>
                <Text style={styles.metricSubValue}>
                  {`(${user.donationCount ?? 0} donations)`}
                </Text>
              </View>
            </View>
          </View>

          {/* Unified Information Table Card (Exact Table Rows from Reference Image) */}
          <View style={styles.infoTableCard}>
            {/* Row 1: Full Name */}
            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <Text style={styles.tableRowIcon}>👤</Text>
                <Text style={styles.tableRowLabel}>Full Name</Text>
              </View>
              <Text style={styles.tableRowValue}>{user.name}</Text>
            </View>
            <View style={styles.tableDivider} />

            {/* Row 2: Email Address */}
            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <Text style={styles.tableRowIcon}>✉️</Text>
                <Text style={styles.tableRowLabel}>Email Address</Text>
              </View>
              <Text style={styles.tableRowValue}>{user.email}</Text>
            </View>
            <View style={styles.tableDivider} />

            {/* Row 3: Phone Number */}
            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <Text style={styles.tableRowIcon}>📞</Text>
                <Text style={styles.tableRowLabel}>Phone Number</Text>
              </View>
              <Text style={styles.tableRowValue}>{user.phone}</Text>
            </View>
            <View style={styles.tableDivider} />

            {/* Row 4: User Type */}
            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <Text style={styles.tableRowIcon}>👤</Text>
                <Text style={styles.tableRowLabel}>User Type</Text>
              </View>
              <Text style={styles.tableRowValue}>
                {userTypeLabels[user.userType]}
              </Text>
            </View>
            <View style={styles.tableDivider} />

            {/* Row 5: Date of Birth */}
            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <Text style={styles.tableRowIcon}>📅</Text>
                <Text style={styles.tableRowLabel}>Date of Birth</Text>
              </View>
              <Text style={styles.tableRowValue}>
                {user.dob || 'Not provided'}
              </Text>
            </View>
            <View style={styles.tableDivider} />

            {/* Row 6: Gender */}
            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <Text style={styles.tableRowIcon}>👤</Text>
                <Text style={styles.tableRowLabel}>Gender</Text>
              </View>
              <Text style={styles.tableRowValue}>
                {user.gender || 'Not specified'}
              </Text>
            </View>
            <View style={styles.tableDivider} />

            {/* Row 7: Address */}
            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <Text style={styles.tableRowIcon}>📍</Text>
                <Text style={styles.tableRowLabel}>Address</Text>
              </View>
              <Text style={styles.tableRowValue} numberOfLines={2}>
                {user.address || 'Not provided'}
              </Text>
            </View>
            <View style={styles.tableDivider} />

            {/* Row 8: Status */}
            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <Text style={styles.tableRowIcon}>🌐</Text>
                <Text style={styles.tableRowLabel}>Status</Text>
              </View>
              <View
                style={[
                  styles.statusPillSmall,
                  { backgroundColor: currentStatusStyle.badgeBg },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: currentStatusStyle.dot },
                  ]}
                />
                <Text
                  style={[
                    styles.statusPillSmallText,
                    { color: currentStatusStyle.text },
                  ]}
                >
                  {currentStatusStyle.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons (Matching Reference Image) */}
          <View style={styles.actionsContainer}>
            {/* Row of Block User & Reset Password */}
            <View style={styles.actionTwoButtonsRow}>
              {/* Block User Button */}
              <TouchableOpacity
                style={[
                  styles.blockUserBtn,
                  user.status === 'blocked' && styles.unblockUserBtn,
                ]}
                onPress={() =>
                  setConfirmAction(user.status === 'blocked' ? 'unblock' : 'block')
                }
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={
                  user.status === 'blocked' ? 'Unblock User' : 'Block User'
                }
              >
                <Text style={styles.blockBtnIcon}>
                  {user.status === 'blocked' ? '🔓' : '🚫'}
                </Text>
                <Text
                  style={[
                    styles.blockBtnText,
                    user.status === 'blocked' && styles.unblockBtnText,
                  ]}
                >
                  {user.status === 'blocked' ? 'Unblock User' : 'Block User'}
                </Text>
              </TouchableOpacity>

              {/* Reset Password Button */}
              <TouchableOpacity
                style={styles.resetPasswordBtn}
                onPress={() => setShowPasswordResetModal(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Reset Password"
              >
                <Text style={styles.resetBtnIcon}>👤</Text>
                <Text style={styles.resetBtnText}>Reset Password</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Full-Width "Edit User" Button */}
            <TouchableOpacity
              style={styles.bottomEditUserBtn}
              onPress={() => onEditPress?.(user)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Edit User Full Button"
            >
              <Text style={styles.bottomEditBtnIcon}>✎</Text>
              <Text style={styles.bottomEditBtnText}>Edit User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Modal for Block / Unblock / Delete */}
      <UserConfirmationModal
        visible={confirmAction !== null}
        user={user}
        action={confirmAction}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Password Reset Modal */}
      <UserPasswordResetModal
        visible={showPasswordResetModal}
        user={user}
        onClose={() => setShowPasswordResetModal(false)}
      />

      {/* Persistent Bottom Nav */}
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
    paddingTop: Spacing.sm,
  },
  contentWrap: {
    paddingHorizontal: Spacing.base,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },

  /* Sub Header Row */
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
    paddingVertical: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
  },
  topEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2860',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  topEditBtnIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  topEditBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Profile Header Block */
  profileHeaderBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarWrap: {
    marginRight: Spacing.base,
  },
  avatarImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#E2E8F0',
  },
  avatarInitialsCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileHeaderName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  profileHeaderMeta: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* 2x2 Metrics Grid */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  metricIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  metricIcon: {
    fontSize: 18,
  },
  metricTextWrap: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2860',
  },
  metricSubValue: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },

  /* Unified Table Card */
  infoTableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Spacing.lg,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  tableRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableRowIcon: {
    fontSize: 15,
  },
  tableRowLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  tableRowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 8,
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  statusPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusPillSmallText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Action Buttons */
  actionsContainer: {
    marginBottom: Spacing.lg,
  },
  actionTwoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  blockUserBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    height: 46,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  unblockUserBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  blockBtnIcon: {
    fontSize: 15,
  },
  blockBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  unblockBtnText: {
    color: '#059669',
  },
  resetPasswordBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    height: 46,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  resetBtnIcon: {
    fontSize: 15,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  bottomEditUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2860',
    height: 50,
    borderRadius: BorderRadius.lg,
    gap: 6,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomEditBtnIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomEditBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Not Found Screen */
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: Spacing.sm,
  },
  notFoundMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  backLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2860',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  backLinkText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomNavHost: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
