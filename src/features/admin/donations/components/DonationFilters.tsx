import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {
  AdminColors,
  Typography,
  Spacing,
  BorderRadius,
  AppButton,
} from '../../../../core';
import { DonationCategory, DonationStatus } from '../types/donations.types';

interface DonationFiltersProps {
  visible: boolean;
  selectedStatus: DonationStatus | null;
  selectedCategory?: DonationCategory | null;
  onClose: () => void;
  onApply: (filters: {
    status: DonationStatus | null;
    category: DonationCategory | null;
  }) => void;
}

const STATUS_OPTIONS: { value: DonationStatus | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUCCESS', label: 'Completed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const CATEGORY_OPTIONS: { value: DonationCategory | null; label: string }[] = [
  { value: null, label: 'All Categories' },
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'RECURRING', label: 'Recurring' },
  { value: 'OFFLINE', label: 'Offline' },
];

export const DonationFilters: React.FC<DonationFiltersProps> = ({
  visible,
  selectedStatus,
  selectedCategory = null,
  onClose,
  onApply,
}) => {
  const [draftStatus, setDraftStatus] = useState<DonationStatus | null>(selectedStatus);
  const [draftCategory, setDraftCategory] = useState<DonationCategory | null>(selectedCategory);

  useEffect(() => {
    if (visible) {
      setDraftStatus(selectedStatus);
      setDraftCategory(selectedCategory);
    }
  }, [visible, selectedStatus, selectedCategory]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>Filters</Text>

          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.optionsGrid}>
            {STATUS_OPTIONS.map(option => {
              const selected = draftStatus === option.value;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={styles.optionRow}
                  onPress={() => setDraftStatus(option.value)}
                >
                  <View
                    style={[styles.radio, selected && styles.radioSelected]}
                  >
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>Donation Type</Text>
          <View style={styles.optionsGrid}>
            {CATEGORY_OPTIONS.map(option => {
              const selected = draftCategory === option.value;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={styles.optionRow}
                  onPress={() => setDraftCategory(option.value)}
                >
                  <View
                    style={[styles.radio, selected && styles.radioSelected]}
                  >
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <AppButton
              title="Clear"
              variant="outline"
              size="sm"
              style={styles.footerButton}
              onPress={() => {
                setDraftStatus(null);
                setDraftCategory(null);
              }}
            />
            <AppButton
              title="Apply"
              size="sm"
              style={styles.footerButton}
              onPress={() => onApply({ status: draftStatus, category: draftCategory })}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  title: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Typography.secondaryMedium,
    color: AdminColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  optionsGrid: {
    marginBottom: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: AdminColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: AdminColors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primary,
  },
  optionLabel: {
    ...Typography.body,
    color: AdminColors.textPrimary,
    marginLeft: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
});