import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Shadows,
  Spacing,
  UserFontFamilies,
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
      <AppIcon name={item.icon} size={20} color={AdminColors.primaryDark} />
    </View>
    <Text style={styles.label}>{REFERENCE_LABELS[item.title] ?? item.title}</Text>
  </TouchableOpacity>
);

const REFERENCE_LABELS: Record<string, string> = {
  'Human Rights': 'Human\nRights',
  "Women's Rights": "Women's\nRights",
  'Right to Education': 'Right to\nEducation',
  "Children's Rights": "Children's\nRights",
  'Awareness Campaigns': 'Awareness\nCampaigns',
  'Workshops & Training': 'Workshops\nand Training',
  'Workshops and Training': 'Workshops\nand Training',
  'Research & Education': 'Research and\nEducation',
  'Research and Education': 'Research and\nEducation',
  'Research & Rights Education': 'Research and\nEducation',
  'Research and Rights Education': 'Research and\nEducation',
  'Community Activities': 'Community\nActivities',
};

interface CategoryIconRowProps<Item extends RightsCategory> {
  items: Item[];
  onPressItem?: (item: Item) => void;
}

/** Four-across responsive grid row (reference layout, no carousel). */
export const CategoryIconRow = <Item extends RightsCategory,>({
  items,
  onPressItem,
}: CategoryIconRowProps<Item>) => (
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
    gap: 8,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 14,
    minHeight: 90,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 11,
    lineHeight: 14.5,
    fontWeight: '600',
    color: '#0F2860',
    textAlign: 'center',
    marginTop: 6,
  },
});
