import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, Spacing, UserFontFamilies } from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { ImpactStats } from '../types/home.types';
import { formatImpactNumber } from '../utils/format-impact-number';

interface ImpactSectionProps {
  stats: ImpactStats;
  onDetailsPress?: () => void;
}

const IMPACT_METRICS = [
  { key: 'members', label: 'Active Members', icon: 'users' },
  { key: 'complaintsHandled', label: 'Complaints Handled', icon: 'file-text' },
  { key: 'casesResolved', label: 'Cases Resolved', icon: 'handshake' },
] as const;

/**
 * Premium Executive "Our Impact" Card:
 * Deep royal navy container, golden verification indicator,
 * three distinct frosted metric tiles with high-legibility tabular typography
 * that will never squish, collide, or wrap awkwardly on mobile devices.
 */
export const ImpactSection: React.FC<ImpactSectionProps> = ({
  stats,
  onDetailsPress,
}) => (
  <View style={styles.cardContainer}>
    {/* Header with Title and View Details Action */}
    <View style={styles.headerRow}>
      <View style={styles.titleCol}>
        <View style={styles.eyebrowRow}>
          <View style={styles.verifiedDot} />
          <Text style={styles.eyebrowText}>Verified National Mission</Text>
        </View>
        <Text style={styles.titleText}>Our Impact</Text>
      </View>

      {onDetailsPress && (
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={onDetailsPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="View Details on Our Impact"
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
          <AppIcon name="arrow-right" size={13} color="#FAD465" />
        </TouchableOpacity>
      )}
    </View>

    {/* 3 Metric Tiles with generous breathing room and zero collision */}
    <View style={styles.tilesGrid}>
      {IMPACT_METRICS.map((metric) => (
        <View key={metric.key} style={styles.metricTile}>
          <View style={styles.iconCircle}>
            <AppIcon
              name={metric.icon}
              size={18}
              color="#FAD465"
              strokeWidth={1.8}
            />
          </View>
          <Text
            style={styles.metricValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {formatImpactNumber(stats[metric.key])}
          </Text>
          <Text style={styles.metricLabel} numberOfLines={2}>
            {metric.label}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#072444',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(250, 212, 101, 0.25)',
    borderTopWidth: 2.5,
    borderTopColor: '#F59E0B',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.base,
    shadowColor: '#072444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: 2,
  },
  titleCol: {
    flex: 1,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FAD465',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'Inter',
  },
  titleText: {
    fontFamily: UserFontFamilies.heading,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(250, 212, 101, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(250, 212, 101, 0.25)',
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FAD465',
    fontFamily: 'Inter',
  },
  tilesGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricTile: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(250, 212, 101, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 212, 101, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricValue: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'Inter, -apple-system, sans-serif',
    }),
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.2,
    width: '100%',
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: '#CBD5E1',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});
