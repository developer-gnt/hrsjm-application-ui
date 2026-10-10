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
              <Text style={styles.principleTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.principleDescription} numberOfLines={2}>
                {item.description}
              </Text>
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
    width: 28,
    height: 2.5,
    marginBottom: 4,
    backgroundColor: AdminColors.accentGold,
    borderRadius: 1,
  },
  title: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 22,
    lineHeight: 27,
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
    fontSize: 13.5,
    lineHeight: 19.5,
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
    marginTop: Spacing.md,
  },
  principleCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 132,
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
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
    marginTop: 6,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  principleDescription: {
    marginTop: 4,
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 14.5,
    textAlign: 'center',
  },
});
