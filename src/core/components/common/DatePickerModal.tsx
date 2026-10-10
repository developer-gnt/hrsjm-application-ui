import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BrandColors } from '../../theme/colors';
import { BorderRadius, Shadows, Spacing } from '../../theme/spacing';
import { Calendar, ChevronDown, X } from '../icons';

interface DatePickerModalProps {
  visible: boolean;
  value: string; // YYYY-MM-DD or empty
  onSelect: (date: string) => void;
  onClose: () => void;
  title?: string;
  maxYear?: number;
  minYear?: number;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad2 = (n: number) => String(n).padStart(2, '0');

const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${pad2(month + 1)}-${pad2(day)}`;

const parseDateString = (str: string) => {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return { year: y, month: m, day: d };
    }
  }
  return null;
};

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  value,
  onSelect,
  onClose,
  title = 'Select Date',
  maxYear = new Date().getFullYear() + 5,
  minYear = 1940,
}) => {
  const today = useMemo(() => new Date(), []);
  const initialParsed = useMemo(() => parseDateString(value), [value]);

  const isDob = title.toLowerCase().includes('birth') || title.toLowerCase().includes('dob');

  const [selectedKey, setSelectedKey] = useState<string>(value || '');
  const [viewYear, setViewYear] = useState<number>(
    initialParsed?.year ?? (isDob ? today.getFullYear() - 25 : today.getFullYear())
  );
  const [viewMonth, setViewMonth] = useState<number>(
    initialParsed?.month ?? today.getMonth()
  );
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedKey(value || '');
      const parsed = parseDateString(value);
      if (parsed) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      } else {
        setViewYear(isDob ? today.getFullYear() - 25 : today.getFullYear());
        setViewMonth(today.getMonth());
      }
      setIsYearPickerOpen(false);
    }
  }, [visible, value, isDob, today]);

  const yearsList = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [maxYear, minYear]);

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = Array.from({ length: firstWeekday }, (_, i) => i);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDaySelect = (day: number) => {
    const key = toDateKey(viewYear, viewMonth, day);
    setSelectedKey(key);
  };

  const handleConfirm = () => {
    if (selectedKey) {
      onSelect(selectedKey);
    }
    onClose();
  };

  const handleClear = () => {
    setSelectedKey('');
    onSelect('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconWrap}>
              <Calendar size={18} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSelected}>
                {selectedKey ? selectedKey : 'No date selected'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Month / Year Bar */}
          <View style={styles.monthYearBar}>
            <TouchableOpacity
              onPress={() => setIsYearPickerOpen((prev) => !prev)}
              style={styles.monthYearToggle}
              activeOpacity={0.7}
            >
              <Text style={styles.monthYearText}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <ChevronDown
                size={16}
                color={BrandColors.navyDeep}
                style={[
                  styles.chevronIcon,
                  isYearPickerOpen && styles.chevronRotated,
                ]}
              />
            </TouchableOpacity>

            {!isYearPickerOpen && (
              <View style={styles.navArrows}>
                <TouchableOpacity
                  onPress={handlePrevMonth}
                  style={styles.arrowBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={styles.arrowText}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNextMonth}
                  style={styles.arrowBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={styles.arrowText}>›</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Quick Year & Month Picker View */}
          {isYearPickerOpen ? (
            <View style={styles.yearPickerContainer}>
              <Text style={styles.pickerSectionLabel}>Select Month</Text>
              <View style={styles.monthGrid}>
                {MONTH_NAMES.map((mName, idx) => {
                  const isMonthSelected = viewMonth === idx;
                  return (
                    <TouchableOpacity
                      key={mName}
                      style={[
                        styles.monthChip,
                        isMonthSelected && styles.monthChipSelected,
                      ]}
                      onPress={() => {
                        setViewMonth(idx);
                      }}
                    >
                      <Text
                        style={[
                          styles.monthChipText,
                          isMonthSelected && styles.monthChipTextSelected,
                        ]}
                      >
                        {mName.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.pickerSectionLabel, { marginTop: 12 }]}>
                Select Year
              </Text>
              <ScrollView
                style={styles.yearScroll}
                contentContainerStyle={styles.yearGrid}
                showsVerticalScrollIndicator={false}
              >
                {yearsList.map((yr) => {
                  const isYrSelected = viewYear === yr;
                  return (
                    <TouchableOpacity
                      key={yr}
                      style={[
                        styles.yearChip,
                        isYrSelected && styles.yearChipSelected,
                      ]}
                      onPress={() => {
                        setViewYear(yr);
                        setIsYearPickerOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.yearChipText,
                          isYrSelected && styles.yearChipTextSelected,
                        ]}
                      >
                        {yr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            /* Calendar Days Grid */
            <View style={styles.calendarBody}>
              {/* Weekday labels */}
              <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS.map((w) => (
                  <Text key={w} style={styles.weekdayText}>
                    {w}
                  </Text>
                ))}
              </View>

              {/* Days */}
              <View style={styles.daysGrid}>
                {leadingBlanks.map((b) => (
                  <View key={`blank-${b}`} style={styles.dayCell} />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const currentKey = toDateKey(viewYear, viewMonth, day);
                    const isSelected = selectedKey === currentKey;
                    const isToday =
                      today.getFullYear() === viewYear &&
                      today.getMonth() === viewMonth &&
                      today.getDate() === day;

                    return (
                      <TouchableOpacity
                        key={currentKey}
                        style={[
                          styles.dayCell,
                          styles.dayButton,
                          isSelected && styles.dayButtonSelected,
                          isToday && !isSelected && styles.dayButtonToday,
                        ]}
                        onPress={() => handleDaySelect(day)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.dayTextSelected,
                            isToday && !isSelected && styles.dayTextToday,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>
          )}

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleClear} style={styles.footerClearBtn}>
              <Text style={styles.footerClearText}>Clear</Text>
            </TouchableOpacity>

            <View style={styles.footerRightBtns}>
              <TouchableOpacity onPress={onClose} style={styles.footerCancelBtn}>
                <Text style={styles.footerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                style={[
                  styles.footerConfirmBtn,
                  !selectedKey && styles.footerConfirmBtnDisabled,
                ]}
                disabled={!selectedKey}
              >
                <Text style={styles.footerConfirmText}>Set Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 29, 58, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: BrandColors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.elevated,
  },
  header: {
    backgroundColor: BrandColors.navyDeep,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  headerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSelected: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 1,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthYearBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    backgroundColor: '#F8FAFC',
  },
  monthYearToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#EEF2F6',
  },
  monthYearText: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.navyDeep,
  },
  chevronIcon: {
    marginTop: 1,
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  navArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.navyDeep,
    lineHeight: 22,
  },
  calendarBody: {
    padding: Spacing.base,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayButton: {
    borderRadius: 19,
  },
  dayButtonSelected: {
    backgroundColor: BrandColors.navy,
  },
  dayButtonToday: {
    borderWidth: 1,
    borderColor: BrandColors.navy,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextToday: {
    color: BrandColors.navy,
    fontWeight: '700',
  },
  yearPickerContainer: {
    padding: Spacing.base,
    maxHeight: 280,
  },
  pickerSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthChip: {
    width: '23%',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  monthChipSelected: {
    backgroundColor: BrandColors.navy,
    borderColor: BrandColors.navy,
  },
  monthChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  monthChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  yearScroll: {
    maxHeight: 120,
    marginTop: 4,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: Spacing.sm,
  },
  yearChip: {
    width: '23%',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  yearChipSelected: {
    backgroundColor: BrandColors.navy,
    borderColor: BrandColors.navy,
  },
  yearChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  yearChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    backgroundColor: '#F8FAFC',
  },
  footerClearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  footerClearText: {
    fontSize: 13,
    color: BrandColors.danger,
    fontWeight: '600',
  },
  footerRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  footerCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  footerConfirmBtn: {
    backgroundColor: BrandColors.navy,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  footerConfirmBtnDisabled: {
    opacity: 0.5,
  },
  footerConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DatePickerModal;
