import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';
import type { EventFilterTab, EventStatusFilter } from '../types/events.types';

interface EventFiltersProps {
  tabs: EventFilterTab[];
  activeTab: EventStatusFilter;
  onTabChange: (tab: EventStatusFilter) => void;
  /**
   * TEMPORARY: local category filter panel.
   * Replace with the shared AdminFilterSheet component (Aman) once it is
   * available, and swap the local categories for backend-supported filters.
   */
  expanded?: boolean;
  categories?: string[];
  activeCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
}

const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    accessibilityLabel={`Filter by category: ${label}`}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const EventFilters: React.FC<EventFiltersProps> = ({
  tabs,
  activeTab,
  onTabChange,
  expanded = false,
  categories,
  activeCategory = null,
  onCategoryChange,
}) => {
  return (
    <View>
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
              accessibilityLabel={`${tab.label} events, ${tab.count}`}
            >
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
                numberOfLines={1}
              >
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {expanded && categories && categories.length > 0 ? (
        <View style={styles.categoryPanel}>
          <Text style={styles.categoryPanelTitle}>Category</Text>
          <View style={styles.chipWrap}>
            <FilterChip
              label="All Categories"
              active={activeCategory === null}
              onPress={() => onCategoryChange?.(null)}
            />
            {categories.map(category => (
              <FilterChip
                key={category}
                label={category}
                active={activeCategory === category}
                onPress={() => onCategoryChange?.(category)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
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
    backgroundColor: AdminColors.divider,
  },
  tabActive: {
    backgroundColor: AdminColors.primary,
  },
  tabText: {
    ...Typography.secondaryMedium,
    color: AdminColors.textSecondary,
  },
  tabTextActive: {
    color: AdminColors.textOnDark,
  },
  categoryPanel: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  categoryPanelTitle: {
    ...Typography.secondaryMedium,
    color: AdminColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.background,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  chipActive: {
    backgroundColor: AdminColors.primaryLight,
    borderColor: AdminColors.primary,
  },
  chipText: {
    ...Typography.secondaryMedium,
    color: AdminColors.textSecondary,
  },
  chipTextActive: {
    color: AdminColors.primary,
  },
});