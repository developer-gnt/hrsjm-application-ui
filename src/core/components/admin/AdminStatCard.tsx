import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BrandColors, StatusTones, StatusToneKey } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import type { AppIconComponent } from '../icons';

export interface AdminStatCardProps {
  label?: string;
  title?: string;
  value: string | number;
  /** Optional small sub-label, e.g. "(30 days)" or "Needs reply". */
  sublabel?: string;
  note?: string;
  growthPercent?: number;
  tone?: StatusToneKey | string;
  tint?: StatusToneKey | string;
  Icon?: AppIconComponent;
  icon?: string;
  loading?: boolean;
  onPress?: () => void;
}

const ICON_CONTAINER = 34;
const ICON_SIZE = 18;

const mapTone = (tone?: string): StatusToneKey => {
  if (!tone) return 'navy';
  if (tone === 'primary' || tone === 'blue') return 'navy';
  if (tone === 'warning' || tone === 'gold') return 'warning';
  if (tone === 'success' || tone === 'green') return 'success';
  if (tone === 'danger' || tone === 'red') return 'danger';
  if (tone === 'purple') return 'gold';
  if (tone in StatusTones) return tone as StatusToneKey;
  return 'navy';
};

/**
 * Universal KPI Stat Card matching the HRSJM official 2×2 reference design (Image 1).
 */
export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  label,
  title,
  value,
  sublabel,
  note,
  growthPercent,
  tone,
  tint,
  Icon,
  icon,
  loading = false,
  onPress,
}) => {
  const activeTone = mapTone(tone || tint);
  const colors = StatusTones[activeTone] || StatusTones.navy;
  const cardLabel = label || title || '';
  const cardSublabel =
    sublabel || note || (growthPercent !== undefined ? `↑ ${growthPercent}%` : undefined);

  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.bg }]}>
      <CardWrapper
        style={styles.card}
        onPress={onPress}
        activeOpacity={onPress ? 0.75 : 1}
        accessibilityRole="text"
        accessibilityLabel={`${cardLabel}: ${displayValue}${cardSublabel ? ` ${cardSublabel}` : ''}`}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.solid }]}>
          {Icon ? (
            <Icon size={ICON_SIZE} color={BrandColors.surface} strokeWidth={2} />
          ) : (
            <Text style={styles.emojiIcon}>{icon || '📊'}</Text>
          )}
        </View>

        {loading ? (
          <View style={[styles.valueSkeleton, { backgroundColor: colors.solid }]} />
        ) : (
          <Text style={styles.value} numberOfLines={1}>
            {displayValue}
          </Text>
        )}

        <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
          {cardLabel}
        </Text>
        {cardSublabel ? (
          <Text style={styles.sublabel} numberOfLines={1}>
            {cardSublabel}
          </Text>
        ) : null}
      </CardWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.card,
  },
  card: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: ICON_CONTAINER,
    height: ICON_CONTAINER,
    borderRadius: ICON_CONTAINER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emojiIcon: {
    fontSize: 16,
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

export default AdminStatCard;
