import React, { useEffect, useMemo, useState } from 'react';
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
import { getMatchedHelpTopics, type HelpTopic } from '../data/help-topics';

interface HelpTopicSelectorProps {
  visible: boolean;
  selectedTopic?: HelpTopic | null;
  onClose: () => void;
  onSelect: (topic: HelpTopic) => void;
}

export const HelpTopicSelector: React.FC<HelpTopicSelectorProps> = ({
  visible,
  selectedTopic,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) {
      setQuery('');
    }
  }, [visible]);

  const normalizedQuery = query.trim();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return getMatchedHelpTopics('');
    }

    return getMatchedHelpTopics(normalizedQuery);
  }, [normalizedQuery]);

  const hasSearch = normalizedQuery.length > 0;
  const hasResults = results.length > 0;

  const handleClose = () => {
    Keyboard.dismiss();
    setQuery('');
    onClose();
  };

  const handleSelect = (topic: HelpTopic) => {
    Keyboard.dismiss();
    setQuery('');
    onSelect(topic);
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
            <Text style={styles.sheetTitle}>Select the type of help</Text>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close help topic selector"
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
              placeholder="Search for help..."
              placeholderTextColor={AdminColors.textMuted}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search for help"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            {normalizedQuery ? (
              <TouchableOpacity
                onPress={() => setQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AppIcon name="close" size={17} color={AdminColors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {hasSearch ? (
            <Text style={styles.sectionTitle}>Search Results ({results.length})</Text>
          ) : (
            <Text style={styles.sectionTitle}>Popular Help Topics</Text>
          )}

          {!hasResults ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <AppIcon name="search" size={24} color={AdminColors.primaryDark} />
              </View>
              <Text style={styles.emptyTitle}>Can't find what you're looking for?</Text>
              <Text style={styles.emptyText}>
                Try searching with different keywords or browse all help topics.
              </Text>
              <TouchableOpacity
                onPress={() => setQuery('')}
                style={styles.emptyButton}
                accessibilityRole="button"
                accessibilityLabel="Browse help topics"
              >
                <Text style={styles.emptyButtonText}>Browse Help Topics</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {results.map(topic => {
                const isSelected = topic.id === selectedTopic?.id;

                return (
                  <TouchableOpacity
                    key={topic.id}
                    style={[
                      styles.resultCard,
                      isSelected && styles.resultCardSelected,
                    ]}
                    onPress={() => handleSelect(topic)}
                    accessibilityRole="button"
                    accessibilityLabel={topic.title}
                  >
                    <View
                      style={[
                        styles.topicIconWrap,
                        { backgroundColor: topic.iconBackground },
                      ]}
                    >
                      <AppIcon
                        name={topic.icon}
                        size={20}
                        color={topic.iconColor}
                      />
                    </View>

                    <View style={styles.resultTextWrap}>
                      <Text style={styles.resultTitle}>{topic.title}</Text>
                      <Text style={styles.resultDescription}>{topic.description}</Text>
                    </View>

                    <AppIcon
                      name="chevron-right"
                      size={18}
                      color={AdminColors.primaryDark}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
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
    bottom: 0,
    top: 0,
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
  sheetTitle: {
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
  sectionTitle: {
    fontSize: 17,
    color: AdminColors.primaryDark,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.md,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  resultCardSelected: {
    borderColor: AdminColors.primary,
    backgroundColor: AdminColors.primaryLight,
  },
  topicIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  resultTextWrap: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: AdminColors.textSecondary,
  },
  emptyState: {
    flex: 1,
    backgroundColor: '#EDF6FF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    marginTop: Spacing.sm,
  },
  emptyIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#D9EBFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    color: AdminColors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  emptyButton: {
    backgroundColor: AdminColors.accentGold,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: AdminColors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
});
