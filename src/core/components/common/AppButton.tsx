import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const getVariantContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: AdminColors.primaryLight,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: AdminColors.primary,
        };
      case 'danger':
        return {
          backgroundColor: AdminColors.error,
        };
      case 'gold':
        return {
          backgroundColor: AdminColors.accentGold,
        };
      case 'primary':
      default:
        return {
          backgroundColor: AdminColors.primary,
        };
    }
  };

  const getVariantTextStyle = (): TextStyle => {
    switch (variant) {
      case 'secondary':
        return {
          color: AdminColors.primary,
        };
      case 'outline':
        return {
          color: AdminColors.primary,
        };
      case 'danger':
        return {
          color: AdminColors.textOnDark,
        };
      case 'gold':
        return {
          color: AdminColors.textOnDark,
        };
      case 'primary':
      default:
        return {
          color: AdminColors.textOnDark,
        };
    }
  };

  const getSizeContainerStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.md,
          minHeight: 36,
        };
      case 'lg':
        return {
          paddingVertical: Spacing.base,
          paddingHorizontal: Spacing.xl,
          minHeight: 52,
        };
      case 'md':
      default:
        return {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.base,
          minHeight: 46,
        };
    }
  };

  const getSizeTextStyle = (): TextStyle => {
    switch (size) {
      case 'sm':
        return Typography.secondaryMedium;
      case 'lg':
        return Typography.button;
      case 'md':
      default:
        return Typography.button;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.baseButton,
        getVariantContainerStyle(),
        getSizeContainerStyle(),
        isDisabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? AdminColors.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' ? <>{icon}</> : null}
          <Text
            style={[
              styles.baseText,
              getVariantTextStyle(),
              getSizeTextStyle(),
              icon && iconPosition === 'left' ? styles.iconLeftMargin : null,
              icon && iconPosition === 'right' ? styles.iconRightMargin : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' ? <>{icon}</> : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: BorderRadius.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  baseText: {
    textAlign: 'center',
  },
  iconLeftMargin: {
    marginLeft: Spacing.sm,
  },
  iconRightMargin: {
    marginRight: Spacing.sm,
  },
});
