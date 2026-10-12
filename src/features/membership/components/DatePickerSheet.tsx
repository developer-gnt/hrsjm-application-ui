import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import { AppBottomSheet } from '../../../core/components/common/AppBottomSheet';

interface DatePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedDate?: string; // 'DD/MM/YYYY' or 'YYYY-MM-DD'
  onSelectDate: (dateStr: string) => void;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function DatePickerSheet({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
}: DatePickerSheetProps) {
  // Parse initial date if present
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(1998);
  const [month, setMonth] = useState<number>(0); // 0-indexed (Jan = 0)
  const [day, setDay] = useState<number>(15);

  // Generate years list (from 1950 to currentYear - 16)
  const years = Array.from({ length: 60 }, (_, i) => currentYear - 16 - i);

  // Calculate days in selected month and year
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleConfirm = () => {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateString = `${formattedDay}/${formattedMonth}/${year}`;
    onSelectDate(dateString);
    onClose();
  };

  return (
    <AppBottomSheet visible={visible} title="Select Date of Birth" onClose={onClose}>
      <View style={styles.container}>
        {/* Selected date display preview */}
        <View style={styles.previewBox}>
          <Icon name="calendar" size={20} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.previewText}>
            {String(day).padStart(2, '0')} {MONTHS[month]} {year}
          </Text>
        </View>

        {/* 3 Wheel / Grid Selectors: Day, Month, Year */}
        <View style={styles.selectorsRow}>
          {/* Day Selector */}
          <View style={styles.selectorCol}>
            <Text style={styles.colHeader}>Day</Text>
            <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
              {days.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.itemBtn, day === d && styles.itemBtnActive]}
                  onPress={() => setDay(d)}>
                  <Text style={[styles.itemText, day === d && styles.itemTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Month Selector */}
          <View style={styles.selectorCol}>
            <Text style={styles.colHeader}>Month</Text>
            <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
              {MONTHS.map((m, idx) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.itemBtn, month === idx && styles.itemBtnActive]}
                  onPress={() => setMonth(idx)}>
                  <Text style={[styles.itemText, month === idx && styles.itemTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Year Selector */}
          <View style={styles.selectorCol}>
            <Text style={styles.colHeader}>Year</Text>
            <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
              {years.map(y => (
                <TouchableOpacity
                  key={y}
                  style={[styles.itemBtn, year === y && styles.itemBtnActive]}
                  onPress={() => setYear(y)}>
                  <Text style={[styles.itemText, year === y && styles.itemTextActive]}>
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Confirm Action Button */}
        <TouchableOpacity
          style={styles.confirmBtn}
          activeOpacity={0.85}
          onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Set Date of Birth</Text>
        </TouchableOpacity>
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#EAF1FE',
    borderRadius: radius.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#D4E2FC',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  selectorsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    height: 190,
    marginBottom: spacing.lg,
  },
  selectorCol: {
    flex: 1,
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 6,
    backgroundColor: '#EEF2F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    textTransform: 'uppercase',
  },
  scrollList: {
    flex: 1,
  },
  itemBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBtnActive: {
    backgroundColor: colors.primary,
  },
  itemText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  itemTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  confirmBtn: {
    backgroundColor: '#0F2860',
    borderRadius: radius.md,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});

export default DatePickerSheet;
