import React, { useState, useEffect } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppErrorState,
} from '../../../../../core/components';
import { formatDate } from '../../../../../core/utils';
import { AdminHeader } from '../../../../../app/navigation';
import type { EventListItem, EventUiStatus } from '../types/events.types';
import { EventStatusBadge } from '../components/EventStatusBadge';

/**
 * TEMPORARY local time formatting helpers.
 * The backend timezone/time contract is not confirmed yet (spec section 42);
 * the same helpers exist temporarily in EventCard. Move both into the shared
 * date utilities once the contract is confirmed.
 */
const formatTime = (isoDateTime: string): string =>
  new Date(isoDateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

const formatTimeRange = (startAt: string, endAt?: string): string =>
  endAt ? `${formatTime(startAt)} - ${formatTime(endAt)}` : formatTime(startAt);

/** Status section copy/colors — one place to re-map when the backend enum lands (spec section 25). */
const STATUS_SECTION_META: Record<
  EventUiStatus,
  { icon: string; label: string; color: string; bg: string; description: string }
> = {
  UPCOMING: {
    icon: '🕐',
    label: 'Upcoming',
    color: AdminColors.statusExpiring,
    bg: AdminColors.statusExpiringLight,
    description: 'This event is scheduled and open for registration.',
  },
  COMPLETED: {
    icon: '✅',
    label: 'Completed',
    color: AdminColors.statusActive,
    bg: AdminColors.statusActiveLight,
    description: 'This event has finished. Thank you to everyone who participated.',
  },
  CANCELLED: {
    icon: '❌',
    label: 'Cancelled',
    color: AdminColors.statusInactive,
    bg: AdminColors.statusInactiveLight,
    description: 'This event was cancelled and is no longer open for registration.',
  },
  DRAFT: {
    icon: '📝',
    label: 'Draft',
    color: AdminColors.statusPending,
    bg: AdminColors.statusPendingLight,
    description: 'This event is a draft and has not been published yet.',
  },
};

/**
 * TEMPORARY PREVIEW COMPONENT — NOT THE REAL GLOBAL HEADER.
 *
 * Reproduces the HRSJM Admin app-shell header (back / title / bell / avatar)
 * from the reference design so the Event Details screen can be reviewed in
 * context. The real global header, navigation and branding assets are owned
 * by the app-level architecture (Mubasshir) and will replace this file.
 *
 * DELETE THIS FILE when the real Admin shell is integrated.
 */
const EventDetailsPreviewHeader: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.previewHeader,
        { paddingTop: Math.max(insets.top, Spacing.sm) },
      ]}
    >
      <TouchableOpacity
        style={styles.previewBackButton}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Go back to Events list"
      >
        <Text style={styles.previewBackIcon}>←</Text>
      </TouchableOpacity>
      <Text style={styles.previewTitle}>Event Details</Text>

      <View style={styles.previewRight}>
        <Text style={styles.previewBell}>🔔</Text>
        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeText}>3</Text>
        </View>
        <View style={styles.previewAvatar}>
          <Text style={styles.previewAvatarText}>AD</Text>
        </View>
      </View>
    </View>
  );
};

interface EventDetailsScreenProps {
  /** The event row selected on the Events list. */
  event: EventListItem | null;
  /** Back navigation to the Events list. */
  onBack: () => void;
  /** Opens the Edit Event screen for this event. */
  onEdit: () => void;
}

/**
 * Event Details screen (spec section 11).
 *
 * UI-only phase: renders the selected sample event. Action buttons are
 * placeholders — no edit/publish/unpublish/delete functionality is connected
 * yet. The `event` prop is the list-row record; when the backend contract is
 * confirmed this screen receives the full event DTO instead.
 */
