import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { MembershipApplicationItem } from '../types/membershipApplications.types';
import {
  DocumentItemData,
  MembershipDocumentViewerModal,
} from './MembershipDocumentViewerModal';
import { resolveUploadedFileUri } from '../services/uploadedDocumentsCache';

interface MembershipDocumentsTabProps {
  application: MembershipApplicationItem;
  onViewDocument?: (doc: DocumentItemData) => void;
}

export const MembershipDocumentsTab: React.FC<MembershipDocumentsTabProps> = ({
  application,
  onViewDocument,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItemData | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  const photoDoc = application.documents?.find(
    doc => (doc.title || doc.fileName || doc.id || '').toLowerCase().includes('photo')
  );
  const resolvedAvatar =
    (application.avatarUrl ? resolveUploadedFileUri(undefined, application.avatarUrl) : undefined) ||
    (photoDoc?.uri ? resolveUploadedFileUri(photoDoc.fileName, photoDoc.uri) : undefined) ||
    resolveUploadedFileUri(photoDoc?.fileName) ||
    resolveUploadedFileUri(application.applicantName) ||
    undefined;

  // Filter to show ONLY documents that were actually uploaded by the user
  const isUploadedByUser = (d: any): boolean => {
    if (!d) return false;

    // Documents with a valid file URI (from camera scan, device file picker, or remote server upload)
    const hasValidUri = Boolean(
      (d.uri && typeof d.uri === 'string' && d.uri.trim().length > 0) ||
      (d.fileUri && typeof d.fileUri === 'string' && d.fileUri.trim().length > 0) ||
      (d.url && typeof d.url === 'string' && d.url.trim().length > 0)
    );
    if (hasValidUri) return true;

    // Filter out known fake preset file placeholders that were never uploaded by the user
    const fileName = (d.fileName || '').toLowerCase().trim();
    const fakePlaceholderNames = [
      'aadhaar_card_scanned.pdf',
      'electricity_bill_sept.pdf',
      'degree_certificate.pdf',
      'passport_size_white_bg.jpg',
      'pan_card_front_back.pdf',
      'passport_scan_page1.pdf',
      'voter_id_official.pdf',
      'driving_license_valid.jpg',
      'rent_agreement_notarized.pdf',
      'bank_statement_last_month.pdf',
      'lpg_gas_bill_aug.pdf',
      'qualification_marksheet.pdf',
      'diploma_certificate.pdf',
      'board_passing_cert.pdf',
      'recent_headshot_hd.jpg',
      'studio_formal_photo.png',
    ];
    if (fakePlaceholderNames.includes(fileName)) {
      return false;
    }

    if (fileName.includes('_applicant.pdf') || fileName.includes('_applicant.jpg')) {
      return false;
    }

    if (d.isUploaded !== undefined) {
      return Boolean(d.isUploaded);
    }

    // Default to true for authentic document objects with valid file names
    return Boolean(d.fileName && d.fileName.trim().length > 0);
  };

  const rawDocs = application.documents && application.documents.length > 0
    ? application.documents.filter(isUploadedByUser)
    : [];

  const documents: DocumentItemData[] = rawDocs.map(d => ({
    ...d,
    uri: resolveUploadedFileUri(d.fileName, d.uri),
  }));

  const handleOpenDoc = (doc: DocumentItemData) => {
    const resolvedDoc = {
      ...doc,
      uri: resolveUploadedFileUri(doc.fileName, doc.uri),
    };
    setSelectedDoc(resolvedDoc);
    setViewerVisible(true);
    onViewDocument?.(resolvedDoc);
  };

  const renderFileIcon = (doc: DocumentItemData) => {
    const isImage =
      doc.fileName.toLowerCase().endsWith('.jpg') ||
      doc.fileName.toLowerCase().endsWith('.jpeg') ||
      doc.fileName.toLowerCase().endsWith('.png') ||
      doc.fileName.toLowerCase().endsWith('.webp');

    if (isImage) {
      return (
        <View style={styles.imageIconBadge}>
          <Text style={styles.imageIconSymbol}>🖼️</Text>
        </View>
      );
    }

    return (
      <View style={styles.pdfIconBadge}>
        <Text style={styles.pdfIconDoc}>📄</Text>
        <Text style={styles.pdfIconText}>PDF</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Card Header with Blue Document Icon */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>📄</Text>
          </View>
          <Text style={styles.sectionHeader}>Submitted Documents</Text>
        </View>

        <View style={styles.divider} />

        {/* Documents List or Empty State */}
        {documents.length === 0 ? (
          <View style={styles.emptyDocsContainer}>
            <Text style={styles.emptyDocsIcon}>📁</Text>
            <Text style={styles.emptyDocsText}>No documents attached to this application</Text>
          </View>
        ) : (
          <View style={styles.docList}>
            {documents.map(doc => (
              <View key={doc.id} style={styles.docRow}>
                {/* File type icon badge */}
                <View style={styles.iconCol}>{renderFileIcon(doc)}</View>

                {/* Title and metadata */}
                <View style={styles.docDetails}>
                  <Text style={styles.docTitle} numberOfLines={1}>
                    {doc.title}
                  </Text>
                  <Text style={styles.docMeta} numberOfLines={1}>
                    {doc.fileName} • {doc.fileSize} • {doc.uploadDate}
                  </Text>
                </View>

                {/* View Button */}
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleOpenDoc(doc)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${doc.title}`}
                >
                  <Text style={styles.viewEyeIcon}>👁</Text>
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Interactive Document Preview Modal */}
      <MembershipDocumentViewerModal
        visible={viewerVisible}
        document={selectedDoc}
        applicant={{
          applicantName: application.applicantName,
          applicationId: application.applicationId,
          membershipType: application.membershipType,
          dob: application.dob,
          gender: application.gender,
          phone: application.phone,
          email: application.email,
          address: application.address,
          fatherName: application.fatherName,
          occupation: application.occupation,
          avatarUrl: resolvedAvatar || application.avatarUrl,
        }}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8EFF8',
    padding: 16,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 14,
    color: '#1E3A8A',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 12,
    marginBottom: 12,
  },
  docList: {
    gap: 12,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    padding: 10,
    gap: 10,
  },
  iconCol: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfIconDoc: {
    fontSize: 12,
  },
  pdfIconText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#DC2626',
    marginTop: -2,
  },
  imageIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIconSymbol: {
    fontSize: 18,
  },
  docDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2860',
  },
  docMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF3FC',
    borderWidth: 1,
    borderColor: '#D8E5F8',
  },
  viewEyeIcon: {
    fontSize: 11,
    color: '#1D4ED8',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  emptyDocsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyDocsIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyDocsText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
});
