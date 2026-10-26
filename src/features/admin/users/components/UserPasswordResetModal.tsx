import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BorderRadius, FontFamilies, Spacing } from '../../../../core';
import { UserItem } from '../types/user.types';

interface UserPasswordResetModalProps {
  visible: boolean;
  user: UserItem | null;
  onClose: () => void;
}

export const UserPasswordResetModal: React.FC<UserPasswordResetModalProps> = ({
  visible,
  user,
  onClose,
}) => {
  const [sent, setSent] = useState(false);

  if (!user) return null;

  const handleSendLink = () => {
    setSent(true);
  };

  const handleDone = () => {
    setSent(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDone}
    >
      <TouchableWithoutFeedback onPress={handleDone}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>{sent ? '✉️' : '🔑'}</Text>
              </View>

              <Text style={styles.title}>Reset Password</Text>

              {sent ? (
                <>
                  <Text style={styles.message}>
                    A secure password reset link has been dispatched to{' '}
                    <Text style={styles.boldText}>{user.email}</Text>. The user
                    can follow the instructions in the email to set a new password.
                  </Text>
                  <View style={styles.noticeBox}>
                    <Text style={styles.noticeText}>
                      Notice: This operates in simulation mode as the backend email
                      service is not configured in this demo environment.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={handleDone}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Close reset confirmation"
                  >
                    <Text style={styles.doneBtnText}>Close</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.message}>
                    Initiate a password reset for{' '}
                    <Text style={styles.boldText}>{user.name}</Text> (
                    {user.email}). A temporary recovery link will be sent to their
                    registered email.
                  </Text>
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={handleDone}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel reset modal"
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={handleSendLink}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel="Send Password Reset Link"
                    >
                      <Text style={styles.actionBtnText}>Send Reset Link</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
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
    backgroundColor: 'rgba(1, 31, 57, 0.5)',
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
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 26,
  },
  title: {
    fontFamily: FontFamilies.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#06294D',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.base,
  },
  boldText: {
    fontFamily: FontFamilies.sans,
    fontWeight: '700',
    color: '#0B2F52',
  },
  noticeBox: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FAD465',
    borderRadius: BorderRadius.button,
    padding: 10,
    marginBottom: Spacing.base,
    width: '100%',
  },
  noticeText: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    color: '#8F6600',
    lineHeight: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 12,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: '#DBE5EE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF2F7',
  },
  cancelBtnText: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 12,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06294D',
  },
  actionBtnText: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doneBtn: {
    width: '100%',
    minHeight: 44,
    paddingVertical: 12,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06294D',
  },
  doneBtnText: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
