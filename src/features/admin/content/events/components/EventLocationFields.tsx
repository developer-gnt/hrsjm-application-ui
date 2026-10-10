import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import { AppInput } from '../../../../../core/components';
import { EventFormField } from './EventFormField';
import type { CreateEventFieldErrors, CreateEventFormState } from '../types/events.types';

interface EventLocationFieldsProps {
  values: Pick<CreateEventFormState, 'location' | 'address'>;
  errors: CreateEventFieldErrors;
  onChangeField: <K extends keyof CreateEventFormState>(field: K, value: CreateEventFormState[K]) => void;
}

export const EventLocationFields: React.FC<EventLocationFieldsProps> = ({
  values,
  errors,
  onChangeField,
}) => {
  // UI placeholder only: real location permission + maps integration is a
  // later phase after the backend contract is confirmed.
  const handleUseCurrentLocation = () => {
    Alert.alert(
      'Use Current Location',
      'This is a UI placeholder. Location permission and maps integration will be connected in a later phase.',
    );
  };

  return (
    <View>
      <EventFormField label="Location" required>
        <AppInput
          value={values.location}
          onChangeText={value => onChangeField('location', value)}
          placeholder="Enter event location"
          error={errors.location}
          accessibilityLabel="Location"
        />
      </EventFormField>

      <EventFormField label="Address" optionalHint>
        <AppInput
          value={values.address}
          onChangeText={value => onChangeField('address', value)}
          placeholder="Enter full address"
          accessibilityLabel="Address"
        />
      </EventFormField>

      <View style={styles.previewRow}>
        <View style={styles.mapPreview} accessible accessibilityLabel="Map preview placeholder">
          <Text style={styles.mapPin}>📍</Text>
        </View>
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
          accessibilityRole="button"
          accessibilityLabel="Use Current Location"
        >
          <Text style={styles.currentLocationIcon}>📍</Text>
          <Text style={styles.currentLocationText} numberOfLines={1}>
            Use Current Location
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  mapPreview: {
    flex: 1,
    height: 72,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapPin: {
    fontSize: 20,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.primary,
    backgroundColor: AdminColors.cardSurface,
  },
  currentLocationIcon: {
    fontSize: 12,
  },
  currentLocationText: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
    flexShrink: 1,
  },
});