import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BrandColors } from '../../../../core/theme/colors';
import { BorderRadius, Shadows, Spacing } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { Check, X } from '../../../../core/components/icons';
import type { SupportFilterState } from '../types/support.types';
import type { TicketTabKey } from '../support.utils';

interface TicketFiltersProps {
  visible: boolean;
  filters: SupportFilterState;
  onClose: () => void;
  onApply: (filters: SupportFilterState) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: Array<{ key: TicketTabKey; label: string }> = [
  { key: 'ALL', label: 'All Statuses' },
  { key: 'SUBMITTED', label: 'Open (Submitted)' },
  { key: 'UNDER_REVIEW', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

const CATEGORY_OPTIONS = [
  { key: 'ALL', label: 'All Categories', icon: '🌐' },
  { key: 'Membership', label: 'Membership Issue', icon: '🏛️' },
  { key: 'Donation', label: 'Donation & Payment', icon: '💳' },
  { key: 'Assistance', label: 'Assistance / Scheme', icon: '🤝' },
  { key: 'Technical', label: 'App / Technical', icon: '📱' },
  { key: 'KYC', label: 'KYC & Verification', icon: '🪪' },
  { key: 'General', label: 'General / Other', icon: '💬' },
];

const DATE_RANGE_OPTIONS = [
  { key: 'ALL', label: 'All Time' },
  { key: 'TODAY', label: 'Today' },
  { key: '7_DAYS', label: 'Past 7 Days' },
  { key: 'THIS_MONTH', label: 'This Month' },
  { key: '90_DAYS', label: 'Past 90 Days' },
];

export const TicketFilters: React.FC<TicketFiltersProps> = ({
  visible,
  filters,
  onClose,
  onApply,
  onReset,
}) => {
  const [draftFilters, setDraftFilters] = useState<SupportFilterState>(filters);

  useEffect(() => {
    if (visible) {
      setDraftFilters(filters);
    }
  }, [visible, filters]);

  const countActiveFilters = (f: SupportFilterState): number => {
    let count = 0;
    if (f.status && f.status !== 'ALL') count++;
    if (f.category && f.category !== 'ALL') count++;
    if (f.dateRange && f.dateRange !== 'ALL') count++;
    return count;
  };

  const activeFiltersCount = countActiveFilters(draftFilters);

  const handleApply = () => {
    // calculate date bounds based on dateRange
    let fromDate: string | undefined;
    let toDate: string | undefined;

    if (draftFilters.dateRange === 'TODAY') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      fromDate = d.toISOString();
    } else if (draftFilters.dateRange === '7_DAYS') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      fromDate = d.toISOString();
    } else if (draftFilters.dateRange === 'THIS_MONTH') {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      fromDate = d.toISOString();
    } else if (draftFilters.dateRange === '90_DAYS') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      fromDate = d.toISOString();
    }

    onApply({
      ...draftFilters,
      fromDate,
      toDate,
    });
  };

  const handleReset = () => {
    const clean: SupportFilterState = {
      status: 'ALL',
      category: 'ALL',
      dateRange: 'ALL',
      fromDate: undefined,
      toDate: undefined,
    };
    setDraftFilters(clean);
    onReset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.sheetContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerTitle}>Filter Tickets</Text>
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
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Filter Content */}
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Status Section */}
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Ticket Status</Text>
                <View style={styles.chipsRow}>
                  {STATUS_OPTIONS.map((item) => {
                    const isSelected = draftFilters.status === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                        ]}
                        onPress={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            status: item.key,
                          }))
                        }
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected ? (
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Category / Issue Section */}
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Issue Category</Text>
                <View style={styles.chipsRow}>
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = draftFilters.category === cat.key;
                    return (
                      <TouchableOpacity
                        key={cat.key}
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                        ]}
                        onPress={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            category: cat.key,
                          }))
                        }
                        activeOpacity={0.8}
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

              {/* Date Period Section */}
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Date Submitted</Text>
                <View style={styles.chipsRow}>
                  {DATE_RANGE_OPTIONS.map((d) => {
                    const isSelected = draftFilters.dateRange === d.key;
                    return (
                      <TouchableOpacity
                        key={d.key}
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                        ]}
                        onPress={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            dateRange: d.key,
                          }))
                        }
                        activeOpacity={0.8}
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

export default TicketFilters;
