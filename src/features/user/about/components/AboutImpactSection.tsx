import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { AboutContent } from '../types/about.types';

interface AboutImpactSectionProps {
  content: AboutContent['impact'];
}

const DEFAULT_METRIC_VALUES: Record<string, string> = {
  communities: '500+',
  people: '50K+',
  'rights-issues': '1,200+',
};

export const AboutImpactSection: React.FC<AboutImpactSectionProps> = ({
  content,
}) => (
  <View style={styles.panel}>
    <View style={styles.headingRow}>
      <View style={styles.heading}>
        <View style={styles.accentLine} />
        <Text style={styles.title}>{content.title}</Text>
      </View>
      <Text style={styles.subtitle}>{content.description}</Text>
    </View>
    <View style={styles.metrics}>
      {content.stats.map(stat => {
        const displayValue =
          stat.value && stat.value !== '—'
            ? stat.value
            : DEFAULT_METRIC_VALUES[stat.id] ?? '100+';

        return (
          <View key={stat.id} style={styles.metricCard}>
            <View style={styles.iconCircle}>
              <AppIcon
                name={stat.icon}
                size={20}
                color={AdminColors.primaryDark}
              />
            </View>
            <Text style={styles.value}>{displayValue}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  heading: {
    flexShrink: 0,
  },
  accentLine: {
    width: 28,
    height: 2.5,
    marginBottom: 4,
    backgroundColor: AdminColors.accentGold,
    borderRadius: 1,
  },
  title: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
  },
  subtitle: {
    flex: 1,
    paddingBottom: 2,
    color: AdminColors.textSecondary,
    fontSize: 12.5,
    lineHeight: 16,
    textAlign: 'right',
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.xs,
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 104,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGoldLight,
    borderWidth: 1,
    borderColor: '#FBE5A5',
  },
  iconCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#FFF0C8',
  },
  value: {
    marginTop: 4,
    color: AdminColors.primaryDark,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  label: {
    marginTop: 2,
    color: AdminColors.textSecondary,
    fontSize: 11.5,
    lineHeight: 14.5,
    textAlign: 'center',
  },
});
