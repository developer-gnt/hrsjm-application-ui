import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import { AppButton } from '../../../../../core/components';
import type { BlogDateFilter, BlogFilterState } from '../types/blog.types';

const STATUS_OPTIONS: Array<{ key: BlogFilterState['status']; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'ARCHIVED', label: 'Archived' },
];

const DATE_OPTIONS: Array<{ key: BlogDateFilter; label: string }> = [
  { key: 'ANY', label: 'Any Date' },
  { key: 'TODAY', label: 'Today' },
  { key: 'WEEK', label: 'This Week' },
  { key: 'MONTH', label: 'This Month' },
];

const DEFAULT_FILTER: BlogFilterState = { status: 'ALL', category: null, dateRange: 'ANY' };

interface BlogFilterSheetProps {
  visible: boolean;
  categories: string[];
  /** Currently applied filters (seed the sheet's draft when it opens). */
  applied: BlogFilterState;
  /** Called with the draft filters when "Apply Filters" is pressed. */
  onApply: (filters: BlogFilterState) => void;
  /** Clears all filters (spec: Reset button). */
  onReset: () => void;
  onClose: () => void;
}

const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    accessibilityLabel={`Filter: ${label}`}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

/**
 * Bottom filter sheet for the Blogs list (Status / Category / Date), titled
 * "Filter Blogs" with Reset + Apply Filters per the reference. Chip/button
 * styling follows the News filter sheet.
 *
 * TEMPORARY (UI-only phase): date ranges are display options only until the
 * backend contract defines the date semantics — "Any Date" matches everything.
 */
export const BlogFilterSheet: React.FC<BlogFilterSheetProps> = ({
  visible,
  categories,
  applied,
  onApply,
  onReset,
  onClose,
}) => {
  const [draft, setDraft] = useState<BlogFilterState>(applied);

  // Re-seed the draft from the applied filters each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setDraft(applied);
    }
  }, [visible, applied]);

  const handleReset = () => {
    setDraft(DEFAULT_FILTER);
    onReset();
    onClose();
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityLabel="Blog filters"
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} accessibilityLabel="Close filters" />
        <SafeAreaView style={styles.sheetContainer} edges={['bottom', 'left', 'right']}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter Blogs</Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close filters"
              >
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* STATUS */}
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.chipWrap}>
              {STATUS_OPTIONS.map(option => (
                <FilterChip
                  key={option.key}
                  label={option.label}
                  active={draft.status === option.key}
                  onPress={() => setDraft(previous => ({ ...previous, status: option.key }))}
                />
              ))}
            </View>

            {/* CATEGORY */}
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={[styles.chipWrap, styles.chipWrapScroll]}>
              <FilterChip
                label="All"
                active={draft.category === null}
                onPress={() => setDraft(previous => ({ ...previous, category: null }))}
              />
              {categories.map(category => (
                <FilterChip
                  key={category}
                  label={category}
                  active={draft.category === category}
                  onPress={() => setDraft(previous => ({ ...previous, category }))}
                />
              ))}
            </View>

            {/* DATE */}
            <Text style={styles.sectionTitle}>Date</Text>
            <View style={styles.chipWrap}>
              {DATE_OPTIONS.map(option => (
                <FilterChip
                  key={option.key}
                  label={option.label}
                  active={draft.dateRange === option.key}
                  onPress={() => setDraft(previous => ({ ...previous, dateRange: option.key }))}
                />
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <AppButton
                title="Reset"
                variant="outline"
                size="md"
                onPress={handleReset}
                style={styles.actionButton}
              />
              <AppButton
                title="Apply Filters"
                variant="primary"
                size="md"
                onPress={handleApply}
                style={styles.actionButton}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 96, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: AdminColors.cardSurface,
  },
  sheet: {
    backgroundColor: AdminColors.cardSurface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    ...Typography.sectionHeader,
    color: AdminColors.primaryDark,
  },
  sheetClose: {
    fontSize: 14,
    fontWeight: '700',
    color: AdminColors.textMuted,
    padding: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.secondaryMedium,
    color: AdminColors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chipWrapScroll: {
    maxHeight: 150,
    overflow: 'hidden',
  },
  chip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.background,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  chipActive: {
    backgroundColor: AdminColors.primaryLight,
    borderColor: AdminColors.primary,
  },
  chipText: {
    ...Typography.secondaryMedium,
    color: AdminColors.textSecondary,
  },
  chipTextActive: {
    color: AdminColors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
