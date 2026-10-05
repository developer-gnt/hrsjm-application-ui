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
import { DonationsTopBar } from '../../donations/components/DonationsTopBar';
import { useProfileStore } from '../profileStore';
import { navigateToProfile } from '../../../../core/navigation/appRouter';
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

export const EditPersonalInfoScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const profile = useProfileStore(state => state.profile);
  const updatePersonalInfo = useProfileStore(
    state => state.updatePersonalInfo,
  );
  const stageMessage = useProfileStore(state => state.stageMessage);

  const [form, setForm] = useState<PersonalInfoInput>({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const setField = (field: keyof PersonalInfoInput, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear the field's validation message as the user fixes it.
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.fullName.trim()) {
      next.fullName = 'Full name is required.';
    }
    if (!form.email.trim()) {
      next.email = 'Email address is required.';
    } else if (!isEmailValid(form.email)) {
      next.email = 'Please enter a valid email address.';
    }
    if (!form.phone.trim()) {
      next.phone = 'Phone number is required.';
    } else if (!isPhoneValid(form.phone)) {
      next.phone = 'Please enter a valid phone number.';
    }
    return next;
  };

  const handleSave = async () => {
    const validation = validate();
    setErrors(validation);
    if (Object.values(validation).some(Boolean)) {
      return;
    }

    setIsSaving(true);
    try {
      // Local state only — the API service will be added later without
      // touching this screen.
      updatePersonalInfo({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      stageMessage('Profile updated successfully.');
      navigateToProfile();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigateToProfile();
  };

  return (
    <View style={styles.screen}>
      <DonationsTopBar paddingTop={insets.top} />

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
              placeholder="Enter phone number"
              error={errors.phone}
              leftIcon={<PhoneIcon size={16} color={AdminColors.textMuted} />}
              keyboardType="phone-pad"
              autoComplete="tel"
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
