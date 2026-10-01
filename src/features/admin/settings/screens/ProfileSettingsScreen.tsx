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
import { AppHeader } from '../../../../core/components/common/AppHeader';
import { AppInput } from '../../../../core/components/common/AppInput';
import { colors, spacing, typography } from '../../../../core/theme/theme';
import {
  APP_VERSION,
  PRIVACY_POLICY_URL,
  TERMS_CONDITIONS_URL,
} from '../../../../core/config';
import { useAuth } from '../../../../core/auth/AuthContext';
import { getBiometricLockEnabled, setBiometricLockEnabled } from '../settings.storage';
import { useProfileEdit } from '../hooks/useProfileEdit';
import LogoutModal from '../components/LogoutModal';

const BACKEND_PENDING_NOTE =
  'Pending backend support — the API does not expose this capability yet.';

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

  const profile = useProfileEdit({
    currentFullName: user?.full_name ?? '',
    currentEmail: user?.email ?? '',
    onSaved: () => {
      // Re-sync the shared session user after a successful save; the shared
      // session/auth behavior stays owned by the shared implementation.
      refreshUser().then(() => undefined);
    },
  });

  useEffect(() => {
    getBiometricLockEnabled().then(setBiometricLock);
  }, []);

  const toggleBiometricLock = (enabled: boolean) => {
    setBiometricLock(enabled);
    setBiometricLockEnabled(enabled).then(() => undefined);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="Profile & Settings" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <AppAvatar name={user?.full_name ?? '—'} size={64} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.full_name ?? '—'}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
              <Text style={styles.profileRoles}>
                {user?.roles.map(role => role.name).join(', ')}
              </Text>
            </View>
          </View>
        </AppCard>

        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <AppInput
            label="Name"
            value={profile.fullName}
            onChangeText={text => {
              profile.setFullName(text);
              profile.clearFeedback();
            }}
            error={profile.validation.fullNameError}
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
            error={profile.validation.emailError}
          />
          <AppInput
            label="Phone"
            value={user?.mobile_number ?? ''}
            editable={false}
          />
          <Text style={styles.pendingNote}>{BACKEND_PENDING_NOTE}</Text>
          {profile.error ? (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorText}>{profile.error}</Text>
            </View>
          ) : null}
          {profile.saved ? (
            <Text style={styles.savedText}>Profile updated.</Text>
          ) : null}
          <AppButton
            title="Save Changes"
            onPress={profile.save}
            loading={profile.saving}
            disabled={profile.saving || !profile.dirty || !profile.validation.valid}
            fullWidth
          />
        </AppCard>

        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <AppInput
            label="Current Password"
            value=""
            editable={false}
            secureTextEntry
          />
          <AppInput label="New Password" value="" editable={false} secureTextEntry />
          <AppInput label="Confirm Password" value="" editable={false} secureTextEntry />
          <Text style={styles.pendingNote}>{BACKEND_PENDING_NOTE}</Text>
        </AppCard>

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

        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <LegalRow title="Privacy Policy" url={PRIVACY_POLICY_URL} />
          <LegalRow title="Terms & Conditions" url={TERMS_CONDITIONS_URL} />
        </AppCard>

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
  pendingNote: {
    ...typography.secondary,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
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
