import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, FontFamilies } from '../../../../core';
import { UserStats, UserTypeTabKey } from '../types/user.types';

interface UsersTypeTabsProps {
  activeTab: UserTypeTabKey;
  onSelectTab: (tab: UserTypeTabKey) => void;
  stats: UserStats;
}

interface TabDef {
  key: UserTypeTabKey;
  label: string;
  getCount: (stats: UserStats) => number;
}

const TABS: TabDef[] = [
  { key: 'all', label: 'All Users', getCount: s => s.total },
  { key: 'admin', label: 'Admins', getCount: s => s.adminsCount || 0 },
  { key: 'member', label: 'Members', getCount: s => s.membersCount },
  { key: 'donor', label: 'Donors', getCount: s => s.donorsCount },
  { key: 'seeker', label: 'Donation Seekers', getCount: s => s.seekersCount },
  { key: 'general', label: 'Users', getCount: s => s.generalCount },
];

export const UsersTypeTabs: React.FC<UsersTypeTabsProps> = ({
  activeTab,
  onSelectTab,
  stats,
}) => {
  const renderTab = (tab: TabDef) => {
    const isActive = activeTab === tab.key;
    const count = tab.getCount(stats);
    const formattedCount = count.toLocaleString();

    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.chip,
          isActive ? styles.chipActive : styles.chipInactive,
        ]}
        onPress={() => onSelectTab(tab.key)}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={`${tab.label} (${formattedCount})`}
      >
        <Text
          style={[
            styles.chipText,
            isActive ? styles.chipTextActive : styles.chipTextInactive,
          ]}
          numberOfLines={1}
        >
          {`${tab.label} (${formattedCount})`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        accessibilityRole="tablist"
      >
        {TABS.map(renderTab)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#06294D',
  },
  chipInactive: {
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#DBE5EE',
  },
  chipText: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#06294D',
  },
});
