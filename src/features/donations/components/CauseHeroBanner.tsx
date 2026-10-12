import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
  type ImageSourcePropType,
} from 'react-native';
import { colors, radius, spacing } from '../../../core/theme/theme';
import { Icon, type IconName } from '../../../core/components/common/Icon';

export interface CauseHeroBannerProps {
  type: 'education' | 'medical' | 'tree' | 'disaster' | 'membership';
  title: string;
  imageUrl?: string;
  imageSource?: ImageSourcePropType;
  categoryLabel?: string;
}

// Photographic cause banner image assets & curated CDNs
export const CAUSE_DEFAULT_IMAGES: Record<
  CauseHeroBannerProps['type'],
  ImageSourcePropType
> = {
  education: require('../../../assets/education_cause_banner.jpg'),
  medical: {
    uri: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1000&auto=format&fit=crop',
  },
  tree: {
    uri: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop',
  },
  disaster: {
    uri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop',
  },
  membership: {
    uri: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=1000&auto=format&fit=crop',
  },
};

const BANNER_THEMES: Record<
  CauseHeroBannerProps['type'],
  { bg: string; accent: string; icon: IconName; bannerText: string; badgeBg: string }
> = {
  education: {
    bg: '#1B3B8C',
    accent: '#E9F0FC',
    icon: 'users',
    bannerText: 'Empowering Education & Brighter Futures',
    badgeBg: 'rgba(27, 59, 140, 0.85)',
  },
  medical: {
    bg: '#047857',
    accent: '#E7F6EE',
    icon: 'heart',
    bannerText: 'Healthcare & Emergency Medical Relief',
    badgeBg: 'rgba(4, 120, 87, 0.85)',
  },
  tree: {
    bg: '#0F5132',
    accent: '#DEF7EC',
    icon: 'grid',
    bannerText: 'Environmental Greenery & Clean Air Drive',
    badgeBg: 'rgba(15, 81, 50, 0.85)',
  },
  disaster: {
    bg: '#991B1B',
    accent: '#FDECEC',
    icon: 'clock',
    bannerText: 'Disaster Relief & Emergency Rehabilitation',
    badgeBg: 'rgba(153, 27, 27, 0.85)',
  },
  membership: {
    bg: '#0F2860',
    accent: '#FDF4DE',
    icon: 'person',
    bannerText: 'Official Membership & Civic Rights Support',
    badgeBg: 'rgba(15, 40, 96, 0.85)',
  },
};

export function CauseHeroBanner({
  type,
  title,
  imageUrl,
  imageSource,
  categoryLabel,
}: CauseHeroBannerProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const theme = BANNER_THEMES[type] || BANNER_THEMES.education;

  // Resolve dynamic image source: props.imageSource > { uri: imageUrl } > CAUSE_DEFAULT_IMAGES[type]
  let resolvedSource: ImageSourcePropType | undefined = imageSource;
  if (!resolvedSource && imageUrl && imageUrl.trim().length > 0) {
    resolvedSource = { uri: imageUrl.trim() };
  }
  if (!resolvedSource) {
    resolvedSource = CAUSE_DEFAULT_IMAGES[type];
  }

  if (resolvedSource && !imageError) {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={resolvedSource}
          style={styles.imageBanner}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          accessibilityRole="image"
          accessibilityLabel={title}
        />

        {/* Loading placeholder skeleton */}
        {!imageLoaded && (
          <View style={[styles.loadingOverlay, { backgroundColor: theme.bg }]}>
            <ActivityIndicator size="small" color={colors.white} />
          </View>
        )}

        {/* Gradient Scrim & Badges */}
        <View style={styles.imageScrim} />

        <View style={styles.imageHeaderContent}>
          <View style={[styles.categoryPill, { backgroundColor: theme.badgeBg }]}>
            <Icon name={theme.icon} size={13} color={colors.white} strokeWidth={2.4} />
            <Text style={styles.categoryPillText}>
              {categoryLabel || theme.bannerText}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Graceful Fallback vector banner
  return (
    <View style={[styles.banner, { backgroundColor: theme.bg }]}>
      <View style={styles.overlayCircle} />
      <View style={styles.overlayCircleSmall} />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name={theme.icon} size={24} color={theme.bg} strokeWidth={2.2} />
        </View>
        <Text style={styles.bannerTag}>{theme.bannerText}</Text>
        <Text style={styles.bannerTitle} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: 168,
    borderRadius: radius.md + 2,
    overflow: 'hidden',
    backgroundColor: '#0F2860',
    marginBottom: spacing.xs,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  imageBanner: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 40, 96, 0.28)',
  },
  imageHeaderContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
  banner: {
    height: 168,
    borderRadius: radius.md + 2,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    padding: spacing.md + 2,
    marginBottom: spacing.xs,
  },
  overlayCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  overlayCircleSmall: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    zIndex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerTag: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 20,
  },
});

export default CauseHeroBanner;
