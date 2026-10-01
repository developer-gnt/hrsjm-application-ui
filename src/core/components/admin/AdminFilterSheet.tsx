import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppBottomSheet } from '../common/AppBottomSheet';
import { AppButton } from '../common/AppButton';
import { colors, radius, spacing } from '../../theme/theme';

interface FilterOption {
  key: string;
  label: string;
  disabled?: boolean;
}

interface AdminFilterSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  sections: Array<{
    heading: string;
    /** Optional note shown under the heading (e.g. backend support pending) */
    note?: string;
    options: FilterOption[];
    selected: string[];
    disabled?: boolean;
    onToggle: (key: string) => void;
  }>;
}

export function AdminFilterSheet({
  visible,
  title,
  onClose,
  onApply,
  onClear,
  sections,
}: AdminFilterSheetProps) {
  return (
    <AppBottomSheet
      visible={visible}
      title={title}
      onClose={onClose}
      footer={
        <>
          <View style={styles.footerButton}>
            <AppButton title="Clear" onPress={onClear} variant="ghost" fullWidth />
          </View>
          <View style={styles.footerButton}>
            <AppButton title="Apply" onPress={onApply} fullWidth />
          </View>
        </>
      }>
      {sections.map(section => (
        <View key={section.heading} style={styles.section}>
          <Text style={styles.heading}>{section.heading}</Text>
          {section.note ? <Text style={styles.note}>{section.note}</Text> : null}
          <View style={styles.options}>
            {section.options.map(option => {
              const selected = section.selected.includes(option.key);
              const disabled = section.disabled || option.disabled;
              return (
                <TouchableOpacity
                  key={option.key}
                  disabled={disabled}
                  onPress={() => section.onToggle(option.key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected, disabled }}
                  accessibilityLabel={`${option.label}${selected ? ', selected' : ''}`}
                  style={[styles.option, disabled && styles.optionDisabled]}>
                  <View
                    style={[styles.checkbox, selected && styles.checkboxSelected, disabled && styles.checkboxDisabled]}>
                    {selected ? <Text style={styles.checkMark}>✓</Text> : null}
                  </View>
                  <Text style={[styles.optionLabel, disabled && styles.optionLabelDisabled]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  note: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxDisabled: {
    backgroundColor: colors.divider,
  },
  checkMark: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  optionLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  optionLabelDisabled: {
    color: colors.textMuted,
  },
  footerButton: {
    flex: 1,
  },
});

export default AdminFilterSheet;
