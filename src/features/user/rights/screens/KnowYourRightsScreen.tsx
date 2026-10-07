import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon, HrsjmLogoMark } from '../../components';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { WomensRightsSection } from '../components/WomensRightsSection';

const RIGHTS_HERO_IMAGE = require('../../../../assets/images/contact-cta-hands.jpg');

interface RightsTopic {
  id: string;
  title: string;
  description: string;
  icon: 'users' | 'scale' | 'file-text' | 'user' | 'child-care' | 'clock' | 'handshake' | 'graduation-cap' | 'doc-search' | 'megaphone';
}

interface SearchInputHandle {
  focus: () => void;
}

const RIGHTS_TOPICS: RightsTopic[] = [
  { id: 'human', title: 'Human Rights', description: 'Basic rights and freedoms every human being has.', icon: 'users' },
  { id: 'civil', title: 'Civil Rights', description: 'Rights related to equal treatment and protection under law.', icon: 'scale' },
  { id: 'fundamental', title: 'Fundamental Rights', description: 'Constitutional rights guaranteed to every citizen of India.', icon: 'file-text' },
  { id: 'women', title: "Women's Rights", description: 'Rights, protection and support for women.', icon: 'user' },
  { id: 'children', title: "Children's Rights", description: 'Rights and welfare of children and young people.', icon: 'child-care' },
  { id: 'senior', title: 'Senior Citizen Rights', description: 'Rights and schemes for elderly citizens.', icon: 'clock' },
  { id: 'minority', title: 'Minority Rights', description: 'Rights of religious, linguistic and other minorities.', icon: 'users' },
  { id: 'labour', title: 'Labour Rights', description: 'Rights and protections for workers.', icon: 'handshake' },
  { id: 'education', title: 'Right to Education', description: 'Right to free and compulsory education.', icon: 'graduation-cap' },
  { id: 'information', title: 'Right to Information', description: 'Right to access information from public authorities.', icon: 'doc-search' },
  { id: 'speech', title: 'Freedom of Speech', description: 'Right to express opinions and ideas freely.', icon: 'megaphone' },
  { id: 'liberties', title: 'Civil Liberties', description: 'Rights to personal freedom and privacy in daily life.', icon: 'scale' },
];

export interface KnowYourRightsScreenProps {
  onOpenHome?: () => void;
  onOpenContact?: () => void;
  /** Opens the About page (About tab in the shared six-tab navigation). */
  onOpenAbout?: () => void;
}

export const KnowYourRightsScreen: React.FC<KnowYourRightsScreenProps> = ({
  onOpenHome,
  onOpenContact,
  onOpenAbout,
}) => {
  const insets = useSafeAreaInsets();
  const searchRef = useRef<SearchInputHandle | null>(null);
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const visibleTopics = RIGHTS_TOPICS.filter(topic =>
    `${topic.title} ${topic.description}`.toLowerCase().includes(normalizedQuery),
  );

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome?.();
    } else if (tab.id === 'contact') {
      onOpenContact?.();
    } else if (tab.id === 'about') {
      onOpenAbout?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing.sm) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onOpenHome}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
          >
            <AppIcon name="chevron-left" size={22} color={AdminColors.primaryDark} />
          </TouchableOpacity>
          <HrsjmLogoMark height={38} />
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => searchRef.current?.focus()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Focus rights search"
          >
            <AppIcon name="search" size={22} color={AdminColors.primaryDark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroImageMask} pointerEvents="none">
            <Image
              source={RIGHTS_HERO_IMAGE}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              accessible={false}
            />
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Know Your</Text>
            <Text style={styles.heroTitleAccent}>Rights</Text>
            <Text style={styles.heroDescription}>
              Learn about your rights, understand their importance and know how HRSJM supports you.
            </Text>
          </View>
          <View style={styles.searchBar}>
            <AppIcon name="search" size={17} color={AdminColors.primaryDark} />
            <TextInput
              ref={input => {
                searchRef.current = input;
              }}
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

        {visibleTopics.length > 0 ? (
          <View style={styles.topicGrid}>
            {visibleTopics.map(topic => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicCard}
                onPress={() => Alert.alert(topic.title, topic.description)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${topic.title}. ${topic.description}`}
              >
                <View style={styles.topicIconCircle}>
                  <View style={styles.topicIconTint} />
                  <AppIcon name={topic.icon} size={21} color={AdminColors.primaryDark} />
                </View>
                <Text style={styles.topicTitle} numberOfLines={2}>
                  {topic.title}
                </Text>
                <Text style={styles.topicDescription} numberOfLines={3}>
                  {topic.description}
                </Text>
                <View style={styles.topicArrow}>
                  <AppIcon name="arrow-right" size={11} color={AdminColors.primaryDark} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyState}>No rights topics found.</Text>
        )}
        {normalizedQuery.length === 0 && <WomensRightsSection />}
      </ScrollView>

      <UserBottomNavigation activeTab="rights" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.cardSurface,
  },
  header: {
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 34,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  hero: {
    height: 190,
    marginBottom: Spacing.xl,
    justifyContent: 'flex-start',
    backgroundColor: AdminColors.primaryDark,
  },
  heroImageMask: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  heroContent: {
    width: '64%',
    paddingTop: Spacing.lg,
    paddingLeft: Spacing.lg,
  },
  heroTitle: {
    fontFamily: FontFamilies.serif,
    fontSize: 34,
    lineHeight: 37,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  heroTitleAccent: {
    fontFamily: FontFamilies.serif,
    fontSize: 34,
    lineHeight: 37,
    fontWeight: '700',
    color: AdminColors.accentGold,
  },
  heroDescription: {
    marginTop: Spacing.sm,
    fontSize: 12,
    lineHeight: 17,
    color: AdminColors.textOnDark,
  },
  searchBar: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    bottom: -Spacing.md,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    ...Shadows.card,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    fontSize: 11,
    color: AdminColors.primaryDark,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  topicCard: {
    width: '31.5%',
    height: 116,
    padding: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: AdminColors.accentGoldLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
    ...Shadows.card,
  },
  topicIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  topicIconTint: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,
    backgroundColor: AdminColors.accentGold,
    opacity: 0.16,
  },
  topicTitle: {
    alignSelf: 'stretch',
    marginTop: Spacing.xs,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    textAlign: 'left',
  },
  topicDescription: {
    alignSelf: 'stretch',
    marginTop: 2,
    paddingRight: Spacing.lg,
    fontSize: 8.5,
    lineHeight: 10.5,
    color: AdminColors.textSecondary,
  },
  topicArrow: {
    position: 'absolute',
    right: Spacing.xs,
    bottom: Spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: Spacing.xl,
    color: AdminColors.textSecondary,
    textAlign: 'center',
  },
});