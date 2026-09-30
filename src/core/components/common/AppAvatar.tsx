import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface AppAvatarProps {
  name?: string;
  source?: ImageSourcePropType | { uri: string };
  size?: number;
  backgroundColor?: string;
}

export const AppAvatar: React.FC<AppAvatarProps> = ({
  name = 'User',
  source,
  size = 40,
  backgroundColor = AdminColors.primaryLight,
}) => {
  const getInitials = (str: string): string => {
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (str.substring(0, 2) || 'US').toUpperCase();
  };

  const borderRadius = size / 2;

  if (source) {
    return (
      <Image
        source={source}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          Typography.bodyBold,
          {
            color: AdminColors.primary,
            fontSize: Math.max(12, Math.floor(size * 0.38)),
          },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
});
