import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import { AppButton } from '../../../../../core/components';
import { formatDate } from '../../../../../core/utils';
import { NewsFormSection } from './NewsFormSection';
import { NewsPreviewSheet } from './NewsPreviewSheet';
import { EventPickerSheet } from '../../events/components/EventPickerSheet';
import { EventTagInput } from '../../events/components/EventTagInput';
import { EventFormToast } from '../../events/components/EventFormToast';
import { AdminShellHeader } from '../../events/preview/AdminShellHeader';
import { SAMPLE_NEWS, SAMPLE_NEWS_AUTHORS, SAMPLE_NEWS_CATEGORIES } from '../data/sample-news';
import { STATUS_LABELS } from './NewsCard';
import type {
  CreateNewsFieldErrors,
  CreateNewsFormState,
  NewsListItem,
} from '../types/news.types';

/**
 * Shared Create/Edit News form.
 *
 * ONE form for both flows so they stay visually and behaviorally identical:
 * same sections, same validation, same pickers, same dirty-state guard.
 * UI + local form behavior only — NO backend is called. Save/Update actions
 * perform local validation and show UI-only confirmations; they do NOT claim
 * anything was persisted remotely.
 */

export type NewsFormMode = 'create' | 'edit';

const HEADLINE_MAX_LENGTH = 150;
const SLUG_MAX_LENGTH = 150;
const SUMMARY_MAX_LENGTH = 300;
const SLUG_PATTERN = /^[a-z0-9-]+$/;

/** Empty form used as the Create News starting point and dirty-state baseline. */
export const EMPTY_NEWS_FORM: CreateNewsFormState = {
  headline: '',
  slug: '',
  summary: '',
  content: '',
  featuredImageUri: null,
  author: null,
  category: null,
  tags: [],
  publishDate: null,
  publishTime: null,
  status: 'DRAFT',
  allowComments: true,
};

