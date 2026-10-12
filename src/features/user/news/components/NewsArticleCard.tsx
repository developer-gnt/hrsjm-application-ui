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
        <AppIcon name="calendar" size={13.5} color={AdminColors.textSecondary} />
        <Text style={styles.date}>{article.date}</Text>
      </View>
    </View>
    {!compact ? (
      <View style={styles.arrow}>
        <AppIcon name="arrow-right" size={15} color={AdminColors.textOnDark} />
      </View>
    ) : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    minHeight: 114,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderColor: 'rgba(6, 29, 64, 0.06)',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12,
    marginHorizontal: Spacing.base,
    padding: 8,
    ...Shadows.card,
  },
  compactCard: {
    minHeight: 0,
    flexDirection: 'column',
    width: 220,
    marginRight: Spacing.md,
    padding: 8,
  },
  image: {
    width: 102,
    height: 98,
    borderRadius: 10,
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
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 2,
  },
  category: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 6,
    backgroundColor: AdminColors.accentGoldLight,
    color: '#8A5A00',
    fontSize: 10.5,
    fontWeight: '600',
    lineHeight: 13,
    paddingHorizontal: 7.5,
    paddingVertical: 3,
    marginBottom: 4,
  },
  title: {
    color: AdminColors.primaryDark,
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 3,
  },
  excerpt: {
    color: AdminColors.textSecondary,
    fontSize: 11.5,
    lineHeight: 15.5,
    marginTop: 1,
    marginBottom: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  date: {
    color: AdminColors.textSecondary,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    marginRight: 2,
  },
});
