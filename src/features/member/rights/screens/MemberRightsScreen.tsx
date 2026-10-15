import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../../user/components';
import { HomeHeader } from '../../../user/home/components/HomeHeader';
import { RIGHTS_INDEX } from '../data/rights-content';
import type { RightsIndexItem } from '../types/rights.types';

export interface MemberRightsScreenProps {
  onBack?: () => void;
  onOpenRight: (rightId: string) => void;
  onFileComplaint?: () => void;
  onContactSupport?: () => void;
}

type RightsCategoryKey =
  | 'ALL'
  | 'CONSTITUTIONAL'
  | 'WOMEN_CHILD'
  | 'CIVIL_JUSTICE'
  | 'LABOUR_WELFARE';

interface CategoryFilterTab {
  key: RightsCategoryKey;
  label: string;
}

const CATEGORY_TABS: CategoryFilterTab[] = [
  { key: 'ALL', label: 'All Rights' },
  { key: 'CONSTITUTIONAL', label: 'Constitutional' },
  { key: 'WOMEN_CHILD', label: 'Women & Child' },
  { key: 'CIVIL_JUSTICE', label: 'Civil & Justice' },
  { key: 'LABOUR_WELFARE', label: 'Labour & Welfare' },
];

const RIGHT_METADATA: Record<
  string,
  {
    category: RightsCategoryKey;
    categoryLabel: string;
    legalReference: string;
    highlights: string[];
    accentColor: string;
    badgeBg: string;
  }
> = {
  'human-rights': {
    category: 'LABOUR_WELFARE',
    categoryLabel: 'Universal Protection',
    legalReference: 'UDHR 1948 • NHRC Guidelines',
    highlights: ['Life with Dignity', 'Freedom from Torture', 'Universal Equality'],
    accentColor: '#B45309',
    badgeBg: '#FEF3C7',
  },
  'civil-rights': {
    category: 'CIVIL_JUSTICE',
    categoryLabel: 'Civil & Justice',
    legalReference: 'Articles 14–18 • Equal Protection',
    highlights: ['Equal Treatment', 'Non-Discrimination', 'Access to Law'],
    accentColor: '#1D4ED8',
    badgeBg: '#DBEAFE',
  },
  'fundamental-rights': {
    category: 'CONSTITUTIONAL',
    categoryLabel: 'Constitutional',
    legalReference: 'Part III of Constitution • Articles 12–35',
    highlights: ['Right to Equality', 'Right to Freedom', 'Article 32 Writs'],
    accentColor: '#92400E',
    badgeBg: '#FDE68A',
  },
  'womens-rights': {
    category: 'WOMEN_CHILD',
    categoryLabel: 'Women & Child',
    legalReference: 'DV Act 2005 • Article 15(3) • POSH Act',
    highlights: ['Workplace Safety', 'Protection from Violence', 'Equal Inheritance'],
    accentColor: '#BE185D',
    badgeBg: '#FCE7F3',
  },
  'childrens-rights': {
    category: 'WOMEN_CHILD',
    categoryLabel: 'Women & Child',
    legalReference: 'POCSO Act 2012 • Articles 21A & 24',
    highlights: ['Free Education', 'No Child Labour', 'Nutrition & Care'],
    accentColor: '#047857',
    badgeBg: '#D1FAE5',
  },
  'senior-citizen-rights': {
    category: 'LABOUR_WELFARE',
    categoryLabel: 'Labour & Welfare',
    legalReference: 'Maintenance & Welfare Act, 2007',
    highlights: ['Parental Support', 'Special Healthcare', 'Legal Protection'],
    accentColor: '#B45309',
    badgeBg: '#FEF3C7',
  },
  'minority-rights': {
    category: 'CIVIL_JUSTICE',
    categoryLabel: 'Civil & Justice',
    legalReference: 'Articles 29 & 30 • Cultural & Educational',
    highlights: ['Language Preservation', 'Community Institutions', 'Non-Discrimination'],
    accentColor: '#6D28D9',
    badgeBg: '#EDE9FE',
  },
  'labour-rights': {
    category: 'LABOUR_WELFARE',
    categoryLabel: 'Labour & Welfare',
    legalReference: 'Factories Act 1948 • Minimum Wages Act',
    highlights: ['Fair Compensation', 'Safe Workplace', 'Right to Unionize'],
    accentColor: '#B91C1C',
    badgeBg: '#FEE2E2',
  },
  'right-to-education': {
    category: 'CONSTITUTIONAL',
    categoryLabel: 'Constitutional',
    legalReference: 'RTE Act 2009 • Article 21A',
    highlights: ['Free & Compulsory', 'Age 6 to 14 Years', 'Zero Discrimination'],
    accentColor: '#047857',
    badgeBg: '#D1FAE5',
  },
  'right-to-information': {
    category: 'CIVIL_JUSTICE',
    categoryLabel: 'Civil & Justice',
    legalReference: 'RTI Act 2005 • Public Accountability',
    highlights: ['Access Public Files', 'Citizen Transparency', '30-Day Reply Window'],
    accentColor: '#0284C7',
    badgeBg: '#E0F2FE',
  },
  'freedom-of-speech': {
    category: 'CONSTITUTIONAL',
    categoryLabel: 'Constitutional',
    legalReference: 'Article 19(1)(a) • Expression & Press',
    highlights: ['Freedom of Thought', 'Free Press', 'Peaceful Assembly'],
    accentColor: '#D97706',
    badgeBg: '#FEF3C7',
  },
  'civil-liberties': {
    category: 'CIVIL_JUSTICE',
    categoryLabel: 'Civil & Justice',
    legalReference: 'Article 21 • Personal Liberty & Privacy',
    highlights: ['Right to Privacy', 'Due Process of Law', 'Bodily Autonomy'],
    accentColor: '#4338CA',
    badgeBg: '#E0E7FF',
  },
};

