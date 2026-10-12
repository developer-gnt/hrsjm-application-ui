import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, Spacing, BorderRadius } from '../../../core';

const HRSJM_LOGO = require('../../../assets/hrsjm_logo.png');

interface SupportTicketsHeaderProps {
  paddingTop?: number;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const SupportTicketsHeader: React.FC<SupportTicketsHeaderProps> = ({
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
            accessibilityLabel="HRSJM Emblem"
          />
          <View style={styles.brandTextColumn}>
            <Text style={styles.brandTitle}>HRSJM</Text>
            <Text style={styles.brandSubtitleEn} numberOfLines={1}>
              Human Rights & Social Justice Mission
            </Text>
            <Text style={styles.brandMotto} numberOfLines={1}>
              Peace • Equality • Dignity
            </Text>
          </View>
        </View>

        {/* Right Action Icons: Bell + Avatar */}
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
            accessibilityLabel="User Profile"
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                }}
                style={styles.avatarImage}
                accessibilityLabel="Profile Avatar"
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
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hamburgerIcon: {
    width: 18,
    height: 13,
    justifyContent: 'space-between',
  },
  hamburgerBar: {
    width: 18,
    height: 2,
    backgroundColor: '#1E293B',
    borderRadius: 1,
  },
  hamburgerBarMiddle: {
    width: 13,
  },
  centerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.sm,
    gap: 8,
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  brandTextColumn: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AdminColors.primary,
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  brandSubtitleEn: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0F2860',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  brandMotto: {
    fontSize: 8.5,
    fontWeight: '500',
    color: '#D97706',
    letterSpacing: 0.2,
    marginTop: 0.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationButton: {
    position: 'relative',
    padding: 6,
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
    backgroundColor: '#1E293B',
  },
  bellBase: {
    width: 17,
    height: 2.2,
    borderRadius: 1,
    backgroundColor: '#1E293B',
    marginTop: 1,
  },
  bellClapper: {
    width: 4,
    height: 2.5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: '#1E293B',
    marginTop: 0.5,
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    minWidth: 15,
    height: 15,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 34,
    height: 34,
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
