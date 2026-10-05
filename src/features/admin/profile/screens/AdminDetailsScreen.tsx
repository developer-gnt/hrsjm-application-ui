/**
 * Admin Details edit screen — Role / Department / Account Status
 * bottom-sheet selects. Saves to the local profile store (UI phase)
 * and stages the success toast for the profile screen.
 */
import React, { useState } from 'react';
import {
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
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppButton } from '../../../../core/components/common/AppButton';
import { useProfileStore } from '../profileStore';
import { AdminDetailsInput, AccountStatus } from '../types/profile.types';
import { AppSelect } from '../components/AppSelect';

const ROLE_OPTIONS = [
  'Administrator',
  'Super Admin',
  'Manager',
  'Coordinator',
  'Volunteer',
];

const DEPARTMENT_OPTIONS = [
  'Management',
  'Human Resources',
  'Finance',
  'Operations',
  'Outreach',
];

const ACCOUNT_STATUS_OPTIONS: AccountStatus[] = [
  'Active',
  'Inactive',
  'Suspended',
];

export interface AdminDetailsScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
  onSaved?: () => void;
}

export const AdminDetailsScreen: React.FC<AdminDetailsScreenProps> = ({
  onBack,
  onNavigate,
  onSaved,
}) => {
  const insets = useSafeAreaInsets();
  const profile = useProfileStore(state => state.profile);
  const updateAdminDetails = useProfileStore(state => state.updateAdminDetails);
  const stageMessage = useProfileStore(state => state.stageMessage);

  const [form, setForm] = useState<AdminDetailsInput>({
    role: profile.role,
    department: profile.department,
    accountStatus: profile.accountStatus,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    try {
      updateAdminDetails(form);
      stageMessage('Admin details updated successfully.');
      if (onSaved) {
        onSaved();
      } else if (onNavigate) {
        onNavigate('MyProfile');
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
        title="Admin Details"
        showBack={true}
        onBack={handleCancel}
        onNavigate={onNavigate}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Admin Details</Text>
        <Text style={styles.pageSubtitle}>
          Update the admin role and account settings.
        </Text>

        <View style={styles.formCard}>
          <AppSelect
            label="Role"
            value={form.role}
            options={ROLE_OPTIONS}
            onSelect={value => setForm(prev => ({ ...prev, role: value }))}
          />

          <AppSelect
            label="Department"
            value={form.department}
            options={DEPARTMENT_OPTIONS}
            onSelect={value =>
              setForm(prev => ({ ...prev, department: value }))
            }
          />

          <AppSelect
            label="Account Status"
            value={form.accountStatus}
            options={ACCOUNT_STATUS_OPTIONS as string[]}
            onSelect={value =>
              setForm(prev => ({
                ...prev,
                accountStatus: value as AccountStatus,
              }))
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
  selectIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  selectIcon: {
    marginRight: Spacing.sm,
    paddingBottom: Spacing.md + 14,
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

export default AdminDetailsScreen;
