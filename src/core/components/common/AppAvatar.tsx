import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/theme';
import { initialsOf } from '../../utils/format';

interface AppAvatarProps {
  name: string;
  size?: number;
}

export function AppAvatar({ name, size = 44 }: AppAvatarProps) {
  const dynamic = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  return (
    <View style={[styles.avatar, dynamic]} accessibilityLabel={`Avatar for ${name}`}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initialsOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default AppAvatar;
