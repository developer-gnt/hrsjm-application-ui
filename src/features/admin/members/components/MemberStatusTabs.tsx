import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BrandColors } from '../../../../core/theme/colors';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { PressableScale } from '../../../../core/components/common/PressableScale';
import { MemberFilterTab } from '../types';
import { TabCount } from '../hooks/useMembers';
import { formatCount } from '../utils/members.utils';

interface MemberStatusTabsProps {
  tabs: TabCount[];
  activeTab: MemberFilterTab;
  onSelectTab: (tab: MemberFilterTab) => void;
}

/** Horizontally scrollable status filter pills with counts. */
export const MemberStatusTabs: React.FC<MemberStatusTabsProps> = ({
  tabs,
  activeTab,
  onSelectTab,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      accessibilityRole="tablist"
    >
      {tabs.map(({ tab, label, count }) => {
        const isSelected = tab === activeTab;
        return (
          <PressableScale
            key={tab}
            onPress={() => onSelectTab(tab)}
            scaleTo={0.95}
            accessibilityRole="tab"
            accessibilityLabel={`${label}, ${count} members`}
            accessibilityState={{ selected: isSelected }}
            testID={`members-tab-${tab.toLowerCase()}`}
            style={[styles.tab, isSelected ? styles.tabSelected : styles.tabUnselected]}
          >
            <Text
              style={[styles.tabText, isSelected ? styles.tabTextSelected : styles.tabTextUnselected]}
              numberOfLines={1}
            >
              {label} ({formatCount(count)})
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: Spacing.sm,
    paddingRight: Spacing.base,
  },
  tab: {
    minHeight: 38,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: BrandColors.navy,
  },
  tabUnselected: {
    backgroundColor: BrandColors.softBlue,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  tabTextSelected: {
    color: BrandColors.surface,
    fontWeight: '600',
  },
  tabTextUnselected: {
    color: BrandColors.navy,
  },
});

export default MemberStatusTabs;
