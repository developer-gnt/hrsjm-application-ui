/**
 * Edit Personal Information screen — Full Name / Email / Phone with
 * inline validation. Saves to the local profile store (UI phase, no
 * API) and stages the success toast for the profile screen.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AdminColors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../../../../core';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppInput } from '../../../../core/components/common/AppInput';
import { DatePickerModal } from '../../../../core/components/common/DatePickerModal';
import { Calendar } from '../../../../core/components/icons';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { useProfileStore } from '../profileStore';
import { PersonalInfoInput } from '../types/profile.types';
import { PersonIcon, MailIcon, PhoneIcon } from '../components/ProfileIcons';
import { ProfileToast, ToastState } from '../components/ProfileToast';
import { authService } from '../../../auth/services/auth.service';
import { useAuthStore } from '../../../auth/store/authStore';

const isEmailValid = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isPhoneValid = (phone: string): boolean =>
  /^\+?[0-9][0-9\s-]{7,14}$/.test(phone.trim());

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface EditPersonalInfoScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
  onSaved?: () => void;
}

export const EditPersonalInfoScreen: React.FC<EditPersonalInfoScreenProps> = ({
  onBack,
  onNavigate,
  onSaved,
}) => {
  const insets = useSafeAreaInsets();
  const profile = useProfileStore(state => state.profile);
  const authUser = useAuthStore(state => state.user);
  const currentUserId = authUser?.id || (profile as any)?.id || profile.adminId || profile.memberId;
  const initialEmail = useMemo(() => (profile.email || authUser?.email || '').toLowerCase().trim(), [profile.email, authUser?.email]);
  const initialPhone = useMemo(() => (profile.phone || authUser?.mobile_number || '').replace(/\D/g, '').slice(-10), [profile.phone, authUser?.mobile_number]);

  const updatePersonalInfo = useProfileStore(
    state => state.updatePersonalInfo,
  );
  const stageMessage = useProfileStore(state => state.stageMessage);

  const [form, setForm] = useState<PersonalInfoInput>({
    fullName: profile.fullName || authUser?.full_name || '',
    email: initialEmail,
    phone: initialPhone,
    dob: (profile.dateOfBirth || (profile as any).dob || (authUser as any)?.dob || '').trim(),
  });
  const [dobPickerVisible, setDobPickerVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | ToastState | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

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
    // Clear the field's validation message as the user fixes it.
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.fullName.trim()) {
      next.fullName = 'Full name is required.';
    }
    const cleanEmail = form.email.trim().toLowerCase();
    if (!cleanEmail) {
      next.email = 'Email address is required.';
    } else if (!isEmailValid(cleanEmail)) {
      next.email = 'Please enter a valid email address.';
    }
    const cleanPhone = form.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      next.phone = 'Phone number is required.';
    } else if (cleanPhone.length !== 10) {
      next.phone = 'Phone number must be exactly 10 digits.';
    }
    return next;
  };

  const handleSave = async () => {
    const validation = validate();
    setErrors(validation);
    if (Object.values(validation).some(Boolean)) {
      return;
    }

    const cleanEmail = form.email.trim().toLowerCase();
    const cleanPhone = form.phone.replace(/\D/g, '').slice(0, 10);

    setIsSaving(true);
    try {
      // Validate duplication before executing save
      const emailChanged = cleanEmail !== initialEmail;
      const phoneChanged = cleanPhone !== initialPhone;
      if (emailChanged || phoneChanged) {
        const dupCheck = await authService.checkDuplicates(
          phoneChanged ? cleanPhone : undefined,
          emailChanged ? cleanEmail : undefined,
          currentUserId,
        );
        const dupErrors: FormErrors = {};
        if (emailChanged && dupCheck?.email_taken) {
          dupErrors.email = dupCheck.email_message || 'This email is already in use by another account.';
        }
        if (phoneChanged && dupCheck?.mobile_taken) {
          dupErrors.phone = dupCheck.mobile_message || 'This phone number is already in use by another account.';
        }
        if (Object.keys(dupErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...dupErrors }));
          setIsSaving(false);
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
      stageMessage('Profile updated successfully.');
      setToastMessage({
        message: 'Profile updated successfully.',
        variant: 'success',
      });
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        } else if (onNavigate) {
          onNavigate('MyProfile');
        }
      }, 700);
    } catch (err: any) {
      const respData = err?.response?.data || err?.data;
      const rawMsg = respData?.message || err?.message || 'Failed to update personal info.';
      const msg = Array.isArray(rawMsg) ? rawMsg[0] : String(rawMsg);
      const code = respData?.code || '';

      if (code === 'EMAIL_TAKEN' || msg.toLowerCase().includes('email')) {
        setErrors(prev => ({
          ...prev,
          email: 'This email is already in use by another account.',
        }));
      } else if (
        code === 'MOBILE_TAKEN' ||
        code === 'MOBILE_NUMBER_TAKEN' ||
        msg.toLowerCase().includes('mobile') ||
        msg.toLowerCase().includes('phone')
      ) {
        setErrors(prev => ({
          ...prev,
          phone: 'This phone number is already in use by another account.',
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          phone: msg,
        }));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('MyProfile');
    }
  };

  return (
    <View style={styles.screen}>
      <AdminHeader
        title="Edit Personal Info"
        showBack={true}
        onBack={handleCancel}
        onNavigate={onNavigate}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 70 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Edit Personal Information</Text>
          <Text style={styles.pageSubtitle}>
            Update your personal details below.
          </Text>

          <View style={styles.formCard}>
            <AppInput
              label="Full Name"
              required
              value={form.fullName}
              onChangeText={value => setField('fullName', value)}
              placeholder="Enter full name"
              error={errors.fullName}
              leftIcon={<PersonIcon size={16} color={AdminColors.textMuted} />}
              autoComplete="name"
            />
            <AppInput
              label="Email Address"
              required
              value={form.email}
              onChangeText={value => setField('email', value)}
              onBlur={() => checkEmailDuplicate(form.email)}
              placeholder="Enter email address"
              error={errors.email}
              leftIcon={<MailIcon size={16} color={AdminColors.textMuted} />}
              rightIcon={checkingEmail ? <ActivityIndicator size="small" color={AdminColors.primary} /> : undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <AppInput
              label="Phone Number"
              required
              value={form.phone}
              onChangeText={value => setField('phone', value)}
              onBlur={() => checkPhoneDuplicate(form.phone)}
              placeholder="Enter 10-digit phone number"
              error={errors.phone}
              leftIcon={<PhoneIcon size={16} color={AdminColors.textMuted} />}
              rightIcon={checkingPhone ? <ActivityIndicator size="small" color={AdminColors.primary} /> : undefined}
              keyboardType="phone-pad"
              maxLength={10}
              autoComplete="tel"
            />
            <AppInput
              label="Date of Birth"
              value={form.dob || ''}
              onChangeText={value => setField('dob', value)}
              placeholder="YYYY-MM-DD"
              leftIcon={<Calendar size={16} color={AdminColors.textMuted} />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setDobPickerVisible(true)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Select Date of Birth"
                  accessibilityRole="button"
                >
                  <Calendar size={18} color={AdminColors.primary} />
                </TouchableOpacity>
              }
            />
          </View>

          <View style={styles.actionsRow}>
            <AppButton
              title="Cancel"
              variant="outline"
              size="md"
              onPress={handleCancel}
              style={styles.actionButton}
            />
            <AppButton
              title={isSaving ? 'Saving...' : 'Save Changes'}
              variant="primary"
              size="md"
              loading={isSaving}
              disabled={isSaving || checkingEmail || checkingPhone || Boolean(errors.email) || Boolean(errors.phone)}
              onPress={handleSave}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
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

      {/* Floating toast */}
      {toastMessage ? (
        <View style={[styles.toastHost, { top: Math.max(insets.top, 16) + 60 }]}>
          <ProfileToast
            message={toastMessage}
            onDismiss={() => setToastMessage(null)}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  toastHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 99,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 60,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: AdminColors.primaryDark,
  },
  pageSubtitle: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginTop: 3,
    marginBottom: Spacing.base,
  },
  formCard: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    padding: Spacing.base,
    ...Shadows.card,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xs,
  },
});

export default EditPersonalInfoScreen;
