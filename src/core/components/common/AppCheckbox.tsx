import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { BrandColors } from '../../theme/colors';
import { PressableScale } from './PressableScale';
import { Check, Minus } from '../icons';

interface AppCheckboxProps {
  checked: boolean;
  /** Shows a dash state (e.g. some-but-not-all rows selected). */
  indeterminate?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
  accessibilityLabel?: string;
  testID?: string;
}

const BORDER_WIDTH = 1.5;

/**
 * Square selection checkbox with animated fill. Filled state uses the brand
 * navy so selection always reads as a primary interaction.
 */
export const AppCheckbox: React.FC<AppCheckboxProps> = ({
  checked,
  indeterminate = false,
  onPress,
  disabled = false,
  size = 20,
  accessibilityLabel,
  testID,
}) => {
  const fill = useRef(new Animated.Value(checked || indeterminate ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(fill, {
      toValue: checked || indeterminate ? 1 : 0,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [checked, indeterminate, fill]);

  const isActive = checked || indeterminate;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.88}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}
      testID={testID}
    >
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: Math.max(5, size * 0.3),
            borderColor: isActive ? BrandColors.navy : BrandColors.textMuted,
            backgroundColor: isActive ? BrandColors.navy : BrandColors.surface,
          },
          disabled && styles.boxDisabled,
        ]}
      >
        <Animated.View style={[styles.mark, { transform: [{ scale: fill }], opacity: fill }]}>
          {indeterminate ? (
            <Minus size={size * 0.7} color={BrandColors.surface} strokeWidth={3} />
          ) : (
            <Check size={size * 0.7} color={BrandColors.surface} strokeWidth={3} />
          )}
        </Animated.View>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDER_WIDTH,
  },
  boxDisabled: {
    opacity: 0.4,
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppCheckbox;
