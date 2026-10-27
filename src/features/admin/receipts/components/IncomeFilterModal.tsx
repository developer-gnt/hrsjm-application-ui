import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BorderRadius, Spacing, BrandColors, Typography } from '../../../../core/theme';
import { X, Check } from '../../../../core/components/icons';

export interface IncomeFiltersState {
  incomeType: string;
  source: string;
  paymentMethod: string;
  status: string;
}

interface IncomeFilterModalProps {
  visible: boolean;
  filters: IncomeFiltersState;
  onClose: () => void;
  onApply: (filters: IncomeFiltersState) => void;
  onReset: () => void;
}

const TYPE_OPTIONS = [
  { key: 'ALL', label: 'All Types' },
  { key: 'NGO_DONATION', label: 'NGO Donation' },
  { key: 'CAUSE_DONATION', label: 'Cause Donation' },
  { key: 'MEMBERSHIP_PAYMENT', label: 'Membership Payment' },
  { key: 'RENEWAL_PAYMENT', label: 'Renewal Payment' },
  { key: 'OTHER_INCOME', label: 'Other Income' },
];

const SOURCE_OPTIONS = [
  { key: 'ALL', label: 'All Sources' },
  { key: 'WEBSITE', label: '🌐 Website' },
  { key: 'WEB_APP', label: '💻 Web App' },
  { key: 'APPLICATION', label: '📱 Application' },
];

const METHOD_OPTIONS = [
  { key: 'ALL', label: 'All Methods' },
  { key: 'UPI', label: 'UPI' },
  { key: 'BANK', label: 'Bank' },
  { key: 'CASH', label: 'Cash' },
  { key: 'CHEQUE', label: 'Cheque' },
];

const STATUS_OPTIONS = [
  { key: 'ALL', label: 'All Statuses' },
  { key: 'POSTED', label: 'Posted' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export const IncomeFilterModal: React.FC<IncomeFilterModalProps> = ({
  visible,
  filters,
  onClose,
  onApply,
  onReset,
}) => {
  const [selectedType, setSelectedType] = useState(filters.incomeType || 'ALL');
  const [selectedSource, setSelectedSource] = useState(filters.source || 'ALL');
  const [selectedMethod, setSelectedMethod] = useState(filters.paymentMethod || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'ALL');

  useEffect(() => {
    if (visible) {
      setSelectedType(filters.incomeType || 'ALL');
      setSelectedSource(filters.source || 'ALL');
      setSelectedMethod(filters.paymentMethod || 'ALL');
      setSelectedStatus(filters.status || 'ALL');
    }
  }, [visible, filters]);

  const handleApply = () => {
    onApply({
      incomeType: selectedType,
      source: selectedSource,
      paymentMethod: selectedMethod,
      status: selectedStatus,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedType('ALL');
    setSelectedSource('ALL');
    setSelectedMethod('ALL');
    setSelectedStatus('ALL');
    onReset();
    onClose();
  };

  const activeFiltersCount =
    (selectedType !== 'ALL' ? 1 : 0) +
    (selectedSource !== 'ALL' ? 1 : 0) +
    (selectedMethod !== 'ALL' ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>Filter Income</Text>
                  <Text style={styles.headerSubtitle}>
                    {activeFiltersCount > 0
                      ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} selected`
                      : 'Refine transactions by type, source, or method'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                  accessibilityLabel="Close filter sheet"
                >
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Section 1: Income Type */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Income Type</Text>
                  <View style={styles.chipsRow}>
                    {TYPE_OPTIONS.map(opt => {
                      const isSelected = selectedType === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[
                            styles.chip,
                            isSelected ? styles.chipActive : styles.chipInactive,
                          ]}
                          onPress={() => setSelectedType(opt.key)}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel={`Filter by type: ${opt.label}`}
                        >
                          {isSelected && (
                            <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                          )}
                          <Text
                            style={[
                              styles.chipText,
                              isSelected
                                ? styles.chipTextActive
                                : styles.chipTextInactive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Section 2: Origin Source */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Source Channel</Text>
                  <View style={styles.chipsRow}>
                    {SOURCE_OPTIONS.map(opt => {
                      const isSelected = selectedSource === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[
                            styles.chip,
                            isSelected ? styles.chipActive : styles.chipInactive,
                          ]}
                          onPress={() => setSelectedSource(opt.key)}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel={`Filter by source: ${opt.label}`}
                        >
                          {isSelected && (
                            <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                          )}
                          <Text
                            style={[
                              styles.chipText,
                              isSelected
                                ? styles.chipTextActive
                                : styles.chipTextInactive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Section 3: Payment Method */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                  <View style={styles.chipsRow}>
                    {METHOD_OPTIONS.map(opt => {
                      const isSelected = selectedMethod === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[
                            styles.chip,
                            isSelected ? styles.chipActive : styles.chipInactive,
                          ]}
                          onPress={() => setSelectedMethod(opt.key)}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel={`Filter by method: ${opt.label}`}
                        >
                          {isSelected && (
                            <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                          )}
                          <Text
                            style={[
                              styles.chipText,
                              isSelected
                                ? styles.chipTextActive
                                : styles.chipTextInactive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Section 4: Voucher Status */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Status</Text>
                  <View style={styles.chipsRow}>
                    {STATUS_OPTIONS.map(opt => {
                      const isSelected = selectedStatus === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[
                            styles.chip,
                            isSelected ? styles.chipActive : styles.chipInactive,
                          ]}
                          onPress={() => setSelectedStatus(opt.key)}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel={`Filter by status: ${opt.label}`}
                        >
                          {isSelected && (
                            <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                          )}
                          <Text
                            style={[
                              styles.chipText,
                              isSelected
                                ? styles.chipTextActive
                                : styles.chipTextInactive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Reset all filters"
                >
                  <Text style={styles.resetButtonText}>Reset All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApply}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Apply filters"
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 31, 57, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: 380,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#011F39',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.md,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: BrandColors.navy,
    borderColor: BrandColors.navy,
  },
  chipInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chipTextInactive: {
    color: '#475569',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default IncomeFilterModal;
