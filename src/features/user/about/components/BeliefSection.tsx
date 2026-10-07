import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ABOUT_CONTENT } from '../content/aboutContent';
import {
  AboutColors,
  AboutFonts,
  AboutLayout,
  AboutStyles,
  AboutTypography,
} from '../theme';

/**
 * Our Belief (spec Phase 6): serif heading, approved statement, and the
 * soft-gold pull-quote card with the large gold quote mark from the
 * reference. Deliberately free of extra decoration or animation.
 */
export const BeliefSection: React.FC = () => {
  const { heading, body, quote } = ABOUT_CONTENT.belief;

  return (
    <View style={AboutStyles.section}>
      <Text
        accessibilityRole="header"
        style={[AboutTypography.pageTitle, styles.heading]}
      >
        {heading}
      </Text>
      <Text style={[AboutTypography.body, styles.body]}>{body}</Text>

      <View style={[AboutStyles.quoteCard, styles.quoteCard]}>
        <Text accessible={false} style={styles.quoteMark}>
          {'\u201C'}
        </Text>
        <Text style={[AboutTypography.quote, styles.quoteText]}>{quote}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    color: AboutColors.primaryNavy,
  },
  body: {
    color: AboutColors.bodyText,
    marginTop: AboutLayout.blockGap - 4,
    maxWidth: 720,
  },
  quoteCard: {
    marginTop: AboutLayout.sectionGap - 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  quoteMark: {
    fontFamily: AboutFonts.serif,
    color: AboutColors.accentGold,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '700',
    marginRight: 12,
  },
  quoteText: {
    color: AboutColors.primaryNavy,
    flex: 1,
  },
});
