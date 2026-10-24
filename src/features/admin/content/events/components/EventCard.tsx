import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
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
  Eye,
  Pencil,
  Trash2,
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
  /** Fired when the Edit action is pressed */
  onEditPress?: (event: EventListItem) => void;
  /** Fired when the Delete action is pressed */
  onDeletePress?: (event: EventListItem) => void;
  /** Optional override for three-dot action menu */
  onMorePress?: (event: EventListItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onEditPress,
  onDeletePress,
  onMorePress,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const moreButtonRef = useRef<any>(null);

  const coverUri = event.coverImageUrl && !imageFailed ? event.coverImageUrl : undefined;

  const handleView = () => onPress?.(event);

  const handleEdit = () => {
    if (onEditPress) {
      onEditPress(event);
    } else {
      Alert.alert(
        'Edit Event',
        `The Edit Event screen for "${event.title}" will be implemented in the next phase of the Events module.`,
      );
    }
  };

  const handleDelete = () => {
    if (onDeletePress) {
      onDeletePress(event);
    } else {
      Alert.alert(
        'Delete Event',
        `Are you sure you want to delete "${event.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              Alert.alert('Event Deleted', `"${event.title}" has been deleted.`);
            },
          },
        ],
      );
    }
  };

  const handleOpenMenu = () => {
    if (onMorePress) {
      onMorePress(event);
      return;
    }
    if (moreButtonRef.current && typeof moreButtonRef.current.measureInWindow === 'function') {
      moreButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;
        const menuHeight = 135;
        const top =
          y + height + 4 + menuHeight > windowHeight
            ? Math.max(10, y - menuHeight - 4)
            : y + height + 4;
        const right = Math.max(16, windowWidth - (x + width));
        setMenuPosition({ top, right });
        setMenuVisible(true);
      });
    } else {
      setMenuVisible(true);
    }
  };

  const chipTone = event.category ? categoryChipTone(event.category) : null;

  return (
    <>
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

          {/* 3. Event status badge and three-dot action button on the right */}
          <View style={styles.rightSection}>
            <EventStatusBadge
              status={event.status}
              style={styles.statusBadge}
              textStyle={styles.statusBadgeText}
            />
            <View ref={moreButtonRef} collapsable={false}>
              <TouchableOpacity
                style={styles.moreButton}
                onPress={handleOpenMenu}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Actions for ${event.title}`}
              >
                <EllipsisVertical size={16} color={AdminColors.primaryDark} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </AppCard>

      {/* Floating Action Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[
              styles.floatingMenuCard,
              menuPosition
                ? { top: menuPosition.top, right: menuPosition.right }
                : styles.fallbackFloatingPosition,
            ]}
            onStartShouldSetResponder={() => true}
          >
            <TouchableOpacity
              style={styles.floatingMenuItem}
              activeOpacity={0.7}
              onPress={() => {
                setMenuVisible(false);
                handleView();
              }}
            >
              <Eye size={15} color={AdminColors.primary} strokeWidth={2} />
              <Text style={styles.floatingMenuText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingMenuItem}
              activeOpacity={0.7}
              onPress={() => {
                setMenuVisible(false);
                handleEdit();
              }}
            >
              <Pencil size={15} color={AdminColors.primary} strokeWidth={2} />
              <Text style={styles.floatingMenuText}>Edit</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={[styles.floatingMenuItem, styles.floatingMenuItemDanger]}
              activeOpacity={0.7}
              onPress={() => {
                setMenuVisible(false);
                handleDelete();
              }}
            >
              <Trash2 size={15} color="#DC2626" strokeWidth={2} />
              <Text style={styles.floatingMenuTextDanger}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
  moreButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  floatingMenuCard: {
    position: 'absolute',
    width: 135,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 9999,
  },
  fallbackFloatingPosition: {
    top: 120,
    right: 20,
  },
  floatingMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  floatingMenuItemDanger: {},
  floatingMenuText: {
    fontSize: 13,
    fontWeight: '600',
    color: AdminColors.textPrimary,
  },
  floatingMenuTextDanger: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 3,
    marginHorizontal: 4,
  },
});