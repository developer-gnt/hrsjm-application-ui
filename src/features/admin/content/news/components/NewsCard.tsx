import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import { AppBadge, AppCard } from '../../../../../core/components';
import type { NewsListItem, NewsStatus } from '../types/news.types';

/**
 * Compact admin-table column proportions shared by the list header row and
 * every news row, so labels always align with the data columns.
 */
const COL_FLEX = {
  details: 2.6,
  category: 0.9,
  date: 0.8,
  status: 1.05,
  views: 1.0,
} as const;

/**
 * Category chip tones per the reference (subtle pastel per category).
 * Fixed mapping — replace with backend category metadata when confirmed.
 */
const CATEGORY_CHIP_TONES: Record<string, { bg: string; text: string }> = {
  Legal: { bg: AdminColors.primaryLight, text: AdminColors.primary },
  'Legal Update': { bg: AdminColors.primaryLight, text: AdminColors.primary },
  'Relief Work': { bg: AdminColors.statusInactiveLight, text: AdminColors.statusInactive },
  'Know Your Rights': { bg: AdminColors.successLight, text: AdminColors.success },
  Awareness: { bg: AdminColors.warningLight, text: AdminColors.warning },
  Environment: { bg: AdminColors.successLight, text: AdminColors.success },
  Health: { bg: AdminColors.statusInactiveLight, text: AdminColors.statusInactive },
  Advocacy: { bg: AdminColors.statusPendingLight, text: AdminColors.statusPending },
};

const categoryChipTone = (category: string): { bg: string; text: string } =>
  CATEGORY_CHIP_TONES[category] ?? { bg: AdminColors.primaryLight, text: AdminColors.primary };

/** Status badge tones per the reference: Published green, Draft amber, Archived red. */
export const STATUS_BADGE_TONES: Record<NewsStatus, { bg: string; text: string }> = {
  PUBLISHED: { bg: AdminColors.statusActiveLight, text: AdminColors.statusActive },
  DRAFT: { bg: AdminColors.warningLight, text: AdminColors.warning },
  ARCHIVED: { bg: AdminColors.statusInactiveLight, text: AdminColors.statusInactive },
};

export const STATUS_LABELS: Record<NewsStatus, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

/** Row action per status per the reference: archived rows offer "Restore". */
const actionLabelFor = (status: NewsStatus): string =>
  status === 'ARCHIVED' ? 'Restore' : 'Edit';

/** Raw count -> compact display (1200 -> "1.2K", 980 -> "980"). */
export const formatViews = (views: number): string => {
  if (views < 1000) {
    return String(views);
  }
  const thousands = views / 1000;
  const text = thousands >= 10 ? String(Math.round(thousands)) : thousands.toFixed(1);
  return `${text}K`;
};

/**
 * Single-line category chip. Inline (rather than AppBadge) so long labels like
 * "Know Your Rights" shrink to fit one line instead of wrapping — AppBadge has
 * no single-line support. Tones per the reference (subtle pastel per
 * category); replace with backend category metadata when confirmed.
 */
export const CategoryChip: React.FC<{ category: string }> = ({ category }) => {
  const tone = categoryChipTone(category);

  return (
    <View style={[styles.categoryChip, { backgroundColor: tone.bg }]}>
      <Text
        style={[styles.categoryChipText, { color: tone.text }]}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={1}
      >
        {category}
      </Text>
    </View>
  );
};
/** Column labels above the news rows (reference "table header"). */
export const NewsListHeader: React.FC = () => {
  return (
    <View style={styles.listHeader} accessible accessibilityRole="header">
      <View style={styles.colDetails}>
        <Text style={styles.listHeaderText} adjustsFontSizeToFit numberOfLines={1}>
          News Details
        </Text>
      </View>
      <View style={styles.colCategory}>
        <Text style={styles.listHeaderText} adjustsFontSizeToFit numberOfLines={1}>
          Category
        </Text>
      </View>
      <View style={styles.colDate}>
        <Text style={styles.listHeaderText} adjustsFontSizeToFit numberOfLines={1}>
          Date ↓
        </Text>
      </View>
      <View style={styles.colStatus}>
        <Text style={styles.listHeaderText} adjustsFontSizeToFit numberOfLines={1}>
          Status
        </Text>
      </View>
      <View style={styles.colViews}>
        <Text style={styles.listHeaderText} adjustsFontSizeToFit numberOfLines={1}>
          Views
        </Text>
      </View>
    </View>
  );
};

