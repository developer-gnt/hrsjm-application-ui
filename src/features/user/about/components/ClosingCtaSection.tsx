import React from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { AppButton } from '../../../../core';
import { ABOUT_CONTENT } from '../content/aboutContent';
import {
  AboutColors,
  AboutLayout,
  AboutRadius,
  AboutTypography,
} from '../theme';

export interface ClosingCtaSectionProps {
  /** Navigate to an in-app route (wired to the More stack by MoreNavigator). */
  onNavigate?: (target: string) => void;
}

/**
 * Closing CTA (spec Phase 10, corrected): inset rounded navy card with the
 * serif headline, supporting line, and the gold "Join the Movement →"
 * button from the reference. The approved hands photograph fills the right
 * side and blends into the navy through a horizontal scrim so the text stays
 * readable. The button navigates to the Donations module — the approved
 * in-app destination recorded in ABOUT_CONTENT.cta (an https value there
 * would open the browser instead).
 */
export const ClosingCtaSection: React.FC<ClosingCtaSectionProps> = ({
  onNavigate,
}) => {
  const { heading, body, buttonLabel, imageSource, route } = ABOUT_CONTENT.cta;

  const handlePress = () => {
    if (!route) {
      return;
    }
    if (/^https?:\/\//i.test(route)) {
      Linking.openURL(route).catch(() => {
        // No handler for the scheme; the card itself ends the page.
      });
      return;
    }
    onNavigate?.(route);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        {imageSource ? (
          <View style={styles.photo}>
            <Image
              source={imageSource}
              style={styles.photoImage}
              resizeMode="cover"
              fadeDuration={0}
            />
            <View style={styles.fill} pointerEvents="none">
              <Svg width="100%" height="100%" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="aboutCtaBlend" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={AboutColors.primaryNavy} stopOpacity="1" />
                    <Stop offset="0.5" stopColor={AboutColors.primaryNavy} stopOpacity="1" />
                    <Stop offset="0.72" stopColor={AboutColors.primaryNavy} stopOpacity="0.72" />
                    <Stop offset="1" stopColor={AboutColors.primaryNavy} stopOpacity="0.2" />
                  </LinearGradient>
                </Defs>
                <Rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="url(#aboutCtaBlend)"
                />
              </Svg>
            </View>
          </View>
        ) : null}

        <View style={styles.textContent}>
          <Text
            accessibilityRole="header"
            style={[AboutTypography.pageTitle, styles.heading]}
          >
            {heading}
          </Text>
          <Text style={[AboutTypography.ctaBody, styles.body]}>{body}</Text>

          <AppButton
            title={buttonLabel}
            variant="gold"
            onPress={handlePress}
            icon={<Text style={styles.arrow}>{'\u2192'}</Text>}
            iconPosition="right"
            style={styles.button}
            textStyle={styles.buttonLabel}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: AboutLayout.contentMaxWidth,
    alignSelf: 'center',
    marginTop: AboutLayout.sectionGap,
    marginBottom: AboutLayout.gutter,
  },
  card: {
    marginHorizontal: AboutLayout.gutter,
    borderRadius: AboutRadius.xl,
    overflow: 'hidden',
    backgroundColor: AboutColors.primaryNavy,
    paddingVertical: 28,
    paddingHorizontal: 22,
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: '52%',
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  photoImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textContent: {
    maxWidth: 420,
  },
  heading: {
    color: AboutColors.textOnDark,
  },
  body: {
    color: AboutColors.textOnDarkMuted,
    marginTop: 10,
  },
  button: {
    backgroundColor: AboutColors.accentGold,
    borderRadius: 8,
    minHeight: 44,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    marginTop: 18,
  },
  buttonLabel: {
    color: AboutColors.textOnGold,
    ...AboutTypography.button,
  },
  arrow: {
    color: AboutColors.textOnGold,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
});
