import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { AboutTile } from '../types/about.types';

interface AboutInfoTileProps {
  tile: AboutTile;
}

/**
 * Small labelled tile of the What We Do / Key Focus Areas rows
 * (reference-locked): pale-gold circular icon container with a navy glyph
 * and the centered semi-bold navy label below.
 */
export const AboutInfoTile: React.FC<AboutInfoTileProps> = ({ tile }) => (
  <View style={styles.tile}>
    <View style={styles.iconCircle}>
      <AppIcon name={tile.icon} size={19} color={AdminColors.primaryDark} />
    </View>
    <Text style={styles.label}>{tile.label}</Text>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: 4,
    alignItems: 'center',
    ...Shadows.card,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    lineHeight: 12.5,
    fontWeight: '600',
    color: AdminColors.primaryDark,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
