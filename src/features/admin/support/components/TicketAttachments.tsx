import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppCard } from '../../../../core/components/common/AppCard';
import { AppEmptyState } from '../../../../core/components/common/AppEmptyState';
import { AppErrorState } from '../../../../core/components/common/AppErrorState';
import { SkeletonCard } from '../../../../core/components/common/AppSkeleton';
import { colors, spacing, typography } from '../../../../core/theme/theme';
import { formatDate, formatFileSize } from '../../../../core/utils/format';
import { API_BASE_URL } from '../../../../core/config';
import { getSession } from '../../../../core/auth/storage';
import { useTicketAttachments } from '../hooks/useTicketAttachments';
import type { TicketDocumentItem } from '../services/support.documents.types';

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

// Attachments are fetched from the shared documents module
// (related_entity_type=SUPPORT_TICKET). Preview uses an authenticated
// request - the download endpoint requires a bearer token, so URLs are never
// opened or logged directly.
function AttachmentPreviewModal({
  document: doc,
  onClose,
}: {
  document: TicketDocumentItem;
  onClose: () => void;
}) {
  const [token, setToken] = useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    getSession().then(session => {
      if (mounted) {
        setToken(session?.accessToken ?? null);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} accessibilityLabel={`Attachment preview: ${doc.document_name}`}>
      <View style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle} numberOfLines={1}>
            {doc.document_name}
          </Text>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close preview">
            <Text style={styles.previewClose}>✕</Text>
          </TouchableOpacity>
        </View>
        {isImage(doc.mime_type) && token ? (
          <Image
            source={{
              uri: `${API_BASE_URL}/documents/${doc.id}/download`,
              headers: { Authorization: `Bearer ${token}` },
            }}
            style={styles.previewImage}
            resizeMode="contain"
            accessibilityLabel={`Preview of ${doc.document_name}`}
          />
        ) : (
          <View style={styles.previewFallback}>
            <Text style={styles.previewFallbackTitle}>{doc.original_file_name}</Text>
            <Text style={styles.previewFallbackText}>
              Inline preview is available for image files. PDF and DOC viewing requires the
              shared document viewer integration.
            </Text>
          </View>
        )}
        <Text style={styles.previewMeta}>
          {doc.original_file_name} · {formatFileSize(doc.file_size)} · {formatDate(doc.created_at)}
        </Text>
      </View>
    </Modal>
  );
}

export function TicketAttachments({ ticketId }: { ticketId: string }) {
  const { documents, initialLoading, error, retry } = useTicketAttachments(ticketId);
  const [previewDoc, setPreviewDoc] = useState<TicketDocumentItem | null>(null);

  if (initialLoading) {
    return (
      <View>
        {[0, 1].map(index => (
          <SkeletonCard key={index} />
        ))}
      </View>
    );
  }

  if (error) {
    return <AppErrorState title="Unable to load attachments" message={error} onRetry={retry} />;
  }

  if (documents.length === 0) {
    return (
      <AppEmptyState
        title="No Attachments"
        message="No attachments have been uploaded to this ticket yet."
      />
    );
  }

  return (
    <View>
      {documents.map(doc => (
        <AppCard key={doc.id} style={styles.docCard}>
          <View style={styles.docRow}>
            <Text style={styles.docIcon}>
              {isImage(doc.mime_type) ? '🖼️' : '📄'}
            </Text>
            <View style={styles.docInfo}>
              <Text style={styles.docName} numberOfLines={1}>
                {doc.document_name}
              </Text>
              <Text style={styles.docMeta} numberOfLines={1}>
                {doc.original_file_name} · {formatFileSize(doc.file_size)} · {formatDate(doc.created_at)}
              </Text>
            </View>
          </View>
          <AppButton
            title="View"
            onPress={() => setPreviewDoc(doc)}
            variant="secondary"
            accessibilityLabel={`View ${doc.document_name}`}
          />
        </AppCard>
      ))}
      {previewDoc ? (
        <AttachmentPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  docCard: {
    marginBottom: spacing.md,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  docIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  docInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  docName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  docMeta: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginTop: 2,
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
  },
  previewTitle: {
    ...typography.sectionHeader,
    color: colors.white,
    flex: 1,
    marginRight: spacing.md,
  },
  previewClose: {
    color: colors.white,
    fontSize: 20,
  },
  previewImage: {
    flex: 1,
  },
  previewFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  previewFallbackTitle: {
    ...typography.sectionHeader,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  previewFallbackText: {
    ...typography.body,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  previewMeta: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});

export default TicketAttachments;
