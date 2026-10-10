import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
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
import { AppButton, AppMediaUploadSheet } from '../../../../../core/components';
import { EventPickerSheet } from '../../events/components/EventPickerSheet';
import { EventFormToast } from '../../events/components/EventFormToast';
import { EventTagInput } from '../../events/components/EventTagInput';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import { SAMPLE_BLOGS, SAMPLE_BLOG_CATEGORIES } from '../data/sample-blogs';
import { BLOG_STATUS_LABELS } from './BlogCard';
import type {
  CreateBlogFieldErrors,
  CreateBlogFormState,
} from '../types/blog.types';

/**
 * Shared Create/Edit Blog form (UI + local form behaviour only — NO backend).
 *
 * Follows the Create Blog reference: flat field layout with leading input
 * icons, a dashed cover-image upload card, character counters, the
 * "Additional Options" toggles card and Save Draft / Create Blog actions.
 * Validation, pickers, dirty-state guard and confirmations are UI-only.
 *
 * mode="edit" reuses the identical form pre-filled with the selected blog:
 * the cover row switches to the Edit reference (preview + Change Image card),
 * tags render as removable chips, the status picker offers the full existing
 * BlogStatus set (a blog may already be archived) and the primary action
 * becomes "Update Blog" (confirm → toast → back to Blog Details).
 */

const SHORT_DESCRIPTION_MAX_LENGTH = 200;
const CONTENT_MAX_LENGTH = 5000;

/** Starting values for Create Blog; also the dirty-state baseline. */
export const EMPTY_BLOG_FORM: CreateBlogFormState = {
  coverImageUri: null,
  title: '',
  category: null,
  shortDescription: '',
  content: '',
  author: '',
  status: 'DRAFT',
  allowComments: true,
  featured: false,
  tagsText: '',
};

/** Parses the comma-separated tags storage into the edit-mode chips list. */
const parseTagList = (tagsText: string): string[] =>
  tagsText
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

/** Local frontend validation for the required Create Blog fields. */
const validateBlogForm = (form: CreateBlogFormState): CreateBlogFieldErrors => {
  const errors: CreateBlogFieldErrors = {};

  if (!form.coverImageUri) {
    errors.coverImageUri = 'Cover image is required';
  }
  if (!form.title.trim()) {
    errors.title = 'Blog title is required';
  }
  if (!form.category) {
    errors.category = 'Category is required';
  }
  if (!form.shortDescription.trim()) {
    errors.shortDescription = 'Short description is required';
  }
  if (!form.content.trim()) {
    errors.content = 'Blog content is required';
  }
  if (!form.author.trim()) {
    errors.author = 'Author is required';
  }
  if (!form.status) {
    errors.status = 'Status is required';
  }
  return errors;
};

/**
 * Demo cover-image choices: the blog sample imagery already used by
 * List/Details (no new image sources, no uploads).
 */
const COVER_IMAGE_OPTIONS: string[] = SAMPLE_BLOGS.flatMap(
  blog => (blog.thumbnailUrl ? [blog.thumbnailUrl] : []),
);

