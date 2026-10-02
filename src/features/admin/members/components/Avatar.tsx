import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { StatusTones, StatusToneKey } from '../../../../core/theme/colors';

interface AvatarProps {
  name: string;
  /** Optional member photo; falls back to tinted initials. */
  source?: ImageSourcePropType | { uri: string };
  size?: number;
  /** Deterministic tint override; defaults to a hash of the name. */
  tone?: StatusToneKey;
}

const TONE_ROTATION: StatusToneKey[] = ['navy', 'success', 'gold', 'warning', 'neutral', 'danger'];

const getToneForName = (name: string): StatusToneKey => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return TONE_ROTATION[hash % TONE_ROTATION.length];
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Member avatar with a consistent size, deterministic subtle tinted
 * background, and initials fallback when no photo exists.
 */
export const Avatar: React.FC<AvatarProps> = ({ name, source, size = 40, tone }) => {
  if (source) {
    return (
      <Image
        source={source}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    );
  }

  const resolvedTone = tone ?? getToneForName(name);
  const colors = StatusTones[resolvedTone];

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.bg,
        },
      ]}
      accessibilityLabel={`${name} avatar`}
    >
      <Text style={[styles.initials, { fontSize: Math.max(11, Math.round(size * 0.34)), color: colors.text }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default Avatar;
