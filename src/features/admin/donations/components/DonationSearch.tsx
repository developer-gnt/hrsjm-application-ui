import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ListFilter } from '../../../../core/components/icons';
import {
  AdminColors,
  Spacing,
  BorderRadius,
  AppSearchBar,
} from '../../../../core';

interface DonationSearchProps {
  value?: string;
  /** Called debounced (AppSearchBar debounces by 400ms). */
  onSearch: (text: string) => void;
  onFiltersPress: () => void;
}

/**
 * Search + Filters row with matched 46px heights, clean single-line placeholder,
 * and unified alignment.
 */
export const DonationSearch: React.FC<DonationSearchProps> = ({
  value,
  onSearch,
  onFiltersPress,
}) => {
  return (
    <View style={styles.row}>
      <AppSearchBar
        placeholder="Search by donor, ID, phone, amount..."
        value={value}
        onSearch={onSearch}
        containerStyle={styles.search}
      />
      <TouchableOpacity
        onPress={onFiltersPress}
        style={styles.filtersButton}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Open filters"
      >
        <ListFilter size={18} color="#06294D" strokeWidth={2} />
        <Text style={styles.filtersText}>Filters</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    gap: 8,
  },
  search: {
    flex: 1,
    height: 46,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.2,
    borderColor: '#DCE4EC',
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#DCE4EC',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  filtersText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
});