interface NewsCardProps {
  news: NewsListItem;
  /** Fired when the row or the row action (Edit/Restore) is pressed. */
  onPress?: (news: NewsListItem) => void;
  /** Fired when the three-dot action menu is pressed. */
  onMorePress?: (news: NewsListItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onPress, onMorePress }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const thumbnailUri = news.thumbnailUrl && !imageFailed ? news.thumbnailUrl : undefined;

  const badgeTone = STATUS_BADGE_TONES[news.status];

  const handlePress = () => onPress?.(news);
  const handleMore = () => onMorePress?.(news);

  return (
    <AppCard style={styles.card} padding="sm" onPress={handlePress}>
      <View style={styles.row}>
        {/* News details: thumbnail + headline + summary */}
        <View style={styles.colDetails}>
          <View style={styles.detailsRow}>
            {thumbnailUri ? (
              <Image
                source={{ uri: thumbnailUri }}
                style={styles.thumbnail}
                resizeMode="cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailFallback]}>
                <Text style={styles.thumbnailFallbackIcon}>📰</Text>
              </View>
            )}
            <View style={styles.detailsText}>
              <Text style={styles.title} numberOfLines={2}>
                {news.title}
              </Text>
              <Text style={styles.summary} numberOfLines={2}>
                {news.summary}
              </Text>
            </View>
          </View>
        </View>

        {/* Category */}
        <View style={styles.colCategory}>
          <CategoryChip category={news.category} />
        </View>

        {/* Date */}
        <View style={styles.colDate}>
          <Text
            style={styles.dateText}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            numberOfLines={1}
          >
            {news.date}
          </Text>
          <Text style={styles.timeText}>{news.time}</Text>
        </View>

        {/* Status */}
        <View style={styles.colStatus}>
          <AppBadge
            label={STATUS_LABELS[news.status]}
            customBg={badgeTone.bg}
            customTextColor={badgeTone.text}
            style={styles.statusBadge}
            textStyle={styles.statusText}
          />
        </View>

        {/* Views + row action + menu */}
        <View style={styles.colViews}>
          <View style={styles.viewsRow}>
            <Text style={styles.viewsIcon}>👁</Text>
            <Text style={styles.viewsText}>{formatViews(news.views)}</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePress}
              accessibilityRole="button"
              accessibilityLabel={`${actionLabelFor(news.status)} ${news.title}`}
            >
              <Text style={styles.actionButtonText} adjustsFontSizeToFit numberOfLines={1}>
                {actionLabelFor(news.status)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={handleMore}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`More actions for ${news.title}`}
            >
              <Text style={styles.moreIcon}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AdminColors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md + Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  listHeaderText: {
    ...Typography.caption,
    fontWeight: '600',
    color: AdminColors.textMuted,
  },

  // Shared column flex proportions (must match list header).
  colDetails: {
    flex: COL_FLEX.details,
  },
  colCategory: {
    flex: COL_FLEX.category,
    alignItems: 'flex-start',
  },
  colDate: {
    flex: COL_FLEX.date,
  },
  colStatus: {
    flex: COL_FLEX.status,
    alignItems: 'flex-start',
  },
  colViews: {
    flex: COL_FLEX.views,
    alignItems: 'flex-end',
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.background,
  },
  thumbnailFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailFallbackIcon: {
    fontSize: 16,
  },
  detailsText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
    gap: 2,
  },
  title: {
    ...Typography.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    color: AdminColors.textPrimary,
  },
  summary: {
    ...Typography.caption,
    fontSize: 9.5,
    lineHeight: 12.5,
    color: AdminColors.textSecondary,
  },

  categoryChip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryChipText: {
    ...Typography.caption,
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: '600',
  },

  dateText: {
    ...Typography.badge,
    fontSize: 10.5,
    fontWeight: '500',
    color: AdminColors.textPrimary,
  },
  timeText: {
    ...Typography.caption,
    fontSize: 9.5,
    lineHeight: 12,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 8.5,
    lineHeight: 10.5,
    textTransform: 'none',
  },

  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewsIcon: {
    fontSize: 8.5,
  },
  viewsText: {
    ...Typography.caption,
    fontSize: 9.5,
    fontWeight: '500',
    color: AdminColors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.sm,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  actionButtonText: {
    ...Typography.caption,
    fontWeight: '600',
    color: AdminColors.primary,
  },
  moreButton: {
    padding: 1,
  },
  moreIcon: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.textMuted,
  },
});
