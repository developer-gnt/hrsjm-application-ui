import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Shadows } from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { AboutWorkArea } from '../types/about.types';

interface AboutWorkCardProps {
  area: AboutWorkArea;
  onPress?: () => void;
}

/**
 * One work-area card of the About 3x3 grid (reference-locked, compact):
 * pale-gold circular icon container, navy title, muted blue-gray
 * description and the small gold arrow button pinned bottom-right.
 * Height is content-driven with descriptions capped at 3 lines, so every
 * row matches the compact height of the first row (long copy ellipsizes;
 * the full text stays in the accessibility label).
 */
export const AboutWorkCard: React.FC<AboutWorkCardProps> = ({
  area,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={`${area.title.replace(/\n/g, ' ')} — ${area.description}`}
  >
    <View style={styles.iconCircle}>
      <AppIcon name={area.icon} size={18} color={AdminColors.primaryDark} />
    </View>

    <Text style={styles.title}>{area.title}</Text>

    <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
      {area.description}
    </Text>

    <View style={styles.arrowButton}>
      <AppIcon name="arrow-right" size={11} color={AdminColors.primaryDark} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    padding: 10,
    ...Shadows.card,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12.5,
    lineHeight: 15,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginTop: 6,
  },
  description: {
    fontSize: 10,
    lineHeight: 13.5,
    color: AdminColors.textSecondary,
    marginTop: 4,
    marginBottom: 6,
  },
  arrowButton: {
    alignSelf: 'flex-end',
    marginTop: 'auto',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
