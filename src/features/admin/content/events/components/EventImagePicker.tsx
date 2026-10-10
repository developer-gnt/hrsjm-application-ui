import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import { AppMediaUploadSheet } from '../../../../../core/components/common/AppMediaUploadSheet';

interface EventImagePickerProps {
  value: string | null;
  error?: string;
  onChange: (uri: string | null) => void;
}

export const EventImagePicker: React.FC<EventImagePickerProps> = ({ value, error, onChange }) => {
  const [chooserVisible, setChooserVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.dropzone, error ? styles.dropzoneError : null]}
        onPress={() => setChooserVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={value ? 'Change event image' : 'Upload event image'}
      >
        {value ? (
          <>
            <Image source={{ uri: value }} style={styles.previewImage} resizeMode="cover" />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onChange(null)}
              accessibilityRole="button"
              accessibilityLabel="Remove event image"
            >
              <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyContent} pointerEvents="none">
            <Text style={styles.emptyIcon}>🖼️</Text>
            <Text style={styles.emptyTitle}>Tap to upload event image</Text>
            <Text style={styles.emptySubtitle}>Camera, Gallery, or Presets (JPG, PNG)</Text>
          </View>
        )}
      </TouchableOpacity>

      <AppMediaUploadSheet
        visible={chooserVisible}
        title="Select Cover Image"
        subtitle="Camera, Gallery, File or Curated Presets"
        currentValue={value}
        onSelect={onChange}
        onClose={() => setChooserVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropzone: {
    height: 150,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: AdminColors.border,
    borderStyle: 'dashed',
    backgroundColor: AdminColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dropzoneError: {
    borderColor: AdminColors.error,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 26,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.bodyMedium,
    color: AdminColors.textPrimary,
  },
  emptySubtitle: {
    ...Typography.secondary,
    color: AdminColors.textMuted,
    marginTop: 2,
  },
  previewImage: {
    width: '100%',
    height: '100%',
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
});