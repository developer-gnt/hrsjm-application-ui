import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors } from '../../../../core/theme/colors';
import { Spacing } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { AppButton } from '../../../../core/components/common/AppButton';
import { Plus, FileText } from '../../../../core/components/icons';

interface MembersPageHeaderProps {
  title?: string;
  subtitle?: string;
  onAddMember?: () => void;
  onViewApplications?: () => void;
}

/** Page title block with Add Member and Applications actions. */
export const MembersPageHeader: React.FC<MembersPageHeaderProps> = ({
  title = 'Members',
  subtitle = 'Manage and view all registered members.',
  onAddMember,
  onViewApplications,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.actionButtons}>
        {onViewApplications ? (
          <AppButton
            title="Applications"
            variant="outline"
            size="sm"
            onPress={onViewApplications}
            icon={<FileText size={16} color={BrandColors.navy} strokeWidth={2} />}
            style={styles.applicationsButton}
          />
        ) : null}
        <AppButton
          title="Add Member"
          size="sm"
          onPress={onAddMember ?? (() => undefined)}
          icon={<Plus size={18} color={BrandColors.surface} strokeWidth={2.4} />}
          style={styles.addButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    ...Typography.pageTitle,
    color: BrandColors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  applicationsButton: {
    borderColor: BrandColors.border,
    minHeight: 40,
    paddingHorizontal: Spacing.sm,
  },
  addButton: {
    backgroundColor: BrandColors.navy,
    minHeight: 40,
    paddingHorizontal: Spacing.md,
  },
});

export default MembersPageHeader;
