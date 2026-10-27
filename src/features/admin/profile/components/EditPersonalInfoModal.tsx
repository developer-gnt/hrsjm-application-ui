import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
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
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
  Shadows,
} from '../../../../core';
import { AppButton } from '../../../../core/components/common/AppButton';
import {
  User,
  Mail,
  Phone,
  X,
  AlertCircle,
  Calendar,
} from '../../../../core/components/icons';
import { DatePickerModal } from '../../../../core/components/common/DatePickerModal';
import { useProfileStore } from '../profileStore';
import type { PersonalInfoInput } from '../types/profile.types';
import { authService } from '../../../auth/services/auth.service';
import { useAuthStore } from '../../../auth/store/authStore';

interface EditPersonalInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const isEmailValid = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isPhoneValid = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

export const EditPersonalInfoModal: React.FC<EditPersonalInfoModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const profile = useProfileStore(state => state.profile);
  const updatePersonalInfo = useProfileStore(state => state.updatePersonalInfo);
  const authUser = useAuthStore(state => state.user);
  const currentUserId = authUser?.id || (profile as any)?.id || profile.adminId || profile.memberId;
  const initialEmail = useMemo(() => (profile.email || authUser?.email || '').toLowerCase().trim(), [profile.email, authUser?.email]);
  const initialPhone = useMemo(() => (profile.phone || authUser?.mobile_number || '').replace(/\D/g, '').slice(-10), [profile.phone, authUser?.mobile_number]);

  const [form, setForm] = useState<PersonalInfoInput>({
    fullName: profile.fullName || authUser?.full_name || '',
    email: initialEmail,
    phone: initialPhone,
    dob: (profile.dateOfBirth || (profile as any).dob || (authUser as any)?.dob || '').trim(),
  });
  const [dobPickerVisible, setDobPickerVisible] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfoInput, string>>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm({
        fullName: profile.fullName || authUser?.full_name || '',
        email: initialEmail,
        phone: initialPhone,
        dob: (profile.dateOfBirth || (profile as any).dob || (authUser as any)?.dob || '').trim(),
      });
      setErrors({});
      setErrorMessage(null);
    }
  }, [visible, profile, authUser, initialEmail, initialPhone]);

  const checkEmailDuplicate = useCallback(async (emailToCheck: string) => {
    const cleanEmail = emailToCheck.trim().toLowerCase();
    if (!cleanEmail || cleanEmail === initialEmail || !isEmailValid(cleanEmail)) {
      return;
    }
    setCheckingEmail(true);
    try {
      const res = await authService.checkDuplicates(undefined, cleanEmail, currentUserId);
      if (res?.email_taken) {
        setErrors(prev => ({
          ...prev,
          email: res.email_message || 'This email is already in use by another account.',
        }));
      } else {
        setErrors(prev => ({ ...prev, email: undefined }));
      }
    } catch {
      // Ignore network errors in background check
    } finally {
      setCheckingEmail(false);
    }
  }, [initialEmail, currentUserId]);

  const checkPhoneDuplicate = useCallback(async (phoneToCheck: string) => {
    const cleanPhone = phoneToCheck.replace(/\D/g, '').slice(0, 10);
    if (!cleanPhone || cleanPhone === initialPhone || cleanPhone.length !== 10) {
      return;
    }
    setCheckingPhone(true);
    try {
      const res = await authService.checkDuplicates(cleanPhone, undefined, currentUserId);
      if (res?.mobile_taken) {
        setErrors(prev => ({
          ...prev,
          phone: res.mobile_message || 'This phone number is already in use by another account.',
        }));
      } else {
        setErrors(prev => ({ ...prev, phone: undefined }));
      }
    } catch {
      // Ignore network errors in background check
    } finally {
      setCheckingPhone(false);
    }
  }, [initialPhone, currentUserId]);

  // Debounced check for email duplication while typing
  useEffect(() => {
    const cleanEmail = form.email.trim().toLowerCase();
    if (!cleanEmail || cleanEmail === initialEmail || !isEmailValid(cleanEmail)) {
      return;
    }
    const timer = setTimeout(() => {
      checkEmailDuplicate(cleanEmail);
    }, 500);
    return () => clearTimeout(timer);
  }, [form.email, initialEmail, checkEmailDuplicate]);

  // Debounced check for phone duplication while typing
  useEffect(() => {
    const cleanPhone = form.phone.replace(/\D/g, '').slice(0, 10);
    if (!cleanPhone || cleanPhone === initialPhone || cleanPhone.length !== 10) {
      return;
    }
    const timer = setTimeout(() => {
      checkPhoneDuplicate(cleanPhone);
    }, 500);
    return () => clearTimeout(timer);
  }, [form.phone, initialPhone, checkPhoneDuplicate]);

  const setField = (field: keyof PersonalInfoInput, value: string) => {
    let cleanVal = value;
    if (field === 'email') {
      cleanVal = value.toLowerCase().trim();
    } else if (field === 'phone') {
      cleanVal = value.replace(/\D/g, '').slice(0, 10);
    }
    setForm(prev => ({ ...prev, [field]: cleanVal }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setErrorMessage(null);
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof PersonalInfoInput, string>> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    } else if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Name must be at least 2 characters.';
    }

    const cleanEmail = form.email.trim().toLowerCase();
    if (!cleanEmail) {
      nextErrors.email = 'Email address is required.';
    } else if (!isEmailValid(cleanEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    const cleanPhone = form.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      nextErrors.phone = 'Phone number is required.';
    } else if (cleanPhone.length !== 10) {
      nextErrors.phone = 'Please enter a valid 10-digit phone number.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const cleanEmail = form.email.trim().toLowerCase();
      const cleanPhone = form.phone.replace(/\D/g, '').slice(0, 10);

      // Validate duplication before submitting
      const emailChanged = cleanEmail !== initialEmail;
      const phoneChanged = cleanPhone !== initialPhone;
      if (emailChanged || phoneChanged) {
        const dupCheck = await authService.checkDuplicates(
          phoneChanged ? cleanPhone : undefined,
          emailChanged ? cleanEmail : undefined,
          currentUserId,
        );
        const dupErrors: Partial<Record<keyof PersonalInfoInput, string>> = {};
        if (emailChanged && dupCheck?.email_taken) {
          dupErrors.email = dupCheck.email_message || 'This email is already in use by another account.';
        }
        if (phoneChanged && dupCheck?.mobile_taken) {
          dupErrors.phone = dupCheck.mobile_message || 'This phone number is already in use by another account.';
        }
        if (Object.keys(dupErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...dupErrors }));
          setErrorMessage('Please resolve duplicate email or phone number.');
          setIsLoading(false);
          return;
        }
      }

      await updatePersonalInfo({
        fullName: form.fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        dob: (form.dob || '').trim(),
        dateOfBirth: (form.dob || '').trim(),
      });
      onSuccess();
    } catch (err: any) {
      const respData = err?.response?.data || err?.data;
      const rawMsg = respData?.message || err?.message || 'Failed to update personal information.';
      const msg = Array.isArray(rawMsg) ? rawMsg[0] : String(rawMsg);
      const code = respData?.code || '';

      if (code === 'EMAIL_TAKEN' || msg.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: 'This email is already in use by another account.' }));
        setErrorMessage('This email is already in use by another account.');
      } else if (
        code === 'MOBILE_TAKEN' ||
        code === 'MOBILE_NUMBER_TAKEN' ||
        msg.toLowerCase().includes('mobile') ||
        msg.toLowerCase().includes('phone')
      ) {
        setErrors(prev => ({ ...prev, phone: 'This phone number is already in use by another account.' }));
        setErrorMessage('This phone number is already in use by another account.');
      } else {
        setErrorMessage(msg);
      }
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
              <View style={styles.iconBadge}>
                <User size={18} color={AdminColors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Edit Personal Information</Text>
                <Text style={styles.subtitle}>
                  Update your name, email and contact phone number.
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

            {/* Full Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWrap, errors.fullName && styles.inputWrapError]}>
                <User size={16} color={AdminColors.textSecondary} style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  placeholderTextColor={AdminColors.textMuted}
                  value={form.fullName}
                  onChangeText={v => setField('fullName', v)}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
              {errors.fullName ? (
                <Text style={styles.fieldError}>{errors.fullName}</Text>
              ) : null}
            </View>

            {/* Email Address */}
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputWrapError]}>
                <Mail size={16} color={AdminColors.textSecondary} style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  placeholderTextColor={AdminColors.textMuted}
                  value={form.email}
                  onChangeText={v => setField('email', v)}
                  onBlur={() => checkEmailDuplicate(form.email)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {checkingEmail && <ActivityIndicator size="small" color={AdminColors.primary} style={{ marginRight: 8 }} />}
              </View>
              {errors.email ? (
                <Text style={styles.fieldError}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Phone Number */}
            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputWrap, errors.phone && styles.inputWrapError]}>
                <Phone size={16} color={AdminColors.textSecondary} style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor={AdminColors.textMuted}
                  value={form.phone}
                  onChangeText={v => setField('phone', v)}
                  onBlur={() => checkPhoneDuplicate(form.phone)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isLoading}
                />
                {checkingPhone && <ActivityIndicator size="small" color={AdminColors.primary} style={{ marginRight: 8 }} />}
              </View>
              {errors.phone ? (
                <Text style={styles.fieldError}>{errors.phone}</Text>
              ) : null}
            </View>

            {/* Date of Birth */}
            <View style={styles.field}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.inputWrap}>
                <Calendar size={16} color={AdminColors.textSecondary} style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={AdminColors.textMuted}
                  value={form.dob || ''}
                  onChangeText={v => setField('dob', v)}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setDobPickerVisible(true)}
                  style={styles.calendarIconBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Select Date of Birth"
                  accessibilityRole="button"
                >
                  <Calendar size={18} color={AdminColors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <AppButton
                title={isLoading ? 'Saving...' : 'Save Changes'}
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading || checkingEmail || checkingPhone || Boolean(errors.email) || Boolean(errors.phone)}
                style={styles.submitButton}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <DatePickerModal
        visible={dobPickerVisible}
        value={form.dob || ''}
        onSelect={selectedDate => {
          setField('dob', selectedDate);
          setDobPickerVisible(false);
        }}
        onClose={() => setDobPickerVisible(false)}
        title="Select Date of Birth"
      />
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
    maxWidth: 440,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: AdminColors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.background,
  },
  body: {
    padding: Spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: AdminColors.error,
    flex: 1,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    color: AdminColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
    paddingHorizontal: Spacing.sm,
  },
  inputWrapError: {
    borderColor: AdminColors.error,
  },
  fieldIcon: {
    marginRight: Spacing.xs,
  },
  calendarIconBtn: {
    padding: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: AdminColors.textPrimary,
    paddingVertical: 0,
  },
  fieldError: {
    ...Typography.caption,
    color: AdminColors.error,
    fontSize: 11,
    marginTop: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  cancelButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  cancelButtonText: {
    ...Typography.bodyMedium,
    color: AdminColors.textSecondary,
    fontWeight: '600',
  },
  submitButton: {
    minWidth: 120,
  },
});
