import React from 'react';
import {
  FlatList,
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

interface EventPickerSheetProps {
  visible: boolean;
  title: string;
  options: string[];
  selected?: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
  /** Optional hint shown under the title (e.g. demo-only notice). */
  hint?: string;
  /** Optional display formatter (e.g. ISO date -> "15 Oct 2026"); options render raw when omitted. */
  itemLabel?: (value: string) => string;
}

/**
 * Local bottom-sheet option picker for Create Event dropdown fields
 * (category, event type, audience, language, per-person limit, dates, times).
 *
 * TEMPORARY: replace with the shared AdminFilterSheet/select component (Aman)
 * when available. Pure RN Modal — Android + iOS compatible.
 */
export const EventPickerSheet: React.FC<EventPickerSheetProps> = ({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  hint,
  itemLabel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouchable} onPress={onClose} accessibilityLabel="Close picker" />
        <SafeAreaView style={styles.sheetContainer} edges={['bottom', 'left', 'right']}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetText}>
                <Text style={styles.sheetTitle}>{title}</Text>
                {hint ? <Text style={styles.sheetHint}>{hint}</Text> : null}
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const isSelected = item === selected;
                const label = itemLabel ? itemLabel(item) : item;
                return (
                  <TouchableOpacity
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={label}
                  >
                    <Text
                      style={[styles.optionText, isSelected && styles.optionTextSelected]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                    {isSelected ? <Text style={styles.checkIcon}>✓</Text> : null}
                  </TouchableOpacity>
                );
              }}
              style={styles.optionList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: AdminColors.cardSurface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  sheet: {
    maxHeight: 420,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
  },
  sheetText: {
    flex: 1,
    minWidth: 0,
  },
  sheetTitle: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
  },
  sheetHint: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.textMuted,
  },
  optionList: {
    paddingHorizontal: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  optionRowSelected: {
    backgroundColor: AdminColors.primaryLight,
  },
  optionText: {
    ...Typography.body,
    color: AdminColors.textPrimary,
    flexShrink: 1,
  },
  optionTextSelected: {
    color: AdminColors.primary,
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 14,
    color: AdminColors.primary,
    fontWeight: '700',
    marginLeft: Spacing.sm,
  },
});