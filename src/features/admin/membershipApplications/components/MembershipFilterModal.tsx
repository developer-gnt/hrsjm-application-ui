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

export interface FilterOptions {
  status: StatusTabKey;
  membershipType: string;
  sortBy: 'newest' | 'oldest' | 'name_asc';
}

interface MembershipFilterModalProps {
  visible: boolean;
  currentFilters: FilterOptions;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  onReset: () => void;
}

const MEMBERSHIP_TYPES = [
  'All Types',
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
  const [selectedType, setSelectedType] = useState<string>(currentFilters.membershipType);
  const [selectedSort, setSelectedSort] = useState<FilterOptions['sortBy']>(currentFilters.sortBy);

  // Sync state when opened
  React.useEffect(() => {
    if (visible) {
      setSelectedStatus(currentFilters.status);
      setSelectedType(currentFilters.membershipType);
      setSelectedSort(currentFilters.sortBy);
    }
  }, [visible, currentFilters]);

  const handleApply = () => {
    onApply({
      status: selectedStatus,
      membershipType: selectedType,
      sortBy: selectedSort,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedStatus('all');
    setSelectedType('All Types');
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
                {/* Status Section */}
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

                {/* Membership Type Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Membership Type</Text>
                  <View style={styles.chipsRow}>
                    {MEMBERSHIP_TYPES.map(type => {
                      const isSelected = selectedType === type;
                      return (
                        <TouchableOpacity
                          key={type}
                          style={[styles.chip, isSelected && styles.chipSelected]}
                          onPress={() => setSelectedType(type)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Sort Order Section */}
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: Spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
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
