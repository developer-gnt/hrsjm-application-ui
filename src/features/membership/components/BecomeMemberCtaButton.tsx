import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { CtaArrowRightIcon } from './MembershipIcons';

interface BecomeMemberCtaButtonProps {
  onPress: () => void;
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const BecomeMemberCtaButton: React.FC<BecomeMemberCtaButtonProps> = ({
  onPress,
  title = 'Become a Member',
  loading = false,
  disabled = false,
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#0F2860" />
        ) : (
          <View style={styles.contentRow}>
            <Text style={styles.buttonText}>{title}</Text>
            <View style={styles.arrowWrapper}>
              <CtaArrowRightIcon size={18} color="#0F2860" />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
  },
  button: {
    backgroundColor: '#EAA224',
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
    letterSpacing: 0.3,
  },
  arrowWrapper: {
    marginTop: 1,
  },
});
