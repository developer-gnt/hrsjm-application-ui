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

  const documents: DocumentItemData[] =
    application.documents && application.documents.length > 0
      ? application.documents
      : [
          {
            id: 'doc-fallback-1',
            title: 'Aadhaar Card',
            fileName: 'aadhaar_card.pdf',
            fileSize: '251 KB',
            uploadDate: '14/09/26',
          },
          {
            id: 'doc-fallback-2',
            title: 'Voter ID',
            fileName: 'voter_id.jpg',
            fileSize: '320 KB',
            uploadDate: '14/09/26',
          },
          {
            id: 'doc-fallback-3',
            title: 'Other Document (Employment ID)',
            fileName: 'employee_id.pdf',
            fileSize: '180 KB',
            uploadDate: '14/09/26',
          },
        ];

  const handleOpenDoc = (doc: DocumentItemData) => {
    setSelectedDoc(doc);
    setViewerVisible(true);
    onViewDocument?.(doc);
  };

  const renderFileIcon = (doc: DocumentItemData) => {
    const isImage =
      doc.fileName.toLowerCase().endsWith('.jpg') ||
      doc.fileName.toLowerCase().endsWith('.jpeg') ||
      doc.fileName.toLowerCase().endsWith('.png');

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

        {/* Documents List */}
        <View style={styles.docList}>
          {documents.map((doc) => (
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
      </View>

      {/* Interactive Document Preview Modal */}
      <MembershipDocumentViewerModal
        visible={viewerVisible}
        document={selectedDoc}
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
});
