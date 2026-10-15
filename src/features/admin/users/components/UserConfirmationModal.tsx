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
import { UserItem } from '../types/user.types';

interface UserConfirmationModalProps {
  visible: boolean;
  user: UserItem | null;
  action: 'block' | 'unblock' | 'delete' | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UserConfirmationModal: React.FC<UserConfirmationModalProps> = ({
  visible,
  user,
  action,
  onConfirm,
  onCancel,
}) => {
  if (!user || !action) return null;

  const isBlock = action === 'block';
  const isDelete = action === 'delete';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View
                style={[
                  styles.iconCircle,
                  isBlock || isDelete ? styles.iconCircleRed : styles.iconCircleGreen,
                ]}
              >
                <Text style={styles.icon}>{isDelete ? '🗑️' : isBlock ? '🚫' : '🔓'}</Text>
              </View>

              <Text style={styles.title}>
                {isDelete
                  ? 'Delete User Account?'
                  : isBlock
                  ? 'Block User Account?'
                  : 'Unblock User Account?'}
              </Text>

              <Text style={styles.message}>
                {isDelete
                  ? `Are you sure you want to permanently delete ${user.name}? This action cannot be undone and will remove their record from the system.`
                  : isBlock
                  ? `Are you sure you want to block ${user.name}? This will suspend their access to the HRSJM mobile application.`
                  : `Are you sure you want to restore access for ${user.name}? They will be able to log in again.`}
              </Text>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onCancel}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel action"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    isBlock || isDelete ? styles.confirmBtnRed : styles.confirmBtnGreen,
                  ]}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isDelete
                      ? 'Confirm Delete User'
                      : isBlock
                      ? 'Confirm Block User'
                      : 'Confirm Unblock User'
                  }
                >
                  <Text style={styles.confirmBtnText}>
                    {isDelete
                      ? 'Yes, Delete User'
                      : isBlock
                      ? 'Yes, Block User'
                      : 'Yes, Unblock User'}
                  </Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.base,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  iconCircleRed: {
    backgroundColor: '#FEE2E2',
  },
  iconCircleGreen: {
    backgroundColor: '#DCFCE7',
  },
  icon: {
    fontSize: 26,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2860',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.base,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnRed: {
    backgroundColor: '#DC2626',
  },
  confirmBtnGreen: {
    backgroundColor: '#16A34A',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
