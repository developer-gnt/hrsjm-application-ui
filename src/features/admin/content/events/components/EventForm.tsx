import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import { DatePickerModal } from '../../../../../core/components/common/DatePickerModal';
import { Calendar, Clock, MapPin } from '../../../../../core/components/icons';
import { formatDate } from '../../../../../core/utils';
import { EventFormField } from './EventFormField';
import { EventImagePicker } from './EventImagePicker';
import { EventPickerSheet } from './EventPickerSheet';
import { EventFormToast } from './EventFormToast';
import type {
  CreateEventFieldErrors,
  CreateEventFormState,
  EventListItem,
} from '../types/events.types';
import { useCreateEvent, useUpdateEvent } from '../hooks/useEvents';

/** How long the success toast stays before navigating back. */
const SUCCESS_REDIRECT_MS = 1400;

/** Time interval options (every 30 minutes). */
const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, '0');
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${hours}:${minutes}`;
});

/** Formats "14:30" to "02:30 PM". */
const formatTimeLabel = (hhmm: string): string => {
  if (!hhmm) return '';
  const parts = hhmm.split(':');
  if (parts.length < 2) return hhmm;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return hhmm;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

/** Empty form used as the Create Event starting point. */
export const EMPTY_EVENT_FORM: CreateEventFormState = {
  title: '',
  description: '',
  coverImageUri: null,
  category: 'Community',
  eventType: 'IN_PERSON',
  eventDate: null,
  startTime: null,
  endDate: null,
  endTime: null,
  allDay: false,
  location: '',
  address: '',
  registrationRequired: false,
  totalSeats: '100',
  perPersonLimit: '1',
  organizedBy: 'HRSJM Mission',
  targetAudience: null,
  language: null,
  shortInformation: '',
  tags: [],
  status: 'PUBLISH',
};

/**
 * Validates fields according to the approved Create Event wireframe & backend requirements.
 */
const validateForm = (form: CreateEventFormState): CreateEventFieldErrors => {
  const errors: CreateEventFieldErrors = {};

  if (!form.title.trim()) {
    errors.title = 'Event title is required';
  }
  if (!form.description.trim()) {
    errors.description = 'Description is required';
  }
  if (!form.coverImageUri) {
    errors.coverImageUri = 'Cover image is required';
  }
  if (!form.eventDate) {
    errors.eventDate = 'Event date is required';
  }
  if (!form.startTime) {
    errors.startTime = 'Start time is required';
  }
  if (!form.endTime) {
    errors.endTime = 'End time is required';
  }
  if (form.startTime && form.endTime && form.endTime <= form.startTime) {
    errors.endTime = 'End time must be after start time';
  }
  if (!form.location.trim()) {
    errors.location = 'Event location is required';
  }

  return errors;
};

export type EventFormMode = 'create' | 'edit';

interface EventFormProps {
  mode: EventFormMode;
  /** Existing event ID when in edit mode. */
  eventId?: string;
  /** Header bar + page title ("Create Event" / "Edit Event"). */
  title: string;
  /** Page subtitle under the title. */
  subtitle: string;
  /** Starting field values. */
  initialForm: CreateEventFormState;
  /** Primary action label ("Create Event" / "Save Changes"). */
  saveLabel: string;
  /** Label of the description field (defaults to 'Description'). */
  descriptionLabel?: string;
  /** Screen the back arrow returns to. */
  backDestination?: string;
  /** Leave the screen. */
  onCancel: () => void;
  /** Edit mode only: fired after save completes. */
  onSaved?: (updatedEvent?: EventListItem) => void;
}

/**
 * Create/Edit Event form strictly reproducing the approved wireframe.
 */
export const EventForm: React.FC<EventFormProps> = ({
  mode,
  eventId,
  title,
  subtitle,
  initialForm,
  saveLabel,
  descriptionLabel = 'Description',
  onCancel,
  onSaved,
}) => {
  const [form, setForm] = useState<CreateEventFormState>(initialForm);
  const [errors, setErrors] = useState<CreateEventFieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  // Pickers state
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [startTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [endTimePickerVisible, setEndTimePickerVisible] = useState(false);

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const isSaving = createEventMutation.isPending || updateEventMutation.isPending;

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm],
  );

  const completingRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    },
    [],
  );

  const updateField = <K extends keyof CreateEventFormState>(
    field: K,
    value: CreateEventFormState[K],
  ) => {
    setForm(previous => ({ ...previous, [field]: value }));
    if (submitted && errors[field]) {
      setErrors(previous => {
        const next = { ...previous };
        delete next[field];
        return next;
      });
    }
  };

  const discardDialogVisibleRef = useRef(false);

  const requestCancel = () => {
    if (discardDialogVisibleRef.current) return;
    if (completingRef.current || !isDirty) {
      onCancel();
      return;
    }
    discardDialogVisibleRef.current = true;
    Alert.alert('Discard changes?', 'You have unsaved changes. Leave without saving?', [
      {
        text: 'Keep Editing',
        style: 'cancel',
        onPress: () => {
          discardDialogVisibleRef.current = false;
        },
      },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          discardDialogVisibleRef.current = false;
          onCancel();
        },
      },
    ]);
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      requestCancel();
      return true;
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, onCancel]);

  const handleSave = async () => {
    if (completingRef.current || isSaving) return;
    setSubmitted(true);
    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setToast({ message: 'Please fill in all required fields.', variant: 'error' });
      return;
    }

    try {
      if (mode === 'edit' && eventId) {
        await updateEventMutation.mutateAsync({ id: eventId, form });
        completingRef.current = true;
        setToast({ message: 'Event updated successfully.', variant: 'success' });
        redirectTimerRef.current = setTimeout(() => {
          if (onSaved) onSaved();
          else onCancel();
        }, SUCCESS_REDIRECT_MS);
      } else {
        await createEventMutation.mutateAsync(form);
        completingRef.current = true;
        setToast({ message: 'Event created successfully.', variant: 'success' });
        redirectTimerRef.current = setTimeout(onCancel, SUCCESS_REDIRECT_MS);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save event. Please check required fields and try again.';
      setToast({
        message: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg,
        variant: 'error',
      });
    }
  };

  return (
    <View style={styles.root}>
      {/* 1. Shared Header */}
      <AdminHeader showBack title={title} onBack={requestCancel} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 2. Page Introduction */}
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>{title}</Text>
              <Text style={styles.pageSubtitle}>{subtitle}</Text>
            </View>

            {/* 3. Section 1: Basic Information */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Basic Information</Text>

              <EventFormField label="Event Title" required error={errors.title}>
                <TextInput
                  value={form.title}
                  onChangeText={value => updateField('title', value)}
                  placeholder="Enter event title"
                  placeholderTextColor="#94A3B8"
                  style={[styles.input, errors.title ? styles.inputError : null]}
                  accessibilityLabel="Event Title"
                />
              </EventFormField>

              <EventFormField label={descriptionLabel} required error={errors.description}>
                <TextInput
                  value={form.description}
                  onChangeText={value => updateField('description', value)}
                  placeholder="Write event description..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  style={[styles.textArea, errors.description ? styles.inputError : null]}
                  accessibilityLabel="Description"
                />
              </EventFormField>
            </View>

            {/* 4. Section 2: Event Image */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Event Image</Text>

              <EventFormField label="Cover Image" required error={errors.coverImageUri}>
                <EventImagePicker
                  value={form.coverImageUri}
                  error={errors.coverImageUri}
                  onChange={value => updateField('coverImageUri', value)}
                />
              </EventFormField>
            </View>

            {/* 5. Section 3: Event Details */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Event Details</Text>

              {/* Event Date */}
              <EventFormField label="Event Date" required error={errors.eventDate}>
                <TouchableOpacity
                  style={[styles.inputWithIcon, errors.eventDate ? styles.inputError : null]}
                  onPress={() => setDatePickerVisible(true)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Select event date"
                >
                  <Calendar size={18} color="#94A3B8" strokeWidth={2} style={styles.leadingIcon} />
                  <Text style={form.eventDate ? styles.inputValue : styles.inputPlaceholder}>
                    {form.eventDate ? formatDate(form.eventDate) : 'Select event date'}
                  </Text>
                </TouchableOpacity>
              </EventFormField>

              {/* Start Time & End Time in 2-column row */}
              <View style={styles.twoColumnRow}>
                <View style={styles.columnHalf}>
                  <EventFormField label="Start Time" required error={errors.startTime}>
                    <TouchableOpacity
                      style={[styles.inputWithIcon, errors.startTime ? styles.inputError : null]}
                      onPress={() => setStartTimePickerVisible(true)}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityLabel="Select start time"
                    >
                      <Clock size={18} color="#94A3B8" strokeWidth={2} style={styles.leadingIcon} />
                      <Text
                        style={form.startTime ? styles.inputValue : styles.inputPlaceholder}
                        numberOfLines={1}
                      >
                        {form.startTime ? formatTimeLabel(form.startTime) : 'Select start time'}
                      </Text>
                    </TouchableOpacity>
                  </EventFormField>
                </View>

                <View style={styles.columnHalf}>
                  <EventFormField label="End Time" required error={errors.endTime}>
                    <TouchableOpacity
                      style={[styles.inputWithIcon, errors.endTime ? styles.inputError : null]}
                      onPress={() => setEndTimePickerVisible(true)}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityLabel="Select end time"
                    >
                      <Clock size={18} color="#94A3B8" strokeWidth={2} style={styles.leadingIcon} />
                      <Text
                        style={form.endTime ? styles.inputValue : styles.inputPlaceholder}
                        numberOfLines={1}
                      >
                        {form.endTime ? formatTimeLabel(form.endTime) : 'Select end time'}
                      </Text>
                    </TouchableOpacity>
                  </EventFormField>
                </View>
              </View>

              {/* Event Location */}
              <EventFormField label="Event Location" required error={errors.location}>
                <View style={[styles.inputWithIcon, errors.location ? styles.inputError : null]}>
                  <MapPin size={18} color="#94A3B8" strokeWidth={2} style={styles.leadingIcon} />
                  <TextInput
                    value={form.location}
                    onChangeText={value => updateField('location', value)}
                    placeholder="Enter event location"
                    placeholderTextColor="#94A3B8"
                    style={styles.inlineInput}
                    accessibilityLabel="Event Location"
                  />
                </View>
              </EventFormField>
            </View>

            {/* 6. Form Submission Action */}
            <View style={styles.submitSection}>
              <TouchableOpacity
                style={[styles.submitButton, isSaving ? styles.submitButtonDisabled : null]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={mode === 'edit' ? saveLabel || 'Save Changes' : 'Create Event'}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#06294D" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {mode === 'edit' ? saveLabel || 'Save Changes' : 'Create Event'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        value={form.eventDate || ''}
        onSelect={date => {
          updateField('eventDate', date);
          updateField('endDate', date);
          setDatePickerVisible(false);
        }}
        onClose={() => setDatePickerVisible(false)}
      />

      {/* Start Time Picker Sheet */}
      <EventPickerSheet
        visible={startTimePickerVisible}
        title="Select Start Time"
        options={TIME_OPTIONS}
        selected={form.startTime}
        itemLabel={formatTimeLabel}
        onSelect={value => updateField('startTime', value)}
        onClose={() => setStartTimePickerVisible(false)}
      />

      {/* End Time Picker Sheet */}
      <EventPickerSheet
        visible={endTimePickerVisible}
        title="Select End Time"
        options={TIME_OPTIONS}
        selected={form.endTime}
        itemLabel={formatTimeLabel}
        onSelect={value => updateField('endTime', value)}
        onClose={() => setEndTimePickerVisible(false)}
      />

      {/* Success/Error Toast */}
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
    backgroundColor: '#FAF7F0',
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 130, // Generous padding so content and button clear the bottom navigation!
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#06294D',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13.5,
    color: '#718096',
    lineHeight: 18,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06294D',
    marginBottom: 14,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0B2F52',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#0B2F52',
    backgroundColor: '#FFFFFF',
  },
  inputWithIcon: {
    height: 46,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  leadingIcon: {
    marginRight: 10,
  },
  inlineInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0B2F52',
    paddingVertical: 0,
  },
  inputPlaceholder: {
    fontSize: 14,
    color: '#94A3B8',
  },
  inputValue: {
    fontSize: 14,
    color: '#0B2F52',
    fontWeight: '500',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  columnHalf: {
    flex: 1,
  },
  submitSection: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#FAD465',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: '#06294D',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default EventForm;
