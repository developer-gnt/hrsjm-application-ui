import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import { AppButton, AppInput } from '../../../../../core/components';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import { EventFormField } from './EventFormField';
import { EventFormSection } from './EventFormSection';
import { EventPickerSheet } from './EventPickerSheet';
import { EventSelectField } from './EventSelectField';
import { EventImagePicker } from './EventImagePicker';
import { EventTagInput } from './EventTagInput';
import { EventFormToast } from './EventFormToast';
import { EventDateTimeFields } from './EventDateTimeFields';
import { EventLocationFields } from './EventLocationFields';
import { EventRegistrationFields } from './EventRegistrationFields';
import {
  SAMPLE_EVENT_CATEGORIES,
  SAMPLE_EVENT_TYPE_OPTIONS,
  SAMPLE_LANGUAGE_OPTIONS,
  SAMPLE_TARGET_AUDIENCE_OPTIONS,
} from '../data/sample-events';
import type {
  CreateEventFieldErrors,
  CreateEventFormState,
} from '../types/events.types';
import { useCreateEvent, useUpdateEvent } from '../hooks/useEvents';

/** How long the edit-mode success toast stays before returning to Event Details. */
const EDIT_SUCCESS_REDIRECT_MS = 1800;

const SHORT_INFO_MAX_LENGTH = 200;

/** Empty form used as the Create Event starting point and dirty-state baseline. */
export const EMPTY_EVENT_FORM: CreateEventFormState = {
  title: '',
  description: '',
  coverImageUri: null,
  category: null,
  eventType: null,
  eventDate: null,
  startTime: null,
  endDate: null,
  endTime: null,
  allDay: false,
  location: '',
  address: '',
  registrationRequired: true,
  totalSeats: '',
  perPersonLimit: '1',
  organizedBy: '',
  targetAudience: null,
  language: null,
  shortInformation: '',
  tags: [],
  status: 'DRAFT',
};

/**
 * Local frontend validation for fields marked required in the PRD.
 * Backend validation remains authoritative once the contract exists — these
 * rules are intentionally limited to the PRD's frontend list. Shared by the
 * Create Event and Edit Event screens.
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
  if (!form.eventType) {
    errors.eventType = 'Event type is required';
  }
  if (!form.eventDate) {
    errors.eventDate = 'Event date is required';
  }
  if (!form.endDate) {
    errors.endDate = 'End date is required';
  }
  if (!form.allDay) {
    if (!form.startTime) {
      errors.startTime = 'Start time is required';
    }
    if (!form.endTime) {
      errors.endTime = 'End time is required';
    }
    if (form.eventDate && form.endDate && form.eventDate === form.endDate) {
      if (form.startTime && form.endTime && form.endTime < form.startTime) {
        errors.endTime = 'End time must be after start time';
      }
    }
  }
  if (form.eventDate && form.endDate && form.endDate < form.eventDate) {
    errors.endDate = 'End date cannot be before the event date';
  }
  if (!form.location.trim()) {
    errors.location = 'Location is required';
  }
  if (form.registrationRequired) {
    const seats = Number(form.totalSeats);
    if (!form.totalSeats.trim()) {
      errors.totalSeats = 'Total seats is required';
    } else if (!Number.isInteger(seats) || seats <= 0) {
      errors.totalSeats = 'Enter a valid number of seats';
    }
  }
  return errors;
};

interface EventFormPreviewHeaderProps {
  title: string;
  /** Screen the back arrow returns to, for the accessibility label. */
  backDestination: string;
  onBack: () => void;
}

/**
 * TEMPORARY PREVIEW COMPONENT — NOT THE REAL GLOBAL HEADER.
 *
 * Reproduces the HRSJM Admin app-shell header (back / title / bell / avatar)
 * from the reference design so the event form screens can be reviewed in
 * context. The real global header, navigation and branding assets are owned
 * by the app-level architecture (Mubasshir) and will replace this file.
 *
 * DELETE THIS FILE when the real Admin shell is integrated.
 */
