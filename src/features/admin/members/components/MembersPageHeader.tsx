import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors } from '../../../../core/theme/colors';
import { Spacing } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { AppButton } from '../../../../core/components/common/AppButton';
import { Plus } from '../../../../core/components/icons';

interface MembersPageHeaderProps {
  title?: string;
  subtitle?: string;
  onAddMember?: () => void;
}

/** Page title block with the primary navy "Add Member" action. */
export const MembersPageHeader: React.FC<MembersPageHeaderProps> = ({
  title = 'Members',
  subtitle = 'Manage and view all registered members.',
  onAddMember,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <AppButton
        title="Add Member"
        onPress={onAddMember ?? (() => undefined)}
        icon={<Plus size={18} color={BrandColors.surface} strokeWidth={2.4} />}
        style={styles.addButton}
      />
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
  addButton: {
    backgroundColor: BrandColors.navy,
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
  },
});

export default MembersPageHeader;
