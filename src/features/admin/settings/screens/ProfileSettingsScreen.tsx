import React, { useEffect, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppAvatar } from '../../../../core/components/common/AppAvatar';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppCard } from '../../../../core/components/common/AppCard';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppInput } from '../../../../core/components/common/AppInput';
import { colors, serif, spacing, typography } from '../../../../core/theme/theme';
import {
  APP_VERSION,
  PRIVACY_POLICY_URL,
  TERMS_CONDITIONS_URL,
} from '../../../../core/config';
import { useAuth } from '../../../../core/auth/AuthContext';
import { getApiErrorMessage } from '../../../../core/api/client';
import { getBiometricLockEnabled, setBiometricLockEnabled } from '../settings.storage';
import { useProfileEdit } from '../hooks/useProfileEdit';
import { settingsService } from '../services/settings.service';
import { validatePassword, validatePasswordConfirmation } from '../settings.utils';
import LogoutModal from '../components/LogoutModal';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function LegalRow({ title, url }: { title: string; url: string }) {
  return (
    <TouchableOpacity
      style={styles.legalRow}
      onPress={() => {
        // Opening the legal URL in the browser may reject on unsupported
        // platforms - the failure is silently ignorable.
        Linking.openURL(url).catch(() => undefined);
      }}
      accessibilityRole="link"
      accessibilityLabel={`${title} (opens in browser)`}>
      <Text style={styles.legalTitle}>{title}</Text>
      <Text style={styles.legalChevron}>›</Text>
    </TouchableOpacity>
  );
}

export function ProfileSettingsScreen() {
  const { user, signOut, refreshUser } = useAuth();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [biometricLock, setBiometricLock] = useState(false);

  // Profile Edit State
  const profile = useProfileEdit({
    currentFullName: user?.full_name ?? '',
    currentEmail: user?.email ?? '',
    currentMobileNumber: user?.mobile_number ?? '',
    onSaved: () => {
      refreshUser().then(() => undefined);
    },
  });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    getBiometricLockEnabled().then(setBiometricLock);
  }, []);

  const toggleBiometricLock = (enabled: boolean) => {
    setBiometricLock(enabled);
    setBiometricLockEnabled(enabled).then(() => undefined);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    const val = validatePassword(newPassword);
    if (!val.valid) {
      setPasswordError(val.error);
      return;
    }
    const matchVal = validatePasswordConfirmation(newPassword, confirmPassword);
    if (!matchVal.valid) {
      setPasswordError(matchVal.error);
      return;
    }

    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      const res = await settingsService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPasswordSuccess(res.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(
        getApiErrorMessage(err, 'Failed to update password. Please check your current password.'),
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Profile &amp; Settings</Text>
        <View style={styles.profileSpacing} />
        <AppCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <AppAvatar name={user?.full_name ?? '—'} size={64} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.full_name ?? '—'}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
              <Text style={styles.profileRoles}>
                {(user?.roles ?? []).map((role: any) => (typeof role === 'string' ? role : role?.name || '')).join(', ') || 'Administrator'}
              </Text>
            </View>
          </View>
        </AppCard>

        {/* Personal Information */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <AppInput
            label="Name"
            value={profile.fullName}
            onChangeText={text => {
              profile.setFullName(text);
              profile.clearFeedback();
            }}
            error={profile.validation.fullNameError ?? undefined}
          />
          <AppInput
            label="Email"
            value={profile.email}
            onChangeText={text => {
              profile.setEmail(text);
              profile.clearFeedback();
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={profile.validation.emailError ?? undefined}
          />
          <AppInput
            label="Phone"
            value={profile.mobileNumber}
            onChangeText={text => {
              profile.setMobileNumber(text);
              profile.clearFeedback();
            }}
            keyboardType="phone-pad"
            error={profile.validation.mobileNumberError ?? undefined}
          />
          {profile.error ? (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorText}>{profile.error}</Text>
            </View>
          ) : null}
          {profile.saved ? (
            <Text style={styles.savedText}>Profile updated successfully.</Text>
          ) : null}
          <AppButton
            title="Save Changes"
            onPress={profile.save}
            loading={profile.saving}
            disabled={profile.saving || !profile.dirty || !profile.validation.valid}
            fullWidth
          />
        </AppCard>

        {/* Change Password */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <AppInput
            label="Current Password"
            value={currentPassword}
            onChangeText={text => {
              setCurrentPassword(text);
              setPasswordError(null);
              setPasswordSuccess(null);
            }}
            secureTextEntry
          />
          <AppInput
            label="New Password"
            value={newPassword}
            onChangeText={text => {
              setNewPassword(text);
              setPasswordError(null);
              setPasswordSuccess(null);
            }}
            secureTextEntry
          />
          <AppInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              setPasswordError(null);
              setPasswordSuccess(null);
            }}
            secureTextEntry
          />
          {passwordError ? (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorText}>{passwordError}</Text>
            </View>
          ) : null}
          {passwordSuccess ? (
            <Text style={styles.savedText}>{passwordSuccess}</Text>
          ) : null}
          <AppButton
            title="Update Password"
            onPress={handlePasswordChange}
            loading={passwordSaving}
            disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
            fullWidth
          />
        </AppCard>

        {/* Security */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Biometric Lock</Text>
              <Text style={styles.settingNote}>
                Locks local app access only - it does not replace sign-in.
                Enforcement pending the shared biometric integration.
              </Text>
            </View>
            <Switch
              value={biometricLock}
              onValueChange={toggleBiometricLock}
              accessibilityLabel="Biometric lock"
            />
          </View>
        </AppCard>

        {/* Legal */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <LegalRow title="Privacy Policy" url={PRIVACY_POLICY_URL} />
          <LegalRow title="Terms & Conditions" url={TERMS_CONDITIONS_URL} />
        </AppCard>

        {/* App Info */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <InfoRow label="App Version" value={APP_VERSION} />
        </AppCard>

        <View style={styles.logoutWrap}>
          <AppButton
            title="Log Out"
            variant="danger"
            fullWidth
            onPress={() => setLogoutVisible(true)}
          />
        </View>
      </ScrollView>

      <LogoutModal
        visible={logoutVisible}
        onClose={() => setLogoutVisible(false)}
        onConfirm={() => {
          setLogoutVisible(false);
          signOut().then(() => undefined);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  pageTitle: {
    ...serif,
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  profileSpacing: {
    height: 0,
  },
  profileCard: {
    marginBottom: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  profileEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileRoles: {
    ...typography.badge,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
  },
  savedText: {
    ...typography.body,
    color: colors.active,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  settingNote: {
    ...typography.secondary,
    color: colors.textMuted,
    marginTop: 2,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  legalTitle: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  legalChevron: {
    fontSize: 18,
    color: colors.textMuted,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  logoutWrap: {
    marginTop: spacing.lg,
  },
});

export default ProfileSettingsScreen;
