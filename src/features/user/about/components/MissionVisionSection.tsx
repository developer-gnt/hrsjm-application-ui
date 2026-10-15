import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ABOUT_CONTENT } from '../content/aboutContent';
import {
  AboutColors,
  AboutLayout,
  AboutStyles,
  AboutTypography,
} from '../theme';

/**
 * Mission & Vision (spec Phase 7): two warm-cream cards side by side (single
 * column only on very narrow screens), each with its glyph beside the title —
 * navy target for Mission, gold eye for Vision — and the approved copy.
 */
export const MissionVisionSection: React.FC = () => {
  const { heading, mission, vision } = ABOUT_CONTENT.missionVision;
  const blocks = [
    { ...mission, iconColor: AboutColors.primaryNavy },
    { ...vision, iconColor: AboutColors.accentGold },
  ];

  return (
    <View style={AboutStyles.section}>
      <Text
        accessibilityRole="header"
        style={[AboutTypography.pageTitle, styles.heading]}
      >
        {heading}
      </Text>

      <View style={styles.row}>
        {blocks.map(block => (
          <View style={[AboutStyles.card, styles.card]} key={block.title}>
            <View style={styles.titleRow}>
              <View accessible={false} style={styles.iconWrap}>
                <block.icon
                  size={26}
                  color={block.iconColor}
                  strokeWidth={1.7}
                />
              </View>
              <Text
                accessibilityRole="header"
                style={[AboutTypography.cardTitle, styles.blockTitle]}
              >
                {block.title}
              </Text>
            </View>
            <Text style={[AboutTypography.valueBody, styles.blockBody]}>
              {block.body}
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AboutLayout.blockGap - 4,
    marginTop: AboutLayout.sectionGap - 8,
  },
  card: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 150,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    marginRight: 10,
  },
  blockTitle: {
    color: AboutColors.primaryNavy,
    flex: 1,
  },
  blockBody: {
    color: AboutColors.bodyText,
    marginTop: 10,
  },
});
