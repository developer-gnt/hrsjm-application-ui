/**
 * Toast message banner used across the Profile and ID Card flow.
 * Rendered as a floating pill with smooth animations, status indicators,
 * and support for 'loading' | 'downloading' | 'success' | 'error' states.
 */
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AdminColors } from '../../../../core';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';

export type ToastVariant = 'success' | 'loading' | 'error' | 'info';

export interface ToastState {
  message: string;
  variant?: ToastVariant;
}

export interface ProfileToastProps {
  message: string | ToastState | null;
  variant?: ToastVariant;
  onDismiss?: () => void;
  durationMs?: number;
}

export const ProfileToast: React.FC<ProfileToastProps> = ({
  message,
  variant: propVariant,
  onDismiss,
  durationMs = 3500,
}) => {
  const translateY = useRef(new Animated.Value(-16)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const resolvedMessage =
    typeof message === 'object' && message !== null ? message.message : message;
  const resolvedVariant: ToastVariant =
    (typeof message === 'object' && message !== null ? message.variant : undefined) ||
    propVariant ||
    'success';

  useEffect(() => {
    if (!resolvedMessage) return;

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    if (resolvedVariant !== 'loading' && durationMs > 0) {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -16,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onDismiss) onDismiss();
        });
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [resolvedMessage, resolvedVariant, durationMs, onDismiss, opacity, translateY]);

  if (!resolvedMessage) return null;

  const isError = resolvedVariant === 'error';
  const isLoading = resolvedVariant === 'loading';
  const isInfo = resolvedVariant === 'info';

  const getBackgroundColor = () => {
    if (isError) return AdminColors.error;
    if (isLoading) return '#082046'; // deep navy
    if (isInfo) return AdminColors.primary;
    return '#14532D'; // emerald green
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color="#E5B842"
          style={styles.spinner}
        />
      ) : (
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>
            {isError ? '✕' : isInfo ? 'ℹ' : '✓'}
          </Text>
        </View>
      )}
      <Text style={styles.text} numberOfLines={2}>
        {resolvedMessage}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 999,
    elevation: 24,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },
  spinner: {
    marginRight: 10,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  text: {
    ...Typography.secondaryMedium,
    color: AdminColors.textOnDark,
    flex: 1,
    fontSize: 13.5,
    letterSpacing: 0.1,
  },
});

export default ProfileToast;

