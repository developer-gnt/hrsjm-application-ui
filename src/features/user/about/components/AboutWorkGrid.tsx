import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AboutWorkCard } from './AboutWorkCard';
import type { AboutWorkArea } from '../types/about.types';

interface AboutWorkGridProps {
  areas: AboutWorkArea[];
  onPressArea?: (area: AboutWorkArea) => void;
}

export const AboutWorkGrid: React.FC<AboutWorkGridProps> = ({
  areas,
  onPressArea,
}) => {
  return (
    <View style={styles.grid}>
      {areas.map((area, index) => {
        const isLastOdd = index === areas.length - 1 && areas.length % 2 === 1;
        return (
          <AboutWorkCard
            key={area.id}
            area={area}
            fullWidth={isLastOdd}
            onPress={onPressArea ? () => onPressArea(area) : undefined}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
});
