import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';
import type { BlogFilterTab, BlogStatusFilter } from '../types/blog.types';

interface BlogStatusTabsProps {
  tabs: BlogFilterTab[];
  activeTab: BlogStatusFilter;
  onTabChange: (tab: BlogStatusFilter) => void;
}

/**
 * Status tab pills above the blog rows (All / Published / Drafts / Archived).
 * Same pill language as the News/Events status tabs; counts are demo values.
 */
export const BlogStatusTabs: React.FC<BlogStatusTabsProps> = ({
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
            accessibilityLabel={`${tab.label} blogs, ${tab.count}`}
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AdminColors.border,
  },
  tabActive: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  tabText: {
    ...Typography.badge,
    color: AdminColors.textSecondary,
  },
  tabTextActive: {
    color: AdminColors.textOnDark,
  },
});
