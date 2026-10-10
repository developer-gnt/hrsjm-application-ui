import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { AboutContent } from '../types/about.types';

interface AboutApproachSectionProps {
  content: AboutContent['approach'];
}

export const AboutApproachSection: React.FC<AboutApproachSectionProps> = ({
  content,
}) => {
  return (
    <View style={styles.panel}>
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          <View style={styles.accentLine} />
          <Text style={styles.title}>{content.title}</Text>
        </View>
        <Text style={styles.subtitle}>{content.description}</Text>
      </View>
      <View style={styles.steps}>
        {content.steps.map(step => (
          <View key={step.id} style={styles.step}>
            <View style={styles.iconCircle}>
              <AppIcon
                name={step.icon}
                size={20}
                color={AdminColors.primaryDark}
              />
            </View>
            <View style={styles.copy}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  heading: {
    flexShrink: 0,
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
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
  },
  subtitle: {
    flex: 1,
    paddingBottom: 2,
    color: AdminColors.textSecondary,
    fontSize: 12.5,
    lineHeight: 16,
    textAlign: 'right',
  },
  steps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginTop: Spacing.xs,
  },
  step: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: AdminColors.accentGoldLight,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  stepTitle: {
    color: AdminColors.primaryDark,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  stepDescription: {
    marginTop: 2,
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 15.5,
  },
});
