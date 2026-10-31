import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { IconName } from '../../components/icons';

export interface ContactInputProps {
  icon: IconName;
  placeholder: string;
  value: string;
  onChangeText?: (text: string) => void;
  error?: string;
  multiline?: boolean;
  /** Dropdown field: interactive selector button with a trailing chevron. */
  dropdown?: boolean;
  dropdownOpen?: boolean;
  onDropdownPress?: () => void;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
}

/**
 * Form input: white surface, hairline grey border, rounded
 * corners, leading navy-muted icon and optional trailing chevron for dropdowns.
 */
export const ContactInput: React.FC<ContactInputProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
  dropdown = false,
  dropdownOpen = false,
  onDropdownPress,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {
  return (
    <View style={styles.wrapper}>
      {dropdown ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onDropdownPress}
          style={[
            styles.field,
            error ? styles.fieldError : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${placeholder}: ${value || 'not selected'}`}
        >
          <AppIcon name={icon} size={17} color={AdminColors.textMuted} />
          <Text
            style={[
              styles.input,
              !value ? styles.placeholderText : null,
              styles.dropdownText,
            ]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
          <View style={dropdownOpen ? styles.chevronRotated : undefined}>
            <AppIcon name="chevron-down" size={15} color={AdminColors.textMuted} />
          </View>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            styles.field,
            multiline && styles.fieldMultiline,
            error ? styles.fieldError : null,
          ]}
        >
          <AppIcon name={icon} size={17} color={AdminColors.textMuted} />
          <TextInput
            style={[styles.input, multiline && styles.inputMultiline]}
            placeholder={placeholder}
            placeholderTextColor={AdminColors.textSecondary}
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
            numberOfLines={multiline ? 4 : undefined}
            scrollEnabled={multiline}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            accessibilityLabel={placeholder}
          />
        </View>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base + 2,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    minHeight: 112,
    paddingVertical: Spacing.md - 2,
  },
  fieldError: {
    borderColor: AdminColors.error,
  },
  input: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
    color: AdminColors.textPrimary,
    paddingVertical: Spacing.sm + 1,
    paddingHorizontal: Spacing.sm,
    includeFontPadding: false,
  },
  dropdownText: {
    paddingVertical: Spacing.sm + 4,
  },
  placeholderText: {
    color: AdminColors.textSecondary,
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  inputMultiline: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 10.5,
    lineHeight: 14,
    color: AdminColors.error,
    marginTop: 4,
    marginLeft: 2,
  },
});
