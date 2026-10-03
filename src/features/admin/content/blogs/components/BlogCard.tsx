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
import { AppCard } from '../../../../../core/components';
import type { BlogListItem, BlogStatus } from '../types/blog.types';

/**
 * Compact admin-table column proportions shared by the list header row and
 * every blog row, so labels always align with the data columns.
 */
export const BLOG_COL_FLEX = {
  details: 2.6,
  category: 0.9,
  date: 0.8,
  status: 1.0,
  views: 0.9,
  action: 0.95,
} as const;

/**
 * Category chip tones per the reference (subtle pastel per category).
 * Fixed mapping — replace with backend category metadata when confirmed.
 */
const CATEGORY_CHIP_TONES: Record<string, { bg: string; text: string }> = {
  'Know Your Rights': { bg: AdminColors.successLight, text: AdminColors.success },
  'Social Justice': { bg: AdminColors.statusPendingLight, text: AdminColors.statusPending },
  'Relief Work': { bg: AdminColors.statusInactiveLight, text: AdminColors.statusInactive },
  Education: { bg: AdminColors.accentGoldLight, text: AdminColors.accentGold },
  Environment: { bg: AdminColors.successLight, text: AdminColors.success },
  'Women Rights': { bg: AdminColors.statusInactiveLight, text: AdminColors.statusInactive },
  Guides: { bg: AdminColors.infoLight, text: AdminColors.info },
  Events: { bg: AdminColors.primaryLight, text: AdminColors.primary },
};

const categoryChipTone = (category: string): { bg: string; text: string } =>
  CATEGORY_CHIP_TONES[category] ?? { bg: AdminColors.primaryLight, text: AdminColors.primary };

/** Status badge tones per the reference: Published green, Draft amber, Archived red. */
export const BLOG_STATUS_TONES: Record<BlogStatus, { bg: string; text: string }> = {
  PUBLISHED: { bg: AdminColors.statusActiveLight, text: AdminColors.statusActive },
  DRAFT: { bg: AdminColors.warningLight, text: AdminColors.warning },
  ARCHIVED: { bg: AdminColors.statusInactiveLight, text: AdminColors.statusInactive },
};

export const BLOG_STATUS_LABELS: Record<BlogStatus, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

/** Raw count -> compact display (2100 -> "2.1K", 320 -> "320"). */
export const formatBlogViews = (views: number): string => {
  if (views < 1000) {
    return String(views);
  }
  const thousands = views / 1000;
  const text = thousands >= 10 ? String(Math.round(thousands)) : thousands.toFixed(1);
  return `${text}K`;
};

/**
 * Single-line category chip (same inline approach as the News row so long
 * labels shrink to one line instead of wrapping).
 */
const CategoryChip: React.FC<{ category: string }> = ({ category }) => {
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

/** Column labels above the blog rows (reference "table header"). */
export const BlogListHeader: React.FC = () => {
  return (
    <View style={styles.listHeader} accessible accessibilityRole="header">
      <View style={styles.colDetails}>
        <Text style={styles.listHeaderText} adjustsFontSizeToFit numberOfLines={1}>
          Blog Details
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
      <View style={styles.colAction}>
        <Text style={styles.listHeaderText} adjustsFontSizeToFit numberOfLines={1}>
          Action
        </Text>
      </View>
    </View>
  );
};

interface BlogCardProps {
  blog: BlogListItem;
  /** Fired when the row or the row action (Edit) is pressed. */
  onPress?: (blog: BlogListItem) => void;
  /** Fired when the three-dot action menu is pressed. */
  onMorePress?: (blog: BlogListItem) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onPress, onMorePress }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const thumbnailUri = blog.thumbnailUrl && !imageFailed ? blog.thumbnailUrl : undefined;

  const badgeTone = BLOG_STATUS_TONES[blog.status];

  const handlePress = () => onPress?.(blog);
  const handleMore = () => onMorePress?.(blog);

  return (
    <AppCard style={styles.card} padding="sm" onPress={handlePress}>
      <View style={styles.row}>
        {/* Blog details: thumbnail + title + excerpt */}
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
                <Text style={styles.thumbnailFallbackIcon}>📝</Text>
              </View>
            )}
            <View style={styles.detailsText}>
              <Text style={styles.title} numberOfLines={2}>
                {blog.title}
              </Text>
              <Text style={styles.excerpt} numberOfLines={2}>
                {blog.excerpt}
              </Text>
            </View>
          </View>
        </View>

        {/* Category */}
        <View style={styles.colCategory}>
          <CategoryChip category={blog.category} />
        </View>

        {/* Date */}
        <View style={styles.colDate}>
          <Text
            style={styles.dateText}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            numberOfLines={1}
          >
            {blog.date}
          </Text>
          <Text style={styles.timeText}>{blog.time}</Text>
        </View>

        {/* Status */}
        <View style={styles.colStatus}>
          <View style={[styles.statusBadge, { backgroundColor: badgeTone.bg }]}>
            <Text
              style={[styles.statusText, { color: badgeTone.text }]}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              numberOfLines={1}
            >
              {BLOG_STATUS_LABELS[blog.status]}
            </Text>
          </View>
        </View>

        {/* Views */}
        <View style={styles.colViews}>
          <View style={styles.viewsRow}>
            <Text style={styles.viewsIcon}>👁</Text>
            <Text style={styles.viewsText} adjustsFontSizeToFit numberOfLines={1}>
              {formatBlogViews(blog.views)}
            </Text>
          </View>
        </View>

        {/* Action: Edit + three-dot menu */}
        <View style={styles.colAction}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${blog.title}`}
          >
            <Text style={styles.actionButtonText} adjustsFontSizeToFit numberOfLines={1}>
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={handleMore}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`More actions for ${blog.title}`}
          >
            <Text style={styles.moreIcon}>⋮</Text>
          </TouchableOpacity>
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
    flex: BLOG_COL_FLEX.details,
  },
  colCategory: {
    flex: BLOG_COL_FLEX.category,
    alignItems: 'flex-start',
  },
  colDate: {
    flex: BLOG_COL_FLEX.date,
  },
  colStatus: {
    flex: BLOG_COL_FLEX.status,
    alignItems: 'flex-start',
  },
  colViews: {
    flex: BLOG_COL_FLEX.views,
  },
  colAction: {
    flex: BLOG_COL_FLEX.action,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
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
  excerpt: {
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
    borderRadius: BorderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 8.5,
    lineHeight: 10.5,
    fontWeight: '600',
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
