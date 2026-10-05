import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../core/theme';
import { getDatePresets } from '../utils/reportDates';
import type { DatePresetKey, DateRangePreset } from '../types/reports.types';

interface ReportDateSelectorProps {
  selectedPreset: DatePresetKey;
  onSelectPreset: (preset: DateRangePreset) => void;
  subText?: string;
}

export const ReportDateSelector: React.FC<ReportDateSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  subText,
}) => {
  const presets = getDatePresets();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {presets.map(preset => {
          const isSelected = preset.key === selectedPreset;
          return (
            <TouchableOpacity
              key={preset.key}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
              onPress={() => onSelectPreset(preset)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {subText ? (
        <Text style={styles.subText}>{subText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: AdminColors.primaryDark,
    borderColor: AdminColors.primaryDark,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subText: {
    ...Typography.caption,
    color: '#64748B',
    paddingHorizontal: Spacing.md,
    marginTop: 4,
  },
});
