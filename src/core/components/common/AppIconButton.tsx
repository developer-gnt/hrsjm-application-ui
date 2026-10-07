import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface AppIconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export const AppIconButton: React.FC<AppIconButtonProps> = ({
  onPress,
  icon,
  size = 40,
  backgroundColor = 'transparent',
  borderColor,
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor: borderColor || 'transparent',
          borderWidth: borderColor ? 1 : 0,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