/** Confirmation dialog configuration for the Create action. */
interface PrimaryConfirmConfig {
  icon: string;
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

/** Input row with a leading icon (reference style) around a TextInput. */
const IconInput: React.FC<{
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  hasError: boolean;
  accessibilityLabel: string;
}> = ({ icon, value, onChangeText, placeholder, hasError, accessibilityLabel }) => (
  <View style={[styles.inputRow, hasError && styles.inputError]}>
    <Text style={styles.inputIcon}>{icon}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={AdminColors.textMuted}
      style={styles.input}
      accessibilityLabel={accessibilityLabel}
    />
  </View>
);

/** Multiline input row with a leading icon (reference style). */
const IconTextArea: React.FC<{
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  hasError: boolean;
  minHeight: number;
  accessibilityLabel: string;
}> = ({ icon, value, onChangeText, placeholder, hasError, minHeight, accessibilityLabel }) => (
  <View style={[styles.inputRow, styles.textAreaRow, hasError && styles.inputError, { minHeight }]}>
    <Text style={styles.inputIcon}>{icon}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={AdminColors.textMuted}
      multiline
      textAlignVertical="top"
      style={styles.input}
      accessibilityLabel={accessibilityLabel}
    />
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
    style={[styles.inputRow, hasError && styles.inputError]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={placeholder}
  >
    <Text style={styles.inputIcon}>{icon}</Text>
    <Text style={[styles.selectValue, !value && styles.selectPlaceholder]} numberOfLines={1}>
      {value ?? placeholder}
    </Text>
    <Text style={styles.selectChevron}>⌄</Text>
  </TouchableOpacity>
);

/**
 * Centered dialog matching the reference (icon circle, title, message,
 * Cancel + confirm). Used for the Discard-changes guard and the Create
 * confirmation. State-driven, so duplicate dialogs cannot stack.
 */
const BlogConfirmDialog: React.FC<{
  visible: boolean;
  icon: string;
  /** Icon circle tint: 'info' light blue, 'warning' amber (discard). */
  iconTone?: 'info' | 'warning';
  title: string;
  message: string;
  confirmLabel: string;
  /** Cancel-side button label (reference discard: "Keep Editing"). */
  cancelLabel?: string;
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
  cancelLabel = 'Cancel',
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
            <Text style={styles.dialogCancelText}>{cancelLabel}</Text>
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

interface BlogFormProps {
  /** 'create' (default) keeps Create wording; 'edit' pre-fills and updates. */
  mode?: 'create' | 'edit';
  /** Header bar + page title ("Create Blog" / "Edit Blog"). */
  title: string;
  /** Page subtitle under the title. */
  subtitle: string;
  /** Starting field values; also the baseline for dirty-state detection. */
  initialForm: CreateBlogFormState;
  /** Leave the screen (after confirmation when the form is dirty). */
  onCancel: () => void;
  /**
   * Edit mode only: leave after the "Update Blog" confirmation (success toast
   * first). Falls back to onCancel when not provided.
   */
  onSaved?: () => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell; guarded by the dirty-state dialog like every other exit.
   */
  onTabPress?: (tab: string) => void;
}

export const BlogForm: React.FC<BlogFormProps> = ({
  mode = 'create',
  title,
  subtitle,
  initialForm,
  onCancel,
  onSaved,
  onTabPress,
}) => {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState<CreateBlogFormState>(initialForm);
  const [errors, setErrors] = useState<CreateBlogFieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  // Picker/overlay visibility
  const [imageChooserVisible, setImageChooserVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [discardDialogVisible, setDiscardDialogVisible] = useState(false);
  /** Tab press waiting on the discard dialog (leaving via the shell bar). */
  const [pendingTabPress, setPendingTabPress] = useState<string | null>(null);
  /** Create confirmation; visible while non-null. */
  const [primaryConfirm, setPrimaryConfirm] = useState<PrimaryConfirmConfig | null>(null);

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
    imageChooserVisible ||
    categoryPickerVisible ||
    statusPickerVisible;

  const updateField = <K extends keyof CreateBlogFormState>(
    field: K,
    value: CreateBlogFormState[K],
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

  const handleDiscardDialogCancel = () => {
    setDiscardDialogVisible(false);
    setPendingTabPress(null);
  };

  const handleDiscardConfirmed = () => {
    setDiscardDialogVisible(false);
    if (pendingTabPress) {
      const tab = pendingTabPress;
      setPendingTabPress(null);
      onTabPress?.(tab);
      return;
    }
    onCancel();
  };

  // Preview-shell tabs: leaving with unsaved changes asks first.
  const handleShellTabPress = (tab: string) => {
    if (tab === 'blogs') {
      return;
    }
    if (tab === 'events' || tab === 'news' || tab === 'rights') {
      if (!isDirty) {
        onTabPress?.(tab);
        return;
      }
      setPendingTabPress(tab);
      setDiscardDialogVisible(true);
      return;
    }
    Alert.alert(
      'Preview shell',
      'Global navigation is owned by the app-level architecture. This bar is a temporary visual preview only.',
    );
  };

  const runValidation = (): boolean => {
    setSubmitted(true);
    const validationErrors = validateBlogForm(form);
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
    setToast({ message: 'Blog saved as draft.', variant: 'success' });
  };

  const handleCreatePress = () => {
    if (runValidation()) {
      setPrimaryConfirm(
        isEdit
          ? {
              icon: '📝',
              title: 'Update Blog?',
              message: 'Save your changes to this blog?',
              confirmLabel: 'Update',
              toast: 'Blog updated successfully.',
            }
          : {
              icon: '📝',
              title: 'Create Blog?',
              message: 'Are you sure you want to create this blog?',
              confirmLabel: 'Create',
              toast: 'Blog created successfully.',
            },
      );
    }
  };

  const handlePrimaryConfirmed = () => {
    const config = primaryConfirm;
    setPrimaryConfirm(null);
    // UI-only confirmation — no backend call, nothing is persisted remotely.
    if (config) {
      setToast({ message: config.toast, variant: 'success' });
    }
    // Reference flow: back to the Blogs list after create, Blog Details after
    // update. Brief delay so the success toast is visible before leaving.
    setTimeout(isEdit ? onSaved || onCancel : onCancel, 900);
  };

  return (
    <View style={styles.root}>
      <AdminHeader showBack onBack={requestCancel} />

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

            {/* Cover image card (label + dashed upload area per reference) */}
            <View style={styles.coverCard}>
              <FieldShell label="Cover Image" required error={errors.coverImageUri}>
                {form.coverImageUri && isEdit ? (
                  /* Edit reference: preview + Change Image card side by side */
                  <View style={styles.editCoverRow}>
                    <View style={styles.editPreviewBox}>
                      <Image
                        source={{ uri: form.coverImageUri }}
                        style={styles.uploadPreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => updateField('coverImageUri', null)}
                        accessibilityRole="button"
                        accessibilityLabel="Remove cover image"
                      >
                        <Text style={styles.removeIcon}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.changeImageCard}
                      onPress={() => setImageChooserVisible(true)}
                      accessibilityRole="button"
                      accessibilityLabel="Change Cover Image"
                    >
                      <Text style={styles.changeCardIcon}>🖼️</Text>
                      <Text style={styles.changeCardTitle}>Change Image</Text>
                      <Text style={styles.changeCardMeta}>JPG, PNG or WebP</Text>
                      <Text style={styles.changeCardMeta}>(Max 5MB)</Text>
                    </TouchableOpacity>
                  </View>
                ) : form.coverImageUri ? (
                  <View>
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: form.coverImageUri }}
                        style={styles.uploadPreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => updateField('coverImageUri', null)}
                        accessibilityRole="button"
                        accessibilityLabel="Remove cover image"
                      >
                        <Text style={styles.removeIcon}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={() => setImageChooserVisible(true)}
                      accessibilityRole="button"
                      accessibilityLabel="Change Cover Image"
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
                    accessibilityLabel="Upload cover image"
                  >
                    <View style={styles.uploadEmpty} pointerEvents="none">
                      <Text style={styles.uploadIcon}>🖼️</Text>
                      <Text style={styles.uploadTitle}>Upload Cover Image</Text>
                      <Text style={styles.uploadSubtitle}>JPG, PNG or WebP (Max 5MB)</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </FieldShell>
            </View>

            {/* Blog title */}
            <FieldShell label="Blog Title" required error={errors.title}>
              <IconInput
                icon="📄"
                value={form.title}
                onChangeText={value => updateField('title', value)}
                placeholder="Enter blog title"
                hasError={Boolean(errors.title)}
                accessibilityLabel="Blog Title"
              />
            </FieldShell>

            {/* Category */}
            <FieldShell label="Category" required error={errors.category}>
              <SelectField
                icon="🗂️"
                value={form.category}
                placeholder="Select category"
                hasError={Boolean(errors.category)}
                onPress={() => setCategoryPickerVisible(true)}
              />
            </FieldShell>

            {/* Short description */}
            <FieldShell
              label="Short Description"
              required
              counter={`${form.shortDescription.length}/${SHORT_DESCRIPTION_MAX_LENGTH}`}
              error={errors.shortDescription}
            >
              <IconTextArea
                icon="≡"
                value={form.shortDescription}
                onChangeText={value =>
                  updateField('shortDescription', value.slice(0, SHORT_DESCRIPTION_MAX_LENGTH))
                }
                placeholder="Enter a short description (2–3 lines)"
                hasError={Boolean(errors.shortDescription)}
                minHeight={90}
                accessibilityLabel="Short Description"
              />
            </FieldShell>

            {/* Blog content */}
            <FieldShell
              label="Blog Content"
              required
              counter={`${form.content.length}/${CONTENT_MAX_LENGTH}`}
              error={errors.content}
            >
              <IconTextArea
                icon="✏️"
                value={form.content}
                onChangeText={value => updateField('content', value.slice(0, CONTENT_MAX_LENGTH))}
                placeholder="Write your blog content here..."
                hasError={Boolean(errors.content)}
                minHeight={150}
                accessibilityLabel="Blog Content"
              />
            </FieldShell>

            {/* Author */}
            <FieldShell
              label="Author"
              required
              error={errors.author}
              helperText={
                isEdit
                  ? 'Name of the author or organization.'
                  : 'This name will be displayed on the blog article.'
              }
            >
              <IconInput
                icon="👤"
                value={form.author}
                onChangeText={value => updateField('author', value)}
                placeholder="Enter author name"
                hasError={Boolean(errors.author)}
                accessibilityLabel="Author"
              />
            </FieldShell>

            {/* Status */}
            <FieldShell
              label="Status"
              required
              error={errors.status}
              helperText="You can publish the blog later."
            >
              <SelectField
                icon="🏷️"
                value={form.status ? BLOG_STATUS_LABELS[form.status] : null}
                placeholder="Select status"
                hasError={Boolean(errors.status)}
                onPress={() => setStatusPickerVisible(true)}
              />
            </FieldShell>

            {/* Additional options card (reference) */}
            <View style={styles.optionsCard}>
              <Text style={styles.optionsTitle}>Additional Options</Text>
              <View style={styles.optionRow}>
                <Text style={styles.optionIcon}>💬</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Allow Comments</Text>
                  <Text style={styles.optionSubtitle}>Allow users to comment on this blog</Text>
                </View>
                <Switch
                  value={form.allowComments}
                  onValueChange={value => updateField('allowComments', value)}
                  trackColor={{ true: AdminColors.primary, false: AdminColors.border }}
                  thumbColor={AdminColors.cardSurface}
                  accessibilityLabel="Allow Comments"
                />
              </View>
              <View style={styles.optionDivider} />
              <View style={styles.optionRow}>
                <Text style={styles.optionIcon}>📌</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Featured Blog</Text>
                  <Text style={styles.optionSubtitle}>Show this blog in featured section</Text>
                </View>
                <Switch
                  value={form.featured}
                  onValueChange={value => updateField('featured', value)}
                  trackColor={{ true: AdminColors.primary, false: AdminColors.border }}
                  thumbColor={AdminColors.cardSurface}
                  accessibilityLabel="Featured Blog"
                />
              </View>
            </View>

            {/* Tags: chips editor in edit mode, comma input in create mode */}
            <FieldShell
              label="Tags (Optional)"
              helperText={
                isEdit
                  ? undefined
                  : 'Add relevant tags to help users find this blog (e.g. rights, law, citizen)'
              }
            >
              {isEdit ? (
                <EventTagInput
                  tags={parseTagList(form.tagsText)}
                  onChange={tags => updateField('tagsText', tags.join(', '))}
                />
              ) : (
                <IconInput
                  icon="🏷️"
                  value={form.tagsText}
                  onChangeText={value => updateField('tagsText', value)}
                  placeholder="Enter tags separated by commas"
                  hasError={false}
                  accessibilityLabel="Tags"
                />
              )}
            </FieldShell>

            {/* Bottom actions (reference: Save Draft + Create/Update Blog) */}
            <View style={styles.bottomActions}>
              <AppButton
                title={isEdit ? 'Save as Draft' : 'Save Draft'}
                variant="outline"
                size="md"
                onPress={handleSaveDraft}
                icon={<Text style={styles.saveDraftIcon}>📄</Text>}
                style={styles.bottomButton}
              />
              <AppButton
                title={isEdit ? 'Update Blog' : 'Create Blog'}
                variant="primary"
                size="md"
                onPress={handleCreatePress}
                icon={isEdit ? undefined : <Text style={styles.createIcon}>✈️</Text>}
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

      {/* Create confirmation (UI-only, no backend) */}
      <BlogConfirmDialog
        visible={primaryConfirm !== null}
        icon={primaryConfirm?.icon ?? '📝'}
        iconTone="info"
        title={primaryConfirm?.title ?? ''}
        message={primaryConfirm?.message ?? ''}
        confirmLabel={primaryConfirm?.confirmLabel ?? ''}
        onCancel={() => setPrimaryConfirm(null)}
        onConfirm={handlePrimaryConfirmed}
      />

      {/* Discard changes (reference dialog; cancel label per reference) */}
      <BlogConfirmDialog
        visible={discardDialogVisible}
        icon="⚠️"
        iconTone="warning"
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to leave this screen? Your changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        destructive
        onCancel={handleDiscardDialogCancel}
        onConfirm={handleDiscardConfirmed}
      />

      {/* WhatsApp-Style Cover image chooser (Camera, Gallery, Presets, URL) */}
      <AppMediaUploadSheet
        visible={imageChooserVisible}
        title="Select Blog Cover Image"
        subtitle="Camera, Gallery, File or Curated Presets"
        currentValue={form.coverImageUri}
        onSelect={value => {
          updateField('coverImageUri', value);
          setToast({
            message: value
              ? isEdit ? 'Cover image updated.' : 'Cover image selected.'
              : 'Cover image removed.',
            variant: 'success',
          });
        }}
        onClose={() => setImageChooserVisible(false)}
      />

      <EventPickerSheet
        visible={categoryPickerVisible}
        title="Select Category"
        hint="Demo options only — not backend values"
        options={SAMPLE_BLOG_CATEGORIES}
        selected={form.category}
        onSelect={value => updateField('category', value)}
        onClose={() => setCategoryPickerVisible(false)}
      />

      <EventPickerSheet
        visible={statusPickerVisible}
        title="Select Status"
        hint="UI-only status selection"
        // Edit offers the full existing BlogStatus set (the blog may already
        // be archived); Create never archives a new blog.
        options={isEdit ? ['DRAFT', 'PUBLISHED', 'ARCHIVED'] : ['DRAFT', 'PUBLISHED']}
        selected={form.status}
        itemLabel={value => BLOG_STATUS_LABELS[value as CreateBlogFormState['status']]}
        onSelect={value => updateField('status', value as CreateBlogFormState['status'])}
        onClose={() => setStatusPickerVisible(false)}
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

  coverCard: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },

  fieldShell: {
    // gap handled by scrollContent's gap; keep shell lean
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

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  textAreaRow: {
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  inputError: {
    borderColor: AdminColors.error,
  },
  inputIcon: {
    fontSize: 13,
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  input: {
    flex: 1,
    minWidth: 0,
    ...Typography.body,
    color: AdminColors.textPrimary,
    paddingVertical: 0,
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

  uploadArea: {
    height: 170,
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

  // Edit-mode cover row (reference: preview + Change Image card side by side)
  editCoverRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  editPreviewBox: {
    flex: 1.35,
    height: 170,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.primary,
    overflow: 'hidden',
    backgroundColor: AdminColors.background,
  },
  changeImageCard: {
    flex: 1,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
  },
  changeCardIcon: {
    fontSize: 22,
    marginBottom: Spacing.xs,
  },
  changeCardTitle: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: AdminColors.textPrimary,
  },
  changeCardMeta: {
    ...Typography.caption,
    color: AdminColors.textMuted,
  },

  optionsCard: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  optionsTitle: {
    ...Typography.sectionHeader,
    fontSize: 15,
    lineHeight: 20,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  optionIcon: {
    fontSize: 15,
  },
  optionText: {
    flex: 1,
    minWidth: 0,
    marginRight: Spacing.xs,
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
  optionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AdminColors.border,
    marginVertical: Spacing.sm,
  },

  bottomActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  bottomButton: {
    flex: 1,
    paddingHorizontal: 0,
  },
  saveDraftIcon: {
    fontSize: 13,
  },
  createIcon: {
    fontSize: 13,
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
