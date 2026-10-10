import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors, StatusTones } from '../../../../core/theme/colors';
import { Spacing } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { PressableScale } from '../../../../core/components/common/PressableScale';
import {
  AppIconComponent,
  Eye,
  KeyRound,
  Pencil,
  UserCheck,
  UserX,
} from '../../../../core/components/icons';
import { Member } from '../types';
import { Avatar } from './Avatar';
import { AppBottomSheet } from './AppBottomSheet';

interface MemberActionsSheetProps {
  member: Member | null;
  onClose: () => void;
  onSelectAction?: (key: string, member: Member) => void;
}

interface ActionItem {
  key: string;
  label: string;
  description: string;
  Icon: AppIconComponent;
  destructive?: boolean;
}

/** Row action menu for the three-dot control, presented as a bottom sheet. */
export const MemberActionsSheet: React.FC<MemberActionsSheetProps> = ({
  member,
  onClose,
  onSelectAction,
}) => {
  if (!member) return null;

  // Account-level action: only INACTIVE accounts can be activated; every
  // live account (ACTIVE / EXPIRING_SOON membership) can be deactivated.
  const isActive = member.status !== 'INACTIVE';

  const actions: ActionItem[] = [
    {
      key: 'view',
      label: 'View Profile',
      description: 'See full member details and KYC status',
      Icon: Eye,
    },
    {
      key: 'edit',
      label: 'Edit Member',
      description: 'Update member information',
      Icon: Pencil,
    },
    {
      key: 'reset-password',
      label: 'Reset Password',
      description: 'Send a password reset to this member',
      Icon: KeyRound,
    },
    isActive
      ? {
          key: 'deactivate',
          label: 'Deactivate',
          description: 'Suspend this member account',
          Icon: UserX,
          destructive: true,
        }
      : {
          key: 'activate',
          label: 'Activate',
          description: 'Restore this member account',
          Icon: UserCheck,
        },
  ];

  return (
    <AppBottomSheet visible onClose={onClose} title="Member actions">
      <View style={styles.memberSummary}>
        <Avatar name={member.name} source={member.photo} size={40} />
        <View style={styles.summaryTextBlock}>
          <Text style={styles.summaryName} numberOfLines={1}>
            {member.name}
          </Text>
          <Text style={styles.summaryMeta} numberOfLines={1}>
            {member.membershipId} · {member.phone}
          </Text>
        </View>
      </View>

      {actions.map(({ key, label, description, Icon, destructive }) => (
        <PressableScale
          key={key}
          onPress={() => {
            onClose();
            onSelectAction?.(key, member);
          }}
          accessibilityRole="button"
          accessibilityLabel={label}
          testID={`member-action-${key}`}
          style={styles.actionRow}
        >
          <View
            style={[
              styles.actionIconContainer,
              destructive && styles.actionIconContainerDestructive,
            ]}
          >
            <Icon
              size={18}
              color={destructive ? BrandColors.danger : BrandColors.navy}
              strokeWidth={2}
            />
          </View>
          <View style={styles.actionTextBlock}>
            <Text
              style={[styles.actionLabel, destructive && styles.actionLabelDestructive]}
              numberOfLines={1}
            >
              {label}
            </Text>
            <Text style={styles.actionDescription} numberOfLines={1}>
              {description}
            </Text>
          </View>
        </PressableScale>
      ))}
    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
  memberSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: BrandColors.background,
    marginBottom: Spacing.base,
  },
  summaryTextBlock: {
    flex: 1,
    gap: 2,
  },
  summaryName: {
    ...Typography.rowTitle,
    color: BrandColors.textPrimary,
  },
  summaryMeta: {
    ...Typography.secondary,
    color: BrandColors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconContainerDestructive: {
    backgroundColor: StatusTones.danger.bg,
  },
  actionTextBlock: {
    flex: 1,
    gap: 1,
  },
  actionLabel: {
    ...Typography.bodyMedium,
    color: BrandColors.textPrimary,
  },
  actionLabelDestructive: {
    color: BrandColors.danger,
  },
  actionDescription: {
    ...Typography.secondary,
    color: BrandColors.textMuted,
  },
});

export default MemberActionsSheet;
