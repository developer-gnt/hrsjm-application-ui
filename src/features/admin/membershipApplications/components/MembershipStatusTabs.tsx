import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { ApplicationStatus, ApplicationStatsData } from '../types/membershipApplications.types';

export type StatusTabKey = 'all' | ApplicationStatus;

interface MembershipStatusTabsProps {
  activeTab: StatusTabKey;
  onSelectTab: (tab: StatusTabKey) => void;
  stats: ApplicationStatsData;
}

export const MembershipStatusTabs: React.FC<MembershipStatusTabsProps> = ({
  activeTab,
  onSelectTab,
  stats,
}) => {
  const tabs: { key: StatusTabKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'under_review', label: 'Under Review', count: stats.underReview },
    { key: 'approved', label: 'Approved', count: stats.approved },
    { key: 'rejected', label: 'Rejected', count: stats.rejected },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#0F2860',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
});
