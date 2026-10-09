import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { AboutWorkArea } from '../types/about.types';

interface AboutWorkCardProps {
  area: AboutWorkArea;
  onPress?: () => void;
}

export const AboutWorkCard: React.FC<AboutWorkCardProps> = ({
  area,
  onPress,
}) => (
  <Pressable
    style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    onPress={onPress}
    disabled={!onPress}
    accessibilityRole={onPress ? 'button' : undefined}
    accessibilityLabel={`${area.title.replace(/\n/g, ' ')} — ${area.description}`}
  >
    <View style={styles.iconCircle}>
      <AppIcon name={area.icon} size={21} color={AdminColors.primaryDark} />
    </View>
    <View style={styles.copy}>
      <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
        {area.title}
      </Text>
      <Text style={styles.description} numberOfLines={4} ellipsizeMode="tail">
        {area.description}
      </Text>
    </View>
    <View style={styles.arrowButton}>
      <AppIcon name="arrow-right" size={11} color={AdminColors.primaryDark} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: 6,
    paddingBottom: 23,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    ...Shadows.card,
  },
  pressed: {
    opacity: 0.82,
  },
  iconCircle: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 16,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 9.5,
    lineHeight: 11.5,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  description: {
    fontSize: 8.5,
    lineHeight: 11,
    color: AdminColors.textSecondary,
    marginTop: 3,
  },
  arrowButton: {
    position: 'absolute',
    right: Spacing.xs,
    bottom: Spacing.xs,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
