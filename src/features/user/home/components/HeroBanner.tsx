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
import {
  AdminColors,
  BorderRadius,
  Spacing,
  UserFontFamilies,
} from '../../../../core/theme';
import { GoldButton } from './GoldButton';
import HeroHomeSource from '../../../../assets/images/hero-home.webp';

interface HeroBannerProps {
  onCtaPress?: () => void;
  showCta?: boolean;
}

const HEADLINE_LINES = ['For Human Rights,', 'Dignity and a'];
const HEADLINE_GOLD_LINE = 'More Just Society.';
const SUPPORTING_TEXT =
  'We work for equal rights, social justice and stronger communities across India.';
const SCRIPT_LINES = ['People.', 'Rights.', 'Justice.', 'Change.'];
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
export const HeroBanner: React.FC<HeroBannerProps> = ({
  onCtaPress,
  showCta = true,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const height = isDesktop
    ? Math.min(380, Math.max(340, Math.round(width * 0.36)))
    : Math.round(Math.min(320, Math.max(260, width * 0.72)));
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
            <View style={styles.darkOverlay} />

            <View style={[styles.content, isDesktop && styles.contentDesktop]}>
              <Text style={[styles.headline, isDesktop && styles.headlineDesktop]}>
                {slide.headlineLines.map(line => (
                  <Text key={line}>{`${line}\n`}</Text>
                ))}
                <Text style={styles.headlineGold}>{slide.goldLine}</Text>
              </Text>

              <Text style={[styles.supporting, isDesktop && styles.supportingDesktop]}>
                {slide.supporting}
              </Text>

              {showCta && (
                <View style={styles.cta}>
                  <GoldButton
                    label="Join the Movement"
                    compact={!isDesktop}
                    onPress={onCtaPress}
                    textColor="#011F39"
                    backgroundColor="#FAD465"
                  />
                </View>
              )}
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
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#011F39', // color-navy-950
  },
  track: {
    flexDirection: 'row',
  },
  slide: {
    overflow: 'hidden',
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '-2%',
    width: '108%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(3, 27, 49, 0.58)', // color-overlay with transparency
  },
  content: {
    width: '68%',
    paddingHorizontal: Spacing.base,
    paddingTop: 16,
    zIndex: 2,
  },
  contentDesktop: {
    width: '56%',
    paddingHorizontal: 28,
    paddingTop: 36,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FAD465', // color-gold-500
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 5,
    fontFamily: 'Inter',
  },
  headline: {
    fontFamily: UserFontFamilies.heading,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headlineDesktop: {
    fontSize: 34,
    lineHeight: 40,
  },
  headlineGold: {
    color: '#FAD465',
    fontFamily: UserFontFamilies.heading,
    fontWeight: '700',
  },
  supporting: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 8,
    maxWidth: 270,
    fontFamily: 'Inter',
  },
  supportingDesktop: {
    fontSize: 14.5,
    lineHeight: 21,
    maxWidth: 380,
    marginTop: 12,
  },
  cta: {
    marginTop: 14,
  },
  script: {
    position: 'absolute',
    right: 14,
    bottom: 22,
    fontFamily: UserFontFamilies.quote,
    fontStyle: 'italic',
    fontSize: 22,
    lineHeight: 25,
    color: '#FFFFFF',
    textAlign: 'right',
    opacity: 0.95,
    zIndex: 2,
  },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.45,
  },
  dotActive: {
    backgroundColor: '#FAD465',
    opacity: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
