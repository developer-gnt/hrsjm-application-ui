import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppRoutes } from '../../core/constants/routes';
import { AuthLogo } from '../../features/auth/components/AuthLogo';
import { Typography } from '../../core/theme/typography';
import { useAuthStore } from '../../features/auth/store/authStore';
import {
  DEFAULT_ADMIN_AVATAR,
  UserProfileModal,
} from '../../features/auth/components/UserProfileModal';
import { AdminSidebar } from './AdminSidebar';

/**
 * ============================================================================
 * ADMIN HEADER
 * ============================================================================
 *
 * This is the unified top navigation header for all screens in the HRSJM Admin app.
 *
 * FEATURES:
 * 1. Left button:
 *    - Default: Hamburger menu button (☰) that smoothly opens the AdminSidebar.
 *    - If `showBack` or `onBack` is provided: Back arrow (←) that calls `onBack()`.
 * 2. Center:
 *    - Default: Official HRSJM brand logo (Golden shield + HRSJM).
 *    - If `title` is provided: Displays page title text cleanly.
 * 3. Right side:
 *    - Notification bell with unread badge.
 *    - Admin profile avatar with dropdown chevron.
 * 4. Dropdown menu:
 *    - "View Profile": Opens the full user details modal.
 *    - "Sign Out": Signs the user out safely and navigates to login.
 */

