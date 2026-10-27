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
  UserFontFamilies,
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
    Math.max(132, (windowWidth - Spacing.base * 2 - Spacing.sm) / 2.3),
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
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.mediaSlot}
            resizeMode="cover"
          />
        ) : imageSource ? (
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
    height: 156,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  media: {
    height: 78,
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
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateDay: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    color: '#0F2860',
  },
  dateMonth: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 8,
    lineHeight: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#64748B',
  },
  body: {
    padding: 8,
  },
  title: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '700',
    color: '#0F2860',
    minHeight: 30,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  location: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  locationText: {
    flex: 1,
    fontFamily: UserFontFamilies.sans,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 4,
  },
  arrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
