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
import { AdminColors, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import { useHeaderActions } from '../../components/HeaderActionsContext';
import { useAuthStore } from '../../../auth/store/authStore';
import {
  DEFAULT_ADMIN_AVATAR,
  UserProfileModal,
} from '../../../auth/components/UserProfileModal';

const LOGO_SOURCE = require('../../../../assets/logo/logo.png');

export interface HomeHeaderProps {
  onBack?: () => void;
  onPressSearch?: () => void;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
  /** Number of unread notifications to show on bell badge. Defaults to 3. */
  unreadCount?: number;
  /** Legacy prop for unread dot indicator */
  showNotificationDot?: boolean;
  notificationDotColor?: string;
  preferLocalActions?: boolean;
  /** Custom right-hand element if needed */
  rightAction?: React.ReactNode;
}

/**
 * Official HRSJM User Portal Header:
 * - Left: Official Shield Emblem + Bold "HRSJM" Brand Wordmark (with back button on inner pages)
 * - Right: Notification bell with red count badge ('3') + Circular user avatar with blue border and dropdown caret
 */
export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onBack,
  onPressNotifications,
  onPressProfile,
  unreadCount = 3,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);
  const headerActions = useHeaderActions();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const effectiveUnreadCount = unreadCount ?? 3;

  const handleOpenNotifications = () => {
    if (onPressNotifications) {
      onPressNotifications();
      return;
    }
    if (headerActions.onOpenNotifications) {
      headerActions.onOpenNotifications();
      return;
    }
    if (navigation?.navigate) {
      try {
        navigation.navigate('Notifications');
      } catch {
        // ignore navigation failures
      }
    }
  };

  const handleBrandPress = () => {
    if (navigation?.navigate) {
      try {
        navigation.navigate('UserHome');
        return;
      } catch {
        // fallback to SeekerHome
      }
      try {
        navigation.navigate('SeekerHome');
      } catch {
        // ignore
      }
    }
  };

  const handleOpenProfile = () => {
    setDropdownVisible(false);
    if (onPressProfile) {
      onPressProfile();
      return;
    }
    if (navigation?.navigate) {
      try {
        navigation.navigate('UserProfile');
        return;
      } catch {
        // fallback
      }
      try {
        navigation.navigate('MemberProfile');
        return;
      } catch {
        // fallback
      }
    }
    setProfileModalVisible(true);
  };

  const handleSignOut = async () => {
    setDropdownVisible(false);
    try {
      await signOut();
    } catch {
      // Local session cleanup handled in authStore
    }
  };

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingTop:
              Platform.OS === 'ios'
                ? Math.max(insets.top, 12)
                : Math.max(insets.top, StatusBar.currentHeight ? StatusBar.currentHeight + 6 : 10),
          },
        ]}
      >
        <StatusBar barStyle="dark-content" />

        <View style={styles.content}>
          {/* Left: Back button (if inner page) + Shield Logo + "HRSJM" text */}
          <View style={styles.leftRow}>
            {onBack ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon name="chevron-left" size={20} color={AdminColors.primaryDark} />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.brandRow}
              onPress={handleBrandPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="HRSJM Home"
            >
              <Image
                source={LOGO_SOURCE}
                style={styles.shieldLogo}
                resizeMode="contain"
              />
              <Text style={styles.brandTitle}>HRSJM</Text>
            </TouchableOpacity>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Right: Custom Action (if any) + Bell with Count + Avatar with Blue Border & Caret */}
          <View style={styles.rightRow}>
            {rightAction ? (
              <View style={styles.customRightAction}>{rightAction}</View>
            ) : null}

            {/* Notification Bell with red count badge */}
            <TouchableOpacity
              style={styles.bellButton}
              onPress={handleOpenNotifications}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Notifications, ${effectiveUnreadCount} unread`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
                  stroke={AdminColors.primaryDark}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              {effectiveUnreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {effectiveUnreadCount > 9 ? '9+' : effectiveUnreadCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>

            {/* Circular Profile Avatar with Blue Ring + Caret */}
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => setDropdownVisible(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open user profile menu"
            >
              <Image
                source={{ uri: user?.avatar || DEFAULT_ADMIN_AVATAR }}
                style={styles.avatarImage}
              />
              <Text style={styles.dropdownCaret}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* User Profile Dropdown Menu */}
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
                    ? Math.max(insets.top, 12) + 52
                    : Math.max(insets.top, StatusBar.currentHeight ? StatusBar.currentHeight + 6 : 10) + 52,
              },
            ]}
          >
            {/* User Details */}
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownName} numberOfLines={1}>
                {user?.full_name || 'HRSJM Member'}
              </Text>
              <Text style={styles.dropdownEmail} numberOfLines={1}>
                {user?.email || 'member@hrsjm.org'}
              </Text>
            </View>

            <View style={styles.dropdownDivider} />

            {/* View Profile */}
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleOpenProfile}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownItemIcon}>👤</Text>
              <Text style={styles.dropdownItemText}>View Profile</Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            {/* Sign Out */}
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

      {/* Full User Profile Modal fallback */}
      <UserProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onSignOut={handleSignOut}
        onViewFullProfile={() => {
          setProfileModalVisible(false);
          if (navigation?.navigate) {
            try {
              navigation.navigate('UserProfile');
            } catch {
              // ignore
            }
          }
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
    paddingHorizontal: 16,
    paddingBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldLogo: {
    width: 38,
    height: 38,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: AdminColors.primaryDark,
    letterSpacing: 0.5,
  },
  spacer: {
    flex: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  customRightAction: {
    marginRight: 2,
  },
  bellButton: {
    position: 'relative',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FAD465', // Gold accent border per docs/design.md
  },
  dropdownCaret: {
    fontSize: 9,
    color: '#718096',
    marginLeft: 1,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 31, 57, 0.4)',
  },
  dropdownMenu: {
    position: 'absolute',
    right: 16,
    width: 210,
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