const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, '0');
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${hours}:${minutes}`;
});

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

const formatTimeLabel = (hhmm: string): string => {
  const [hours, minutes] = hhmm.split(':').map(part => parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return hhmm;
  }
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

/**
 * Demo featured-image choices: the news sample imagery already used by
 * Details/List (no new image sources, no uploads).
 */
const FEATURED_IMAGE_OPTIONS: string[] = [
  ...(SAMPLE_NEWS[0]?.thumbnailUrl ? [SAMPLE_NEWS[0].thumbnailUrl as string] : []),
  ...(SAMPLE_NEWS[0]?.gallery ?? []),
];

/** Local frontend validation for the required Create/Edit News fields. */
const validateNewsForm = (form: CreateNewsFormState): CreateNewsFieldErrors => {
  const errors: CreateNewsFieldErrors = {};

  if (!form.headline.trim()) {
    errors.headline = 'Headline is required';
  }
  if (!form.slug.trim()) {
    errors.slug = 'Slug is required';
  } else if (!SLUG_PATTERN.test(form.slug)) {
    errors.slug = 'Use only lowercase letters, numbers and hyphens';
  }
  if (!form.summary.trim()) {
    errors.summary = 'Summary is required';
  }
  if (!form.content.trim()) {
    errors.content = 'Content is required';
  }
  if (!form.featuredImageUri) {
    errors.featuredImageUri = 'Featured image is required';
  }
  if (!form.author) {
    errors.author = 'Author is required';
  }
  if (!form.category) {
    errors.category = 'Category is required';
  }
  if (!form.publishDate) {
    errors.publishDate = 'Publish date is required';
  }
  if (!form.publishTime) {
    errors.publishTime = 'Publish time is required';
  }
  if (!form.status) {
    errors.status = 'Status is required';
  }
  return errors;
};

/** Confirmation dialog configuration for the primary Update/Publish action. */
interface PrimaryConfirmConfig {
  icon: string;
  iconCircleDanger?: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  toast: string;
}

interface FieldShellProps {
  label: string;
  required?: boolean;
  counter?: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

/** Label (+ inline star, counter right) + error/helper wrapper for form fields. */
const FieldShell: React.FC<FieldShellProps> = ({
  label,
  required,
  counter,
  error,
  helperText,
  children,
}) => (
  <View style={styles.fieldShell}>
    <View style={styles.labelRow}>
      <View style={styles.labelGroup}>
        <Text style={styles.label}>{label}</Text>
        {required ? <Text style={styles.requiredStar}>*</Text> : null}
      </View>
      {counter ? <Text style={styles.counter}>{counter}</Text> : null}
    </View>
    {children}
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
    {helperText && !error ? <Text style={styles.helperText}>{helperText}</Text> : null}
  </View>
);

/** Dropdown-style select display field (reference: icon + value + chevron). */
const SelectField: React.FC<{
  icon: string;
  value: string | null;
  placeholder: string;
  hasError: boolean;
  onPress: () => void;
}> = ({ icon, value, placeholder, hasError, onPress }) => (
  <TouchableOpacity
    style={[styles.selectField, hasError && styles.inputError]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={placeholder}
  >
    <Text style={styles.selectIcon}>{icon}</Text>
    <Text style={[styles.selectValue, !value && styles.selectPlaceholder]} numberOfLines={1}>
      {value ?? placeholder}
    </Text>
    <Text style={styles.selectChevron}>⌄</Text>
  </TouchableOpacity>
);

/**
 * Centered dialog matching the reference (icon circle, title, message,
 * Cancel + confirm). Used for the Discard-changes guard and the
 * Update/Publish confirmation. State-driven, so duplicate dialogs cannot
 * stack.
 */
const NewsConfirmDialog: React.FC<{
  visible: boolean;
  icon: string;
  /** Icon circle tint: 'info' light blue, 'warning' amber (discard). */
  iconTone?: 'info' | 'warning';
  title: string;
  message: string;
  confirmLabel: string;
  /** Red confirm button (Discard). */
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({
  visible,
  icon,
  iconTone = 'info',
  title,
  message,
  confirmLabel,
  destructive,
  onCancel,
  onConfirm,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.dialogBackdrop}>
      <View style={styles.dialogCard}>
        <View
          style={[
            styles.dialogIconCircle,
            iconTone === 'warning' ? styles.dialogIconCircleWarning : styles.dialogIconCircleInfo,
          ]}
        >
          <Text style={styles.dialogIcon}>{icon}</Text>
        </View>
        <Text style={styles.dialogTitle}>{title}</Text>
        <Text style={styles.dialogMessage}>{message}</Text>
        <View style={styles.dialogButtonsRow}>
          <TouchableOpacity style={styles.dialogCancelButton} onPress={onCancel}>
            <Text style={styles.dialogCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dialogConfirmButton, destructive && styles.dialogConfirmDanger]}
            onPress={onConfirm}
          >
            <Text style={styles.dialogConfirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

interface NewsFormProps {
  /** 'create' saves nothing; 'edit' confirms with update/publish wording. */
  mode: NewsFormMode;
  /** Header bar + page title ("Create News" / "Edit News"). */
  title: string;
  /** Page subtitle under the title. */
  subtitle: string;
  /** Starting field values; also the baseline for dirty-state detection. */
  initialForm: CreateNewsFormState;
  /** Leave the screen (after confirmation when the form is dirty). */
  onCancel: () => void;
}

export const NewsForm: React.FC<NewsFormProps> = ({
  mode,
  title,
  subtitle,
  initialForm,
  onCancel,
}) => {
  const [form, setForm] = useState<CreateNewsFormState>(initialForm);
  const [errors, setErrors] = useState<CreateNewsFieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  // Picker/overlay visibility
  const [imageChooserVisible, setImageChooserVisible] = useState(false);
  const [authorPickerVisible, setAuthorPickerVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [discardDialogVisible, setDiscardDialogVisible] = useState(false);
  /** Primary-action confirmation; visible while non-null. */
  const [primaryConfirm, setPrimaryConfirm] = useState<PrimaryConfirmConfig | null>(null);

  const dateOptions = useMemo(() => buildDateOptions(60), []);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm],
  );

  // Guards against stacking overlays: while one is visible, further
  // hardware-back presses do nothing until it is resolved.
  const overlayVisibleRef = useRef(false);
  overlayVisibleRef.current =
    primaryConfirm !== null ||
    discardDialogVisible ||
    previewVisible ||
    imageChooserVisible ||
    authorPickerVisible ||
    categoryPickerVisible ||
    statusPickerVisible ||
    datePickerVisible ||
    timePickerVisible;

  const updateField = <K extends keyof CreateNewsFormState>(
    field: K,
    value: CreateNewsFormState[K],
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

  // Android hardware back: confirm before leaving with unsaved changes.
  const requestCancel = () => {
    if (overlayVisibleRef.current) {
      return;
    }
    if (!isDirty) {
      onCancel();
      return;
    }
    setDiscardDialogVisible(true);
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      requestCancel();
      return true;
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, onCancel]);

  const runValidation = (): boolean => {
    setSubmitted(true);
    const validationErrors = validateNewsForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setToast({ message: 'Please fix the highlighted fields.', variant: 'error' });
      return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    if (!runValidation()) {
      return;
    }
    // UI-only confirmation: the form was validated locally. NO backend call
    // happens and nothing is claimed to be persisted remotely.
    setToast({ message: 'News saved as draft.', variant: 'success' });
  };

  const handleSaveChanges = () => {
    if (!runValidation()) {
      return;
    }
    // UI-only confirmation; the screen stays and the edited data remains
    // visible (spec: do not leave the screen).
    setToast({ message: 'Changes saved successfully.', variant: 'success' });
  };

  const handlePublishPress = () => {
    if (runValidation()) {
      setPrimaryConfirm({
        icon: '📣',
        title: 'Publish News?',
        message: 'Are you sure you want to publish this news?',
        confirmLabel: 'Publish',
        toast: 'News published successfully.',
      });
    }
  };

  const handleUpdatePress = () => {
    if (!runValidation()) {
      return;
    }
    if (form.status === 'PUBLISHED') {
      setPrimaryConfirm({
        icon: '✈️',
        title: 'Publish News?',
        message: 'Are you sure you want to update and publish this news?',
        confirmLabel: 'Publish',
        toast: 'News updated and published successfully.',
      });
      return;
    }
    setPrimaryConfirm({
      icon: '📝',
      title: 'Update News?',
      message: 'Are you sure you want to save these changes?',
      confirmLabel: 'Update',
      toast: 'News updated successfully.',
    });
  };

  const handlePrimaryConfirmed = () => {
    const config = primaryConfirm;
    setPrimaryConfirm(null);
    if (config) {
      // UI-only confirmation — no backend call, nothing is persisted remotely.
      setToast({ message: config.toast, variant: 'success' });
    }
  };

  const previewNews: NewsListItem = {
    id: 'preview',
    title: form.headline.trim(),
    summary: form.summary.trim() || 'Summary will appear here.',
    category: form.category ?? 'Category',
    date: form.publishDate ? formatDate(form.publishDate) : 'Publish date',
    time: form.publishTime ? formatTimeLabel(form.publishTime) : 'Publish time',
    status: form.status,
    views: 0,
    thumbnailUrl: form.featuredImageUri,
    author: form.author ?? 'Author',
    content: form.content.trim()
      ? form.content
          .trim()
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
      : undefined,
    tags: form.tags,
  };

  const isEdit = mode === 'edit';
  const middleAction = isEdit
    ? { label: 'Save Changes', onPress: handleSaveChanges }
    : { label: 'Save Draft', onPress: handleSaveDraft };
  const primaryAction = isEdit
    ? { label: 'Update', onPress: handleUpdatePress }
    : { label: 'Publish', onPress: handlePublishPress };

  return (
    <View style={styles.root}>
      <AdminShellHeader leading="back" onBack={requestCancel} />

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
            <NewsFormSection icon="📰" title="Basic Information">
              <FieldShell
                label="Headline"
                required
                counter={`${form.headline.length}/${HEADLINE_MAX_LENGTH}`}
                error={errors.headline}
              >
                <TextInput
                  value={form.headline}
                  onChangeText={value => updateField('headline', value.slice(0, HEADLINE_MAX_LENGTH))}
                  placeholder="Enter news headline"
                  placeholderTextColor={AdminColors.textMuted}
                  style={[styles.input, errors.headline && styles.inputError]}
                  accessibilityLabel="Headline"
                />
              </FieldShell>

              <FieldShell
                label="Slug"
                required
                counter={`${form.slug.length}/${SLUG_MAX_LENGTH}`}
                error={errors.slug}
                helperText="Lowercase, numbers and hyphens only"
              >
                <TextInput
                  value={form.slug}
                  onChangeText={value =>
                    updateField('slug', value.slice(0, SLUG_MAX_LENGTH).toLowerCase())
                  }
                  placeholder="Enter news slug"
                  placeholderTextColor={AdminColors.textMuted}
                  autoCapitalize="none"
                  style={[styles.input, errors.slug && styles.inputError]}
                  accessibilityLabel="Slug"
                />
              </FieldShell>

              <FieldShell
                label="Summary"
                required
                counter={`${form.summary.length}/${SUMMARY_MAX_LENGTH}`}
                error={errors.summary}
              >
                <TextInput
                  value={form.summary}
                  onChangeText={value => updateField('summary', value.slice(0, SUMMARY_MAX_LENGTH))}
                  placeholder="Enter short summary"
                  placeholderTextColor={AdminColors.textMuted}
                  multiline
                  textAlignVertical="top"
                  style={[styles.textArea, styles.summaryArea, errors.summary && styles.inputError]}
                  accessibilityLabel="Summary"
                />
              </FieldShell>
            </NewsFormSection>

            {/* 2. Content */}
            <NewsFormSection icon="📝" title="Content">
              <FieldShell label="Content" required error={errors.content}>
                <View style={styles.toolbar}>
                  <TouchableOpacity style={styles.toolbarParagraph} disabled accessibilityLabel="Paragraph style">
                    <Text style={styles.toolbarParagraphText}>Paragraph</Text>
                    <Text style={styles.toolbarChevron}>⌄</Text>
                  </TouchableOpacity>
                  {['B', 'I', 'U'].map(glyph => (
                    <TouchableOpacity key={glyph} style={styles.toolbarButton} disabled accessibilityLabel={glyph}>
                      <Text style={[styles.toolbarIcon, glyph === 'B' && styles.toolbarBold]}>{glyph}</Text>
                    </TouchableOpacity>
                  ))}
                  {['•', '⋮≡', '🔗'].map(glyph => (
                    <TouchableOpacity key={glyph} style={styles.toolbarButton} disabled accessibilityLabel={glyph}>
                      <Text style={styles.toolbarIcon}>{glyph}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  value={form.content}
                  onChangeText={value => updateField('content', value)}
                  placeholder="Write the full news content..."
                  placeholderTextColor={AdminColors.textMuted}
                  multiline
                  textAlignVertical="top"
                  style={[styles.textArea, styles.contentArea, errors.content && styles.inputError]}
                  accessibilityLabel="Content"
                />
              </FieldShell>
            </NewsFormSection>

            {/* 3. Featured Image */}
            <NewsFormSection icon="🖼️" title="Featured Image">
              <FieldShell label="Featured Image" required error={errors.featuredImageUri}>
                {form.featuredImageUri ? (
                  <View>
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: form.featuredImageUri }}
                        style={styles.uploadPreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => updateField('featuredImageUri', null)}
                        accessibilityRole="button"
                        accessibilityLabel="Remove featured image"
                      >
                        <Text style={styles.removeIcon}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    {isEdit ? (
                      <>
                        <Text style={styles.uploadCaption}>JPG, PNG or WebP (Max 5 MB)</Text>
                        <TouchableOpacity
                          style={styles.changeImageButton}
                          onPress={() => setImageChooserVisible(true)}
                          accessibilityRole="button"
                          accessibilityLabel="Change Image"
                        >
                          <Text style={styles.changeImageIcon}>🖼️</Text>
                          <Text style={styles.changeImageText}>Change Image</Text>
                        </TouchableOpacity>
                      </>
                    ) : null}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadArea}
                    onPress={() => setImageChooserVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Upload featured image"
                  >
                    <View style={styles.uploadEmpty} pointerEvents="none">
                      <Text style={styles.uploadIcon}>🖼️</Text>
                      <Text style={styles.uploadTitle}>Upload Featured Image</Text>
                      <Text style={styles.uploadSubtitle}>JPG, PNG or WebP (Max 5 MB)</Text>
                      <View style={styles.chooseButton}>
                        <Text style={styles.chooseButtonText}>Choose Image</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              </FieldShell>
            </NewsFormSection>

            {/* 4. Details */}
            <NewsFormSection icon="📄" title="Details">
              <FieldShell label="Author" required error={errors.author}>
                <SelectField
                  icon="👤"
                  value={form.author}
                  placeholder="Select author"
                  hasError={Boolean(errors.author)}
                  onPress={() => setAuthorPickerVisible(true)}
                />
              </FieldShell>

              <FieldShell label="Category" required error={errors.category}>
                <SelectField
                  icon="📁"
                  value={form.category}
                  placeholder="Select category"
                  hasError={Boolean(errors.category)}
                  onPress={() => setCategoryPickerVisible(true)}
                />
              </FieldShell>

              <FieldShell label="Tags" required error={errors.tags}>
                <EventTagInput
                  tags={form.tags}
                  onChange={value => updateField('tags', value)}
                  error={errors.tags}
                />
              </FieldShell>
            </NewsFormSection>

            {/* 5. Publish Settings */}
            <NewsFormSection icon="📅" title="Publish Settings">
              <FieldShell label="Publish Date" required error={errors.publishDate}>
                <SelectField
                  icon="📅"
                  value={form.publishDate ? formatDate(form.publishDate) : null}
                  placeholder="Select publish date"
                  hasError={Boolean(errors.publishDate)}
                  onPress={() => setDatePickerVisible(true)}
                />
              </FieldShell>

              <FieldShell label="Publish Time" required error={errors.publishTime}>
                <SelectField
                  icon="🕐"
                  value={form.publishTime ? formatTimeLabel(form.publishTime) : null}
                  placeholder="Select publish time"
                  hasError={Boolean(errors.publishTime)}
                  onPress={() => setTimePickerVisible(true)}
                />
              </FieldShell>

              <FieldShell label="Status" required error={errors.status}>
                <SelectField
                  icon={isEdit ? '⚑' : '📄'}
                  value={form.status ? STATUS_LABELS[form.status] : null}
                  placeholder="Select status"
                  hasError={Boolean(errors.status)}
                  onPress={() => setStatusPickerVisible(true)}
                />
              </FieldShell>

              <View
                style={[
                  styles.statusInfoBox,
                  form.status === 'PUBLISHED' && styles.statusInfoBoxPublished,
                ]}
              >
                <Text style={styles.statusInfoIcon}>
                  {form.status === 'PUBLISHED' && isEdit ? '✅' : 'ℹ️'}
                </Text>
                <Text
                  style={[
                    styles.statusInfoText,
                    form.status === 'PUBLISHED' && styles.statusInfoTextPublished,
                  ]}
                >
                  {form.status === 'PUBLISHED'
                    ? isEdit
                      ? 'This news will be published immediately and visible to users.'
                      : 'News will be published immediately once saved.'
                    : 'News will be saved as a draft. You can publish it later.'}
                </Text>
              </View>
            </NewsFormSection>

            {/* 6. Additional Options */}
            <NewsFormSection icon="⚙️" title="Additional Options">
              <View style={styles.optionRow}>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Allow comments (UI only)</Text>
                  {isEdit ? (
                    <Text style={styles.optionSubtitle}>Allow users to comment on this news.</Text>
                  ) : null}
                </View>
                <Switch
                  value={form.allowComments}
                  onValueChange={value => updateField('allowComments', value)}
                  trackColor={{ true: AdminColors.primary, false: AdminColors.border }}
                  thumbColor={AdminColors.cardSurface}
                  accessibilityLabel="Allow comments"
                />
              </View>
            </NewsFormSection>

            {/* 7. Preview */}
            <NewsFormSection icon="👁" title="Preview">
              <View style={styles.previewArea}>
                <Text style={styles.previewIcon}>📰</Text>
                <Text style={styles.previewTitle}>Preview how this news will look</Text>
                <Text style={styles.previewSubtitle}>
                  {isEdit
                    ? 'You can preview the news before saving or updating.'
                    : 'You can preview the news before saving or publishing.'}
                </Text>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => setPreviewVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Preview News"
                >
                  <Text style={styles.previewButtonText}>Preview News</Text>
                </TouchableOpacity>
              </View>
            </NewsFormSection>

            {/* 8. Bottom actions */}
            <View style={styles.bottomActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="md"
                onPress={requestCancel}
                style={styles.bottomButton}
              />
              <AppButton
                title={middleAction.label}
                variant="secondary"
                size="md"
                onPress={middleAction.onPress}
                style={styles.bottomButton}
              />
              <AppButton
                title={primaryAction.label}
                variant="primary"
                size="md"
                onPress={primaryAction.onPress}
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

      {/* Primary-action confirmation (UI-only, no backend) */}
      <NewsConfirmDialog
        visible={primaryConfirm !== null}
        icon={primaryConfirm?.icon ?? '📣'}
        iconTone={isEdit ? 'info' : 'warning'}
        title={primaryConfirm?.title ?? ''}
        message={primaryConfirm?.message ?? ''}
        confirmLabel={primaryConfirm?.confirmLabel ?? ''}
        onCancel={() => setPrimaryConfirm(null)}
        onConfirm={handlePrimaryConfirmed}
      />

      {/* Discard changes (reference dialog) */}
      <NewsConfirmDialog
        visible={discardDialogVisible}
        icon="⚠️"
        iconTone="warning"
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to leave this screen? Your changes will be lost."
        confirmLabel="Discard"
        destructive
        onCancel={() => setDiscardDialogVisible(false)}
        onConfirm={onCancel}
      />

      {/* UI-only preview of the current form values */}
      <NewsPreviewSheet
        visible={previewVisible}
        news={previewNews}
        onClose={() => setPreviewVisible(false)}
      />

      {/* Featured image chooser (news sample imagery, no upload) */}
      <EventPickerSheet
        visible={imageChooserVisible}
        title="Select Featured Image"
        hint="Demo images only — real upload needs the shared image picker + backend flow"
        options={FEATURED_IMAGE_OPTIONS}
        selected={form.featuredImageUri}
        itemLabel={uri => `News image ${FEATURED_IMAGE_OPTIONS.indexOf(uri) + 1}`}
        onSelect={value => {
          updateField('featuredImageUri', value);
          setToast({
            message: isEdit ? 'Featured image updated.' : 'Featured image selected.',
            variant: 'success',
          });
        }}
        onClose={() => setImageChooserVisible(false)}
      />

      <EventPickerSheet
        visible={authorPickerVisible}
        title="Select Author"
        hint="Demo options only — not backend values"
        options={SAMPLE_NEWS_AUTHORS}
        selected={form.author}
        onSelect={value => updateField('author', value)}
        onClose={() => setAuthorPickerVisible(false)}
      />
      <EventPickerSheet
        visible={categoryPickerVisible}
        title="Select Category"
        hint="Demo options only — not backend values"
        options={SAMPLE_NEWS_CATEGORIES}
        selected={form.category}
        onSelect={value => updateField('category', value)}
        onClose={() => setCategoryPickerVisible(false)}
      />
      <EventPickerSheet
        visible={statusPickerVisible}
        title="Select Status"
        hint="UI-only status selection"
        options={['DRAFT', 'PUBLISHED']}
        selected={form.status}
        itemLabel={value => STATUS_LABELS[value as CreateNewsFormState['status']]}
        onSelect={value => updateField('status', value as CreateNewsFormState['status'])}
        onClose={() => setStatusPickerVisible(false)}
      />
      <EventPickerSheet
        visible={datePickerVisible}
        title="Select Publish Date"
        options={dateOptions}
        selected={form.publishDate}
        itemLabel={value => formatDate(value)}
        onSelect={value => updateField('publishDate', value)}
        onClose={() => setDatePickerVisible(false)}
      />
      <EventPickerSheet
        visible={timePickerVisible}
        title="Select Publish Time"
        options={TIME_OPTIONS}
        selected={form.publishTime}
        itemLabel={value => formatTimeLabel(value)}
        onSelect={value => updateField('publishTime', value)}
        onClose={() => setTimePickerVisible(false)}
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
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },

  pageHeader: {
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  pageTitle: {
    ...Typography.screenTitle,
    fontSize: 21,
    lineHeight: 26,
    color: AdminColors.primaryDark,
  },
  pageSubtitle: {
    ...Typography.secondary,
    fontSize: 11.5,
    lineHeight: 16,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },

  fieldShell: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 1,
  },
  label: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
  },
  requiredStar: {
    color: AdminColors.error,
    fontWeight: '700',
  },
  counter: {
    ...Typography.caption,
    color: AdminColors.textMuted,
  },
  helperText: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    marginTop: Spacing.xs,
  },
  errorText: {
    ...Typography.secondary,
    color: AdminColors.error,
    marginTop: Spacing.xs,
  },

  input: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  inputError: {
    borderColor: AdminColors.error,
  },
  textArea: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  summaryArea: {
    minHeight: 90,
  },
  contentArea: {
    minHeight: 160,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderBottomWidth: 0,
    borderTopLeftRadius: BorderRadius.base,
    borderTopRightRadius: BorderRadius.base,
    backgroundColor: AdminColors.background,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  toolbarParagraph: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.xs,
    minHeight: 30,
  },
  toolbarParagraphText: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  toolbarChevron: {
    fontSize: 9,
    color: AdminColors.textMuted,
  },
  toolbarButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  toolbarIcon: {
    fontSize: 12,
    color: AdminColors.textSecondary,
  },
  toolbarBold: {
    fontWeight: '700',
  },

  uploadArea: {
    height: 210,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: AdminColors.primary,
    borderStyle: 'dashed',
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadEmpty: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 26,
    marginBottom: Spacing.xs,
  },
  uploadTitle: {
    ...Typography.bodyMedium,
    color: AdminColors.primary,
    fontWeight: '600',
  },
  uploadSubtitle: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  chooseButton: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  chooseButtonText: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
  },
  imagePreviewContainer: {
    height: 180,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.primary,
    overflow: 'hidden',
  },
  uploadPreview: {
    width: '100%',
    height: '100%',
  },
  uploadCaption: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    minHeight: 40,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.primary,
    backgroundColor: AdminColors.primaryLight,
  },
  changeImageIcon: {
    fontSize: 12,
  },
  changeImageText: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.statusInactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },

  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  selectIcon: {
    fontSize: 13,
    marginRight: Spacing.sm,
  },
  selectValue: {
    ...Typography.body,
    color: AdminColors.textPrimary,
    flex: 1,
  },
  selectPlaceholder: {
    color: AdminColors.textMuted,
  },
  selectChevron: {
    fontSize: 12,
    color: AdminColors.textMuted,
  },

  statusInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: AdminColors.infoLight,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
  },
  statusInfoBoxPublished: {
    backgroundColor: AdminColors.successLight,
  },
  statusInfoIcon: {
    fontSize: 12,
  },
  statusInfoText: {
    ...Typography.secondary,
    color: AdminColors.info,
    flex: 1,
  },
  statusInfoTextPublished: {
    color: AdminColors.success,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    flex: 1,
    minWidth: 0,
    marginRight: Spacing.sm,
  },
  optionLabel: {
    ...Typography.body,
    color: AdminColors.textPrimary,
  },
  optionSubtitle: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    marginTop: 2,
  },

  previewArea: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  previewIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  previewTitle: {
    ...Typography.bodyMedium,
    color: AdminColors.primary,
    fontWeight: '600',
  },
  previewSubtitle: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  previewButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: AdminColors.primary,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.primaryLight,
    paddingHorizontal: Spacing.lg,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
  },

  bottomActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  bottomButton: {
    flex: 1,
    paddingHorizontal: 0,
  },

  // Dialogs
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 96, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  dialogIconCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  dialogIconCircleInfo: {
    backgroundColor: AdminColors.primaryLight,
  },
  dialogIconCircleWarning: {
    backgroundColor: AdminColors.warningLight,
  },
  dialogIcon: {
    fontSize: 22,
  },
  dialogTitle: {
    ...Typography.bodyBold,
    fontSize: 17,
    lineHeight: 22,
    color: AdminColors.textPrimary,
  },
  dialogMessage: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  dialogButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    alignSelf: 'stretch',
  },
  dialogCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
  },
  dialogCancelText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: AdminColors.textPrimary,
  },
  dialogConfirmButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.primary,
  },
  dialogConfirmDanger: {
    backgroundColor: AdminColors.error,
  },
  dialogConfirmText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: AdminColors.textOnDark,
  },
});
