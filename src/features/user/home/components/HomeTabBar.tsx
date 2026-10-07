import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { HomeTab, HomeTabId } from '../types/home.types';

interface HomeTabBarProps {
  tabs: HomeTab[];
  activeTab: HomeTabId;
  onTabPress?: (tab: HomeTab) => void;
}

/**
 * Shared bottom navigation for the user Home (reference-locked): white bar,
 * gold active tab with the filled house mark, navy-gray inactive tabs.
 * The bottom safe-area inset is applied here, mirroring the Admin shell
 * tab-bar pattern.
 */
export const HomeTabBar: React.FC<HomeTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        { paddingBottom: Math.max(insets.bottom, Spacing.xs) },
      ]}
      accessibilityRole="tablist"
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress?.(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} tab`}
          >
            <AppIcon
              name={tab.icon}
              size={22}
              color={isActive ? AdminColors.accentGold : AdminColors.textSecondary}
              filled={isActive && tab.icon === 'home'}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
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
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
    lineHeight: 13,
    marginTop: 3,
    color: AdminColors.textSecondary,
  },
  labelActive: {
    color: AdminColors.accentGold,
    fontWeight: '700',
  },
});
