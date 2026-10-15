import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../core';
import { DateRange } from '../types/donations.types';

interface DateRangePickerModalProps {
  visible: boolean;
  from: string | null;
  to: string | null;
  onApply: (range: DateRange) => void;
  onClose: () => void;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad2 = (n: number) => String(n).padStart(2, '0');

const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${pad2(month + 1)}-${pad2(day)}`;

const parseDateKey = (key: string | null) => {
  if (!key) return null;
  const d = new Date(`${key}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
};

const formatDayLabel = (key: string | null) => {
  const d = parseDateKey(key);
  if (!d) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  visible,
  from,
  to,
  onApply,
  onClose,
}) => {
  const today = new Date();
  const [fromKey, setFromKey] = useState<string | null>(from);
  const [toKey, setToKey] = useState<string | null>(to);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    if (visible) {
      setFromKey(from);
      setToKey(to);
      const anchor = parseDateKey(from) ?? today;
      setViewYear(anchor.getFullYear());
      setViewMonth(anchor.getMonth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = Array.from({ length: firstWeekday }, (_, i) => i);

  const handleDayPress = (dayKey: string) => {
    if (!fromKey || toKey) {
      setFromKey(dayKey);
      setToKey(null);
      return;
    }
    if (dayKey < fromKey) {
      setFromKey(dayKey);
    } else {
      setToKey(dayKey);
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleApply = () => {
    onApply({ from: fromKey, to: toKey });
    onClose();
  };

  const handleClear = () => {
    setFromKey(null);
    setToKey(null);
    onApply({ from: null, to: null });
    onClose();
  };

  const renderDay = (day: number) => {
    const dayKey = toDateKey(viewYear, viewMonth, day);
    const isFrom = dayKey === fromKey;
    const isTo = dayKey === toKey;
    const isEndpoint = isFrom || isTo;
    const isInRange =
      fromKey && toKey && dayKey > fromKey && dayKey < toKey;
    const isToday =
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear();

    return (
      <TouchableOpacity
        key={dayKey}
        style={[
          styles.dayCell,
          isInRange && styles.dayCellInRange,
          isEndpoint && styles.dayCellEndpoint,
        ]}
        onPress={() => handleDayPress(dayKey)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Select date ${dayKey}`}
      >
        <Text
          style={[
            styles.dayText,
            isToday && !isEndpoint && styles.dayTextToday,
            isEndpoint && styles.dayTextEndpoint,
          ]}
        >
          {day}
        </Text>
      </TouchableOpacity>
    );
  };

  const monthTitle = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    'en-GB',
    { month: 'long', year: 'numeric' },
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Custom Date Range</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Close date range picker"
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectionRow}>
            <View style={styles.selectionItem}>
              <Text style={styles.selectionLabel}>From</Text>
              <Text
                style={[
                  styles.selectionValue,
                  !fromKey && styles.selectionValueEmpty,
                ]}
              >
                {formatDayLabel(fromKey)}
              </Text>
            </View>
            <Text style={styles.selectionDivider}>–</Text>
            <View style={styles.selectionItem}>
              <Text style={styles.selectionLabel}>To</Text>
              <Text
                style={[
                  styles.selectionValue,
                  !toKey && styles.selectionValueEmpty,
                ]}
              >
                {formatDayLabel(toKey)}
              </Text>
            </View>
          </View>

          <View style={styles.monthNavRow}>
            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={handlePrevMonth}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
            >
              <Text style={styles.monthNavIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthTitle}</Text>
            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={handleNextMonth}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Next month"
            >
              <Text style={styles.monthNavIcon}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map(label => (
              <Text key={label} style={styles.weekdayText}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {leadingBlanks.map(index => (
              <View key={`blank-${index}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
              renderDay,
            )}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Clear custom date range"
            >
              <Text style={styles.clearButtonText}>All Dates</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.applyButton,
                !fromKey && styles.applyButtonDisabled,
              ]}
              onPress={handleApply}
              disabled={!fromKey}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Apply custom date range"
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.divider,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.sectionHeader,
    color: AdminColors.primaryDark,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.textSecondary,
    padding: Spacing.xs,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.background,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  selectionItem: {
    flex: 1,
    alignItems: 'center',
  },
  selectionLabel: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    marginBottom: 2,
  },
  selectionValue: {
    ...Typography.secondaryMedium,
    color: AdminColors.primaryDark,
    fontWeight: '700',
  },
  selectionValueEmpty: {
    color: AdminColors.textMuted,
    fontWeight: '400',
  },
  selectionDivider: {
    fontSize: 14,
    color: AdminColors.textMuted,
    marginHorizontal: Spacing.xs,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  monthNavButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  monthNavIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: AdminColors.primary,
    lineHeight: 20,
  },
  monthTitle: {
    ...Typography.secondaryMedium,
    color: AdminColors.primaryDark,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: AdminColors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%` as `${number}%`,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.base,
    marginBottom: 2,
  },
  dayCellInRange: {
    backgroundColor: AdminColors.primaryLight,
    borderRadius: 0,
  },
  dayCellEndpoint: {
    backgroundColor: AdminColors.primary,
    borderRadius: BorderRadius.base,
  },
  dayText: {
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  dayTextToday: {
    fontWeight: '700',
    color: AdminColors.primary,
  },
  dayTextEndpoint: {
    color: AdminColors.textOnDark,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  clearButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    marginRight: Spacing.sm,
  },
  clearButtonText: {
    ...Typography.secondaryMedium,
    color: AdminColors.textSecondary,
  },
  applyButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.primary,
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    ...Typography.secondaryMedium,
    color: AdminColors.textOnDark,
    fontWeight: '700',
  },
});
