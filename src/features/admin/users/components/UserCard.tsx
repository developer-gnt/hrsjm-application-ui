import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Platform,
} from 'react-native';
import { BorderRadius, FontFamilies, Spacing } from '../../../../core';
import { UserItem, UserType, UserStatus } from '../types/user.types';
import {
  MailOutlineIcon,
  PhoneOutlineIcon,
  CalendarOutlineIcon,
  UserOutlineIcon,
  UsersGroupIcon,
} from '../../../auth/components/AuthIcons';

interface UserCardProps {
  user: UserItem;
  onPress: (user: UserItem) => void;
  onEditPress?: (user: UserItem) => void;
  onVerifyPress?: (user: UserItem) => void;
  onToggleBlockPress?: (user: UserItem) => void;
  onResetPasswordPress?: (user: UserItem) => void;
  onStatusChange?: (user: UserItem, newStatus: UserStatus) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onPress,
  onEditPress,
  onVerifyPress,
  onToggleBlockPress,
  onResetPasswordPress,
  onStatusChange,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string): string => {
    return (name || 'U')
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const formatJoinedDateParts = (dateStr?: string) => {
    if (!dateStr) return { label: 'Joined', date: 'Recently' };
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' });
        const year = d.getFullYear();
        return { label: 'Joined', date: `${day} ${month} ${year}` };
      }
    } catch {}
    if (dateStr.includes('Joined')) {
      return { label: 'Joined', date: dateStr.replace('Joined', '').trim() };
    }
    return { label: 'Joined', date: dateStr };
  };

  const getAvatarTheme = (type: UserType) => {
    switch (type) {
      case 'admin':
        return { bg: '#EDF2F7', text: '#06294D' };
      case 'member':
        return { bg: '#EDF2F7', text: '#06294D' };
      case 'seeker':
        return { bg: '#FFF9E6', text: '#C9971A' };
      case 'donor':
        return { bg: '#EDF2F7', text: '#174A78' };
      case 'general':
      default:
        return { bg: '#EDF2F7', text: '#34516D' };
    }
  };

  const getTypeBadge = (type: UserType) => {
    switch (type) {
      case 'admin':
        return {
          label: 'Admin',
          bg: '#EDF2F7',
          text: '#06294D',
          isGroup: false,
        };
      case 'member':
        return {
          label: 'Member',
          bg: '#EDF2F7',
          text: '#06294D',
          isGroup: true,
        };
      case 'seeker':
        return {
          label: 'Donation Seeker',
          bg: '#FFF9E6',
          text: '#C9971A',
          isGroup: true,
        };
      case 'donor':
        return {
          label: 'Donor',
          bg: '#EDF2F7',
          text: '#174A78',
          isGroup: false,
        };
      case 'general':
      default:
        return {
          label: 'User',
          bg: '#EDF2F7',
          text: '#34516D',
          isGroup: false,
        };
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          bg: '#EAF7EE',
          text: '#15803D',
          dot: '#16A34A',
        };
      case 'pending':
        return {
          label: 'Pending',
          bg: '#FFF9E6',
          text: '#8F6600',
          dot: '#D97706',
        };
      case 'blocked':
        return {
          label: 'Blocked',
          bg: '#FDEEEF',
          text: '#DC2626',
          dot: '#DC2626',
        };
    }
  };

  const typeConfig = getTypeBadge(user.userType);
  const statusConfig = getStatusBadge(user.status);
  const avatarTheme = getAvatarTheme(user.userType);
  const joinedInfo = formatJoinedDateParts(user.joinedDate);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress(user)}
      accessibilityRole="button"
      accessibilityLabel={`User ${user.name}, ${typeConfig.label}, ${statusConfig.label}`}
    >
      {/* 1. Left: Avatar */}
      <View style={styles.avatarWrap}>
        {user.avatarUrl && !imageError ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.avatarImg}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: avatarTheme.bg }]}>
            <Text style={[styles.avatarFallbackText, { color: avatarTheme.text }]}>
              {getInitials(user.name)}
            </Text>
          </View>
        )}
      </View>

      {/* 2. Middle: Name, Email with Icon, Phone with Icon, Role Badge */}
      <View style={styles.infoCol}>
        <Text style={styles.userName} numberOfLines={1}>
          {user.name}
        </Text>

        <View style={styles.metaRow}>
          <MailOutlineIcon size={13} color="#64748B" />
          <Text style={styles.metaText} numberOfLines={1}>
            {user.email}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <PhoneOutlineIcon size={13} color="#64748B" />
          <Text style={styles.metaText} numberOfLines={1}>
            {user.phone}
          </Text>
        </View>

        {/* Role Badge & Application Number */}
        <View style={styles.badgeAndRefRow}>
          <View style={[styles.roleBadge, { backgroundColor: typeConfig.bg }]}>
            <View style={styles.roleBadgeIconWrap}>
              {typeConfig.isGroup ? (
                <UsersGroupIcon size={12} color={typeConfig.text} />
              ) : (
                <UserOutlineIcon size={12} color={typeConfig.text} />
              )}
            </View>
            <Text style={[styles.roleBadgeText, { color: typeConfig.text }]}>
              {typeConfig.label}
            </Text>
          </View>

          {user.applicationNumber ? (
            <View style={styles.appNumberPill}>
              <Text style={styles.appNumberPillText}>{user.applicationNumber}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* 3. Right: Status Dropdown & 3-dots on top, Calendar & Joined Date on bottom */}
      <View style={styles.rightCol}>
        {/* Top: Status dropdown pill + 3-dots menu button */}
        <View style={styles.topActionRow}>
          <TouchableOpacity
            style={[styles.statusDropdownBtn, { backgroundColor: statusConfig.bg }]}
            onPress={() => setStatusMenuVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Change status for ${user.name}`}
          >
            <View style={[styles.statusDot, { backgroundColor: statusConfig.dot }]} />
            <Text style={[styles.statusText, { color: statusConfig.text }]}>
              {statusConfig.label}
            </Text>
            <Text style={[styles.statusChevron, { color: statusConfig.text }]}>
              ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.overflowBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => setMenuVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`More options for ${user.name}`}
          >
            <Text style={styles.overflowDots}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom: Calendar icon + Joined text stack matching Reference Image 1 */}
        <View style={styles.joinedDateRow}>
          <CalendarOutlineIcon size={15} color="#64748B" />
          <View style={styles.joinedTextCol}>
            <Text style={styles.joinedLabel}>{joinedInfo.label}</Text>
            <Text style={styles.joinedDateValue}>{joinedInfo.date}</Text>
          </View>
        </View>
      </View>

      {/* Quick Status Switcher Modal */}
      <Modal
        visible={statusMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setStatusMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.statusSheet}>
                <Text style={styles.statusSheetTitle}>Update Status</Text>
                {(['active', 'pending', 'blocked'] as UserStatus[]).map(st => {
                  const cfg = getStatusBadge(st);
                  const isCur = user.status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[styles.statusSheetItem, isCur && styles.statusSheetItemActive]}
                      onPress={() => {
                        setStatusMenuVisible(false);
                        onStatusChange?.(user, st);
                      }}
                    >
                      <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
                      <Text
                        style={[
                          styles.statusSheetItemText,
                          isCur && { fontWeight: '700', color: cfg.text },
                        ]}
                      >
                        {cfg.label}
                      </Text>
                      {isCur && <Text style={{ color: cfg.text, fontWeight: '700' }}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Overflow Context Actions Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuSheet}>
                <View style={styles.menuHeader}>
                  <Text style={styles.menuTitle} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={styles.menuSubtitle}>{typeConfig.label}</Text>
                </View>

                {/* View Details */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onPress(user);
                  }}
                >
                  <Text style={styles.menuItemIcon}>👤</Text>
                  <Text style={styles.menuItemText}>View Details</Text>
                </TouchableOpacity>

                {/* Edit User */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onEditPress?.(user);
                  }}
                >
                  <Text style={styles.menuItemIcon}>✏️</Text>
                  <Text style={styles.menuItemText}>Edit User</Text>
                </TouchableOpacity>

                {/* Verify User if pending */}
                {user.status === 'pending' && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuVisible(false);
                      onVerifyPress?.(user);
                    }}
                  >
                    <Text style={styles.menuItemIcon}>🛡️</Text>
                    <Text style={[styles.menuItemText, { color: '#D97706' }]}>
                      Review Verification
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Reset Password */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onResetPasswordPress?.(user);
                  }}
                >
                  <Text style={styles.menuItemIcon}>🔑</Text>
                  <Text style={styles.menuItemText}>Reset Password</Text>
                </TouchableOpacity>

                {/* Block / Unblock User */}
                <TouchableOpacity
                  style={[styles.menuItem, styles.destructiveMenuItem]}
                  onPress={() => {
                    setMenuVisible(false);
                    onToggleBlockPress?.(user);
                  }}
                >
                  <Text style={styles.menuItemIcon}>
                    {user.status === 'blocked' ? '🔓' : '🚫'}
                  </Text>
                  <Text
                    style={[
                      styles.menuItemText,
                      user.status === 'blocked'
                        ? { color: '#16A34A' }
                        : { color: '#EF4444' },
                    ]}
                  >
                    {user.status === 'blocked' ? 'Unblock User' : 'Block User'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuCancelBtn}
                  onPress={() => setMenuVisible(false)}
                >
                  <Text style={styles.menuCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  // 1. Avatar
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // 2. Info column
  infoCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
    justifyContent: 'center',
  },
  userName: {
    fontFamily: FontFamilies.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metaText: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    color: '#718096',
    marginLeft: 5,
    fontWeight: '400',
    flexShrink: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  roleBadgeIconWrap: {
    marginRight: 4,
  },
  roleBadgeText: {
    fontFamily: FontFamilies.sans,
    fontSize: 11.5,
    fontWeight: '600',
  },
  // 3. Right column
  rightCol: {
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minWidth: 104,
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minHeight: 32,
  },
  statusDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.25,
    marginRight: 5,
  },
  statusText: {
    fontFamily: FontFamilies.sans,
    fontSize: 11.5,
    fontWeight: '700',
  },
  statusChevron: {
    fontSize: 9,
    marginLeft: 4,
    fontWeight: '700',
  },
  overflowBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowDots: {
    fontSize: 18,
    fontWeight: '800',
    color: '#06294D',
    lineHeight: 18,
  },
  joinedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  joinedTextCol: {
    marginLeft: 5,
  },
  joinedLabel: {
    fontFamily: FontFamilies.sans,
    fontSize: 10,
    color: '#718096',
    fontWeight: '500',
    lineHeight: 12,
  },
  joinedDateValue: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    color: '#0B2F52',
    fontWeight: '600',
    lineHeight: 14,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 31, 57, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  statusSheet: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  statusSheetTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 15,
    fontWeight: '700',
    color: '#06294D',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  statusSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusSheetItemActive: {
    backgroundColor: '#EDF2F7',
  },
  statusSheetItemText: {
    flex: 1,
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#0B2F52',
    marginLeft: 8,
  },
  menuSheet: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  menuHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#DBE5EE',
    paddingBottom: 10,
    marginBottom: 8,
  },
  menuTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#06294D',
  },
  menuSubtitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    gap: 10,
  },
  destructiveMenuItem: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#DBE5EE',
    paddingTop: 12,
  },
  menuItemIcon: {
    fontSize: 16,
  },
  menuItemText: {
    fontFamily: FontFamilies.sans,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0B2F52',
  },
  menuCancelBtn: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: '#DBE5EE',
  },
  menuCancelText: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
  badgeAndRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  appNumberPill: {
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#DBE5EE',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  appNumberPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#06294D',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
});
