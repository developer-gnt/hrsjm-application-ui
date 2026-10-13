import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography, Shadows } from '../../../../core';
import { AppButton } from '../../../../core/components/common/AppButton';
import { Lock, Eye, EyeOff, X, AlertCircle, CheckCircle2 } from '../../../../core/components/icons';
import { authService } from '../../../auth/services/auth.service';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrorMessage(null);
  };

  const handleClose = () => {
    if (isLoading) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('New password cannot be the same as your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      resetForm();
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to change password. Please check your current password.';
      setErrorMessage(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.lockBadge}>
                <Lock size={18} color={AdminColors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Change Password</Text>
                <Text style={styles.subtitle}>
                  Update your account password securely.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <X size={18} color={AdminColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            {/* Error banner */}
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color={AdminColors.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Current Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor={AdminColors.textMuted}
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={txt => {
                    setCurrentPassword(txt);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  accessibilityRole="button"
                  accessibilityLabel={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} color={AdminColors.textSecondary} />
                  ) : (
                    <Eye size={18} color={AdminColors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="At least 8 characters"
                  placeholderTextColor={AdminColors.textMuted}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={txt => {
                    setNewPassword(txt);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  accessibilityRole="button"
                  accessibilityLabel={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? (
                    <EyeOff size={18} color={AdminColors.textSecondary} />
                  ) : (
                    <Eye size={18} color={AdminColors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>
                Must be at least 8 characters long and different from current password.
              </Text>
            </View>

            {/* Confirm New Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter new password"
                  placeholderTextColor={AdminColors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={txt => {
                    setConfirmPassword(txt);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} color={AdminColors.textSecondary} />
                  ) : (
                    <Eye size={18} color={AdminColors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <AppButton
              title="Cancel"
              variant="outline"
              size="sm"
              onPress={handleClose}
              disabled={isLoading}
              style={styles.cancelBtn}
            />
            <AppButton
              title={isLoading ? 'Updating...' : 'Update Password'}
              variant="primary"
              size="sm"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  lockBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: AdminColors.textPrimary,
  },
  subtitle: {
    ...Typography.secondary,
    fontSize: 12,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  body: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: AdminColors.errorLight || '#FEE2E2',
    borderWidth: 1,
    borderColor: AdminColors.error,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    ...Typography.secondary,
    color: AdminColors.error,
    fontSize: 12,
    flex: 1,
  },
  field: {
    gap: 6,
  },
  label: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: AdminColors.textPrimary,
  },
  hint: {
    ...Typography.secondary,
    fontSize: 11,
    color: AdminColors.textMuted,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.background,
    paddingHorizontal: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 42,
    ...Typography.body,
    fontSize: 14,
    color: AdminColors.textPrimary,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AdminColors.border,
    backgroundColor: AdminColors.background,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 1.5,
  },
});
