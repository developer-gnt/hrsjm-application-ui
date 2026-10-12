import React from 'react';
import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors, Spacing } from '../../../../core/theme';
import { AppIcon, HrsjmLogoMark } from '../../components';
import { useHeaderActions } from '../../components/HeaderActionsContext';

interface HomeHeaderProps {
  onBack?: () => void;
  onPressSearch?: () => void;
  onPressNotifications?: () => void;
  /** Unread dot on the bell. */
  showNotificationDot?: boolean;
  notificationDotColor?: string;
  /** Lets a dedicated search page use the header search button to focus its input. */
  preferLocalActions?: boolean;
}

/**
 * User-facing Home header: the official HRSJM logo lockup (emblem, wordmark
 * and taglines as one artwork) with search and notification actions —
 * matching the reference header (white surface, navy line icons).
 *
 * The top safe-area inset is applied here so the hosting screen can keep
 * SafeAreaView edges={['left', 'right']} (same pattern as the Admin shell
 * header) — no iOS-specific status-bar handling is reproduced.
 */
export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onBack,
  onPressSearch,
  onPressNotifications,
  showNotificationDot = false,
  notificationDotColor = AdminColors.statusInactive,
  preferLocalActions = false,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const headerActions = useHeaderActions();
  const searchHandler = preferLocalActions
    ? onPressSearch ?? headerActions.onOpenSearch
    : headerActions.onOpenSearch ?? onPressSearch;
  const notificationsHandler =
    headerActions.onOpenNotifications ?? onPressNotifications;
  const hasUnreadNotifications =
    headerActions.hasUnreadNotifications ?? showNotificationDot;
  // Keep the full lockup + both actions visible on narrow phones.
  const logoHeight = width < 350 ? 40 : 48;

  return (
    <View
      style={[styles.container, { paddingTop: Math.max(insets.top, Spacing.sm) }]}
    >
      <View style={styles.content}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppIcon name="chevron-left" size={20} color={AdminColors.primaryDark} />
          </TouchableOpacity>
        ) : null}
        <HrsjmLogoMark height={logoHeight} />

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={searchHandler}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <AppIcon name="search" size={22} color={AdminColors.primaryDark} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={notificationsHandler}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            hasUnreadNotifications
              ? 'Notifications, unread updates available'
              : 'Notifications'
          }
        >
          <AppIcon name="bell" size={22} color={AdminColors.primaryDark} />
          {hasUnreadNotifications && (
            <View
              style={[
                styles.unreadDot,
                {
                  backgroundColor: headerActions.hasUnreadNotifications
                    ? AdminColors.accentGold
                    : notificationDotColor,
                },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  spacer: {
    flex: 1,
  },
  actionButton: {
    width: 38,
    height: 38,
    marginLeft: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 9999,
    backgroundColor: AdminColors.statusInactive,
    borderWidth: 1.5,
    borderColor: AdminColors.cardSurface,
  },
});