const EventFormPreviewHeader: React.FC<EventFormPreviewHeaderProps> = ({
  title,
  backDestination,
  onBack,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.previewHeader,
        { paddingTop: Math.max(insets.top, Spacing.sm) },
      ]}
    >
      <TouchableOpacity
        style={styles.previewBackButton}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={`Go back to ${backDestination}`}
      >
        <Text style={styles.previewBackIcon}>←</Text>
      </TouchableOpacity>
      <Text style={styles.previewTitle}>{title}</Text>

      <View style={styles.previewRight}>
        <Text style={styles.previewBell}>🔔</Text>
        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeText}>3</Text>
        </View>
        <View style={styles.previewAvatar}>
          <Text style={styles.previewAvatarText}>AD</Text>
        </View>
      </View>
    </View>
  );
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
  /** Starting field values; also the baseline for dirty-state detection. */
  initialForm: CreateEventFormState;
  /** Primary action label ("Save Event" / "Save Changes"). */
  saveLabel: string;
  /** Label of the description field (create: "Description", edit reference: "Short Description"). */
  descriptionLabel?: string;
  /** Screen the back arrow returns to, for the accessibility label. */
  backDestination: string;
  /** Leave the screen (after confirmation when the form is dirty). */
  onCancel: () => void;
  /** Edit mode only: fired after the validated-save toast so the host can navigate back. */
  onSaved?: () => void;
}

/**
 * Shared Create/Edit Event form connected to the HRSJM Events API.
 */
