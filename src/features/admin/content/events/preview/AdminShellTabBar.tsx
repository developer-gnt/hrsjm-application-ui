import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Spacing } from '../../../../../core/theme';

/**
 * TEMPORARY PREVIEW COMPONENT — NOT THE REAL GLOBAL NAVIGATION.
 *
 * Reproduces the HRSJM Admin bottom navigation from the reference design so
 * content screens can be reviewed in context. The real bottom navigation is
 * owned by the app-level navigation architecture (Mubasshir) and will replace
 * this file.
 *
 * DELETE THIS FILE when the real Admin navigation is integrated.
 */

export type AdminShellTabKey =
  | 'dashboard'
  | 'members'
  | 'applications'
  | 'donationSeekers'
  | 'donations'
  | 'complaints'
  | 'events'
  | 'news'
  | 'blogs'
  | 'rights'
  | 'more';

interface ShellTab {
  key: AdminShellTabKey;
  label: string;
  icon: string;
}

const SHELL_TABS: ShellTab[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'members', label: 'Members', icon: '👥' },
  { key: 'applications', label: 'Applications', icon: '📄' },
  { key: 'donationSeekers', label: 'Donation Seekers', icon: '🤝' },
  { key: 'donations', label: 'Donations', icon: '💌' },
  { key: 'complaints', label: 'Complaints', icon: '💬' },
  { key: 'events', label: 'Events', icon: '📅' },
  { key: 'news', label: 'News', icon: '📰' },
  { key: 'blogs', label: 'Blogs', icon: '📝' },
  { key: 'rights', label: 'Rights', icon: '⚖️' },
  { key: 'more', label: 'More', icon: '⊞' },
];

/** Temporary notice shown for tabs the hosting screen does not handle. */
export const showAdminShellPreviewNotice = (): void => {
  Alert.alert(
    'Preview shell',
    'Global navigation is owned by the app-level architecture. This bar is a temporary visual preview only.',
  );
};

interface AdminShellTabBarProps {
  /** Active tab key. Defaults to 'events' (the original shell behavior). */
  activeTab?: AdminShellTabKey;
  /**
   * Called instead of the preview notice when a tab is pressed. When omitted,
   * every tab press shows the preview notice (original behavior).
   */
  onTabPress?: (tab: AdminShellTabKey) => void;
}

export const AdminShellTabBar: React.FC<AdminShellTabBarProps> = ({
  activeTab = 'events',
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, Spacing.xs) }]}
      accessibilityRole="tablist"
    >
      {SHELL_TABS.map(tab => {
        const isActive = tab.key === activeTab;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => (onTabPress ? onTabPress(tab.key) : showAdminShellPreviewNotice())}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} tab`}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text
              style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: AdminColors.cardSurface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AdminColors.border,
    paddingTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: Spacing.xs,
    marginHorizontal: 1,
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: AdminColors.primaryLight,
  },
  tabIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  tabIconActive: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 7.5,
    lineHeight: 9,
    color: AdminColors.textSecondary,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: AdminColors.primary,
    fontWeight: '600',
  },
});
