import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
  type ImageSourcePropType,
} from 'react-native';
import { colors, radius, serif, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import { formatCurrency } from '../../../core/utils/format';

interface DonationHeaderBannerProps {
  imageUrl?: string;
  imageSource?: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  totalDonations?: number;
  totalAmount?: number;
}

const DEFAULT_HEADER_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1200&auto=format&fit=crop',
};

export function DonationHeaderBanner({
  imageUrl,
  imageSource,
  title = 'Donation History',
  subtitle = 'Track your contributions & support humanity',
  totalDonations,
  totalAmount,
}: DonationHeaderBannerProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const resolvedSource = imageSource || (imageUrl ? { uri: imageUrl } : DEFAULT_HEADER_IMAGE);

  return (
    <View style={styles.container}>
      {!imageError ? (
        <>
          <Image
            source={resolvedSource}
            style={styles.image}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            accessibilityRole="image"
            accessibilityLabel={title}
          />
          {!imageLoaded && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={colors.white} />
            </View>
          )}
          {/* Multi-layer scrim for maximum contrast and legibility */}
          <View style={styles.scrimDark} />
        </>
      ) : (
        <View style={styles.fallbackBg}>
          <View style={styles.circleGraphic} />
          <View style={styles.circleGraphicSmall} />
        </View>
      )}

      {/* Content overlay */}
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={styles.orgBadge}>
            <Icon name="heart" size={12} color="#F5A623" strokeWidth={2.5} />
            <Text style={styles.orgBadgeText}>HRSJM SOCIAL IMPACT</Text>
          </View>

          {totalDonations !== undefined && totalDonations > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{totalDonations} Contributions</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>

        {totalAmount !== undefined && totalAmount > 0 && (
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Total Contributed</Text>
            <Text style={styles.statsAmount}>{formatCurrency(totalAmount)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#0F2860',
    position: 'relative',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrimDark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 27, 65, 0.72)',
  },
  fallbackBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1B3B8C',
  },
  circleGraphic: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circleGraphicSmall: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    padding: spacing.md + 2,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  orgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  orgBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.6,
  },
  countBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.5)',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FCD34D',
  },
  title: {
    ...serif,
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 2,
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  statsLabel: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },
  statsAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FCD34D',
  },
});

export default DonationHeaderBanner;
