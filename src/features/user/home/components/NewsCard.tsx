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
  UserFontFamilies,
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
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : imageSource ? (
        <Image source={imageSource} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <ImageSlot
          assetName={item.imageAssetName || 'home/news/legal-awareness.png'}
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

      <View style={styles.arrow} pointerEvents="none">
        <AppIcon name="arrow-right" size={14} color={AdminColors.primaryDark} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    padding: 6,
  },
  content: {
    flex: 1,
    marginHorizontal: 6,
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: BorderRadius.md,
  },
  category: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#06294D',
    marginTop: 2,
  },
  date: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
  },
  arrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
});
