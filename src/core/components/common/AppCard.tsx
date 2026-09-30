import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof Spacing;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  onPress,
  style,
  variant = 'elevated',
  padding = 'base',
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: AdminColors.border,
        };
      case 'flat':
        return {
          backgroundColor: AdminColors.background,
        };
      case 'elevated':
      default:
        return {
          ...Shadows.card,
        };
    }
  };

  const cardPadding = Spacing[padding] ?? Spacing.base;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.card,
          getVariantStyle(),
          { padding: cardPadding },
          style,
        ]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.card,
        getVariantStyle(),
        { padding: cardPadding },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.xs,
  },
});
