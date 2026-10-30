import React from 'react';
import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Shadows,
  Spacing,
  UserFontFamilies,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import ContactMapPlaceholder from '../../../../assets/images/contact-map-placeholder.jpg';

export const HRSJM_OFFICE_ADDRESS = '123 Justice Lane, Kurla (W), Mumbai, Maharashtra 400070, India';
export const GOOGLE_MAPS_SEARCH_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('HRSJM Office, 123 Justice Lane, Kurla West, Mumbai, Maharashtra 400070');

interface ContactMapSectionProps {
  onOpenMaps?: () => void;
}

/**
 * "Find Us on Map" section: map display with the HRSJM
 * office info card, circular navigation button, and
 * "Open in Google Maps" pill with dynamic Google Maps navigation.
 */
export const ContactMapSection: React.FC<ContactMapSectionProps> = ({
  onOpenMaps,
}) => {
  const openMaps = async () => {
    if (onOpenMaps) {
      onOpenMaps();
      return;
    }

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(GOOGLE_MAPS_SEARCH_URL, '_blank');
        return;
      }

      const supported = await Linking.canOpenURL(GOOGLE_MAPS_SEARCH_URL);
      if (supported) {
        await Linking.openURL(GOOGLE_MAPS_SEARCH_URL);
      } else {
        await Linking.openURL(
          `geo:19.0728,72.8797?q=${encodeURIComponent('123 Justice Lane, Kurla West, Mumbai')}`,
        );
      }
    } catch {
      Linking.openURL(GOOGLE_MAPS_SEARCH_URL);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Find Us on Map</Text>

      <TouchableOpacity
        style={styles.mapWrap}
        onPress={openMaps}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel="Open HRSJM location on Google Maps"
      >
        <Image
          source={ContactMapPlaceholder}
          style={styles.map}
          resizeMode="cover"
          accessible
          accessibilityRole="image"
          accessibilityLabel="Map showing the HRSJM office location in Kurla, Mumbai"
        />

        <View style={styles.locationMarker} pointerEvents="none">
          <AppIcon name="map-pin" size={26} color="#D84A45" strokeWidth={2.2} />
        </View>

        <TouchableOpacity
          style={styles.infoCard}
          onPress={openMaps}
          activeOpacity={0.8}
        >
          <Text style={styles.infoTitle}>HRSJM Office</Text>
          <Text style={styles.infoLine}>123 Justice Lane, Kurla (W)</Text>
          <Text style={styles.infoLine}>Mumbai, Maharashtra 400070</Text>
        </TouchableOpacity>

        {/* Top-right navigation direction button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={openMaps}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Navigate to the HRSJM office on Google Maps"
        >
          <AppIcon name="send" size={15} color={AdminColors.primaryDark} />
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.mapsButton}
        onPress={openMaps}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Open in Google Maps"
      >
        <AppIcon name="map-pin" size={14} color={AdminColors.primaryDark} />
        <Text style={styles.mapsButtonText}>Open in Google Maps</Text>
        <AppIcon name="arrow-right" size={12} color={AdminColors.primaryDark} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  heading: {
    fontFamily: UserFontFamilies.heading,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginBottom: Spacing.md,
  },
  mapWrap: {
    borderRadius: BorderRadius.lg + 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AdminColors.border,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: 150,
  },
  locationMarker: {
    position: 'absolute',
    top: '55%',
    left: '52%',
    marginLeft: -13,
  },
  infoCard: {
    position: 'absolute',
    top: Spacing.sm,
    left: '28%',
    width: '48%',
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    ...Shadows.cardMedium,
  },
  infoTitle: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  infoLine: {
    fontSize: 10,
    lineHeight: 14,
    color: AdminColors.textSecondary,
    marginTop: 1,
  },
  navButton: {
    position: 'absolute',
    right: Spacing.sm,
    top: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AdminColors.border,
    ...Shadows.cardMedium,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.cardSurface,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    ...Shadows.card,
  },
  mapsButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: AdminColors.primaryDark,
  },
});
