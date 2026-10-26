import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, FontFamilies, Spacing } from '../../../../core';

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
          placeholderTextColor="#718096"
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
    marginVertical: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: BorderRadius.button,
    paddingHorizontal: 12,
    minHeight: 44,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    color: '#718096',
  },
  input: {
    flex: 1,
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#0B2F52',
    paddingVertical: 0,
  },
  clearButton: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    color: '#718096',
    fontWeight: '700',
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: BorderRadius.button,
    paddingHorizontal: 14,
    minHeight: 44,
    height: 44,
    gap: 6,
  },
  filtersButtonActive: {
    borderColor: '#06294D',
    backgroundColor: '#EDF2F7',
  },
  filterIcon: {
    fontSize: 14,
    color: '#06294D',
  },
  filterText: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#06294D',
  },
  filterTextActive: {
    color: '#06294D',
  },
  badge: {
    backgroundColor: '#06294D',
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: FontFamilies.sans,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
