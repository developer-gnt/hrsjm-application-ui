import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../../core/api/client';
import { API_ENDPOINTS } from '../../../../core/api/endpoints';
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
import { resolveUploadedFileUri, getAllUploadedDocuments } from '../services/uploadedDocumentsCache';
import { usersStore } from '../../users/services/usersStore';
import { getRegistrationState } from '../../../auth/state/registrationState';

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
  const [asyncDocs, setAsyncDocs] = useState<DocumentItemData[]>([]);

  const isSeeker =
    application.accountType === 'seeker' ||
    (application.applicationId || '').startsWith('HRSJM-SEK') ||
    (application.membershipType || '').toLowerCase().includes('seeker');

  // 1. Asynchronously fetch latest documents from backend
  useEffect(() => {
    let mounted = true;
    if (application.id) {
      const endpoint = isSeeker
        ? `${API_ENDPOINTS.ASSISTANCE.LIST}/${application.id}/documents`
        : `${API_ENDPOINTS.MEMBERSHIPS.LIST}/${application.id}/documents`;

      apiClient
        .get<any>(endpoint)
        .then((res: any) => {
          if (!mounted) return;
          const data =
            (res as any)?.data?.data ||
            (res as any)?.data?.documents ||
            (res as any)?.data ||
            (res as any)?.documents ||
            res;
          const items = Array.isArray(data) ? data : [];
          if (items.length > 0) {
            const mapped = items.map((d: any, idx: number) => {
              const fileName = d.fileName || d.file_name || d.original_file_name || d.name || 'document.pdf';
              const sPath = d.storage_path ? `/${String(d.storage_path).replace(/\\/g, '/')}` : undefined;
              const rawUri = sPath || d.uri || d.fileUri || d.url;
              return {
                id: d.id || `doc-async-${idx}`,
                title: d.title || d.document_name || (isSeeker ? 'Identity / Verification Document' : 'Membership Document'),
                fileName,
                fileSize: d.fileSize || (d.file_size ? `${Math.round(d.file_size / 1024)} KB` : '1 MB'),
                uploadDate: d.uploadDate || d.uploadedAt || (d.created_at ? new Date(d.created_at).toLocaleDateString('en-GB') : 'Recently'),
                uri: resolveUploadedFileUri(fileName, rawUri),
                isUploaded: true,
                verified: Boolean(d.verified),
              };
            });
            if (mapped.length > 0) {
              setAsyncDocs(mapped);
            }
          }
        })
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [application.id, application.applicationId, isSeeker]);

  const photoDoc = application.documents?.find(
    doc => (doc.title || doc.fileName || doc.id || '').toLowerCase().includes('photo')
  );
  const resolvedAvatar =
    (application.avatarUrl ? resolveUploadedFileUri(undefined, application.avatarUrl) : undefined) ||
    (photoDoc?.uri ? resolveUploadedFileUri(photoDoc.fileName, photoDoc.uri) : undefined) ||
    resolveUploadedFileUri(photoDoc?.fileName) ||
    resolveUploadedFileUri(application.applicantName) ||
    undefined;

  // Filter to show authentic uploaded documents
  const isUploadedByUser = (d: any): boolean => {
    if (!d) return false;

    const uri =
      d.uri ||
      d.fileUri ||
      d.url ||
      (d.storage_path ? `/${String(d.storage_path).replace(/\\/g, '/')}` : undefined);
    const hasValidUri = Boolean(uri && typeof uri === 'string' && uri.trim().length > 0);
    if (hasValidUri) return true;

    const fileName = (
      d.fileName ||
      d.file_name ||
      d.original_file_name ||
      d.name ||
      ''
    )
      .toLowerCase()
      .trim();

    const fakePlaceholderNames = [
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

    return Boolean(fileName && fileName.length > 0);
  };

  let rawDocs: DocumentItemData[] = [];
  if (asyncDocs.length > 0) {
    rawDocs = [...asyncDocs];
  } else if (application.documents && application.documents.length > 0) {
    rawDocs = (application.documents as any[]).filter(isUploadedByUser).map((d: any, idx: number) => ({
      id: d.id || `doc-app-${idx}`,
      title: d.title || d.document_name || 'Verification Document',
      fileName: d.fileName || d.file_name || 'document.pdf',
      fileSize: d.fileSize || '1 MB',
      uploadDate: d.uploadDate || d.uploadedAt || 'Recently',
      uri: resolveUploadedFileUri(d.fileName || d.file_name, d.uri || d.fileUri || (d.storage_path ? `/${String(d.storage_path).replace(/\\/g, '/')}` : undefined)),
      isUploaded: true,
      verified: Boolean(d.verified),
    }));
  }

  // Fallback 1: Query usersStore by email, phone, applicantName, or ID
  if (rawDocs.length === 0) {
    try {
      const email = (application.email || '').toLowerCase().trim();
      const phone = (application.phone || '').replace(/\D/g, '').slice(-10);
      const name = (application.applicantName || '').toLowerCase().trim();
      const allUsers = usersStore.getAllUsers();
      const matchedUser = allUsers.find(
        u =>
          (email && u.email && u.email.toLowerCase().trim() === email) ||
          (phone && u.phone && u.phone.replace(/\D/g, '').includes(phone)) ||
          (name && u.name && u.name.toLowerCase().trim() === name) ||
          (u.id && (u.id === application.id || u.applicationNumber === application.applicationId))
      );
      if (matchedUser?.documents && matchedUser.documents.length > 0) {
        rawDocs = matchedUser.documents.filter(isUploadedByUser).map((d: any, idx: number) => ({
          id: d.id || `doc-u-${idx}`,
          title: d.title || (isSeeker ? 'Aadhaar Card (Identity Proof)' : 'Verification Document'),
          fileName: d.fileName || d.file_name || 'document.pdf',
          fileSize: d.fileSize || '1 MB',
          uploadDate: d.uploadedAt || d.uploadDate || 'Recently',
          uri: resolveUploadedFileUri(d.fileName || d.file_name, d.fileUri || d.uri),
          isUploaded: true,
          verified: Boolean(d.verified),
        }));
      }
    } catch {}
  }

  // Fallback 2: Check active registrationState
  if (rawDocs.length === 0) {
    try {
      const regState = getRegistrationState();
      const email = (application.email || '').toLowerCase().trim();
      const regEmail = (regState.email || '').toLowerCase().trim();
      const phone = (application.phone || '').replace(/\D/g, '').slice(-10);
      const regPhone = (regState.phone || '').replace(/\D/g, '').slice(-10);
      if (
        (email && regEmail && email === regEmail) ||
        (phone && regPhone && phone === regPhone)
      ) {
        if (regState.documents && regState.documents.length > 0) {
          rawDocs = regState.documents.map((d, idx) => ({
            id: `doc-reg-${idx}`,
            title: d.title || (isSeeker ? 'Aadhaar Card (Identity Proof)' : 'Verification Document'),
            fileName: d.name || 'document.pdf',
            fileSize: d.formattedSize || '1 MB',
            uploadDate: d.uploadDate || 'Recently',
            uri: resolveUploadedFileUri(d.name, d.uri),
            isUploaded: true,
            verified: false,
          }));
        } else if (regState.uploadedFileName) {
          rawDocs = [
            {
              id: 'doc-reg-single',
              title: regState.selectedDocTitle || (isSeeker ? 'Aadhaar Card (Identity Proof)' : 'Verification Document'),
              fileName: regState.uploadedFileName,
              fileSize: regState.uploadedFileSize || '800 KB',
              uploadDate: 'Recently',
              uri: resolveUploadedFileUri(regState.uploadedFileName, regState.uploadedFileUri),
              isUploaded: true,
              verified: false,
            },
          ];
        }
      }
    } catch {}
  }

  // Fallback 3: Check cached docs in localStorage / uploadedDocumentsCache
  if (rawDocs.length === 0) {
    try {
      const cached = getAllUploadedDocuments();
      if (cached && Object.keys(cached).length > 0) {
        const entries = Object.entries(cached).filter(
          ([key]) =>
            !key.startsWith('doc-') &&
            !key.startsWith('user_') &&
            !key.startsWith('log-')
        );
        if (entries.length > 0) {
          rawDocs = entries.map(([name, uri], idx) => {
            const lower = name.toLowerCase();
            let title = 'Verification Document';
            if (lower.includes('aadhaar')) title = 'Aadhaar Card (Identity Proof)';
            else if (lower.includes('pan')) title = 'PAN Card';
            else if (lower.includes('photo') || lower.includes('avatar')) title = 'Applicant Photograph';
            else if (lower.includes('address') || lower.includes('bill')) title = 'Address Proof';
            else if (lower.includes('qualif') || lower.includes('degree')) title = 'Qualification Proof';
            else if (lower.includes('pass') || lower.includes('passport')) title = 'Passport';
            else if (lower.includes('driv') || lower.includes('licence') || lower.includes('license')) title = 'Driving Licence';
            else if (lower.includes('voter')) title = 'Voter ID';

            return {
              id: `doc-cache-${idx}`,
              title,
              fileName: name,
              fileSize: '850 KB',
              uploadDate: 'Recently',
              uri: resolveUploadedFileUri(name, uri),
              isUploaded: true,
              verified: false,
            };
          });
        }
      }
    } catch {}
  }

  // Fallback 4: For Donation Seekers, present the submitted Identity Proof card
  if (rawDocs.length === 0 && isSeeker) {
    const docName = 'Aadhaar Card (Identity Proof)';
    const cleanAppSuffix = (application.applicationId || 'SEK').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `aadhaar_${cleanAppSuffix}.jpg`;
    const uri = resolveUploadedFileUri(fileName) || resolveUploadedFileUri(docName) || resolveUploadedFileUri('aadhaar');
    rawDocs = [
      {
        id: `doc-seeker-${application.id || 'primary'}`,
        title: docName,
        fileName: fileName,
        fileSize: '850 KB',
        uploadDate: application.submittedAt?.split(',')[0] || 'Recently',
        uri,
        isUploaded: true,
        verified: application.status === 'approved',
      },
    ];
  }

  const documents: DocumentItemData[] = rawDocs.map(d => ({
    ...d,
    uri: resolveUploadedFileUri(d.fileName, d.uri || (d as any).fileUri),
    uploadDate: d.uploadDate || (d as any).uploadedAt || 'Today',
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
