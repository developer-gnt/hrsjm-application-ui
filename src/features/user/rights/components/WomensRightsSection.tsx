import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { IconName } from '../../components/icons';

const WOMEN_RIGHTS_TABS = [
  'Overview',
  'Key Rights',
  'Support & Help',
  "HRSJM's Work",
];

const WOMEN_KEY_AREAS: { title: string; icon: IconName }[] = [
  { title: 'Safety & Protection', icon: 'shield-check' },
  { title: 'Education', icon: 'book-open' },
  { title: 'Employment & Equal Pay', icon: 'briefcase' },
  { title: 'Healthcare', icon: 'heart-pulse' },
  { title: 'Legal Rights', icon: 'scale' },
  { title: 'Property & Inheritance', icon: 'home' },
  { title: 'Participation in Decision Making', icon: 'users' },
  { title: 'Freedom from Discrimination', icon: 'open-hand' },
];

export const WomensRightsSection: React.FC = () => (
  <View style={styles.section}>
    <View style={styles.sectionInner}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {WOMEN_RIGHTS_TABS.map((tab, index) => (
          <View
            key={tab}
            style={[styles.tab, index === 0 && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: index === 0 }}
          >
            <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>
              {tab}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.heading}>What are Women's Rights?</Text>
      <Text style={styles.bodyText}>
        Women's rights are the fundamental human rights that ensure equality,
        safety, dignity and equal opportunities for women in all areas of life,
        at home, in society, at the workplace and in public spaces.
      </Text>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteMark}>“</Text>
        <View style={styles.quoteContent}>
          <Text style={styles.quoteText}>
            “When women are empowered, families, communities and societies become
            stronger.”
          </Text>
          <View style={styles.quoteRule} />
        </View>
      </View>

      <Text style={styles.heading}>Key Areas</Text>
      <Text style={styles.bodyText}>Women's rights cover many important areas, including:</Text>

      <View style={styles.keyAreaGrid}>
        {WOMEN_KEY_AREAS.map(area => (
          <View key={area.title} style={styles.keyAreaCard}>
            <AppIcon name={area.icon} size={24} color={AdminColors.primaryDark} />
            <Text style={styles.keyAreaTitle}>{area.title}</Text>
          </View>
        ))}
      </View>
    </View>

    <View style={styles.supportBanner}>
      <View style={styles.bannerArtwork} pointerEvents="none">
        <AppIcon name="user" size={120} color={AdminColors.accentGold} />
      </View>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerHeading}>How HRSJM Supports Women</Text>
        <Text style={styles.bannerDescription}>
          HRSJM works on awareness, legal support, counselling, workshops and
          advocacy to promote and protect women's rights across communities.
        </Text>
        <TouchableOpacity
          style={styles.bannerButton}
          onPress={() => Alert.alert('HRSJM Work', 'More information is coming soon.')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Learn About Our Work"
        >
          <Text style={styles.bannerButtonText}>Learn About Our Work</Text>
          <AppIcon name="arrow-right" size={14} color={AdminColors.primaryDark} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.xl,
    backgroundColor: AdminColors.cardSurface,
  },
  sectionInner: {
    paddingHorizontal: Spacing.base,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    gap: 2,
  },
  tab: {
    flex: 1,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: AdminColors.accentGold,
  },
  tabText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '600',
    color: AdminColors.textSecondary,
    textAlign: 'center',
  },
  tabTextActive: {
    color: AdminColors.primaryDark,
  },
  heading: {
    marginTop: Spacing.lg,
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  bodyText: {
    marginTop: Spacing.xs,
    fontSize: 12,
    lineHeight: 17,
    color: AdminColors.textSecondary,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGoldLight,
  },
  quoteMark: {
    fontFamily: FontFamilies.serif,
    fontSize: 38,
    lineHeight: 38,
    fontWeight: '700',
    color: AdminColors.accentGold,
    marginRight: Spacing.sm,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontFamily: FontFamilies.serif,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: AdminColors.primaryDark,
  },
  quoteRule: {
    width: 48,
    height: 2,
    marginTop: Spacing.sm,
    backgroundColor: AdminColors.accentGold,
  },
  keyAreaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  keyAreaCard: {
    width: '23.5%',
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    paddingVertical: Spacing.sm,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  keyAreaTitle: {
    marginTop: Spacing.xs,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '600',
    color: AdminColors.primaryDark,
    textAlign: 'center',
  },
  supportBanner: {
    position: 'relative',
    marginTop: Spacing.lg,
    backgroundColor: AdminColors.primaryDark,
    overflow: 'hidden',
  },
  bannerArtwork: {
    position: 'absolute',
    right: -18,
    top: 10,
    opacity: 0.22,
  },
  bannerContent: {
    width: '84%',
    padding: Spacing.base,
  },
  bannerHeading: {
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  bannerDescription: {
    marginTop: Spacing.xs,
    fontSize: 10.5,
    lineHeight: 14,
    color: AdminColors.textOnDark,
    opacity: 0.9,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGold,
  },
  bannerButtonText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
});