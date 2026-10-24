import React from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { AdminColors, BorderRadius, DesignTokens, Spacing, Typography } from '../../../../core/theme';
import { getDatePresets } from '../utils/reportDates';
import type { DatePresetKey, DateRangePreset } from '../types/reports.types';

interface ReportDateSelectorProps {
  selectedPreset: DatePresetKey;
  onSelectPreset: (preset: DateRangePreset) => void;
  subText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const ReportDateSelector: React.FC<ReportDateSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  subText,
  containerStyle,
  contentContainerStyle,
}) => {
  const presets = getDatePresets();

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
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
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Select date range ${preset.label}`}
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
    marginBottom: Spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#DCE4EC',
  },
  chipSelected: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#34516D',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subText: {
    ...Typography.caption,
    color: '#718096',
    paddingHorizontal: Spacing.base,
    marginTop: 4,
  },
});
