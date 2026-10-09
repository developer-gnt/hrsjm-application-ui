import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import { AppBottomSheet } from '../../../core/components/common/AppBottomSheet';
import {
  choosePhotoFromNativeGallery,
  takePhotoWithNativeCamera,
} from '../utils/filePicker';

interface ImagePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectImage: (uri: string) => void;
  onRemoveImage?: () => void;
  currentImageUri?: string;
}

const GALLERY_PRESETS = [
  {
    id: 'g1',
    label: 'Professional 1',
    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'g2',
    label: 'Professional 2',
    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'g3',
    label: 'Formal 1',
    uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'g4',
    label: 'Formal 2',
    uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'g5',
    label: 'Passport Photo',
    uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'g6',
    label: 'Studio Photo',
    uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
  },
];

export function ImagePickerSheet({
  visible,
  onClose,
  onSelectImage,
  onRemoveImage,
  currentImageUri,
}: ImagePickerSheetProps) {
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const handleNativeCamera = async () => {
    setLoading(true);
    try {
      const result = await takePhotoWithNativeCamera('front');
      if (result && result.uri) {
        onSelectImage(result.uri);
        onClose();
      }
    } catch (e) {
      console.warn('Camera error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleNativeGallery = async () => {
    setLoading(true);
    try {
      const result = await choosePhotoFromNativeGallery();
      if (result && result.uri) {
        onSelectImage(result.uri);
        onClose();
      }
    } catch (e) {
      console.warn('Gallery error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (uri: string) => {
    onSelectImage(uri);
    onClose();
  };

  const handleApplyCustom = () => {
    if (customUrl.trim().length > 0) {
      onSelectImage(customUrl.trim());
      setCustomUrl('');
      onClose();
    }
  };

  return (
    <AppBottomSheet visible={visible} title="Upload Profile Photo" onClose={onClose}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Opening device camera / storage...</Text>
          </View>
        ) : (
          <>
            {/* Primary Action Buttons: Native Camera & Device Files */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={handleNativeCamera}>
                <View style={[styles.actionIconCircle, { backgroundColor: '#E0F2FE' }]}>
                  <Icon name="camera" size={24} color="#0284C7" strokeWidth={2.3} />
                </View>
                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionTitle}>Take Photo</Text>
                  <Text style={styles.actionSub}>Open Phone Camera</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={handleNativeGallery}>
                <View style={[styles.actionIconCircle, { backgroundColor: '#EAF1FE' }]}>
                  <Icon name="upload" size={24} color={colors.primary} strokeWidth={2.3} />
                </View>
                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionTitle}>Choose from Files</Text>
                  <Text style={styles.actionSub}>Gallery & Storage</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Presets Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Or Choose Fast Sample Photo:</Text>
            </View>

            <ScrollView style={styles.galleryScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.photosGrid}>
                {GALLERY_PRESETS.map(item => {
                  const isSelected = currentImageUri === item.uri;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.photoItem, isSelected && styles.photoItemSelected]}
                      activeOpacity={0.8}
                      onPress={() => handleSelectPreset(item.uri)}>
                      <Image source={{ uri: item.uri }} style={styles.photoImg} />
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Icon name="check" size={12} color={colors.white} strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom File / URL Input */}
              <View style={styles.customBox}>
                <Text style={styles.customLabel}>Or enter custom photo path / URL:</Text>
                <View style={styles.customInputRow}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="https://... or /path/to/photo.jpg"
                    placeholderTextColor="#94A3B8"
                    value={customUrl}
                    onChangeText={setCustomUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.customUseBtn}
                    onPress={handleApplyCustom}
                    disabled={!customUrl.trim()}>
                    <Text style={styles.customUseText}>Select</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remove option if photo exists */}
              {currentImageUri && onRemoveImage ? (
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => {
                    onRemoveImage();
                    onClose();
                  }}>
                  <Icon name="x-circle" size={16} color={colors.danger} strokeWidth={2.2} />
                  <Text style={styles.removePhotoText}>Remove Current Photo</Text>
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          </>
        )}
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    padding: spacing.md - 2,
    borderWidth: 1.5,
    borderColor: '#D4E2FC',
    gap: 10,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16274B',
  },
  actionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  galleryScroll: {
    maxHeight: 330,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  photoItem: {
    width: '30.5%',
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#EAF1FE',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  photoItemSelected: {
    borderColor: colors.primary,
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBox: {
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  customLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 40,
    gap: 8,
  },
  customInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#16274B',
  },
  customUseBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  customUseText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  removePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
});

export default ImagePickerSheet;
