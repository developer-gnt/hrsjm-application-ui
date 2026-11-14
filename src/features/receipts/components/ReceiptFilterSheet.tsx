import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import { formatDate } from '../../../core/utils/date';
import { DatePickerModal } from '../../../core/components/common/DatePickerModal';
import type {
  DonationStatus,
  ReceiptFilterState,
  ReceiptType,
} from '../../donations/types/donation.types';

interface ReceiptFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: ReceiptFilterState;
  onApply: (filters: ReceiptFilterState) => void;
  onClear: () => void;
}

const PAYMENT_METHODS = [
  'All Payment Methods',
  'UPI (Google Pay)',
  'Net Banking',
  'Credit Card',
  'Debit Card',
  'UPI (PhonePe)',
];

const TYPE_OPTIONS: Array<{ key: 'ALL' | ReceiptType; label: string }> = [
  { key: 'ALL', label: 'All Receipts' },
  { key: 'Membership', label: 'Membership Receipts' },
  { key: 'Donation', label: 'Donation Receipts' },
];

const STATUS_OPTIONS: Array<{
  key: 'ALL' | DonationStatus;
  label: string;
  dotColor?: string;
}> = [
  { key: 'ALL', label: 'All Statuses' },
  { key: 'Completed', label: 'Completed', dotColor: colors.active },
  { key: 'Pending', label: 'Pending', dotColor: colors.warning },
  { key: 'Failed', label: 'Failed', dotColor: colors.danger },
];

