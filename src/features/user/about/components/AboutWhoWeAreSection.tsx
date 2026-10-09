import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { AboutContent } from '../types/about.types';

interface AboutWhoWeAreSectionProps {
  principles: AboutContent['principles'];
}

export const AboutWhoWeAreSection: React.FC<AboutWhoWeAreSectionProps> = ({
  principles,
}) => {
  const { width } = useWindowDimensions();
  const sideBySide = width >= 560;

  return (
    <View>
      <View style={styles.heading}>
        <View style={styles.accentLine} />
        <Text style={styles.title}>Who We Are</Text>
      </View>
      <View style={[styles.content, !sideBySide && styles.stackedContent]}>
        <Text
          style={[
            styles.description,
            sideBySide ? styles.columnDescription : styles.stackedDescription,
          ]}
        >
          HRSJM is a people-centred human-rights organisation working for the
          dignity, equality and justice of marginalised communities. We stand
          with individuals and groups to protect their rights and build a
          fairer, more inclusive society.
        </Text>
        <View style={[styles.principles, !sideBySide && styles.stackedPrinciples]}>
          {principles.map(item => (
            <View key={item.id} style={styles.principleCard}>
              <View style={styles.iconCircle}>
                <AppIcon
                  name={item.icon}
                  size={21}
                  color={AdminColors.primaryDark}
                />
              </View>
              <Text style={styles.principleTitle}>{item.title}</Text>
              <Text style={styles.principleDescription}>{item.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    marginBottom: Spacing.sm,
  },
  accentLine: {
    width: 24,
    height: 2,
    marginBottom: 4,
    backgroundColor: AdminColors.accentGold,
  },
  title: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  stackedContent: {
    flexDirection: 'column',
  },
  description: {
    flex: 1,
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  columnDescription: {
    flex: 0.9,
  },
  stackedDescription: {
    flex: 0,
  },
  principles: {
    flex: 1.1,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  stackedPrinciples: {
    flex: 0,
    marginTop: Spacing.sm,
  },
  principleCard: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  iconCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: AdminColors.accentGoldLight,
  },
  principleTitle: {
    marginTop: 4,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  principleDescription: {
    marginTop: 3,
    color: AdminColors.textSecondary,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
  },
});
