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
          accessibilityLabel="Map showing the HRSJM office location in Kurla, Mumbai"
        />

        {/* Kurla label in bottom left */}
        <View style={styles.kurlaLabelWrap} pointerEvents="none">
          <Text style={styles.kurlaTitle}>Kurla</Text>
          <Text style={styles.kurlaSubtitle}>कुर्ला</Text>
        </View>

        {/* Phoenix Marketcity Kurla landmark badge */}
        <View style={styles.landmarkWrap} pointerEvents="none">
          <View style={styles.landmarkIconWrap}>
            <AppIcon name="briefcase" size={12} color="#FFFFFF" />
          </View>
          <View style={styles.landmarkCopy}>
            <Text style={styles.landmarkTitle}>Phoenix Marketcity</Text>
            <Text style={styles.landmarkTitle}>Kurla</Text>
            <Text style={styles.landmarkSubtitle}>फिनिक्स मॉल</Text>
          </View>
        </View>

        {/* Office Callout Box with Little Pin Pointer */}
        <View style={styles.calloutWrap} pointerEvents="none">
          <View style={styles.calloutCard}>
            <View style={styles.calloutPinIcon}>
              <AppIcon name="map-pin" size={20} color="#D84A45" strokeWidth={2.4} />
            </View>
            <View style={styles.calloutTextWrap}>
              <Text style={styles.calloutTitle}>HRSJM Office</Text>
              <Text style={styles.calloutLine}>123 Justice Lane, Kurla (W)</Text>
              <Text style={styles.calloutLine}>Mumbai, Maharashtra 400070</Text>
            </View>
          </View>
          {/* Beak / triangle pointer */}
          <View style={styles.calloutBeak} />
        </View>

        {/* Main Red Location Pin on the map directly below the callout beak */}
        <View style={styles.centerPinMarker} pointerEvents="none">
          <AppIcon name="map-pin" size={32} color="#D84A45" strokeWidth={2.6} />
        </View>

        {/* Top-Right Compass / Navigation Target Button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={openMaps}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Navigate to the HRSJM office"
        >
          <AppIcon name="send" size={16} color={AdminColors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Pill: Open in Google Maps */}
      <TouchableOpacity
        style={styles.mapsButton}
        onPress={openMaps}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Open in Google Maps"
      >
        {/* Google Maps G-Pin multicolor simulation */}
        <View style={styles.gMapsIconWrap}>
          <AppIcon name="map-pin" size={17} color="#EA4335" strokeWidth={2.2} />
        </View>
        <Text style={styles.mapsButtonText}>Open in Google Maps</Text>
        <AppIcon name="arrow-right" size={14} color={AdminColors.primaryDark} />
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
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginBottom: Spacing.md,
  },
  mapWrap: {
    height: 195,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#F1F4F8',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  kurlaLabelWrap: {
    position: 'absolute',
    left: 18,
    bottom: 16,
  },
  kurlaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 26,
  },
  kurlaSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 16,
  },
  landmarkWrap: {
    position: 'absolute',
    right: 14,
    bottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  landmarkIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  landmarkCopy: {
    flexDirection: 'column',
  },
  landmarkTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1565C0',
    lineHeight: 14,
  },
  landmarkSubtitle: {
    fontSize: 9,
    color: '#1976D2',
    lineHeight: 11,
  },
  calloutWrap: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  calloutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    maxWidth: 240,
  },
  calloutPinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutTextWrap: {
    flexShrink: 1,
  },
  calloutTitle: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  calloutLine: {
    fontSize: 10,
    lineHeight: 14,
    color: '#64748B',
    marginTop: 1,
  },
  calloutBeak: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -1,
  },
  centerPinMarker: {
    position: 'absolute',
    top: 96,
    alignSelf: 'center',
    zIndex: 5,
  },
  navButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 18,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 22,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  gMapsIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapsButtonText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
});
