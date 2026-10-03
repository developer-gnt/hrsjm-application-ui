import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export interface AdminFilterTab<T = string> {
  key: T;
  label: string;
  /** Optional count rendered as a badge inside the chip. */
  count?: number;
}

export interface AdminFilterTabsProps<T = string> {
  tabs: AdminFilterTab<T>[];
  activeKey: T;
  onChange?: (key: T) => void;
  onSelect?: (key: T) => void;
}

/** Horizontal status/filter chip row (spec §10 AdminFilterTabs). */
export const AdminFilterTabs = <T extends string = string>({
  tabs,
  activeKey,
  onChange,
  onSelect,
}: AdminFilterTabsProps<T>) => {
  const handlePress = (key: T) => {
    if (onChange) onChange(key);
    if (onSelect) onSelect(key);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {tabs.map(tab => {
        const active = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={String(tab.key)}
            onPress={() => handlePress(tab.key)}
            activeOpacity={0.7}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
          >
          <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
            {tab.label}
          </Text>
          {tab.count !== undefined ? (
            <View
              style={[styles.countPill, active ? styles.countPillActive : styles.countPillInactive]}
            >
              <Text
                style={[
                  styles.countText,
                  active ? styles.countTextActive : styles.countTextInactive,
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
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.2,
  },
  chipActive: {
    backgroundColor: '#123B7A',
    borderColor: '#123B7A',
    shadowColor: '#123B7A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 13,
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  labelInactive: {
    color: '#334155',
    fontWeight: '600',
  },
  countPill: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countPillInactive: {
    backgroundColor: '#F1F5F9',
  },
  countText: {
    fontSize: 11,
  },
  countTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countTextInactive: {
    color: '#64748B',
    fontWeight: '700',
  },
});

export default AdminFilterTabs;