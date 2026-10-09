import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
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
  const { width } = useWindowDimensions();
  const twoRows = width < 500;

  return (
    <View style={styles.panel}>
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          <View style={styles.accentLine} />
          <Text style={styles.title}>{content.title}</Text>
        </View>
        <Text style={styles.subtitle}>{content.description}</Text>
      </View>
      <View style={[styles.steps, twoRows && styles.twoRows]}>
        {content.steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {index > 0 && !twoRows ? (
              <AppIcon
                name="arrow-right"
                size={14}
                color={AdminColors.textSecondary}
              />
            ) : null}
            <View style={[styles.step, twoRows && styles.twoRowStep]}>
              <View style={styles.iconCircle}>
                <AppIcon
                  name={step.icon}
                  size={22}
                  color={AdminColors.primaryDark}
                />
              </View>
              <View style={styles.copy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.sm,
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
  },
  heading: {
    flexShrink: 0,
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
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  subtitle: {
    flex: 1,
    paddingBottom: 2,
    color: AdminColors.textSecondary,
    fontSize: 8,
    lineHeight: 10,
    textAlign: 'right',
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  twoRows: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    rowGap: Spacing.md,
  },
  step: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  twoRowStep: {
    flexBasis: '47%',
    flexGrow: 0,
  },
  iconCircle: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: AdminColors.accentGoldLight,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  stepTitle: {
    color: AdminColors.primaryDark,
    fontSize: 10.5,
    lineHeight: 12,
    fontWeight: '700',
  },
  stepDescription: {
    marginTop: 2,
    color: AdminColors.textSecondary,
    fontSize: 9,
    lineHeight: 11,
  },
});
