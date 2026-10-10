import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';

/**
 * TEMPORARY minimal local toast for the Create Event screen.
 *
 * A shared Toast component does not exist yet (Aman's shared-component list,
 * spec section 5) — replace this with the shared one when available.
 */

interface EventFormToastProps {
  message: string | null;
  variant?: 'success' | 'error';
  durationMs?: number;
  onDismiss: () => void;
}

export const EventFormToast: React.FC<EventFormToastProps> = ({
  message,
  variant = 'success',
  durationMs = 3000,
  onDismiss,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) {
      return undefined;
    }
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(durationMs),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        onDismiss();
      }
    });
    return () => opacity.stopAnimation();
  }, [message, durationMs, opacity, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.toast,
        variant === 'error' ? styles.toastError : styles.toastSuccess,
        { opacity },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text style={styles.icon}>{variant === 'error' ? '⚠️' : '✅'}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    bottom: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.primaryDark,
    elevation: 6,
  },
  toastSuccess: {
    backgroundColor: AdminColors.primaryDark,
  },
  toastError: {
    backgroundColor: AdminColors.error,
  },
  icon: {
    fontSize: 15,
  },
  message: {
    ...Typography.secondaryMedium,
    color: AdminColors.textOnDark,
    flex: 1,
  },
});