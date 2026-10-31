import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { X, Check, RotateCcw } from '../../../core/components/icons';
import {
  TransactionCategoryCode,
  TransactionStatusCode,
} from '../types/transactions.types';

export interface FilterState {
  category: TransactionCategoryCode;
  status: TransactionStatusCode;
  fromDate?: string;
  toDate?: string;
}

export interface TransactionFilterSheetProps {
  visible: boolean;
  filters: FilterState;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}

const CATEGORIES: { label: string; value: TransactionCategoryCode }[] = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Membership', value: 'MEMBERSHIP' },
  { label: 'Donation', value: 'DONATION' },
  { label: 'Events', value: 'EVENTS' },
  { label: 'Other', value: 'OTHER' },
];

const STATUSES: { label: string; value: TransactionStatusCode }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Success', value: 'SUCCESS' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Refunded', value: 'REFUNDED' },
];

export const TransactionFilterSheet: React.FC<TransactionFilterSheetProps> = ({
  visible,
  filters,
  onClose,
  onApply,
  onReset,
}) => {
  const [localCategory, setLocalCategory] = useState<TransactionCategoryCode>(filters.category);
  const [localStatus, setLocalStatus] = useState<TransactionStatusCode>(filters.status);
  const [fromDate, setFromDate] = useState<string>(filters.fromDate || '');
  const [toDate, setToDate] = useState<string>(filters.toDate || '');

  const handleApply = () => {
    onApply({
      category: localCategory,
      status: localStatus,
      fromDate: fromDate.trim() || undefined,
      toDate: toDate.trim() || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalCategory('ALL');
    setLocalStatus('ALL');
    setFromDate('');
    setToDate('');
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filter Transactions</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#0B2F52" />
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.chipsWrap}>
            {CATEGORIES.map((c) => {
              const selected = localCategory === c.value;
              return (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => setLocalCategory(c.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Status</Text>
          <View style={styles.chipsWrap}>
            {STATUSES.map((s) => {
              const selected = localStatus === s.value;
              return (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => setLocalStatus(s.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date Range Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range (YYYY-MM-DD)</Text>
          <View style={styles.dateRow}>
            <TextInput
              style={styles.dateInput}
              placeholder="From: YYYY-MM-DD"
              placeholderTextColor="#A0AEC0"
              value={fromDate}
              onChangeText={setFromDate}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.dateInput}
              placeholder="To: YYYY-MM-DD"
              placeholderTextColor="#A0AEC0"
              value={toDate}
              onChangeText={setToDate}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <RotateCcw size={16} color="#718096" />
            <Text style={styles.resetBtnText}>Reset All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={handleApply}
            activeOpacity={0.85}
          >
            <Check size={16} color="#06294D" />
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 31, 57, 0.45)',
  },
  sheet: {
    backgroundColor: '#FAF7F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Playfair Display',
    fontSize: 18,
    fontWeight: '700',
    color: '#011F39',
  },
  closeBtn: {
    padding: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: '#34516D',
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: 12.5,
    color: '#34516D',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FAD465',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0B2F52',
    fontFamily: 'Inter',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  resetBtnText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  applyBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FAD465',
    gap: 6,
  },
  applyBtnText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#06294D',
  },
});

