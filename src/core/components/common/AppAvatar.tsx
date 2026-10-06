import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/theme';
import { initialsOf } from '../../utils/format';

interface AppAvatarProps {
  name: string;
  size?: number;
  imageUrl?: string | null;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

export function AppAvatar({
  name,
  size = 44,
  imageUrl,
  style,
  imageStyle,
}: AppAvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  const dynamic = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (imageUrl && !hasError) {
    return (
      <View style={[styles.avatar, dynamic, style]}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, dynamic, imageStyle]}
          onError={() => setHasError(true)}
          accessibilityLabel={`Avatar for ${name}`}
        />
      </View>
    );
  }

  return (
    <View style={[styles.avatar, dynamic, style]} accessibilityLabel={`Avatar for ${name}`}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>
        {initialsOf(name || 'User')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default AppAvatar;
