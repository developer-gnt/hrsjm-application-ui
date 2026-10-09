import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors, FontFamilies, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import { SectionHeader } from './SectionHeader';
import type { ImpactStats } from '../types/home.types';
import { formatImpactNumber } from '../utils/format-impact-number';

interface ImpactSectionProps {
  stats: ImpactStats;
  onDetailsPress?: () => void;
}

const IMPACT_METRICS = [
  { key: 'members', label: 'Members', icon: 'users' },
  { key: 'complaintsHandled', label: 'Complaints Handled', icon: 'file-text' },
  { key: 'casesResolved', label: 'Cases Resolved', icon: 'handshake' },
] as const;

/**
 * Reference-locked "Our Impact": full-bleed navy band, serif white heading,
 * three gold-icon statistics separated by thin dividers.
 */
export const ImpactSection: React.FC<ImpactSectionProps> = ({
  stats,
  onDetailsPress,
}) => (
  <View style={styles.section}>
    <SectionHeader
      title="Our Impact"
      linkLabel="View Details"
      onLinkPress={onDetailsPress}
      light
    />

    <View style={styles.statsRow}>
      {IMPACT_METRICS.map((metric, index) => (
        <React.Fragment key={metric.key}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.stat}>
            <AppIcon
              name={metric.icon}
              size={24}
              color={AdminColors.accentGold}
              strokeWidth={1.7}
            />
            <Text style={styles.value}>
              {formatImpactNumber(stats[metric.key])}
            </Text>
            <Text style={styles.label}>{metric.label}</Text>
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
