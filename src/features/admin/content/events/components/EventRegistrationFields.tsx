import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import { AppInput } from '../../../../../core/components';
import { EventFormField } from './EventFormField';
import { EventPickerSheet } from './EventPickerSheet';
import { SAMPLE_PER_PERSON_LIMIT_OPTIONS } from '../data/sample-events';
import type { CreateEventFieldErrors, CreateEventFormState } from '../types/events.types';

interface EventRegistrationFieldsProps {
  values: Pick<
    CreateEventFormState,
    'registrationRequired' | 'totalSeats' | 'perPersonLimit'
  >;
  errors: CreateEventFieldErrors;
  onToggleRegistration: (value: boolean) => void;
  onChangeField: <K extends keyof CreateEventFormState>(field: K, value: CreateEventFormState[K]) => void;
}

export const EventRegistrationFields: React.FC<EventRegistrationFieldsProps> = ({
  values,
  errors,
  onToggleRegistration,
  onChangeField,
}) => {
  const [limitPickerVisible, setLimitPickerVisible] = useState(false);

  return (
    <View>
      <View style={styles.registrationCard}>
        <View style={styles.registrationText}>
          <Text style={styles.registrationTitle}>Registration Required</Text>
          <Text style={styles.registrationSubtitle}>
            Enable if people need to register for this event
          </Text>
        </View>
        <Switch
          value={values.registrationRequired}
          onValueChange={onToggleRegistration}
          trackColor={{ true: AdminColors.primary, false: AdminColors.border }}
          thumbColor={AdminColors.cardSurface}
          accessibilityLabel="Registration Required"
        />
      </View>

      {values.registrationRequired ? (
        <View style={styles.gridRow}>
          <View style={styles.fieldHalf}>
            <EventFormField label="Total Seats" required>
              <AppInput
                value={values.totalSeats}
                onChangeText={value => onChangeField('totalSeats', value)}
                placeholder="Enter total seats"
                keyboardType="number-pad"
                error={errors.totalSeats}
                accessibilityLabel="Total Seats"
              />
            </EventFormField>
          </View>
          <View style={styles.fieldHalf}>
            <EventFormField label="Per Person Limit">
              <TouchableOpacity
                style={styles.dropdownField}
                onPress={() => setLimitPickerVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Per Person Limit"
              >
                <Text style={styles.dropdownValue}>{values.perPersonLimit ?? '1'}</Text>
                <Text style={styles.dropdownChevron}>⌄</Text>
              </TouchableOpacity>
            </EventFormField>
          </View>
        </View>
      ) : null}

      <EventPickerSheet
        visible={limitPickerVisible}
        title="Per Person Limit"
        hint="Demo options only — not backend values"
        options={SAMPLE_PER_PERSON_LIMIT_OPTIONS}
        selected={values.perPersonLimit}
        onSelect={value => onChangeField('perPersonLimit', value)}
        onClose={() => setLimitPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  registrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AdminColors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  registrationText: {
    flex: 1,
    minWidth: 0,
    marginRight: Spacing.sm,
  },
  registrationTitle: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  registrationSubtitle: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fieldHalf: {
    flex: 1,
  },
  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  dropdownValue: {
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  dropdownChevron: {
    fontSize: 12,
    color: AdminColors.textMuted,
    marginLeft: Spacing.sm,
  },
});