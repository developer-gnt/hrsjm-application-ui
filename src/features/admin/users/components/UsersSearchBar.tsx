import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';

interface UsersSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFilterPress?: () => void;
  activeFilterCount?: number;
}

export const UsersSearchBar: React.FC<UsersSearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  onFilterPress,
  activeFilterCount = 0,
}) => {
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by name, email, phone or user ID..."
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search users by name, email, phone or user ID"
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Clear search input"
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters Button */}
      <TouchableOpacity
        style={[
          styles.filtersButton,
          activeFilterCount > 0 && styles.filtersButtonActive,
        ]}
        onPress={onFilterPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
      >
        <Text style={styles.filterIcon}>⚙️</Text>
        <Text
          style={[
            styles.filterText,
            activeFilterCount > 0 && styles.filterTextActive,
          ]}
        >
          Filters
        </Text>
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
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
    marginVertical: Spacing.xs,
  },
  searchBox: {
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
    fontSize: 14,
    marginRight: 8,
    color: '#64748B',
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    height: 44,
    gap: 6,
  },
  filtersButtonActive: {
    borderColor: '#0F2860',
    backgroundColor: '#EFF6FF',
  },
  filterIcon: {
    fontSize: 14,
    color: '#1E3A8A',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  filterTextActive: {
    color: '#0F2860',
  },
  badge: {
    backgroundColor: '#0F2860',
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
