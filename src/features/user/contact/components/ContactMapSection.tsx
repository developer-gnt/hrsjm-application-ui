import React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
// TODO: Replace with a real static map / maps integration in a later phase.
// TEMPORARY DUMMY: stylised Kurla (Mumbai) street-map graphic with an HRSJM
// pin (src/assets/images/contact-map-placeholder.jpg) — swap the require
// below, layout stays unchanged.
import ContactMapPlaceholder from '../../../../assets/images/contact-map-placeholder.jpg';

interface ContactMapSectionProps {
  onOpenMaps?: () => void;
}

/**
 * Reference-locked "Find Us on Map" section: dummy map with the HRSJM
 * office info card and the circular navigation button overlaid, followed by
 * the compact "Open in Google Maps" pill (UI-only — no Maps API/SDK).
 */
export const ContactMapSection: React.FC<ContactMapSectionProps> = ({
  onOpenMaps,
}) => {
  const openMaps = () => {
    if (onOpenMaps) {
      onOpenMaps();
      return;
    }
    // UI PHASE ONLY: no Google Maps API connection.
    Alert.alert(
      'Open in Google Maps',
      'Maps integration arrives with an upcoming phase.',
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Find Us on Map</Text>

      <View style={styles.mapWrap}>
        <Image
          source={ContactMapPlaceholder}
          style={styles.map}
          resizeMode="cover"
          accessible
          accessibilityRole="image"
          accessibilityLabel="Map placeholder showing the HRSJM office location in Kurla, Mumbai"
        />

        <View style={styles.locationMarker} pointerEvents="none">
          <AppIcon name="map-pin" size={26} color="#D84A45" strokeWidth={2.2} />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>HRSJM Office</Text>
          <Text style={styles.infoLine}>123 Justice Lane, Kurla (W)</Text>
          <Text style={styles.infoLine}>Mumbai, Maharashtra 400070</Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={openMaps}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Navigate to the HRSJM office"
        >
          <AppIcon name="map-pin" size={16} color={AdminColors.textOnDark} />
        </TouchableOpacity>
      </View>

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
    fontFamily: FontFamilies.serif,
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
    width: 30,
    height: 30,
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
    borderWidth: 0,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.background,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  mapsButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: AdminColors.primaryDark,
  },
});
