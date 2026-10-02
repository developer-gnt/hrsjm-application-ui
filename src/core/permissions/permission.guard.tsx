import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { canAll, canAny } from './can';

interface PermissionGateProps {
  permissions: string[];
  /** 'any' (default): at least one permission suffices. 'all': every one. */
  mode?: 'any' | 'all';
  /** Rendered instead of children when the check fails. Default: nothing. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Route/action-level render guard (spec §18). UI gating only — the backend
 * remains the authorization authority (rule.md §3.3).
 *
 *   <PermissionGate permissions={['payment.verify']}>
 *     <AppButton title="Verify Payment" ... />
 *   </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permissions,
  mode = 'any',
  fallback = null,
  children,
}) => {
  const allowed =
    mode === 'all' ? canAll(permissions) : canAny(permissions);
  if (!allowed) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

/**
 * Standalone denial feedback for guarded routes reached directly.
 */
export const PermissionDenied: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.icon}>🔒</Text>
    <Text style={styles.title}>Permission required</Text>
    <Text style={styles.message}>
      You don't have permission to access this section. Contact an HRSJM
      administrator if you believe this is a mistake.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    maxWidth: 290,
  },
});