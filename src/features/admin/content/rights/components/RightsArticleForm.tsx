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
import { AppButton, AppAvatar, AppMediaUploadSheet } from '../../../../../core/components';
import { EventPickerSheet } from '../../events/components/EventPickerSheet';
import { EventFormToast } from '../../events/components/EventFormToast';
import { AdminShellHeader } from '../../events/preview/AdminShellHeader';
import { AdminShellTabBar } from '../../events/preview/AdminShellTabBar';
import {
  DEMO_RIGHTS_AUTHOR,
  RIGHTS_COVER_IMAGE_OPTIONS,
  SAMPLE_RIGHTS_CATEGORIES,
} from '../data/sample-rights';
import { RIGHTS_STATUS_LABELS } from './RightsCard';
import type {
  RightsArticleFieldErrors,
  RightsArticleFormState,
} from '../types/rights.types';

/**
 * Shared Create/Edit Rights Article form (UI + local form behaviour only —
 * NO backend).
 *
 * Follows the Create Rights reference: page header with back arrow, white
 * cards with section titles, the dashed cover-image upload area with its
 * recommended-size helper, side-by-side Title/Category and Author/Status
 * rows, the rich-text-style toolbar above the article content editor, the
 * "Additional Options" toggles card, the Tags chip editor and the
 * Save as Draft / Publish Article actions.
 *
 * mode="edit" reuses the identical form pre-filled with the selected article:
 * the cover card switches to the Edit reference (preview with ✕ remove plus
 * side-by-side Change Image / Remove Image buttons), the primary action
 * becomes "Update Article" (confirm → toast → back to Right Article Details)
 * and the secondary becomes "Save Changes".
 *
 * Validation, pickers, dirty-state guard and confirmations are UI-only, and
 * reuse the same patterns as Create Blog (pickers, toast, overlay guard,
 * discard dialog).
 */

const SHORT_DESCRIPTION_MAX_LENGTH = 300;
const CONTENT_MAX_LENGTH = 5000;

/** Local frontend validation for the required Create Rights Article fields. */
const validateRightsArticleForm = (
  form: RightsArticleFormState,
): RightsArticleFieldErrors => {
  const errors: RightsArticleFieldErrors = {};

  if (!form.coverImageUri) {
    errors.coverImageUri = 'Cover image is required';
  }
  if (!form.title.trim()) {
    errors.title = 'Title is required';
  }
  if (!form.category) {
    errors.category = 'Category is required';
  }
  if (!form.shortDescription.trim()) {
    errors.shortDescription = 'Short description is required';
  }
  if (!form.content.trim()) {
    errors.content = 'Article content is required';
  }
  if (!form.author) {
    errors.author = 'Author is required';
  }
  if (!form.status) {
    errors.status = 'Status is required';
  }
  return errors;
};

