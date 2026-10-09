import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';

interface MembershipRenewCtaButtonProps {
  onPress?: () => void;
  title?: string;
  disabled?: boolean;
}

export const MembershipRenewCtaButton: React.FC<MembershipRenewCtaButtonProps> = ({
  onPress,
  title = 'Renew Membership',
  disabled = false,
}) => {
  return (
    <View style={styles.container} accessibilityRole="region" accessibilityLabel="Renew Membership Action">
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {/* Left Circular Sync Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.renewArcTop} />
          <View style={styles.renewArrowTop} />
          <View style={styles.renewArcBottom} />
          <View style={styles.renewArrowBottom} />
        </View>

        {/* Center Text */}
        <Text style={styles.buttonText}>{title}</Text>

        {/* Right Arrow */}
        <Text style={styles.arrowIcon}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: Spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAA224',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.lg,
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 20,
    height: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  renewArcTop: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.8,
    borderColor: '#0A204C',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-20deg' }],
  },
  renewArrowTop: {
    position: 'absolute',
    top: 5,
    right: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0A204C',
  },
  renewArcBottom: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.8,
    borderColor: '#0A204C',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-20deg' }],
  },
  renewArrowBottom: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0A204C',
  },
  buttonText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0A204C',
    letterSpacing: 0.2,
    marginRight: 10,
  },
  arrowIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A204C',
    lineHeight: 20,
  },
});
