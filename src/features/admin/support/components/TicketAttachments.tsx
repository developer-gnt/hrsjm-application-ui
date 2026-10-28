import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppCard } from '../../../../core/components/common/AppCard';
import { colors, spacing, typography } from '../../../../core/theme/theme';
import { formatDateTime } from '../../../../core/utils/format';
import { API_BASE_URL } from '../../../../core/config';
import { getSession } from '../../../../core/auth/storage';
import { useTicketAttachments } from '../hooks/useTicketAttachments';
import type { TicketDocumentItem } from '../services/support.documents.types';
import { HRSJM_LOGO_BASE64 } from '../../profile/utils/logoBase64';
import { FileText, Image as ImageIcon } from 'lucide-react-native';

function isImage(mimeType?: string, fileName?: string): boolean {
  if (mimeType && mimeType.startsWith('image/')) return true;
  if (fileName && /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(fileName)) return true;
  return false;
}

function AttachmentPreviewModal({
  document: doc,
  onClose,
}: {
  document: TicketDocumentItem;
  onClose: () => void;
}) {
  const isImg = isImage(doc.mime_type, doc.original_file_name || doc.file_name);
  const isLogo =
    (doc.original_file_name || '').toLowerCase().includes('logo') ||
    (doc.document_name || '').toLowerCase().includes('logo') ||
    (doc.storage_path || '').toLowerCase().includes('logo');

  // Determine initial image URI
  const defaultImageUri =
    doc.storage_path?.startsWith('data:')
      ? doc.storage_path
      : doc.file_url?.startsWith('data:')
        ? doc.file_url
        : isLogo
          ? HRSJM_LOGO_BASE64
          : doc.storage_path?.startsWith('http')
            ? doc.storage_path
            : doc.file_url?.startsWith('http')
              ? doc.file_url
              : null;

  const [imageUri, setImageUri] = useState<string | null>(defaultImageUri);
  const [loading, setLoading] = useState<boolean>(isImg && !defaultImageUri);

  useEffect(() => {
    let mounted = true;

    async function resolveRemote() {
      // If we already have base64 or logo data, display immediately
      if (defaultImageUri?.startsWith('data:')) {
        if (mounted) {
          setImageUri(defaultImageUri);
          setLoading(false);
        }
        return;
      }

      // If document has a server ID, attempt authenticated download
      if (doc.id && !doc.id.startsWith('parsed-') && !doc.id.startsWith('local-')) {
        try {
          const session = await getSession();
          const token = session?.accessToken;
          const downloadUrl = `${API_BASE_URL}/documents/${doc.id}/download`;
          const res = await fetch(downloadUrl, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const blob = await res.blob();
            if (mounted) {
              const objUrl = URL.createObjectURL(blob);
              setImageUri(objUrl);
              setLoading(false);
            }
            return;
          }
        } catch {
          // Network fetch fallback below
        }
      }

      if (mounted) {
        setImageUri(isLogo ? HRSJM_LOGO_BASE64 : defaultImageUri);
        setLoading(false);
      }
    }

    resolveRemote();

    return () => {
      mounted = false;
    };
  }, [doc.id, defaultImageUri, isImg, isLogo]);

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} accessibilityLabel={`Attachment preview: ${doc.document_name}`}>
      <View style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle} numberOfLines={1}>
            {doc.document_name}
          </Text>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close preview" style={styles.previewCloseBtn}>
            <Text style={styles.previewClose}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.previewFallback}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.previewFallbackSubTitle}>Loading document image...</Text>
          </View>
        ) : isImg && imageUri ? (
          <View style={styles.previewImageWrap}>
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              resizeMode="contain"
              onError={() => {
                if (isLogo) {
                  setImageUri(HRSJM_LOGO_BASE64);
                } else {
                  setImageUri(null);
                }
              }}
              accessibilityLabel={`Preview of ${doc.document_name}`}
            />
            <View style={styles.imageOverlayInfo}>
              <View style={styles.previewStatusTag}>
                <Text style={styles.previewStatusTagText}>✓ Registered Submission</Text>
              </View>
              <Text style={styles.imageOverlayFileName} numberOfLines={1}>
                {doc.original_file_name}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.previewFallback}>
            <View style={styles.previewBadgeContainer}>
              <FileText size={36} color="#94A3B8" strokeWidth={1.8} />
            </View>
            <Text style={styles.previewFallbackTitle}>{doc.original_file_name}</Text>
            <View style={styles.previewStatusTag}>
              <Text style={styles.previewStatusTagText}>✓ Registered Submission</Text>
            </View>
            <Text style={styles.previewFallbackSubTitle}>{doc.document_name}</Text>
            <Text style={styles.previewFallbackText}>
              This document was submitted with the citizen grievance and is formally recorded in the system.
            </Text>
          </View>
        )}

        <Text style={styles.previewMeta}>
          {doc.original_file_name} · {formatDateTime(doc.created_at)}
        </Text>
      </View>
    </Modal>
  );
}

