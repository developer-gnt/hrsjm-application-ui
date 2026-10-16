import React, { useState } from 'react';
import {
  Image,
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
  UserFontFamilies,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { HomeBlogItem } from '../types/home.types';

const FALLBACK_BLOG_IMAGE = require('../../../../assets/images/article-rights-book.jpg');

interface BlogArticleCardProps {
  item: HomeBlogItem;
  onPress?: () => void;
}

export const BlogArticleCard: React.FC<BlogArticleCardProps> = ({
  item,
  onPress,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const [imageError, setImageError] = useState(false);

  const cardWidth = Math.min(
    230,
    Math.max(160, (windowWidth - Spacing.base * 2 - Spacing.sm) / 2.35),
  );

  const imageSource = item.thumbnailUrl && !imageError
    ? { uri: item.thumbnailUrl }
    : FALLBACK_BLOG_IMAGE;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`Article: ${item.title}`}
    >
      <View style={styles.mediaContainer}>
        <Image
          source={imageSource}
          style={styles.media}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {item.category}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.excerpt} numberOfLines={2}>
          {item.excerpt}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.metaCol}>
            <View style={styles.metaItem}>
              <AppIcon name="calendar" size={11} color={AdminColors.textMuted} />
              <Text style={styles.metaText}>{item.date}</Text>
            </View>
            <View style={styles.metaItem}>
              <AppIcon name="user" size={11} color={AdminColors.textMuted} />
              <Text style={styles.authorText} numberOfLines={1}>{item.author}</Text>
            </View>
          </View>

          <View style={styles.arrow} pointerEvents="none">
            <AppIcon
              name="arrow-right"
              size={13}
              color={AdminColors.textOnDark}
            />
          </View>
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: 94,
    backgroundColor: AdminColors.primaryLight,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: 'rgba(27, 63, 143, 0.88)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  categoryText: {
    color: AdminColors.textOnDark,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  body: {
    padding: Spacing.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: UserFontFamilies.heading,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    minHeight: 34,
  },
  excerpt: {
    fontSize: 10.5,
    lineHeight: 14.5,
    color: AdminColors.textSecondary,
    marginTop: 3,
    marginBottom: 6,
    minHeight: 28,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  metaCol: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 10,
    lineHeight: 13,
    color: AdminColors.textSecondary,
    marginLeft: 4,
  },
  authorText: {
    fontSize: 9.5,
    lineHeight: 12,
    color: AdminColors.textMuted,
    marginLeft: 4,
    fontWeight: '500',
  },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
