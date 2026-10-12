import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Shadows, Spacing } from '../../../../core/theme';
import { Calendar, ChevronLeft, ChevronRight, X } from '../../../../core/components/icons';

export type PassbookPeriodSelection =
  | { type: 'PRESET'; preset: 'ALL_TIME' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'THIS_FY'; label: string; fromDate?: string; toDate?: string }
  | { type: 'MONTH'; year: number; month: number; label: string; fromDate: string; toDate: string };

interface PassbookMonthPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLabel: string;
  onSelectPeriod: (selection: PassbookPeriodSelection) => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const PassbookMonthPickerModal: React.FC<PassbookMonthPickerModalProps> = ({
  visible,
  onClose,
  selectedLabel,
  onSelectPeriod,
}) => {
  const currentYear = new Date().getFullYear();
  const [activeYear, setActiveYear] = useState(currentYear);

  const handleSelectMonth = (monthIndex: number) => {
    const fromDate = new Date(activeYear, monthIndex, 1).toISOString().split('T')[0];
    const toDate = new Date(activeYear, monthIndex + 1, 0).toISOString().split('T')[0];
    const label = `${MONTH_NAMES[monthIndex]} ${activeYear}`;

    onSelectPeriod({
      type: 'MONTH',
      year: activeYear,
      month: monthIndex,
      label,
      fromDate,
      toDate,
    });
    onClose();
  };

  const handleSelectPreset = (
    preset: 'ALL_TIME' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'THIS_FY',
  ) => {
    const now = new Date();
    if (preset === 'ALL_TIME') {
      onSelectPeriod({
        type: 'PRESET',
        preset,
        label: 'All Records',
        fromDate: undefined,
        toDate: undefined,
      });
    } else if (preset === 'THIS_MONTH') {
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      onSelectPeriod({
        type: 'PRESET',
        preset,
        label: `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`,
        fromDate: from,
        toDate: to,
      });
    } else if (preset === 'LAST_MONTH') {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      const lmMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lmYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      onSelectPeriod({
        type: 'PRESET',
        preset,
        label: `${MONTH_NAMES[lmMonth]} ${lmYear}`,
        fromDate: from,
        toDate: to,
      });
    } else if (preset === 'THIS_QUARTER') {
      const from = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      onSelectPeriod({
        type: 'PRESET',
        preset,
        label: 'This Quarter',
        fromDate: from,
        toDate: to,
      });
    } else {
      const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      onSelectPeriod({
        type: 'PRESET',
        preset,
        label: `FY ${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`,
        fromDate: `${fyStartYear}-04-01`,
        toDate: `${fyStartYear + 1}-03-31`,
      });
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleWrap}>
                  <View style={styles.calIconBox}>
                    <Calendar size={18} color="#0F2860" />
                  </View>
                  <Text style={styles.modalTitle}>Select Ledger Period</Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Presets Pills */}
              <Text style={styles.sectionLabel}>Quick Filters</Text>
              <View style={styles.presetsGrid}>
                {[
                  { key: 'THIS_MONTH', label: 'This Month' },
                  { key: 'LAST_MONTH', label: 'Last Month' },
                  { key: 'THIS_QUARTER', label: 'This Quarter' },
                  { key: 'THIS_FY', label: 'Current FY' },
                  { key: 'ALL_TIME', label: 'All Records' },
                ].map((item) => {
                  const isSelected = selectedLabel.includes(item.label) || (item.key === 'ALL_TIME' && selectedLabel === 'All Records');
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.presetChip,
                        isSelected && styles.presetChipActive,
                      ]}
                      onPress={() => handleSelectPreset(item.key as any)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          isSelected && styles.presetChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Year Switcher */}
              <View style={styles.divider} />
              <View style={styles.yearSwitcher}>
                <TouchableOpacity
                  onPress={() => setActiveYear(y => y - 1)}
                  style={styles.yearNavBtn}
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={18} color="#0F2860" />
                </TouchableOpacity>

                <Text style={styles.yearTitle}>{activeYear}</Text>

                <TouchableOpacity
                  onPress={() => setActiveYear(y => y + 1)}
                  style={styles.yearNavBtn}
                  activeOpacity={0.7}
                >
                  <ChevronRight size={18} color="#0F2860" />
                </TouchableOpacity>
              </View>

              {/* 12 Months Grid */}
              <View style={styles.monthsGrid}>
                {MONTH_NAMES.map((mName, idx) => {
                  const fullMatch = `${mName} ${activeYear}`;
                  const isSelected = selectedLabel === fullMatch;
                  const isCurrentMonth =
                    new Date().getMonth() === idx && new Date().getFullYear() === activeYear;

                  return (
                    <TouchableOpacity
                      key={mName}
                      style={[
                        styles.monthCell,
                        isCurrentMonth && styles.monthCellCurrent,
                        isSelected && styles.monthCellSelected,
                      ]}
                      onPress={() => handleSelectMonth(idx)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.monthCellText,
                          isCurrentMonth && styles.monthCellTextCurrent,
                          isSelected && styles.monthCellTextSelected,
                        ]}
                      >
                        {mName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2860',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  presetChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  yearSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  yearNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.5,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  monthCell: {
    width: '22%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCellCurrent: {
    borderColor: '#EAA224',
    borderWidth: 1.5,
  },
  monthCellSelected: {
    backgroundColor: '#EAA224',
    borderColor: '#EAA224',
  },
  monthCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  monthCellTextCurrent: {
    color: '#B45309',
    fontWeight: '700',
  },
  monthCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default PassbookMonthPickerModal;
