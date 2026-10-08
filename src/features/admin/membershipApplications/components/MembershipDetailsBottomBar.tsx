import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';

interface MembershipDetailsBottomBarProps {
  bottomInset: number;
  onBack: () => void;
  onStatusPress?: () => void;
  statusLabel?: string;
}

export const MembershipDetailsBottomBar: React.FC<MembershipDetailsBottomBarProps> = ({
  bottomInset,
  onBack,
  onStatusPress,
}) => {
  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottomInset, Spacing.sm) }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back to list"
      >
        <Text style={styles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>

      {/* Application Status Action Button */}
      <TouchableOpacity
        style={styles.statusButton}
        onPress={onStatusPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Application Status"
      >
        <Text style={styles.statusButtonText}>Application Status</Text>
        <Text style={styles.statusChevron}>▴</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    paddingHorizontal: Spacing.base,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  statusButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#0F2860',
    gap: 8,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusChevron: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '800',
  },
});
