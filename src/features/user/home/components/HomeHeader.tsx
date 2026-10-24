import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AdminColors, Spacing, UserFontFamilies } from '../../../../core/theme';
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
  /** Active secondary nav tab id if applicable */
  activeNav?: 'home' | 'about' | 'what-we-do' | 'rights' | 'events' | 'news' | 'contact' | 'join';
  /** Set to true on dense/inner modal views to omit the secondary navigation strip */
  hideSecondaryNav?: boolean;
  onOpenDonate?: () => void;
  onNavigateNav?: (id: string) => void;
  showSearchAndBell?: boolean;
}

const SECONDARY_NAV_ITEMS = [
  { id: 'home', label: 'Home', route: 'UserHome' },
  { id: 'about', label: 'About Us', route: 'UserAbout' },
  { id: 'what-we-do', label: 'What We Do', route: 'WhatWeDoDetail', params: { contentId: 'awareness-campaigns' } },
  { id: 'rights', label: 'Know Your Rights', route: 'UserRights' },
  { id: 'events', label: 'Events', route: 'UserEvents' },
  { id: 'news', label: 'News and Media', route: 'UserNews' },
  { id: 'contact', label: 'Contact Us', route: 'ContactUs' },
  { id: 'join', label: 'Join Us', route: 'MembershipCategories' },
] as const;

/**
 * Official HRSJM User Portal Header (docs/design.md §5):
 * - Primary Header: White background (#FFFFFF), Emblem Logo + Bilingual Wordmark,
 *   Search icon and Notification bell.
 */
export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onBack,
  onPressSearch,
  onPressNotifications,
  onPressProfile,
  unreadCount = 3,
  rightAction,
  activeNav,
  hideSecondaryNav = false,
  onOpenDonate,
  onNavigateNav,
  showSearchAndBell = true,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);
  const headerActions = useHeaderActions();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const effectiveUnreadCount = unreadCount ?? 3;

  const handleOpenSearch = () => {
    if (onPressSearch) {
      onPressSearch();
      return;
    }
    if (navigation?.navigate) {
      try {
        navigation.navigate('Search');
        return;
      } catch {}
      try {
        navigation.navigate('UserRights');
      } catch {}
    }
  };

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

  const handleDonatePress = () => {
    if (onOpenDonate) {
      onOpenDonate();
      return;
    }
    if (navigation?.navigate) {
      try {
        navigation.navigate('UserActionPage', { pageId: 'donate' });
      } catch {}
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
          {/* Left: Back button (if inner page) + Shield Logo + Bilingual Wordmark */}
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
              <View style={styles.wordmarkCol}>
                <Text style={styles.brandTitle}>HRSJM</Text>
                <Text style={styles.wordmarkEnglish} numberOfLines={1}>
                  HUMAN RIGHTS AND SOCIAL JUSTICE MISSION
                </Text>
                <Text style={styles.wordmarkHindi} numberOfLines={1}>
                  मानव अधिकार • सामाजिक न्याय
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Right: Donate CTA + Search + Notification Bell */}
          <View style={styles.rightRow}>
            {rightAction ? (
              <View style={styles.customRightAction}>{rightAction}</View>
            ) : (
              <>
                {/* Main Call to Action: Gold Donate button per docs/design.md §5 */}
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleDonatePress}
                  activeOpacity={0.82}
                  accessibilityRole="button"
                  accessibilityLabel="Donate to HRSJM"
                >
                  <Text style={styles.ctaButtonText}>Donate</Text>
                </TouchableOpacity>

                {/* Search Icon */}
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleOpenSearch}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Search"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                      stroke={AdminColors.primaryDark}
                      strokeWidth={1.9}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>

                {/* Notification Bell */}
                <TouchableOpacity
                  style={styles.bellButton}
                  onPress={handleOpenNotifications}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Notifications, ${effectiveUnreadCount} unread`}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
                      stroke={AdminColors.primaryDark}
                      strokeWidth={1.9}
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
              </>
            )}
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
    paddingHorizontal: 12,
    paddingBottom: 8,
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
    minHeight: 46,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
    marginRight: 6,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 1,
    minWidth: 0,
  },
  shieldLogo: {
    width: 36,
    height: 36,
    flexShrink: 0,
  },
  wordmarkCol: {
    justifyContent: 'center',
    flexShrink: 1,
    minWidth: 0,
  },
  brandTitle: {
    fontFamily: UserFontFamilies.heading,
    fontSize: 18,
    fontWeight: '700',
    color: '#06294D',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  wordmarkEnglish: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 7.2,
    fontWeight: '700',
    color: '#34516D',
    letterSpacing: 0.3,
    lineHeight: 9.5,
  },
  wordmarkHindi: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 8,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.1,
    marginTop: 0.5,
    lineHeight: 10.5,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  iconButton: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButton: {
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
  ctaButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#011F39',
    fontFamily: 'Inter',
  },
  customRightAction: {
    marginRight: 2,
  },
  bellButton: {
    position: 'relative',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 8,
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
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 1,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FAD465', // Gold accent border per docs/design.md
  },
  dropdownCaret: {
    fontSize: 8,
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
  secondaryNavStrip: {
    backgroundColor: '#FAD465', // color-gold-500
    borderTopWidth: 1,
    borderTopColor: 'rgba(1, 31, 57, 0.08)',
    marginHorizontal: -16,
    marginBottom: -10,
    marginTop: 8,
    minHeight: 38,
  },
  secondaryNavContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  secondaryNavItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  secondaryNavItemActive: {
    backgroundColor: 'rgba(1, 31, 57, 0.08)',
  },
  secondaryNavText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#011F39', // color-navy-950
    letterSpacing: 0.2,
  },
  secondaryNavTextActive: {
    fontWeight: '800',
    color: '#011F39',
  },
  secondaryNavActiveUnderline: {
    position: 'absolute',
    bottom: 2,
    left: 12,
    right: 12,
    height: 2.5,
    backgroundColor: '#011F39',
    borderRadius: 1,
  },
});
