import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import { DatePickerModal } from '../../../../../core/components/common/DatePickerModal';
import {
  Calendar,
  Clock,
  Heart,
  Info,
  MapPin,
  Users,
  ChevronDown,
} from '../../../../../core/components/icons';
import { formatDate } from '../../../../../core/utils';
import { EventFormField } from './EventFormField';
import { EventImagePicker } from './EventImagePicker';
import { EventPickerSheet } from './EventPickerSheet';
import { EventTagInput } from './EventTagInput';
import { EventFormToast } from './EventFormToast';
import type {
  CreateEventFieldErrors,
  CreateEventFormState,
  EventListItem,
} from '../types/events.types';
import { useCreateEvent, useUpdateEvent } from '../hooks/useEvents';

/** How long the success toast stays before navigating back. */
const SUCCESS_REDIRECT_MS = 1400;

/** Category choices for events matching HRSJM activities */
const CATEGORY_OPTIONS: string[] = [
  'Seminar',
  'Workshop',
  'Awareness Camp',
  'Health Camp',
  'Relief Activity',
  'Legal Awareness',
  'Community',
  'Youth Convention',
  'Education',
];

/** Event formats */
const EVENT_TYPE_OPTIONS: string[] = ['IN_PERSON', 'ONLINE', 'HYBRID'];
const formatEventTypeLabel = (type: string): string => {
  switch (type) {
    case 'IN_PERSON':
      return 'In-Person (Offline)';
    case 'ONLINE':
      return 'Online (Virtual)';
    case 'HYBRID':
      return 'Hybrid';
    default:
      return type || 'In-Person (Offline)';
  }
};

/** Target audiences */
const TARGET_AUDIENCE_OPTIONS: string[] = [
  'Open to All',
  'Students & Youth',
  'Women & Children',
  'Senior Citizens',
  'Volunteers & Social Workers',
  'General Public',
];

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
  category: 'Seminar',
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
  targetAudience: 'Open to All',
  language: 'English, Hindi',
  shortInformation: '',
  tags: [],
  status: 'PUBLISH',
  isDonationEnabled: false,
  donationMessage: '',
};

