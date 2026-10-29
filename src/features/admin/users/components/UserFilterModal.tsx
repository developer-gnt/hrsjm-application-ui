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
import { BorderRadius, FontFamilies, Spacing } from '../../../../core';
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
  { key: 'all', label: 'All Roles' },
  { key: 'admin', label: 'Admins' },
  { key: 'member', label: 'Members' },
  { key: 'donor', label: 'Donors' },
  { key: 'seeker', label: 'Donation Seekers' },
  { key: 'general', label: 'Users' },
];

const STATUS_OPTIONS: { key: 'all' | UserStatus; label: string }[] = [
  { key: 'all', label: 'All Users' },
  { key: 'active', label: 'Approved Users' },
  { key: 'pending', label: 'Pending Review' },
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
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdropTouch}
            onPress={onClose}
            activeOpacity={1}
            accessibilityLabel="Close filter sheet"
          />
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
        </View>
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
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '85%',
    paddingBottom: Spacing.xl,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#DBE5EE',
  },
  headerTitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 18,
    fontWeight: '700',
    color: '#06294D',
  },
  closeButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: '#EDF2F7',
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: '#718096',
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
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
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
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  chipInactive: {
    backgroundColor: '#EDF2F7',
    borderColor: '#DBE5EE',
  },
  chipText: {
    fontFamily: FontFamilies.sans,
    fontSize: 12.5,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chipTextInactive: {
    color: '#06294D',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCol: {
    flex: 1,
  },
  dateSubLabel: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateInputBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#DBE5EE',
    borderRadius: BorderRadius.button,
    paddingHorizontal: 12,
    minHeight: 44,
    height: 44,
    gap: 8,
  },
  dateInputText: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    color: '#0B2F52',
    fontWeight: '600',
  },
  datePlaceholder: {
    color: '#718096',
    fontWeight: '400',
  },
  clearDateBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  clearDateText: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#DBE5EE',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 12,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: '#DBE5EE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF2F7',
  },
  resetButtonText: {
    fontFamily: FontFamilies.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#06294D',
  },
  applyButton: {
    flex: 2,
    minHeight: 44,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAD465',
    shadowColor: '#FAD465',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  applyCheck: {
    color: '#06294D',
    fontSize: 14,
    fontWeight: '800',
    marginRight: 6,
  },
  applyButtonText: {
    fontFamily: FontFamilies.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#06294D',
  },
});
