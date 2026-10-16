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
import {
  AppButton,
  AppMediaUploadSheet,
  DatePickerModal,
  TimePickerModal,
} from '../../../../../core/components';
import { formatDate } from '../../../../../core/utils';
import { NewsFormSection } from './NewsFormSection';
import { NewsPreviewSheet } from './NewsPreviewSheet';
import { EventPickerSheet } from '../../events/components/EventPickerSheet';
import { EventTagInput } from '../../events/components/EventTagInput';
import { EventFormToast } from '../../events/components/EventFormToast';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import { SAMPLE_NEWS_AUTHORS, SAMPLE_NEWS_CATEGORIES } from '../data/sample-news';
import { STATUS_LABELS } from './NewsCard';
import { createNewsApi, updateNewsApi } from '../services/news.service';
import type {
  CreateNewsFieldErrors,
  CreateNewsFormState,
  NewsListItem,
} from '../types/news.types';

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

const formatTimeLabel = (hhmm: string): string => {
  if (!hhmm) return '';
  const [hoursStr, minutesStr] = hhmm.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return hhmm;
  }
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

const extractErrorMessage = (err: any, fallback: string): string => {
  if (!err) return fallback;
  if (Array.isArray(err?.rawData?.error?.details)) {
    return err.rawData.error.details.join(', ');
  }
  if (Array.isArray(err?.response?.data?.error?.details)) {
    return err.response.data.error.details.join(', ');
  }
  if (err?.rawData?.message) {
    return String(err.rawData.message);
  }
  if (err?.response?.data?.message) {
    return String(err.response.data.message);
  }
  if (err?.message) {
    return String(err.message);
  }
  return fallback;
};

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
  iconTone?: 'info' | 'warning';
  title: string;
  message: string;
  confirmLabel: string;
  targetStatus: 'DRAFT' | 'PUBLISHED';
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

/** Dropdown-style select display field (icon + value + chevron). */
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

