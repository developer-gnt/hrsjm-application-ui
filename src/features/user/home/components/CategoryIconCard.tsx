import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { RightsCategory } from '../types/home.types';

interface CategoryIconCardProps {
  item: RightsCategory;
  onPress?: () => void;
}

/**
 * Reference-locked icon card used identically by "Know Your Rights" and
 * "What HRSJM Does": warm off-white card with hairline border and a soft
 * shadow, pale-gold circular icon backdrop (a low-opacity tint of the
 * accentGold token — no new colors), navy line icon and a centered
 * two-line label.
 */
export const CategoryIconCard: React.FC<CategoryIconCardProps> = ({
  item,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={item.title}
  >
    <View style={styles.iconCircle}>
      <View style={styles.iconCircleTint} />
      <AppIcon name={item.icon} size={20} color={AdminColors.primaryDark} />
    </View>
    <Text style={styles.label}>{item.title}</Text>
  </TouchableOpacity>
);

interface CategoryIconRowProps {
  items: RightsCategory[];
  onPressItem?: (item: RightsCategory) => void;
}

/** Four-across responsive grid row (reference layout, no carousel). */
export const CategoryIconRow: React.FC<CategoryIconRowProps> = ({
  items,
  onPressItem,
}) => (
  <View style={styles.row}>
    {items.map(item => (
      <CategoryIconCard
        key={item.id}
        item={item}
        onPress={() => onPressItem?.(item)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: 2,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGoldLight,
    borderWidth: 1,
    borderColor: AdminColors.border,
    ...Shadows.card,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Pale-gold backdrop rendered as a sibling tint layer so the navy icon
  // above it keeps full opacity.
  iconCircleTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 17,
    backgroundColor: AdminColors.accentGold,
    opacity: 0.16,
  },
  label: {
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: '600',
    color: AdminColors.primaryDark,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
