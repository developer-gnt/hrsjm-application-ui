/**
 * Toast banner used by the profile screens. Rendered as a floating
 * pill near the top, mirroring the Donations screen toast style.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors } from '../../../../core';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';

interface ProfileToastProps {
  message: string;
}

export const ProfileToast: React.FC<ProfileToastProps> = ({ message }) => (
  <View style={styles.container} pointerEvents="none">
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 99,
    elevation: 20,
    backgroundColor: AdminColors.primaryDark,
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  text: {
    ...Typography.secondaryMedium,
    color: AdminColors.textOnDark,
    textAlign: 'center',
  },
});

export default ProfileToast;
