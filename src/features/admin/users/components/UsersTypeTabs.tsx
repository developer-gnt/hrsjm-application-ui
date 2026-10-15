import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const ROW_1_TABS: TabDef[] = [
  { key: 'all', label: 'All Users', getCount: s => s.total },
  { key: 'member', label: 'Members', getCount: s => s.membersCount },
  { key: 'seeker', label: 'Donation Seekers', getCount: s => s.seekersCount },
];

const ROW_2_TABS: TabDef[] = [
  { key: 'donor', label: 'Donors', getCount: s => s.donorsCount },
  { key: 'general', label: 'General Users', getCount: s => s.generalCount },
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
      {/* Row 1 matching Reference Image: All Users, Members, Donation Seekers */}
      <View style={styles.row}>
        {ROW_1_TABS.map(renderTab)}
      </View>

      {/* Row 2 matching Reference Image: Donors, General Users */}
      <View style={styles.row}>
        {ROW_2_TABS.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#0F2860',
  },
  chipInactive: {
    backgroundColor: '#EFF6FF',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#1E40AF',
  },
});
