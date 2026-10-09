import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import type { DocumentItem } from '../types/membership.types';

interface DocumentUploadCardProps {
  index: number;
  title: string;
  subtitle: string;
  document?: DocumentItem;
  error?: string;
  onUpload: () => void;
  onCameraPress?: () => void;
  onFilePress?: () => void;
  onRemove: () => void;
  onPreview?: () => void;
}

export function DocumentUploadCard({
  index,
  title,
  subtitle,
  document,
  error,
  onUpload,
  onCameraPress,
  onFilePress,
  onRemove,
  onPreview,
}: DocumentUploadCardProps) {
  const isUploaded = document && document.isUploaded;

  return (
    <View style={styles.container}>
      {/* Header row with step number and labels */}
      <View style={styles.headerRow}>
        <View style={styles.indexCircle}>
          <Text style={styles.indexText}>{index}</Text>
        </View>

        <View style={styles.labelWrap}>
          <Text style={styles.title}>
            {title} <Text style={styles.requiredStar}>*</Text>
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* Upload area */}
      {isUploaded ? (
        <TouchableOpacity
          style={styles.uploadedBox}
          activeOpacity={0.8}
          onPress={onPreview || onUpload}
          accessibilityRole="button"
          accessibilityLabel={`Uploaded ${title}: ${document.fileName}. Tap to preview or change`}>
          <View style={styles.fileIconWrap}>
            <Icon
              name={document.fileName?.endsWith('.pdf') ? 'file-pdf' : 'file-text'}
              size={24}
              color={colors.primary}
              strokeWidth={2}
            />
          </View>

          <View style={styles.fileDetails}>
            <Text style={styles.fileName} numberOfLines={1}>
              {document.fileName || 'document.pdf'}
            </Text>
            <View style={styles.fileMetaRow}>
              <View style={styles.successPill}>
                <Icon name="check" size={10} color={colors.active} strokeWidth={3} />
                <Text style={styles.successText}>Attached</Text>
              </View>
              <Text style={styles.fileSize}>{document.fileSize || '1.8 MB'}</Text>
            </View>
          </View>

          <View style={styles.actionBtns}>
            <TouchableOpacity
              onPress={onUpload}
              style={styles.replaceBtn}
              accessibilityLabel={`Change ${title}`}>
              <Text style={styles.replaceText}>Change</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onRemove}
              style={styles.removeBtn}
              accessibilityLabel={`Remove ${title}`}>
              <Icon name="x-circle" size={18} color={colors.danger} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={[styles.emptyContainer, error ? styles.uploadBoxError : undefined]}>
          <TouchableOpacity
            style={styles.mainUploadTapArea}
            activeOpacity={0.75}
            onPress={onUpload}
            accessibilityRole="button"
            accessibilityLabel={`Tap to upload ${title}, JPG PNG or PDF Max 5MB`}>
            <View style={styles.uploadIconCircle}>
              <Icon name="upload" size={20} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.uploadTextWrap}>
              <Text style={styles.uploadMainText}>Tap to choose document</Text>
              <Text style={styles.uploadHintText}>PDF, JPG or PNG (Max 5MB)</Text>
            </View>
          </TouchableOpacity>

          {/* Direct Quick Action Buttons for Camera & File Storage */}
          <View style={styles.directActionsRow}>
            <TouchableOpacity
              style={styles.directActionBtn}
              activeOpacity={0.7}
              onPress={onCameraPress || onUpload}>
              <Icon name="camera" size={15} color="#0284C7" strokeWidth={2.2} />
              <Text style={styles.directActionCameraText}>Camera Scan</Text>
            </TouchableOpacity>

            <View style={styles.directDivider} />

            <TouchableOpacity
              style={styles.directActionBtn}
              activeOpacity={0.7}
              onPress={onFilePress || onUpload}>
              <Icon name="file-text" size={15} color={colors.primary} strokeWidth={2.2} />
              <Text style={styles.directActionFileText}>Browse Files</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
    marginBottom: spacing.sm + 2,
  },
  indexCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAF1FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  indexText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  labelWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#16274B',
  },
  requiredStar: {
    color: colors.danger,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  emptyContainer: {
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#D4E2FC',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  mainUploadTapArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  uploadBoxError: {
    borderColor: colors.danger,
    backgroundColor: '#FFF8F8',
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextWrap: {
    flex: 1,
  },
  uploadMainText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16274B',
  },
  uploadHintText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  directActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  directActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    gap: 6,
  },
  directActionCameraText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  directActionFileText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  directDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
  },
  uploadedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.md,
  },
  fileIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: '#EAF1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  successPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  successText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.active,
  },
  fileSize: {
    fontSize: 11,
    color: '#64748B',
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  replaceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#EAF1FE',
  },
  replaceText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  removeBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 11.5,
    color: colors.danger,
    marginTop: 6,
    fontWeight: '500',
  },
});

export default DocumentUploadCard;
