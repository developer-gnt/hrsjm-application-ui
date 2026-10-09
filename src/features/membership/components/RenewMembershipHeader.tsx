import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
} from '../../../core';

const HRSJM_LOGO = require('../../../assets/hrsjm_logo.png');

interface RenewMembershipHeaderProps {
  paddingTop?: number;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const RenewMembershipHeader: React.FC<RenewMembershipHeaderProps> = ({
  paddingTop = 0,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
}) => {
  return (
    <View style={[styles.headerContainer, { paddingTop: paddingTop + 6 }]}>
      {/* Top Navigation & Branding Bar */}
      <View style={styles.topBar}>
        {/* Left Hamburger Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Open Navigation Menu"
        >
          <View style={styles.hamburgerIcon}>
            <View style={styles.hamburgerBar} />
            <View style={styles.hamburgerBar} />
            <View style={styles.hamburgerBar} />
          </View>
        </TouchableOpacity>

        {/* Center HRSJM Brand & Motto */}
        <View style={styles.centerBrand}>
          <Image
            source={HRSJM_LOGO}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.brandTextGroup}>
            <Text style={styles.brandTitle}>HRSJM</Text>
            <Text style={styles.brandMottoPrimary}>
              Human Rights • Justice • Accountability
            </Text>
            <Text style={styles.brandMottoSecondary}>
              Peace  •  Equality  •  Dignity
            </Text>
          </View>
        </View>

        {/* Right Actions: Notification Bell + Avatar */}
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
              <Text style={styles.unreadBadgeText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={onProfilePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="User Profile"
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                }}
                style={styles.avatarImage}
              />
            </View>
            <Text style={styles.dropdownChevron}>▾</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  menuButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    width: 20,
    height: 14,
    justifyContent: 'space-between',
  },
  hamburgerBar: {
    width: 20,
    height: 2.2,
    backgroundColor: '#0F2860',
    borderRadius: 1,
  },
  centerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    paddingHorizontal: 6,
  },
  logoImage: {
    width: 38,
    height: 38,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  brandMottoPrimary: {
    fontSize: 8.2,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 10.5,
    marginTop: 1,
  },
  brandMottoSecondary: {
    fontSize: 7.8,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 9.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDome: {
    width: 13,
    height: 10,
    borderTopLeftRadius: 6.5,
    borderTopRightRadius: 6.5,
    backgroundColor: '#0F2860',
  },
  bellBase: {
    width: 17,
    height: 2.2,
    borderRadius: 1,
    backgroundColor: '#0F2860',
    marginTop: 1,
  },
  bellClapper: {
    width: 3.5,
    height: 2.5,
    borderBottomLeftRadius: 1.8,
    borderBottomRightRadius: 1.8,
    backgroundColor: '#0F2860',
    marginTop: 0.5,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#DC2626',
    minWidth: 15,
    height: 15,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2.5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#E2E8F0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  dropdownChevron: {
    fontSize: 11,
    color: '#0F2860',
    fontWeight: '700',
    marginLeft: 1,
  },
});
