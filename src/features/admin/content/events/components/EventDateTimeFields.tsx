import React, { useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import { EventFormField } from './EventFormField';
import { EventPickerSheet } from './EventPickerSheet';
import { formatDate } from '../../../../../core/utils';
import type { CreateEventFieldErrors, CreateEventFormState } from '../types/events.types';

/**
 * TEMPORARY local time formatting helper (same as EventCard/EventDetails).
 * Move to the shared date utilities once the backend time contract is confirmed.
 */
const formatTimeLabel = (hhmm: string): string => {
  const [hours, minutes] = hhmm.split(':').map(part => parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return hhmm;
  }
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

/** Builds the next `count` days (local calendar) as ISO YYYY-MM-DD options. */
const buildDateOptions = (count: number): string[] => {
  const options: string[] = [];
  const today = new Date();
  for (let index = 0; index < count; index += 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    options.push(`${date.getFullYear()}-${month}-${day}`);
  }
  return options;
};

const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, '0');
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${hours}:${minutes}`;
});

interface EventDateTimeFieldsProps {
  values: Pick<
    CreateEventFormState,
    'eventDate' | 'startTime' | 'endDate' | 'endTime' | 'allDay'
  >;
  errors: CreateEventFieldErrors;
  onChangeField: <K extends keyof CreateEventFormState>(field: K, value: CreateEventFormState[K]) => void;
}

export const EventDateTimeFields: React.FC<EventDateTimeFieldsProps> = ({
  values,
  errors,
  onChangeField,
}) => {
  const [picker, setPicker] = useState<
    | { type: 'date'; field: 'eventDate' | 'endDate'; title: string }
    | { type: 'time'; field: 'startTime' | 'endTime'; title: string }
    | null
  >(null);

  const dateOptions = useMemo(() => buildDateOptions(60), []);

  const pickerVisible = picker !== null;
  const pickerOptions = useMemo(() => {
    if (!picker) {
      return [];
    }
    return picker.type === 'date' ? dateOptions : TIME_OPTIONS;
  }, [picker, dateOptions]);

  const displayValue = (value: string | null, type: 'date' | 'time'): string => {
    if (!value) {
      return '';
    }
    return type === 'date' ? formatDate(value) : formatTimeLabel(value);
  };

  const renderPickerField = (
    field: 'eventDate' | 'endDate' | 'startTime' | 'endTime',
    label: string,
    type: 'date' | 'time',
  ) => {
    const value = values[field];

    return (
      <View style={styles.fieldHalf}>
        <EventFormField label={label} required error={errors[field]}>
          <TouchableOpacity
            style={[styles.pickerField, values.allDay && !pickerVisible ? styles.pickerFieldDisabled : null]}
            disabled={values.allDay}
            onPress={() =>
              setPicker(
                type === 'date'
                  ? { type: 'date', field: field as 'eventDate' | 'endDate', title: label }
                  : { type: 'time', field: field as 'startTime' | 'endTime', title: label },
              )
            }
            accessibilityRole="button"
            accessibilityState={{ disabled: values.allDay }}
            accessibilityLabel={label}
          >
            <Text style={styles.pickerIcon}>{type === 'date' ? '📅' : '🕐'}</Text>
            <Text
              style={[styles.pickerValue, !value && styles.pickerPlaceholder]}
              numberOfLines={1}
            >
              {displayValue(value, type) || (type === 'date' ? 'Select event date' : 'Select time')}
            </Text>
          </TouchableOpacity>
        </EventFormField>
      </View>
    );
  };

  return (
    <View>
      <View style={styles.gridRow}>
        {renderPickerField('eventDate', 'Event Date', 'date')}
        {renderPickerField('startTime', 'Start Time', 'time')}
      </View>
      <View style={styles.gridRow}>
        {renderPickerField('endDate', 'End Date', 'date')}
        {renderPickerField('endTime', 'End Time', 'time')}
      </View>

      <View style={styles.allDayCard}>
        <View style={styles.allDayText}>
          <Text style={styles.allDayTitle}>All Day Event</Text>
          <Text style={styles.allDaySubtitle}>Event will be marked as full day</Text>
        </View>
        <Switch
          value={values.allDay}
          onValueChange={value => onChangeField('allDay', value)}
          trackColor={{ true: AdminColors.primary, false: AdminColors.border }}
          thumbColor={AdminColors.cardSurface}
          accessibilityLabel="All Day Event"
        />
      </View>

      <EventPickerSheet
        visible={pickerVisible}
        title={picker?.title ?? ''}
        options={pickerOptions}
        selected={picker ? values[picker.field] : null}
        itemLabel={value =>
          picker && picker.type === 'date' ? formatDate(value) : formatTimeLabel(value)
        }
        onSelect={value => {
          if (picker) {
            onChangeField(picker.field, value);
          }
        }}
        onClose={() => setPicker(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fieldHalf: {
    flex: 1,
  },
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  pickerFieldDisabled: {
    opacity: 0.5,
  },
  pickerIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  pickerValue: {
    ...Typography.body,
    color: AdminColors.textPrimary,
    flexShrink: 1,
  },
  pickerPlaceholder: {
    color: AdminColors.textMuted,
  },
  allDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AdminColors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  allDayText: {
    flex: 1,
    minWidth: 0,
  },
  allDayTitle: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  allDaySubtitle: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
});