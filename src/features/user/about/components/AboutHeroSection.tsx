import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ABOUT_CONTENT } from '../content/aboutContent';
import {
  AboutColors,
  AboutLayout,
  AboutRadius,
  AboutTypography,
} from '../theme';

/**
 * Hero (spec Phase 4): inset rounded card using the approved hero visual as
 * its full background (the navy-to-photo blend is baked into the source
 * image). The stacked serif words ("People. Rights. Justice." white,
 * "Change." gold), the gold underline rule and the caption render on top; a
 * gentle left scrim keeps them readable at every width. Without the asset the
 * card falls back to the navy gradient.
 */
export const AboutHeroSection: React.FC = () => {
  const { width } = useWindowDimensions();
  const { lines, goldLineIndex, caption, backgroundSource } = ABOUT_CONTENT.hero;

  const isWide = width >= 768;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        {backgroundSource ? (
          <View style={styles.fill} pointerEvents="none">
            <Image
              source={backgroundSource}
              style={styles.bgImage}
              resizeMode="cover"
              fadeDuration={0}
            />
            <Svg style={styles.fill} preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="aboutHeroTextScrim" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={AboutColors.primaryNavy} stopOpacity="0.85" />
                  <Stop offset="0.42" stopColor={AboutColors.primaryNavy} stopOpacity="0.5" />
                  <Stop offset="0.78" stopColor={AboutColors.primaryNavy} stopOpacity="0.08" />
                  <Stop offset="1" stopColor={AboutColors.primaryNavy} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#aboutHeroTextScrim)"
              />
            </Svg>
          </View>
        ) : (
          <View style={styles.fill} pointerEvents="none">
            <Svg width="100%" height="100%" preserveAspectRatio="none">
              <Defs>
                <LinearGradient
                  id="aboutHeroFallback"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <Stop offset="0" stopColor={AboutColors.secondaryNavy} />
                  <Stop offset="1" stopColor={AboutColors.primaryNavy} />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#aboutHeroFallback)"
              />
            </Svg>
          </View>
        )}

        <View style={styles.content}>
          <View>
            {lines.map((line, index) => (
              <Text
                key={line}
                accessibilityRole={index === 0 ? 'header' : undefined}
                style={[
                  AboutTypography.heroDisplay,
                  {
                    color:
                      index === goldLineIndex
                        ? AboutColors.accentGold
                        : AboutColors.textOnDark,
                  },
                ]}
              >
                {line}
              </Text>
            ))}
          </View>

          {/* Gold underline rule from the reference. */}
          <View style={styles.goldRule} />

          <Text
            style={[
              AboutTypography.heroCaption,
              styles.caption,
              isWide && styles.captionWide,
            ]}
          >
            {caption}
          </Text>
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
    marginTop: 8,
  },
  card: {
    height: 360,
    marginHorizontal: AboutLayout.gutter,
    borderRadius: AboutRadius.xl,
    overflow: 'hidden',
    backgroundColor: AboutColors.primaryNavy,
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 300,
    paddingLeft: 22,
    paddingRight: 8,
    paddingVertical: 24,
  },
  goldRule: {
    width: 52,
    height: 3,
    borderRadius: 2,
    backgroundColor: AboutColors.accentGold,
    marginTop: 14,
    marginBottom: 14,
  },
  caption: {
    color: AboutColors.textOnDarkMuted,
  },
  captionWide: {
    maxWidth: 360,
  },
});