/** Centered modal dialog. */
const NewsConfirmDialog: React.FC<{
  visible: boolean;
  icon: string;
  iconTone?: 'info' | 'warning';
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
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
  loading,
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
          <TouchableOpacity
            style={styles.dialogCancelButton}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.dialogCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dialogConfirmButton,
              destructive && styles.dialogConfirmDanger,
              loading && styles.dialogConfirmDisabled,
            ]}
            onPress={onConfirm}
            disabled={loading}
          >
            <Text style={styles.dialogConfirmText}>
              {loading ? 'Processing...' : confirmLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

interface NewsFormProps {
  mode: NewsFormMode;
  title: string;
  subtitle: string;
  initialForm: CreateNewsFormState;
  newsId?: string;
  onCancel: () => void;
  onSuccess?: (news: NewsListItem) => void;
}

export const NewsForm: React.FC<NewsFormProps> = ({
  mode,
  title,
  subtitle,
  initialForm,
  newsId,
  onCancel,
  onSuccess,
}) => {
  const [form, setForm] = useState<CreateNewsFormState>(initialForm);
  const [errors, setErrors] = useState<CreateNewsFieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  // Content Selection tracking for rich text formatting
  const [contentSelection, setContentSelection] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  // Picker/overlay visibility
  const [imageChooserVisible, setImageChooserVisible] = useState(false);
  const [authorPickerVisible, setAuthorPickerVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [discardDialogVisible, setDiscardDialogVisible] = useState(false);
  const [primaryConfirm, setPrimaryConfirm] = useState<PrimaryConfirmConfig | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm],
  );

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

  // Hardware back guard
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

  /** Applies rich markdown/formatting tokens to the content input. */
  const applyFormat = (
    type: 'bold' | 'italic' | 'underline' | 'bullet' | 'number' | 'link' | 'heading',
  ) => {
    const currentContent = form.content || '';
    const { start, end } = contentSelection;
    const selectedText = currentContent.slice(start, end);
    const before = currentContent.slice(0, start);
    const after = currentContent.slice(end);
    let inserted = '';

    switch (type) {
      case 'bold':
        inserted = selectedText ? `**${selectedText}**` : '**Bold Text**';
        break;
      case 'italic':
        inserted = selectedText ? `*${selectedText}*` : '*Italic Text*';
        break;
      case 'underline':
        inserted = selectedText ? `<u>${selectedText}</u>` : '<u>Underlined Text</u>';
        break;
      case 'bullet':
        if (selectedText) {
          inserted = selectedText
            .split('\n')
            .map(line => (line.startsWith('• ') ? line : `• ${line}`))
            .join('\n');
        } else {
          const prefix = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
          inserted = `${prefix}• `;
        }
        break;
      case 'number':
        if (selectedText) {
          inserted = selectedText
            .split('\n')
            .map((line, idx) => `${idx + 1}. ${line.replace(/^\d+\.\s*/, '')}`)
            .join('\n');
        } else {
          const prefix = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
          inserted = `${prefix}1. `;
        }
        break;
      case 'link':
        inserted = selectedText ? `[${selectedText}](https://example.com)` : '[Link Title](https://example.com)';
        break;
      case 'heading':
        if (selectedText) {
          inserted = `\n## ${selectedText}\n`;
        } else {
          const prefix = before.length > 0 && !before.endsWith('\n') ? '\n\n' : '';
          inserted = `${prefix}## Subheading\n`;
        }
        break;
    }

    const newContent = before + inserted + after;
    updateField('content', newContent);
  };

  // Draft Save Handler (connected to backend)
  const handleSaveDraft = async () => {
    if (!runValidation()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const draftForm = { ...form, status: 'DRAFT' as const };
      let result: NewsListItem;
      if (mode === 'edit' && newsId) {
        result = await updateNewsApi(newsId, draftForm);
      } else {
        result = await createNewsApi(draftForm);
      }
      setToast({ message: 'News draft saved successfully to database.', variant: 'success' });
      if (onSuccess) {
        onSuccess(result);
      }
      setTimeout(() => {
        onCancel();
      }, 900);
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err, 'Failed to save draft. Please try again.');
      setToast({ message: errorMsg, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save changes handler for Edit Mode
  const handleSaveChanges = async () => {
    if (!runValidation()) {
      return;
    }
    setIsSubmitting(true);
    try {
      let result: NewsListItem;
      if (mode === 'edit' && newsId) {
        result = await updateNewsApi(newsId, form);
      } else {
        result = await createNewsApi(form);
      }
      setToast({ message: 'Changes saved successfully to database.', variant: 'success' });
      if (onSuccess) {
        onSuccess(result);
      }
      setTimeout(() => {
        onCancel();
      }, 900);
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err, 'Failed to save changes. Please try again.');
      setToast({ message: errorMsg, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publish button triggers modal confirmation
  const handlePublishPress = () => {
    if (runValidation()) {
      setPrimaryConfirm({
        icon: '📣',
        title: 'Publish News Article?',
        message: 'This article will be saved to the database and made immediately visible to all users.',
        confirmLabel: 'Publish Now',
        targetStatus: 'PUBLISHED',
      });
    }
  };

  // Update button triggers modal confirmation
  const handleUpdatePress = () => {
    if (!runValidation()) {
      return;
    }
    if (form.status === 'PUBLISHED') {
      setPrimaryConfirm({
        icon: '✈️',
        title: 'Publish News Changes?',
        message: 'Are you sure you want to update and keep this news published live?',
        confirmLabel: 'Update & Publish',
        targetStatus: 'PUBLISHED',
      });
      return;
    }
    setPrimaryConfirm({
      icon: '📝',
      title: 'Update News Article?',
      message: 'Are you sure you want to save these changes to the database?',
      confirmLabel: 'Update Article',
      targetStatus: form.status,
    });
  };

  // Confirmed Publish/Update execution (connected to backend)
  const handlePrimaryConfirmed = async () => {
    const config = primaryConfirm;
    setPrimaryConfirm(null);
    if (!config) return;

    setIsSubmitting(true);
    try {
      const targetPayload = { ...form, status: config.targetStatus };
      let result: NewsListItem;
      if (mode === 'edit' && newsId) {
        result = await updateNewsApi(newsId, targetPayload);
      } else {
        result = await createNewsApi(targetPayload);
      }

      setToast({
        message:
          config.targetStatus === 'PUBLISHED'
            ? 'News article published successfully to backend.'
            : 'News article updated successfully in backend.',
        variant: 'success',
      });

      if (onSuccess) {
        onSuccess(result);
      }
      setTimeout(() => {
        onCancel();
      }, 900);
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err, 'Failed to persist news. Please try again.');
      setToast({ message: errorMsg, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewNews: NewsListItem = {
    id: newsId || 'preview',
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
                helperText="Lowercase letters, numbers and hyphens only"
              >
                <TextInput
                  value={form.slug}
                  onChangeText={value =>
                    updateField('slug', value.slice(0, SLUG_MAX_LENGTH).toLowerCase())
                  }
                  placeholder="enter-news-slug-url"
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
                  placeholder="Enter brief executive summary..."
                  placeholderTextColor={AdminColors.textMuted}
                  multiline
                  textAlignVertical="top"
                  style={[styles.textArea, styles.summaryArea, errors.summary && styles.inputError]}
                  accessibilityLabel="Summary"
                />
              </FieldShell>
            </NewsFormSection>

            {/* 2. Content with Interactive Rich Toolbar */}
            <NewsFormSection icon="📝" title="Content">
              <FieldShell
                label="Content"
                required
                error={errors.content}
                helperText="Use the formatting toolbar to style headings, bold text, italics, lists, and links."
              >
                {/* Active Formatting Toolbar */}
                <View style={styles.toolbar}>
                  {/* Heading Style Button */}
                  <TouchableOpacity
                    style={styles.toolbarParagraph}
                    onPress={() => applyFormat('heading')}
                    activeOpacity={0.7}
                    accessibilityLabel="Insert Subheading"
                  >
                    <Text style={styles.toolbarParagraphText}>Heading</Text>
                    <Text style={styles.toolbarChevron}>⌄</Text>
                  </TouchableOpacity>

                  <View style={styles.toolbarDivider} />

                  {/* Bold */}
                  <TouchableOpacity
                    style={styles.toolbarButton}
                    onPress={() => applyFormat('bold')}
                    activeOpacity={0.6}
                    accessibilityLabel="Bold Text"
                  >
                    <Text style={[styles.toolbarIcon, styles.toolbarBold]}>B</Text>
                  </TouchableOpacity>

                  {/* Italic */}
                  <TouchableOpacity
                    style={styles.toolbarButton}
                    onPress={() => applyFormat('italic')}
                    activeOpacity={0.6}
                    accessibilityLabel="Italic Text"
                  >
                    <Text style={[styles.toolbarIcon, styles.toolbarItalic]}>I</Text>
                  </TouchableOpacity>

                  {/* Underline */}
                  <TouchableOpacity
                    style={styles.toolbarButton}
                    onPress={() => applyFormat('underline')}
                    activeOpacity={0.6}
                    accessibilityLabel="Underline Text"
                  >
                    <Text style={[styles.toolbarIcon, styles.toolbarUnderline]}>U</Text>
                  </TouchableOpacity>

                  <View style={styles.toolbarDivider} />

                  {/* Bullet List */}
                  <TouchableOpacity
                    style={styles.toolbarButton}
                    onPress={() => applyFormat('bullet')}
                    activeOpacity={0.6}
                    accessibilityLabel="Bullet List"
                  >
                    <Text style={styles.toolbarIcon}>•</Text>
                  </TouchableOpacity>

                  {/* Numbered List */}
                  <TouchableOpacity
                    style={styles.toolbarButton}
                    onPress={() => applyFormat('number')}
                    activeOpacity={0.6}
                    accessibilityLabel="Numbered List"
                  >
                    <Text style={styles.toolbarIcon}>1.</Text>
                  </TouchableOpacity>

                  {/* Hyperlink */}
                  <TouchableOpacity
                    style={styles.toolbarButton}
                    onPress={() => applyFormat('link')}
                    activeOpacity={0.6}
                    accessibilityLabel="Insert Link"
                  >
                    <Text style={styles.toolbarIcon}>🔗</Text>
                  </TouchableOpacity>
                </View>

                {/* Content TextArea */}
                <TextInput
                  value={form.content}
                  onChangeText={value => updateField('content', value)}
                  onSelectionChange={e => setContentSelection(e.nativeEvent.selection)}
                  placeholder="Write the full news content here... Supports markdown headings, lists, and links."
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
                      <Text style={styles.uploadSubtitle}>JPG, PNG, WebP or Curated Library</Text>
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
                  placeholder="Add news tags (e.g. Health, Relief, Education)"
                  helperText="Add relevant tags to help people discover this news article"
                />
              </FieldShell>
            </NewsFormSection>

            {/* 5. Publish Settings with Calendar & Clock Modals */}
            <NewsFormSection icon="📅" title="Publish Settings">
              {/* Publish Date (Calendar) */}
              <FieldShell label="Publish Date" required error={errors.publishDate}>
                <SelectField
                  icon="📅"
                  value={form.publishDate ? formatDate(form.publishDate) : null}
                  placeholder="Select publish date (interactive calendar)"
                  hasError={Boolean(errors.publishDate)}
                  onPress={() => setDatePickerVisible(true)}
                />
              </FieldShell>

              {/* Publish Time (Clock) */}
              <FieldShell label="Publish Time" required error={errors.publishTime}>
                <SelectField
                  icon="🕐"
                  value={form.publishTime ? formatTimeLabel(form.publishTime) : null}
                  placeholder="Select publish time (interactive clock)"
                  hasError={Boolean(errors.publishTime)}
                  onPress={() => setTimePickerVisible(true)}
                />
              </FieldShell>

              {/* Status */}
              <FieldShell label="Status" required error={errors.status}>
                <SelectField
                  icon={form.status === 'PUBLISHED' ? '✅' : '📄'}
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
                  {form.status === 'PUBLISHED' ? '✅' : 'ℹ️'}
                </Text>
                <Text
                  style={[
                    styles.statusInfoText,
                    form.status === 'PUBLISHED' && styles.statusInfoTextPublished,
                  ]}
                >
                  {form.status === 'PUBLISHED'
                    ? 'News will be published immediately to the database and visible to public users.'
                    : 'News will be saved as a draft in the database. You can publish it at any time.'}
                </Text>
              </View>
            </NewsFormSection>

            {/* 6. Additional Options */}
            <NewsFormSection icon="⚙️" title="Additional Options">
              <View style={styles.optionRow}>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Allow comments</Text>
                  <Text style={styles.optionSubtitle}>
                    Allow users to submit public comments and feedback on this news article.
                  </Text>
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

            {/* 7. Preview Section */}
            <NewsFormSection icon="👁" title="Preview">
              <View style={styles.previewArea}>
                <Text style={styles.previewIcon}>📰</Text>
                <Text style={styles.previewTitle}>Executive Article Preview</Text>
                <Text style={styles.previewSubtitle}>
                  View high-fidelity article preview with full formatting, author details, and publication metadata.
                </Text>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => setPreviewVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Preview News"
                >
                  <Text style={styles.previewButtonIcon}>👁️</Text>
                  <Text style={styles.previewButtonText}>Open Live Preview</Text>
                </TouchableOpacity>
              </View>
            </NewsFormSection>

            {/* 8. Bottom Actions */}
            <View style={styles.bottomActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="md"
                onPress={requestCancel}
                disabled={isSubmitting}
                style={styles.bottomButton}
              />
              <AppButton
                title={middleAction.label}
                variant="secondary"
                size="md"
                onPress={middleAction.onPress}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.bottomButton}
              />
              <AppButton
                title={primaryAction.label}
                variant="primary"
                size="md"
                onPress={primaryAction.onPress}
                loading={isSubmitting}
                disabled={isSubmitting}
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

      {/* Primary-action confirmation modal */}
      <NewsConfirmDialog
        visible={primaryConfirm !== null}
        icon={primaryConfirm?.icon ?? '📣'}
        iconTone={isEdit ? 'info' : 'warning'}
        title={primaryConfirm?.title ?? ''}
        message={primaryConfirm?.message ?? ''}
        confirmLabel={primaryConfirm?.confirmLabel ?? ''}
        loading={isSubmitting}
        onCancel={() => setPrimaryConfirm(null)}
        onConfirm={handlePrimaryConfirmed}
      />

      {/* Discard changes dialog */}
      <NewsConfirmDialog
        visible={discardDialogVisible}
        icon="⚠️"
        iconTone="warning"
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to leave this screen? Your unsaved input will be lost."
        confirmLabel="Discard"
        destructive
        onCancel={() => setDiscardDialogVisible(false)}
        onConfirm={onCancel}
      />

      {/* Live High-Fidelity Rich Preview */}
      <NewsPreviewSheet
        visible={previewVisible}
        news={previewNews}
        onClose={() => setPreviewVisible(false)}
      />

      {/* Media Upload Sheet */}
      <AppMediaUploadSheet
        visible={imageChooserVisible}
        title="Select Featured Image"
        subtitle="Camera, Gallery, File or Curated Presets"
        currentValue={form.featuredImageUri}
        onSelect={value => {
          updateField('featuredImageUri', value);
          setToast({
            message: value
              ? isEdit
                ? 'Featured image updated.'
                : 'Featured image selected.'
              : 'Featured image removed.',
            variant: 'success',
          });
        }}
        onClose={() => setImageChooserVisible(false)}
      />

      {/* Author Picker */}
      <EventPickerSheet
        visible={authorPickerVisible}
        title="Select Author"
        hint="Select editorial staff or official author"
        options={SAMPLE_NEWS_AUTHORS}
        selected={form.author}
        onSelect={value => updateField('author', value)}
        onClose={() => setAuthorPickerVisible(false)}
      />

      {/* Category Picker */}
      <EventPickerSheet
        visible={categoryPickerVisible}
        title="Select Category"
        hint="Select news department or classification"
        options={SAMPLE_NEWS_CATEGORIES}
        selected={form.category}
        onSelect={value => updateField('category', value)}
        onClose={() => setCategoryPickerVisible(false)}
      />

      {/* Status Picker */}
      <EventPickerSheet
        visible={statusPickerVisible}
        title="Select Status"
        hint="Choose publication status"
        options={['DRAFT', 'PUBLISHED']}
        selected={form.status}
        itemLabel={value => STATUS_LABELS[value as CreateNewsFormState['status']]}
        onSelect={value => updateField('status', value as CreateNewsFormState['status'])}
        onClose={() => setStatusPickerVisible(false)}
      />

      {/* Interactive Calendar Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        value={form.publishDate || ''}
        onSelect={value => updateField('publishDate', value)}
        onClose={() => setDatePickerVisible(false)}
        title="Select Publish Date"
      />

      {/* Interactive Clock Time Picker Modal */}
      <TimePickerModal
        visible={timePickerVisible}
        value={form.publishTime || ''}
        onSelect={value => updateField('publishTime', value)}
        onClose={() => setTimePickerVisible(false)}
        title="Select Publish Time"
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
    minHeight: 180,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },

  // Rich Formatting Toolbar
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderBottomWidth: 0,
    borderTopLeftRadius: BorderRadius.base,
    borderTopRightRadius: BorderRadius.base,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 6,
  },
  toolbarDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 2,
  },
  toolbarParagraph: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xs + 2,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolbarParagraphText: {
    ...Typography.caption,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  toolbarChevron: {
    fontSize: 9,
    color: AdminColors.textMuted,
  },
  toolbarButton: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolbarIcon: {
    fontSize: 13,
    fontWeight: '600',
    color: AdminColors.textPrimary,
  },
  toolbarBold: {
    fontWeight: '900',
  },
  toolbarItalic: {
    fontStyle: 'italic',
    fontWeight: '700',
  },
  toolbarUnderline: {
    textDecorationLine: 'underline',
    fontWeight: '700',
  },

  // Upload Box
  uploadArea: {
    height: 200,
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
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  uploadTitle: {
    ...Typography.bodyMedium,
    color: AdminColors.primary,
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontSize: 14,
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
    fontSize: 14,
  },
  statusInfoText: {
    ...Typography.secondary,
    color: AdminColors.info,
    flex: 1,
    fontWeight: '500',
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
    fontWeight: '600',
    color: AdminColors.textPrimary,
  },
  optionSubtitle: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    marginTop: 2,
  },

  previewArea: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  previewIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  previewTitle: {
    ...Typography.bodyMedium,
    color: AdminColors.primary,
    fontWeight: '700',
  },
  previewSubtitle: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.md,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  previewButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: AdminColors.primary,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.primaryLight,
    paddingHorizontal: Spacing.lg,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  previewButtonIcon: {
    fontSize: 14,
  },
  previewButtonText: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
    fontWeight: '700',
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
    fontSize: 24,
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
  dialogConfirmDisabled: {
    opacity: 0.6,
  },
  dialogConfirmText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: AdminColors.textOnDark,
  },
});
