import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, FontFamilies, Shadows, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { UserNewsArticle } from '../data/user-news';

interface NewsArticleCardProps {
  article: UserNewsArticle;
  onPress: (article: UserNewsArticle) => void;
  compact?: boolean;
}

export const NewsArticleCard: React.FC<NewsArticleCardProps> = ({
  article,
  onPress,
  compact = false,
}) => (
  <TouchableOpacity
    style={[styles.card, compact && styles.compactCard]}
    onPress={() => onPress(article)}
    activeOpacity={0.82}
    accessibilityRole="button"
    accessibilityLabel={`Read ${article.category} news: ${article.title}`}
  >
    <Image
      source={article.image}
      style={[styles.image, compact && styles.compactImage]}
      resizeMode="cover"
      accessible={false}
    />
    <View style={styles.content}>
      <Text style={styles.category} numberOfLines={1}>{article.category}</Text>
      <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
      {!compact ? (
        <Text style={styles.excerpt} numberOfLines={2}>{article.excerpt}</Text>
      ) : null}
      <View style={styles.footer}>
        <AppIcon name="calendar" size={13} color={AdminColors.textSecondary} />
        <Text style={styles.date}>{article.date}</Text>
      </View>
    </View>
    {!compact ? (
      <View style={styles.arrow}>
        <AppIcon name="arrow-right" size={16} color={AdminColors.primaryDark} />
      </View>
    ) : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: AdminColors.cardSurface,
    borderColor: AdminColors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.base,
    padding: Spacing.xs,
    overflow: 'hidden',
    ...Shadows.card,
  },
  compactCard: {
    flexDirection: 'column',
    width: 220,
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  image: {
    width: '34%',
    height: 118,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primaryLight,
  },
  compactImage: {
    width: '100%',
    height: 112,
    minHeight: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  category: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    borderRadius: BorderRadius.sm,
    backgroundColor: AdminColors.accentGoldLight,
    color: AdminColors.primaryDark,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    marginBottom: 3,
  },
  title: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  excerpt: {
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  date: {
    color: AdminColors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    marginLeft: 4,
  },
  arrow: {
    alignSelf: 'center',
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.accentGold,
    marginHorizontal: Spacing.xs,
  },
});
