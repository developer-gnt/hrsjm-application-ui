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
      {IMPACT_METRICS.map(metric => (
        <View key={metric.key} style={styles.stat}>
          <AppIcon
            name={metric.icon}
            size={24}
            color="#EAA532"
            strokeWidth={1.8}
          />
          <Text style={styles.value}>
            {formatImpactNumber(stats[metric.key])}
          </Text>
          <Text style={styles.label}>{metric.label}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#06274D',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  value: {
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 3,
    textAlign: 'center',
  },
});
