import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';

export interface DocumentItemData {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uri?: string;
}

interface MembershipDocumentViewerModalProps {
  visible: boolean;
  document?: DocumentItemData | null;
  onClose: () => void;
}

export const MembershipDocumentViewerModal: React.FC<MembershipDocumentViewerModalProps> = ({
  visible,
  document,
  onClose,
}) => {
  if (!document) return null;

  const isPdf = document.fileName.toLowerCase().endsWith('.pdf') || document.title.toLowerCase().includes('pdf');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={styles.headerIcon}>{isPdf ? '📕' : '🖼️'}</Text>
                  <Text style={styles.titleText} numberOfLines={1}>
                    {document.title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Close document viewer"
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Preview Area */}
              <View style={styles.previewBox}>
                <View style={styles.previewCenter}>
                  <Text style={styles.largeIcon}>{isPdf ? '📄' : '🖼️'}</Text>
                  <Text style={styles.previewFileName} numberOfLines={2}>
                    {document.fileName}
                  </Text>
                  <Text style={styles.previewMeta}>
                    {document.fileSize} • Uploaded {document.uploadDate}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified Document Attachment</Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.footerActions}>
                <TouchableOpacity
                  style={styles.closeActionBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeActionText}>Close Preview</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerIcon: {
    fontSize: 18,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
    flex: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    marginVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCenter: {
    alignItems: 'center',
  },
  largeIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  previewFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewMeta: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeActionBtn: {
    flex: 1,
    backgroundColor: '#0F2860',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
