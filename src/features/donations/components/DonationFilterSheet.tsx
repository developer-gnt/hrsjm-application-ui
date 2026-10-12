import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import type {
  DonationFilterState,
  DonationStatus,
} from '../types/donation.types';

interface DonationFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: DonationFilterState;
  onApply: (filters: DonationFilterState) => void;
  onClear: () => void;
}

const CATEGORIES = [
  'All Causes',
  'Education',
  'Health',
  'Environment',
  'Disaster Relief',
  'Social Welfare',
];

const STATUS_OPTIONS: Array<{
  key: 'ALL' | DonationStatus;
  label: string;
  dotColor?: string;
}> = [
  { key: 'ALL', label: 'All Donations', dotColor: colors.primary },
  { key: 'Completed', label: 'Completed', dotColor: colors.active },
  { key: 'Pending', label: 'Pending', dotColor: colors.warning },
  { key: 'Failed', label: 'Failed', dotColor: colors.danger },
];

export function DonationFilterSheet({
  visible,
  onClose,
  filters,
  onApply,
  onClear,
}: DonationFilterSheetProps) {
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | DonationStatus>(
    filters.status || 'ALL'
  );
  const [fromDate, setFromDate] = useState(filters.fromDate || '');
  const [toDate, setToDate] = useState(filters.toDate || '');
  const [selectedCategory, setSelectedCategory] = useState(
    filters.category || 'All Causes'
  );
  const [minAmount, setMinAmount] = useState(
    filters.minAmount !== undefined ? String(filters.minAmount) : ''
  );
  const [maxAmount, setMaxAmount] = useState(
    filters.maxAmount !== undefined ? String(filters.maxAmount) : ''
  );
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedStatus(filters.status || 'ALL');
      setFromDate(filters.fromDate || '');
      setToDate(filters.toDate || '');
      setSelectedCategory(filters.category || 'All Causes');
      setMinAmount(
        filters.minAmount !== undefined ? String(filters.minAmount) : ''
      );
      setMaxAmount(
        filters.maxAmount !== undefined ? String(filters.maxAmount) : ''
      );
      setCategoryDropdownOpen(false);
    }
  }, [visible, filters]);

  const handleApply = () => {
    onApply({
      status: selectedStatus,
      fromDate: fromDate.trim() || undefined,
      toDate: toDate.trim() || undefined,
      category:
        selectedCategory && selectedCategory !== 'All Causes'
          ? selectedCategory
          : undefined,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
    });
  };

  const handleClear = () => {
    setSelectedStatus('ALL');
    setFromDate('');
    setToDate('');
    setSelectedCategory('All Causes');
    setMinAmount('');
    setMaxAmount('');
    setCategoryDropdownOpen(false);
    onClear();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Filter Donations</Text>
                <TouchableOpacity
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close filter"
                  style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}>
                {/* Section 1: Status */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Status</Text>
                  <View style={styles.radioList}>
                    {STATUS_OPTIONS.map(opt => {
                      const isSelected = selectedStatus === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          onPress={() => setSelectedStatus(opt.key)}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: isSelected }}
                          style={styles.radioRow}>
                          <View
                            style={[
                              styles.radioOuter,
                              isSelected && styles.radioOuterSelected,
                            ]}>
                            {isSelected ? (
                              <View style={styles.radioInner} />
                            ) : null}
                          </View>
                          {opt.dotColor && opt.key !== 'ALL' ? (
                            <View
                              style={[
                                styles.statusDot,
                                { backgroundColor: opt.dotColor },
                              ]}
                            />
                          ) : null}
                          <Text
                            style={[
                              styles.radioLabel,
                              isSelected && styles.radioLabelSelected,
                            ]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Section 2: Date Range */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Date Range</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        value={fromDate}
                        onChangeText={setFromDate}
                        placeholder="From Date"
                        placeholderTextColor={colors.textMuted}
                      />
                      <Icon
                        name="calendar"
                        size={18}
                        color={colors.primary}
                        strokeWidth={2}
                      />
                    </View>

                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        value={toDate}
                        onChangeText={setToDate}
                        placeholder="To Date"
                        placeholderTextColor={colors.textMuted}
                      />
                      <Icon
                        name="calendar"
                        size={18}
                        color={colors.primary}
                        strokeWidth={2}
                      />
                    </View>
                  </View>
                </View>

                {/* Section 3: Cause / Category */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Cause / Category</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setCategoryDropdownOpen(!categoryDropdownOpen)
                    }
                    accessibilityRole="combobox"
                    style={styles.dropdownBtn}>
                    <Text style={styles.dropdownValue}>
                      {selectedCategory}
                    </Text>
                    <Icon
                      name={
                        categoryDropdownOpen ? 'chevron-down' : 'chevron-down'
                      }
                      size={18}
                      color={colors.textPrimary}
                    />
                  </TouchableOpacity>

                  {categoryDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {CATEGORIES.map(cat => {
                        const isCatSelected = selectedCategory === cat;
                        return (
                          <TouchableOpacity
                            key={cat}
                            onPress={() => {
                              setSelectedCategory(cat);
                              setCategoryDropdownOpen(false);
                            }}
                            style={[
                              styles.dropdownItem,
                              isCatSelected && styles.dropdownItemSelected,
                            ]}>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                isCatSelected &&
                                  styles.dropdownItemTextSelected,
                              ]}>
                              {cat}
                            </Text>
                            {isCatSelected && (
                              <Icon
                                name="check"
                                size={16}
                                color={colors.primary}
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Section 4: Amount Range */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Amount Range</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        value={minAmount}
                        onChangeText={setMinAmount}
                        placeholder="Min Amount"
                        keyboardType="numeric"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        value={maxAmount}
                        onChangeText={setMaxAmount}
                        placeholder="Max Amount"
                        keyboardType="numeric"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.actionsWrap}>
                  <TouchableOpacity
                    onPress={handleApply}
                    activeOpacity={0.85}
                    style={styles.applyBtn}>
                    <Text style={styles.applyBtnText}>Apply Filters</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleClear}
                    style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 96, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: spacing.lg,
  },
  bodyContent: {
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  radioList: {
    gap: spacing.sm + 2,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  radioLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  radioLabelSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  dropdownValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  actionsWrap: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  applyBtn: {
    backgroundColor: colors.accentGold,
    borderRadius: radius.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  clearBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default DonationFilterSheet;
