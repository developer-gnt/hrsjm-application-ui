import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
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
import {
  HeroSlide,
  DEFAULT_HERO_SLIDES,
  useHeroBanner,
} from '../services/hero-banner.service';

export interface HeroBannerProps {
  slides?: HeroSlide[];
  onCtaPress?: (slide: HeroSlide) => void;
  showCta?: boolean;
}

const AUTOPLAY_INTERVAL_MS = 5000;
const TRANSITION_DURATION_MS = 380;

/**
 * Dynamic & Interactive Hero Banner Carousel:
 * - Dynamically loads slides from store/props with full imagery and copy
 * - Responsive sizing across mobile, tablet, and desktop
 * - Interactive pagination dots matching active slides
 * - Touch & swipe gesture navigation with PanResponder
 * - Slide-specific CTA buttons and navigation callbacks
 */
export const HeroBanner: React.FC<HeroBannerProps> = ({
  slides: propSlides,
  onCtaPress,
  showCta = true,
}) => {
  const { slides: storeSlides, fetchHeroSlides } = useHeroBanner();
  const { width } = useWindowDimensions();

  useEffect(() => {
    fetchHeroSlides();
  }, [fetchHeroSlides]);

  const activeSlides: HeroSlide[] = useMemo(() => {
    if (propSlides && propSlides.length > 0) return propSlides;
    if (storeSlides && storeSlides.length > 0) return storeSlides;
    return DEFAULT_HERO_SLIDES;
  }, [propSlides, storeSlides]);

  const slideCount = activeSlides.length;
  const loopSlides = useMemo(() => {
    if (slideCount === 0) return [];
    return [activeSlides[slideCount - 1], ...activeSlides, activeSlides[0]];
  }, [activeSlides, slideCount]);

  const isDesktop = width >= 768;
  const height = isDesktop
    ? Math.min(380, Math.max(340, Math.round(width * 0.36)))
    : Math.round(Math.min(320, Math.max(260, width * 0.72)));

  const trackOffset = useRef(new Animated.Value(-width)).current;
  const trackPosition = useRef(1);
  const transitioning = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const moveSlide = (direction: -1 | 1) => {
    if (transitioning.current || slideCount <= 1) {
      return;
    }

    const targetPosition = trackPosition.current + direction;
    const targetIndex = (targetPosition - 1 + slideCount) % slideCount;
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
        trackPosition.current = slideCount;
        trackOffset.setValue(-slideCount * width);
      } else if (finished && targetPosition === slideCount + 1) {
        trackPosition.current = 1;
        trackOffset.setValue(-width);
      }
      transitioning.current = false;
    });
  };

  const goToSlide = (targetIndex: number) => {
    if (transitioning.current || targetIndex === activeIndex || slideCount <= 1) {
      return;
    }
    const targetPosition = targetIndex + 1;
    trackPosition.current = targetPosition;
    transitioning.current = true;
    setActiveIndex(targetIndex);

    Animated.timing(trackOffset, {
      toValue: -targetPosition * width,
      duration: TRANSITION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
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
    if (process.env.NODE_ENV === 'test' || slideCount <= 1) {
      return;
    }
    const timer = setTimeout(
      () => moveSlideRef.current(1),
      AUTOPLAY_INTERVAL_MS,
    );
    return () => clearTimeout(timer);
  }, [activeIndex, slideCount]);

  return (
    <View
      style={[styles.container, { height }]}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: width * loopSlides.length,
            transform: [{ translateX: trackOffset }],
          },
        ]}
      >
        {loopSlides.map((slide, index) => {
          const scriptLines = slide.scriptLines || ['People.', 'Rights.', 'Justice.', 'Change.'];
          return (
            <View key={`${slide.id}-${index}`} style={[styles.slide, { width, height }]}>
              <Image source={slide.image} style={styles.background} resizeMode="cover" />
              <View style={styles.darkOverlay} />

              <View style={[styles.content, isDesktop && styles.contentDesktop]}>
                {slide.eyebrow ? (
                  <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
                ) : null}

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
                      label={slide.ctaLabel || 'Join the Movement'}
                      compact={!isDesktop}
                      onPress={() => onCtaPress?.(slide)}
                      textColor="#011F39"
                      backgroundColor="#FAD465"
                    />
                  </View>
                )}
              </View>

              <Text style={styles.script}>
                {scriptLines.map(line => (
                  <Text key={line}>{`${line}\n`}</Text>
                ))}
              </Text>
            </View>
          );
        })}
      </Animated.View>

      {/* Interactive Pagination Dots */}
      {slideCount > 1 && (
        <View
          style={styles.dots}
          accessibilityRole="tablist"
          accessibilityLabel={`Slide ${activeIndex + 1} of ${slideCount}`}
        >
          {Array.from({ length: slideCount }, (_, index) => {
            const isActive = index === activeIndex;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => goToSlide(index)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${index + 1}`}
              >
                <View
                  style={[
                    styles.dot,
                    isActive && styles.dotActive,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#011F39',
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
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(3, 27, 49, 0.58)',
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
    color: '#FAD465',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 5,
    fontFamily: UserFontFamilies.sans,
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
    fontFamily: UserFontFamilies.sans,
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