export const MemberRightsScreen: React.FC<MemberRightsScreenProps> = ({
  onBack,
  onOpenRight,
  onFileComplaint,
  onContactSupport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<RightsCategoryKey>('ALL');

  const filteredRights = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return RIGHTS_INDEX.filter((item: RightsIndexItem) => {
      const meta = RIGHT_METADATA[item.id];
      const matchesCategory =
        selectedCategory === 'ALL' || meta?.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      const titleMatch = item.title.toLowerCase().includes(query);
      const descMatch = item.description.toLowerCase().includes(query);
      const refMatch = meta?.legalReference.toLowerCase().includes(query);
      const highlightsMatch = meta?.highlights.some(h =>
        h.toLowerCase().includes(query)
      );

      return titleMatch || descMatch || refMatch || highlightsMatch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        onBack={onBack}
        unreadCount={3}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Spotlight Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <AppIcon name="scale" size={13} color="#FFFFFF" />
              <Text style={styles.heroBadgeText}>CITIZEN RIGHTS & JUSTICE</Text>
            </View>
            <Text style={styles.heroGuideCount}>12 Legal Guides</Text>
          </View>

          <Text style={styles.heroTitle}>Know Your Rights. Protect Your Voice.</Text>
          <Text style={styles.heroDescription}>
            Every citizen is guaranteed legal protections and fundamental liberties
            by the Constitution of India and international human rights conventions.
          </Text>

          {/* Key pillars row */}
          <View style={styles.heroPillarsRow}>
            <View style={styles.heroPillarItem}>
              <Text style={styles.heroPillarIcon}>⚖️</Text>
              <Text style={styles.heroPillarLabel}>Constitutional Rights</Text>
            </View>
            <View style={styles.heroPillarDivider} />
            <View style={styles.heroPillarItem}>
              <Text style={styles.heroPillarIcon}>🛡️</Text>
              <Text style={styles.heroPillarLabel}>Legal Protection</Text>
            </View>
            <View style={styles.heroPillarDivider} />
            <View style={styles.heroPillarItem}>
              <Text style={styles.heroPillarIcon}>📜</Text>
              <Text style={styles.heroPillarLabel}>Free Legal Aid</Text>
            </View>
          </View>
        </View>

        {/* Legal Grievance & Help Callout */}
        <View style={styles.complaintCallout}>
          <View style={styles.complaintIconCircle}>
            <AppIcon name="shield-check" size={20} color="#D97706" />
          </View>
          <View style={styles.complaintCopy}>
            <Text style={styles.complaintTitle}>Facing a Rights Violation?</Text>
            <Text style={styles.complaintSubtitle}>
              HRSJM Legal Cell assists members with grievances, legal aid, and guidance.
            </Text>
          </View>
          {onFileComplaint && (
            <TouchableOpacity
              style={styles.complaintButton}
              onPress={onFileComplaint}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="File a complaint"
            >
              <Text style={styles.complaintButtonText}>File Complaint</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search and Discovery */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <AppIcon name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search rights, laws, or constitutional articles..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Clear search text"
              >
                <AppIcon name="close" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsContent}
          style={styles.categoryTabsScroll}
        >
          {CATEGORY_TABS.map(tab => {
            const isSelected = selectedCategory === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.categoryTab,
                  isSelected && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(tab.key)}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    isSelected && styles.categoryTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results Counter */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'ALL'
              ? 'All Rights & Protections'
              : CATEGORY_TABS.find(c => c.key === selectedCategory)?.label}
          </Text>
          <Text style={styles.resultCountBadge}>
            {filteredRights.length} {filteredRights.length === 1 ? 'Topic' : 'Topics'}
          </Text>
        </View>

        {/* Rights List */}
        {filteredRights.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <AppIcon name="search" size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Rights Found</Text>
            <Text style={styles.emptyDescription}>
              No rights or articles match &ldquo;{searchQuery}&rdquo;. Try another keyword
              or clear the search.
            </Text>
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
            >
              <Text style={styles.clearSearchButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.rightsGrid}>
            {filteredRights.map(item => {
              const meta = RIGHT_METADATA[item.id] || {
                category: 'ALL',
                categoryLabel: 'Citizen Rights',
                legalReference: 'Constitution of India',
                highlights: ['Fundamental Freedom', 'Legal Shield', 'Equality'],
                accentColor: '#1E3A8A',
                badgeBg: '#EEF2FF',
              };

              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.rightCard,
                    pressed && styles.rightCardPressed,
                  ]}
                  onPress={() => onOpenRight(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Read about ${item.title}`}
                >
                  {/* Top Bar of Card */}
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.iconBubble,
                        { backgroundColor: item.color || meta.badgeBg },
                      ]}
                    >
                      <AppIcon
                        name={item.icon}
                        size={22}
                        color={meta.accentColor}
                      />
                    </View>

                    <View style={styles.cardHeaderMeta}>
                      <View
                        style={[
                          styles.categoryPill,
                          { backgroundColor: meta.badgeBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryPillText,
                            { color: meta.accentColor },
                          ]}
                          numberOfLines={1}
                        >
                          {meta.categoryLabel.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.legalRefText} numberOfLines={1}>
                        {meta.legalReference}
                      </Text>
                    </View>
                  </View>

                  {/* Title & Description */}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>

                  {/* Highlights Pills */}
                  {meta.highlights?.length ? (
                    <View style={styles.highlightsContainer}>
                      {meta.highlights.slice(0, 3).map((tag, idx) => (
                        <View key={idx} style={styles.highlightPill}>
                          <Text style={styles.highlightPillDot}>•</Text>
                          <Text style={styles.highlightPillText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {/* Card Action Footer */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.readGuideText}>Read Legal Guide</Text>
                    <View style={styles.arrowCircle}>
                      <AppIcon
                        name="arrow-right"
                        size={13}
                        color={AdminColors.primaryDark}
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Constitutional Insights Footer Cards */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsHeader}>Constitutional Safeguards</Text>

          <View style={styles.insightCard}>
            <View style={styles.insightIconBox}>
              <Text style={styles.insightIconText}>💡</Text>
            </View>
            <View style={styles.insightCopy}>
              <Text style={styles.insightTitle}>
                Article 32 — The Heart & Soul of the Constitution
              </Text>
              <Text style={styles.insightText}>
                Dr. B.R. Ambedkar termed Article 32 as the most fundamental
                provision, granting citizens direct recourse to the Supreme Court
                through Writs if any fundamental right is violated.
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIconBox}>
              <Text style={styles.insightIconText}>🤝</Text>
            </View>
            <View style={styles.insightCopy}>
              <Text style={styles.insightTitle}>
                Article 39A — Equal Justice & Free Legal Aid
              </Text>
              <Text style={styles.insightText}>
                The State is mandated to provide free legal aid to ensure that
                opportunities for securing justice are not denied to any citizen by
                reason of economic or other disabilities.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // generous bottom offset for MemberCustomTabBar
  },

  // Spotlight Hero
  heroCard: {
    margin: Spacing.base,
    padding: Spacing.lg,
    backgroundColor: '#1E3A8A',
    borderRadius: BorderRadius.xl,
    ...Shadows.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  heroGuideCount: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: FontFamilies.serif,
    lineHeight: 28,
    marginBottom: Spacing.xs,
  },
  heroDescription: {
    fontSize: 13,
    color: '#E0E7FF',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  heroPillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  heroPillarItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  heroPillarIcon: {
    fontSize: 16,
  },
  heroPillarLabel: {
    fontSize: 10.5,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  heroPillarDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Complaint Callout Banner
  complaintCallout: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: '#FFFBEB',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.subtle,
  },
  complaintIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  complaintCopy: {
    flex: 1,
  },
  complaintTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  complaintSubtitle: {
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 15,
  },
  complaintButton: {
    backgroundColor: '#D97706',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: BorderRadius.base,
  },
  complaintButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Search Section
  searchSection: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 1,
    gap: Spacing.sm,
    ...Shadows.subtle,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    padding: 0,
  },

  // Category Tabs
  categoryTabsScroll: {
    marginBottom: Spacing.sm,
  },
  categoryTabsContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs + 2,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryTabActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Section Header Row
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  resultCountBadge: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginHorizontal: Spacing.base,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  clearSearchButton: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.base,
  },
  clearSearchButtonText: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '700',
  },

  // Rights Cards Grid
  rightsGrid: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm + 2,
  },
  rightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.base,
    ...Shadows.card,
  },
  rightCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderMeta: {
    flex: 1,
    gap: 2,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  legalRefText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: FontFamilies.serif,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 17,
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  highlightPillDot: {
    fontSize: 10,
    color: '#94A3B8',
  },
  highlightPillText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: Spacing.sm,
  },
  readGuideText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Insights Section
  insightsSection: {
    margin: Spacing.base,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  insightsHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: Spacing.xs,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.subtle,
  },
  insightIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightIconText: {
    fontSize: 16,
  },
  insightCopy: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  insightText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
});
