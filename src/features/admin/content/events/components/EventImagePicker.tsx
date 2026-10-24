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
import { ImageIcon } from '../../../../../core/components/icons';

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
            <View style={styles.emptyIconContainer}>
              <ImageIcon size={38} color="#94A3B8" strokeWidth={1.6} />
            </View>
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
    height: 146,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBE3F9',
    borderStyle: 'dashed',
    backgroundColor: '#FAFCFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dropzoneError: {
    borderColor: '#DC2626',
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06294D',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
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