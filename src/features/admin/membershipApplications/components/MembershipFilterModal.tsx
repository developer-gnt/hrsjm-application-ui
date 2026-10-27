import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  BorderRadius,
  Spacing,
} from '../../../../core';
import { StatusTabKey } from './MembershipStatusTabs';

export type AccountTypeFilter = 'all' | 'membership' | 'seeker';

export interface FilterOptions {
  status: StatusTabKey;
  accountType: AccountTypeFilter;
  memberType: string;
  sortBy: 'newest' | 'oldest' | 'name_asc';
  membershipType?: string; // backwards compatibility
}

interface MembershipFilterModalProps {
  visible: boolean;
  currentFilters: FilterOptions;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  onReset: () => void;
}

export const ACCOUNT_TYPE_OPTIONS: { key: AccountTypeFilter; label: string }[] = [
  { key: 'all', label: 'All Types' },
  { key: 'membership', label: 'Membership' },
  { key: 'seeker', label: 'Donor Seeker' },
];

export const MEMBER_TYPES = [
  'All Types',
  'District Unit',
  'State Unit',
  'Individual Membership',
  'Family Membership',
  'Life Membership',
  'Corporate Membership',
];

const SORT_OPTIONS: { key: FilterOptions['sortBy']; label: string }[] = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'name_asc', label: 'Name (A to Z)' },
];

const STATUS_OPTIONS: { key: StatusTabKey; label: string }[] = [
  { key: 'all', label: 'All Statuses' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export const MembershipFilterModal: React.FC<MembershipFilterModalProps> = ({
  visible,
  currentFilters,
  onClose,
  onApply,
  onReset,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusTabKey>(currentFilters.status);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeFilter>(
    currentFilters.accountType ||
      (currentFilters.membershipType === 'Donation Seeker' ? 'seeker' : 'all')
  );
  const [selectedMemberType, setSelectedMemberType] = useState<string>(
    currentFilters.memberType ||
      (currentFilters.membershipType !== 'Donation Seeker' ? currentFilters.membershipType || 'All Types' : 'All Types')
  );
  const [selectedSort, setSelectedSort] = useState<FilterOptions['sortBy']>(currentFilters.sortBy);

  // Sync state when opened
  React.useEffect(() => {
    if (visible) {
      setSelectedStatus(currentFilters.status);
      setSelectedAccountType(
        currentFilters.accountType ||
          (currentFilters.membershipType === 'Donation Seeker' ? 'seeker' : 'all')
      );
      setSelectedMemberType(
        currentFilters.memberType ||
          (currentFilters.membershipType !== 'Donation Seeker' ? currentFilters.membershipType || 'All Types' : 'All Types')
      );
      setSelectedSort(currentFilters.sortBy);
    }
  }, [visible, currentFilters]);

  const handleApply = () => {
    onApply({
      status: selectedStatus,
      accountType: selectedAccountType,
      memberType: selectedMemberType,
      membershipType:
        selectedAccountType === 'seeker'
          ? 'Donation Seeker'
          : selectedMemberType,
      sortBy: selectedSort,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedStatus('all');
    setSelectedAccountType('all');
    setSelectedMemberType('All Types');
    setSelectedSort('newest');
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
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Filter Applications</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                  accessibilityLabel="Close filter sheet"
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* 1. Status Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Application Status</Text>
                  <View style={styles.chipsRow}>
                    {STATUS_OPTIONS.map(opt => {
                      const isSelected = selectedStatus === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[styles.chip, isSelected && styles.chipSelected]}
                          onPress={() => setSelectedStatus(opt.key)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 2. Account Type Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Account Type</Text>
                  <View style={styles.chipsRow}>
                    {ACCOUNT_TYPE_OPTIONS.map(opt => {
                      const isSelected = selectedAccountType === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[styles.chip, isSelected && styles.chipSelected]}
                          onPress={() => {
                            setSelectedAccountType(opt.key);
                            if (opt.key === 'seeker') {
                              setSelectedMemberType('All Types');
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 3. Member Type Section */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>Member Type</Text>
                    {selectedAccountType === 'seeker' ? (
                      <Text style={styles.sectionSubtitle}>Not applicable for Donor Seeker</Text>
                    ) : null}
                  </View>
                  <View style={[styles.chipsRow, selectedAccountType === 'seeker' && styles.chipsRowDisabled]}>
                    {MEMBER_TYPES.map(type => {
                      const isSelected = selectedMemberType === type;
                      const disabled = selectedAccountType === 'seeker';
                      return (
                        <TouchableOpacity
                          key={type}
                          disabled={disabled}
                          style={[
                            styles.chip,
                            isSelected && !disabled && styles.chipSelected,
                            disabled && styles.chipDisabled,
                          ]}
                          onPress={() => setSelectedMemberType(type)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isSelected && !disabled && styles.chipTextSelected,
                              disabled && styles.chipTextDisabled,
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 4. Sort Order Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Sort By</Text>
                  <View style={styles.chipsRow}>
                    {SORT_OPTIONS.map(sort => {
                      const isSelected = selectedSort === sort.key;
                      return (
                        <TouchableOpacity
                          key={sort.key}
                          style={[styles.chip, isSelected && styles.chipSelected]}
                          onPress={() => setSelectedSort(sort.key)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {sort.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetButtonText}>Reset All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApply}
                  activeOpacity={0.8}
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipsRowDisabled: {
    opacity: 0.5,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextDisabled: {
    color: '#94A3B8',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
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
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
