import React from 'react';
import { View, StyleSheet } from 'react-native';
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
      <AppButton
        title="Filters"
        icon={<FunnelIcon />}
        onPress={onFiltersPress}
        variant="secondary"
        size="md"
        style={styles.filtersButton}
        textStyle={styles.filtersText}
      />
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
    minHeight: 50,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
  },
  filtersText: {
    color: AdminColors.primary,
    fontSize: 14,
  },
});