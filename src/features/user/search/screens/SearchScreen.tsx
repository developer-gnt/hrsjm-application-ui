import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { searchApplicationContent } from '../data/global-search';
import type { GlobalSearchResult } from '../types/search.types';

export interface SearchScreenProps {
  onBack: () => void;
  onSelectResult: (result: GlobalSearchResult) => void;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenRights?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenContact?: () => void;
  onOpenNotifications?: () => void;
}

const getResultCategory = (kind: GlobalSearchResult['kind']): string => {
  switch (kind) {
    case 'event':
      return 'Event';
    case 'news':
      return 'News';
    case 'right':
      return 'Rights Education';
    case 'work-area':
      return 'What We Do';
    case 'about':
      return 'About';
  }
};

const getResultImage = (
  result: GlobalSearchResult,
): React.ComponentProps<typeof Image>['source'] | undefined => {
  switch (result.kind) {
    case 'event':
      return result.event.image;
    case 'news':
      return result.article.image;
    case 'right':
      return undefined;
    case 'work-area':
    case 'about':
      return undefined;
  }
};

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onBack,
  onSelectResult,
  initialQuery = '',
  onQueryChange,
  onOpenHome,
  onOpenAbout,
  onOpenRights,
  onOpenEvents,
  onOpenNews,
  onOpenContact,
  onOpenNotifications,
}) => {
  const inputRef = useRef<TextInputInstance | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setResults([]);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);
    const timeout = setTimeout(() => {
      setResults(searchApplicationContent(normalizedQuery));
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome?.();
    } else if (tab.id === 'about') {
      onOpenAbout?.();
    } else if (tab.id === 'rights') {
      onOpenRights?.();
    } else if (tab.id === 'events') {
      onOpenEvents?.();
    } else if (tab.id === 'news') {
      onOpenNews?.();
    } else if (tab.id === 'contact') {
      onOpenContact?.();
    }
  };

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    onQueryChange?.(nextQuery);
  };

  const renderResult = ({ item }: { item: GlobalSearchResult }) => {
    const image = getResultImage(item);
    return (
      <Pressable
        style={styles.resultCard}
        onPress={() => {
          Keyboard.dismiss();
          onSelectResult(item);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title}, ${getResultCategory(item.kind)}. ${item.excerpt}`}
      >
        {image ? (
          <Image source={image} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.thumbnailFallback}>
            <AppIcon
              name={item.kind === 'right' ? 'scale' : 'file-text'}
              size={20}
              color={AdminColors.primaryDark}
            />
          </View>
        )}
        <View style={styles.resultCopy}>
          <Text style={styles.resultCategory}>
            {getResultCategory(item.kind).toUpperCase()}
          </Text>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.resultExcerpt} numberOfLines={2}>
            {item.excerpt}
          </Text>
        </View>
        <AppIcon
          name="chevron-right"
          size={18}
          color={AdminColors.primaryDark}
        />
      </Pressable>
    );
  };

  const normalizedQuery = query.trim();

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        onBack={onBack}
        onPressSearch={() => inputRef.current?.focus()}
        onPressNotifications={onOpenNotifications}
        preferLocalActions
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.searchBar}>
          <AppIcon name="search" size={20} color={AdminColors.primaryDark} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={updateQuery}
            placeholder="Search events, news, rights..."
            placeholderTextColor={AdminColors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search HRSJM content"
          />
          {query.length > 0 ? (
            <Pressable
              style={styles.clearButton}
              onPress={() => {
                updateQuery('');
                inputRef.current?.focus();
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
            >
              <AppIcon name="close" size={18} color={AdminColors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            <View style={styles.headingBlock}>
              <Text style={styles.heading}>Search HRSJM</Text>
              <Text style={styles.supporting}>
                Search events, news, rights education and HRSJM work areas.
              </Text>
            </View>
          }
          ListEmptyComponent={
            isSearching ? (
              <View style={styles.state}>
                <ActivityIndicator color={AdminColors.primary} />
                <Text style={styles.stateText}>Searching available content…</Text>
              </View>
            ) : normalizedQuery ? (
              <View style={styles.state}>
                <View style={styles.stateIcon}>
                  <AppIcon
                    name="search"
                    size={22}
                    color={AdminColors.primaryDark}
                  />
                </View>
                <Text style={styles.stateTitle}>No results found</Text>
                <Text style={styles.stateText}>
                  Try a different word or check your spelling.
                </Text>
              </View>
            ) : (
              <View style={styles.state}>
                <View style={styles.stateIcon}>
                  <AppIcon
                    name="search"
                    size={22}
                    color={AdminColors.primaryDark}
                  />
                </View>
                <Text style={styles.stateText}>
                  Enter a search term to find available HRSJM content.
                </Text>
              </View>
            )
          }
        />
      </KeyboardAvoidingView>
      <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  flex: {
    flex: 1,
  },
  searchBar: {
    minHeight: 48,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
  },
  searchInput: {
    flex: 1,
    minHeight: 46,
    color: AdminColors.textPrimary,
    fontSize: 14,
  },
  clearButton: {
    minWidth: 32,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  headingBlock: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  heading: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '700',
  },
  supporting: {
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  thumbnail: {
    width: 62,
    height: 62,
    borderRadius: BorderRadius.sm,
  },
  thumbnailFallback: {
    width: 62,
    height: 62,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.accentGoldLight,
  },
  resultCopy: {
    flex: 1,
    minWidth: 0,
  },
  resultCategory: {
    color: AdminColors.accentGold,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  resultTitle: {
    color: AdminColors.primaryDark,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 3,
  },
  resultExcerpt: {
    color: AdminColors.textSecondary,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 3,
  },
  state: {
    flex: 1,
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  stateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  stateTitle: {
    color: AdminColors.primaryDark,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  stateText: {
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 5,
  },
});
