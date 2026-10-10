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
import { BorderRadius, Spacing } from '../../../../core';
import {
  UserFilterOptions,
  UserTypeTabKey,
  UserStatus,
  UserSortOption,
} from '../types/user.types';
import { DobDatePickerModal } from '../../../auth/components/DobDatePickerModal';
import { CalendarOutlineIcon } from '../../../auth/components/AuthIcons';

interface UserFilterModalProps {
  visible: boolean;
  currentFilters: UserFilterOptions;
  onClose: () => void;
  onApply: (filters: UserFilterOptions) => void;
  onReset: () => void;
}

const TYPE_OPTIONS: { key: UserTypeTabKey; label: string }[] = [
  { key: 'all', label: 'All Types' },
  { key: 'member', label: 'Members' },
  { key: 'seeker', label: 'Donation Seekers' },
  { key: 'donor', label: 'Donors' },
  { key: 'general', label: 'General Users' },
];

const STATUS_OPTIONS: { key: 'all' | UserStatus; label: string }[] = [
  { key: 'all', label: 'All Statuses' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'blocked', label: 'Blocked' },
];

const SORT_OPTIONS: { key: UserSortOption; label: string }[] = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'name_asc', label: 'Name (A to Z)' },
  { key: 'name_desc', label: 'Name (Z to A)' },
];

export const UserFilterModal: React.FC<UserFilterModalProps> = ({
  visible,
  currentFilters,
  onClose,
  onApply,
  onReset,
}) => {
  const [selectedType, setSelectedType] = useState<UserTypeTabKey>(
    currentFilters.typeTab || 'all'
  );
  const [selectedStatus, setSelectedStatus] = useState<'all' | UserStatus>(
    currentFilters.status || 'all'
  );
  const [joinedFrom, setJoinedFrom] = useState(currentFilters.joinedFrom || '');
  const [joinedTo, setJoinedTo] = useState(currentFilters.joinedTo || '');
  const [selectedSort, setSelectedSort] = useState<UserSortOption>(
    currentFilters.sortBy || 'newest'
  );

  // Date picker state
  const [datePickerTarget, setDatePickerTarget] = useState<'from' | 'to' | null>(null);

  // Sync state whenever modal becomes visible
  useEffect(() => {
    if (visible) {
      setSelectedType(currentFilters.typeTab || 'all');
      setSelectedStatus(currentFilters.status || 'all');
      setJoinedFrom(currentFilters.joinedFrom || '');
      setJoinedTo(currentFilters.joinedTo || '');
      setSelectedSort(currentFilters.sortBy || 'newest');
    }
  }, [visible, currentFilters]);

  const handleApply = () => {
    onApply({
      typeTab: selectedType,
      status: selectedStatus,
      joinedFrom: joinedFrom || undefined,
      joinedTo: joinedTo || undefined,
      sortBy: selectedSort,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedType('all');
    setSelectedStatus('all');
    setJoinedFrom('');
    setJoinedTo('');
    setSelectedSort('newest');
    onReset();
    onClose();
  };

  return (
    <>
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
                  <Text style={styles.headerTitle}>Filter Users</Text>
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
                  {/* Section 1: User Type */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>User Type</Text>
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
                            accessibilityLabel={`Filter by user type: ${opt.label}`}
                          >
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

                  {/* Section 2: Account Status */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Status</Text>
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

                  {/* Section 3: Date Joined Range */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Date Joined Range</Text>
                    <View style={styles.dateRow}>
                      {/* From Date */}
                      <View style={styles.dateCol}>
                        <Text style={styles.dateSubLabel}>From</Text>
                        <TouchableOpacity
                          style={styles.dateInputBtn}
                          onPress={() => setDatePickerTarget('from')}
                          activeOpacity={0.8}
                          accessibilityLabel="Select from date"
                        >
                          <CalendarOutlineIcon size={14} color="#64748B" />
                          <Text
                            style={[
                              styles.dateInputText,
                              !joinedFrom && styles.datePlaceholder,
                            ]}
                            numberOfLines={1}
                          >
                            {joinedFrom || 'Select date'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* To Date */}
                      <View style={styles.dateCol}>
                        <Text style={styles.dateSubLabel}>To</Text>
                        <TouchableOpacity
                          style={styles.dateInputBtn}
                          onPress={() => setDatePickerTarget('to')}
                          activeOpacity={0.8}
                          accessibilityLabel="Select to date"
                        >
                          <CalendarOutlineIcon size={14} color="#64748B" />
                          <Text
                            style={[
                              styles.dateInputText,
                              !joinedTo && styles.datePlaceholder,
                            ]}
                            numberOfLines={1}
                          >
                            {joinedTo || 'Select date'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {(joinedFrom || joinedTo) ? (
                      <TouchableOpacity
                        style={styles.clearDateBtn}
                        onPress={() => {
                          setJoinedFrom('');
                          setJoinedTo('');
                        }}
                        activeOpacity={0.7}
                        accessibilityLabel="Clear date filter"
                      >
                        <Text style={styles.clearDateText}>✕ Clear date range</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {/* Section 4: Sort By */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sort By</Text>
                    <View style={styles.chipsRow}>
                      {SORT_OPTIONS.map(opt => {
                        const isSelected = selectedSort === opt.key;
                        return (
                          <TouchableOpacity
                            key={opt.key}
                            style={[
                              styles.chip,
                              isSelected ? styles.chipActive : styles.chipInactive,
                            ]}
                            onPress={() => setSelectedSort(opt.key)}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel={`Sort by: ${opt.label}`}
                          >
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

                {/* Footer Action Buttons */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleReset}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Reset all filters"
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleApply}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Apply filters"
                  >
                    <Text style={styles.applyCheck}>✓</Text>
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Date Picker Modal */}
      <DobDatePickerModal
        visible={datePickerTarget !== null}
        selectedDate={datePickerTarget === 'from' ? joinedFrom : joinedTo}
        onClose={() => setDatePickerTarget(null)}
        onSelectDate={d => {
          if (datePickerTarget === 'from') {
            setJoinedFrom(d);
          } else if (datePickerTarget === 'to') {
            setJoinedTo(d);
          }
          setDatePickerTarget(null);
        }}
      />
    </>
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
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '85%',
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
  },
  closeButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
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
    color: '#334155',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCol: {
    flex: 1,
  },
  dateSubLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateInputBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    height: 42,
    gap: 8,
  },
  dateInputText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  datePlaceholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  clearDateBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  clearDateText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F6',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2860',
  },
  applyCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginRight: 6,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