export const EventForm: React.FC<EventFormProps> = ({
  mode,
  eventId,
  title,
  subtitle,
  initialForm,
  saveLabel,
  descriptionLabel = 'Description',
  backDestination,
  onCancel,
  onSaved,
}) => {
  const [form, setForm] = useState<CreateEventFormState>(initialForm);
  const [errors, setErrors] = useState<CreateEventFieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const isSaving = createEventMutation.isPending || updateEventMutation.isPending;

  // Picker visibility
  const [categoryPicker, setCategoryPicker] = useState(false);
  const [typePicker, setTypePicker] = useState(false);
  const [audiencePicker, setAudiencePicker] = useState(false);
  const [languagePicker, setLanguagePicker] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm],
  );

  // True once a validated save has started the return to Event Details
  // (edit mode): further save presses and cancel confirmations are no-ops.
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
    // Clear the field error as soon as the user edits it after a failed submit.
    if (submitted && errors[field]) {
      setErrors(previous => {
        const next = { ...previous };
        delete next[field];
        return next;
      });
    }
  };

  // Guards against stacking "Discard changes?" dialogs: while one is visible,
  // further hardware-back presses do nothing until the user resolves it.
  const discardDialogVisibleRef = useRef(false);

  // Android hardware back: confirm before leaving with unsaved changes.
  const requestCancel = () => {
    if (discardDialogVisibleRef.current) {
      return;
    }
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
    if (completingRef.current || isSaving) {
      return;
    }
    setSubmitted(true);
    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setToast({ message: 'Please fix the highlighted fields.', variant: 'error' });
      return;
    }

    try {
      if (mode === 'edit' && eventId) {
        await updateEventMutation.mutateAsync({ id: eventId, form });
        completingRef.current = true;
        setToast({
          message: 'Event updated successfully.',
          variant: 'success',
        });
        redirectTimerRef.current = setTimeout(() => {
          if (onSaved) onSaved();
          else onCancel();
        }, EDIT_SUCCESS_REDIRECT_MS);
      } else {
        await createEventMutation.mutateAsync(form);
        completingRef.current = true;
        setToast({
          message: `Event ${form.status === 'DRAFT' ? 'saved as draft' : 'published'} successfully.`,
          variant: 'success',
        });
        redirectTimerRef.current = setTimeout(onCancel, EDIT_SUCCESS_REDIRECT_MS);
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
            {/* Page title block */}
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>{title}</Text>
              <Text style={styles.pageSubtitle}>{subtitle}</Text>
            </View>

            {/* 1. Basic Information */}
            <EventFormSection title="Basic Information">
              <EventFormField label="Event Title" required>
                <AppInput
                  value={form.title}
                  onChangeText={value => updateField('title', value)}
                  placeholder="Enter event title"
                  error={errors.title}
                  accessibilityLabel="Event Title"
                />
              </EventFormField>

              <EventFormField label={descriptionLabel} required>
                <TextInput
                  value={form.description}
                  onChangeText={value => updateField('description', value)}
                  placeholder="Write event description..."
                  placeholderTextColor={AdminColors.textMuted}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.textArea,
                    errors.description ? styles.textAreaError : null,
                  ]}
                  accessibilityLabel={descriptionLabel}
                />
                <View style={styles.richToolbar}>
                  {['B', 'I', 'U', '⋮≡', '🔗'].map((glyph, index) => (
                    <TouchableOpacity
                      key={glyph}
                      style={styles.richToolButton}
                      disabled
                      accessibilityRole="button"
                      accessibilityLabel={['Bold', 'Italic', 'Underline', 'List', 'Link'][index]}
                    >
                      <Text style={styles.richToolIcon}>{glyph}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.description ? (
                  <Text style={styles.fieldError}>{errors.description}</Text>
                ) : null}
              </EventFormField>

              <EventFormField label="Cover Image" required>
                <EventImagePicker
                  value={form.coverImageUri}
                  error={errors.coverImageUri}
                  onChange={value => updateField('coverImageUri', value)}
                />
                {errors.coverImageUri ? (
                  <Text style={styles.fieldError}>{errors.coverImageUri}</Text>
                ) : null}
              </EventFormField>

              <EventFormField label="Category" required>
                <EventSelectField
                  value={form.category}
                  placeholder="Select category"
                  error={Boolean(errors.category)}
                  onPress={() => setCategoryPicker(true)}
                />
                {errors.category ? (
                  <Text style={styles.fieldError}>{errors.category}</Text>
                ) : null}
              </EventFormField>

              <EventFormField label="Event Type" required>
                <EventSelectField
                  value={form.eventType}
                  placeholder="Select event type"
                  error={Boolean(errors.eventType)}
                  onPress={() => setTypePicker(true)}
                />
                {errors.eventType ? (
                  <Text style={styles.fieldError}>{errors.eventType}</Text>
                ) : null}
              </EventFormField>
            </EventFormSection>

            {/* 2. Date & Time */}
            <EventFormSection title="Date & Time">
              <EventDateTimeFields
                values={form}
                errors={errors}
                onChangeField={updateField}
              />
            </EventFormSection>

            {/* 3. Location Details */}
            <EventFormSection title="Location Details">
              <EventLocationFields
                values={form}
                errors={errors}
                onChangeField={updateField}
              />
            </EventFormSection>

            {/* 4. Registration Details */}
            <EventFormSection title="Registration Details">
              <EventRegistrationFields
                values={form}
                errors={errors}
                onToggleRegistration={value => updateField('registrationRequired', value)}
                onChangeField={updateField}
              />
            </EventFormSection>

            {/* 5. Additional Information */}
            <EventFormSection title="Additional Information">
              <EventFormField label="Organized By">
                <AppInput
                  value={form.organizedBy}
                  onChangeText={value => updateField('organizedBy', value)}
                  placeholder="Enter organizer name"
                  accessibilityLabel="Organized By"
                />
              </EventFormField>

              <View style={styles.gridRow}>
                <View style={styles.fieldHalf}>
                  <EventFormField label="Target Audience">
                    <EventSelectField
                      value={form.targetAudience}
                      placeholder="Select target audience"
                      onPress={() => setAudiencePicker(true)}
                    />
                  </EventFormField>
                </View>
                <View style={styles.fieldHalf}>
                  <EventFormField label="Language">
                    <EventSelectField
                      value={form.language}
                      placeholder="Select language"
                      onPress={() => setLanguagePicker(true)}
                    />
                  </EventFormField>
                </View>
              </View>

              <EventFormField label="Short Information" optionalHint>
                <TextInput
                  value={form.shortInformation}
                  onChangeText={value => updateField('shortInformation', value.slice(0, SHORT_INFO_MAX_LENGTH))}
                  placeholder="Add short summary for event card..."
                  placeholderTextColor={AdminColors.textMuted}
                  multiline
                  textAlignVertical="top"
                  style={styles.textArea}
                  accessibilityLabel="Short Information"
                />
                <Text style={styles.charCounter}>
                  {form.shortInformation.length}/{SHORT_INFO_MAX_LENGTH}
                </Text>
              </EventFormField>

              <EventFormField label="Tags" optionalHint>
                <EventTagInput
                  tags={form.tags}
                  onChange={value => updateField('tags', value)}
                />
              </EventFormField>
            </EventFormSection>

            {/* 6. Status */}
            <EventFormSection title="Status">
              <View style={styles.statusRow}>
                <TouchableOpacity
                  style={[
                    styles.statusCard,
                    form.status === 'DRAFT' ? styles.statusCardSelected : null,
                  ]}
                  onPress={() => updateField('status', 'DRAFT')}
                  accessibilityRole="button"
                  accessibilityState={{ selected: form.status === 'DRAFT' }}
                  accessibilityLabel="Draft"
                >
                  <Text style={styles.statusIcon}>✏️</Text>
                  <Text style={styles.statusTitle}>Draft</Text>
                  <Text style={styles.statusDescription}>Save as draft</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusCard,
                    form.status === 'PUBLISH' ? styles.statusCardSelected : null,
                  ]}
                  onPress={() => updateField('status', 'PUBLISH')}
                  accessibilityRole="button"
                  accessibilityState={{ selected: form.status === 'PUBLISH' }}
                  accessibilityLabel="Publish"
                >
                  <Text style={styles.statusIcon}>📣</Text>
                  <Text style={styles.statusTitle}>Publish</Text>
                  <Text style={styles.statusDescription}>Publish after review</Text>
                </TouchableOpacity>
              </View>
            </EventFormSection>

            {/* 7. Preview */}
            <EventFormSection title="Preview">
              <View style={styles.previewNote}>
                <Text style={styles.previewNoteIcon}>ⓘ</Text>
                <Text style={styles.previewNoteText}>
                  You can preview how this event will look to users after saving
                  as draft or publish.
                </Text>
              </View>
            </EventFormSection>

            {/* 8. Bottom Actions */}
            <View style={styles.bottomActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="md"
                onPress={requestCancel}
                disabled={isSaving}
                style={styles.bottomButton}
              />
              <AppButton
                title={saveLabel}
                variant="primary"
                size="md"
                onPress={handleSave}
                loading={isSaving}
                disabled={isSaving}
                style={styles.bottomButton}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <EventFormToast
        message={toast?.message ?? null}
        variant={toast?.variant ?? 'success'}
        onDismiss={() => setToast(null)}
      />

      <EventPickerSheet
        visible={categoryPicker}
        title="Select Category"
        hint="Demo options only — not backend values"
        options={SAMPLE_EVENT_CATEGORIES}
        selected={form.category}
        onSelect={value => updateField('category', value)}
        onClose={() => setCategoryPicker(false)}
      />
      <EventPickerSheet
        visible={typePicker}
        title="Select Event Type"
        hint="Demo options only — not backend values"
        options={SAMPLE_EVENT_TYPE_OPTIONS}
        selected={form.eventType}
        onSelect={value => updateField('eventType', value)}
        onClose={() => setTypePicker(false)}
      />
      <EventPickerSheet
        visible={audiencePicker}
        title="Select Target Audience"
        hint="Demo options only — not backend values"
        options={SAMPLE_TARGET_AUDIENCE_OPTIONS}
        selected={form.targetAudience}
        onSelect={value => updateField('targetAudience', value)}
        onClose={() => setAudiencePicker(false)}
      />
      <EventPickerSheet
        visible={languagePicker}
        title="Select Language"
        hint="Demo options only — not backend values"
        options={SAMPLE_LANGUAGE_OPTIONS}
        selected={form.language}
        onSelect={value => updateField('language', value)}
        onClose={() => setLanguagePicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AdminColors.cardSurface,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  // Temporary preview header (same shell as details screen)
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    minHeight: 54,
  },
  previewBackButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  previewBackIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: AdminColors.textPrimary,
    // The ← glyph is drawn on the baseline inside its line box, which leaves
    // it visibly below the title's optical center — nudge it up to align.
    transform: [{ translateY: -4 }],
  },
  previewTitle: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
    flex: 1,
  },
  previewRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewBell: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  previewBadge: {
    position: 'absolute',
    top: -4,
    right: 18,
    width: 14,
    height: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.statusInactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBadgeText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
  previewAvatar: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primaryLight,
    borderWidth: 1,
    borderColor: AdminColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.lg,
  },
  previewAvatarText: {
    ...Typography.badge,
    color: AdminColors.primary,
  },

  pageHeader: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  pageTitle: {
    ...Typography.screenTitle,
    color: AdminColors.primaryDark,
  },
  pageSubtitle: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },

  textArea: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    minHeight: 110,
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  textAreaError: {
    borderColor: AdminColors.error,
  },
  richToolbar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  richToolButton: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  richToolIcon: {
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.textSecondary,
  },
  fieldError: {
    ...Typography.secondary,
    color: AdminColors.error,
    marginTop: Spacing.xs,
  },
  charCounter: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },

  gridRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fieldHalf: {
    flex: 1,
  },

  statusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
  },
  statusCardSelected: {
    borderColor: AdminColors.primary,
    backgroundColor: AdminColors.primaryLight,
  },
  statusIcon: {
    fontSize: 18,
    marginBottom: Spacing.xs,
  },
  statusTitle: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  statusDescription: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  previewNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.primaryLight,
  },
  previewNoteIcon: {
    fontSize: 14,
    color: AdminColors.primary,
    fontWeight: '700',
  },
  previewNoteText: {
    ...Typography.secondary,
    color: AdminColors.primary,
    flex: 1,
  },

  bottomActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
  },
  bottomButton: {
    flex: 1,
  },
});
