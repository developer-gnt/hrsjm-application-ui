import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors, Spacing, UserFontFamilies } from '../../../../core/theme';
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
          <View style={styles.iconCircle}>
            <AppIcon
              name={metric.icon}
              size={22}
              color="#FAD465"
              strokeWidth={1.8}
            />
          </View>
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
    backgroundColor: '#06294D', // color-navy-900
    borderRadius: 14,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
    marginHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(219, 229, 238, 0.15)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#C9971A', // color-gold-700
    backgroundColor: 'rgba(250, 212, 101, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: UserFontFamilies.heading,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  label: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
    color: '#EDF2F7', // color-blue-100
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});
