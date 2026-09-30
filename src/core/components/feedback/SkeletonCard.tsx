import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

interface SkeletonCardProps {
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  height = 80,
  borderRadius = BorderRadius.lg,
  style,
  lines = 1,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });

  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.skeleton,
            {
              height,
              borderRadius,
              opacity,
              marginBottom: lines > 1 && index < lines - 1 ? Spacing.sm : 0,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: AdminColors.shimmerBase,
    width: '100%',
  },
});