export interface AdminHeaderProps {
  /** Optional custom title (e.g. for detail screens). If omitted, displays official brand logo. */
  title?: string;
  /** Whether to show back button instead of hamburger menu. */
  showBack?: boolean;
  /** Callback when user taps back button. */
  onBack?: () => void;
  /** Number of unread notifications to show on bell badge. Defaults to 3. */
  unreadCount?: number;
  /** Navigation helper for older tab navigator hooks. */
  onOpenMore?: () => void;
  /** Callback when user selects an item in the slide-in sidebar. */
  onNavigate?: (target: string) => void;
  /** Optional custom right action element (e.g. button or custom control). */
  rightAction?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  unreadCount = 3,
  onOpenMore,
  onNavigate,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);
  const navigation = useNavigation<any>();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const handleSignOut = async () => {
    setDropdownVisible(false);
    try {
      await signOut();
    } catch {
      // Session local cleanup already handled in authStore
    }
  };

  const handleOpenNotifications = () => {
    if (onNavigate) {
      onNavigate(AppRoutes.NOTIFICATIONS);
    } else if (navigation?.navigate) {
      try {
        navigation.navigate(AppRoutes.ADMIN_MORE_TAB, { screen: AppRoutes.NOTIFICATIONS });
      } catch {
        try {
          navigation.navigate(AppRoutes.NOTIFICATIONS);
        } catch {
          // ignore
        }
      }
    } else if (onOpenMore) {
      onOpenMore();
    }
  };

  const handleViewProfile = () => {
    setDropdownVisible(false);
    if (onNavigate) {
      onNavigate(AppRoutes.MY_PROFILE);
    } else if (navigation?.navigate) {
      try {
        navigation.navigate(AppRoutes.ADMIN_MORE_TAB, { screen: AppRoutes.MY_PROFILE });
      } catch {
        navigation.navigate(AppRoutes.MY_PROFILE);
      }
    } else {
      setProfileModalVisible(true);
    }
  };

  const TAB_TARGET_MAP: Record<string, string> = {
    SupportTickets: AppRoutes.ADMIN_COMPLAINTS_TAB,
    AssistanceRequests: AppRoutes.ADMIN_APPLICATIONS_TAB,
    Complaints: AppRoutes.ADMIN_COMPLAINTS_TAB,
    Members: AppRoutes.ADMIN_MEMBERS_TAB,
    Applications: AppRoutes.ADMIN_APPLICATIONS_TAB,
    Dashboard: AppRoutes.ADMIN_DASHBOARD_TAB,
    AdminDashboardTab: AppRoutes.ADMIN_DASHBOARD_TAB,
    AdminMembersTab: AppRoutes.ADMIN_MEMBERS_TAB,
    AdminApplicationsTab: AppRoutes.ADMIN_APPLICATIONS_TAB,
    AdminComplaintsTab: AppRoutes.ADMIN_COMPLAINTS_TAB,
    AdminMoreTab: AppRoutes.ADMIN_MORE_TAB,
    ProfileSettings: AppRoutes.SETTINGS,
  };

  const TAB_ROUTE_SET = new Set([
    AppRoutes.ADMIN_DASHBOARD_TAB,
    AppRoutes.ADMIN_MEMBERS_TAB,
    AppRoutes.ADMIN_APPLICATIONS_TAB,
    AppRoutes.ADMIN_COMPLAINTS_TAB,
    AppRoutes.ADMIN_MORE_TAB,
  ]);

  const handleOpenFullProfile = () => {
    setProfileModalVisible(false);
    if (onNavigate) {
      onNavigate(AppRoutes.MY_PROFILE);
    } else if (navigation?.navigate) {
      try {
        navigation.navigate(AppRoutes.ADMIN_MORE_TAB, { screen: AppRoutes.MY_PROFILE });
      } catch {
        try {
          navigation.navigate(AppRoutes.MY_PROFILE);
        } catch {
          // ignore
        }
      }
    }
  };

  const handleDrawerNavigate = (rawTarget: string) => {
    const target = TAB_TARGET_MAP[rawTarget] || rawTarget;

    if (onNavigate) {
      onNavigate(target);
      return;
    }

    if (navigation?.navigate) {
      if (TAB_ROUTE_SET.has(target as any)) {
        try {
          navigation.navigate(target);
        } catch {
          // ignore
        }
      } else {
        try {
          navigation.navigate(AppRoutes.ADMIN_MORE_TAB, { screen: target });
        } catch {
          try {
            navigation.navigate(target);
          } catch {
            // ignore
          }
        }
      }
    } else if (onOpenMore) {
      onOpenMore();
    }
  };

  const isBackMode = Boolean(showBack || onBack);

  return (
    <>
      <View
        style={[
          styles.band,
          {
            paddingTop:
              Platform.OS === 'ios'
                ? Math.max(insets.top, 12)
                : (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 14),
          },
        ]}
      >
        <StatusBar barStyle="dark-content" />

        {/* Left Action: Back Arrow OR Hamburger Menu */}
        {isBackMode ? (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDrawerVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Open side navigation menu"
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        )}

        {/* Center: Title OR Official HRSJM Logo */}
        <View style={styles.centerWrap}>
          {title ? (
            <Text style={styles.centerTitle} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            <AuthLogo
              size="sm"
              layout="horizontal"
              variant="dark"
              showSubtitle={false}
            />
          )}
        </View>

        {/* Right Controls: Custom Right Action + Notifications & Profile */}
        <View style={styles.rightRow}>
          {rightAction ? (
            <View style={styles.customRightAction}>{rightAction}</View>
          ) : null}

          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.bellWrap}
            onPress={handleOpenNotifications}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Notifications, ${unreadCount} unread`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
                stroke="#1E293B"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* Profile Avatar + Dropdown Chevron */}
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => setDropdownVisible(true)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: user?.avatar || DEFAULT_ADMIN_AVATAR }}
              style={styles.avatarImage}
            />
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Slide-in Side Drawer Menu */}
      <AdminSidebar
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onNavigate={handleDrawerNavigate}
      />

      {/* Profile Dropdown Menu */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View
            style={[
              styles.dropdownMenu,
              {
                top:
                  Platform.OS === 'ios'
                    ? Math.max(insets.top, 12) + 48
                    : (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 14) + 48,
              },
            ]}
          >
            {/* Header info */}
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownName} numberOfLines={1}>
                {user?.full_name || 'Admin User'}
              </Text>
              <Text style={styles.dropdownEmail} numberOfLines={1}>
                {user?.email || 'admin@hrsjm.org'}
              </Text>
            </View>

            <View style={styles.dropdownDivider} />

            {/* View Profile Option */}
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleViewProfile}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownItemIcon}>👤</Text>
              <Text style={styles.dropdownItemText}>View Profile</Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            {/* Sign Out Option */}
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownItemIcon}>🚪</Text>
              <Text style={[styles.dropdownItemText, styles.signOutText]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Full User Profile Modal */}
      <UserProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onSignOut={handleSignOut}
        onViewFullProfile={handleOpenFullProfile}
      />
    </>
  );
};

// Also export as DashboardHeader for backwards compatibility
export const DashboardHeader = AdminHeader;

const styles = StyleSheet.create({
  band: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  menuButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  menuIcon: {
    fontSize: 22,
    color: '#1E293B',
    fontWeight: '700',
    lineHeight: 24,
  },
  backIcon: {
    fontSize: 22,
    color: '#1E293B',
    fontWeight: '700',
    lineHeight: 24,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  centerTitle: {
    ...Typography.screenTitle,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customRightAction: {
    marginRight: 2,
  },
  bellWrap: {
    position: 'relative',
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
  avatarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  avatarImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  chevron: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  dropdownMenu: {
    position: 'absolute',
    right: 16,
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dropdownName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  signOutText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});
