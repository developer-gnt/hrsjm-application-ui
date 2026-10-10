import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Spacing, BorderRadius } from '../../../../core';

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

        {/* Right Action Icons: Bell with badge '1' + Profile Avatar */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationsPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <View style={styles.bellIcon}>
              <View style={styles.bellDome} />
              <View style={styles.bellBase} />
              <View style={styles.bellClapper} />
            </View>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>1</Text>
            </View>
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
    borderBottomColor: '#E2E8F0',
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
    width: 38,
    height: 38,
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
    backgroundColor: '#1E3A8A',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  brandSubtitleEn: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#1B3F8F',
    letterSpacing: 0.3,
    lineHeight: 9,
  },
  brandSubtitleHi: {
    fontSize: 7.5,
    fontWeight: '600',
    color: '#0F2860',
    letterSpacing: 0.2,
    lineHeight: 9,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationButton: {
    width: 36,
    height: 36,
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
    backgroundColor: '#1E3A8A',
  },
  bellBase: {
    width: 15,
    height: 2.5,
    backgroundColor: '#1E3A8A',
    borderRadius: 1,
    marginTop: 0.5,
  },
  bellClapper: {
    width: 3.5,
    height: 2,
    backgroundColor: '#1E3A8A',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: 0.5,
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
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
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    lineHeight: 10,
  },
  profileButton: {
    borderRadius: BorderRadius.full,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
