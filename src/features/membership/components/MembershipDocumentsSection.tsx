import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { DisplayMembershipStatus } from '../hooks/useMembershipDetailsData';

export interface DocumentItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'certificate' | 'idcard' | 'guidelines';
}

interface MembershipDocumentsSectionProps {
  onDocumentPress?: (doc: DocumentItem) => void;
  status?: DisplayMembershipStatus;
}

export const MembershipDocumentsSection: React.FC<MembershipDocumentsSectionProps> = ({
  onDocumentPress,
  status = 'Active',
}) => {
  const documents: DocumentItem[] = [
    {
      id: 'certificate',
      title: 'Membership Certificate',
      subtitle: 'Download your official certificate',
      type: 'certificate',
    },
    {
      id: 'idcard',
      title: 'Membership Card (PDF)',
      subtitle: 'Download printable card',
      type: 'idcard',
    },
    {
      id: 'guidelines',
      title: 'Membership Guidelines',
      subtitle: 'Read terms and benefits',
      type: 'guidelines',
    },
  ];

  return (
    <View style={styles.sectionContainer} accessibilityRole="region" accessibilityLabel="Membership Documents Section">
      {/* Section Header */}
      <Text style={styles.sectionTitle}>Membership Documents</Text>

      {/* Documents Card */}
      <View style={styles.cardContainer}>
        {documents.map((doc, index) => {
          const isLast = index === documents.length - 1;

          return (
            <TouchableOpacity
              key={doc.id}
              style={styles.docRow}
              activeOpacity={0.75}
              onPress={() => onDocumentPress?.(doc)}
              accessibilityRole="button"
              accessibilityLabel={`${doc.title}, ${doc.subtitle}`}
            >
              {/* Left Document Icon */}
              <View style={styles.iconBox}>
                <View style={styles.docIcon}>
                  <View style={styles.docFold} />
                  <View style={styles.docLine1} />
                  <View style={styles.docLine2} />
                  <View style={styles.docLine3} />
                </View>
              </View>

              {/* Middle Title & Subtitle */}
              <View style={styles.infoCol}>
                <Text style={styles.docTitle} numberOfLines={1}>
                  {doc.title}
                </Text>
                <Text style={styles.docSubtitle} numberOfLines={1}>
                  {doc.subtitle}
                </Text>
              </View>

              {/* Right Download Button Icon */}
              <View style={styles.downloadBox} accessibilityRole="image" accessibilityLabel="Download icon">
                <View style={styles.downloadIcon}>
                  <View style={styles.downloadStem} />
                  <View style={styles.downloadArrowHead} />
                  <View style={styles.downloadTray} />
                </View>
              </View>

              {/* Divider between rows */}
              {!isLast && <View style={styles.divider} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docIcon: {
    width: 20,
    height: 25,
    borderRadius: 3,
    borderWidth: 1.6,
    borderColor: '#0A204C',
    padding: 3,
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  docFold: {
    position: 'absolute',
    top: -1.6,
    right: -1.6,
    width: 6,
    height: 6,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: '#0A204C',
    backgroundColor: '#F8FAFC',
  },
  docLine1: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#0A204C',
    borderRadius: 0.75,
  },
  docLine2: {
    width: '80%',
    height: 1.5,
    backgroundColor: '#0A204C',
    borderRadius: 0.75,
  },
  docLine3: {
    width: '50%',
    height: 1.5,
    backgroundColor: '#0A204C',
    borderRadius: 0.75,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 2,
  },
  docSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  downloadBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  downloadIcon: {
    width: 18,
    height: 18,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadStem: {
    position: 'absolute',
    top: 1,
    width: 1.6,
    height: 9,
    backgroundColor: '#0F2860',
  },
  downloadArrowHead: {
    position: 'absolute',
    top: 8,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F2860',
  },
  downloadTray: {
    position: 'absolute',
    bottom: 1,
    width: 15,
    height: 4.5,
    borderLeftWidth: 1.6,
    borderRightWidth: 1.6,
    borderBottomWidth: 1.6,
    borderColor: '#0F2860',
    borderRadius: 1,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 64,
    right: 16,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
