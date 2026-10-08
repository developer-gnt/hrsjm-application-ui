import React from 'react';
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
} from '../../../../core/theme';
import { AppIcon, ImageSlot } from '../../components';
import type { HomeNewsItem } from '../types/home.types';

const NEWS_IMAGES: Record<string, ImageSourcePropType> = {
  'home/news/legal-awareness.png': require('../../../../assets/images/contact-hero-building.jpg'),
  'home/updates/memorandum.png': require('../../../../assets/images/hero-home.webp'),
  'home/updates/community-program.png': require('../../../../assets/images/contact-cta-hands.jpg'),
};

interface NewsCardProps {
  item: HomeNewsItem;
  onPress?: () => void;
}

/**
 * Compact content list item from the reference — used by the guest "Latest
 * News" list and the member "Latest Updates" list (visually identical in the
 * reference, so one component serves both): thumbnail, category eyebrow,
 * two-line title, date and the circular arrow action.
 */
export const NewsCard: React.FC<NewsCardProps> = ({ item, onPress }) => {
  const imageSource = NEWS_IMAGES[item.imageAssetName];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${item.category}: ${item.title}`}
    >
      {imageSource ? (
        <Image source={imageSource} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <ImageSlot
          assetName={item.imageAssetName}
          height={48}
          width={48}
          radius={BorderRadius.md}
        />
      )}

      <View style={styles.content}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>

      <View style={styles.arrow}>
        <AppIcon name="arrow-right" size={14} color={AdminColors.primaryDark} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    padding: 5,
  },
  content: {
    flex: 1,
    marginHorizontal: 6,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  category: {
    fontSize: 7,
    lineHeight: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: AdminColors.textMuted,
  },
  title: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '600',
    color: AdminColors.primaryDark,
    marginTop: 2,
  },
  date: {
    fontSize: 7,
    lineHeight: 9,
    color: AdminColors.textMuted,
    marginTop: 3,
  },
  arrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
});
