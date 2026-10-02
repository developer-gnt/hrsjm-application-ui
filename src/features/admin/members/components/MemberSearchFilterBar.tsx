import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { BrandColors } from '../../../../core/theme/colors';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { PressableScale } from '../../../../core/components/common/PressableScale';
import { ListFilter, Search, X } from '../../../../core/components/icons';

interface MemberSearchFilterBarProps {
  value: string;
  onChange: (text: string) => void;
  onOpenFilters?: () => void;
  /** Indicates non-default filters/sort are applied (shows the active dot). */
  filtersActive?: boolean;
  containerStyle?: ViewStyle;
}

const CONTROL_HEIGHT = 46;

/** Search input + Filters button row. Search takes the available width. */
export const MemberSearchFilterBar: React.FC<MemberSearchFilterBarProps> = ({
  value,
  onChange,
  onOpenFilters,
  filtersActive = false,
  containerStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.searchBox, isFocused && styles.searchBoxFocused]}>
        <Search size={20} color={isFocused ? BrandColors.navy : BrandColors.textMuted} strokeWidth={2} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder="Search by name, member ID, phone or email..."
          placeholderTextColor={BrandColors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="Search members"
          testID="members-search-input"
        />
        {value.length > 0 && (
          <PressableScale
            onPress={() => onChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={styles.clearButton}
          >
            <X size={16} color={BrandColors.textMuted} strokeWidth={2.4} />
          </PressableScale>
        )}
      </View>

      <PressableScale
        onPress={onOpenFilters}
        accessibilityRole="button"
        accessibilityLabel="Open filters"
        testID="members-filters-button"
        style={styles.filterButton}
      >
        <ListFilter size={20} color={BrandColors.navy} strokeWidth={2} />
        <Text style={styles.filterText}>Filters</Text>
        {filtersActive && <View style={styles.activeDot} />}
      </PressableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: CONTROL_HEIGHT,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: BorderRadius.lg,
  },
  searchBoxFocused: {
    borderColor: BrandColors.navy,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: BrandColors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CONTROL_HEIGHT,
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: BorderRadius.lg,
  },
  filterText: {
    ...Typography.bodyMedium,
    color: BrandColors.navy,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BrandColors.gold,
    marginLeft: 2,
  },
});

export default MemberSearchFilterBar;
