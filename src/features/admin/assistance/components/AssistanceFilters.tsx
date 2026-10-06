import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BrandColors } from '../../../../core/theme/colors';
import { BorderRadius, Shadows, Spacing } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { Check, ListFilter, X } from '../../../../core/components/icons';
import type {
  AssistanceFilterState,
  AssistanceStatus,
} from '../types/assistance.types';
import type { AssistanceTabKey } from '../assistance.utils';

interface AssistanceFiltersProps {
  visible: boolean;
  filters: AssistanceFilterState;
  onClose: () => void;
  onApply: (filters: AssistanceFilterState) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: Array<{ key: AssistanceTabKey; label: string }> = [
  { key: 'ALL', label: 'All Statuses' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

const CATEGORY_OPTIONS = [
  { key: 'ALL', label: 'All Categories', icon: '🌐' },
  { key: 'Medical', label: 'Medical Treatment', icon: '🏥' },
  { key: 'Education', label: 'Education Support', icon: '🎓' },
  { key: 'Disaster', label: 'Disaster Relief', icon: '🌊' },
  { key: 'Livelihood', label: 'Livelihood Support', icon: '🌾' },
  { key: 'Disability', label: 'Disability Support', icon: '♿' },
  { key: 'Housing', label: 'Housing Support', icon: '🏠' },
  { key: 'Other', label: 'Other', icon: '📝' },
];

const AMOUNT_PRESETS = [
  { key: 'ALL', label: 'Any Amount' },
  { key: 'under_10k', label: 'Under ₹10,000', min: 0, max: 10000 },
  { key: '10k_50k', label: '₹10k – ₹50k', min: 10000, max: 50000 },
  { key: '50k_100k', label: '₹50k – ₹1,00,000', min: 50000, max: 100000 },
  { key: 'above_100k', label: 'Above ₹1,00,000', min: 100000, max: undefined },
  { key: 'custom', label: 'Custom Amount' },
];

const DATE_PRESETS = [
  { key: 'ALL', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'this_week', label: 'This Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_3_months', label: 'Past 3 Months' },
  { key: 'this_year', label: 'This Year' },
];

export const AssistanceFilters: React.FC<AssistanceFiltersProps> = ({
  visible,
  filters,
  onClose,
  onApply,
  onReset,
}) => {
  const [draftStatus, setDraftStatus] = useState<AssistanceStatus | undefined>(
    filters.status,
  );
  const [draftCategory, setDraftCategory] = useState<string>(
    filters.category || 'ALL',
  );
  const [draftAmountPreset, setDraftAmountPreset] = useState<string>(
    filters.amountPreset || 'ALL',
  );
  const [minAmount, setMinAmount] = useState<string>(
    filters.minAmount !== undefined ? String(filters.minAmount) : '',
  );
  const [maxAmount, setMaxAmount] = useState<string>(
    filters.maxAmount !== undefined ? String(filters.maxAmount) : '',
  );
  const [draftDatePreset, setDraftDatePreset] = useState<string>(
    filters.datePreset || 'ALL',
  );

  useEffect(() => {
    if (visible) {
      setDraftStatus(filters.status);
      setDraftCategory(filters.category || 'ALL');
      setDraftAmountPreset(filters.amountPreset || 'ALL');
      setMinAmount(
        filters.minAmount !== undefined ? String(filters.minAmount) : '',
      );
      setMaxAmount(
        filters.maxAmount !== undefined ? String(filters.maxAmount) : '',
      );
      setDraftDatePreset(filters.datePreset || 'ALL');
    }
  }, [visible, filters]);

  const calculateDateRange = (preset: string): { fromDate?: string; toDate?: string } => {
    const now = new Date();
    switch (preset) {
      case 'today': {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return { fromDate: start.toISOString() };
      }
      case 'this_week': {
        const d = new Date(now);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(d.setDate(diff));
        start.setHours(0, 0, 0, 0);
        return { fromDate: start.toISOString() };
      }
      case 'this_month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { fromDate: start.toISOString() };
      }
      case 'last_3_months': {
        const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return { fromDate: start.toISOString() };
      }
      case 'this_year': {
        const start = new Date(now.getFullYear(), 0, 1);
        return { fromDate: start.toISOString() };
      }
      default:
        return {};
    }
  };

  const activeFiltersCount = [
    draftStatus && draftStatus !== ('ALL' as any) ? 1 : 0,
    draftCategory && draftCategory !== 'ALL' ? 1 : 0,
    draftAmountPreset && draftAmountPreset !== 'ALL' ? 1 : 0,
    draftDatePreset && draftDatePreset !== 'ALL' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleApply = () => {
    let finalMin: number | undefined;
    let finalMax: number | undefined;

    if (draftAmountPreset === 'custom') {
      finalMin = minAmount.trim() ? parseFloat(minAmount) : undefined;
      finalMax = maxAmount.trim() ? parseFloat(maxAmount) : undefined;
    } else {
      const preset = AMOUNT_PRESETS.find(p => p.key === draftAmountPreset);
      if (preset) {
        finalMin = preset.min;
        finalMax = preset.max;
      }
    }

    const { fromDate, toDate } = calculateDateRange(draftDatePreset);

    const newFilterState: AssistanceFilterState = {
      status: draftStatus === ('ALL' as any) ? undefined : draftStatus,
      category: draftCategory === 'ALL' ? undefined : draftCategory,
      amountPreset: draftAmountPreset,
      minAmount: finalMin,
      maxAmount: finalMax,
      datePreset: draftDatePreset,
      fromDate,
      toDate,
    };

    onApply(newFilterState);
  };

  const handleReset = () => {
    setDraftStatus(undefined);
    setDraftCategory('ALL');
    setDraftAmountPreset('ALL');
    setMinAmount('');
    setMaxAmount('');
    setDraftDatePreset('ALL');
    onReset();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.sheetContainer}>
            {/* Sheet Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <ListFilter size={18} color="#0F2C59" />
                <Text style={styles.headerTitle}>Filter Requests</Text>
                {activeFiltersCount > 0 ? (
                  <View style={styles.activeCountBadge}>
                    <Text style={styles.activeCountText}>
                      {activeFiltersCount} active
                    </Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Filters */}
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* SECTION 1: STATUS */}
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Application Status</Text>
                <View style={styles.chipsRow}>
                  {STATUS_OPTIONS.map(opt => {
                    const isSelected =
                      opt.key === 'ALL'
                        ? !draftStatus || draftStatus === ('ALL' as any)
                        : draftStatus === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                        ]}
                        onPress={() =>
                          setDraftStatus(
                            opt.key === 'ALL'
                              ? undefined
                              : (opt.key as AssistanceStatus),
                          )
                        }
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {isSelected ? (
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* SECTION 2: CATEGORY / CAUSE */}
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Assistance Category</Text>
                <View style={styles.chipsRow}>
                  {CATEGORY_OPTIONS.map(cat => {
                    const isSelected = draftCategory === cat.key;
                    return (
                      <TouchableOpacity
                        key={cat.key}
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                        ]}
                        onPress={() => setDraftCategory(cat.key)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.catIcon}>{cat.icon}</Text>
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                        {isSelected ? (
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* SECTION 3: AMOUNT RANGE */}
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Requested Amount Range</Text>
                <View style={styles.chipsRow}>
                  {AMOUNT_PRESETS.map(amt => {
                    const isSelected = draftAmountPreset === amt.key;
                    return (
                      <TouchableOpacity
                        key={amt.key}
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                        ]}
                        onPress={() => setDraftAmountPreset(amt.key)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                          ]}
                        >
                          {amt.label}
                        </Text>
                        {isSelected ? (
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {draftAmountPreset === 'custom' && (
                  <View style={styles.customAmountRow}>
                    <View style={styles.amountInputCol}>
                      <Text style={styles.inputLabel}>Min Amount (₹)</Text>
                      <TextInput
                        style={styles.amountInput}
                        placeholder="0"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={minAmount}
                        onChangeText={setMinAmount}
                      />
                    </View>
                    <Text style={styles.dashSeparator}>—</Text>
                    <View style={styles.amountInputCol}>
                      <Text style={styles.inputLabel}>Max Amount (₹)</Text>
                      <TextInput
                        style={styles.amountInput}
                        placeholder="1,00,000+"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={maxAmount}
                        onChangeText={setMaxAmount}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* SECTION 4: DATE PERIOD */}
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Date Submitted</Text>
                <View style={styles.chipsRow}>
                  {DATE_PRESETS.map(d => {
                    const isSelected = draftDatePreset === d.key;
                    return (
                      <TouchableOpacity
                        key={d.key}
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                        ]}
                        onPress={() => setDraftDatePreset(d.key)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                          ]}
                        >
                          {d.label}
                        </Text>
                        {isSelected ? (
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={handleReset}
                activeOpacity={0.8}
              >
                <Text style={styles.resetIcon}>↺</Text>
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApply}
                activeOpacity={0.85}
              >
                <Text style={styles.applyBtnText}>
                  Apply Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 44, 89, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
    maxHeight: '88%',
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '100%',
    ...Shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2C59',
  },
  activeCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  activeCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
  },
  scroll: {
    maxHeight: 480,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.lg,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F2C59',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7.5,
    borderRadius: 10,
  },
  chipActive: {
    backgroundColor: '#0F2C59',
    borderColor: '#0F2C59',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  catIcon: {
    fontSize: 13,
  },
  customAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  amountInputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  amountInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: '#0F172A',
  },
  dashSeparator: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetIcon: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '700',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  applyBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#0F2C59',
    shadowColor: '#0F2C59',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AssistanceFilters;
