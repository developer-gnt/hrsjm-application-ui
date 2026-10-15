import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors, StatusTones, StatusToneKey } from '../../../../core/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import type { AppIconComponent } from '../../../../core/components/icons';

interface MemberStatCardProps {
  label: string;
  value: string;
  /** Optional small sub-label, e.g. "(30 days)". */
  sublabel?: string;
  tone: StatusToneKey;
  Icon: AppIconComponent;
  loading?: boolean;
}

const ICON_CONTAINER = 34;
const ICON_SIZE = 18;

/** Compact tinted statistic card with a solid colored icon container. */
export const MemberStatCard: React.FC<MemberStatCardProps> = ({
  label,
  value,
  sublabel,
  tone,
  Icon,
  loading = false,
}) => {
  const colors = StatusTones[tone];

  return (
    <View
      style={[styles.card, { backgroundColor: colors.bg }]}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}${sublabel ? ` ${sublabel}` : ''}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.solid }]}>
        <Icon size={ICON_SIZE} color={BrandColors.surface} strokeWidth={2} />
      </View>

      {loading ? (
        <View style={[styles.valueSkeleton, { backgroundColor: colors.solid }]} />
      ) : (
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      )}

      <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
        {label}
      </Text>
      {sublabel ? (
        <Text style={styles.sublabel} numberOfLines={1}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'flex-start',
    ...Shadows.card,
  },
  iconContainer: {
    width: ICON_CONTAINER,
    height: ICON_CONTAINER,
    borderRadius: ICON_CONTAINER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    ...Typography.statValue,
    color: BrandColors.textPrimary,
  },
  valueSkeleton: {
    width: '70%',
    height: 18,
    borderRadius: BorderRadius.sm,
    opacity: 0.35,
  },
  label: {
    ...Typography.statLabel,
    marginTop: 2,
  },
  sublabel: {
    ...Typography.caption,
    color: BrandColors.textMuted,
    marginTop: 1,
  },
});

export default MemberStatCard;
