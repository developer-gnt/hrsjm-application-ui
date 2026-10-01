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
import { AppBadge, AppButton, AppCard } from '../../../../../core/components';
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
  endAt ? `${formatTime(startAt)} – ${formatTime(endAt)}` : formatTime(startAt);

interface EventCardProps {
  event: EventListItem;
  /** Fired when the card or the View action is pressed (Event Details in the next phase). */
  onPress?: (event: EventListItem) => void;
  /** Fired when the action menu is pressed. */
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

  return (
    <AppCard style={styles.card} onPress={handleView}>
      <View style={styles.topRow}>
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.cover}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={[styles.cover, styles.coverFallback]}>
            <Text style={styles.coverFallbackIcon}>📅</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          {event.category ? (
            <AppBadge label={event.category} style={styles.categoryChip} />
          ) : null}
          {event.location ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.location} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          ) : null}
        </View>

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

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <Text style={styles.metaIcon}>📅</Text>
        <Text style={styles.dateText}>{formatDate(event.startAt)}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaIcon}>🕐</Text>
        <Text style={styles.timeText}>{formatTimeRange(event.startAt, event.endAt)}</Text>
      </View>

      {event.capacity ? (
        <View
          style={styles.registrationBlock}
          accessible
          accessibilityLabel={`${event.registrations} of ${event.capacity} registrations`}
        >
          <Text style={styles.registrationText}>
            {event.registrations} / {event.capacity} registered
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      ) : null}

      <View style={styles.footerRow}>
        <EventStatusBadge status={event.status} />
        <AppButton
          title="View"
          variant="secondary"
          size="sm"
          onPress={handleView}
          style={styles.viewButton}
        />
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: Spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.background,
  },
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackIcon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  title: {
    ...Typography.cardTitle,
    color: AdminColors.textPrimary,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metaIcon: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  location: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    flex: 1,
  },
  moreButton: {
    padding: Spacing.xs,
  },
  moreIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AdminColors.divider,
    marginVertical: Spacing.md,
  },
  dateText: {
    ...Typography.bodyMedium,
    color: AdminColors.textPrimary,
  },
  timeText: {
    ...Typography.bodyMedium,
    color: AdminColors.textSecondary,
  },
  registrationBlock: {
    marginTop: Spacing.sm,
  },
  registrationText: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  progressTrack: {
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.statusActiveLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.statusActive,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  viewButton: {
    minHeight: 30,
    paddingVertical: Spacing.xs,
  },
});