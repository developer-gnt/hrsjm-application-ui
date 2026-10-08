import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors, FontFamilies, Spacing } from '../../../../core/theme';
import { AboutInfoTile } from './AboutInfoTile';
import type { AboutInfoBlock } from '../types/about.types';

interface AboutInfoSectionProps {
  block: AboutInfoBlock;
}

/**
 * "What We Do" / "Key Focus Areas" block (reference-locked): navy serif
 * title, optional muted description and a 4-column row of labelled tiles.
 * Title and description sit at the base page inset while the tile row
 * aligns with the work-grid cards (8dp inset).
 */
export const AboutInfoSection: React.FC<AboutInfoSectionProps> = ({
  block,
}) => (
  <View>
    <Text style={styles.title}>{block.title}</Text>
    {block.description ? (
      <Text style={styles.description}>{block.description}</Text>
    ) : null}
    <View style={styles.tileRow}>
      {block.tiles.map(tile => (
        <AboutInfoTile key={tile.id} tile={tile} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    paddingHorizontal: Spacing.base,
  },
  description: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: AdminColors.textSecondary,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  tileRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
});
