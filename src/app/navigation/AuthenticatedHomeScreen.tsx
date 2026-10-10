import React from 'react';
import { StyleSheet, StatusBar, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../core/components/common/AppButton';
import { AdminColors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';
import { Spacing } from '../../core/theme/spacing';
import { useAuthStore } from '../../features/auth/store/authStore';
import { HomeStackParamList } from './NavigationTypes';

type AuthenticatedHomeScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'AuthenticatedHome'
>;

/**
 * Phase 2 placeholder for the authenticated area. The real AdminTabNavigator
 * (Dashboard / Members / Applications / Complaints / More) lands in Phase 3 —
 * this exists only so the auth switch has a destination and logout is testable.
 */
export const AuthenticatedHomeScreen: React.FC<AuthenticatedHomeScreenProps> = () => {
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);

  const primaryRole = user?.roles?.[0]?.name ?? '—';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Welcome, {user?.full_name ?? 'Admin'}</Text>
      <Text style={styles.subtitle}>
        Role: {primaryRole} • Status: {user?.status ?? '—'}
      </Text>
      <Text style={styles.note}>
        Admin tab navigation arrives in Phase 3. Logout below verifies the
        token revocation flow end-to-end.
      </Text>
      <AppButton
        title="Logout"
        onPress={() => {
          signOut();
        }}
        variant="danger"
        style={styles.logout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AdminColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  title: {
    ...Typography.screenTitle,
    color: AdminColors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  note: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  logout: {
    marginTop: Spacing.xxl,
    alignSelf: 'stretch',
  },
});