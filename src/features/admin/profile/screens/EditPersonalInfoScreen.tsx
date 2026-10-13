/**
 * Edit Personal Information screen — Full Name / Email / Phone with
 * inline validation. Saves to the local profile store (UI phase, no
 * API) and stages the success toast for the profile screen.
 */
import React, { useState } from 'react';
import {
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
  const updatePersonalInfo = useProfileStore(
    state => state.updatePersonalInfo,
  );
  const stageMessage = useProfileStore(state => state.stageMessage);

  const [form, setForm] = useState<PersonalInfoInput>({
    fullName: profile.fullName || '',
    email: (profile.email || '').toLowerCase().trim(),
    phone: (profile.phone || '').replace(/\D/g, '').slice(-10),
    dob: (profile.dateOfBirth || (profile as any).dob || '').trim(),
  });
  const [dobPickerVisible, setDobPickerVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

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
      await updatePersonalInfo({
        fullName: form.fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        dob: (form.dob || '').trim(),
        dateOfBirth: (form.dob || '').trim(),
      });
      stageMessage('Profile updated successfully.');
      if (onSaved) {
        onSaved();
      } else if (onNavigate) {
        onNavigate('MyProfile');
      }
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
              placeholder="Enter email address"
              error={errors.email}
              leftIcon={<MailIcon size={16} color={AdminColors.textMuted} />}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <AppInput
              label="Phone Number"
              required
              value={form.phone}
              onChangeText={value => setField('phone', value)}
              placeholder="Enter 10-digit phone number"
              error={errors.phone}
              leftIcon={<PhoneIcon size={16} color={AdminColors.textMuted} />}
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
              disabled={isSaving}
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
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
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
