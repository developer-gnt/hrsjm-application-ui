import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { PressableScale } from './PressableScale';
import { HRSJMLogo } from './HRSJMLogo';
import { AppAvatar } from './AppAvatar';
import { Bell, ChevronDown } from '../icons';

interface HRSJMHeaderProps {
  /** Unread notification count; renders the red badge when > 0. */
  notificationCount?: number;
  profileName?: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  style?: ViewStyle;
}

const ICON_SIZE = 24;
const HIT = { top: 10, bottom: 10, left: 10, right: 10 };

/**
 * Reusable HRSJM app header: [Menu] [Logo + Brand] [Notification] [Profile].
 * Respects the top safe-area inset, keeps a consistent height on a clean
 * white surface with a subtle bottom divider.
 */
export const HRSJMHeader: React.FC<HRSJMHeaderProps> = ({
  notificationCount = 0,
  profileName = 'Admin User',
  onMenuPress,
  onNotificationPress,
  onProfilePress,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]}>
      <View style={styles.content}>
        <PressableScale
          onPress={onMenuPress}
          hitSlop={HIT}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          testID="header-menu"
          style={styles.iconButton}
        >
          <View style={styles.menuGlyph}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLineShort} />
          </View>
        </PressableScale>

        <View style={styles.brand}>
          <HRSJMLogo size={38} />
        </View>

        <View style={styles.actions}>
          <PressableScale
            onPress={onNotificationPress}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel={
              notificationCount > 0
                ? `Notifications, ${notificationCount} unread`
                : 'Notifications'
            }
            testID="header-notifications"
            style={styles.iconButton}
          >
            <Bell size={ICON_SIZE} color={BrandColors.textSecondary} strokeWidth={1.8} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </PressableScale>

          <PressableScale
            onPress={onProfilePress}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel="Open profile menu"
            testID="header-profile"
            style={styles.profileButton}
          >
            <AppAvatar name={profileName} size={34} backgroundColor={BrandColors.softBlue} />
            <ChevronDown size={16} color={BrandColors.textMuted} strokeWidth={2} />
          </PressableScale>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: BrandColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  content: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuGlyph: {
    width: 20,
    height: 15,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: BrandColors.textPrimary,
  },
  menuLineShort: {
    height: 2,
    width: '65%',
    borderRadius: 1,
    backgroundColor: BrandColors.textPrimary,
  },
  brand: {
    flex: 1,
    marginLeft: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: BrandColors.danger,
    borderWidth: 2,
    borderColor: BrandColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: BrandColors.surface,
    lineHeight: 12,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HRSJMHeader;
