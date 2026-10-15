import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';

// Simple opacity-pulse skeleton. Never renders a blank screen while loading.
function Pulse({ style }: { style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.block, style, { opacity }]} />;
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Pulse style={styles.avatar} />
        <View style={styles.column}>
          <Pulse style={styles.lineHalf} />
          <Pulse style={styles.lineThird} />
        </View>
      </View>
      <Pulse style={styles.lineWide} />
      <Pulse style={styles.lineMedium} />
      <Pulse style={styles.pill} />
    </View>
  );
}

export function SkeletonStatRow() {
  return (
    <View style={styles.statRow}>
      {[0, 1, 2, 3].map(index => (
        <Pulse key={index} style={styles.statCard} />
      ))}
    </View>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.divider,
    borderRadius: radius.sm,
    minHeight: 12,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  column: {
    flex: 1,
    marginLeft: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 0,
  },
  lineHalf: {
    width: '55%',
    height: 14,
  },
  lineThird: {
    width: '35%',
    height: 12,
  },
  lineWide: {
    width: '80%',
    height: 12,
  },
  lineMedium: {
    width: '45%',
    height: 12,
  },
  pill: {
    width: 110,
    height: 22,
    borderRadius: radius.round,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    height: 64,
    borderRadius: radius.md,
    marginBottom: 0,
  },
});

export default SkeletonList;
