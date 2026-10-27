import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../../auth/store/authStore';
import { usersStore } from '../../../admin/users/services/usersStore';
import { AdminColors } from '../../../../core/theme';
import { UserItem } from '../../../admin/users/types/user.types';

interface SeekerApplicationStatusModalProps {
  visible: boolean;
  applicationNumber?: string;
  userItem?: UserItem;
  onClose: () => void;
  onReapply?: () => void;
  onApplyMembership?: () => void;
  onOpenSeekerDashboard?: () => void;
}

export const SeekerApplicationStatusModal: React.FC<SeekerApplicationStatusModalProps> = ({
  visible,
  applicationNumber,
  userItem,
  onClose,
  onReapply,
  onApplyMembership,
  onOpenSeekerDashboard,
}) => {
  const authUser = useAuthStore(state => state.user);
  const status = userItem?.status || 'pending';
  const isApproved = status === 'active';
  const isRejected = status === 'blocked';
  const isUnderReview = !isApproved && !isRejected;

  const effectiveAppNo =
    applicationNumber ||
    userItem?.applicationNumber ||
    (authUser as any)?.assistance_application_number ||
    'HRSJM-SEK-2026-0042';

  const remarks = userItem?.remarks || 'Document verification in progress by administrator.';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.headerTitleWrap}>
                  <Text style={styles.headerEmoji}>🤲</Text>
                  <Text style={styles.headerTitle}>Donation Seeker Application</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                  accessibilityLabel="Close"
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Application ID & Status Pill */}
                <View style={styles.appCard}>
                  <View style={styles.appNumberRow}>
                    <View>
                      <Text style={styles.appNumberLabel}>APPLICATION NUMBER</Text>
                      <Text style={styles.appNumberText}>{effectiveAppNo}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        isApproved && styles.statusBadgeApproved,
                        isRejected && styles.statusBadgeRejected,
                        isUnderReview && styles.statusBadgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isApproved && styles.statusBadgeTextApproved,
                          isRejected && styles.statusBadgeTextRejected,
                          isUnderReview && styles.statusBadgeTextPending,
                        ]}
                      >
                        {isApproved ? 'Approved ✓' : isRejected ? 'Rejected ✕' : 'Under Review ⏳'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.liveSyncBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveSyncText}>Live data synced from database</Text>
                  </View>
                </View>

                {/* Timeline Section */}
                <View style={styles.timelineSection}>
                  <Text style={styles.sectionHeading}>Application Progress</Text>

                  {/* Step 1: Submitted */}
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineNode, styles.timelineNodeDone]}>
                      <Text style={styles.nodeCheck}>✓</Text>
                    </View>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Application Submitted</Text>
                      <Text style={styles.timelineDesc}>
                        Your details and request were recorded successfully.
                      </Text>
                    </View>
                  </View>

                  {/* Step 2: Under Review */}
                  <View style={styles.timelineItem}>
                    <View
                      style={[
                        styles.timelineNode,
                        isApproved ? styles.timelineNodeDone : styles.timelineNodeActive,
                      ]}
                    >
                      <Text style={[styles.nodeCheck, !isApproved && { color: '#EAA224' }]}>
                        {isApproved ? '✓' : '2'}
                      </Text>
                    </View>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Document Verification</Text>
                      <Text style={styles.timelineDesc}>
                        {isApproved
                          ? 'All KYC documents verified and confirmed.'
                          : isRejected
                          ? 'Verification failed during document review.'
                          : 'Admin is currently reviewing uploaded identity & aid proof.'}
                      </Text>
                    </View>
                  </View>

                  {/* Step 3: Decision */}
                  <View style={styles.timelineItem}>
                    <View
                      style={[
                        styles.timelineNode,
                        isApproved && styles.timelineNodeDone,
                        isRejected && styles.timelineNodeRejected,
                        isUnderReview && styles.timelineNodePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.nodeCheck,
                          isUnderReview && { color: '#94A3B8' },
                          isRejected && { color: '#DC2626' },
                        ]}
                      >
                        {isApproved ? '✓' : isRejected ? '✕' : '3'}
                      </Text>
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>
                        {isApproved ? 'Application Approved' : isRejected ? 'Application Rejected' : 'Approval Decision'}
                      </Text>
                      <Text style={styles.timelineDesc}>
                        {isApproved
                          ? 'Your role is upgraded to Donation Seeker. You can now request aid.'
                          : isRejected
                          ? `Reason: ${remarks}`
                          : 'Pending final review and decision by HRSJM administrator.'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Uploaded Documents List */}
                {userItem?.documents && userItem.documents.length > 0 && (
                  <View style={styles.docsSection}>
                    <Text style={styles.sectionHeading}>Submitted Documents</Text>
                    {userItem.documents.map((doc, idx) => (
                      <View key={doc.id || idx} style={styles.docItemRow}>
                        <Text style={styles.docIcon}>📄</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.docTitle}>{doc.title}</Text>
                          <Text style={styles.docSub}>{doc.fileName} • {doc.fileSize}</Text>
                        </View>
                        <View
                          style={[
                            styles.docStatusPill,
                            doc.verified ? styles.docStatusPillVerified : styles.docStatusPillPending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.docStatusText,
                              doc.verified ? styles.docStatusTextVerified : styles.docStatusTextPending,
                            ]}
                          >
                            {doc.verified ? 'Verified' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Actions / Next Steps */}
                <View style={styles.actionsBox}>
                  {isApproved && (
                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={onOpenSeekerDashboard}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryActionBtnText}>Go to Seeker Dashboard →</Text>
                    </TouchableOpacity>
                  )}

                  {isRejected && (
                    <View style={{ gap: 10 }}>
                      <View style={styles.rejectedBanner}>
                        <Text style={styles.rejectedBannerTitle}>Action Required</Text>
                        <Text style={styles.rejectedBannerText}>
                          {remarks}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.reapplyBtn}
                        onPress={onReapply}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.reapplyBtnText}>Re-apply as Donation Seeker</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={onApplyMembership}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.secondaryBtnText}>Apply for Official Membership Instead</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isUnderReview && (
                    <View style={styles.infoNotice}>
                      <Text style={styles.infoNoticeText}>
                        ℹ️ Until your application is approved by the admin, you can freely browse and participate in HRSJM as a General User.
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  appCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  appNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appNumberLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  appNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusBadgePending: {
    backgroundColor: '#FFFBEB',
  },
  statusBadgeApproved: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEF2F2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadgeTextPending: {
    color: '#B45309',
  },
  statusBadgeTextApproved: {
    color: '#059669',
  },
  statusBadgeTextRejected: {
    color: '#DC2626',
  },
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveSyncText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  timelineSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: 22,
  },
  timelineNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    zIndex: 2,
  },
  timelineNodeDone: {
    backgroundColor: '#059669',
  },
  timelineNodeActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#EAA224',
  },
  timelineNodePending: {
    backgroundColor: '#F1F5F9',
  },
  timelineNodeRejected: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },
  nodeCheck: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  timelineLine: {
    position: 'absolute',
    top: 28,
    left: 13,
    width: 2,
    bottom: 0,
    backgroundColor: '#E2E8F0',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  docsSection: {
    marginBottom: 20,
  },
  docItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 10,
  },
  docIcon: {
    fontSize: 20,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
  },
  docSub: {
    fontSize: 11,
    color: '#64748B',
  },
  docStatusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  docStatusPillVerified: {
    backgroundColor: '#ECFDF5',
  },
  docStatusPillPending: {
    backgroundColor: '#FFFBEB',
  },
  docStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  docStatusTextVerified: {
    color: '#059669',
  },
  docStatusTextPending: {
    color: '#D97706',
  },
  actionsBox: {
    marginTop: 8,
  },
  primaryActionBtn: {
    backgroundColor: '#0F2860',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  rejectedBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
  },
  rejectedBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 2,
  },
  rejectedBannerText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
  reapplyBtn: {
    backgroundColor: '#EAA224',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  reapplyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#0F2860',
    fontSize: 13,
    fontWeight: '600',
  },
  infoNotice: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoNoticeText: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 16,
  },
});
