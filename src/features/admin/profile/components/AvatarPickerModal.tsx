/**
 * Professional Avatar Picker Modal for HRSJM.
 * Features:
 *   1. 📸 Open Camera (Live Photo Capture with System Camera)
 *   2. 🖼️ Upload from Device (Gallery / File Picker)
 *   3. 👤 High-Definition Professional Presets
 *   4. 🔗 Custom Photo URL Input
 *   5. 🗑️ Remove Photo (Reset to initials)
 *
 * Uses Lucide vector icons, curated typography tokens, and responsive layout.
 */
import React, { useState } from 'react';
import {
  Image,
  Modal,
  NativeModules,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { AdminColors, BorderRadius, Spacing, Typography, Shadows } from '../../../../core';
import { AppButton } from '../../../../core/components/common/AppButton';
import {
  Camera,
  ImageIcon,
  X,
  Check,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from '../../../../core/components/icons';

export const AVATAR_PRESETS = [
  {
    id: 'avatar-1',
    label: 'Executive',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-2',
    label: 'Professional Male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-3',
    label: 'Leader',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-4',
    label: 'Member Male',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-5',
    label: 'Member Female',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-6',
    label: 'Officer',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  },
];

interface AvatarPickerModalProps {
  visible: boolean;
  currentAvatarUrl?: string | null;
  onClose: () => void;
  onSelectAvatar: (url: string | null) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  visible,
  currentAvatarUrl,
  onClose,
  onSelectAvatar,
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(
    currentAvatarUrl || AVATAR_PRESETS[0].url,
  );
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);

  const isWeb = Platform.OS === 'web' || typeof (globalThis as any).document !== 'undefined';

  const pickFromWeb = (isCamera: boolean) => {
    const webGlobal: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
    const doc = webGlobal.document;
    if (!doc) return;
    const input = doc.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (isCamera) {
      input.setAttribute('capture', 'user');
    }
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file && webGlobal.FileReader) {
        const reader = new webGlobal.FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setSelectedUrl(reader.result);
            setShowCustomInput(false);
            setPickerError(null);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const processPickerResponse = (result: ImagePickerResponse) => {
    if (result.didCancel) return;
    if (result.errorCode) {
      if (result.errorCode === 'permission') {
        setPickerError('Permission needed to access photo.');
      } else {
        setPickerError(result.errorMessage || 'Unable to load photo.');
      }
      return;
    }

    const asset = result.assets?.[0];
    if (asset?.base64) {
      const mime = asset.type || 'image/jpeg';
      setSelectedUrl(`data:${mime};base64,${asset.base64}`);
      setShowCustomInput(false);
      setPickerError(null);
    } else if (asset?.uri) {
      setSelectedUrl(asset.uri);
      setShowCustomInput(false);
      setPickerError(null);
    }
  };

  const handleOpenCamera = async () => {
    setPickerError(null);
    if (isWeb) {
      pickFromWeb(true);
      return;
    }

    if (Platform.OS === 'android') {
      try {
        const hasCameraPerm = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (!hasCameraPerm) {
          const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'HRSJM needs access to your camera to take a profile photo.',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            },
          );
          if (status !== PermissionsAndroid.RESULTS.GRANTED && status !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            // continue anyway as system camera intent might still succeed
          }
        }
      } catch {
        // continue
      }
    }

    try {
      const response = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        saveToPhotos: false,
      });
      processPickerResponse(response);
    } catch (err: any) {
      if (typeof (globalThis as any).document !== 'undefined') {
        pickFromWeb(true);
      } else {
        setPickerError(err?.message || 'Could not open camera.');
      }
    }
  };

  const handleUploadFromDevice = async () => {
    setPickerError(null);
    if (isWeb) {
      pickFromWeb(false);
      return;
    }

    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        selectionLimit: 1,
      });
      processPickerResponse(response);
    } catch (err: any) {
      if (typeof (globalThis as any).document !== 'undefined') {
        pickFromWeb(false);
      } else {
        setPickerError(err?.message || 'Could not access photo library.');
      }
    }
  };

  const handleApply = () => {
    if (showCustomInput && customUrl.trim()) {
      onSelectAvatar(customUrl.trim());
    } else {
      onSelectAvatar(selectedUrl);
    }
    onClose();
  };

  const handleRemovePhoto = () => {
    onSelectAvatar(null);
    onClose();
  };

  const isPresetSelected = (url: string) =>
    !showCustomInput && selectedUrl === url;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalCard}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>Change Profile Photo</Text>
              <Text style={styles.subtitle}>
                Choose a photo for your profile and membership ID card.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close photo picker"
            >
              <X size={18} color={AdminColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick Upload Action Buttons: Camera & Device */}
            <Text style={styles.sectionLabel}>Upload New Photo</Text>
            <View style={styles.deviceActionsRow}>
              {/* Camera Card */}
              <TouchableOpacity
                style={styles.deviceActionCard}
                onPress={handleOpenCamera}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Take Photo with Camera"
              >
                <View style={styles.cameraIconBadge}>
                  <Camera size={20} color="#1D4ED8" strokeWidth={2.2} />
                </View>
                <Text style={styles.deviceActionTitle}>Take Photo</Text>
                <Text style={styles.deviceActionSub}>Open Camera</Text>
              </TouchableOpacity>

              {/* Upload Card */}
              <TouchableOpacity
                style={styles.deviceActionCard}
                onPress={handleUploadFromDevice}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Upload File from Device"
              >
                <View style={styles.galleryIconBadge}>
                  <ImageIcon size={20} color="#B45309" strokeWidth={2.2} />
                </View>
                <Text style={styles.deviceActionTitle}>Upload File</Text>
                <Text style={styles.deviceActionSub}>Device / Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* Error / Notice Banner */}
            {pickerError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{pickerError}</Text>
                <TouchableOpacity onPress={() => setPickerError(null)}>
                  <X size={14} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Selected Photo Preview */}
            {selectedUrl ? (
              <View style={styles.previewContainer}>
                <View style={styles.previewImageWrap}>
                  <Image source={{ uri: selectedUrl }} style={styles.previewImage} />
                </View>
                <View style={styles.previewDetails}>
                  <View style={styles.previewTitleRow}>
                    <CheckCircle2 size={14} color="#0284C7" />
                    <Text style={styles.previewLabel}>Selected Photo Preview</Text>
                  </View>
                  <Text style={styles.previewHint}>
                    Synchronizes with Header, Profile &amp; ID Card
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Curated Presets Grid */}
            <Text style={[styles.sectionLabel, { marginTop: Spacing.sm }]}>
              Or Choose a Professional Preset
            </Text>
            <View style={styles.grid}>
              {AVATAR_PRESETS.map(preset => {
                const selected = isPresetSelected(preset.url);
                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[
                      styles.avatarOption,
                      selected && styles.avatarOptionSelected,
                    ]}
                    onPress={() => {
                      setShowCustomInput(false);
                      setSelectedUrl(preset.url);
                      setPickerError(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: preset.url }}
                      style={styles.presetImage}
                    />
                    {selected ? (
                      <View style={styles.checkmarkBadge}>
                        <Check size={11} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom URL Input Toggle */}
            <TouchableOpacity
              style={styles.customToggle}
              onPress={() => setShowCustomInput(!showCustomInput)}
              activeOpacity={0.7}
            >
              <ExternalLink size={13} color={AdminColors.primary} />
              <Text style={styles.customToggleText}>
                {showCustomInput ? 'Hide URL input' : 'Enter custom photo URL'}
              </Text>
            </TouchableOpacity>

            {showCustomInput ? (
              <View style={styles.customInputWrap}>
                <TextInput
                  value={customUrl}
                  onChangeText={text => {
                    setCustomUrl(text);
                    if (text.trim()) setSelectedUrl(text.trim());
                  }}
                  placeholder="https://example.com/my-photo.jpg"
                  placeholderTextColor={AdminColors.textMuted}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            ) : null}
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.actions}>
            {currentAvatarUrl ? (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemovePhoto}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color={AdminColors.error} />
                <Text style={styles.removeButtonText}>
                  Remove Photo (Reset to Initials)
                </Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.actionButtonsRow}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="sm"
                onPress={onClose}
                style={styles.btn}
              />
              <AppButton
                title="Save Photo"
                variant="primary"
                size="sm"
                onPress={handleApply}
                style={styles.btn}
              />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 32, 70, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    ...Shadows.card,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: AdminColors.primaryDark,
    letterSpacing: -0.2,
  },
  subtitle: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  closeButton: {
    padding: 6,
    borderRadius: BorderRadius.sm,
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionLabel: {
    ...Typography.secondaryMedium,
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.textSecondary,
    marginBottom: Spacing.xs + 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  deviceActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.md,
  },
  deviceActionCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cameraIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  galleryIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deviceActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  deviceActionSub: {
    fontSize: 10.5,
    color: AdminColors.textSecondary,
    marginTop: 1,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 10,
    marginBottom: Spacing.sm,
  },
  previewImageWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: AdminColors.primary,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewDetails: {
    flex: 1,
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  previewLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0369A1',
  },
  previewHint: {
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  avatarOption: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  avatarOptionSelected: {
    borderColor: AdminColors.primary,
    borderWidth: 3,
  },
  presetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: AdminColors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  customToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
    marginTop: 2,
  },
  customToggleText: {
    color: AdminColors.primary,
    fontSize: 12.5,
    fontWeight: '600',
  },
  customInputWrap: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 13,
    color: AdminColors.primaryDark,
    backgroundColor: '#F8FAFC',
  },
  actions: {
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
    paddingVertical: 4,
  },
  removeButtonText: {
    color: AdminColors.error,
    fontSize: 12.5,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btn: {
    flex: 1,
  },
});

export default AvatarPickerModal;
