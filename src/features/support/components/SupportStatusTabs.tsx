import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import { StatusTabKey, TicketStatsData } from '../types/ticket.types';

interface SupportStatusTabsProps {
  activeTab: StatusTabKey;
  onTabChange: (tab: StatusTabKey) => void;
  stats: TicketStatsData;
}

export const SupportStatusTabs: React.FC<SupportStatusTabsProps> = ({
  activeTab,
  onTabChange,
  stats,
}) => {
  const tabs: { key: StatusTabKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'open', label: 'Open', count: stats.open },
    { key: 'in_progress', label: 'In Progress', count: stats.inProgress },
    { key: 'resolved', label: 'Resolved', count: stats.resolved },
    { key: 'closed', label: 'Closed', count: stats.closed },
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
              style={[
                styles.pill,
                isActive ? styles.pillActive : styles.pillInactive,
              ]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} tickets (${tab.count})`}
            >
              <Text
                style={[
                  styles.pillText,
                  isActive ? styles.pillTextActive : styles.pillTextInactive,
                ]}
              >
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
    marginBottom: Spacing.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: Spacing.base,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
    borderWidth: 1,
  },
  pillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillTextInactive: {
    color: '#475569',
  },
});
