import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { Search, ListFilter, X } from '../../../../core/components/icons';

interface MembershipSearchBarProps {
  query: string;
  onChangeQuery: (text: string) => void;
  onFilterPress?: () => void;
  hasActiveFilters?: boolean;
}

export const MembershipSearchBar: React.FC<MembershipSearchBarProps> = ({
  query,
  onChangeQuery,
  onFilterPress,
  hasActiveFilters = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.inputWrapper}>
        <Search size={18} color="#64748B" strokeWidth={2} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search by name, ID, phone..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={onChangeQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
        />
        {query.length > 0 ? (
          <TouchableOpacity
            onPress={() => onChangeQuery('')}
            style={styles.clearButton}
            activeOpacity={0.7}
            accessibilityLabel="Clear search text"
          >
            <X size={14} color="#64748B" strokeWidth={2.2} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters Button */}
      <TouchableOpacity
        style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
        onPress={onFilterPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Open Filters"
      >
        <ListFilter
          size={18}
          color="#06294D"
          strokeWidth={2}
        />
        <Text style={[styles.filterButtonText, hasActiveFilters && styles.filterButtonTextActive]}>
          Filters
        </Text>
        {hasActiveFilters ? <View style={styles.activeDot} /> : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginVertical: Spacing.sm,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#06294D',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
  filterButtonTextActive: {
    color: '#06294D',
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06294D',
  },
});

