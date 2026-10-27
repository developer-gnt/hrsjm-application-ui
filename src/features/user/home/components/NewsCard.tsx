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
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginHorizontal: 10,
  },
  thumbnail: {
    width: 62,
    height: 62,
    borderRadius: 10,
  },
  category: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '700',
    color: '#06294D',
    marginTop: 2,
  },
  date: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
});
