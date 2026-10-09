import React, { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import { DateFilter } from '../types/ticket.types';

interface SupportFilterModalProps {
  visible: boolean;
  dateFilter?: DateFilter | null;
  onClose: () => void;
  onApply: (filter: DateFilter | null) => void;
  onReset: () => void;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad2 = (n: number) => String(n).padStart(2, '0');

const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${pad2(month + 1)}-${pad2(day)}`;

const parseDateKey = (key?: string | null) => {
  if (!key) return null;
  const d = new Date(`${key}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
};

export const formatDisplayDate = (key?: string | null) => {
  const d = parseDateKey(key);
  if (!d) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const SupportFilterModal: React.FC<SupportFilterModalProps> = ({
  visible,
  dateFilter,
  onClose,
  onApply,
  onReset,
}) => {
  // Mode: 'single' (Single Day Date) or 'range' (From - To)
  const [mode, setMode] = useState<'single' | 'range'>(dateFilter?.mode || 'single');
  const [singleDate, setSingleDate] = useState<string | undefined>(dateFilter?.singleDate);
  const [fromDate, setFromDate] = useState<string | undefined>(dateFilter?.fromDate);
  const [toDate, setToDate] = useState<string | undefined>(dateFilter?.toDate);
  const [rangeSelecting, setRangeSelecting] = useState<'from' | 'to'>('from');

  // Calendar month view: default to Sep 2026 (matching fixtures)
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(8); // 8 is September (0-indexed)

  useEffect(() => {
    if (visible) {
      const currentMode = dateFilter?.mode || 'single';
      setMode(currentMode);
      setSingleDate(dateFilter?.singleDate);
      setFromDate(dateFilter?.fromDate);
      setToDate(dateFilter?.toDate);
      setRangeSelecting('from');

      // Anchor calendar view to current selection if available
      const anchorKey = dateFilter?.singleDate || dateFilter?.fromDate || '2026-09-20';
      const anchorDate = parseDateKey(anchorKey);
      if (anchorDate) {
        setViewYear(anchorDate.getFullYear());
        setViewMonth(anchorDate.getMonth());
      }
    }
  }, [visible, dateFilter]);

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

  const handleDayPress = (dayKey: string) => {
    if (mode === 'single') {
      setSingleDate(dayKey);
    } else {
      // Range mode (From - To)
      if (rangeSelecting === 'from') {
        setFromDate(dayKey);
        if (toDate && dayKey > toDate) {
          setToDate(undefined);
        }
        setRangeSelecting('to');
      } else {
        if (fromDate && dayKey < fromDate) {
          // If selected before fromDate, swap or set as fromDate
          setFromDate(dayKey);
          setToDate(fromDate);
        } else {
          setToDate(dayKey);
        }
        setRangeSelecting('from');
      }
    }
  };

  const handleApply = () => {
    if (mode === 'single') {
      if (!singleDate) {
        onApply(null);
      } else {
        onApply({ mode: 'single', singleDate });
      }
    } else {
      if (!fromDate && !toDate) {
        onApply(null);
      } else {
        onApply({ mode: 'range', fromDate, toDate });
      }
    }
    onClose();
  };

  const handleReset = () => {
    setSingleDate(undefined);
    setFromDate(undefined);
    setToDate(undefined);
    onReset();
    onClose();
  };

  // Calendar calculations
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = Array.from({ length: firstWeekday }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter by Date</Text>
              <Text style={styles.subtitle}>Select a single date or a From - To range</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Close filter modal"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'single' && styles.modeTabActive]}
              onPress={() => setMode('single')}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityLabel="Single Day Date Mode"
            >
              <Text style={[styles.modeTabText, mode === 'single' && styles.modeTabTextActive]}>
                📅 Single Day Date
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode === 'range' && styles.modeTabActive]}
              onPress={() => setMode('range')}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityLabel="From - To Range Mode"
            >
              <Text style={[styles.modeTabText, mode === 'range' && styles.modeTabTextActive]}>
                🗓️ From — To
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Status Summary Banner */}
            {mode === 'single' ? (
              <View style={styles.selectedBox}>
                <Text style={styles.selectedBoxLabel}>Selected Single Date:</Text>
                <Text style={styles.selectedBoxValue}>
                  {singleDate ? formatDisplayDate(singleDate) : 'Tap a date on the calendar below'}
                </Text>
              </View>
            ) : (
              <View style={styles.rangeRow}>
                <TouchableOpacity
                  style={[
                    styles.rangeBox,
                    rangeSelecting === 'from' && styles.rangeBoxActive,
                  ]}
                  onPress={() => setRangeSelecting('from')}
                  activeOpacity={0.8}
                  accessibilityLabel="Select From Date"
                >
                  <Text style={styles.rangeBoxLabel}>From (Start):</Text>
                  <Text style={styles.rangeBoxValue}>
                    {fromDate ? formatDisplayDate(fromDate) : 'Select date'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.rangeArrow}>→</Text>

                <TouchableOpacity
                  style={[
                    styles.rangeBox,
                    rangeSelecting === 'to' && styles.rangeBoxActive,
                  ]}
                  onPress={() => setRangeSelecting('to')}
                  activeOpacity={0.8}
                  accessibilityLabel="Select To Date"
                >
                  <Text style={styles.rangeBoxLabel}>To (End):</Text>
                  <Text style={styles.rangeBoxValue}>
                    {toDate ? formatDisplayDate(toDate) : 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Calendar Month Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                onPress={handlePrevMonth}
                style={styles.monthNavBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Previous Month"
              >
                <Text style={styles.monthNavBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity
                onPress={handleNextMonth}
                style={styles.monthNavBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Next Month"
              >
                <Text style={styles.monthNavBtnText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Weekday Row */}
            <View style={styles.weekdaysRow}>
              {WEEKDAY_LABELS.map(w => (
                <Text key={w} style={styles.weekdayText}>
                  {w}
                </Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View style={styles.calendarGrid}>
              {leadingBlanks.map(i => (
                <View key={`blank-${i}`} style={styles.dayCell} />
              ))}

              {monthDays.map(day => {
                const dayKey = toDateKey(viewYear, viewMonth, day);

                let isSelected = false;
                let isInRange = false;
                let isRangeStart = false;
                let isRangeEnd = false;

                if (mode === 'single') {
                  isSelected = singleDate === dayKey;
                } else {
                  isRangeStart = fromDate === dayKey;
                  isRangeEnd = toDate === dayKey;
                  isSelected = isRangeStart || isRangeEnd;
                  if (fromDate && toDate && dayKey > fromDate && dayKey < toDate) {
                    isInRange = true;
                  }
                }

                return (
                  <TouchableOpacity
                    key={dayKey}
                    style={[
                      styles.dayCell,
                      isInRange && styles.dayCellInRange,
                      isRangeStart && toDate && styles.dayCellRangeStart,
                      isRangeEnd && fromDate && styles.dayCellRangeEnd,
                    ]}
                    onPress={() => handleDayPress(dayKey)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Date ${dayKey}`}
                  >
                    <View
                      style={[
                        styles.dayNumberWrap,
                        isSelected && styles.dayNumberWrapSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumberText,
                          isSelected && styles.dayNumberTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Presets */}
            <Text style={styles.presetHeading}>Quick Presets:</Text>
            <View style={styles.presetsRow}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => {
                  setMode('single');
                  setSingleDate('2026-09-20');
                }}
              >
                <Text style={styles.presetChipText}>20 Sep 2026</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => {
                  setMode('range');
                  setFromDate('2026-09-15');
                  setToDate('2026-09-21');
                }}
              >
                <Text style={styles.presetChipText}>15 - 21 Sep</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => {
                  setMode('range');
                  setFromDate('2026-09-01');
                  setToDate('2026-09-30');
                }}
              >
                <Text style={styles.presetChipText}>Full Month (Sep)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Reset Filter"
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Apply Filter"
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    width: '100%',
    maxWidth: 380,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2860',
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  closeText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
    padding: 4,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: AdminColors.primary,
    fontWeight: '700',
  },
  scrollArea: {
    maxHeight: 380,
  },
  selectedBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.md,
    padding: 10,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  selectedBoxLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  selectedBoxValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B3F8F',
    marginTop: 2,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  rangeBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rangeBoxActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  rangeBoxLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  rangeBoxValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  rangeArrow: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  monthNavBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  monthNavBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 18,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellInRange: {
    backgroundColor: '#EFF6FF',
  },
  dayCellRangeStart: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    backgroundColor: '#EFF6FF',
  },
  dayCellRangeEnd: {
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#EFF6FF',
  },
  dayNumberWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberWrapSelected: {
    backgroundColor: AdminColors.primary,
  },
  dayNumberText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#1E293B',
  },
  dayNumberTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  presetHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 10,
    marginBottom: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  applyButton: {
    flex: 1.5,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.primary,
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
