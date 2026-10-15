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

export type ConfirmationType = 'approve' | 'reject';

interface MembershipStatusConfirmationModalProps {
  visible: boolean;
  type: ConfirmationType | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const MembershipStatusConfirmationModal: React.FC<MembershipStatusConfirmationModalProps> = ({
  visible,
  type,
  onClose,
  onConfirm,
}) => {
  if (!visible || !type) return null;

  const isApprove = type === 'approve';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Close Button Top Right */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Close confirmation popup"
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>

              {/* Icon Circle */}
              <View style={[styles.iconCircle, isApprove ? styles.iconCircleApprove : styles.iconCircleReject]}>
                <Text style={[styles.iconSymbol, isApprove ? styles.iconSymbolApprove : styles.iconSymbolReject]}>
                  {isApprove ? '✓' : '✕'}
                </Text>
              </View>

              {/* Heading */}
              <Text style={styles.heading}>
                {isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
              </Text>

              {/* Message */}
              <Text style={styles.message}>
                {isApprove
                  ? 'After approving the status you cannot change the status. Are you sure you want to approve this application?'
                  : 'After rejecting the status you cannot change the status. Are you sure you want to reject this application?'}
              </Text>

              {/* Buttons Row */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel status change"
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.okButton, isApprove ? styles.okButtonApprove : styles.okButtonReject]}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
                >
                  <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconCircleApprove: {
    backgroundColor: '#DCFCE7',
  },
  iconCircleReject: {
    backgroundColor: '#FEE2E2',
  },
  iconSymbol: {
    fontSize: 28,
    fontWeight: '800',
  },
  iconSymbolApprove: {
    color: '#10B981',
  },
  iconSymbolReject: {
    color: '#EF4444',
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E5F8',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
  },
  okButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonApprove: {
    backgroundColor: '#10B981',
  },
  okButtonReject: {
    backgroundColor: '#EF4444',
  },
  okButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
