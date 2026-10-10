import React from 'react';
import { Alert } from 'react-native';
import { HomeTabBar } from './HomeTabBar';
import { MEMBER_TABS } from '../data/home-preview-data';
import type { HomeTab } from '../types/home.types';

/**
 * TEMPORARY preview behavior: the real user navigation architecture is owned
 * by the app-level phase. Non-home tabs show a preview notice, mirroring the
 * Admin shell tab-bar convention. Replace when real navigation lands.
 */
const showTabPreviewNotice = (tab: HomeTab) => {
  Alert.alert(
    'Preview navigation',
    `"${tab.label}" is part of the user app navigation arriving in an upcoming phase. This bar is a visual preview only.`,
  );
};

/** Member bottom navigation: Home · Complaints · Donate · Events · Profile. */
export const MemberBottomNavigation: React.FC = () => (
  <HomeTabBar
    tabs={MEMBER_TABS}
    activeTab="home"
    onTabPress={tab => {
      if (tab.id !== 'home') {
        showTabPreviewNotice(tab);
      }
    }}
  />
);
