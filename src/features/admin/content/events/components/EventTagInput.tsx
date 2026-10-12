import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';

interface EventTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  error?: string;
  maxTags?: number;
  placeholder?: string;
  helperText?: string;
}

/** Tags input: enter to add, tap a chip's ✕ to remove (local UI only). */
export const EventTagInput: React.FC<EventTagInputProps> = ({
  tags,
  onChange,
  error,
  maxTags = 6,
  placeholder = 'Add tags and press enter',
  helperText = 'Add relevant tags to help people find this content',
}) => {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const tag = draft.trim();
    if (!tag || tags.length >= maxTags || tags.includes(tag)) {
      setDraft('');
      return;
    }
    onChange([...tags, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(existing => existing !== tag));
  };

  return (
    <View>
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={addTag}
          onBlur={addTag}
          placeholder={placeholder}
          placeholderTextColor={AdminColors.textMuted}
          style={styles.input}
          returnKeyType="done"
          blurOnSubmit={false}
          accessibilityLabel={placeholder}
        />
      </View>

      {tags.length > 0 ? (
        <View style={styles.chipWrap}>
          {tags.map(tag => (
            <View key={tag} style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>
                {tag}
              </Text>
              <TouchableOpacity
                onPress={() => removeTag(tag)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel={`Remove tag ${tag}`}
              >
                <Text style={styles.chipRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  inputError: {
    borderColor: AdminColors.error,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: AdminColors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    maxWidth: 160,
  },
  chipText: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
  },
  chipRemove: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  helperText: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    marginTop: Spacing.xs,
  },
  errorText: {
    ...Typography.secondary,
    color: AdminColors.error,
    marginTop: Spacing.xs,
  },
});