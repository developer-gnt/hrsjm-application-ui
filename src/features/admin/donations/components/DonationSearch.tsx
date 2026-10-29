import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ListFilter } from '../../../../core/components/icons';
import {
  AdminColors,
  Spacing,
  BorderRadius,
  AppSearchBar,
  AppButton,
} from '../../../../core';

/** Three-line funnel icon matching the reference Filters button. */
const FunnelIcon = () => (
  <View style={funnelStyles.wrap}>
    <View style={funnelStyles.barWide} />
    <View style={funnelStyles.barMedium} />
    <View style={funnelStyles.barNarrow} />
  </View>
);

const funnelStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  barWide: {
    width: 16,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: AdminColors.primary,
    marginBottom: 3,
  },
  barMedium: {
    width: 11,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: AdminColors.primary,
    marginBottom: 3,
  },
  barNarrow: {
    width: 6,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: AdminColors.primary,
  },
});

interface DonationSearchProps {
  value?: string;
  /** Called debounced (AppSearchBar debounces by 400ms). */
  onSearch: (text: string) => void;
  onFiltersPress: () => void;
}

/**
 * Search + Filters row matching the approved reference proportions.
 */
export const DonationSearch: React.FC<DonationSearchProps> = ({
  value,
  onSearch,
  onFiltersPress,
}) => {
  return (
    <View style={styles.row}>
      <AppSearchBar
        placeholder="Search by donor name, member ID, phone, UPI ID or amount..."
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
    marginVertical: Spacing.base,
  },
  search: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.lg,
  },
  filtersButton: {
    marginLeft: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filtersText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
});