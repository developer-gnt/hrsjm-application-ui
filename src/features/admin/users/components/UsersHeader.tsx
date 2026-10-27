import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Spacing, BorderRadius, FontFamilies } from '../../../../core';
import { useDynamicUnreadCount } from '../../notifications/store/notificationsStore';

const HRSJM_LOGO = require('../../../../assets/hrsjm_logo.png');

interface UsersHeaderProps {
  paddingTop?: number;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({
  paddingTop = 0,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
}) => {
  const unreadCount = useDynamicUnreadCount();

  return (
    <View style={[styles.wrapper, { paddingTop: paddingTop + Spacing.xs }]}>
      <View style={styles.topBar}>
        {/* Hamburger Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Open Navigation Menu"
        >
          <View style={styles.hamburgerIcon}>
            <View style={styles.hamburgerBar} />
            <View style={[styles.hamburgerBar, styles.hamburgerBarMiddle]} />
            <View style={styles.hamburgerBar} />
          </View>
        </TouchableOpacity>

        {/* Center Brand Identity */}
        <View style={styles.centerBrand}>
          <Image
            source={HRSJM_LOGO}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="HRSJM Logo"
          />
          <View style={styles.brandTextColumn}>
            <Text style={styles.brandTitle}>HRSJM</Text>
            <Text style={styles.brandSubtitleEn} numberOfLines={1}>
              HUMAN RIGHTS & SOCIAL JUSTICE MISSION
            </Text>
            <Text style={styles.brandSubtitleHi} numberOfLines={1}>
              मानव अधिकार एवं सामाजिक न्याय मिशन
            </Text>
          </View>
        </View>

        {/* Right Action Icons: Bell with dynamic badge + Profile Avatar */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationsPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          >
            <View style={styles.bellIcon}>
              <View style={styles.bellDome} />
              <View style={styles.bellBase} />
              <View style={styles.bellClapper} />
            </View>
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={onProfilePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Admin Profile"
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                }}
                style={styles.avatarImage}
                accessibilityLabel="Admin Profile Picture"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBE5EE',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
  },
  menuButton: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    width: 20,
    height: 14,
    justifyContent: 'space-between',
  },
  hamburgerBar: {
    width: '100%',
    height: 2,
    backgroundColor: '#06294D',
    borderRadius: 2,
  },
  hamburgerBarMiddle: {
    width: '80%',
  },
  centerBrand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  logoImage: {
    width: 36,
    height: 36,
    marginRight: 6,
  },
  brandTextColumn: {
    alignItems: 'flex-start',
  },
  brandTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#06294D',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  brandSubtitleEn: {
    fontFamily: FontFamilies.sans,
    fontSize: 7.5,
    fontWeight: '600',
    color: '#174A78',
    letterSpacing: 0.3,
    lineHeight: 10,
  },
  brandSubtitleHi: {
    fontFamily: FontFamilies.sans,
    fontSize: 7.5,
    fontWeight: '500',
    color: '#34516D',
    letterSpacing: 0.2,
    lineHeight: 10,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDome: {
    width: 12,
    height: 11,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: '#06294D',
  },
  bellBase: {
    width: 15,
    height: 2.5,
    backgroundColor: '#06294D',
    borderRadius: 1,
    marginTop: 0.5,
  },
  bellClapper: {
    width: 3.5,
    height: 2,
    backgroundColor: '#06294D',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: 0.5,
  },
  unreadBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    fontFamily: FontFamilies.sans,
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    lineHeight: 10,
  },
  profileButton: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#DBE5EE',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
