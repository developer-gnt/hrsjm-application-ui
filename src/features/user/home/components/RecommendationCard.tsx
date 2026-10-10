import React from 'react';
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
} from '../../../../core/theme';
import { AppIcon, ImageSlot } from '../../components';
import type { HomeRecommendation } from '../types/home.types';

const RECOMMENDATION_IMAGES: Record<string, ImageSourcePropType> = {
  'home/recommendations/legal-workshop.png': require('../../../../assets/images/contact-cta-hands.jpg'),
  'home/recommendations/education.png': require('../../../../assets/images/hero-home.webp'),
  'home/recommendations/renewal.png': require('../../../../assets/images/contact-hero-building.jpg'),
};

interface RecommendationCardProps {
  item: HomeRecommendation;
  onPress?: () => void;
}

/**
 * Horizontal "Recommended for You" card from the reference: image header,
 * title, optional description and optional date/location meta rows, with
 * the gold circular arrow. Width derives from the window width (~2.4 cards
 * visible) so the row adapts across screen sizes.
 */
export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onPress,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(
    220,
    Math.max(150, (windowWidth - Spacing.base * 2 - Spacing.sm) / 2.4),
  );
  const imageSource = RECOMMENDATION_IMAGES[item.imageAssetName];

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Recommendation: ${item.title}`}
    >
      {imageSource ? (
        <Image source={imageSource} style={styles.media} resizeMode="cover" />
      ) : (
        <ImageSlot
          assetName={item.imageAssetName}
          height={86}
          radius={0}
          style={styles.media}
        />
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {item.description && (
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        {item.date && (
          <View style={styles.metaRow}>
            <AppIcon name="calendar" size={11} color={AdminColors.textMuted} />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>
        )}

        {item.location && (
          <View style={styles.metaRow}>
            <AppIcon name="map-pin" size={11} color={AdminColors.textMuted} />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
        )}

        <View style={styles.arrow}>
          <AppIcon
            name="arrow-right"
            size={13}
            color={AdminColors.textOnDark}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: 86,
  },
  body: {
    padding: Spacing.sm,
  },
  title: {
    fontSize: 13,
    lineHeight: 17.5,
    fontWeight: '600',
    color: AdminColors.primaryDark,
    minHeight: 35,
  },
  description: {
    fontSize: 10.5,
    lineHeight: 14.5,
    color: AdminColors.textSecondary,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  metaText: {
    fontSize: 10,
    lineHeight: 13,
    color: AdminColors.textSecondary,
    marginLeft: 4,
    flexShrink: 1,
  },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
  },
});
