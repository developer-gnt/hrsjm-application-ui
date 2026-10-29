import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, FontFamilies, Spacing } from '../../../../core';
import { usersStore } from '../services/usersStore';
import { UserItem } from '../types/user.types';

interface UserPasswordResetModalProps {
  visible: boolean;
  user: UserItem | null;
  onClose: () => void;
}

const generateRandomPassword = (): string => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Hrsjm@${rand}`;
};

export const UserPasswordResetModal: React.FC<UserPasswordResetModalProps> = ({
  visible,
  user,
  onClose,
}) => {
  const inputRef = useRef<any>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleGenerate = () => {
    const generated = generateRandomPassword();
    setPassword(generated);
    setShowPassword(true);
    setErrorMessage(null);
  };

  const handleResetSubmit = async () => {
    const trimmed = password.trim();
    if (!trimmed || trimmed.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await usersStore.resetPassword(user.id, trimmed);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMessage(res.message || 'Failed to update user password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(password.trim());
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    setPassword('');
    setShowPassword(false);
    setIsSubmitting(false);
    setErrorMessage(null);
    setSuccess(false);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDone}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdropTouch}
          onPress={handleDone}
          activeOpacity={1}
          accessibilityLabel="Close overlay"
        />
        <View style={styles.card}>
          <View
            style={[
              styles.iconCircle,
              success && styles.iconCircleSuccess,
            ]}
          >
            <Text style={styles.icon}>{success ? '✓' : '🔑'}</Text>
          </View>

          <Text style={styles.title}>
            {success ? 'Password Updated!' : 'Reset User Password'}
          </Text>

          {/* Target User Summary Pill */}
          <View style={styles.userSummaryBox}>
            <Text style={styles.userSummaryName}>{user.name}</Text>
            <Text style={styles.userSummaryMeta}>
              {user.email || user.phone}
            </Text>
          </View>

          {success ? (
            <>
              <Text style={styles.message}>
                The new password has been securely saved to the database.
                Existing sessions have been revoked. The user can now log in
                with the credentials below:
              </Text>

              {/* Password Display Box with Copy Button */}
              <View style={styles.passwordDisplayCard}>
                <Text style={styles.passwordLabel}>NEW LOGIN PASSWORD</Text>
                <View style={styles.passwordDisplayRow}>
                  <Text style={styles.passwordText}>{password}</Text>
                  <TouchableOpacity
                    style={[styles.copyBtn, copied && styles.copyBtnCopied]}
                    onPress={handleCopy}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Copy password to clipboard"
                  >
                    <Text
                      style={[
                        styles.copyBtnText,
                        copied && styles.copyBtnTextCopied,
                      ]}
                    >
                      {copied ? '✓ Copied' : '📋 Copy'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={handleDone}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.message}>
                Enter a new password or generate a secure one. This will
                immediately overwrite their existing password in the system.
              </Text>

              {/* Error Notification */}
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
                </View>
              ) : null}

              {/* Password Input Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TouchableOpacity
                  style={styles.inputRow}
                  activeOpacity={1}
                  onPress={() => inputRef.current?.focus()}
                >
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Enter at least 6 characters"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSubmitting}
                  />
                  <TouchableOpacity
                    style={styles.toggleVisibilityBtn}
                    onPress={() => setShowPassword(prev => !prev)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Text style={styles.toggleVisibilityIcon}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              {/* Generate Password Helper */}
              <TouchableOpacity
                style={styles.generateBtn}
                onPress={handleGenerate}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Generate strong password"
                disabled={isSubmitting}
              >
                <Text style={styles.generateBtnText}>🎲 Generate Strong Password</Text>
              </TouchableOpacity>

              {/* Button Actions */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleDone}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel password reset"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    (password.trim().length < 6 || isSubmitting) && styles.actionBtnDisabled,
                  ]}
                  onPress={handleResetSubmit}
                  activeOpacity={0.8}
                  disabled={password.trim().length < 6 || isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Set New Password"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#011F39" />
                  ) : (
                    <Text
                      style={[
                        styles.actionBtnText,
                        (password.trim().length < 6 || isSubmitting) && styles.actionBtnTextDisabled,
                      ]}
                    >
                      Set Password
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 31, 57, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.base,
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.full,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  iconCircleSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  icon: {
    fontSize: 24,
    color: '#059669',
    fontWeight: '700',
  },
  title: {
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    fontWeight: '700',
    color: '#06294D',
    textAlign: 'center',
    marginBottom: 8,
  },
  userSummaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  userSummaryName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  userSummaryMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  message: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.base,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.md,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 46,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  toggleVisibilityBtn: {
    padding: 6,
  },
  toggleVisibilityIcon: {
    fontSize: 16,
  },
  generateBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#FAD465',
    marginBottom: Spacing.base,
  },
  generateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8F6600',
  },
  passwordDisplayCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: Spacing.lg,
  },
  passwordLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  passwordDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  passwordText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  copyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#E2E8F0',
  },
  copyBtnCopied: {
    backgroundColor: '#ECFDF5',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  copyBtnTextCopied: {
    color: '#059669',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: '#DBE5EE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  actionBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAD465',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#011F39',
  },
  actionBtnTextDisabled: {
    color: '#94A3B8',
  },
  doneBtn: {
    width: '100%',
    height: 44,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAD465',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#011F39',
  },
});
