import React from 'react';
import {
  Image,
  type ImageSourcePropType,
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
} from '../../../../core/theme';
import { AppIcon, ImageSlot } from '../../components';
import type { HomeEvent } from '../types/home.types';

const EVENT_IMAGES: Record<string, ImageSourcePropType> = {
  'home/events/rights-workshop.png': require('../../../../assets/images/about-hero-community.png'),
  'home/events/legal-camp.png': require('../../../../assets/images/about-hero-community.png'),
  'home/events/youth-convention.png': require('../../../../assets/images/hero-home.webp'),
};

interface HomeEventCardProps {
  event: HomeEvent;
  onPress?: () => void;
}

/**
 * Horizontal "Upcoming Events" card from the reference: image with overlaid
 * date badge, two-line title, location row and the gold circular arrow.
 * Card width derives from the window width (~2.2 cards visible) so the
 * carousel adapts across screen sizes.
 */
export const HomeEventCard: React.FC<HomeEventCardProps> = ({ event, onPress }) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(
    180,
    Math.max(120, (windowWidth - Spacing.base * 2 - Spacing.sm) / 2.7),
  );
  const imageSource = EVENT_IMAGES[event.imageAssetName];

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Event: ${event.title}`}
    >
      <View style={styles.media}>
        {imageSource ? (
          <Image source={imageSource} style={styles.mediaSlot} resizeMode="cover" />
        ) : (
          <ImageSlot
            assetName={event.imageAssetName}
            radius={0}
            style={styles.mediaSlot}
          />
        )}
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{event.day}</Text>
          <Text style={styles.dateMonth}>{event.month}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.footer}>
          <View style={styles.location}>
            <AppIcon name="map-pin" size={12} color={AdminColors.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
          <View style={styles.arrow}>
            <AppIcon
              name="arrow-right"
              size={13}
              color={AdminColors.textOnDark}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  media: {
    height: 48,
  },
  mediaSlot: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  dateBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignItems: 'center',
  },
  dateDay: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  dateMonth: {
    fontSize: 7,
    lineHeight: 8,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: AdminColors.textSecondary,
  },
  body: {
    padding: 5,
  },
  title: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '600',
    color: AdminColors.primaryDark,
    minHeight: 23,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 7,
    lineHeight: 9,
    color: AdminColors.textSecondary,
    marginLeft: 4,
  },
  arrow: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
