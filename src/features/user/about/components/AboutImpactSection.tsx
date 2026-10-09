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
      {content.stats.map(stat => (
        <View key={stat.id} style={styles.metricCard}>
          <View style={styles.iconCircle}>
            <AppIcon
              name={stat.icon}
              size={23}
              color={AdminColors.accentGold}
            />
          </View>
          <View style={styles.copy}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.sm,
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
  },
  heading: {
    flexShrink: 0,
  },
  accentLine: {
    width: 24,
    height: 2,
    marginBottom: 4,
    backgroundColor: AdminColors.accentGold,
  },
  title: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  subtitle: {
    flex: 1,
    paddingBottom: 2,
    color: AdminColors.textSecondary,
    fontSize: 8,
    lineHeight: 10,
    textAlign: 'right',
  },
  metrics: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGoldLight,
  },
  iconCircle: {
    width: 34,
    height: 34,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#FFF0C8',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    color: AdminColors.primaryDark,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  label: {
    marginTop: 2,
    color: AdminColors.textSecondary,
    fontSize: 8.5,
    lineHeight: 10,
  },
});
