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
import { useDynamicUnreadCount } from '../../features/admin/notifications/store/notificationsStore';

/**
 * ============================================================================
 * ADMIN HEADER
 * ============================================================================
 *
 * This is the unified top navigation header for all screens in the HRSJM Admin app.
 *
 * FEATURES:
 * 1. Left button:
 *    - Default: Hamburger menu button that smoothly opens the AdminSidebar.
 *    - If `showBack` or `onBack` is provided: Back arrow (â†) that calls `onBack()`.
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
  /** Whether to show hamburger menu when showBack is false. Defaults to true. If false, no left icon is shown. */
  showMenu?: boolean;
  /** Alignment of brand logo when title is omitted. Defaults to 'center' (or 'left' when showMenu=false). */
  alignLogo?: 'left' | 'center';
  /** Callback when user taps back button. */
  onBack?: () => void;
  /** Number of unread notifications to show on bell badge. Defaults to 0. */
  unreadCount?: number;
  /** Navigation helper for older tab navigator hooks. */
  onOpenMore?: () => void;
  /** Callback when user selects an item in the slide-in sidebar. */
  onNavigate?: (target: string) => void;
  /** Optional callback when user taps the notification bell. */
  onPressNotifications?: () => void;
  /** Optional callback when user taps the profile avatar. */
  onPressProfile?: () => void;
  /** Whether to hide the notification bell icon (e.g. on the Notifications screen itself). */
  hideNotifications?: boolean;
  /** Optional custom right action element (e.g. button or custom control). */
  rightAction?: React.ReactNode;
  /** Whether to show the Donate / Donate Now button. Defaults to true for members / non-admins or when explicitly set. */
  showDonate?: boolean;
  /** Custom label for donate button. Defaults to 'Donate Now'. */
  donateLabel?: string;
  /** Callback when Donate button is pressed. */
  onPressDonate?: () => void;
  /** Whether this header is rendered as MemberHeader (resizes donate button to compact & provides clean gap from logo). */
  isMemberHeader?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  showBack = false,
  showMenu = true,
  alignLogo,
  onBack,
  unreadCount: propUnreadCount,
  onOpenMore,
  onNavigate,
  onPressNotifications,
  onPressProfile,
  hideNotifications = false,
  rightAction,
  showDonate,
  donateLabel = 'Donate Now',
  onPressDonate,
  isMemberHeader = false,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);
  const navigation = useNavigation<any>();
  const dynamicUnreadCount = useDynamicUnreadCount();
  const unreadCount = propUnreadCount !== undefined ? propUnreadCount : dynamicUnreadCount;

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

  const isAdmin = user?.roles?.some(r => r.name === 'ADMIN' || r.name === 'SUPER_ADMIN') ?? false;
  const isMember = Boolean(isMemberHeader || !isAdmin);
  const shouldShowDonate = Boolean(showDonate === true);

  const handleDonatePress = () => {
    if (onPressDonate) {
      onPressDonate();
      return;
    }
    if (navigation?.navigate) {
      try {
        navigation.navigate('UserActionPage', { pageId: 'donate' });
        return;
      } catch {}

      try {
        navigation.navigate('MemberCauses');
        return;
      } catch {}
    }
  };

  const handleOpenNotifications = () => {
    if (onPressNotifications) {
      onPressNotifications();
      return;
    }
    if (onNavigate) {
      onNavigate(AppRoutes.NOTIFICATIONS);
      return;
    }
    if (navigation?.navigate) {
      if (isAdmin) {
        try {
          navigation.navigate(AppRoutes.ADMIN_MORE_TAB, { screen: AppRoutes.NOTIFICATIONS });
          return;
        } catch {
          // fallback to direct route
        }
      }

      const state = navigation.getState ? navigation.getState() : null;
      const routeNames: string[] = state?.routeNames || [];

      if (
        routeNames.includes(AppRoutes.NOTIFICATIONS) ||
        routeNames.includes('Notifications')
      ) {
        navigation.navigate(AppRoutes.NOTIFICATIONS);
        return;
      }

      if (routeNames.includes(AppRoutes.ADMIN_MORE_TAB)) {
        navigation.navigate(AppRoutes.ADMIN_MORE_TAB, { screen: AppRoutes.NOTIFICATIONS });
        return;
      }

      try {
        navigation.navigate(isAdmin ? AppRoutes.NOTIFICATIONS : 'Notifications');
        return;
      } catch {
        // ignore
      }
    }
    if (onOpenMore) {
      onOpenMore();
    }
  };

  const handleViewProfile = () => {
    setDropdownVisible(false);
    if (onNavigate) {
      onNavigate(AppRoutes.MY_PROFILE);
    } else if (navigation?.navigate) {
      if (isAdmin) {
        try {
          navigation.navigate(AppRoutes.ADMIN_MORE_TAB, { screen: AppRoutes.MY_PROFILE });
        } catch {
          navigation.navigate(AppRoutes.MY_PROFILE);
        }
      } else {
        navigation.navigate('MemberProfile');
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
    Users: AppRoutes.USERS,
    users: AppRoutes.USERS,
    UserManagement: AppRoutes.USERS,
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
      if (isAdmin) {
        try {
          navigation.navigate(AppRoutes.ADMIN_MORE_TAB, { screen: AppRoutes.MY_PROFILE });
        } catch {
          navigation.navigate(AppRoutes.MY_PROFILE);
        }
      } else {
        navigation.navigate('MemberProfile');
      }
    }
  };

  const handleDrawerNavigate = (rawTarget: string) => {
    if (onNavigate) {
      onNavigate(rawTarget);
      return;
    }

    if (navigation?.navigate) {
      if (isAdmin) {
        const target = TAB_TARGET_MAP[rawTarget] || rawTarget;
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
      } else {
        // Non-admin / Member navigation routing
        const memberTargetMap: Record<string, string> = {
          [AppRoutes.ADMIN_COMPLAINTS_TAB]: 'MemberComplaint',
          Complaints: 'MemberComplaint',
          SupportTickets: 'MemberComplaint',
          complaints: 'MemberComplaint',
          [AppRoutes.MY_PROFILE]: 'MemberProfile',
          profile: 'MemberProfile',
          [AppRoutes.KNOW_YOUR_RIGHTS]: 'KnowYourRights',
          rights: 'KnowYourRights',
          [AppRoutes.ABOUT]: 'About',
          about: 'About',
          [AppRoutes.NEWS]: 'News',
          news: 'News',
          [AppRoutes.BLOGS]: 'Blogs',
          blogs: 'Blogs',
          [AppRoutes.NOTIFICATIONS]: 'Notifications',
          notifications: 'Notifications',
          [AppRoutes.SETTINGS]: 'Settings',
          settings: 'Settings',
          ProfileSettings: 'Settings',
          MemberHome: 'MemberHome',
          MemberCauses: 'MemberCauses',
          MemberEvents: 'MemberEvents',
          MemberReceipts: 'MemberReceipts',
          MembershipDetails: 'MembershipDetails',
          RenewMembership: 'RenewMembership',
        };

        const resolvedTarget =
          memberTargetMap[rawTarget] ||
          memberTargetMap[TAB_TARGET_MAP[rawTarget] || ''] ||
          rawTarget;

        try {
          navigation.navigate(resolvedTarget);
        } catch {
          // ignore
        }
      }
    } else if (onOpenMore) {
      onOpenMore();
    }
  };

  const isBackMode = Boolean(showBack && onBack);

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

        {/* Left Action: Back Arrow OR Hamburger Menu OR None */}
        {isBackMode ? (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="#0B2F52"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        ) : showMenu ? (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDrawerVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Open side navigation menu"
            activeOpacity={0.7}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="#0B2F52"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        ) : null}

        {/* Center/Left: Title OR Official HRSJM Logo */}
        <View
          style={[
            styles.centerWrap,
            (alignLogo === 'left' || shouldShowDonate || (!title && !showMenu && !isBackMode)) &&
              styles.centerWrapLeft,
          ]}
        >
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

        {/* Right Controls: Custom Right Action + Donate CTA + Notifications & Profile */}
        <View style={styles.rightRow}>
          {rightAction ? (
            <View style={styles.customRightAction}>{rightAction}</View>
          ) : null}

          {shouldShowDonate ? (
            <TouchableOpacity
              style={[
                styles.donateButton,
                isMember && styles.donateButtonMember,
              ]}
              onPress={handleDonatePress}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Donate to HRSJM"
            >
              <Text
                style={[
                  styles.donateButtonText,
                  isMember && styles.donateButtonTextMember,
                ]}
              >
                {donateLabel}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Notification Bell */}
          {!(hideNotifications || title === 'Notifications') ? (
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
          ) : null}

          {/* Profile Avatar + Dropdown Chevron */}
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => {
              if (onPressProfile) {
                onPressProfile();
              } else {
                setDropdownVisible(true);
              }
            }}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: user?.avatar || DEFAULT_ADMIN_AVATAR }}
              style={styles.avatarImage}
            />
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6 9l6 6 6-6"
                stroke="#718096"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
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
                {user?.email || '—'}
              </Text>
            </View>

            <View style={styles.dropdownDivider} />

            {/* View Profile Option */}
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleViewProfile}
              activeOpacity={0.7}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
                <Path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                  stroke="#34516D"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.dropdownItemText}>View Profile</Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            {/* Sign Out Option */}
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
                <Path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="#DC2626"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
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
    borderBottomColor: '#DBE5EE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    shadowColor: '#011F39',
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
    color: '#0B2F52',
    fontWeight: '700',
    lineHeight: 24,
  },
  backIcon: {
    fontSize: 22,
    color: '#0B2F52',
    fontWeight: '700',
    lineHeight: 24,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  centerWrapLeft: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingLeft: 6,
  },
  centerTitle: {
    ...Typography.screenTitle,
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2F52',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customRightAction: {
    marginRight: 2,
  },
  donateButton: {
    backgroundColor: '#FAD465',
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 8,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  donateButtonMember: {
    paddingHorizontal: 8.5,
    paddingVertical: 3.5,
    borderRadius: 6,
    marginLeft: 10,
  },
  donateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#011F39',
    fontFamily: 'Inter',
  },
  donateButtonTextMember: {
    fontSize: 11,
    fontWeight: '700',
    color: '#011F39',
    lineHeight: 14,
  },
  bellWrap: {
    position: 'relative',
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#DC2626',
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
    borderColor: '#FAD465', // Gold accent border per docs/design.md
  },
  chevron: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '700',
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 31, 57, 0.4)',
  },
  dropdownMenu: {
    position: 'absolute',
    right: 16,
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#DCE4EC',
  },
  dropdownHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dropdownName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2F52',
  },
  dropdownEmail: {
    fontSize: 11,
    color: '#718096',
    marginTop: 1,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#DBE5EE',
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
    color: '#34516D',
  },
  signOutText: {
    color: '#DC2626',
    fontWeight: '600',
  },
});
