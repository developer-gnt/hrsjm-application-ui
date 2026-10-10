import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AdminHeader } from './AdminHeader';
import { AppEmptyState } from '../../core/components/feedback/AppEmptyState';
import { AdminColors } from '../../core/theme/colors';
import { Spacing } from '../../core/theme/spacing';

interface ModulePlaceholderScreenProps {
  title: string;
  description?: string;
  phase?: string;
  owner?: string;
  icon?: string;
  onBack?: () => void;
}

/**
 * Temporary screen for routes whose real implementation belongs to a later
 * phase or another developer. Keeps the full navigation/route contract
 * discoverable now (spec §46-47) while the module screens are built.
 */
export const ModulePlaceholderScreen: React.FC<ModulePlaceholderScreenProps> = ({
  title,
  description,
  phase,
  owner,
  icon,
  onBack,
}) => {
  const detail = [
    description,
    phase ? `Scheduled for ${phase}` : null,
    owner ? `Owned by ${owner}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.flex}>
      <AdminHeader title={title} showBack={Boolean(onBack)} onBack={onBack} />
      <View style={styles.body}>
        <AppEmptyState
          icon={icon ?? '🚧'}
          title={`${title} — coming soon`}
          description={detail || 'This module is under development.'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  body: {
    flex: 1,
    padding: Spacing.xl,
  },
});