const pad2 = (n: number) => String(n).padStart(2, '0');
const toIso = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export function ReceiptFilterSheet({
  visible,
  onClose,
  filters,
  onApply,
  onClear,
}: ReceiptFilterSheetProps) {
  const [selectedType, setSelectedType] = useState<'ALL' | ReceiptType>(
    filters.type || 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | DonationStatus>(
    filters.status || 'ALL'
  );
  const [fromDate, setFromDate] = useState(filters.fromDate || '');
  const [toDate, setToDate] = useState(filters.toDate || '');
  const [selectedMethod, setSelectedMethod] = useState(
    filters.paymentMethod || 'All Payment Methods'
  );
  const [minAmount, setMinAmount] = useState(
    filters.minAmount !== undefined ? String(filters.minAmount) : ''
  );
  const [maxAmount, setMaxAmount] = useState(
    filters.maxAmount !== undefined ? String(filters.maxAmount) : ''
  );
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'from' | 'to' | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedType(filters.type || 'ALL');
      setSelectedStatus(filters.status || 'ALL');
      setFromDate(filters.fromDate || '');
      setToDate(filters.toDate || '');
      setSelectedMethod(filters.paymentMethod || 'All Payment Methods');
      setMinAmount(
        filters.minAmount !== undefined ? String(filters.minAmount) : ''
      );
      setMaxAmount(
        filters.maxAmount !== undefined ? String(filters.maxAmount) : ''
      );
      setPaymentDropdownOpen(false);
      setActiveDatePicker(null);
    }
  }, [visible, filters]);

  const applyPreset = (preset: 'today' | '7d' | 'month' | '30d') => {
    const today = new Date();
    const todayIso = toIso(today);

    if (preset === 'today') {
      setFromDate(todayIso);
      setToDate(todayIso);
    } else if (preset === '7d') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setFromDate(toIso(past));
      setToDate(todayIso);
    } else if (preset === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(toIso(startOfMonth));
      setToDate(todayIso);
    } else if (preset === '30d') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setFromDate(toIso(past));
      setToDate(todayIso);
    }
  };

  const handleApply = () => {
    onApply({
      type: selectedType,
      status: selectedStatus,
      fromDate: fromDate.trim() || undefined,
      toDate: toDate.trim() || undefined,
      paymentMethod:
        selectedMethod && selectedMethod !== 'All Payment Methods'
          ? selectedMethod
          : undefined,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
    });
  };

  const handleClear = () => {
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setFromDate('');
    setToDate('');
    setSelectedMethod('All Payment Methods');
    setMinAmount('');
    setMaxAmount('');
    setPaymentDropdownOpen(false);
    setActiveDatePicker(null);
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
                <Text style={styles.title}>Filter Receipts</Text>
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
                {/* Section 1: Receipt Type */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Receipt Type</Text>
                  <View style={styles.radioList}>
                    {TYPE_OPTIONS.map(opt => {
                      const isSelected = selectedType === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          onPress={() => setSelectedType(opt.key)}
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

                {/* Section 2: Status */}
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
                          {opt.dotColor ? (
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

                {/* Section 3: Date Range */}
                <View style={styles.section}>
                  <View style={styles.sectionHeadingRow}>
                    <Text style={styles.sectionHeading}>Date Range</Text>
                    {(fromDate || toDate) ? (
                      <TouchableOpacity
                        onPress={() => {
                          setFromDate('');
                          setToDate('');
                        }}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <Text style={styles.clearSectionText}>Reset Dates</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={styles.inputRow}>
                    {/* From Date Box */}
                    <TouchableOpacity
                      style={[
                        styles.inputWrap,
                        fromDate ? styles.inputWrapActive : null,
                      ]}
                      onPress={() => setActiveDatePicker('from')}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={
                        fromDate ? `From Date: ${fromDate}` : 'Select From Date'
                      }>
                      <View style={styles.dateTextContainer}>
                        <Text
                          style={[
                            styles.dateValueText,
                            !fromDate && styles.placeholderText,
                          ]}
                          numberOfLines={1}>
                          {fromDate ? formatDate(fromDate) : 'From Date'}
                        </Text>
                        {fromDate ? (
                          <Text style={styles.dateIsoHint}>{fromDate}</Text>
                        ) : null}
                      </View>

                      <View style={styles.dateIconsRight}>
                        {fromDate ? (
                          <TouchableOpacity
                            onPress={(e: any) => {
                              e?.stopPropagation?.();
                              setFromDate('');
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={styles.dateClearIconBtn}
                            accessibilityLabel="Clear from date">
                            <Text style={styles.dateClearIconText}>✕</Text>
                          </TouchableOpacity>
                        ) : null}

                        <Icon
                          name="calendar"
                          size={18}
                          color={fromDate ? colors.accentGold : colors.primary}
                          strokeWidth={2}
                        />
                      </View>
                    </TouchableOpacity>

                    {/* To Date Box */}
                    <TouchableOpacity
                      style={[
                        styles.inputWrap,
                        toDate ? styles.inputWrapActive : null,
                      ]}
                      onPress={() => setActiveDatePicker('to')}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={
                        toDate ? `To Date: ${toDate}` : 'Select To Date'
                      }>
                      <View style={styles.dateTextContainer}>
                        <Text
                          style={[
                            styles.dateValueText,
                            !toDate && styles.placeholderText,
                          ]}
                          numberOfLines={1}>
                          {toDate ? formatDate(toDate) : 'To Date'}
                        </Text>
                        {toDate ? (
                          <Text style={styles.dateIsoHint}>{toDate}</Text>
                        ) : null}
                      </View>

                      <View style={styles.dateIconsRight}>
                        {toDate ? (
                          <TouchableOpacity
                            onPress={(e: any) => {
                              e?.stopPropagation?.();
                              setToDate('');
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={styles.dateClearIconBtn}
                            accessibilityLabel="Clear to date">
                            <Text style={styles.dateClearIconText}>✕</Text>
                          </TouchableOpacity>
                        ) : null}

                        <Icon
                          name="calendar"
                          size={18}
                          color={toDate ? colors.accentGold : colors.primary}
                          strokeWidth={2}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Quick Preset Chips */}
                  <View style={styles.presetRow}>
                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() => applyPreset('today')}
                      activeOpacity={0.7}>
                      <Text style={styles.presetChipText}>Today</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() => applyPreset('7d')}
                      activeOpacity={0.7}>
                      <Text style={styles.presetChipText}>Last 7 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() => applyPreset('month')}
                      activeOpacity={0.7}>
                      <Text style={styles.presetChipText}>This Month</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() => applyPreset('30d')}
                      activeOpacity={0.7}>
                      <Text style={styles.presetChipText}>Last 30 Days</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Section 4: Payment Method */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Payment Method</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setPaymentDropdownOpen(!paymentDropdownOpen)
                    }
                    accessibilityRole="combobox"
                    style={styles.dropdownBtn}>
                    <Text style={styles.dropdownValue}>{selectedMethod}</Text>
                    <Icon
                      name="chevron-down"
                      size={18}
                      color={colors.textPrimary}
                    />
                  </TouchableOpacity>

                  {paymentDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {PAYMENT_METHODS.map(method => {
                        const isMethodSelected = selectedMethod === method;
                        return (
                          <TouchableOpacity
                            key={method}
                            onPress={() => {
                              setSelectedMethod(method);
                              setPaymentDropdownOpen(false);
                            }}
                            style={[
                              styles.dropdownItem,
                              isMethodSelected && styles.dropdownItemSelected,
                            ]}>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                isMethodSelected &&
                                  styles.dropdownItemTextSelected,
                              ]}>
                              {method}
                            </Text>
                            {isMethodSelected && (
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

                {/* Section 5: Amount Range */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Amount Range</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        value={minAmount}
                        onChangeText={setMinAmount}
                        placeholder="Min Amount"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        value={maxAmount}
                        onChangeText={setMaxAmount}
                        placeholder="Max Amount"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="numeric"
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

      {/* Interactive Calendar Date Picker Modals */}
      <DatePickerModal
        visible={activeDatePicker === 'from'}
        value={fromDate}
        title="Select From Date"
        onSelect={selectedDate => {
          setFromDate(selectedDate);
          setActiveDatePicker(null);
        }}
        onClose={() => setActiveDatePicker(null)}
      />

      <DatePickerModal
        visible={activeDatePicker === 'to'}
        value={toDate}
        title="Select To Date"
        onSelect={selectedDate => {
          setToDate(selectedDate);
          setActiveDatePicker(null);
        }}
        onClose={() => setActiveDatePicker(null)}
      />
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
    color: colors.primaryDark,
  },
  closeBtn: {
    padding: spacing.xs,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: spacing.lg,
  },
  bodyContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  clearSectionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accentGold,
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
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  inputWrapActive: {
    borderColor: colors.accentGold,
    backgroundColor: '#FFFDF5',
  },
  dateTextContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 4,
  },
  dateValueText: {
    fontSize: 13.5,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dateIsoHint: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
  placeholderText: {
    fontSize: 13.5,
    color: colors.textMuted,
    fontWeight: '400',
  },
  dateIconsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateClearIconBtn: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateClearIconText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
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

export default ReceiptFilterSheet;
