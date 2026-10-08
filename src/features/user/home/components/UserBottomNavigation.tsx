import React from 'react';
import { Alert } from 'react-native';
import { HomeTabBar } from './HomeTabBar';
import { USER_TABS } from '../data/home-preview-data';
import type { HomeTab, HomeTabId } from '../types/home.types';

/** Tabs whose User screens are wired into the host navigation. */
const LIVE_TABS: HomeTabId[] = ['home', 'about', 'contact', 'rights', 'events', 'news'];

interface UserBottomNavigationProps {
  /** Currently selected tab id for the hosting screen. */
  activeTab: HomeTabId;
  /**
   * Called for live tabs when tapped. Hosts wire these to their routes.
   */
  onTabPress?: (tab: HomeTab) => void;
}

/**
 * THE shared User App bottom navigation — six tabs (Home · About · Rights ·
 * Events · News · Contact) rendered through HomeTabBar with the single
 * USER_TABS configuration. The active tab is gold; the rest are navy/dark.
 * Used identically on every User screen (Home, Contact, upcoming pages).
 */
export const UserBottomNavigation: React.FC<UserBottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => (
  <HomeTabBar
    tabs={USER_TABS}
    activeTab={activeTab}
    onTabPress={tab => {
      if (tab.id === activeTab) {
        // Re-selecting the current tab is a harmless no-op.
        return;
      }
      if (LIVE_TABS.includes(tab.id)) {
        onTabPress?.(tab);
        return;
      }
      Alert.alert(
        'Preview navigation',
        `"${tab.label}" is part of the user app navigation arriving in an upcoming phase. This bar is a visual preview only.`,
      );
    }}
  />
);
