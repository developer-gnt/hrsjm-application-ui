import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  type ImageSourcePropType,
} from 'react-native';
import { Icon, type IconName } from '../../../core/components/common/Icon';
import { CAUSE_DEFAULT_IMAGES } from './CauseHeroBanner';

export interface CauseThumbnailProps {
  type: 'education' | 'medical' | 'tree' | 'disaster' | 'membership';
  size?: number;
  imageUrl?: string;
  imageSource?: ImageSourcePropType;
}

const CONFIG: Record<
  CauseThumbnailProps['type'],
  { bg: string; icon: IconName; iconColor: string; label: string }
> = {
  education: {
    bg: '#EAF1FE',
    icon: 'users',
    iconColor: '#1B3B8C',
    label: 'Edu',
  },
  medical: {
    bg: '#E7F6EE',
    icon: 'heart',
    iconColor: '#23A45F',
    label: 'Med',
  },
  tree: {
    bg: '#DEF7EC',
    icon: 'grid',
    iconColor: '#047857',
    label: 'Tree',
  },
  disaster: {
    bg: '#FDECEC',
    icon: 'clock',
    iconColor: '#E5484D',
    label: 'Relief',
  },
  membership: {
    bg: '#FDF4DE',
    icon: 'person',
    iconColor: '#C08A00',
    label: 'Mem',
  },
};

export function CauseThumbnail({
  type,
  size = 52,
  imageUrl,
  imageSource,
}: CauseThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const conf = CONFIG[type] || CONFIG.education;

  let resolvedSource: ImageSourcePropType | undefined = imageSource;
  if (!resolvedSource && imageUrl && imageUrl.trim().length > 0) {
    resolvedSource = { uri: imageUrl.trim() };
  }
  if (!resolvedSource) {
    resolvedSource = CAUSE_DEFAULT_IMAGES[type];
  }

  if (resolvedSource && !imageError) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: 12,
            backgroundColor: conf.bg,
          },
        ]}>
        <Image
          source={resolvedSource}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
          accessibilityRole="image"
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: conf.bg,
        },
      ]}>
      <Icon
        name={conf.icon}
        size={Math.round(size * 0.44)}
        color={conf.iconColor}
        strokeWidth={2.2}
      />
      <Text style={[styles.badgeText, { color: conf.iconColor }]}>{conf.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

export default CauseThumbnail;
