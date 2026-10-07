import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { ApplicationStatus } from '../types/membershipApplications.types';

interface StatusOptionItem {
  key: ApplicationStatus;
  label: string;
  subtitle: string;
  icon: string;
  bgStyle: any;
  iconCircleStyle: any;
  textColor: string;
  borderColor: string;
}

interface MembershipStatusDropUpModalProps {
  visible: boolean;
  currentStatus: ApplicationStatus;
  onClose: () => void;
  onSelectStatus: (status: ApplicationStatus) => void;
}

const STATUS_OPTIONS: StatusOptionItem[] = [
  {
    key: 'under_review',
    label: 'Under Review',
    subtitle: 'Queue application for document & background check',
    icon: '🕒',
    bgStyle: { backgroundColor: '#FFF9ED' },
    iconCircleStyle: { backgroundColor: '#D97706' },
    textColor: '#B45309',
    borderColor: '#FEEFD6',
  },
  {
    key: 'approved',
    label: 'Approved',
    subtitle: 'Verify applicant credentials and grant membership',
    icon: '✓',
    bgStyle: { backgroundColor: '#EEFAF4' },
    iconCircleStyle: { backgroundColor: '#10B981' },
    textColor: '#15803D',
    borderColor: '#DCF5E8',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    subtitle: 'Reject application and notify applicant',
    icon: '✕',
    bgStyle: { backgroundColor: '#FEF2F2' },
    iconCircleStyle: { backgroundColor: '#EF4444' },
    textColor: '#DC2626',
    borderColor: '#FDE4E4',
  },
];

export const MembershipStatusDropUpModal: React.FC<MembershipStatusDropUpModalProps> = ({
  visible,
  currentStatus,
  onClose,
  onSelectStatus,
}) => {
  const handleSelect = (status: ApplicationStatus) => {
    onSelectStatus(status);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Handle Bar */}
              <View style={styles.handleContainer}>
                <View style={styles.handleBar} />
              </View>

              {/* Title Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Update Application Status</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                  accessibilityLabel="Close status drop-up"
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Status Options */}
              <View style={styles.optionsList}>
                {STATUS_OPTIONS.map(opt => {
                  const isCurrent = currentStatus === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.optionCard,
                        opt.bgStyle,
                        { borderColor: isCurrent ? opt.textColor : opt.borderColor },
                        isCurrent && styles.optionCardActive,
                      ]}
                      onPress={() => handleSelect(opt.key)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Set status to ${opt.label}`}
                    >
                      <View style={[styles.iconCircle, opt.iconCircleStyle]}>
                        <Text style={styles.iconSymbol}>{opt.icon}</Text>
                      </View>

                      <View style={styles.optionDetails}>
                        <View style={styles.labelRow}>
                          <Text style={[styles.optionLabel, { color: opt.textColor }]}>
                            {opt.label}
                          </Text>
                          {isCurrent ? (
                            <View style={[styles.currentBadge, { backgroundColor: opt.textColor }]}>
                              <Text style={styles.currentBadgeText}>Current</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                      </View>

                      <Text style={[styles.actionChevron, { color: opt.textColor }]}>›</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  optionsList: {
    gap: 12,
    marginVertical: Spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: 12,
  },
  optionCardActive: {
    borderWidth: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSymbol: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  optionDetails: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  currentBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.sm,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actionChevron: {
    fontSize: 22,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: Spacing.sm,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
