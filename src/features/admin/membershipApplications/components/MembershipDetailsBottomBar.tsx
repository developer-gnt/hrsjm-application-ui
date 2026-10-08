import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { ApplicationStatus } from '../types/membershipApplications.types';

interface MembershipDetailsBottomBarProps {
  bottomInset: number;
  status: ApplicationStatus;
  underReviewActive?: boolean;
  onBack: () => void;
  onUnderReviewPress?: () => void;
  onApprovePress?: () => void;
  onRejectPress?: () => void;
}

export const MembershipDetailsBottomBar: React.FC<MembershipDetailsBottomBarProps> = ({
  bottomInset,
  status,
  underReviewActive = false,
  onBack,
  onUnderReviewPress,
  onApprovePress,
  onRejectPress,
}) => {
  // Case 1: Status is Under Review and user clicked Under Review -> Show 2 rows
  if (status === 'under_review' && underReviewActive) {
    return (
      <View style={[styles.container, styles.twoRowContainer, { paddingBottom: Math.max(bottomInset, Spacing.sm) }]}>
        {/* Row 1: Reject (50%) & Approve (50%) */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.halfButton, styles.rejectButton]}
            onPress={onRejectPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Reject Application"
          >
            <Text style={styles.actionButtonText}>✕ Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.halfButton, styles.approveButton]}
            onPress={onApprovePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Approve Application"
          >
            <Text style={styles.actionButtonText}>✓ Approve</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Back Button (100% width) */}
        <TouchableOpacity
          style={styles.fullBackButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back to list"
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Case 2: Status is Approved
  if (status === 'approved') {
    return (
      <View style={[styles.container, { paddingBottom: Math.max(bottomInset, Spacing.sm) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back to list"
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={[styles.statusButton, styles.statusButtonApproved]}>
          <Text style={styles.statusDocIconLight}>📄</Text>
          <Text style={styles.statusTextApproved}>Approved</Text>
        </View>
      </View>
    );
  }

  // Case 3: Status is Rejected
  if (status === 'rejected') {
    return (
      <View style={[styles.container, { paddingBottom: Math.max(bottomInset, Spacing.sm) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back to list"
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={[styles.statusButton, styles.statusButtonRejected]}>
          <Text style={styles.statusDocIconLight}>📄</Text>
          <Text style={styles.statusTextRejected}>Rejected</Text>
        </View>
      </View>
    );
  }

  // Case 4: Status is Under Review (Initial state before clicking Under Review)
  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottomInset, Spacing.sm) }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back to list"
      >
        <Text style={styles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.statusButton, styles.statusButtonUnderReview]}
        onPress={onUnderReviewPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Under Review Action"
      >
        <Text style={styles.statusDocIconLight}>📄</Text>
        <Text style={styles.statusTextUnderReview}>Under Review</Text>
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
    paddingTop: 10,
    paddingHorizontal: Spacing.base,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  twoRowContainer: {
    flexDirection: 'column',
    gap: 8,
    paddingTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  halfButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fullBackButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E5F8',
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E5F8',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
  },
  statusButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  statusButtonUnderReview: {
    backgroundColor: '#F59E0B',
  },
  statusButtonApproved: {
    backgroundColor: '#10B981',
  },
  statusButtonRejected: {
    backgroundColor: '#EF4444',
  },
  statusDocIconLight: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  statusTextUnderReview: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
  },
  statusTextApproved: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusTextRejected: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
