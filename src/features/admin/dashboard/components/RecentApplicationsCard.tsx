import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { formatDate } from '../../../../core/utils';
import { AdminStatusBadge, adminStatusTone } from '../../../../core/components/admin/AdminStatusBadge';
import { AdminSectionHeader } from '../../../../core/components/admin/AdminSectionHeader';
import type { AssistanceRequestItem } from '../types/dashboard.types';

interface RecentApplicationsCardProps {
  rows: Array<Pick<AssistanceRequestItem, 'id' | 'created_at' | 'status'>>;
  onViewAll?: () => void;
}

/** Recent assistance applications feed card for the dashboard. */
export const RecentApplicationsCard: React.FC<RecentApplicationsCardProps> = ({
  rows,
  onViewAll,
}) => (
  <View style={styles.card}>
    <AdminSectionHeader
      title="Recent Applications"
      actionLabel={onViewAll ? 'View All' : undefined}
      onAction={onViewAll}
    />

    {rows.length === 0 ? (
      <Text style={styles.empty}>No applications yet.</Text>
    ) : (
      <View style={styles.rows}>
        {rows.map((row) => (
          <View key={row.id} style={styles.row}>
            <View style={styles.appInfo}>
              <Text style={styles.appId} numberOfLines={1}>
                {row.id}
              </Text>
              <Text style={styles.appDate}>{formatDate(row.created_at)}</Text>
            </View>

            <AdminStatusBadge
              label={row.status.replace(/_/g, ' ')}
              tone={adminStatusTone(row.status)}
            />
          </View>
        ))}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.card,
  },
  rows: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  appInfo: {
    flex: 1,
  },
  appId: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  appDate: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  empty: {
    ...Typography.body,
    color: AdminColors.textSecondary,
  },
});
