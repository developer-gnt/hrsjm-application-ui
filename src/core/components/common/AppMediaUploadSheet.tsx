/**
 * WhatsApp-Style Media Upload Bottom Sheet for HRSJM.
 *
 * Provides real media selection options matching WhatsApp's attachment tray:
 *   1. 📸 Camera — Native live camera capture with runtime permissions
 *   2. 🖼️ Gallery — Native device photo / media library
 *   3. 📄 Document — File / image picker with web fallback
 *   4. 🎨 Presets — Curated high-definition Human Rights & Event covers
 *   5. 🔗 Web Link — Direct image URL input with live preview
 *
 * Cross-platform: Android, iOS, and Web.
 */
import React, { useState } from 'react';
import {
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { AdminColors, BorderRadius, Spacing, Typography, Shadows } from '../../../core/theme';
import {
  Camera,
  ImageIcon,
  FileText,
  LayoutGrid,
  ExternalLink,
  X,
  Check,
  Trash2,
  CheckCircle2,
  UploadCloud,
} from '../../../core/components/icons';

export interface PresetMediaOption {
  id: string;
  label: string;
  url: string;
}

export const DEFAULT_EVENT_COVER_PRESETS: PresetMediaOption[] = [
  {
    id: 'cov-1',
    label: 'Seminar & Conference',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov-2',
    label: 'Community & Charity Drive',
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov-3',
    label: 'Legal & Human Rights',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov-4',
    label: 'Youth & Education Workshop',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov-5',
    label: 'Health & Medical Camp',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cov-6',
    label: 'Celebration & Awards',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
  },
];

interface AppMediaUploadSheetProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  currentValue?: string | null;
  presets?: PresetMediaOption[];
  onSelect: (uri: string | null) => void;
  onClose: () => void;
}

