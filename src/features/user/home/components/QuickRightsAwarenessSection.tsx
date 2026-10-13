import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';

export interface RightsTipItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  article: string;
  icon: 'scale' | 'shield-check' | 'file-text' | 'users';
  targetRightId: string;
}

export const RIGHTS_TIPS: RightsTipItem[] = [
  {
    id: 'fir',
    badge: 'LEGAL ESSENTIAL',
    title: 'Your Right to File a Zero FIR',
    description:
      'A Zero FIR can be lodged at any police station regardless of jurisdiction, especially in urgent matters.',
    article: 'CrPC Section 154',
    icon: 'shield-check',
    targetRightId: 'human-rights',
  },
  {
    id: 'free-aid',
    badge: 'CONSTITUTIONAL RIGHT',
    title: 'Free Legal Aid for Citizens',
    description:
      'Under Article 39A, the state provides free legal assistance to underprivileged citizens ensuring justice for all.',
    article: 'Article 39A of Constitution',
    icon: 'scale',
    targetRightId: 'human-rights',
  },
  {
    id: 'education',
    badge: 'FUNDAMENTAL RIGHT',
    title: 'Free & Compulsory Education',
    description:
      'Every child between 6 to 14 years has a fundamental right to free, quality education in neighborhood schools.',
    article: 'Article 21A & RTE Act',
    icon: 'file-text',
    targetRightId: 'right-to-education',
  },
  {
    id: 'workplace',
    badge: 'WOMEN SAFETY',
    title: 'Safe Working Environment',
    description:
      'Organizations with 10+ employees must establish an Internal Complaints Committee (ICC) against harassment.',
    article: 'POSH Act 2013',
    icon: 'users',
    targetRightId: 'womens-rights',
  },
];

interface QuickRightsAwarenessSectionProps {
  onOpenRight?: (rightId: string) => void;
}

export const QuickRightsAwarenessSection: React.FC<QuickRightsAwarenessSectionProps> = ({
  onOpenRight,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {RIGHTS_TIPS.map(tip => (
        <TouchableOpacity
          key={tip.id}
          style={styles.card}
          onPress={() => onOpenRight?.(tip.targetRightId)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`${tip.title}. ${tip.description}`}
        >
          <View style={styles.topRow}>
            <View style={styles.badgeWrap}>
              <Text style={styles.badgeText}>{tip.badge}</Text>
            </View>
            <View style={styles.iconCircle}>
              <AppIcon name={tip.icon} size={16} color={AdminColors.accentGold} />
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {tip.title}
          </Text>

          <Text style={styles.description} numberOfLines={3}>
            {tip.description}
          </Text>

          <View style={styles.footerRow}>
            <Text style={styles.articleTag}>{tip.article}</Text>
            <View style={styles.learnMoreRow}>
              <Text style={styles.learnMoreText}>Read</Text>
              <AppIcon name="arrow-right" size={11} color={AdminColors.primary} />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingRight: Spacing.base,
    gap: Spacing.sm,
  },
  card: {
    width: 250,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  badgeWrap: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.4,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginTop: Spacing.xs,
  },
  description: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: AdminColors.textSecondary,
    marginTop: Spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  articleTag: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  learnMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  learnMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primary,
  },
});
