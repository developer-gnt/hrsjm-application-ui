import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../../core/theme/theme';

function PulseBlock({
  width,
  height,
  borderRadius = radius.sm,
  style,
}: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.block,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function DonationCardSkeleton() {
  return (
    <View style={styles.card}>
      <PulseBlock width={54} height={54} borderRadius={12} style={styles.thumbnail} />

      <View style={styles.content}>
        <PulseBlock width="80%" height={16} borderRadius={4} />
        <PulseBlock width="45%" height={12} borderRadius={4} style={styles.dateSkeleton} />
      </View>

      <View style={styles.right}>
        <PulseBlock width={70} height={20} borderRadius={6} />
        <PulseBlock width={55} height={16} borderRadius={4} style={styles.amountSkeleton} />
      </View>
    </View>
  );
}

export function DonationListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <DonationCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.xs,
  },
  block: {
    backgroundColor: colors.divider,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnail: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  dateSkeleton: {
    marginTop: 8,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingLeft: spacing.xs,
  },
  amountSkeleton: {
    marginTop: 8,
  },
});

export default DonationListSkeleton;
