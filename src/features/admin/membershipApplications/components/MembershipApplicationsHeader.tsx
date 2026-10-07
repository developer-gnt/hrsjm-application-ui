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
  Spacing,
  BorderRadius,
} from '../../../../core';

const HRSJM_LOGO = require('../../../../assets/hrsjm_logo.png');

interface MembershipApplicationsHeaderProps {
  paddingTop?: number;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onSignupPress?: () => void;
}

export const MembershipApplicationsHeader: React.FC<MembershipApplicationsHeaderProps> = ({
  paddingTop = 0,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
  onSignupPress,
}) => {
  return (
    <View style={[styles.wrapper, { paddingTop: paddingTop + Spacing.sm }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
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

        <View style={styles.centerBrand}>
          <Image
            source={HRSJM_LOGO}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>HRSJM</Text>
        </View>

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
            accessibilityLabel="Admin Profile"
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
                }}
                style={styles.avatarImage}
              />
            </View>
            <Text style={styles.dropdownChevron}>▾</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Page Title & Subtitle with Sign Up action button */}
      <View style={styles.titleRow}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Membership Applications</Text>
          <Text style={styles.pageSubtitle}>
            Review, verify and manage membership applications.
          </Text>
        </View>
        {onSignupPress ? (
          <TouchableOpacity
            style={styles.signupButton}
            onPress={onSignupPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Test Sign Up flow"
          >
            <Text style={styles.signupButtonIcon}>👤+</Text>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: AdminColors.background,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
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
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hamburgerIcon: {
    width: 18,
    height: 14,
    justifyContent: 'space-between',
  },
  hamburgerBar: {
    width: 18,
    height: 2,
    backgroundColor: '#334155',
    borderRadius: 1,
  },
  hamburgerBarMiddle: {
    width: 14,
  },
  centerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 34,
    height: 34,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AdminColors.primary,
    letterSpacing: 0.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDome: {
    width: 14,
    height: 11,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: '#1E293B',
  },
  bellBase: {
    width: 18,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: '#1E293B',
    marginTop: 1,
  },
  bellClapper: {
    width: 4,
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: '#1E293B',
    marginTop: 0.5,
  },
  unreadBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: '#DC2626',
    minWidth: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  avatarContainer: {
    width: 34,
    height: 34,
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
    fontSize: 12,
    color: '#475569',
    marginLeft: 1,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  titleSection: {
    flex: 1,
    paddingRight: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 18,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2860',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    gap: 5,
    marginTop: 2,
  },
  signupButtonIcon: {
    fontSize: 12,
  },
  signupButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