export const AppMediaUploadSheet: React.FC<AppMediaUploadSheetProps> = ({
  visible,
  title = 'Attach Cover Image',
  subtitle = 'Choose a photo from your device or camera',
  currentValue,
  presets = DEFAULT_EVENT_COVER_PRESETS,
  onSelect,
  onClose,
}) => {
  const [selectedUri, setSelectedUri] = useState<string | null>(currentValue || null);
  const [activeTab, setActiveTab] = useState<'main' | 'presets' | 'url'>('main');
  const [customUrl, setCustomUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isWeb = Platform.OS === 'web' || typeof (globalThis as any).document !== 'undefined';

  const pickFromWeb = (isCamera: boolean) => {
    const webGlobal: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
    const doc = webGlobal.document;
    if (!doc) return;
    const input = doc.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (isCamera) {
      input.setAttribute('capture', 'environment');
    }
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file && webGlobal.FileReader) {
        const reader = new webGlobal.FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const uri = reader.result;
            setSelectedUri(uri);
            onSelect(uri);
            onClose();
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handlePickerResponse = (result: ImagePickerResponse) => {
    if (result.didCancel) return;
    if (result.errorCode) {
      if (result.errorCode === 'permission') {
        setErrorMsg('Camera or storage permission is required.');
      } else {
        setErrorMsg(result.errorMessage || 'Failed to select image.');
      }
      return;
    }

    const asset = result.assets?.[0];
    if (asset?.uri) {
      const uri = asset.uri;
      setSelectedUri(uri);
      onSelect(uri);
      onClose();
    } else if (asset?.base64) {
      const mime = asset.type || 'image/jpeg';
      const uri = `data:${mime};base64,${asset.base64}`;
      setSelectedUri(uri);
      onSelect(uri);
      onClose();
    }
  };

  const handleCameraLaunch = async () => {
    setErrorMsg(null);
    if (isWeb) {
      pickFromWeb(true);
      return;
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Access Required',
            message: 'HRSJM needs camera access to take event photos directly.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED && granted !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          // If denied, continue attempting launch in case intent works
        }
      } catch {
        // ignore
      }
    }

    try {
      const res = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        maxWidth: 1280,
        maxHeight: 1280,
        saveToPhotos: false,
      });
      handlePickerResponse(res);
    } catch (err: any) {
      if (isWeb) {
        pickFromWeb(true);
      } else {
        setErrorMsg(err?.message || 'Could not open camera.');
      }
    }
  };

  const handleGalleryLaunch = async () => {
    setErrorMsg(null);
    if (isWeb) {
      pickFromWeb(false);
      return;
    }

    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1280,
        maxHeight: 1280,
        selectionLimit: 1,
      });
      handlePickerResponse(res);
    } catch (err: any) {
      if (isWeb) {
        pickFromWeb(false);
      } else {
        setErrorMsg(err?.message || 'Could not open gallery.');
      }
    }
  };

  const handleDocumentPick = () => {
    // For images/documents, reuse standard file chooser
    if (isWeb) {
      pickFromWeb(false);
    } else {
      handleGalleryLaunch();
    }
  };

  const handleSelectPreset = (url: string) => {
    setSelectedUri(url);
    onSelect(url);
    onClose();
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setSelectedUri(customUrl.trim());
      onSelect(customUrl.trim());
      onClose();
    }
  };

  const handleRemove = () => {
    setSelectedUri(null);
    onSelect(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close media picker"
        />

        <SafeAreaView style={styles.sheetContainer} edges={['bottom', 'left', 'right']}>
          <View style={styles.sheet}>
            {/* Drag handle pill */}
            <View style={styles.handleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.sheetTitle}>{title}</Text>
                <Text style={styles.sheetSubtitle}>{subtitle}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={18} color={AdminColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Error banner */}
            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity onPress={() => setErrorMsg(null)}>
                  <X size={14} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Current Selection / Preview Card (if any) */}
            {currentValue && (
              <View style={styles.currentPreviewBar}>
                <Image source={{ uri: currentValue }} style={styles.thumbnail} />
                <View style={styles.previewInfo}>
                  <View style={styles.activeTagRow}>
                    <CheckCircle2 size={13} color="#0284C7" />
                    <Text style={styles.activeTagText}>Cover image active</Text>
                  </View>
                  <Text style={styles.previewSubtext}>Tap an option below to replace</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtnInline}
                  onPress={handleRemove}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                >
                  <Trash2 size={15} color={AdminColors.error} />
                </TouchableOpacity>
              </View>
            )}

            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={styles.scrollBodyContent}
              showsVerticalScrollIndicator={false}
            >
              {/* WhatsApp Action Buttons Tray */}
              <View style={styles.waTrayContainer}>
                {/* 1. Camera */}
                <TouchableOpacity
                  style={styles.waActionItem}
                  onPress={handleCameraLaunch}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Take Photo with Camera"
                >
                  <View style={[styles.waCircleBadge, { backgroundColor: '#E11D48' }]}>
                    <Camera size={24} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.waActionLabel}>Camera</Text>
                </TouchableOpacity>

                {/* 2. Gallery */}
                <TouchableOpacity
                  style={styles.waActionItem}
                  onPress={handleGalleryLaunch}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Choose from Gallery"
                >
                  <View style={[styles.waCircleBadge, { backgroundColor: '#7C3AED' }]}>
                    <ImageIcon size={24} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.waActionLabel}>Gallery</Text>
                </TouchableOpacity>

                {/* 3. Document / Files */}
                <TouchableOpacity
                  style={styles.waActionItem}
                  onPress={handleDocumentPick}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Select Document or File"
                >
                  <View style={[styles.waCircleBadge, { backgroundColor: '#2563EB' }]}>
                    <FileText size={24} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.waActionLabel}>Document</Text>
                </TouchableOpacity>

                {/* 4. Presets */}
                <TouchableOpacity
                  style={styles.waActionItem}
                  onPress={() => setActiveTab(activeTab === 'presets' ? 'main' : 'presets')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Browse Presets"
                >
                  <View
                    style={[
                      styles.waCircleBadge,
                      { backgroundColor: activeTab === 'presets' ? '#B45309' : '#D97706' },
                    ]}
                  >
                    <LayoutGrid size={24} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                  <Text
                    style={[
                      styles.waActionLabel,
                      activeTab === 'presets' && styles.waActionLabelActive,
                    ]}
                  >
                    Presets
                  </Text>
                </TouchableOpacity>

                {/* 5. Web URL */}
                <TouchableOpacity
                  style={styles.waActionItem}
                  onPress={() => setActiveTab(activeTab === 'url' ? 'main' : 'url')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Enter Web Link"
                >
                  <View
                    style={[
                      styles.waCircleBadge,
                      { backgroundColor: activeTab === 'url' ? '#047857' : '#059669' },
                    ]}
                  >
                    <ExternalLink size={24} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                  <Text
                    style={[
                      styles.waActionLabel,
                      activeTab === 'url' && styles.waActionLabelActive,
                    ]}
                  >
                    Web URL
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Collapsible: Preset Gallery */}
              {activeTab === 'presets' && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeading}>Curated Event Covers</Text>
                    <Text style={styles.sectionMeta}>{presets.length} options</Text>
                  </View>
                  <View style={styles.presetsGrid}>
                    {presets.map(item => {
                      const isSelected = currentValue === item.url || selectedUri === item.url;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.presetCard,
                            isSelected && styles.presetCardSelected,
                          ]}
                          onPress={() => handleSelectPreset(item.url)}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: item.url }} style={styles.presetImage} />
                          <View style={styles.presetOverlay}>
                            <Text style={styles.presetTitle} numberOfLines={1}>
                              {item.label}
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={styles.presetCheckBadge}>
                              <Check size={12} color="#FFFFFF" strokeWidth={3} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Collapsible: Custom Web URL */}
              {activeTab === 'url' && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeading}>Paste Image URL</Text>
                  <View style={styles.urlInputRow}>
                    <TextInput
                      style={styles.urlInput}
                      placeholder="https://example.com/cover-photo.jpg"
                      placeholderTextColor={AdminColors.textMuted}
                      value={customUrl}
                      onChangeText={setCustomUrl}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={[
                        styles.applyUrlBtn,
                        !customUrl.trim() && styles.applyUrlBtnDisabled,
                      ]}
                      onPress={handleApplyUrl}
                      disabled={!customUrl.trim()}
                    >
                      <Text style={styles.applyUrlText}>Use URL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl + 4,
    borderTopRightRadius: BorderRadius.xl + 4,
    overflow: 'hidden',
    ...Shadows.card,
  },
  sheet: {
    maxHeight: 520,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTextWrap: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: AdminColors.primaryDark,
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  currentPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    padding: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#E2E8F0',
  },
  previewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  activeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  previewSubtext: {
    fontSize: 10.5,
    color: '#0284C7',
    marginTop: 1,
  },
  removeBtnInline: {
    padding: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  scrollBody: {
    paddingHorizontal: Spacing.lg,
  },
  scrollBodyContent: {
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  waTrayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  waActionItem: {
    alignItems: 'center',
    width: 64,
  },
  waCircleBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...Shadows.card,
  },
  waActionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: AdminColors.textPrimary,
    textAlign: 'center',
  },
  waActionLabelActive: {
    color: AdminColors.primary,
    fontWeight: '700',
  },
  sectionContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AdminColors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionMeta: {
    fontSize: 11,
    color: AdminColors.textMuted,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  presetCard: {
    width: '48%',
    height: 95,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCardSelected: {
    borderColor: AdminColors.primary,
  },
  presetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  presetOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  presetTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  presetCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: AdminColors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.xs,
  },
  urlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    color: AdminColors.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  applyUrlBtn: {
    backgroundColor: AdminColors.primary,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyUrlBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  applyUrlText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
});

export default AppMediaUploadSheet;
