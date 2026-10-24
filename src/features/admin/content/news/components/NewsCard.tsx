import React, { useRef, useState } from 'react';
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
import { Eye, EllipsisVertical } from '../../../../../core/components/icons';
import type { NewsListItem, NewsStatus } from '../types/news.types';

/** Status badge tones per the reference: Published green, Draft amber, Archived red. */
export const STATUS_BADGE_TONES: Record<
  NewsStatus,
  { bg: string; text: string; dot: string; label: string; border?: string }
> = {
  PUBLISHED: {
    bg: '#E8F8F0',
    text: '#16A34A',
    dot: '#16A34A',
    label: 'Published',
    border: '#A7F3D0',
  },
  DRAFT: {
    bg: '#FEF3C7',
    text: '#D97706',
    dot: '#D97706',
    label: 'Draft',
    border: '#FDE68A',
  },
  ARCHIVED: {
    bg: '#FEE2E2',
    text: '#DC2626',
    dot: '#DC2626',
    label: 'Archived',
    border: '#FECACA',
  },
};

export const STATUS_LABELS: Record<NewsStatus, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

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
 * Modern single-line category chip with pale-blue surface and navy text.
 */
export const CategoryChip: React.FC<{ category: string }> = ({ category }) => {
  return (
    <View style={styles.categoryChip}>
      <Text style={styles.categoryChipText} numberOfLines={1}>
        {category}
      </Text>
    </View>
  );
};

/**
 * Legacy list header placeholder kept for backward compatibility.
 * On modern mobile card layouts, columns are self-contained within cards.
 */
export const NewsListHeader: React.FC = () => null;

export interface NewsCardProps {
  news: NewsListItem;
  /** Fired when the card body is pressed. */
  onPress?: (news: NewsListItem) => void;
  /** Fired when the three-dot action menu is pressed. */
  onMorePress?: (
    news: NewsListItem,
    anchor?: { x: number; y: number; width: number; height: number },
  ) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onPress, onMorePress }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const moreButtonRef = useRef<any>(null);

  const thumbnailUri = news.thumbnailUrl && !imageFailed ? news.thumbnailUrl : undefined;
  const badgeTone = STATUS_BADGE_TONES[news.status] ?? STATUS_BADGE_TONES.PUBLISHED;

  const handlePress = () => onPress?.(news);

  const handleMore = () => {
    if (moreButtonRef.current && typeof moreButtonRef.current.measureInWindow === 'function') {
      let called = false;
      try {
        moreButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
          called = true;
          onMorePress?.(news, { x, y, width, height });
        });
      } catch {
        // ignore measurement failures on unmounted nodes
      }
      if (!called) {
        onMorePress?.(news);
      }
    } else {
      onMorePress?.(news);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`News: ${news.title}`}
    >
      {/* Top area: Thumbnail + (Title & Summary) + Right Action Menu */}
      <View style={styles.topRow}>
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
          <Text style={styles.title} numberOfLines={1}>
            {news.title}
          </Text>
          <Text style={styles.summary} numberOfLines={2}>
            {news.summary}
          </Text>
        </View>

        <View ref={moreButtonRef} collapsable={false} style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={handleMore}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Actions for ${news.title}`}
            activeOpacity={0.8}
          >
            <EllipsisVertical size={18} color="#06294D" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Metadata area: Category | Date & Time | Status badge | Views */}
      <View style={styles.metaRow}>
        <CategoryChip category={news.category} />

        <View style={styles.metaDivider} />

        <View style={styles.dateBlock}>
          <Text style={styles.dateText} numberOfLines={1}>
            {news.date}
          </Text>
          <Text style={styles.timeText} numberOfLines={1}>
            {news.time}
          </Text>
        </View>

        <View style={styles.metaDivider} />

        <View style={[styles.statusBadge, { backgroundColor: badgeTone.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: badgeTone.dot }]} />
          <Text style={[styles.statusText, { color: badgeTone.text }]} numberOfLines={1}>
            {badgeTone.label}
          </Text>
        </View>

        <View style={styles.viewsRow}>
          <Eye size={15} color="#06294D" strokeWidth={2.2} />
          <Text style={styles.viewsText} numberOfLines={1}>
            {formatViews(news.views)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: '#DCE4EC',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#EDF2F7',
  },
  thumbnailFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailFallbackIcon: {
    fontSize: 26,
  },
  detailsText: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingVertical: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#011F39',
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  summary: {
    fontSize: 12.5,
    lineHeight: 17,
    color: '#718096',
    marginTop: 3,
  },
  actionContainer: {
    alignSelf: 'flex-start',
  },
  moreButton: {
    width: 36,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
  },
  categoryChip: {
    backgroundColor: '#E8F2FA',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    alignSelf: 'center',
  },
  categoryChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0B2F52',
  },
  metaDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#DCE4EC',
    marginHorizontal: 8,
  },
  dateBlock: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#06294D',
    lineHeight: 15,
  },
  timeText: {
    fontSize: 10,
    color: '#718096',
    lineHeight: 13,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  viewsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06294D',
  },
});
