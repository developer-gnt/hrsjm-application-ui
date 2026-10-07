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

interface MembershipDetailsHeaderProps {
  paddingTop?: number;
  onBack: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const MembershipDetailsHeader: React.FC<MembershipDetailsHeaderProps> = ({
  paddingTop = 0,
  onBack,
  onNotificationsPress,
  onProfilePress,
}) => {
  return (
    <View style={[styles.wrapper, { paddingTop: paddingTop + Spacing.sm }]}>
      {/* Top Navigation Row */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>‹</Text>
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

      {/* Title & Subtitle */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Membership Application Details</Text>
        <Text style={styles.pageSubtitle}>
          Review applicant information, documents and audit history.
        </Text>
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
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backIcon: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F2860',
    lineHeight: 28,
    marginTop: -2,
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
  titleSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  pageTitle: {
    fontSize: 22,
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
});
