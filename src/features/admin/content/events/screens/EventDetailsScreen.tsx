import React, { useState, useEffect } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  ScrollView,
  Share,
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
import { Calendar, Clock, MapPin } from '../../../../../core/components/icons';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppErrorState,
  ConfirmDialog,
} from '../../../../../core/components';
import { formatDate } from '../../../../../core/utils';
import { AdminHeader } from '../../../../../app/navigation';
import type { EventListItem, EventUiStatus } from '../types/events.types';
import { EventStatusBadge } from '../components/EventStatusBadge';
import { EventFormToast } from '../components/EventFormToast';
import type { ButtonVariant } from '../../../../../core/components/common/AppButton';
import { EditEventScreen } from './EditEventScreen';
import { useDeleteEvent, useUpdateEventStatus, useEventDetails } from '../hooks/useEvents';

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

interface ConfirmActionState {
  type: 'publish' | 'unpublish' | 'delete';
  title: string;
  message: string;
  confirmTitle: string;
  confirmVariant: ButtonVariant;
}

interface EventDetailsScreenProps {
  /** The event row selected on the Events list. */
  event: EventListItem | null;
  /** Back navigation to the Events list. */
  onBack: () => void;
  /** Opens the Edit Event screen for this event. */
  onEdit?: () => void;
  /** Whether the current viewer can manage/edit the event (admin) or only view/participate (member). */
  canManage?: boolean;
  onDelete?: (event: EventListItem) => void;
  onEventUpdated?: (event: EventListItem) => void;
}

/**
 * Event Details screen (spec section 11).
 *
 * Full management actions: edit, publish, unpublish, delete with in-app
 * confirmation modals and toast feedback working seamlessly on mobile and web.
 */
