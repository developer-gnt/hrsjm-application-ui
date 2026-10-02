import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { formatDate } from '../../../../core/utils';
import { AdminStatusBadge, adminStatusTone } from '../../../../core/components/admin/AdminStatusBadge';
import { AdminSectionHeader } from '../../../../core/components/admin/AdminSectionHeader';
import type { AdminMemberItem } from '../types/dashboard.types';

interface RecentMembersCardProps {
  members: AdminMemberItem[];
  onViewAll?: () => void;
}

const initialsOf = (fullName: string): string =>
  fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

/** Recent members feed card for the dashboard. */
export const RecentMembersCard: React.FC<RecentMembersCardProps> = ({
  members,
  onViewAll,
}) => (
  <View style={styles.card}>
    <AdminSectionHeader title="Recent Members" actionLabel={onViewAll ? 'View All' : undefined} onAction={onViewAll} />

    {members.length === 0 ? (
      <Text style={styles.empty}>No members yet.</Text>
    ) : (
      <View style={styles.rows}>
        {members.map((member) => (
          <View key={member.id} style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsOf(member.full_name)}</Text>
            </View>

            <View style={styles.memberInfo}>
              <Text style={styles.memberName} numberOfLines={1}>
                {member.full_name}
              </Text>
              <Text style={styles.memberDate}>{formatDate(member.created_at)}</Text>
            </View>

            <AdminStatusBadge
              label={member.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              tone={adminStatusTone(member.status)}
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
    gap: Spacing.md,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.bodyBold,
    color: AdminColors.primaryDark,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  memberDate: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  empty: {
    ...Typography.body,
    color: AdminColors.textSecondary,
  },
});
