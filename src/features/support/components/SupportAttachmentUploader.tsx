import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import { TicketAttachment } from '../types/ticket.types';

interface SupportAttachmentUploaderProps {
  attachments: TicketAttachment[];
  onAddAttachment: (attachment: TicketAttachment) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (ext: string): { icon: string; bg: string; color: string } => {
  const norm = ext.toLowerCase();
  if (norm === 'pdf') {
    return { icon: '📄', bg: '#FEE2E2', color: '#DC2626' };
  }
  if (norm === 'doc' || norm === 'docx') {
    return { icon: '📝', bg: '#DBEAFE', color: '#1D4ED8' };
  }
  if (['jpg', 'jpeg', 'png', 'webp'].includes(norm)) {
    return { icon: '🖼️', bg: '#DCFCE7', color: '#16A34A' };
  }
  return { icon: '📎', bg: '#F1F5F9', color: '#475569' };
};

export const SupportAttachmentUploader: React.FC<SupportAttachmentUploaderProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePickFile = () => {
    setUploadError(null);

    // In web browser environment: trigger real native file dialog
    const doc = typeof globalThis !== 'undefined' ? (globalThis as any).document : undefined;
    if (doc) {
      const input = doc.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,.pdf,.doc,.docx';
      input.multiple = true;

      input.onchange = (e: any) => {
        const files: any = e.target?.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const ext = file.name.split('.').pop()?.toLowerCase() || '';

          // Validate file size (max 5 MB)
          if (file.size > MAX_FILE_SIZE_BYTES) {
            setUploadError(`"${file.name}" exceeds the 5 MB file size limit.`);
            continue;
          }

          // Validate allowed extension
          const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'];
          if (!allowedExts.includes(ext)) {
            setUploadError(`"${file.name}" format is not supported. Use JPG, PNG, PDF, or DOC.`);
            continue;
          }

          const newAttachment: TicketAttachment = {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            size: file.size,
            formattedSize: formatBytes(file.size),
            type: ext,
            uri: URL.createObjectURL(file),
          };

          onAddAttachment(newAttachment);
        }
      };

      input.click();
    }
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>Attach Files (Optional)</Text>

      {/* Upload Affordance Card */}
      <TouchableOpacity
        style={styles.dropzone}
        onPress={handlePickFile}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Tap to upload files. Max 5 MB each."
      >
        <View style={styles.cloudIconContainer}>
          <Text style={styles.cloudIcon}>☁️</Text>
        </View>
        <Text style={styles.dropzoneTitle}>Tap to upload files</Text>
        <Text style={styles.dropzoneSubtitle}>
          Support Images, PDF, DOC, JPG, PNG (Max 5 MB each)
        </Text>
      </TouchableOpacity>

      {/* Upload Error Banner */}
      {uploadError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {uploadError}</Text>
        </View>
      )}

      {/* Attached Files List */}
      {attachments.length > 0 && (
        <View style={styles.filesGrid}>
          {attachments.map(file => {
            const iconCfg = getFileIcon(file.type);
            return (
              <View key={file.id} style={styles.fileCard}>
                {/* Remove Cross Button */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => onRemoveAttachment(file.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${file.name}`}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>

                {/* File Icon Tile */}
                <View style={[styles.fileIconTile, { backgroundColor: iconCfg.bg }]}>
                  <Text style={styles.fileEmoji}>{iconCfg.icon}</Text>
                </View>

                {/* File Name & Formatted Size */}
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileSize}>{file.formattedSize}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm + 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  dropzone: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cloudIcon: {
    fontSize: 22,
  },
  dropzoneTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  dropzoneSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  errorText: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '600',
  },
  filesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  fileCard: {
    width: '23%',
    minWidth: 74,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  removeButton: {
    position: 'absolute',
    top: 3,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  removeText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '800',
  },
  fileIconTile: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginTop: 2,
  },
  fileEmoji: {
    fontSize: 16,
  },
  fileName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    width: '90%',
  },
  fileSize: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
});
