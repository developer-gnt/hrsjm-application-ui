import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { IconName } from '../../components/icons';

interface ContactInputProps {
  icon: IconName;
  placeholder: string;
  value: string;
  onChangeText?: (text: string) => void;
  error?: string;
  multiline?: boolean;
  /** Dropdown field: read-only input with a trailing chevron. */
  dropdown?: boolean;
  onDropdownPress?: () => void;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
}

/**
 * Reference-locked form input: white surface, hairline grey border, rounded
 * corners, leading navy-muted icon and optional trailing chevron for the
 * dropdown Subject field. Inline error text renders beneath the field.
 */
export const ContactInput: React.FC<ContactInputProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
  dropdown = false,
  onDropdownPress,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {
  const container = (
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
        editable={!dropdown}
        multiline={multiline}
        numberOfLines={multiline ? 4 : undefined}
        scrollEnabled={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={placeholder}
      />
      {dropdown && (
        <AppIcon name="chevron-down" size={15} color={AdminColors.textMuted} />
      )}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {dropdown ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onDropdownPress}
          accessibilityRole="button"
          accessibilityLabel={`${placeholder}: ${value || 'not selected'}`}
        >
          {container}
        </TouchableOpacity>
      ) : (
        container
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
