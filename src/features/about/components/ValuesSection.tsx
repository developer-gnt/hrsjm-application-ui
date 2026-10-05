import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Spacing } from '../../../core/theme/spacing';
import { ABOUT_CONTENT } from '../content/aboutContent';
import {
  AboutColors,
  AboutLayout,
  AboutStyles,
  AboutTypography,
} from '../theme';

/**
 * Values & Principles (spec Phase 8, corrected): the reference arranges the
 * six values TWO-across on phones (2×3) and three-across on wide screens —
 * the desktop grid is never forced onto mobile. Cards are warm cream without
 * borders, content centered, bare outline glyphs (no chip circles).
 */
export const ValuesSection: React.FC = () => {
  const { width } = useWindowDimensions();
  const { heading, lead, items } = ABOUT_CONTENT.values;

  const columns = width < 600 ? 2 : 3;
  const contentWidth =
    Math.min(width, AboutLayout.contentMaxWidth) - AboutLayout.gutter * 2;
  const gap = Spacing.base - 4;
  const cardWidth = (contentWidth - (columns - 1) * gap) / columns;

  return (
    <View style={AboutStyles.section}>
      <Text
        accessibilityRole="header"
        style={[AboutTypography.pageTitle, styles.heading]}
      >
        {heading}
      </Text>
      <Text style={[AboutTypography.sectionLead, styles.lead]}>{lead}</Text>

      <View style={styles.grid}>
        {items.map(item => (
          <View
            key={item.title}
            style={[AboutStyles.card, styles.card, { width: cardWidth }]}
          >
            <View accessible={false} style={styles.iconWrap}>
              <item.icon
                size={26}
                color={AboutColors.primaryNavy}
                strokeWidth={1.6}
              />
            </View>
            <Text
              accessibilityRole="header"
              style={[AboutTypography.valueTitle, styles.cardTitle]}
            >
              {item.title}
            </Text>
            <Text style={[AboutTypography.valueBody, styles.cardBody]}>
              {item.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    color: AboutColors.primaryNavy,
  },
  lead: {
    color: AboutColors.bodyText,
    marginTop: AboutLayout.blockGap - 4,
    maxWidth: 720,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base - 4,
    marginTop: AboutLayout.sectionGap - 8,
  },
  card: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 148,
  },
  iconWrap: {
    marginBottom: Spacing.sm + 2,
  },
  cardTitle: {
    color: AboutColors.primaryNavy,
    textAlign: 'center',
  },
  cardBody: {
    color: AboutColors.mutedText,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
