import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { debounce } from '../../utils/debounce';

interface AppSearchBarProps {
  placeholder?: string;
  value?: string;
  onSearch: (text: string) => void;
  debounceMs?: number;
  containerStyle?: ViewStyle;
}

export const AppSearchBar: React.FC<AppSearchBarProps> = ({
  placeholder = 'Search by name, ID, or keywords...',
  value: controlledValue,
  onSearch,
  debounceMs = 400,
  containerStyle,
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');

  // Keep internal state synced if controlled value changes externally
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounced trigger callback
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      onSearch(text);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  const handleChangeText = (text: string) => {
    setInternalValue(text);
    debouncedSearch(text);
  };

  const handleClear = () => {
    setInternalValue('');
    onSearch('');
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        value={internalValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={AdminColors.textMuted}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {internalValue.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: AdminColors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  clearIcon: {
    fontSize: 12,
    color: AdminColors.textMuted,
    fontWeight: '700',
  },
});