export const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({
  event,
  onBack,
  onEdit,
}) => {
  const [coverFailed, setCoverFailed] = useState(false);

  // Android hardware back returns to the Events list (no-op on iOS).
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  // Reset the cover-image fallback whenever a different event is opened.
  useEffect(() => {
    setCoverFailed(false);
  }, [event?.id]);

  if (!event) {
    return (
      <View style={styles.root}>
        <AdminHeader showBack title="Event Details" onBack={onBack} />
        <AppErrorState
          title="Event not found."
          message="The selected event could not be loaded. Please go back and try again."
          onRetry={onBack}
          style={styles.errorState}
        />
      </View>
    );
  }

  const progress = event.capacity
    ? Math.min(100, Math.round((event.registrations / event.capacity) * 100))
    : 0;

  const statusMeta = STATUS_SECTION_META[event.status];

  const handlePlaceholderAction = (actionName: string) => {
    // UI placeholder only: functionality is connected in a later phase.
    Alert.alert(
      actionName,
      'This is a UI placeholder. Actual functionality will be connected in a later phase after backend integration.',
    );
  };

  return (
    <View style={styles.root}>
      <AdminHeader showBack title="Event Details" onBack={onBack} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Cover image */}
          <View style={styles.coverWrapper}>
            {event.coverImageUrl && !coverFailed ? (
              <Image
                source={{ uri: event.coverImageUrl }}
                style={styles.coverImage}
                resizeMode="cover"
                onError={() => setCoverFailed(true)}
              />
            ) : (
              <View style={[styles.coverImage, styles.coverFallback]}>
                <Text style={styles.coverFallbackIcon}>📅</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Category + status badges */}
          <View style={styles.badgesRow}>
            {event.category ? (
              <AppBadge
                label={event.category}
                customBg={AdminColors.successLight}
                customTextColor={AdminColors.success}
                style={styles.badge}
              />
            ) : null}
            <EventStatusBadge status={event.status} style={styles.badge} />
          </View>

          {/* Date / time / location */}
          <AppCard variant="outlined" padding="base" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoValue}>{formatDate(event.startAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕐</Text>
              <Text style={styles.infoValue}>
                {formatTimeRange(event.startAt, event.endAt)}
              </Text>
            </View>
            {event.location ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoValue}>{event.location}</Text>
              </View>
            ) : null}
          </AppCard>

          {/* Registrations */}
          {event.capacity ? (
            <AppCard variant="outlined" padding="base" style={styles.registrationCard}>
              <View style={styles.registrationRow}>
                <Text style={styles.registrationIcon}>👥</Text>
                <Text style={styles.registrationText}>
                  {event.registrations} / {event.capacity} Registered
                </Text>
              </View>
              <View style={styles.registrationBarRow}>
                <View
                  style={styles.progressTrack}
                  accessible
                  accessibilityLabel={`${event.registrations} of ${event.capacity} registrations`}
                >
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.registrationPercent}>{progress}%</Text>
              </View>
            </AppCard>
          ) : null}

          {/* Description */}
          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.descriptionText}>
            {event.description ?? 'No description available yet.'}
          </Text>

          {/* Additional information — only fields supported by the current Event type */}
          {(event.organizer || event.category) && (
            <>
              <Text style={styles.sectionHeader}>Additional Information</Text>
              <View style={styles.additionalList}>
                {event.organizer ? (
                  <AppCard variant="outlined" padding="sm" style={styles.additionalCard}>
                    <View style={styles.additionalIconBox}>
                      <Text style={styles.additionalIcon}>🏛️</Text>
                    </View>
                    <View style={styles.additionalText}>
                      <Text style={styles.additionalLabel}>Organized By</Text>
                      <Text style={styles.additionalValue}>{event.organizer}</Text>
                    </View>
                  </AppCard>
                ) : null}
                {event.category ? (
                  <AppCard variant="outlined" padding="sm" style={styles.additionalCard}>
                    <View style={styles.additionalIconBox}>
                      <Text style={styles.additionalIcon}>🏷️</Text>
                    </View>
                    <View style={styles.additionalText}>
                      <Text style={styles.additionalLabel}>Event Type</Text>
                      <Text style={styles.additionalValue}>{event.category}</Text>
                    </View>
                  </AppCard>
                ) : null}
              </View>
            </>
          )}

          {/* Status */}
          <Text style={styles.sectionHeader}>Status</Text>
          <View style={[styles.statusCard, { backgroundColor: statusMeta.bg }]}>
            <View style={styles.statusIconBox}>
              <Text style={styles.statusIcon}>{statusMeta.icon}</Text>
            </View>
            <View style={styles.statusText}>
              <Text style={[styles.statusLabel, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
              <Text style={styles.statusDescription}>{statusMeta.description}</Text>
            </View>
          </View>

          {/* Actions — UI placeholders only (spec section 11) */}
          <Text style={styles.sectionHeader}>Actions</Text>
          <View style={styles.actionsRow}>
            <AppButton
              title="Edit Event"
              variant="outline"
              size="sm"
              onPress={onEdit}
              icon={<Text style={styles.actionIcon}>✏️</Text>}
              style={styles.actionButton}
            />
            <AppButton
              title="Publish Event"
              variant="primary"
              size="sm"
              onPress={() => handlePlaceholderAction('Publish Event')}
              icon={<Text style={styles.actionIcon}>📣</Text>}
              style={styles.actionButton}
            />
          </View>
          <View style={styles.actionsRow}>
            <AppButton
              title="Unpublish Event"
              variant="outline"
              size="sm"
              onPress={() => handlePlaceholderAction('Unpublish Event')}
              icon={<Text style={styles.actionIcon}>🚫</Text>}
              style={styles.dangerActionButton}
              textStyle={styles.dangerOutlineText}
            />
            <AppButton
              title="Delete Event"
              variant="outline"
              size="sm"
              onPress={() => handlePlaceholderAction('Delete Event')}
              icon={<Text style={styles.actionIcon}>🗑️</Text>}
              style={styles.dangerActionButton}
              textStyle={styles.dangerOutlineText}
            />
          </View>
          <View style={styles.placeholderNote}>
            <Text style={styles.placeholderIcon}>ⓘ</Text>
            <Text style={styles.placeholderText}>
              Publish, unpublish and delete are UI placeholders. They will be
              connected in a later phase after backend integration.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AdminColors.cardSurface,
  },
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  // Temporary preview header
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    minHeight: 54,
  },
  previewBackButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  previewBackIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: AdminColors.textPrimary,
    // The ← glyph is drawn on the baseline inside its line box, which leaves
    // it visibly below the title's optical center — nudge it up to align.
    transform: [{ translateY: -4 }],
  },
  previewTitle: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
    flex: 1,
  },
  previewRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewBell: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  previewBadge: {
    position: 'absolute',
    top: -4,
    right: 18,
    width: 14,
    height: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.statusInactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBadgeText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  previewAvatar: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primaryLight,
    borderWidth: 1,
    borderColor: AdminColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.lg,
  },
  previewAvatarText: {
    ...Typography.badge,
    color: AdminColors.primary,
  },

  // Cover
  coverWrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  coverImage: {
    width: '100%',
    height: 190,
    borderRadius: BorderRadius.xl,
    backgroundColor: AdminColors.background,
  },
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackIcon: {
    fontSize: 40,
  },

  // Title + badges
  title: {
    ...Typography.screenTitle,
    color: AdminColors.textPrimary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
  },

  // Date/time/location card
  infoCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoValue: {
    ...Typography.body,
    color: AdminColors.textPrimary,
    flexShrink: 1,
  },

  // Registration card
  registrationCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
  },
  registrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  registrationIcon: {
    fontSize: 14,
  },
  registrationText: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
    flexShrink: 1,
  },
  registrationBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.divider,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.statusActive,
  },
  registrationPercent: {
    ...Typography.badge,
    color: AdminColors.textPrimary,
    minWidth: 32,
    textAlign: 'right',
  },

  // Sections
  sectionHeader: {
    ...Typography.sectionHeader,
    color: AdminColors.primaryDark,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  descriptionText: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    paddingHorizontal: Spacing.base,
  },

  // Additional information rows
  additionalList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  additionalCard: {
    marginVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  additionalIconBox: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  additionalIcon: {
    fontSize: 15,
  },
  additionalText: {
    flex: 1,
    minWidth: 0,
  },
  additionalLabel: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  additionalValue: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },

  // Status card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  statusIconBox: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 15,
  },
  statusText: {
    flex: 1,
    minWidth: 0,
  },
  statusLabel: {
    ...Typography.bodyBold,
  },
  statusDescription: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
  actionIcon: {
    fontSize: 13,
  },
  dangerActionButton: {
    flex: 1,
    borderColor: AdminColors.error,
  },
  dangerOutlineText: {
    color: AdminColors.error,
  },
  placeholderNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.infoLight,
  },
  placeholderIcon: {
    fontSize: 14,
    color: AdminColors.info,
    fontWeight: '700',
  },
  placeholderText: {
    ...Typography.secondary,
    color: AdminColors.info,
    flex: 1,
  },

  errorState: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
