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
      <AppIcon name={item.icon} size={20} color="#0B2F5B" />
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
  'Workshops & Training': 'Workshops\n& Training',
  'Research & Education': 'Research &\nEducation',
  'Research & Rights Education': 'Research &\nEducation',
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
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 14,
    minHeight: 84,
    backgroundColor: '#FCFBF7',
    borderWidth: 1,
    borderColor: '#E8E4DA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10.5,
    lineHeight: 13.5,
    fontWeight: '600',
    color: '#0B2F5B',
    textAlign: 'center',
    marginTop: 6,
  },
});
