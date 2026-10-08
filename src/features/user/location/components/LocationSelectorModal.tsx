import React, { useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, FontFamilies, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';

interface LocationSelectorModalProps {
  visible: boolean;
  title: string;
  options: string[];
  searchPlaceholder: string;
  selectedValue?: string | null;
  onClose: () => void;
  onSelect: (value: string) => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  visible,
  title,
  options,
  searchPlaceholder,
  selectedValue,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return options;
    }

    return options.filter(option =>
      option.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  const handleClose = () => {
    Keyboard.dismiss();
    setQuery('');
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel={`Close ${title.toLowerCase()}`}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AppIcon name="close" size={20} color={AdminColors.primaryDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchField}>
            <AppIcon name="search" size={18} color={AdminColors.primaryDark} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={AdminColors.textMuted}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel={searchPlaceholder}
            />
            {query.trim() ? (
              <TouchableOpacity
                onPress={() => setQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Clear location search"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AppIcon name="close" size={17} color={AdminColors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => {
                const isSelected = option === selectedValue;

                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setQuery('');
                      onSelect(option);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={option}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                    <AppIcon
                      name="chevron-right"
                      size={18}
                      color={AdminColors.primaryDark}
                    />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No matching results found.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 96, 0.45)',
  },
  sheetWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: AdminColors.cardSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '82%',
    maxHeight: '86%',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    lineHeight: 26,
    color: AdminColors.primaryDark,
    fontWeight: '700',
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.background,
    borderWidth: 1,
    borderColor: '#D9E4FF',
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.sm,
    minHeight: 46,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: AdminColors.primaryDark,
    fontSize: 14,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  optionsContainer: {
    paddingBottom: Spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: 12,
    backgroundColor: AdminColors.cardSurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  optionSelected: {
    borderColor: AdminColors.primary,
    backgroundColor: AdminColors.primaryLight,
  },
  optionText: {
    flex: 1,
    color: AdminColors.primaryDark,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    color: AdminColors.textSecondary,
    fontSize: 13,
  },
});