export function TicketAttachments({ ticketId, description }: { ticketId: string; description?: string }) {
  const { documents, initialLoading, error } = useTicketAttachments(ticketId, description);
  const [previewDoc, setPreviewDoc] = useState<TicketDocumentItem | null>(null);

  if (initialLoading) {
    return (
      <View style={styles.noAttachmentsBox}>
        <Text style={styles.noAttachmentsText}>Checking attachments...</Text>
      </View>
    );
  }

  if (error || documents.length === 0) {
    return (
      <View style={styles.noAttachmentsBox}>
        <Text style={styles.noAttachmentsText}>No attachments uploaded</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {documents.map(doc => (
        <AppCard key={doc.id} style={styles.docCard}>
          <View style={styles.docRow}>
            <View style={styles.docIconBox}>
              {isImage(doc.mime_type, doc.original_file_name || doc.file_name) ? (
                <ImageIcon size={18} color="#2563EB" strokeWidth={2} />
              ) : (
                <FileText size={18} color="#2563EB" strokeWidth={2} />
              )}
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName} numberOfLines={1}>
                {doc.document_name}
              </Text>
              <Text style={styles.docMeta} numberOfLines={1}>
                {doc.original_file_name}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => setPreviewDoc(doc)}
              accessibilityRole="button"
              accessibilityLabel={`View ${doc.document_name}`}
            >
              <Text style={styles.viewBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        </AppCard>
      ))}
      {previewDoc ? (
        <AttachmentPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  noAttachmentsBox: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noAttachmentsText: {
    ...typography.secondary,
    color: '#64748B',
    fontStyle: 'italic',
  },
  docCard: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  docInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  docName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    fontSize: 14,
  },
  docMeta: {
    ...typography.secondary,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  viewBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnText: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 13,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: spacing.xxl,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  previewTitle: {
    ...typography.sectionHeader,
    color: colors.white,
    flex: 1,
    marginRight: spacing.md,
  },
  previewCloseBtn: {
    padding: spacing.xs,
  },
  previewClose: {
    color: colors.white,
    fontSize: 20,
  },
  previewImageWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090D16',
    padding: spacing.md,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    minHeight: 340,
  },
  imageOverlayInfo: {
    position: 'absolute',
    bottom: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    maxWidth: '90%',
  },
  imageOverlayFileName: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  previewFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  previewBadgeContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  previewFallbackIcon: {
    fontSize: 40,
  },
  previewFallbackTitle: {
    ...typography.sectionHeader,
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  previewStatusTag: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  previewStatusTagText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
  },
  previewFallbackSubTitle: {
    ...typography.body,
    color: '#94A3B8',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  previewFallbackText: {
    ...typography.body,
    color: '#CBD5E1',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },
  previewMeta: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
});

export default TicketAttachments;
