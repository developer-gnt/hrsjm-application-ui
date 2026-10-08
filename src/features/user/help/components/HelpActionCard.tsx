import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';

export interface HelpActionCardItem {
  id: string;
  title: string;
  description: string;
  icon: 'file-text' | 'phone' | 'scale' | 'users';
}

interface HelpActionCardProps {
  item: HelpActionCardItem;
  onPress?: () => void;
}

export const HelpActionCard: React.FC<HelpActionCardProps> = ({
  item,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={`${item.title}. ${item.description}`}
  >
    <View style={styles.iconWrap}>
      <AppIcon name={item.icon} size={20} color={AdminColors.primaryDark} />
    </View>

    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.description}>{item.description}</Text>

    <View style={styles.arrowWrap}>
      <AppIcon name="arrow-right" size={11} color={AdminColors.accentGold} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 144,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    color: AdminColors.primaryDark,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  description: {
    color: AdminColors.textSecondary,
    fontSize: 11.5,
    lineHeight: 17,
    flexShrink: 1,
  },
  arrowWrap: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
