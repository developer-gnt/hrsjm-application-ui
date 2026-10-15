import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors } from '../../../../core/theme/colors';
import { Spacing } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { AppCheckbox } from '../../../../core/components/common/AppCheckbox';
import { ArrowUpDown } from '../../../../core/components/icons';

interface MemberListHeaderProps {
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
}

/**
 * Column labels for the wide (tablet/landscape) member grid.
 * Hidden on narrow screens where rows adapt to a stacked card layout.
 */
export const MemberListHeader: React.FC<MemberListHeaderProps> = ({
  allSelected,
  someSelected,
  onToggleAll,
}) => {
  return (
    <View style={styles.container}>
      <AppCheckbox
        checked={allSelected}
        indeterminate={someSelected && !allSelected}
        onPress={onToggleAll}
        accessibilityLabel="Select all members"
        testID="members-select-all"
      />
      <Text style={[styles.label, styles.memberColumn]}>Member</Text>
      <Text style={[styles.label, styles.idColumn]}>Membership ID</Text>
      <View style={styles.validColumn}>
        <Text style={styles.label}>Valid Till</Text>
        <ArrowUpDown size={12} color={BrandColors.textMuted} strokeWidth={2} />
      </View>
      <Text style={[styles.label, styles.statusColumn]}>Status</Text>
      <View style={styles.menuColumn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  label: {
    ...Typography.label,
    color: BrandColors.textSecondary,
  },
  memberColumn: {
    flex: 2.4,
  },
  idColumn: {
    flex: 1.9,
  },
  validColumn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statusColumn: {
    width: 96,
  },
  menuColumn: {
    width: 28,
  },
});

export default MemberListHeader;
