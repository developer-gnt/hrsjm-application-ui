import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface NetworkBannerProps {
  isConnected?: boolean;
  message?: string;
}

export const NetworkBanner: React.FC<NetworkBannerProps> = ({
  isConnected = true,
  message = 'No Internet Connection. Some features may be unavailable.',
}) => {
  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: AdminColors.error,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  text: {
    ...Typography.secondaryMedium,
    color: AdminColors.textOnDark,
    textAlign: 'center',
  },
});
