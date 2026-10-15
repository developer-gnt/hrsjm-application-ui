import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import {
  AdminColors,
  Spacing,
  BorderRadius,
  AppAvatar,
} from '../../../../core';

interface DonationsTopBarProps {
  /** Safe-area top inset, applied above the header. */
  paddingTop?: number;
  onMenuPress?: () => void;
  onBellPress?: () => void;
  onProfilePress?: () => void;
}

/**
 * UI-phase HRSJM admin header (hamburger, logo, org identity,
 * notifications, profile). Temporary feature-local implementation —
 * replace with the shared app shell once navigation infrastructure
 * lands. The notification badge count is a visual placeholder.
 */
export const DonationsTopBar: React.FC<DonationsTopBarProps> = ({
  paddingTop = 0,
  onMenuPress,
  onBellPress,
  onProfilePress,
}) => {
  return (
    <View
      style={[
        styles.container,
        { paddingTop: paddingTop + Spacing.md },
      ]}
    >
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
      >
        <Text style={styles.menuIcon}>≡</Text>
      </TouchableOpacity>

      <View style={styles.logoBadge}>
        <Text style={styles.logoLetter}>H</Text>
        <View style={styles.logoUnderline} />
      </View>

      <View style={styles.identityColumn}>
        <Text style={styles.orgName}>HRSJM</Text>
        <Text style={styles.orgFullName} numberOfLines={1}>
          HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
        </Text>
        <Text style={styles.orgHindi} numberOfLines={1}>
          मानव अधिकार · सामाजिक न्याय
        </Text>
      </View>

      <TouchableOpacity
        style={styles.bellButton}
        onPress={onBellPress}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <View style={styles.bellIcon}>
          <View style={styles.bellDome} />
          <View style={styles.bellBase} />
          <View style={styles.bellClapper} />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={onProfilePress}
        accessibilityRole="button"
        accessibilityLabel="Profile"
      >
        <AppAvatar name="Admin User" size={36} />
        <Text style={styles.chevron}>⌄</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.divider,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1.5,
    borderColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  logoLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  logoUnderline: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: AdminColors.accentGold,
    marginTop: 1,
  },
  identityColumn: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  orgName: {
    fontSize: 20,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  orgFullName: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: AdminColors.primary,
    marginTop: 1,
  },
  orgHindi: {
    fontSize: 9,
    color: AdminColors.accentGold,
    marginTop: 1,
  },
  bellButton: {
    marginRight: Spacing.base,
    marginLeft: Spacing.xs,
  },
  bellIcon: {
    width: 20,
    height: 22,
    alignItems: 'center',
  },
  bellDome: {
    width: 14,
    height: 9,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: AdminColors.primary,
  },
  bellBase: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: AdminColors.primary,
    marginTop: 1,
  },
  bellClapper: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: AdminColors.primary,
    marginTop: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 12,
    color: AdminColors.primary,
    marginLeft: 2,
  },
});