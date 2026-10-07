import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';

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
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by name, application ID, phone or email..."
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
            <Text style={styles.clearIcon}>✕</Text>
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
        <View style={styles.filterIconLines}>
          <View style={[styles.filterBar, styles.filterBarTop, hasActiveFilters && styles.filterBarActive]} />
          <View style={[styles.filterBar, styles.filterBarMid, hasActiveFilters && styles.filterBarActive]} />
          <View style={[styles.filterBar, styles.filterBarBot, hasActiveFilters && styles.filterBarActive]} />
        </View>
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
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    color: '#94A3B8',
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
  clearIcon: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  filterIconLines: {
    height: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterBar: {
    height: 2,
    backgroundColor: '#1E3A8A',
    borderRadius: 1,
  },
  filterBarActive: {
    backgroundColor: '#FFFFFF',
  },
  filterBarTop: {
    width: 14,
  },
  filterBarMid: {
    width: 10,
  },
  filterBarBot: {
    width: 16,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAB308',
  },
});
