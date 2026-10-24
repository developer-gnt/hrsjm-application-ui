import React, { useRef, useState } from 'react';
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
  Typography,
} from '../../../../../core/theme';
import { Eye, EllipsisVertical } from '../../../../../core/components/icons';
import type { BlogListItem, BlogStatus } from '../types/blog.types';

/**
 * Column proportions for desktop table header and row alignment.
 */
export const BLOG_COL_FLEX = {
  details: 3.2,
  category: 1.0,
  date: 0.95,
  status: 1.05,
  views: 0.8,
  action: 1.0,
} as const;

/** Status badge styles per the reference wireframe: dot indicator + matching tones. */
export const BLOG_STATUS_TONES: Record<
  BlogStatus,
  { bg: string; text: string; dot: string }
> = {
  PUBLISHED: { bg: '#E8F8F0', text: '#16A34A', dot: '#16A34A' },
  DRAFT: { bg: '#FEF3C7', text: '#D97706', dot: '#D97706' },
  ARCHIVED: { bg: '#FEE2E2', text: '#DC2626', dot: '#DC2626' },
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
 * Category pill chip matching reference wireframe (pale blue background, navy text).
 */
export const BlogCategoryChip: React.FC<{ category: string }> = ({ category }) => {
  return (
    <View style={styles.categoryChip}>
      <Text style={styles.categoryChipText} numberOfLines={1}>
        {category}
      </Text>
    </View>
  );
};

/** Column labels above the blog rows for desktop/tablet widths. */
export const BlogListHeader: React.FC = () => {
  const { width } = useWindowDimensions();
  if (width < 680) {
    return null;
  }

  return (
    <View style={styles.listHeader} accessible accessibilityRole="header">
      <View style={styles.colDetails}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Blog Details
        </Text>
      </View>
      <View style={styles.colCategory}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Category
        </Text>
      </View>
      <View style={styles.colDividerSpace} />
      <View style={styles.colDate}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Date ↓
        </Text>
      </View>
      <View style={styles.colDividerSpace} />
      <View style={styles.colStatus}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Status
        </Text>
      </View>
      <View style={styles.colDividerSpace} />
      <View style={styles.colViews}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Views
        </Text>
      </View>
      <View style={styles.colDividerSpace} />
      <View style={styles.colAction}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Actions
        </Text>
      </View>
    </View>
  );
};

export interface BlogCardProps {
  blog: BlogListItem;
  /** Fired when the row body is pressed (opens Blog Details). */
  onPress?: (blog: BlogListItem) => void;
  /** Fired when the row Edit button is pressed (kept for backwards compatibility). */
  onEditPress?: (blog: BlogListItem) => void;
  /** Fired when the three-dot action menu is pressed. */
  onMorePress?: (
    blog: BlogListItem,
    anchor?: { x: number; y: number; width: number; height: number },
  ) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  onPress,
  onEditPress,
  onMorePress,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const moreButtonRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 680;

  const thumbnailUri = blog.thumbnailUrl && !imageFailed ? blog.thumbnailUrl : undefined;
  const badgeTone = BLOG_STATUS_TONES[blog.status] ?? BLOG_STATUS_TONES.PUBLISHED;

  const handlePress = () => onPress?.(blog);
  const handleEdit = () => (onEditPress ? onEditPress(blog) : onPress?.(blog));
  const handleMore = () => {
    if (moreButtonRef.current && typeof moreButtonRef.current.measureInWindow === 'function') {
      moreButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        onMorePress?.(blog, { x, y, width, height });
      });
    } else {
      onMorePress?.(blog);
    }
  };

  // Render thumbnail
  const renderThumbnail = (sizeStyle: any) => (
    thumbnailUri ? (
      <Image
        source={{ uri: thumbnailUri }}
        style={[styles.thumbnail, sizeStyle]}
        resizeMode="cover"
        onError={() => setImageFailed(true)}
      />
    ) : (
      <View style={[styles.thumbnail, styles.thumbnailFallback, sizeStyle]}>
        <Text style={styles.thumbnailFallbackIcon}>📝</Text>
      </View>
    )
  );

  // Render Status Badge with dot indicator
  const renderStatusBadge = () => (
    <View style={[styles.statusBadge, { backgroundColor: badgeTone.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: badgeTone.dot }]} />
      <Text style={[styles.statusText, { color: badgeTone.text }]} numberOfLines={1}>
        {BLOG_STATUS_LABELS[blog.status] ?? blog.status}
      </Text>
    </View>
  );

  // Render Action button (three-dot menu only; standalone Edit button removed)
  const renderActions = () => (
    <View ref={moreButtonRef} collapsable={false} style={styles.actionsGroup}>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={handleMore}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`More actions for ${blog.title}`}
        activeOpacity={0.8}
      >
        <EllipsisVertical size={16} color="#06294D" strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );

  // Mobile layout (< 680px)
  if (isMobile) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel={`Blog article: ${blog.title}`}
      >
        {/* Top: Thumbnail + Title & Excerpt */}
        <View style={styles.mobileTopRow}>
          {renderThumbnail(styles.mobileThumbnail)}
          <View style={styles.detailsText}>
            <Text style={styles.title} numberOfLines={2}>
              {blog.title}
            </Text>
            <Text style={styles.excerpt} numberOfLines={2}>
              {blog.excerpt}
            </Text>
          </View>
        </View>

        {/* Middle: Category, Date/Time, Status */}
        <View style={styles.mobileMetaRow}>
          <BlogCategoryChip category={blog.category} />
          <View style={styles.dateBlock}>
            <Text style={styles.dateText} numberOfLines={1}>
              {blog.date}
            </Text>
            <Text style={styles.timeText} numberOfLines={1}>
              {blog.time}
            </Text>
          </View>
          {renderStatusBadge()}
        </View>

        {/* Bottom: Views + Actions */}
        <View style={styles.mobileFooterRow}>
          <View style={styles.viewsRow}>
            <Eye size={16} color="#06294D" strokeWidth={2} />
            <Text style={styles.viewsText}>{formatBlogViews(blog.views)}</Text>
          </View>
          {renderActions()}
        </View>
      </TouchableOpacity>
    );
  }

  // Desktop / Tablet layout (>= 680px) matching approved wireframe
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`Blog article: ${blog.title}`}
    >
      <View style={styles.row}>
        {/* 1. Blog details: thumbnail + title + excerpt */}
        <View style={styles.colDetails}>
          <View style={styles.detailsRow}>
            {renderThumbnail(styles.desktopThumbnail)}
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

        {/* 2. Category badge */}
        <View style={styles.colCategory}>
          <BlogCategoryChip category={blog.category} />
        </View>

        {/* Subtle vertical divider */}
        <View style={styles.verticalDivider} />

        {/* 3. Date & Time */}
        <View style={styles.colDate}>
          <Text style={styles.dateText} numberOfLines={1}>
            {blog.date}
          </Text>
          <Text style={styles.timeText} numberOfLines={1}>
            {blog.time}
          </Text>
        </View>

        {/* Subtle vertical divider */}
        <View style={styles.verticalDivider} />

        {/* 4. Publication Status badge */}
        <View style={styles.colStatus}>
          {renderStatusBadge()}
        </View>

        {/* Subtle vertical divider */}
        <View style={styles.verticalDivider} />

        {/* 5. View count */}
        <View style={styles.colViews}>
          <View style={styles.viewsRow}>
            <Eye size={16} color="#06294D" strokeWidth={2} />
            <Text style={styles.viewsText}>{formatBlogViews(blog.views)}</Text>
          </View>
        </View>

        {/* Subtle vertical divider */}
        <View style={styles.verticalDivider} />

        {/* 6. Edit button + three-dot overflow menu */}
        <View style={styles.colAction}>
          {renderActions()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 6,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  listHeaderText: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },

  // Shared column flex proportions
  colDetails: {
    flex: BLOG_COL_FLEX.details,
    paddingRight: 10,
  },
  colCategory: {
    flex: BLOG_COL_FLEX.category,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colDate: {
    flex: BLOG_COL_FLEX.date,
    justifyContent: 'center',
    paddingLeft: 4,
  },
  colStatus: {
    flex: BLOG_COL_FLEX.status,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colViews: {
    flex: BLOG_COL_FLEX.views,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colAction: {
    flex: BLOG_COL_FLEX.action,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  colDividerSpace: {
    width: 17,
  },

  verticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    borderRadius: 12,
    backgroundColor: '#EDF2F7',
  },
  desktopThumbnail: {
    width: 64,
    height: 64,
  },
  mobileThumbnail: {
    width: 58,
    height: 58,
  },
  thumbnailFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailFallbackIcon: {
    fontSize: 22,
  },
  detailsText: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    ...Typography.bodyMedium,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#06294D',
  },
  excerpt: {
    ...Typography.caption,
    fontSize: 13,
    lineHeight: 18,
    color: '#718096',
    marginTop: 3,
  },

  categoryChip: {
    backgroundColor: '#EDF2F7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'center',
  },
  categoryChipText: {
    ...Typography.caption,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '600',
    color: '#06294D',
  },

  dateBlock: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
    color: '#06294D',
  },
  timeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: '#718096',
    marginTop: 2,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewsText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#06294D',
  },

  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
  moreButton: {
    backgroundColor: '#EDF2F7',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Mobile specific styles
  mobileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  mobileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  mobileFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