export const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({
  event,
  onBack,
  onEdit,
  canManage = true,
  onDelete,
  onEventUpdated,
}) => {
  const [currentEvent, setCurrentEvent] = useState<EventListItem | null>(event);
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const deleteEventMutation = useDeleteEvent();
  const updateEventStatusMutation = useUpdateEventStatus();
  const eventDetailsQuery = useEventDetails(event?.id ?? '');

  useEffect(() => {
    if (eventDetailsQuery.data) {
      setCurrentEvent(eventDetailsQuery.data);
    }
  }, [eventDetailsQuery.data]);

  useEffect(() => {
    if (event) {
      setCurrentEvent(prev => {
        if (prev && prev.id === event.id) {
          return prev;
        }
        return event;
      });
    }
  }, [event]);

  // Android hardware back returns to the Events list (no-op on iOS).
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isEditing) {
        setIsEditing(false);
        return true;
      }
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack, isEditing]);

  // Reset the cover-image fallback whenever a different event is opened.
  useEffect(() => {
    setCoverFailed(false);
  }, [currentEvent?.id]);

  if (isEditing && currentEvent) {
    return (
      <EditEventScreen
        event={currentEvent}
        onBack={() => {
          setIsEditing(false);
          eventDetailsQuery.refetch();
        }}
        onSaved={updated => {
          if (updated) {
            setCurrentEvent(updated);
          }
          setIsEditing(false);
          eventDetailsQuery.refetch();
          onEventUpdated?.(updated || currentEvent);
        }}
      />
    );
  }

  if (!currentEvent) {
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

  const statusMeta = STATUS_SECTION_META[currentEvent.status] || STATUS_SECTION_META.UPCOMING;

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      return;
    }
    setIsEditing(true);
  };

  const handlePublish = () => {
    if (!currentEvent) return;
    if (currentEvent.status === 'UPCOMING') {
      setToast({
        message: 'This event is already published as Upcoming.',
        variant: 'success',
      });
      return;
    }

    setConfirmAction({
      type: 'publish',
      title: 'Publish Event',
      message: `Publish "${currentEvent.title}" to make it public and open for registration?`,
      confirmTitle: 'Publish',
      confirmVariant: 'primary',
    });
  };

  const handleUnpublish = () => {
    if (!currentEvent) return;
    if (currentEvent.status === 'DRAFT') {
      setToast({
        message: 'This event is already in Draft status.',
        variant: 'success',
      });
      return;
    }

    setConfirmAction({
      type: 'unpublish',
      title: 'Unpublish Event',
      message: `Move "${currentEvent.title}" to Draft? It will no longer be visible to members.`,
      confirmTitle: 'Unpublish',
      confirmVariant: 'danger',
    });
  };

  const handleDelete = () => {
    if (!currentEvent) return;
    setConfirmAction({
      type: 'delete',
      title: 'Delete Event',
      message: `Are you sure you want to permanently delete "${currentEvent.title}"? This action cannot be undone.`,
      confirmTitle: 'Delete',
      confirmVariant: 'danger',
    });
  };

  const handleExecuteConfirm = async () => {
    if (!confirmAction || !currentEvent) return;
    const action = confirmAction.type;
    setConfirmAction(null);

    if (action === 'publish') {
      setIsPublishing(true);
      try {
        await updateEventStatusMutation.mutateAsync({
          id: currentEvent.id,
          status: 'UPCOMING',
        });
        const updated = { ...currentEvent, status: 'UPCOMING' as const };
        setCurrentEvent(updated);
        onEventUpdated?.(updated);
        setToast({
          message: `"${currentEvent.title}" is now published as Upcoming.`,
          variant: 'success',
        });
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to publish event.';
        setToast({
          message: Array.isArray(msg) ? msg[0] : msg,
          variant: 'error',
        });
      } finally {
        setIsPublishing(false);
      }
    } else if (action === 'unpublish') {
      setIsUnpublishing(true);
      try {
        await updateEventStatusMutation.mutateAsync({
          id: currentEvent.id,
          status: 'DRAFT',
        });
        const updated = { ...currentEvent, status: 'DRAFT' as const };
        setCurrentEvent(updated);
        onEventUpdated?.(updated);
        setToast({
          message: `"${currentEvent.title}" moved to Draft.`,
          variant: 'success',
        });
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to unpublish event.';
        setToast({
          message: Array.isArray(msg) ? msg[0] : msg,
          variant: 'error',
        });
      } finally {
        setIsUnpublishing(false);
      }
    } else if (action === 'delete') {
      setIsDeleting(true);
      try {
        await deleteEventMutation.mutateAsync(currentEvent.id);
        setToast({
          message: `"${currentEvent.title}" deleted.`,
          variant: 'success',
        });
        onDelete?.(currentEvent);
        setTimeout(() => {
          onBack();
        }, 700);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to delete event.';
        setToast({
          message: Array.isArray(msg) ? msg[0] : msg,
          variant: 'error',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleShareEvent = async () => {
    try {
      await Share.share({
        title: currentEvent.title,
        message: `Join "${currentEvent.title}" on ${formatDate(currentEvent.startAt)} at ${currentEvent.location || 'HRSJM'}. Organized by ${currentEvent.organizer || 'HRSJM'}.`,
      });
    } catch {
      // ignore
    }
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
            {currentEvent.coverImageUrl && !coverFailed ? (
              <Image
                source={{ uri: currentEvent.coverImageUrl }}
                style={styles.coverImage}
                resizeMode="cover"
                onError={() => setCoverFailed(true)}
              />
            ) : (
              <View style={[styles.coverImage, styles.coverFallback]}>
                <Calendar size={36} color={AdminColors.textMuted} />
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{currentEvent.title}</Text>

          {/* Category + status badges */}
          <View style={styles.badgesRow}>
            {currentEvent.category ? (
              <AppBadge
                label={currentEvent.category}
                customBg={AdminColors.successLight}
                customTextColor={AdminColors.success}
                style={styles.badge}
              />
            ) : null}
            <EventStatusBadge status={currentEvent.status} style={styles.badge} />
          </View>

          {/* Date / time / location */}
          <AppCard variant="outlined" padding="base" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Calendar size={18} color={AdminColors.primary} />
              <Text style={styles.infoValue}>{formatDate(currentEvent.startAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={18} color={AdminColors.primary} />
              <Text style={styles.infoValue}>
                {formatTimeRange(currentEvent.startAt, currentEvent.endAt)}
              </Text>
            </View>
            {currentEvent.location ? (
              <View style={styles.infoRow}>
                <MapPin size={18} color={AdminColors.primary} />
                <Text style={styles.infoValue}>{currentEvent.location}</Text>
              </View>
            ) : null}
          </AppCard>

          {/* Description */}
          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.descriptionText}>
            {currentEvent.description ?? 'No description available yet.'}
          </Text>

          {/* Additional information — only fields supported by the current Event type */}
          {(currentEvent.organizer || currentEvent.category) && (
            <>
              <Text style={styles.sectionHeader}>Additional Information</Text>
              <View style={styles.additionalList}>
                {currentEvent.organizer ? (
                  <AppCard variant="outlined" padding="sm" style={styles.additionalCard}>
                    <View style={styles.additionalIconBox}>
                      <Text style={styles.additionalIcon}>🏛️</Text>
                    </View>
                    <View style={styles.additionalText}>
                      <Text style={styles.additionalLabel}>Organized By</Text>
                      <Text style={styles.additionalValue}>{currentEvent.organizer}</Text>
                    </View>
                  </AppCard>
                ) : null}
                {currentEvent.category ? (
                  <AppCard variant="outlined" padding="sm" style={styles.additionalCard}>
                    <View style={styles.additionalIconBox}>
                      <Text style={styles.additionalIcon}>🏷️</Text>
                    </View>
                    <View style={styles.additionalText}>
                      <Text style={styles.additionalLabel}>Event Type</Text>
                      <Text style={styles.additionalValue}>{currentEvent.category}</Text>
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

          {/* Actions */}
          {canManage ? (
            <>
              <Text style={styles.sectionHeader}>Actions</Text>
              <View style={styles.actionsRow}>
                <AppButton
                  title="Edit Event"
                  variant="outline"
                  size="sm"
                  onPress={handleEdit}
                  icon={<Text style={styles.actionIcon}>✏️</Text>}
                  style={styles.actionButton}
                />
                <AppButton
                  title="Publish Event"
                  variant="primary"
                  size="sm"
                  loading={isPublishing}
                  disabled={isPublishing || isUnpublishing || isDeleting}
                  onPress={handlePublish}
                  icon={<Text style={styles.actionIcon}>📣</Text>}
                  style={styles.actionButton}
                />
              </View>
              <View style={styles.actionsRow}>
                <AppButton
                  title="Unpublish Event"
                  variant="outline"
                  size="sm"
                  loading={isUnpublishing}
                  disabled={isPublishing || isUnpublishing || isDeleting}
                  onPress={handleUnpublish}
                  icon={<Text style={styles.actionIcon}>🚫</Text>}
                  style={styles.dangerActionButton}
                  textStyle={styles.dangerOutlineText}
                />
                <AppButton
                  title="Delete Event"
                  variant="outline"
                  size="sm"
loading={isDeleting}
                  disabled={isPublishing || isUnpublishing || isDeleting}
                  onPress={handleDelete}
                  icon={<Text style={styles.actionIcon}>🗑️</Text>}
                  style={styles.dangerActionButton}
                  textStyle={styles.dangerOutlineText}
                />
              </View>
            </>
          ) : (
            <View style={[styles.actionsRow, { marginTop: Spacing.md }]}>
              <AppButton
                title="Share Event"
                variant="outline"
                size="sm"
                onPress={handleShareEvent}
                icon={<Text style={styles.actionIcon}>🔗</Text>}
                style={styles.actionButton}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <ConfirmDialog
        visible={Boolean(confirmAction)}
        title={confirmAction?.title ?? ''}
        message={confirmAction?.message ?? ''}
        confirmTitle={confirmAction?.confirmTitle ?? 'Confirm'}
        confirmVariant={confirmAction?.confirmVariant ?? 'danger'}
        cancelTitle="Cancel"
        loading={isPublishing || isUnpublishing || isDeleting}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleExecuteConfirm}
      />

      <EventFormToast
        message={toast?.message ?? null}
        variant={toast?.variant ?? 'success'}
        onDismiss={() => setToast(null)}
      />
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
