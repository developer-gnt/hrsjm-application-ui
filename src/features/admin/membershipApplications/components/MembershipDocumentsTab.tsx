import React, { useState } from 'react';
import {
  Linking,
  Platform,
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

const STANDARD_CATEGORIES = [
  {
    key: 'IDENTITY_PROOF',
    title: 'Identity Proof',
    subtitle: 'Aadhaar / Voter ID / Passport',
    icon: '🪪',
    match: ['identity', 'aadhaar', 'pan', 'voter', 'passport', 'id_proof'],
  },
  {
    key: 'ADDRESS_PROOF',
    title: 'Address Proof',
    subtitle: 'Electricity Bill / Rent Agreement / Gas Bill',
    icon: '🏠',
    match: ['address', 'electricity', 'bill', 'rent', 'lpg', 'gas', 'residence'],
  },
  {
    key: 'QUALIFICATION_PROOF',
    title: 'Qualification Proof',
    subtitle: 'Educational Certificate / Marksheet',
    icon: '🎓',
    match: ['qualification', 'degree', 'diploma', 'marksheet', 'certificate', 'board', 'education'],
  },
  {
    key: 'PHOTOGRAPH',
    title: 'Photograph',
    subtitle: 'Passport Size Photo',
    icon: '👤',
    match: ['photo', 'photograph', 'avatar', 'passport_size', 'headshot', 'picture'],
  },
];

export const MembershipDocumentsTab: React.FC<MembershipDocumentsTabProps> = ({
  application,
  onViewDocument,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItemData | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  const rawDocs = application.documents || [];
  const photoDoc = rawDocs.find(
    doc => (doc.title || doc.fileName || doc.id || '').toLowerCase().includes('photo')
  );
  const resolvedAvatar =
    (application.avatarUrl ? resolveUploadedFileUri(undefined, application.avatarUrl) : undefined) ||
    (photoDoc?.uri ? resolveUploadedFileUri(photoDoc.fileName, photoDoc.uri) : undefined) ||
    resolveUploadedFileUri(photoDoc?.fileName) ||
    resolveUploadedFileUri(application.applicantName) ||
    undefined;

  const documents: DocumentItemData[] = rawDocs.map(d => {
    const rawUri =
      (d as any).file_url ||
      d.uri ||
      ((d as any).storage_path ? `/${(d as any).storage_path}` : undefined) ||
      (d as any).view_url ||
      (d as any).url;
    return {
      ...d,
      uri: resolveUploadedFileUri(d.fileName, rawUri || d.uri),
    };
  });

  const handleOpenDoc = (doc: DocumentItemData) => {
    const rawUri =
      (doc as any).file_url ||
      doc.uri ||
      ((doc as any).storage_path ? `/${(doc as any).storage_path}` : undefined) ||
      (doc as any).view_url;
    const resolvedDoc = {
      ...doc,
      uri: resolveUploadedFileUri(doc.fileName, rawUri || doc.uri),
    };
    setSelectedDoc(resolvedDoc);
    setViewerVisible(true);
    onViewDocument?.(resolvedDoc);
  };

  const handleDownloadDoc = (doc: DocumentItemData) => {
    const rawUri = doc.uri || (doc as any).download_url || (doc as any).file_url || (doc as any).url;
    const resolvedUri = resolveUploadedFileUri(doc.fileName, rawUri);
    const globalWin = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;

    if (Platform.OS === 'web' && globalWin && globalWin.document) {
      if (resolvedUri) {
        const link = globalWin.document.createElement('a');
        link.href = resolvedUri;
        link.download = doc.fileName || `${doc.title}.pdf`;
        globalWin.document.body.appendChild(link);
        link.click();
        globalWin.document.body.removeChild(link);
        return;
      }
    } else if (resolvedUri) {
      Linking.openURL(resolvedUri).catch(() => {});
    }
  };

  const isDocInCategory = (d: any, category: typeof STANDARD_CATEGORIES[0]): boolean => {
    const rawCat = ((d.category || d.category_name || '') + '').toLowerCase();
    const title = ((d.title || d.fileName || d.name || '') + '').toLowerCase();
    if (rawCat && (rawCat.includes(category.key.toLowerCase()) || rawCat.includes(category.title.toLowerCase()))) {
      return true;
    }
    return category.match.some(m => title.includes(m) || rawCat.includes(m));
  };

  const matchedDocIds = new Set<string>();
  const categoryCards = STANDARD_CATEGORIES.map(category => {
    const matchedDoc = documents.find(d => {
      if (matchedDocIds.has(d.id)) return false;
      return isDocInCategory(d, category);
    });
    if (matchedDoc) {
      matchedDocIds.add(matchedDoc.id);
    }
    return {
      category,
      document: matchedDoc,
    };
  });

  const additionalDocs = documents.filter(d => !matchedDocIds.has(d.id));

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
          <View style={styles.headerTextCol}>
            <Text style={styles.sectionHeader}>Verification Documents</Text>
            <Text style={styles.sectionSub}>Required applicant KYC and credential records</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Standard Category Checklist */}
        <View style={styles.docList}>
          {categoryCards.map(({ category, document: doc }) => {
            const isUploaded = Boolean(doc);
            return (
              <View key={category.key} style={[styles.docRow, !isUploaded && styles.docRowPending]}>
                {/* File type icon badge */}
                <View style={styles.iconCol}>
                  {doc ? renderFileIcon(doc) : (
                    <View style={styles.pendingIconBadge}>
                      <Text style={styles.pendingIconText}>{category.icon}</Text>
                    </View>
                  )}
                </View>

                {/* Title and metadata */}
                <View style={styles.docDetails}>
                  <View style={styles.titleRow}>
                    <Text style={styles.docTitle} numberOfLines={1}>
                      {category.title}
                    </Text>
                    <View style={[styles.statusBadge, isUploaded ? styles.statusBadgeUploaded : styles.statusBadgePending]}>
                      <Text style={[styles.statusBadgeText, isUploaded ? styles.statusBadgeTextUploaded : styles.statusBadgeTextPending]}>
                        {isUploaded ? (doc?.verified ? 'Verified' : 'Uploaded') : 'Pending Upload'}
                      </Text>
                    </View>
                  </View>
                  {doc ? (
                    <Text style={styles.docMeta} numberOfLines={1}>
                      {doc.fileName} • {doc.fileSize || '1.2 MB'} • {doc.uploadDate || 'Recently'}
                    </Text>
                  ) : (
                    <Text style={styles.docMetaPending} numberOfLines={1}>
                      {category.subtitle} · Not yet uploaded
                    </Text>
                  )}
                </View>

                {/* Actions: View & Download Buttons */}
                {doc ? (
                  <View style={styles.actionsRow}>
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

                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => handleDownloadDoc(doc)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Download ${doc.fileName || doc.title}`}
                    >
                      <Text style={styles.downloadIcon}>📥</Text>
                      <Text style={styles.downloadButtonText}>Download</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          })}

          {/* Additional Uploaded Documents if any */}
          {additionalDocs.map(doc => (
            <View key={doc.id} style={styles.docRow}>
              <View style={styles.iconCol}>{renderFileIcon(doc)}</View>
              <View style={styles.docDetails}>
                <View style={styles.titleRow}>
                  <Text style={styles.docTitle} numberOfLines={1}>
                    {doc.title || 'Additional Document'}
                  </Text>
                  <View style={[styles.statusBadge, styles.statusBadgeUploaded]}>
                    <Text style={[styles.statusBadgeText, styles.statusBadgeTextUploaded]}>
                      {doc.verified ? 'Verified' : 'Uploaded'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.docMeta} numberOfLines={1}>
                  {doc.fileName} • {doc.fileSize || '1.0 MB'} • {doc.uploadDate || 'Recently'}
                </Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleOpenDoc(doc)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewEyeIcon}>👁</Text>
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => handleDownloadDoc(doc)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.downloadIcon}>📥</Text>
                  <Text style={styles.downloadButtonText}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
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
  headerTextCol: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
  },
  sectionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
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
  docRowPending: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  iconCol: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingIconText: {
    fontSize: 16,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2860',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeUploaded: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  statusBadgeTextUploaded: {
    color: '#166534',
  },
  statusBadgeTextPending: {
    color: '#B45309',
  },
  docMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  docMetaPending: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
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
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  downloadIcon: {
    fontSize: 11,
    color: '#16A34A',
  },
  downloadButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
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
