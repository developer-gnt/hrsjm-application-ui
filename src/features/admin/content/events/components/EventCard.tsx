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
} from '../../../../../core/theme';
import { AppBadge, AppCard } from '../../../../../core/components';
import { formatDate } from '../../../../../core/utils';
import type { EventListItem } from '../types/events.types';
import { EventStatusBadge } from './EventStatusBadge';

/**
 * TEMPORARY local time formatting helpers.
 * The backend timezone/time contract is not confirmed yet (spec section 42);
 * move these into the shared date utilities once it is, and keep date display
 * on the centralized formatDate utility in the meantime.
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
 * Compact admin-table column proportions shared by the list header row and
 * every event row, so labels always align with the data columns.
 */
const COL_FLEX = {
  details: 2.15,
  dateTime: 0.85,
  registrations: 0.78,
  status: 1.0,
  action: 0.78,
} as const;

/**
 * Category chip tones rotate through approved token pairs (reference shows a
 * distinct pastel chip per category). Deterministic per category name; replace
 * with backend category metadata when the contract is confirmed.
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

/** Column labels above the event rows (reference "table header"). */
export const EventListHeader: React.FC = () => {
  return (
    <View style={styles.listHeader} accessible accessibilityRole="header">
      <View style={styles.colDetails}>
        <Text style={styles.listHeaderText} adjustsFontSizeToFit numberOfLines={1}>
          Event Details
        </Text>
      </View>
      <View style={styles.colDateTime}>
        <Text style={styles.listHeaderText} adjustsFontSizeToFit numberOfLines={1}>
          Date &amp; Time ↓
        </Text>
      </View>
      <View style={styles.colRegistrations}>
        <Text style={styles.listHeaderText} adjustsFontSizeToFit numberOfLines={1}>
          Registrations
        </Text>
      </View>
      <View style={styles.colStatus}>
        <Text style={styles.listHeaderText} adjustsFontSizeToFit numberOfLines={1}>
          Status
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

interface EventCardProps {
  event: EventListItem;
  /** Fired when the row or the View action is pressed (Event Details in the next phase). */
  onPress?: (event: EventListItem) => void;
  /** Fired when the three-dot action menu is pressed. */
  onMorePress?: (event: EventListItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, onMorePress }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const coverUri = event.coverImageUrl && !imageFailed ? event.coverImageUrl : undefined;

  const progress = event.capacity
    ? Math.min(100, Math.round((event.registrations / event.capacity) * 100))
    : 0;

  const handleView = () => onPress?.(event);
  const handleMore = () => onMorePress?.(event);

  const chipTone = event.category ? categoryChipTone(event.category) : null;

  return (
    <AppCard style={styles.card} padding="sm" onPress={handleView}>
      <View style={styles.row}>
        {/* Event details: thumbnail + title/category/location */}
        <View style={styles.colDetails}>
          <View style={styles.detailsRow}>
            {coverUri ? (
              <Image
                source={{ uri: coverUri }}
                style={styles.thumbnail}
                resizeMode="cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailFallback]}>
                <Text style={styles.thumbnailFallbackIcon}>📅</Text>
              </View>
            )}
            <View style={styles.detailsText}>
              <Text style={styles.title} numberOfLines={2}>
                {event.title}
              </Text>
              {event.category && chipTone ? (
                <AppBadge
                  label={event.category}
                  customBg={chipTone.bg}
                  customTextColor={chipTone.text}
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                />
              ) : null}
              {event.location ? (
                <View style={styles.locationRow}>
                  <Text style={styles.locationPin}>📍</Text>
                  <Text style={styles.location} numberOfLines={1}>
                    {event.location}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Date & time */}
        <View style={styles.colDateTime}>
          <Text
            style={styles.dateText}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            numberOfLines={1}
          >
            {formatDate(event.startAt)}
          </Text>
          <Text style={styles.timeText}>{formatTimeRange(event.startAt, event.endAt)}</Text>
        </View>

        {/* Registrations */}
        <View style={styles.colRegistrations}>
          {event.capacity ? (
            <>
              <Text
                style={styles.registrationsText}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                numberOfLines={1}
              >
                {event.registrations} / {event.capacity}
              </Text>
              <View
                style={styles.progressTrack}
                accessible
                accessibilityLabel={`${event.registrations} of ${event.capacity} registrations`}
              >
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </>
          ) : (
            <Text style={styles.registrationsText}>-</Text>
          )}
        </View>

        {/* Status */}
        <View style={styles.colStatus}>
          <EventStatusBadge status={event.status} style={styles.statusBadge} textStyle={styles.statusText} />
        </View>

        {/* Action */}
        <View style={styles.colAction}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={handleView}
            accessibilityRole="button"
            accessibilityLabel={`View ${event.title}`}
          >
            <Text style={styles.viewButtonText} adjustsFontSizeToFit numberOfLines={1}>
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
    flex: COL_FLEX.details,
  },
  colDateTime: {
    flex: COL_FLEX.dateTime,
  },
  colRegistrations: {
    flex: COL_FLEX.registrations,
  },
  colStatus: {
    flex: COL_FLEX.status,
    alignItems: 'flex-start',
  },
  colAction: {
    flex: COL_FLEX.action,
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
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: AdminColors.background,
  },
  thumbnailFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailFallbackIcon: {
    fontSize: 13,
  },
  detailsText: {
    flex: 1,
    minWidth: 0,
    marginLeft: Spacing.sm,
    gap: 2,
  },
  title: {
    ...Typography.badge,
    fontSize: 10,
    lineHeight: 12.5,
    color: AdminColors.textPrimary,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
  },
  categoryChipText: {
    fontSize: 8,
    lineHeight: 10.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPin: {
    fontSize: 8,
    marginRight: 2,
  },
  location: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    flexShrink: 1,
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

  registrationsText: {
    ...Typography.badge,
    fontSize: 10,
    color: AdminColors.textPrimary,
  },
  progressTrack: {
    height: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.statusActiveLight,
    overflow: 'hidden',
    marginTop: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.statusActive,
  },

  statusBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 9,
    lineHeight: 11,
  },

  viewButton: {
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.sm,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  viewButtonText: {
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