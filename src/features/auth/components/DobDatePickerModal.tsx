import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

interface DobDatePickerModalProps {
  visible: boolean;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad2 = (n: number) => String(n).padStart(2, '0');

export const DobDatePickerModal: React.FC<DobDatePickerModalProps> = ({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
}) => {
  // Parse existing date or default to year 2000
  const initialDate = (() => {
    if (selectedDate) {
      const parts = selectedDate.split(/[-/]/);
      if (parts.length === 3) {
        // Assume DD-MM-YYYY
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          return new Date(y, m, d);
        }
      }
    }
    return new Date(2000, 0, 1);
  })();

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDate.getDate());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const leadingBlanks = Array.from({ length: firstWeekday }, (_, i) => i);

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

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const formatted = `${pad2(day)}-${pad2(viewMonth + 1)}-${viewYear}`;
    onSelectDate(formatted);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setShowYearPicker(!showYearPicker)}
              style={styles.monthYearSelector}
              activeOpacity={0.7}
            >
              <Text style={styles.headerTitle}>
                {MONTH_NAMES[viewMonth]} {viewYear} ▼
              </Text>
            </TouchableOpacity>

            {!showYearPicker && (
              <View style={styles.navRow}>
                <TouchableOpacity
                  onPress={handlePrevMonth}
                  style={styles.navButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.navArrow}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNextMonth}
                  style={styles.navButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.navArrow}>›</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {showYearPicker ? (
            /* Year Picker Scroll List */
            <ScrollView style={styles.yearList} showsVerticalScrollIndicator={true}>
              <View style={styles.yearGrid}>
                {years.map(y => (
                  <TouchableOpacity
                    key={y}
                    onPress={() => {
                      setViewYear(y);
                      setShowYearPicker(false);
                    }}
                    style={[
                      styles.yearItem,
                      y === viewYear && styles.yearItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.yearText,
                        y === viewYear && styles.yearTextSelected,
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <>
              {/* Weekday headers */}
              <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS.map(w => (
                  <Text key={w} style={styles.weekdayText}>
                    {w}
                  </Text>
                ))}
              </View>

              {/* Days grid */}
              <View style={styles.daysGrid}>
                {leadingBlanks.map(b => (
                  <View key={`b-${b}`} style={styles.dayCell} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const isSelected =
                    selectedDay === day &&
                    viewMonth === initialDate.getMonth() &&
                    viewYear === initialDate.getFullYear();

                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => handleSelectDay(day)}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Footer close button */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  monthYearSelector: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
  },
  navRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: 18,
    color: '#0F2860',
    fontWeight: '700',
    marginTop: -2,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 6,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 18,
  },
  dayCellSelected: {
    backgroundColor: '#EAA224',
  },
  dayText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#0F2860',
    fontWeight: '800',
  },
  yearList: {
    maxHeight: 240,
    marginTop: 10,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  yearItem: {
    width: '30%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginVertical: 3,
  },
  yearItemSelected: {
    backgroundColor: '#EAA224',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  yearTextSelected: {
    color: '#0F2860',
    fontWeight: '800',
  },
  footer: {
    marginTop: 14,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});
