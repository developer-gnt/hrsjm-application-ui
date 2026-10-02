import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors } from '../../../../core/theme/colors';
import { Spacing } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { AppButton } from '../../../../core/components/common/AppButton';
import { PressableScale } from '../../../../core/components/common/PressableScale';
import { Check } from '../../../../core/components/icons';
import { MemberSortOption } from '../types';
import { AppBottomSheet } from './AppBottomSheet';

interface MemberFilterSheetProps {
  visible: boolean;
  currentSort: MemberSortOption;
  onApply: (sort: MemberSortOption) => void;
  onClose: () => void;
}

const SORT_OPTIONS: Array<{ value: MemberSortOption; label: string; description: string }> = [
  { value: 'default', label: 'Default order', description: 'As returned by the directory' },
  { value: 'name_asc', label: 'Name (A–Z)', description: 'Alphabetical by member name' },
  { value: 'joined_desc', label: 'Newest joined', description: 'Most recent applications first' },
  { value: 'expiry_asc', label: 'Earliest expiry', description: 'Soonest expiring validity first' },
];

/** Bottom sheet with sort/filters for the members list (staged Apply/Reset). */
export const MemberFilterSheet: React.FC<MemberFilterSheetProps> = ({
  visible,
  currentSort,
  onApply,
  onClose,
}) => {
  const [draftSort, setDraftSort] = useState<MemberSortOption>(currentSort);

  useEffect(() => {
    if (visible) setDraftSort(currentSort);
  }, [visible, currentSort]);

  const handleReset = () => {
    setDraftSort('default');
    onApply('default');
    onClose();
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Filters"
      footer={
        <>
          <AppButton
            title="Reset"
            onPress={handleReset}
            variant="outline"
            style={[styles.footerButton, styles.resetButton]}
            textStyle={styles.resetButtonText}
          />
          <AppButton
            title="Apply"
            onPress={() => {
              onApply(draftSort);
              onClose();
            }}
            style={[styles.footerButton, styles.applyButton]}
          />
        </>
      }
    >
      <Text style={styles.sectionLabel}>Sort by</Text>
      {SORT_OPTIONS.map(option => {
        const isSelected = draftSort === option.value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => setDraftSort(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isSelected }}
            testID={`member-sort-${option.value}`}
            style={[styles.optionRow, isSelected && styles.optionRowSelected]}
          >
            <View style={styles.optionTextBlock}>
              <Text
                style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
              <Text style={styles.optionDescription} numberOfLines={1}>
                {option.description}
              </Text>
            </View>
            {isSelected && <Check size={20} color={BrandColors.navy} strokeWidth={2.4} />}
          </PressableScale>
        );
      })}
    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    ...Typography.label,
    color: BrandColors.textMuted,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    marginBottom: Spacing.sm,
  },
  optionRowSelected: {
    borderColor: BrandColors.navy,
    backgroundColor: BrandColors.softBlue,
  },
  optionTextBlock: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    ...Typography.bodyMedium,
    color: BrandColors.textPrimary,
  },
  optionLabelSelected: {
    color: BrandColors.navy,
    fontWeight: '600',
  },
  optionDescription: {
    ...Typography.secondary,
    color: BrandColors.textMuted,
  },
  footerButton: {
    flex: 1,
    minHeight: 46,
  },
  resetButton: {
    borderColor: BrandColors.navy,
    borderWidth: 1.5,
  },
  resetButtonText: {
    color: BrandColors.navy,
  },
  applyButton: {
    backgroundColor: BrandColors.navy,
  },
});

export default MemberFilterSheet;
