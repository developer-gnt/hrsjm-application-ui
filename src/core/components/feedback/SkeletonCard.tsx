import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Spacing, BorderRadius } from '../../theme/spacing';

interface SkeletonCardProps {
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  lines?: number;
}

/**
 * Animated shimmering skeleton loader card for smooth visual feedback during loading.
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  height = 80,
  borderRadius = BorderRadius.lg,
  style,
  lines = 1,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 750,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 750,
          useNativeDriver: false,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#E2E8F0', '#F8FAFC', '#E2E8F0'],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.65, 0.95, 0.65],
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
              backgroundColor,
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
    width: '100%',
    overflow: 'hidden',
  },
});

export default SkeletonCard;
