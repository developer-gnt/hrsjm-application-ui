import React, { useEffect, useState } from 'react';
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
import { Clock3, X } from '../icons';

interface TimePickerModalProps {
  visible: boolean;
  value: string; // 'HH:mm' format (24h e.g. "14:30") or empty
  onSelect: (time: string) => void;
  onClose: () => void;
  title?: string;
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const QUICK_PRESETS = [
  { label: '09:00 AM', time24: '09:00' },
  { label: '12:00 PM', time24: '12:00' },
  { label: '03:30 PM', time24: '15:30' },
  { label: '06:00 PM', time24: '18:00' },
  { label: '08:00 PM', time24: '20:00' },
];

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  value,
  onSelect,
  onClose,
  title = 'Select Publish Time',
}) => {
  const [selectedHour, setSelectedHour] = useState<number>(10);
  const [selectedMinute, setSelectedMinute] = useState<string>('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [activeTab, setActiveTab] = useState<'hour' | 'minute'>('hour');

  useEffect(() => {
    if (visible) {
      if (value && value.includes(':')) {
        const [hStr, mStr] = value.split(':');
        const hNum = parseInt(hStr, 10);
        if (!isNaN(hNum)) {
          setPeriod(hNum >= 12 ? 'PM' : 'AM');
          const h12 = hNum % 12 === 0 ? 12 : hNum % 12;
          setSelectedHour(h12);
        }
        if (mStr) {
          const nearest5 = String(Math.round(parseInt(mStr, 10) / 5) * 5 % 60).padStart(2, '0');
          setSelectedMinute(MINUTES.includes(mStr) ? mStr : nearest5);
        }
      } else {
        const now = new Date();
        const currentH = now.getHours();
        setPeriod(currentH >= 12 ? 'PM' : 'AM');
        const h12 = currentH % 12 === 0 ? 12 : currentH % 12;
        setSelectedHour(h12);
        setSelectedMinute('00');
      }
      setActiveTab('hour');
    }
  }, [visible, value]);

  const to24Hour = (h12: number, m: string, p: 'AM' | 'PM'): string => {
    let h24 = h12 % 12;
    if (p === 'PM') h24 += 12;
    return `${String(h24).padStart(2, '0')}:${m}`;
  };

  const handleConfirm = () => {
    const formatted = to24Hour(selectedHour, selectedMinute, period);
    onSelect(formatted);
    onClose();
  };

  const handlePresetSelect = (time24: string) => {
    onSelect(time24);
    onClose();
  };

  const handleClear = () => {
    onSelect('');
    onClose();
  };

  const displayTime = `${String(selectedHour).padStart(2, '0')}:${selectedMinute} ${period}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconWrap}>
              <Clock3 size={18} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSelected}>{displayTime}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Presets Bar */}
          <View style={styles.presetsBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
              {QUICK_PRESETS.map(preset => (
                <TouchableOpacity
                  key={preset.time24}
                  style={styles.presetChip}
                  onPress={() => handlePresetSelect(preset.time24)}
                >
                  <Text style={styles.presetText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Display & Selector Tabs */}
          <View style={styles.timePreviewCard}>
            <View style={styles.digitsRow}>
              <TouchableOpacity
                style={[styles.digitBox, activeTab === 'hour' && styles.digitBoxActive]}
                onPress={() => setActiveTab('hour')}
              >
                <Text style={[styles.digitText, activeTab === 'hour' && styles.digitTextActive]}>
                  {String(selectedHour).padStart(2, '0')}
                </Text>
                <Text style={styles.digitSub}>Hour</Text>
              </TouchableOpacity>

              <Text style={styles.colonSeparator}>:</Text>

              <TouchableOpacity
                style={[styles.digitBox, activeTab === 'minute' && styles.digitBoxActive]}
                onPress={() => setActiveTab('minute')}
              >
                <Text style={[styles.digitText, activeTab === 'minute' && styles.digitTextActive]}>
                  {selectedMinute}
                </Text>
                <Text style={styles.digitSub}>Minute</Text>
              </TouchableOpacity>
            </View>

            {/* AM / PM Segment */}
            <View style={styles.periodSegment}>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'AM' && styles.periodBtnActive]}
                onPress={() => setPeriod('AM')}
              >
                <Text style={[styles.periodText, period === 'AM' && styles.periodTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'PM' && styles.periodBtnActive]}
                onPress={() => setPeriod('PM')}
              >
                <Text style={[styles.periodText, period === 'PM' && styles.periodTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Grid Selector */}
          <View style={styles.selectorBody}>
            <Text style={styles.gridSectionTitle}>
              {activeTab === 'hour' ? 'Select Hour (1 - 12)' : 'Select Minute (00 - 55)'}
            </Text>

            {activeTab === 'hour' ? (
              <View style={styles.gridContainer}>
                {HOURS.map(h => {
                  const isSelected = selectedHour === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[styles.gridCell, isSelected && styles.gridCellSelected]}
                      onPress={() => {
                        setSelectedHour(h);
                        setActiveTab('minute');
                      }}
                    >
                      <Text style={[styles.gridCellText, isSelected && styles.gridCellTextSelected]}>
                        {h}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {MINUTES.map(m => {
                  const isSelected = selectedMinute === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.gridCell, isSelected && styles.gridCellSelected]}
                      onPress={() => setSelectedMinute(m)}
                    >
                      <Text style={[styles.gridCellText, isSelected && styles.gridCellTextSelected]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleClear} style={styles.footerClearBtn}>
              <Text style={styles.footerClearText}>Clear</Text>
            </TouchableOpacity>

            <View style={styles.footerRightBtns}>
              <TouchableOpacity onPress={onClose} style={styles.footerCancelBtn}>
                <Text style={styles.footerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} style={styles.footerConfirmBtn}>
                <Text style={styles.footerConfirmText}>Set Time</Text>
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
    fontSize: 13,
    color: '#93C5FD',
    marginTop: 1,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  presetsBar: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    paddingVertical: Spacing.xs,
  },
  presetsScroll: {
    paddingHorizontal: Spacing.base,
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#EEF2F6',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.navyDeep,
  },
  timePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    gap: 16,
    backgroundColor: '#F1F5F9',
  },
  digitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  digitBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 64,
  },
  digitBoxActive: {
    borderColor: BrandColors.navy,
    backgroundColor: '#EFF6FF',
  },
  digitText: {
    fontSize: 26,
    fontWeight: '800',
    color: BrandColors.textPrimary,
  },
  digitTextActive: {
    color: BrandColors.navy,
  },
  digitSub: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  colonSeparator: {
    fontSize: 26,
    fontWeight: '800',
    color: BrandColors.textSecondary,
    marginBottom: 12,
  },
  periodSegment: {
    backgroundColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: 3,
    gap: 3,
  },
  periodBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.sm,
  },
  periodBtnActive: {
    backgroundColor: BrandColors.navy,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.textSecondary,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  selectorBody: {
    padding: Spacing.base,
    minHeight: 180,
  },
  gridSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  gridCell: {
    width: '22%',
    height: 40,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  gridCellSelected: {
    backgroundColor: BrandColors.navy,
    borderColor: BrandColors.navy,
  },
  gridCellText: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  gridCellTextSelected: {
    color: '#FFFFFF',
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
  footerConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default TimePickerModal;
