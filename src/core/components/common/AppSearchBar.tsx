import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
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
      <View style={styles.searchIcon}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Circle
            cx={11}
            cy={11}
            r={7}
            stroke="#123B7A"
            strokeWidth={2.2}
          />
          <Path
            d="M20 20L16.5 16.5"
            stroke="#123B7A"
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </Svg>
      </View>
      <TextInput
        value={internalValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="never"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {internalValue.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    paddingVertical: 0,
    height: '100%',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  clearIcon: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '800',
  },
});
