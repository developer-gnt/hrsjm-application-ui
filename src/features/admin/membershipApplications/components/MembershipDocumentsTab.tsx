import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { MembershipApplicationItem } from '../types/membershipApplications.types';

interface MembershipDocumentsTabProps {
  application: MembershipApplicationItem;
  onViewDocument?: (doc: any) => void;
}

export const MembershipDocumentsTab: React.FC<MembershipDocumentsTabProps> = ({
  application,
  onViewDocument,
}) => {
  const documents = application.documents && application.documents.length > 0
    ? application.documents
    : [
        {
          id: 'doc-fallback-1',
          title: 'Identity Verification Document',
          fileName: `${application.applicantName.replace(/\s+/g, '_')}_ID.pdf`,
          fileSize: '2.1 MB',
          uploadDate: application.submittedAt.split(',')[0],
        },
      ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Submitted Documents ({documents.length})</Text>

      {documents.map(doc => (
        <View key={doc.id} style={styles.docCard}>
          <View style={styles.docIconContainer}>
            <Text style={styles.docIcon}>📄</Text>
          </View>

          <View style={styles.docDetails}>
            <Text style={styles.docTitle}>{doc.title}</Text>
            <Text style={styles.fileName} numberOfLines={1}>{doc.fileName}</Text>
            <View style={styles.docMetaRow}>
              <Text style={styles.metaText}>{doc.fileSize}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>Uploaded {doc.uploadDate}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => onViewDocument?.(doc)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`View ${doc.title}`}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: Spacing.sm,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8EFF8',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  docIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E5F8',
  },
  docIcon: {
    fontSize: 20,
    color: '#1E3A8A',
  },
  docDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
  },
  fileName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  metaDot: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  viewButton: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
  },
});
