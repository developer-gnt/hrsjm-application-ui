import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { AboutImpactBlock } from '../types/about.types';

interface AboutImpactSectionProps {
  block: AboutImpactBlock;
}

/**
 * "Impact" block (reference-locked): navy serif title above a single
 * three-column panel — very light cream background, thin vertical
 * separators between the columns, gold icon over the bold navy value and
 * the muted label, all centered.
 */
export const AboutImpactSection: React.FC<AboutImpactSectionProps> = ({
  block,
}) => (
  <View>
    <Text style={styles.title}>{block.title}</Text>
    <View style={styles.panel}>
      {block.stats.map((stat, index) => (
        <React.Fragment key={stat.id}>
          {index > 0 && <View style={styles.separator} />}
          <View style={styles.statColumn}>
            <AppIcon name={stat.icon} size={22} color={AdminColors.accentGold} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        </React.Fragment>
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
  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: AdminColors.accentGoldLight,
    borderRadius: BorderRadius.lg,
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: AdminColors.border,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  statValue: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 9.5,
    lineHeight: 13,
    color: AdminColors.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
});
