/**
 * Bottom-sheet style select field for the Admin Details edit screen.
 * Tapping the field opens a Modal with the option list; selection
 * closes it and updates the value. Built with plain RN views so it
 * matches the HRSJM design system without adding a picker dependency.
 */
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors } from '../../../../core';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';

interface AppSelectProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}

export const AppSelect: React.FC<AppSelectProps> = ({
  label,
  value,
  options,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        <Text style={styles.requiredStar}> *</Text>
      </Text>
      <TouchableOpacity
        style={styles.field}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
        accessibilityState={{ selected: true }}
      >
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setOpen(false)}
          accessibilityLabel={`Close ${label} selection`}
        >
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select {label}</Text>
            <FlatList
              data={options}
              keyExtractor={option => option}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={item}
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        selected && styles.optionLabelSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {selected ? (
                      <Text style={styles.optionCheck}>✓</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
              style={styles.optionList}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setOpen(false)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cancel selection"
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  requiredStar: {
    color: AdminColors.error,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  value: {
    ...Typography.body,
    color: AdminColors.textPrimary,
    flex: 1,
  },
  chevron: {
    fontSize: 14,
    color: AdminColors.textSecondary,
    marginLeft: Spacing.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: AdminColors.cardSurface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    maxHeight: '70%',
    paddingBottom: Spacing.xl,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: AdminColors.border,
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    ...Typography.bodyBold,
    color: AdminColors.primaryDark,
    marginBottom: Spacing.sm,
  },
  optionList: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.base,
  },
  optionSelected: {
    backgroundColor: AdminColors.primaryLight,
  },
  optionLabel: {
    ...Typography.bodyMedium,
    color: AdminColors.textPrimary,
  },
  optionLabelSelected: {
    color: AdminColors.primary,
    fontWeight: '700',
  },
  optionCheck: {
    fontSize: 15,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    marginTop: Spacing.sm,
  },
  cancelLabel: {
    ...Typography.bodyMedium,
    color: AdminColors.textSecondary,
    fontWeight: '600',
  },
});

export default AppSelect;
