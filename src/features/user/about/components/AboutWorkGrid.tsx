import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '../../../../core/theme';
import { AboutWorkCard } from './AboutWorkCard';
import type { AboutWorkArea } from '../types/about.types';

interface AboutWorkGridProps {
  areas: AboutWorkArea[];
  onPressArea?: (area: AboutWorkArea) => void;
}

/** Cards per grid row (3-column reference grid — never a carousel). */
const WORK_AREAS_PER_ROW = 3;

/**
 * The About work-area grid: static 3x3 layout (rows of three equal-width
 * cards), fully visible on the Pixel 7 — no horizontal scrolling. Card
 * height is content-driven (no forced minimum): within each row cards
 * stretch to the tallest sibling, matching the compact reference density.
 */
export const AboutWorkGrid: React.FC<AboutWorkGridProps> = ({
  areas,
  onPressArea,
}) => {
  const rows: AboutWorkArea[][] = [];
  for (let index = 0; index < areas.length; index += WORK_AREAS_PER_ROW) {
    rows.push(areas.slice(index, index + WORK_AREAS_PER_ROW));
  }

  return (
    <View style={styles.grid}>
      {rows.map(row => (
        <View key={row[0].id} style={styles.row}>
          {row.map(area => (
            <AboutWorkCard
              key={area.id}
              area={area}
              onPress={() => onPressArea?.(area)}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
