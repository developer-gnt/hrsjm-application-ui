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
import type { NewsFilterState, NewsStatusFilter } from '../types/news.types';

const STATUS_OPTIONS: Array<{ key: NewsStatusFilter; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'ARCHIVED', label: 'Archived' },
];

const DEFAULT_FILTER: NewsFilterState = { status: 'ALL', category: null };

interface NewsFilterSheetProps {
  visible: boolean;
  categories: string[];
  /** Currently applied filters (seed the sheet's draft when it opens). */
  applied: NewsFilterState;
  /** Called with the draft filters when "Apply Filters" is pressed. */
  onApply: (filters: NewsFilterState) => void;
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
 * Bottom filter sheet for the News list (STATUS / CATEGORY / AUTHOR / DATE).
 *
 * TEMPORARY (UI-only phase): selections apply locally on "Apply Filters".
 * AUTHOR and DATE are visual placeholders only — real author/date-range
 * filters arrive with the backend contract. Chip/button styling matches the
 * Events filter experience.
 */
export const NewsFilterSheet: React.FC<NewsFilterSheetProps> = ({
  visible,
  categories,
  applied,
  onApply,
  onClose,
}) => {
  const [draft, setDraft] = useState<NewsFilterState>(applied);

  // Re-seed the draft from the applied filters each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setDraft(applied);
    }
  }, [visible, applied]);

  const handleClearAll = () => setDraft(DEFAULT_FILTER);

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
      accessibilityLabel="News filters"
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} accessibilityLabel="Close filters" />
        <SafeAreaView style={styles.sheetContainer} edges={['bottom', 'left', 'right']}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filters</Text>
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
                label="All Categories"
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

            {/* AUTHOR — visual placeholder until the backend contract lands */}
            <Text style={styles.sectionTitle}>Author</Text>
            <View style={styles.disabledField}>
              <Text style={styles.disabledFieldText}>All Authors</Text>
              <Text style={styles.disabledChevron}>⌄</Text>
            </View>

            {/* DATE — visual placeholder until the backend contract lands */}
            <Text style={styles.sectionTitle}>Date</Text>
            <View style={styles.dateRow}>
              <View style={[styles.disabledField, styles.dateField]}>
                <Text style={styles.disabledFieldText}>From date</Text>
              </View>
              <Text style={styles.dateSeparator}>–</Text>
              <View style={[styles.disabledField, styles.dateField]}>
                <Text style={styles.disabledFieldText}>To date</Text>
              </View>
            </View>
            <Text style={styles.placeholderNote}>
              Author and date filters are sample UI for now — they will be connected after backend integration.
            </Text>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <AppButton
                title="Clear All"
                variant="outline"
                size="md"
                onPress={handleClearAll}
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
  disabledField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.background,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    opacity: 0.75,
  },
  disabledFieldText: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
  },
  disabledChevron: {
    fontSize: 12,
    color: AdminColors.textMuted,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateField: {
    flex: 1,
  },
  dateSeparator: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
  },
  placeholderNote: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    marginTop: Spacing.sm,
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
