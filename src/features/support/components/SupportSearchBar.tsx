import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import { FilterIcon, SearchIcon } from './SupportIcons';

interface SupportSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onFilterPress?: () => void;
  activeFilterCount?: number;
}

export const SupportSearchBar: React.FC<SupportSearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  onFilterPress,
  activeFilterCount = 0,
}) => {
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.inputContainer}>
        <View style={styles.searchIconWrap}>
          <SearchIcon size={16} color="#94A3B8" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Search by ticket ID, subject or category..."
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search tickets"
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClear || (() => onChangeText(''))}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Clear search text"
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Button */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilterCount > 0 && styles.filterButtonActive,
        ]}
        onPress={onFilterPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Filters"
      >
        <FilterIcon
          size={14}
          color={activeFilterCount > 0 ? '#FFFFFF' : '#1B3F8F'}
        />
        <Text
          style={[
            styles.filterButtonText,
            activeFilterCount > 0 && styles.filterButtonTextActive,
          ]}
        >
          Filters
        </Text>
        {activeFilterCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 10,
    height: 42,
  },
  searchIconWrap: {
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    height: 42,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: AdminColors.primary,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
