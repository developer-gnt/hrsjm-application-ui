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
import type { RightsListItem, RightsStatus } from '../types/rights.types';

/**
 * Column proportions for table header and article card alignment matching reference screenshot.
 */
export const RIGHTS_COL_FLEX = {
  details: 3.0,
  category: 1.1,
  date: 1.0,
  status: 1.0,
  views: 0.75,
  action: 0.45,
} as const;

/** Category chip tones: pale-blue surface with navy text per approved screenshot. */
export const RightsCategoryChip: React.FC<{ category: string }> = ({ category }) => {
  return (
    <View style={styles.categoryChip}>
      <Text style={styles.categoryChipText} numberOfLines={2}>
        {category}
      </Text>
    </View>
  );
};

/** Status labels per rights status */
export const RIGHTS_STATUS_LABELS: Record<RightsStatus, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

/** Status badge styles with semantic dot indicator matching wireframe. */
export const RIGHTS_STATUS_TONES: Record<
  RightsStatus,
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

export const RIGHTS_STATUS_CONFIG = RIGHTS_STATUS_TONES;

export const formatRightsViews = (views: number): string => {
  if (views < 1000) {
    return String(views);
  }
  const thousands = views / 1000;
  const text = thousands >= 10 ? String(Math.round(thousands)) : thousands.toFixed(1);
  return `${text}K`;
};

/** Table column header row matching reference screenshot. */
export const RightsListHeader: React.FC = () => {
  return (
    <View style={styles.listHeader} accessible accessibilityRole="header">
      <View style={styles.colDetails}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Rights Details
        </Text>
      </View>
      <View style={styles.colCategory}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Category
        </Text>
      </View>
      <View style={styles.colDate}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Last Updated
        </Text>
      </View>
      <View style={styles.colStatus}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Status
        </Text>
      </View>
      <View style={styles.colViews}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Views
        </Text>
      </View>
      <View style={styles.colAction}>
        <Text style={styles.listHeaderText} numberOfLines={1}>
          Action
        </Text>
      </View>
    </View>
  );
};

export interface RightsCardProps {
  article: RightsListItem;
  /** Fired when the row body is pressed. */
  onPress?: (article: RightsListItem) => void;
  /** Fired when the three-dot action menu is pressed. */
  onMorePress?: (
    article: RightsListItem,
    anchor?: { x: number; y: number; width: number; height: number },
  ) => void;
}

export const RightsCard: React.FC<RightsCardProps> = ({
  article,
  onPress,
  onMorePress,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const moreButtonRef = useRef<any>(null);

  const thumbnailUri =
    article.thumbnailUrl && !imageFailed ? article.thumbnailUrl : undefined;

  const statusConfig =
    RIGHTS_STATUS_CONFIG[article.status] ?? RIGHTS_STATUS_CONFIG.PUBLISHED;

  const handlePress = () => onPress?.(article);

  const handleMore = () => {
    if (moreButtonRef.current && typeof moreButtonRef.current.measureInWindow === 'function') {
      let called = false;
      try {
        moreButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
          called = true;
          onMorePress?.(article, { x, y, width, height });
        });
      } catch {
        // ignore
      }
      if (!called) {
        onMorePress?.(article);
      }
    } else {
      onMorePress?.(article);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`Rights article: ${article.title}`}
    >
      {/* Top area: Thumbnail + (Title & Excerpt) + Right Action Button */}
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
            <Text style={styles.thumbnailFallbackIcon}>⚖️</Text>
          </View>
        )}

        <View style={styles.detailsText}>
          <Text style={styles.title} numberOfLines={1}>
            {article.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {article.description}
          </Text>
        </View>

        <View ref={moreButtonRef} collapsable={false} style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={handleMore}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Actions for ${article.title}`}
            activeOpacity={0.8}
          >
            <EllipsisVertical size={18} color="#06294D" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Metadata area: Category | Date & Time | Status badge | Views */}
      <View style={styles.metaRow}>
        <RightsCategoryChip category={article.category} />

        <View style={styles.metaDivider} />

        <View style={styles.dateBlock}>
          <Text style={styles.dateText} numberOfLines={1}>
            {article.lastUpdatedDate}
          </Text>
          <Text style={styles.timeText} numberOfLines={1}>
            {article.lastUpdatedTime}
          </Text>
        </View>

        <View style={styles.metaDivider} />

        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.dot }]} />
          <Text style={[styles.statusText, { color: statusConfig.text }]} numberOfLines={1}>
            {statusConfig.label}
          </Text>
        </View>

        <View style={styles.viewsRow}>
          <Eye size={16} color="#06294D" strokeWidth={2} />
          <Text style={styles.viewsText} numberOfLines={1}>
            {formatRightsViews(article.views)}
          </Text>
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
    padding: 13,
    marginVertical: 6,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#011F39',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 12.5,
    lineHeight: 17,
    color: '#718096',
    marginTop: 3,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    backgroundColor: '#F0F4F8',
    width: 36,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
    paddingTop: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  categoryChip: {
    backgroundColor: '#E8F2FA',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#0B2F52',
    textAlign: 'center',
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
    lineHeight: 15,
    fontWeight: '600',
    color: '#0B2F52',
  },
  timeText: {
    fontSize: 10.5,
    lineHeight: 13,
    color: '#718096',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
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
    gap: 5,
    marginLeft: 'auto',
  },
  viewsText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#06294D',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  listHeaderText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#06294D',
  },
  colDetails: {
    flex: RIGHTS_COL_FLEX.details,
    paddingRight: 8,
  },
  colCategory: {
    flex: RIGHTS_COL_FLEX.category,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  colDate: {
    flex: RIGHTS_COL_FLEX.date,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  colStatus: {
    flex: RIGHTS_COL_FLEX.status,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  colViews: {
    flex: RIGHTS_COL_FLEX.views,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  colAction: {
    flex: RIGHTS_COL_FLEX.action,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
