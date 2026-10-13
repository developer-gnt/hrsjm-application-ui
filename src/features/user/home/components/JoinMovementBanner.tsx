import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, FontFamilies, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';

interface JoinMovementBannerProps {
  onJoinPress?: () => void;
  onLearnMorePress?: () => void;
}

const STATS = [
  { value: '12,000+', label: 'Active Members' },
  { value: '98%', label: 'Cases Resolved' },
  { value: '15+', label: 'Years of Service' },
];

/**
 * Premium "Join the Movement" CTA section with animated glow, stat counters,
 * and dual action buttons. Full-width navy card with gold accents.
 */
export const JoinMovementBanner: React.FC<JoinMovementBannerProps> = ({
  onJoinPress,
  onLearnMorePress,
}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [glowAnim, pulseAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.4],
  });

  return (
    <View style={styles.container}>
      {/* Background glow effect */}
      <Animated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />

      {/* Top badge */}
      <View style={styles.topBadge}>
        <AppIcon name="star" size={13} color="#EAA532" />
        <Text style={styles.topBadgeText}>TRUSTED BY 12,000+ MEMBERS</Text>
      </View>

      {/* Headline */}
      <Text style={styles.headline}>Be Part of{'\n'}the Change.</Text>

      {/* Sub-headline */}
      <Text style={styles.subHeadline}>
        Join HRSJM and help build a society where every person's rights are
        protected, respected and upheld.
      </Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {STATS.map((stat, index) => (
          <React.Fragment key={stat.label}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
            {index < STATS.length - 1 && <View style={styles.statDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.buttonsRow}>
        <Animated.View style={[styles.primaryBtnWrap, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onJoinPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Join HRSJM"
          >
            <Text style={styles.primaryBtnText}>Join HRSJM</Text>
            <AppIcon name="arrow-right" size={16} color="#082245" />
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onLearnMorePress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Learn about HRSJM"
        >
          <Text style={styles.secondaryBtnText}>Learn More</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom trust indicators */}
      <View style={styles.trustRow}>
        <AppIcon name="shield-check" size={13} color="rgba(255,255,255,0.55)" />
        <Text style={styles.trustText}>Free to join · No fees · Confidential support</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#06274D',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#EAA532',
    top: -120,
    right: -80,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  topBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#EAA532',
    letterSpacing: 0.6,
  },
  headline: {
    fontFamily: FontFamilies.serif,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  subHeadline: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FontFamilies.serif,
    fontSize: 18,
    fontWeight: '700',
    color: '#EAA532',
  },
  statLabel: {
    fontSize: 10,
    lineHeight: 14,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  primaryBtnWrap: {
    flex: 1,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EAA532',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.base,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#082245',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  trustText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    flex: 1,
  },
});