/**
 * Validates fields according to the approved Create Event requirements.
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
  if (!form.category) {
    errors.category = 'Category is required';
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
    errors.location = 'City / Area location is required';
  }

  return errors;
};

export type EventFormMode = 'create' | 'edit';

interface EventFormProps {
  mode: EventFormMode;
  /** Edit mode only: existing event id. */
  eventId?: string;
  /** Top header title ("Create Event" / "Edit Event"). */
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
 * Create/Edit Event form strictly capturing all event details displayed across the app.
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
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [eventTypePickerVisible, setEventTypePickerVisible] = useState(false);
  const [audiencePickerVisible, setAudiencePickerVisible] = useState(false);

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
            keyboardDismissMode="on-drag"
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

              {/* Event Category Picker */}
              <EventFormField label="Event Category" required error={errors.category}>
                <TouchableOpacity
                  style={[styles.inputWithIcon, errors.category ? styles.inputError : null]}
                  onPress={() => setCategoryPickerVisible(true)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Select event category"
                >
                  <Text
                    style={form.category ? styles.inputValue : styles.inputPlaceholder}
                    numberOfLines={1}
                  >
                    {form.category || 'Select category (Seminar, Workshop, Camp...)'}
                  </Text>
                  <ChevronDown size={18} color="#64748B" />
                </TouchableOpacity>
              </EventFormField>

              {/* Short Summary / Subtitle */}
              <EventFormField label="Short Summary / Subtitle" optionalHint>
                <TextInput
                  value={form.shortInformation}
                  onChangeText={value => updateField('shortInformation', value)}
                  placeholder="Short 1-line subtitle shown on cards (e.g. Interactive legal workshop...)"
                  placeholderTextColor="#94A3B8"
                  maxLength={500}
                  style={styles.input}
                  accessibilityLabel="Short Summary"
                />
              </EventFormField>

              {/* Full Description */}
              <EventFormField label={descriptionLabel} required error={errors.description}>
                <TextInput
                  value={form.description}
                  onChangeText={value => updateField('description', value)}
                  placeholder="Write full event details, agenda, and background..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  style={[styles.textArea, errors.description ? styles.inputError : null]}
                  accessibilityLabel="Description"
                />
              </EventFormField>
            </View>

            {/* Section 2: Event Image */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Event Image</Text>
              <Text style={styles.cardSubtitle}>
                Upload high quality cover image from device, camera, or choose from presets.
              </Text>

              <EventFormField label="Cover Image" required error={errors.coverImageUri}>
                <EventImagePicker
                  value={form.coverImageUri}
                  error={errors.coverImageUri}
                  onChange={value => updateField('coverImageUri', value)}
                />
              </EventFormField>
            </View>

            {/* Section 3: Ask for Donation */}
            <View style={styles.card}>
              <View style={styles.donationHeaderBox}>
                <View style={styles.donationIconBox}>
                  <Heart size={22} color="#D97706" fill="#FDE68A" strokeWidth={2} />
                </View>
                <View style={styles.donationHeaderTextWrap}>
                  <Text style={styles.donationTitle}>Ask for Donation</Text>
                  <Text style={styles.donationSubtitle}>
                    Allow users to support this event with a voluntary donation.
                  </Text>
                </View>
                <Switch
                  value={form.isDonationEnabled}
                  onValueChange={val => {
                    updateField('isDonationEnabled', val);
                    if (!val) {
                      updateField('donationMessage', '');
                    }
                  }}
                  trackColor={{ false: '#DCE4EC', true: '#011F39' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#DCE4EC"
                  accessibilityLabel="Ask for Donation Toggle"
                />
              </View>

              {form.isDonationEnabled ? (
                <View style={styles.donationMessageContainer}>
                  <Text style={styles.donationFieldLabel}>Donation Message (Optional)</Text>
                  <TextInput
                    value={form.donationMessage}
                    onChangeText={text => updateField('donationMessage', text.slice(0, 200))}
                    placeholder="Add a short message about why donations are needed for this event..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    maxLength={200}
                    textAlignVertical="top"
                    style={styles.donationTextArea}
                    accessibilityLabel="Donation Message (Optional)"
                  />
                  <View style={styles.charCountRow}>
                    <Text style={styles.charCountText}>
                      {form.donationMessage ? form.donationMessage.length : 0}/200
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.donationInfoBox}>
                <Info size={16} color="#0B2F52" strokeWidth={2} />
                <Text style={styles.donationInfoText}>
                  Users can choose any amount they wish to donate.
                </Text>
              </View>
            </View>

            {/* Section 4: Date & Time */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Date &amp; Time</Text>

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
            </View>

            {/* 6. Section 4: Location & Venue */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Location &amp; Venue</Text>

              {/* City / Area Location */}
              <EventFormField label="City / Area Location" required error={errors.location}>
                <View style={[styles.inputWithIcon, errors.location ? styles.inputError : null]}>
                  <MapPin size={18} color="#94A3B8" strokeWidth={2} style={styles.leadingIcon} />
                  <TextInput
                    value={form.location}
                    onChangeText={value => updateField('location', value)}
                    placeholder="e.g. Kurla, Mumbai"
                    placeholderTextColor="#94A3B8"
                    style={styles.inlineInput}
                    accessibilityLabel="City / Area Location"
                  />
                </View>
              </EventFormField>

              {/* Full Venue / Address */}
              <EventFormField label="Venue / Detailed Address" optionalHint>
                <View style={styles.inputWithIcon}>
                  <MapPin size={18} color="#94A3B8" strokeWidth={2} style={styles.leadingIcon} />
                  <TextInput
                    value={form.address}
                    onChangeText={value => updateField('address', value)}
                    placeholder="e.g. Community Hall, Near Kurla Station West, Mumbai 400070"
                    placeholderTextColor="#94A3B8"
                    style={styles.inlineInput}
                    accessibilityLabel="Venue / Detailed Address"
                  />
                </View>
              </EventFormField>
            </View>

            {/* Section 5: Organizer & Specifications */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Organizer &amp; Specifications</Text>

              {/* Organized By */}
              <EventFormField label="Organized By" optionalHint>
                <View style={styles.inputWithIcon}>
                  <Users size={18} color="#94A3B8" strokeWidth={2} style={styles.leadingIcon} />
                  <TextInput
                    value={form.organizedBy}
                    onChangeText={value => updateField('organizedBy', value)}
                    placeholder="e.g. HRSJM Awareness Team"
                    placeholderTextColor="#94A3B8"
                    style={styles.inlineInput}
                    accessibilityLabel="Organized By"
                  />
                </View>
              </EventFormField>

              {/* Two Column: Format + Target Audience */}
              <View style={styles.twoColumnRow}>
                <View style={styles.columnHalf}>
                  <EventFormField label="Event Format">
                    <TouchableOpacity
                      style={styles.inputWithIcon}
                      onPress={() => setEventTypePickerVisible(true)}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                    >
                      <Text style={styles.inputValue} numberOfLines={1}>
                        {formatEventTypeLabel(form.eventType || 'IN_PERSON')}
                      </Text>
                      <ChevronDown size={18} color="#64748B" />
                    </TouchableOpacity>
                  </EventFormField>
                </View>

                <View style={styles.columnHalf}>
                  <EventFormField label="Target Audience">
                    <TouchableOpacity
                      style={styles.inputWithIcon}
                      onPress={() => setAudiencePickerVisible(true)}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                    >
                      <Text style={styles.inputValue} numberOfLines={1}>
                        {form.targetAudience || 'Open to All'}
                      </Text>
                      <ChevronDown size={18} color="#64748B" />
                    </TouchableOpacity>
                  </EventFormField>
                </View>
              </View>
            </View>

            {/* Section 6: Key Topics */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Key Topics</Text>
              <Text style={styles.cardSubtitle}>
                Add key topics displayed with checkmarks on the event details page.
              </Text>
              <EventTagInput
                tags={form.tags}
                onChange={tags => updateField('tags', tags)}
                placeholder="Add topic and press enter..."
                helperText="e.g. Community Engagement, Legal Awareness & Protection, Fundamental Rights"
                maxTags={8}
              />
            </View>

            {/* Section 7: Registration & Entry */}
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>Registration Required</Text>
                  <Text style={styles.switchSubtitle}>
                    {form.registrationRequired
                      ? 'Attendees must register to attend this event'
                      : 'Free Entry — Open to all attendees without prior registration'}
                  </Text>
                </View>
                <Switch
                  value={form.registrationRequired}
                  onValueChange={val => updateField('registrationRequired', val)}
                  trackColor={{ true: '#06294D', false: '#DCE4EC' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {form.registrationRequired ? (
                <View style={{ marginTop: 14 }}>
                  <EventFormField label="Total Seating Capacity">
                    <TextInput
                      value={form.totalSeats}
                      onChangeText={value =>
                        updateField('totalSeats', value.replace(/[^0-9]/g, ''))
                      }
                      placeholder="e.g. 100"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      style={styles.input}
                      accessibilityLabel="Total Seats"
                    />
                  </EventFormField>
                </View>
              ) : null}
            </View>

            {/* Form Submission Action */}
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
                  <ActivityIndicator size="small" color="#011F39" />
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

      {/* Category Picker Sheet */}
      <EventPickerSheet
        visible={categoryPickerVisible}
        title="Select Event Category"
        options={CATEGORY_OPTIONS}
        selected={form.category}
        onSelect={value => updateField('category', value)}
        onClose={() => setCategoryPickerVisible(false)}
      />

      {/* Event Type Picker Sheet */}
      <EventPickerSheet
        visible={eventTypePickerVisible}
        title="Select Event Format"
        options={EVENT_TYPE_OPTIONS}
        selected={form.eventType}
        itemLabel={formatEventTypeLabel}
        onSelect={value => updateField('eventType', value)}
        onClose={() => setEventTypePickerVisible(false)}
      />

      {/* Target Audience Picker Sheet */}
      <EventPickerSheet
        visible={audiencePickerVisible}
        title="Select Target Audience"
        options={TARGET_AUDIENCE_OPTIONS}
        selected={form.targetAudience}
        onSelect={value => updateField('targetAudience', value)}
        onClose={() => setAudiencePickerVisible(false)}
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
    paddingBottom: 130,
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
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 17,
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
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  columnHalf: {
    flex: 1,
  },
  inputWithIcon: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  leadingIcon: {
    marginRight: 8,
  },
  inlineInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0B2F52',
    padding: 0,
  },
  inputValue: {
    fontSize: 14,
    color: '#0B2F52',
    fontWeight: '500',
    flex: 1,
  },
  inputPlaceholder: {
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchTextCol: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#06294D',
    marginBottom: 2,
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  submitSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  submitButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#011F39',
  },
  donationHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
  },
  donationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  donationHeaderTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#011F39',
  },
  donationSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 2,
  },
  donationMessageContainer: {
    marginTop: 14,
  },
  donationFieldLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0B2F52',
    marginBottom: 6,
  },
  donationTextArea: {
    height: 96,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#0B2F52',
    backgroundColor: '#FFFFFF',
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  charCountText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  donationInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 10,
  },
  donationInfoText: {
    fontSize: 12.5,
    color: '#0B2F52',
    fontWeight: '500',
    flex: 1,
  },
});
