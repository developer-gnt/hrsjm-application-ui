import React, { useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
import { searchRights } from '../data/rights-content';

export interface KnowYourRightsScreenProps {
  onOpenHome?: () => void;
  onOpenContact?: () => void;
  onOpenAbout?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenRight: (rightId: string) => void;
}

export const KnowYourRightsScreen: React.FC<KnowYourRightsScreenProps> = ({
  onOpenHome,
  onOpenContact,
  onOpenAbout,
  onOpenEvents,
  onOpenNews,
  onOpenRight,
}) => {
  const searchRef = useRef<TextInputInstance | null>(null);
  const [query, setQuery] = useState('');
  const visibleRights = useMemo(() => searchRights(query), [query]);

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome?.();
    } else if (tab.id === 'contact') {
      onOpenContact?.();
    } else if (tab.id === 'about') {
      onOpenAbout?.();
    } else if (tab.id === 'events') {
      onOpenEvents?.();
    } else if (tab.id === 'news') {
      onOpenNews?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        onBack={onOpenHome}
        onPressSearch={() => searchRef.current?.focus()}
        onPressNotifications={() => undefined}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              Know Your{'\n'}
              <Text style={styles.heroTitleAccent}>Rights</Text>
            </Text>
            <Text style={styles.heroDescription}>
              Learn about your rights, understand their importance and know how
              HRSJM supports you.
            </Text>
          </View>
          <View style={styles.searchBar}>
            <AppIcon name="search" size={17} color={AdminColors.primaryDark} />
            <TextInput
              ref={searchRef}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              placeholder="Search rights (e.g. women, education, RTI...)"
              placeholderTextColor={AdminColors.textMuted}
              returnKeyType="search"
              accessibilityLabel="Search rights topics"
            />
          </View>
        </View>

        <View style={styles.rightsGrid}>
          {visibleRights.map((right, index) => (
            <TouchableOpacity
              key={right.id}
              style={[
                styles.rightCard,
                { backgroundColor: right.color },
                index === visibleRights.length - 1 && styles.lastCard,
              ]}
              onPress={() => onOpenRight(right.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Open ${right.title}. ${right.description}`}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: right.iconColor },
                ]}
              >
                <AppIcon
                  name={right.icon}
                  size={22}
                  color={AdminColors.primaryDark}
                />
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {right.title}
              </Text>
              <Text style={styles.cardDescription} numberOfLines={3}>
                {right.description}
              </Text>
              <View style={styles.cardArrow}>
                <AppIcon
                  name="arrow-right"
                  size={12}
                  color={AdminColors.primaryDark}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {visibleRights.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No rights found</Text>
            <Text style={styles.emptyDescription}>
              Try another keyword or clear the search.
            </Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setQuery('')}
              accessibilityRole="button"
            >
              <Text style={styles.clearButtonText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
      <UserBottomNavigation activeTab="rights" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  hero: {
    height: 180,
    position: 'relative',
    justifyContent: 'center',
    backgroundColor: AdminColors.primaryDark,
    marginBottom: Spacing.md,
  },
  heroCopy: {
    width: '70%',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  heroTitle: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontSize: 32,
    lineHeight: 35,
    fontWeight: '700',
  },
  heroTitleAccent: {
    color: AdminColors.accentGold,
  },
  heroDescription: {
    marginTop: Spacing.xs,
    color: AdminColors.textOnDark,
    fontSize: 11,
    lineHeight: 15,
  },
  searchBar: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    bottom: -Spacing.md,
    zIndex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    color: AdminColors.primaryDark,
    fontSize: 10,
  },
  rightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  rightCard: {
    width: '31.5%',
    minHeight: 106,
    padding: Spacing.xs,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    position: 'relative',
    ...Shadows.card,
  },
  lastCard: {
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 16,
  },
  cardTitle: {
    marginTop: Spacing.xs,
    color: AdminColors.primaryDark,
    fontSize: 9.5,
    lineHeight: 11,
    fontWeight: '700',
  },
  cardDescription: {
    marginTop: 2,
    paddingRight: Spacing.sm,
    color: AdminColors.textSecondary,
    fontSize: 8,
    lineHeight: 10,
  },
  cardArrow: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  emptyState: {
    alignItems: 'center',
    margin: Spacing.base,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
  },
  emptyTitle: {
    color: AdminColors.primaryDark,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDescription: {
    marginTop: Spacing.xs,
    color: AdminColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  clearButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primaryLight,
  },
  clearButtonText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
});
