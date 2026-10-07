import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { DatePickerModal } from './DatePickerModal';
import { Calendar } from '../icons';
import { formatDate } from '../../utils';

export interface AppDatePickerInputProps {
  label?: string;
  value: string; // ISO format: YYYY-MM-DD
  onChange: (date: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  title?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
  showQuickPresets?: boolean;
}

const getTodayIso = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getYesterdayIso = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AppDatePickerInput: React.FC<AppDatePickerInputProps> = ({
  label,
  value,
  onChange,
  required,
  error,
  placeholder = 'Select date (YYYY-MM-DD)',
  title = 'Select Date',
  helperText,
  containerStyle,
  disabled = false,
  minYear = 2000,
  maxYear = new Date().getFullYear() + 5,
  showQuickPresets = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const formattedDisplay = value ? formatDate(value) : '';
  const todayIso = getTodayIso();
  const yesterdayIso = getYesterdayIso();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredStar}> *</Text>}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.inputContainer,
          error ? styles.errorBorder : null,
          disabled && styles.disabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label || 'Select Date'}
      >
        <View style={styles.leftBox}>
          <Calendar size={18} color={AdminColors.primary} />
          {value ? (
            <View style={styles.dateTextGroup}>
              <Text style={styles.primaryDateText}>{formattedDisplay}</Text>
              <Text style={styles.isoDateBadge}>{value}</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          )}
        </View>

        <View style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Change</Text>
        </View>
      </TouchableOpacity>

      {showQuickPresets && !disabled && (
        <View style={styles.presetsRow}>
          <TouchableOpacity
            style={[styles.presetChip, value === todayIso && styles.presetChipActive]}
            onPress={() => onChange(todayIso)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.presetChipText,
                value === todayIso && styles.presetChipTextActive,
              ]}
            >
              ⚡ Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.presetChip,
              value === yesterdayIso && styles.presetChipActive,
            ]}
            onPress={() => onChange(yesterdayIso)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.presetChipText,
                value === yesterdayIso && styles.presetChipTextActive,
              ]}
            >
              Yesterday
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      <DatePickerModal
        visible={modalVisible}
        value={value}
        title={title}
        minYear={minYear}
        maxYear={maxYear}
        onSelect={selectedDate => {
          onChange(selectedDate);
          setModalVisible(false);
        }}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
  },
  requiredStar: {
    color: AdminColors.error,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    minHeight: 50,
  },
  disabled: {
    opacity: 0.6,
  },
  errorBorder: {
    borderColor: AdminColors.error,
    borderWidth: 1.5,
  },
  leftBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  calendarIcon: {
    fontSize: 18,
  },
  dateTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  primaryDateText: {
    ...Typography.bodyMedium,
    color: AdminColors.textPrimary,
    fontWeight: '600',
  },
  isoDateBadge: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    backgroundColor: AdminColors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  placeholderText: {
    ...Typography.body,
    color: AdminColors.textMuted,
  },
  actionBtn: {
    backgroundColor: AdminColors.primary + '12',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  actionBtnText: {
    ...Typography.badge,
    color: AdminColors.primary,
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: AdminColors.background,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  presetChipActive: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: AdminColors.textSecondary,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  errorText: {
    ...Typography.secondary,
    color: AdminColors.error,
    marginTop: 4,
  },
  helperText: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 4,
  },
});