/** Centered dialog matching the reference patterns (icon, title, message). */
const RightsFormDialog: React.FC<{
  visible: boolean;
  icon: string;
  iconTone?: 'info' | 'warning';
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
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

interface RightsArticleFormProps {
  /** 'create' (default) keeps Create wording; 'edit' pre-fills and updates. */
  mode?: 'create' | 'edit';
  /** Header bar + page title ("Create Rights Article" / "Edit Rights Article"). */
  title: string;
  /** Page subtitle under the title. */
  subtitle: string;
  /** Starting field values; also the baseline for dirty-state detection. */
  initialForm: RightsArticleFormState;
  /** Leave the screen (after confirmation when the form is dirty). */
  onCancel: () => void;
  /**
   * Edit mode only: leave after the "Update Article" confirmation (success
   * toast first). Falls back to onCancel when not provided.
   */
  onSaved?: () => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell; guarded by the dirty-state dialog like every other exit.
   */
  onTabPress?: (tab: string) => void;
}

/** Toolbar button (UI-only control, per the reference rich-text toolbar). */
const ToolbarButton: React.FC<{
  label: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}> = ({ label, bold, italic, underline }) => (
  <TouchableOpacity
    style={styles.toolbarButton}
    disabled
    accessibilityLabel={`Text style: ${label}`}
  >
    <Text
      style={[
        styles.toolbarIcon,
        bold && styles.toolbarBold,
        italic && styles.toolbarItalic,
        underline && styles.toolbarUnderline,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export const RightsArticleForm: React.FC<RightsArticleFormProps> = ({
  mode = 'create',
  title,
  subtitle,
  initialForm,
  onCancel,
  onSaved,
  onTabPress,
}) => {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState<RightsArticleFormState>(initialForm);
  const [errors, setErrors] = useState<RightsArticleFieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  // Picker/overlay visibility
  const [imageChooserVisible, setImageChooserVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [authorPickerVisible, setAuthorPickerVisible] = useState(false);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [discardDialogVisible, setDiscardDialogVisible] = useState(false);
  /** Tab press waiting on the discard dialog (leaving via the shell bar). */
  const [pendingTabPress, setPendingTabPress] = useState<string | null>(null);
  /** Publish confirmation; visible while non-null. */
  const [publishConfirmVisible, setPublishConfirmVisible] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm],
  );

  // Guards against stacking overlays: while one is visible, further
  // hardware-back presses do nothing until it is resolved.
  const overlayVisibleRef = useRef(false);
  overlayVisibleRef.current =
    publishConfirmVisible ||
    discardDialogVisible ||
    imageChooserVisible ||
    categoryPickerVisible ||
    authorPickerVisible ||
    statusPickerVisible;

  const updateField = <K extends keyof RightsArticleFormState>(
    field: K,
    value: RightsArticleFormState[K],
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
    if (tab === 'rights') {
      return;
    }
    if ((tab === 'events' || tab === 'news' || tab === 'blogs') && onTabPress) {
      if (!isDirty) {
        onTabPress(tab);
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
    const validationErrors = validateRightsArticleForm(form);
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
    setToast({
      message: isEdit ? 'Changes saved successfully.' : 'Article saved as draft.',
      variant: 'success',
    });
  };

  const handlePublishPress = () => {
    if (runValidation()) {
      setPublishConfirmVisible(true);
    }
  };

  const handlePublishConfirmed = () => {
    setPublishConfirmVisible(false);
    // UI-only confirmation — no backend call, nothing is persisted remotely.
    setToast({
      message: isEdit ? 'Article updated successfully.' : 'Article published successfully.',
      variant: 'success',
    });
    // Reference flow: return to Right Article Details after update. Brief
    // delay so the success toast is visible before leaving.
    if (isEdit) {
      setTimeout(onSaved || onCancel, 900);
    }
  };

  /** Tag chip add/remove (local state only). */
  const [tagDraft, setTagDraft] = useState('');
  const addTag = () => {
    const tag = tagDraft.trim();
    if (!tag || form.tags.includes(tag)) {
      setTagDraft('');
      return;
    }
    updateField('tags', [...form.tags, tag]);
    setTagDraft('');
  };
  const removeTag = (tag: string) => {
    updateField('tags', form.tags.filter(existing => existing !== tag));
  };

  /** Status pill tone per the reference: Draft amber, Published green. */
  const statusTone =
    form.status === 'PUBLISHED'
      ? { bg: AdminColors.statusActiveLight, text: AdminColors.statusActive }
      : { bg: AdminColors.warningLight, text: AdminColors.warning };

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
            {/* Page header: back pill + title/subtitle */}
            <View style={styles.pageHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={requestCancel}
                accessibilityRole="button"
                accessibilityLabel="Back to Know Your Rights"
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <View style={styles.pageHeaderText}>
                <Text style={styles.pageTitle}>{title}</Text>
                <Text style={styles.pageSubtitle}>{subtitle}</Text>
              </View>
            </View>

            {/* Cover image card */}
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Cover Image</Text>
                <Text style={styles.sectionHelper} numberOfLines={1}>
                  Recommended size: 1200 × 630 px (JPEG, PNG)
                </Text>
              </View>
              {form.coverImageUri && isEdit ? (
                /* Edit reference: preview (✕ remove) + Change/Remove buttons */
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
                  <View style={styles.editCoverActions}>
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={() => setImageChooserVisible(true)}
                      accessibilityRole="button"
                      accessibilityLabel="Change Image"
                    >
                      <Text style={styles.changeImageIcon}>📤</Text>
                      <Text style={styles.changeImageText}>Change Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => updateField('coverImageUri', null)}
                      accessibilityRole="button"
                      accessibilityLabel="Remove Image"
                    >
                      <Text style={styles.removeImageIcon}>🗑️</Text>
                      <Text style={styles.removeImageText}>Remove Image</Text>
                    </TouchableOpacity>
                  </View>
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
                  style={[
                    styles.uploadArea,
                    errors.coverImageUri && styles.inputError,
                  ]}
                  onPress={() => setImageChooserVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Add Cover Image"
                >
                  <View style={styles.uploadEmpty} pointerEvents="none">
                    <View style={styles.uploadIconRow}>
                      <Text style={styles.uploadIcon}>🖼️</Text>
                      <Text style={styles.uploadIconPlus}>＋</Text>
                    </View>
                    <Text style={styles.uploadTitle}>Add Cover Image</Text>
                    <Text style={styles.uploadSubtitle}>
                      Tap to upload an image or choose from gallery
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              <Text style={styles.uploadHelper}>
                A high-quality image helps make your article more engaging.
              </Text>
              {errors.coverImageUri ? (
                <Text style={styles.errorText}>{errors.coverImageUri}</Text>
              ) : null}
            </View>

            {/* Title + Category row */}
            <View style={styles.twoColRow}>
              <View style={styles.twoColFirst}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Title</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TextInput
                  value={form.title}
                  onChangeText={value => updateField('title', value)}
                  placeholder="Enter article title"
                  placeholderTextColor={AdminColors.textMuted}
                  style={[styles.input, errors.title && styles.inputError]}
                  accessibilityLabel="Title"
                />
                {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
              </View>
              <View style={styles.twoColSecond}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Category</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TouchableOpacity
                  style={[styles.input, styles.selectField, errors.category && styles.inputError]}
                  onPress={() => setCategoryPickerVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Category"
                >
                  <Text
                    style={[styles.selectValue, !form.category && styles.selectPlaceholder]}
                    numberOfLines={1}
                  >
                    {form.category ?? 'Select category'}
                  </Text>
                  <Text style={styles.selectChevron}>⌄</Text>
                </TouchableOpacity>
                {errors.category ? (
                  <Text style={styles.errorText}>{errors.category}</Text>
                ) : null}
              </View>
            </View>

            {/* Short description */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Short Description</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={[styles.textAreaContainer, errors.shortDescription && styles.inputError]}>
                <TextInput
                  value={form.shortDescription}
                  onChangeText={value =>
                    updateField('shortDescription', value.slice(0, SHORT_DESCRIPTION_MAX_LENGTH))
                  }
                  placeholder="Briefly describe what this article is about. This will be shown in the article list and helps users understand the content."
                  placeholderTextColor={AdminColors.textMuted}
                  multiline
                  textAlignVertical="top"
                  style={styles.textArea}
                  accessibilityLabel="Short Description"
                />
                <Text style={styles.counterText}>
                  {form.shortDescription.length}/{SHORT_DESCRIPTION_MAX_LENGTH}
                </Text>
              </View>
              {errors.shortDescription ? (
                <Text style={styles.errorText}>{errors.shortDescription}</Text>
              ) : null}
            </View>

            {/* Article content (toolbar + editor, per the reference) */}
            <View style={styles.fieldBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Article Content</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={[styles.editorContainer, errors.content && styles.inputError]}>
                <View style={styles.editorToolbar}>
                  <ToolbarButton label="B" bold />
                  <ToolbarButton label="I" italic />
                  <ToolbarButton label="U" bold underline />
                  <View style={styles.toolbarDivider} />
                  <ToolbarButton label="•≡" />
                  <ToolbarButton label="⋮≡" />
                  <View style={styles.toolbarDivider} />
                  <ToolbarButton label="🔗" />
                  <ToolbarButton label="🖼️" />
                  <View style={styles.toolbarFlex} />
                  <ToolbarButton label="↩" />
                  <ToolbarButton label="↪" />
                </View>
                <TextInput
                  value={form.content}
                  onChangeText={value => updateField('content', value.slice(0, CONTENT_MAX_LENGTH))}
                  placeholder="Write the full article content here..."
                  placeholderTextColor={AdminColors.textMuted}
                  multiline
                  textAlignVertical="top"
                  style={styles.editorBody}
                  accessibilityLabel="Article Content"
                />
                <Text style={styles.counterText}>
                  {form.content.length}/{CONTENT_MAX_LENGTH}
                </Text>
              </View>
              {errors.content ? <Text style={styles.errorText}>{errors.content}</Text> : null}
            </View>

            {/* Author + Status row */}
            <View style={styles.twoColRow}>
              <View style={styles.twoColFirst}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Author</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TouchableOpacity
                  style={[styles.input, styles.selectField, errors.author && styles.inputError]}
                  onPress={() => setAuthorPickerVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Author"
                >
                  <AppAvatar name={form.author ?? DEMO_RIGHTS_AUTHOR.name} size={26} />
                  <View style={styles.authorText}>
                    <Text style={styles.authorName} numberOfLines={1}>
                      {form.author ?? 'Select author'}
                    </Text>
                    <Text style={styles.authorRole} numberOfLines={1}>
                      {DEMO_RIGHTS_AUTHOR.role} / {DEMO_RIGHTS_AUTHOR.organization}
                    </Text>
                  </View>
                  <Text style={styles.selectChevron}>⌄</Text>
                </TouchableOpacity>
                {errors.author ? <Text style={styles.errorText}>{errors.author}</Text> : null}
              </View>
              <View style={styles.twoColSecond}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Status</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TouchableOpacity
                  style={[styles.input, styles.selectField, errors.status && styles.inputError]}
                  onPress={() => setStatusPickerVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Status"
                >
                  <View style={[styles.statusPill, { backgroundColor: statusTone.bg }]}>
                    <Text style={styles.statusPillIcon}>
                      {form.status === 'PUBLISHED' ? '✓' : '🕐'}
                    </Text>
                    <Text style={[styles.statusPillText, { color: statusTone.text }]}>
                      {form.status ? RIGHTS_STATUS_LABELS[form.status] : 'Select status'}
                    </Text>
                  </View>
                  <Text style={styles.selectChevron}>⌄</Text>
                </TouchableOpacity>
                {errors.status ? <Text style={styles.errorText}>{errors.status}</Text> : null}
              </View>
            </View>

            {/* Additional options card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Additional Options</Text>
              <View style={styles.optionRow}>
                <Text style={styles.optionIcon}>💬</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Allow Comments</Text>
                  <Text style={styles.optionSubtitle}>
                    Allow users to comment on this article
                  </Text>
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
                <Text style={styles.optionIcon}>⭐</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>Featured Article</Text>
                  <Text style={styles.optionSubtitle}>
                    Show this article as a featured article
                  </Text>
                </View>
                <Switch
                  value={form.featured}
                  onValueChange={value => updateField('featured', value)}
                  trackColor={{ true: AdminColors.primary, false: AdminColors.border }}
                  thumbColor={AdminColors.cardSurface}
                  accessibilityLabel="Featured Article"
                />
              </View>
            </View>

            {/* Tags card */}
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <Text style={styles.sectionHelper} numberOfLines={1}>
                  Add relevant tags to help users find this article
                </Text>
              </View>
              <View style={styles.tagInputRow}>
                <Text style={styles.tagIcon}>🏷️</Text>
                <TextInput
                  value={tagDraft}
                  onChangeText={setTagDraft}
                  onSubmitEditing={addTag}
                  onBlur={addTag}
                  placeholder="Type a tag and press enter..."
                  placeholderTextColor={AdminColors.textMuted}
                  style={styles.tagInput}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  accessibilityLabel="Add tag and press enter"
                />
              </View>
              {form.tags.length > 0 ? (
                <View style={styles.tagWrap}>
                  {form.tags.map(tag => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagChipText} numberOfLines={1}>
                        {tag}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeTag(tag)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove tag ${tag}`}
                      >
                        <Text style={styles.tagChipRemove}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {/* Bottom actions (Save as Draft + Publish / Save Changes + Update) */}
            <View style={styles.bottomActions}>
              <AppButton
                title={isEdit ? 'Save Changes' : 'Save as Draft'}
                variant="outline"
                size="md"
                onPress={handleSaveDraft}
                icon={<Text style={styles.buttonIcon}>📄</Text>}
                style={styles.bottomButton}
              />
              <AppButton
                title={isEdit ? 'Update Article' : 'Publish Article'}
                variant="primary"
                size="md"
                onPress={handlePublishPress}
                icon={<Text style={styles.buttonIcon}>✈️</Text>}
                style={styles.bottomButton}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* TEMPORARY preview shell: real bottom navigation is owned by the app-level architecture. */}
      <AdminShellTabBar activeTab="rights" onTabPress={handleShellTabPress} />

      <EventFormToast
        message={toast?.message ?? null}
        variant={toast?.variant ?? 'success'}
        onDismiss={() => setToast(null)}
      />

      {/* Publish / Update confirmation (UI-only, no backend) */}
      <RightsFormDialog
        visible={publishConfirmVisible}
        icon="📣"
        iconTone="info"
        title={isEdit ? 'Update this article?' : 'Publish this article?'}
        message={
          isEdit
            ? 'Are you sure you want to save these changes?'
            : 'Are you sure you want to publish this article?'
        }
        confirmLabel={isEdit ? 'Update' : 'Publish'}
        onCancel={() => setPublishConfirmVisible(false)}
        onConfirm={handlePublishConfirmed}
      />

      {/* Discard changes dialog (same pattern as Create Blog) */}
      <RightsFormDialog
        visible={discardDialogVisible}
        icon="⚠️"
        iconTone="warning"
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to leave this screen? Your changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Continue Editing"
        destructive
        onCancel={handleDiscardDialogCancel}
        onConfirm={handleDiscardConfirmed}
      />

      {/* WhatsApp-Style Cover image chooser (Camera, Gallery, Presets, URL) */}
      <AppMediaUploadSheet
        visible={imageChooserVisible}
        title="Select Rights Cover Image"
        subtitle="Camera, Gallery, File or Curated Presets"
        currentValue={form.coverImageUri}
        onSelect={value => {
          updateField('coverImageUri', value);
          setToast({
            message: value ? 'Cover image selected.' : 'Cover image removed.',
            variant: 'success',
          });
        }}
        onClose={() => setImageChooserVisible(false)}
      />

      <EventPickerSheet
        visible={categoryPickerVisible}
        title="Select Category"
        hint="Demo options only — not backend values"
        options={SAMPLE_RIGHTS_CATEGORIES}
        selected={form.category}
        onSelect={value => updateField('category', value)}
        onClose={() => setCategoryPickerVisible(false)}
      />

      <EventPickerSheet
        visible={authorPickerVisible}
        title="Select Author"
        hint="Demo options only — not backend values"
        options={[DEMO_RIGHTS_AUTHOR.name]}
        itemLabel={value =>
          `${value} — ${DEMO_RIGHTS_AUTHOR.role} / ${DEMO_RIGHTS_AUTHOR.organization}`
        }
        selected={form.author}
        onSelect={value => updateField('author', value)}
        onClose={() => setAuthorPickerVisible(false)}
      />

      <EventPickerSheet
        visible={statusPickerVisible}
        title="Select Status"
        hint="UI-only status selection"
        options={['DRAFT', 'PUBLISHED']}
        selected={form.status}
        itemLabel={value => RIGHTS_STATUS_LABELS[value as RightsArticleFormState['status']]}
        onSelect={value => updateField('status', value as RightsArticleFormState['status'])}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.primaryLight,
  },
  backIcon: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  pageHeaderText: {
    flex: 1,
    minWidth: 0,
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

  card: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.sectionHeader,
    fontSize: 15,
    lineHeight: 20,
    color: AdminColors.primaryDark,
  },
  sectionHelper: {
    ...Typography.caption,
    flexShrink: 1,
    textAlign: 'right',
    color: AdminColors.textMuted,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
  },
  requiredStar: {
    color: AdminColors.error,
    fontWeight: '700',
  },

  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  twoColFirst: {
    flex: 1.15,
    minWidth: 0,
  },
  twoColSecond: {
    flex: 1,
    minWidth: 0,
  },
  fieldBlock: {},

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
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  inputError: {
    borderColor: AdminColors.error,
  },
  errorText: {
    ...Typography.secondary,
    color: AdminColors.error,
    marginTop: Spacing.xs,
  },

  textAreaContainer: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  textArea: {
    ...Typography.body,
    color: AdminColors.textPrimary,
    minHeight: 96,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  counterText: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    textAlign: 'right',
    paddingBottom: Spacing.xs,
  },

  editorContainer: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    overflow: 'hidden',
  },
  editorToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    backgroundColor: AdminColors.background,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
  },
  toolbarButton: {
    minWidth: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  toolbarIcon: {
    fontSize: 13,
    color: AdminColors.textPrimary,
  },
  toolbarBold: {
    fontWeight: '700',
  },
  toolbarItalic: {
    fontStyle: 'italic',
  },
  toolbarUnderline: {
    textDecorationLine: 'underline',
  },
  toolbarDivider: {
    width: 1,
    height: 18,
    backgroundColor: AdminColors.border,
    marginHorizontal: 2,
  },
  toolbarFlex: {
    flex: 1,
  },
  editorBody: {
    ...Typography.body,
    color: AdminColors.textPrimary,
    minHeight: 120,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    textAlignVertical: 'top',
  },

  authorText: {
    flex: 1,
    minWidth: 0,
  },
  authorName: {
    ...Typography.secondaryMedium,
    color: AdminColors.textPrimary,
  },
  authorRole: {
    ...Typography.caption,
    color: AdminColors.textMuted,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusPillIcon: {
    fontSize: 12,
  },
  statusPillText: {
    ...Typography.secondaryMedium,
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

  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  tagIcon: {
    fontSize: 13,
  },
  tagInput: {
    flex: 1,
    minWidth: 0,
    ...Typography.body,
    color: AdminColors.textPrimary,
    paddingVertical: 0,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    maxWidth: 180,
  },
  tagChipText: {
    ...Typography.secondaryMedium,
    color: AdminColors.primary,
  },
  tagChipRemove: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primary,
  },

  uploadArea: {
    minHeight: 170,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: AdminColors.primary,
    borderStyle: 'dashed',
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: Spacing.md,
  },
  uploadEmpty: {
    alignItems: 'center',
  },
  uploadIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  uploadIcon: {
    fontSize: 30,
  },
  uploadIconPlus: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.info,
    marginLeft: -6,
    marginBottom: 2,
  },
  uploadTitle: {
    ...Typography.bodyMedium,
    color: AdminColors.primaryDark,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  uploadSubtitle: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  uploadHelper: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    marginTop: Spacing.sm,
  },

  // Edit-mode cover row (reference: preview + Change/Remove buttons)
  editCoverRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  editPreviewBox: {
    flex: 1.6,
    height: 170,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.primary,
    overflow: 'hidden',
    backgroundColor: AdminColors.background,
  },
  editCoverActions: {
    width: 150,
    gap: Spacing.sm,
    justifyContent: 'flex-start',
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 44,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.statusInactiveLight,
  },
  removeImageIcon: {
    fontSize: 12,
  },
  removeImageText: {
    ...Typography.secondaryMedium,
    color: AdminColors.error,
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

  bottomActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  bottomButton: {
    flex: 1,
    paddingHorizontal: 0,
  },
  buttonIcon: {
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
