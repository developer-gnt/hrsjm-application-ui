import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ABOUT_CONTENT } from '../content/aboutContent';
import {
  AboutColors,
  AboutLayout,
  AboutRadius,
  AboutStyles,
  AboutTypography,
} from '../theme';

/**
 * Who We Are (spec Phase 5): serif heading, approved copy with the approved
 * thumbnail at the right, and the working "Read More →" control from the
 * reference — it expands the approved copy inline (truncated to four lines
 * until tapped) and toggles to "Read Less". No invented content: the
 * expansion reveals the same approved paragraph.
 */
export const WhoWeAreSection: React.FC = () => {
  const { heading, body, imageSource } = ABOUT_CONTENT.whoWeAre;
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={AboutStyles.section}>
      <Text
        accessibilityRole="header"
        style={[AboutTypography.pageTitle, styles.heading]}
      >
        {heading}
      </Text>

      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text
            style={[AboutTypography.body, styles.body]}
            numberOfLines={expanded ? undefined : 4}
          >
            {body}
          </Text>
          <TouchableOpacity
            style={styles.readMore}
            onPress={() => setExpanded(value => !value)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              expanded ? 'Read less about HRSJM' : 'Read more about HRSJM'
            }
          >
            <Text style={styles.readMoreText}>
              {expanded ? 'Read Less' : 'Read More'}
            </Text>
            <Text style={styles.readMoreArrow}>
              {expanded ? '\u2191' : '\u2192'}
            </Text>
          </TouchableOpacity>
        </View>

        <Image
          source={imageSource}
          style={styles.thumb}
          resizeMode="cover"
          fadeDuration={0}
          accessibilityLabel="HRSJM community gathering with the Indian flag"
        />
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
    gap: AboutLayout.blockGap - 4,
    marginTop: AboutLayout.blockGap - 4,
    alignItems: 'flex-start',
  },
  textCol: {
    flex: 1,
  },
  body: {
    color: AboutColors.bodyText,
    maxWidth: 720,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: AboutColors.primaryNavy,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  readMoreArrow: {
    color: AboutColors.primaryNavy,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginLeft: 6,
  },
  thumb: {
    width: 106,
    height: 124,
    borderRadius: AboutRadius.md,
  },
});
