import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';

/**
 * TEMPORARY PREVIEW COMPONENT — NOT THE REAL GLOBAL HEADER.
 *
 * Reproduces the HRSJM Admin app-shell header (menu / branding / bell /
 * avatar) from the reference design so the Events screen can be reviewed in
 * context. The real global header, navigation and branding assets are owned
 * by the app-level architecture (Mubasshir) and will replace this file.
 *
 * DELETE THIS FILE when the real Admin shell is integrated.
 */

const showPreviewNotice = () => {
  Alert.alert(
    'Preview shell',
    'This control belongs to the global Admin navigation architecture. It is shown here as a temporary preview only.',
  );
};

export const AdminShellHeader: React.FC<{
  /** Leading control. Defaults to 'menu' (the original shell behavior). */
  leading?: 'menu' | 'back';
  /** Called by the back-arrow leading control (leading="back"). */
  onBack?: () => void;
}> = ({ leading = 'menu', onBack }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing.sm) }]}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={leading === 'back' ? onBack : showPreviewNotice}
        accessibilityRole="button"
        accessibilityLabel={leading === 'back' ? 'Go back' : 'Open navigation menu'}
      >
        <Text style={[styles.menuIcon, leading === 'back' && styles.menuIconBack]}>
          {leading === 'back' ? '←' : '☰'}
        </Text>
      </TouchableOpacity>

      <View style={styles.logoPlaceholder} accessible accessibilityLabel="HRSJM logo">
        <Text style={styles.logoIcon}>🕊️</Text>
      </View>

      <View style={styles.branding}>
        <Text style={styles.brandName}>HRSJM</Text>
        <Text style={styles.brandTagline} numberOfLines={1}>
          HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
        </Text>
        <Text style={styles.brandHindi} numberOfLines={1}>
          मानव अधिकार • सामाजिक न्याय
        </Text>
      </View>

      <View style={styles.rightCluster}>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={showPreviewNotice}
          accessibilityRole="button"
          accessibilityLabel="Notifications, 3 unread"
        >
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={showPreviewNotice}
          accessibilityRole="button"
          accessibilityLabel="Account menu"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AD</Text>
          </View>
          <Text style={styles.chevron}>⌄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 54,
  },
  menuButton: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  menuIcon: {
    fontSize: 20,
    color: AdminColors.textPrimary,
  },
  menuIconBack: {
    // The ← glyph is drawn on the baseline inside its line box, which leaves
    // it visibly below the branding block's optical center — nudge it up so
    // the arrow sits on the same vertical center line as the logo + text.
    transform: [{ translateY: -4 }],
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: AdminColors.primaryDark,
    borderWidth: 1.5,
    borderColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logoIcon: {
    fontSize: 15,
  },
  branding: {
    flex: 1,
    minWidth: 0,
  },
  brandName: {
    ...Typography.screenTitle,
    fontSize: 16,
    lineHeight: 19,
    color: AdminColors.primaryDark,
  },
  brandTagline: {
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: AdminColors.primary,
  },
  brandHindi: {
    fontSize: 7.5,
    lineHeight: 10,
    color: AdminColors.textSecondary,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  bellButton: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  bellIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.statusInactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primaryLight,
    borderWidth: 1,
    borderColor: AdminColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.badge,
    color: AdminColors.primary,
  },
  chevron: {
    fontSize: 12,
    color: AdminColors.textMuted,
    marginLeft: 2,
  },
});