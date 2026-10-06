import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  FontFamilies,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import { SectionHeader } from './SectionHeader';
import type { ImpactStat } from '../types/home.types';

interface ImpactSectionProps {
  stats: ImpactStat[];
  onDetailsPress?: () => void;
}

/**
 * Reference-locked "Our Impact": full-bleed navy band, serif white heading,
 * three gold-icon statistics separated by thin dividers.
 */
export const ImpactSection: React.FC<ImpactSectionProps> = ({
  stats,
  onDetailsPress,
}) => (
  <View style={styles.section}>
    <SectionHeader title="Our Impact" linkLabel="View Details" onLinkPress={onDetailsPress} light />

    <View style={styles.statsRow}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.id}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.stat}>
            <AppIcon name={stat.icon} size={24} color={AdminColors.accentGold} strokeWidth={1.7} />
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    backgroundColor: AdminColors.primaryDark,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: Spacing.xs,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: AdminColors.textOnDark,
    opacity: 0.25,
    marginVertical: Spacing.xs,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  value: {
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: AdminColors.textOnDark,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  label: {
    fontSize: 10.5,
    lineHeight: 14,
    color: AdminColors.textOnDark,
    opacity: 0.85,
    marginTop: 2,
    textAlign: 'center',
  },
});
