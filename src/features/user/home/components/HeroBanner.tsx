import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { AdminColors, BorderRadius, FontFamilies, Spacing } from '../../../../core/theme';
import { GoldButton } from './GoldButton';
import HeroHomeSource from '../../../../assets/images/hero-home.webp';

interface HeroBannerProps {
  onCtaPress?: () => void;
}

const HEADLINE_LINES = ['For Human Rights,', 'Dignity and a'];
const HEADLINE_GOLD_LINE = 'More Just Society.';
const SUPPORTING_TEXT =
  'We work for equal rights, social justice and stronger communities across India.';
const SCRIPT_LINES = ['People', 'Rights', 'Justice', 'Change'];
const AUTOPLAY_INTERVAL_MS = 4500;
const TRANSITION_DURATION_MS = 360;

const SLIDES = [
  {
    id: 'home',
    headlineLines: HEADLINE_LINES,
    goldLine: HEADLINE_GOLD_LINE,
    supporting: SUPPORTING_TEXT,
    image: HeroHomeSource,
  },
  {
    id: 'community',
    headlineLines: ['Stand for Rights.'],
    goldLine: 'Stand for Dignity.',
    supporting:
      'Together we can build stronger, fairer and more inclusive communities.',
    image: require('../../../../assets/images/contact-cta-hands.jpg'),
  },
  {
    id: 'action',
    headlineLines: ['Awareness.', 'Action.'],
    goldLine: 'Change.',
    supporting:
      'Protecting rights and creating positive change through community action.',
    image: require('../../../../assets/images/contact-cta-hands.jpg'),
  },
];

const LOOP_SLIDES = [SLIDES[SLIDES.length - 1], ...SLIDES, SLIDES[0]];
const DOT_COUNT = 5;

/**
 * Reference-locked hero: the official navy/gold artwork (portrait of the
 * girl with paint splashes) as the full-bleed background, serif headline
 * with the gold final line, supporting copy, compact gold CTA, carousel
 * dots and the diagonal script overlay on the right.
 */
export const HeroBanner: React.FC<HeroBannerProps> = ({ onCtaPress }) => {
  const { width } = useWindowDimensions();
  const height = Math.round(Math.min(295, Math.max(250, width * 0.68)));
  const trackOffset = useRef(new Animated.Value(-width)).current;
  const trackPosition = useRef(1);
  const transitioning = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const moveSlide = (direction: -1 | 1) => {
    if (transitioning.current) {
      return;
    }

    const targetPosition = trackPosition.current + direction;
    const targetIndex = (targetPosition - 1 + SLIDES.length) % SLIDES.length;
    trackPosition.current = targetPosition;
    transitioning.current = true;
    setActiveIndex(targetIndex);

    Animated.timing(trackOffset, {
      toValue: -targetPosition * width,
      duration: TRANSITION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && targetPosition === 0) {
        trackPosition.current = SLIDES.length;
        trackOffset.setValue(-SLIDES.length * width);
      } else if (finished && targetPosition === SLIDES.length + 1) {
        trackPosition.current = 1;
        trackOffset.setValue(-width);
      }
      transitioning.current = false;
    });
  };

  const moveSlideRef = useRef(moveSlide);
  moveSlideRef.current = moveSlide;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderRelease: (_, gesture) => {
        const swipeThreshold = Math.max(40, width * 0.16);
        if (gesture.dx <= -swipeThreshold || gesture.vx <= -0.45) {
          moveSlideRef.current(1);
        } else if (gesture.dx >= swipeThreshold || gesture.vx >= 0.45) {
          moveSlideRef.current(-1);
        }
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  useEffect(() => {
    trackOffset.stopAnimation();
    trackOffset.setValue(-trackPosition.current * width);
  }, [trackOffset, width]);

  useEffect(() => {
    const timer = setTimeout(
      () => moveSlideRef.current(1),
      AUTOPLAY_INTERVAL_MS,
    );
    return () => clearTimeout(timer);
  }, [activeIndex]);

  return (
    <View
      style={[styles.container, { height }]}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: width * LOOP_SLIDES.length,
            transform: [{ translateX: trackOffset }],
          },
        ]}
      >
        {LOOP_SLIDES.map((slide, index) => (
          <View key={`${slide.id}-${index}`} style={[styles.slide, { width, height }]}>
            <Image source={slide.image} style={styles.background} resizeMode="cover" />

            <View style={styles.content}>
              <Text style={styles.headline}>
                {slide.headlineLines.map(line => (
                  <Text key={line}>{`${line}\n`}</Text>
                ))}
                <Text style={styles.headlineGold}>{slide.goldLine}</Text>
              </Text>

              <Text style={styles.supporting}>{slide.supporting}</Text>

              <View style={styles.cta}>
                <GoldButton
                  label="Join the Movement"
                  compact
                  onPress={onCtaPress}
                  textColor="#082245"
                  backgroundColor="#EAA532"
                />
              </View>
            </View>

            <Text style={styles.script}>
              {SCRIPT_LINES.map(line => (
                <Text key={line}>{`${line}\n`}</Text>
              ))}
            </Text>
          </View>
        ))}
      </Animated.View>

      <View
        style={styles.dots}
        accessibilityRole="progressbar"
        accessibilityLabel={`Slide ${activeIndex + 1} of ${DOT_COUNT}`}
      >
        {Array.from({ length: DOT_COUNT }, (_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    backgroundColor: '#082245',
  },
  track: {
    flexDirection: 'row',
  },
  slide: {
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '-2%',
    width: '108%',
    height: '100%',
  },
  content: {
    width: '63%',
    paddingHorizontal: Spacing.base,
    paddingTop: 18,
  },
  headline: {
    fontFamily: FontFamilies.serif,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  headlineGold: {
    color: '#EAA532',
  },
  supporting: {
    fontSize: 11,
    lineHeight: 15.5,
    color: AdminColors.textOnDark,
    marginTop: 8,
    maxWidth: 220,
    opacity: 0.95,
  },
  cta: {
    marginTop: 14,
  },
  script: {
    position: 'absolute',
    right: 8,
    bottom: 34,
    fontFamily: Platform.select({ ios: 'Snell Roundhand', default: 'cursive' }),
    fontStyle: 'italic',
    fontSize: 13.5,
    lineHeight: 16,
    color: AdminColors.textOnDark,
    textAlign: 'right',
    transform: [{ rotate: '-63deg' }],
    opacity: 0.9,
  },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.45,
  },
  dotActive: {
    backgroundColor: '#EAA532',
    opacity: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
