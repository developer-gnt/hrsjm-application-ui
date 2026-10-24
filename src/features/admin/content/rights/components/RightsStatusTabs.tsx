import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';
import type { RightsFilterTab, RightsStatusFilter } from '../types/rights.types';

interface RightsStatusTabsProps {
  tabs: RightsFilterTab[];
  activeTab: RightsStatusFilter;
  onTabChange: (tab: RightsStatusFilter) => void;
}

export const RightsStatusTabs: React.FC<RightsStatusTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsRow}
    >
      {tabs.map(tab => {
        const isActive = tab.key === activeTab;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} articles, ${tab.count}`}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]} numberOfLines={1}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
  },
  tabActive: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#06294D',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
