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
import {
  AdminColors,
  BorderRadius,
  Spacing,
  UserFontFamilies,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import { getMatchedHelpTopics, type HelpTopic } from '../data/help-topics';

export interface HelpTopicSelectorProps {
  visible: boolean;
  selectedTopic?: HelpTopic | null;
  selectedTopics?: HelpTopic[];
  multi?: boolean;
  onClose: () => void;
  onSelect?: (topic: HelpTopic) => void;
  onSelectMultiple?: (topics: HelpTopic[]) => void;
}

export const HelpTopicSelector: React.FC<HelpTopicSelectorProps> = ({
  visible,
  selectedTopic,
  selectedTopics,
  multi,
  onClose,
  onSelect,
  onSelectMultiple,
}) => {
  const isMulti = multi ?? Boolean(onSelectMultiple);
  const [query, setQuery] = useState('');
  const [internalSelected, setInternalSelected] = useState<HelpTopic[]>([]);

  useEffect(() => {
    if (visible) {
      if (selectedTopics && selectedTopics.length > 0) {
        setInternalSelected(selectedTopics);
      } else if (selectedTopic) {
        setInternalSelected([selectedTopic]);
      } else {
        setInternalSelected([]);
      }
      setQuery('');
    }
  }, [visible, selectedTopics, selectedTopic]);

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

  const handleToggleTopic = (topic: HelpTopic) => {
    if (!isMulti) {
      Keyboard.dismiss();
      setQuery('');
      onSelect?.(topic);
      onSelectMultiple?.([topic]);
      onClose();
      return;
    }

    setInternalSelected(prev => {
      const exists = prev.some(t => t.id === topic.id);
      if (exists) {
        return prev.filter(t => t.id !== topic.id);
      }
      return [...prev, topic];
    });
  };

  const handleConfirmMultiple = () => {
    Keyboard.dismiss();
    setQuery('');
    onSelectMultiple?.(internalSelected);
    if (internalSelected.length > 0 && onSelect) {
      onSelect(internalSelected[0]);
    }
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
            <View>
              <Text style={styles.sheetTitle}>
                {isMulti ? 'Select Help Categories' : 'Select the type of help'}
              </Text>
              {isMulti && (
                <Text style={styles.sheetSubtitle}>
                  You can select multiple topics that describe your issue
                </Text>
              )}
            </View>
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
              keyboardShouldPersistTaps="handled"
            >
              {results.map(topic => {
                const isSelected = isMulti
                  ? internalSelected.some(t => t.id === topic.id)
                  : topic.id === selectedTopic?.id;

                return (
                  <TouchableOpacity
                    key={topic.id}
                    style={[
                      styles.resultCard,
                      isSelected && styles.resultCardSelected,
                    ]}
                    onPress={() => handleToggleTopic(topic)}
                    accessibilityRole="button"
                    accessibilityLabel={topic.title}
                    activeOpacity={0.7}
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
                      <Text style={[styles.resultTitle, isSelected && styles.resultTitleSelected]}>
                        {topic.title}
                      </Text>
                      <Text style={styles.resultDescription}>{topic.description}</Text>
                    </View>

                    {isMulti ? (
                      <View
                        style={[
                          styles.checkboxCircle,
                          isSelected && styles.checkboxCircleSelected,
                        ]}
                      >
                        {isSelected && (
                          <AppIcon name="check" size={13} color="#FFFFFF" />
                        )}
                      </View>
                    ) : (
                      <AppIcon
                        name="chevron-right"
                        size={18}
                        color={AdminColors.primaryDark}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {isMulti && (
            <View style={styles.sheetFooter}>
              <View style={styles.sheetFooterInfo}>
                <Text style={styles.selectedCountText}>
                  {internalSelected.length} {internalSelected.length === 1 ? 'topic' : 'topics'} selected
                </Text>
                {internalSelected.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setInternalSelected([])}
                    accessibilityRole="button"
                    accessibilityLabel="Clear selection"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  internalSelected.length === 0 && styles.confirmButtonDisabled,
                ]}
                disabled={internalSelected.length === 0}
                onPress={handleConfirmMultiple}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Done selecting topics"
              >
                <Text style={styles.confirmButtonText}>
                  Done {internalSelected.length > 0 ? `(${internalSelected.length} Selected)` : ''}
                </Text>
              </TouchableOpacity>
            </View>
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
    maxHeight: '88%',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontFamily: UserFontFamilies.heading,
    fontSize: 20,
    lineHeight: 25,
    color: AdminColors.primaryDark,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: AdminColors.textSecondary,
    marginTop: 2,
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
    fontSize: 16,
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
    backgroundColor: '#F0F6FF',
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
  resultTitleSelected: {
    color: AdminColors.primary,
  },
  resultDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: AdminColors.textSecondary,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginLeft: Spacing.xs,
  },
  checkboxCircleSelected: {
    backgroundColor: AdminColors.primaryDark,
    borderColor: AdminColors.primaryDark,
  },
  sheetFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: AdminColors.cardSurface,
  },
  sheetFooterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: AdminColors.error,
  },
  confirmButton: {
    backgroundColor: AdminColors.accentGold,
    borderRadius: BorderRadius.base,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: AdminColors.primaryDark,
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
