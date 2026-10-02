import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export interface AdminFilterTab {
  key: string;
  label: string;
  /** Optional count rendered as a badge inside the chip. */
  count?: number;
}

interface AdminFilterTabsProps {
  tabs: AdminFilterTab[];
  activeKey: string;
  onChange: (key: string) => void;
}

/** Horizontal status/filter chip row (spec §10 AdminFilterTabs). */
export const AdminFilterTabs: React.FC<AdminFilterTabsProps> = ({
  tabs,
  activeKey,
  onChange,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row}
  >
    {tabs.map(tab => {
      const active = tab.key === activeKey;
      return (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onChange(tab.key)}
          activeOpacity={0.8}
          style={[styles.chip, active ? styles.chipActive : null]}
        >
          <Text style={[styles.label, active ? styles.labelActive : null]}>
            {tab.label}
          </Text>
          {tab.count !== undefined ? (
            <View
              style={[styles.countPill, active ? styles.countPillActive : null]}
            >
              <Text
                style={[
                  styles.countText,
                  active ? styles.countTextActive : null,
                ]}
              >
                {tab.count}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
  },
  chipActive: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  label: {
    ...Typography.secondaryMedium,
    color: AdminColors.textSecondary,
  },
  labelActive: {
    color: AdminColors.textOnDark,
  },
  countPill: {
    backgroundColor: AdminColors.background,
    borderRadius: 999,
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignItems: 'center',
  },
  countPillActive: {
    backgroundColor: AdminColors.accentGold,
  },
  countText: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  countTextActive: {
    color: AdminColors.textOnDark,
  },
});