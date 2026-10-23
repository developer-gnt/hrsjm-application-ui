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
  Typography,
  Spacing,
  Shadows,
} from '../../../../../core/theme';
import { AppBadge, AppCard } from '../../../../../core/components';
import {
  Calendar,
  Clock,
  MapPin,
  EllipsisVertical,
} from '../../../../../core/components/icons';
import { formatDate } from '../../../../../core/utils';
import type { EventListItem } from '../types/events.types';
import { EventStatusBadge } from './EventStatusBadge';

/**
 * Local time formatting helper.
 */
const formatTime = (isoDateTime: string): string =>
  new Date(isoDateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

const formatTimeRange = (startAt: string, endAt?: string): string =>
  endAt ? `${formatTime(startAt)} - ${formatTime(endAt)}` : formatTime(startAt);

/**
 * Category chip tones rotate through approved token pairs.
 */
const CATEGORY_CHIP_TONES = [
  { bg: AdminColors.primaryLight, text: AdminColors.primary },
  { bg: AdminColors.statusPendingLight, text: AdminColors.statusPending },
  { bg: AdminColors.successLight, text: AdminColors.success },
  { bg: AdminColors.warningLight, text: AdminColors.warning },
  { bg: AdminColors.statusActiveLight, text: AdminColors.statusActive },
  { bg: AdminColors.accentGoldLight, text: AdminColors.accentGold },
];

const categoryChipTone = (category: string): { bg: string; text: string } => {
  let hash = 0;
  for (let index = 0; index < category.length; index += 1) {
    hash = (hash * 31 + category.charCodeAt(index)) % 997;
  }
  return CATEGORY_CHIP_TONES[hash % CATEGORY_CHIP_TONES.length];
};

/** Empty header placeholder to preserve backward compatibility for EventsScreen */
export const EventListHeader: React.FC = () => {
  return null;
};

interface EventCardProps {
  event: EventListItem;
  /** Fired when the card or the View action is pressed */
  onPress?: (event: EventListItem) => void;
  /** Fired when the three-dot action menu is pressed */
  onMorePress?: (event: EventListItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, onMorePress }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const coverUri = event.coverImageUrl && !imageFailed ? event.coverImageUrl : undefined;

  const handleView = () => onPress?.(event);
  const handleMore = () => onMorePress?.(event);

  const chipTone = event.category ? categoryChipTone(event.category) : null;

  return (
    <AppCard style={styles.card} padding="md" onPress={handleView}>
      <View style={styles.cardContent}>
        {/* 1. 60x60 Thumbnail on the left */}
        <View style={styles.thumbnailWrapper}>
          {coverUri ? (
            <Image
              source={{ uri: coverUri }}
              style={styles.thumbnail}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailFallback]}>
              <Calendar size={22} color={AdminColors.primary} strokeWidth={2} />
            </View>
          )}
        </View>

        {/* 2. Content area */}
        <View style={styles.contentArea}>
          {/* Title and small category badge together */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            {event.category && chipTone ? (
              <AppBadge
                label={event.category}
                customBg={chipTone.bg}
                customTextColor={chipTone.text}
                style={styles.categoryBadge}
                textStyle={styles.categoryBadgeText}
              />
            ) : null}
          </View>

          {/* Date and time on the same line with small icons */}
          <View style={styles.dateTimeRow}>
            <View style={styles.metaItem}>
              <Calendar size={11} color={AdminColors.textMuted} strokeWidth={2} />
              <Text style={styles.metaText}>{formatDate(event.startAt)}</Text>
            </View>
            <Text style={styles.metaBullet}>•</Text>
            <View style={styles.metaItem}>
              <Clock size={11} color={AdminColors.textMuted} strokeWidth={2} />
              <Text style={styles.metaText}>{formatTimeRange(event.startAt, event.endAt)}</Text>
            </View>
          </View>

          {/* Location on the next line */}
          {event.location ? (
            <View style={styles.locationRow}>
              <MapPin size={11} color={AdminColors.textMuted} strokeWidth={2} />
              <Text style={styles.locationText} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          ) : null}
        </View>

        {/* 3. Event status badge, View action, and three-dot menu on the right */}
        <View style={styles.rightSection}>
          <EventStatusBadge
            status={event.status}
            style={styles.statusBadge}
            textStyle={styles.statusBadgeText}
          />
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={handleView}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View ${event.title}`}
            >
              <Text style={styles.viewButtonText} numberOfLines={1}>
                View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreButton}
              onPress={handleMore}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`More actions for ${event.title}`}
            >
              <EllipsisVertical size={16} color={AdminColors.textMuted} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: BorderRadius.card,
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#EDF2F7',
    flexShrink: 0,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  thumbnailFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#DBE5EE',
  },
  contentArea: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: AdminColors.textPrimary,
    lineHeight: 18,
    flexShrink: 1,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    alignSelf: 'center',
  },
  categoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    lineHeight: 12,
    textTransform: 'none',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: AdminColors.textSecondary,
    fontWeight: '500',
  },
  metaBullet: {
    fontSize: 9,
    color: AdminColors.textMuted,
    marginHorizontal: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  locationText: {
    fontSize: 11,
    color: AdminColors.textMuted,
    fontWeight: '500',
    flexShrink: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    flexShrink: 0,
    paddingVertical: 2,
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    lineHeight: 12,
    textTransform: 'none',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButton: {
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  viewButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  moreButton: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});