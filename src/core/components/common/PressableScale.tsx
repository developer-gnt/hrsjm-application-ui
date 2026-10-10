import React, { useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface PressableScaleProps {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** Scale applied while pressed (default 0.97 — subtle). */
  scaleTo?: number;
  /** Opacity applied while pressed (default 0.85). */
  pressedOpacity?: number;
  style?: StyleProp<ViewStyle>;
  /**
   * Style for the Pressable element itself (the layout/flex child).
   * Use for flex sizing (flex, minWidth...) — `style` animates the inner view.
   */
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  /** Minimum touch target is enforced by the caller's layout; pass hitSlop to extend it. */
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number };
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'tab' | 'checkbox' | 'menuitem' | 'radio' | 'adjustable';
  accessibilityState?: { selected?: boolean; checked?: boolean | 'mixed'; disabled?: boolean };
  testID?: string;
}

const SPRING_CONFIG = { speed: 30, bounciness: 4 };

/**
 * Shared press-feedback primitive: gentle scale + opacity spring on press.
 * Used across buttons, tabs, rows, checkboxes and navigation items so every
 * interactive element gives the same subtle motion (no bounce, no delay).
 */
export const PressableScale: React.FC<PressableScaleProps> = ({
  onPress,
  onLongPress,
  disabled = false,
  scaleTo = 0.97,
  pressedOpacity = 0.85,
  style,
  containerStyle,
  children,
  hitSlop,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  testID,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateTo = useCallback(
    (toScale: number, toOpacity: number) => {
      Animated.parallel([
        Animated.spring(scale, { toValue: toScale, useNativeDriver: true, ...SPRING_CONFIG }),
        Animated.timing(opacity, { toValue: toOpacity, duration: 90, useNativeDriver: true }),
      ]).start();
    },
    [scale, opacity]
  );

  const handlePressIn = useCallback(() => {
    if (!disabled) animateTo(scaleTo, pressedOpacity);
  }, [disabled, scaleTo, pressedOpacity, animateTo]);

  const handlePressOut = useCallback(() => {
    if (!disabled) animateTo(1, 1);
  }, [disabled, animateTo]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      style={containerStyle}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      testID={testID}
    >
      {() => (
        <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
};

export default PressableScale;
