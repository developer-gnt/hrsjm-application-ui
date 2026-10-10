import React, { useState, useSyncExternalStore } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../../../../core';
import { usersStore } from '../services/usersStore';
import { UserItem, UserType, UserStatus, UserVerificationDocument } from '../types/user.types';
import { UsersHeader } from '../components/UsersHeader';
import { UsersBottomNav } from '../components/UsersBottomNav';
import { ChevronLeftIcon } from '../../../auth/components/AuthIcons';

interface UserVerificationScreenProps {
  userId?: string;
  onBack?: () => void;
  onSuccess?: () => void;
  onBottomTabPress?: (key: string) => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

const REUPLOAD_REASONS = [
  'Document image is blurry or unreadable',
  'Document is expired or invalid',
  'Incorrect document type submitted',
  'Name on document does not match account',
  'Incomplete document / edges cropped',
];

export const UserVerificationScreen: React.FC<UserVerificationScreenProps> = ({
  userId,
  onBack,
  onSuccess,
  onBottomTabPress,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();

  useSyncExternalStore(usersStore.subscribe, usersStore.getSnapshot, usersStore.getSnapshot);

  const user = userId ? usersStore.getUserById(userId) : undefined;

  // Local state
  const [adminNotes, setAdminNotes] = useState('');
  const [viewingDoc, setViewingDoc] = useState<UserVerificationDocument | null>(null);

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REUPLOAD_REASONS[0]);
  const [customRejectReason, setCustomRejectReason] = useState('');

  if (!user) {
    return (
      <View style={styles.screen}>
        <UsersHeader
          paddingTop={insets.top}
          onMenuPress={onMenuPress}
          onNotificationsPress={onNotificationsPress}
          onProfilePress={onProfilePress}
        />
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>User Not Found</Text>
          <Text style={styles.notFoundMessage}>
            Cannot review verification because the user record could not be found.
          </Text>
          <TouchableOpacity
            style={styles.backLinkBtn}
            onPress={onBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Back to Users list"
          >
            <ChevronLeftIcon size={16} color="#FFFFFF" />
            <Text style={styles.backLinkText}>Return to Users List</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomNavHost}>
          <UsersBottomNav
            bottomInset={insets.bottom}
            activeKey="users"
            onTabPress={onBottomTabPress}
          />
        </View>
      </View>
    );
  }

  const isMember = user.userType === 'member';
  const documents = user.documents || [];
  const verifiedCount = documents.filter(d => d.verified).length;
  const isFullyVerified = documents.length > 0 && verifiedCount === documents.length;

  const userTypeLabels: Record<UserType, string> = {
    member: 'Member',
    seeker: 'Donation Seeker',
    donor: 'Donor',
    general: 'General User',
  };

  const statusStyles: Record<
    UserStatus,
    { badgeBg: string; text: string; dot: string; label: string }
  > = {
    active: { badgeBg: '#ECFDF5', text: '#059669', dot: '#10B981', label: 'Active / Verified' },
    pending: { badgeBg: '#FFFBEB', text: '#D97706', dot: '#F59E0B', label: 'Pending Review' },
    blocked: { badgeBg: '#FEF2F2', text: '#DC2626', dot: '#EF4444', label: 'Rejected / Blocked' },
  };

  const currentStatusStyle = statusStyles[user.status] || statusStyles.active;

  // Handler: Toggle single document verification
  const handleToggleDoc = (docId: string, currentVerified: boolean) => {
    usersStore.updateDocumentStatus(user.id, docId, !currentVerified);
  };

  // Handler: Confirm Approve All
  const handleConfirmApprove = () => {
    usersStore.verifyAllDocuments(user.id);
    if (adminNotes.trim()) {
      usersStore.updateUser(user.id, { remarks: adminNotes.trim() });
    }
    setShowApproveModal(false);
    if (onSuccess) onSuccess();
    else if (onBack) onBack();
  };

  // Handler: Confirm Request Re-upload
  const handleConfirmReupload = () => {
    const reasonText = `Re-upload requested: ${selectedReason}`;
    usersStore.updateStatus(user.id, 'pending', reasonText);
    setShowReuploadModal(false);
    if (onSuccess) onSuccess();
    else if (onBack) onBack();
  };

  // Handler: Confirm Reject User
  const handleConfirmReject = () => {
    const reason = customRejectReason.trim() || 'Verification rejected by administrator.';
    usersStore.rejectVerification(user.id, reason);
    setShowRejectModal(false);
    if (onSuccess) onSuccess();
    else if (onBack) onBack();
  };

  return (
    <View style={styles.screen}>
      <UsersHeader
        paddingTop={insets.top}
        onMenuPress={onMenuPress}
        onNotificationsPress={onNotificationsPress}
        onProfilePress={onProfilePress}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrap}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back to User Details"
            >
              <ChevronLeftIcon size={16} color="#0F2860" />
              <Text style={styles.backButtonText}>Back to User Details</Text>
            </TouchableOpacity>

            {/* Page Header */}
            <Text style={styles.pageTitle}>User Verification</Text>
            <Text style={styles.pageSubtitle}>
              Review uploaded KYC documents and complete verification for this account.
            </Text>

            {/* User Overview Summary Card */}
            <View style={styles.userCard}>
              <View style={styles.userCardHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.userInfoCol}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userMetaText}>{user.email}</Text>
                  <Text style={styles.userMetaText}>{user.phone}</Text>

                  <View style={styles.badgesRow}>
                    <View style={styles.typePill}>
                      <Text style={styles.typePillText}>
                        {userTypeLabels[user.userType]}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: currentStatusStyle.badgeBg },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: currentStatusStyle.dot },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: currentStatusStyle.text },
                        ]}
                      >
                        {currentStatusStyle.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* Quick Details Row */}
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>USER ID</Text>
                  <Text style={styles.metaValue}>{`#${user.id}`}</Text>
                </View>

                {isMember && user.memberId ? (
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>MEMBER ID</Text>
                    <Text style={styles.metaValueHighlight}>
                      {user.memberId}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>REGISTERED</Text>
                  <Text style={styles.metaValue}>
                    {user.joinedDate.includes('T')
                      ? user.joinedDate.split('T')[0]
                      : user.joinedDate}
                  </Text>
                </View>
              </View>
            </View>

            {/* Document Review Section */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Uploaded Documents</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {`${verifiedCount}/${documents.length} Verified`}
                  </Text>
                </View>
              </View>

              {documents.length > 0 ? (
                documents.map((doc, idx) => (
                  <View key={doc.id || `doc-${idx}`} style={styles.docCard}>
                    <View style={styles.docCardTop}>
                      <View style={styles.docIconWrap}>
                        <Text style={styles.docIcon}>📄</Text>
                      </View>

                      <View style={styles.docInfoWrap}>
                        <Text style={styles.docTitle}>{doc.title}</Text>
                        <Text style={styles.docFileName}>{doc.fileName}</Text>
                        <Text style={styles.docMeta}>
                          {`Type: ${doc.fileType.toUpperCase()}`}{doc.fileSize ? ` • ${doc.fileSize}` : ''}
                          {doc.uploadedAt ? ` • Uploaded: ${doc.uploadedAt}` : ''}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.docStatusBadge,
                          doc.verified ? styles.badgeVerified : styles.badgePending,
                        ]}
                      >
                        <Text
                          style={[
                            styles.docStatusText,
                            doc.verified ? styles.textVerified : styles.textPending,
                          ]}
                        >
                          {doc.verified ? 'Verified' : 'Pending'}
                        </Text>
                      </View>
                    </View>

                    {/* Per-Document Action Buttons */}
                    <View style={styles.docActionsRow}>
                      <TouchableOpacity
                        style={styles.viewDocBtn}
                        onPress={() => setViewingDoc(doc)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`Preview ${doc.title}`}
                      >
                        <Text style={styles.viewDocBtnText}>👁 Preview</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.toggleDocBtn,
                          doc.verified ? styles.rejectDocBtn : styles.approveDocBtn,
                        ]}
                        onPress={() => handleToggleDoc(doc.id, !!doc.verified)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`${doc.verified ? 'Unapprove' : 'Approve'} ${doc.title}`}
                      >
                        <Text
                          style={[
                            styles.toggleDocBtnText,
                            doc.verified ? styles.rejectDocText : styles.approveDocText,
                          ]}
                        >
                          {doc.verified ? '✕ Mark Unverified' : '✓ Approve Document'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyDocsCard}>
                  <Text style={styles.emptyDocsIcon}>📁</Text>
                  <Text style={styles.emptyDocsTitle}>
                    No Documents Uploaded
                  </Text>
                  <Text style={styles.emptyDocsSubtitle}>
                    This user has not submitted any verification documents yet.
                  </Text>
                </View>
              )}
            </View>

            {/* Admin Notes / Remarks Input */}
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>Admin Remarks / Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Enter administrative review notes (optional)..."
                placeholderTextColor="#94A3B8"
                value={adminNotes}
                onChangeText={setAdminNotes}
                multiline
                numberOfLines={3}
                accessibilityLabel="Verification Admin Notes"
              />
            </View>

            {/* Verification Decision Panel */}
            <View style={styles.decisionPanel}>
              <Text style={styles.decisionPanelTitle}>Verification Decisions</Text>

              {/* Approve All & Verify User */}
              <TouchableOpacity
                style={styles.approveAllBtn}
                onPress={() => setShowApproveModal(true)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Approve All Documents & Verify User"
              >
                <Text style={styles.approveAllBtnText}>
                  ✓ Approve All Documents & Verify User
                </Text>
              </TouchableOpacity>

              {/* Two Column Action Row: Request Re-upload & Reject */}
              <View style={styles.secondaryActionsRow}>
                <TouchableOpacity
                  style={styles.reuploadBtn}
                  onPress={() => setShowReuploadModal(true)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Request Re-upload"
                >
                  <Text style={styles.reuploadBtnText}>
                    ↻ Request Re-upload
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => setShowRejectModal(true)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Reject User"
                >
                  <Text style={styles.rejectBtnText}>
                    ✕ Reject User
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Document Preview Modal */}
      <Modal
        visible={viewingDoc !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingDoc(null)}
      >
        <TouchableWithoutFeedback onPress={() => setViewingDoc(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle} numberOfLines={1}>
                    {viewingDoc?.title || 'Document Preview'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setViewingDoc(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Close document preview"
                  >
                    <Text style={styles.previewCloseIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.previewBody}>
                  <Text style={styles.previewIcon}>📄</Text>
                  <Text style={styles.previewFileName}>{viewingDoc?.fileName}</Text>
                  <Text style={styles.previewMeta}>
                    {`Type: ${viewingDoc?.fileType?.toUpperCase()}`}
                    {viewingDoc?.fileSize ? ` • Size: ${viewingDoc?.fileSize}` : ''}
                  </Text>

                  <View
                    style={[
                      styles.docStatusBadge,
                      viewingDoc?.verified ? styles.badgeVerified : styles.badgePending,
                      { marginTop: Spacing.sm },
                    ]}
                  >
                    <Text
                      style={[
                        styles.docStatusText,
                        viewingDoc?.verified ? styles.textVerified : styles.textPending,
                      ]}
                    >
                      {viewingDoc?.verified ? 'Status: Verified' : 'Status: Pending Review'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.previewCloseBtn}
                  onPress={() => setViewingDoc(null)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss document preview"
                >
                  <Text style={styles.previewCloseBtnText}>Close Preview</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        visible={showApproveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApproveModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowApproveModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dialogCard}>
                <View style={[styles.dialogIconCircle, styles.dialogGreenCircle]}>
                  <Text style={styles.dialogEmoji}>✓</Text>
                </View>
                <Text style={styles.dialogTitle}>Verify User Account?</Text>
                <Text style={styles.dialogMessage}>
                  {`Are you sure you want to approve all documents and mark ${user.name} as verified? Their account will be activated immediately.`}
                </Text>

                <View style={styles.dialogBtnRow}>
                  <TouchableOpacity
                    style={styles.dialogCancelBtn}
                    onPress={() => setShowApproveModal(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel verification approval"
                  >
                    <Text style={styles.dialogCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dialogConfirmBtn, styles.dialogConfirmGreen]}
                    onPress={handleConfirmApprove}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm Approve Verification"
                  >
                    <Text style={styles.dialogConfirmBtnText}>Confirm Approval</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Request Re-upload Modal */}
      <Modal
        visible={showReuploadModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReuploadModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowReuploadModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dialogCard}>
                <View style={[styles.dialogIconCircle, styles.dialogAmberCircle]}>
                  <Text style={styles.dialogEmoji}>↻</Text>
                </View>
                <Text style={styles.dialogTitle}>Request Document Re-upload</Text>
                <Text style={styles.dialogMessage}>
                  Select the reason for requesting a re-upload from the user:
                </Text>

                {REUPLOAD_REASONS.map(reason => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      selectedReason === reason && styles.reasonOptionSelected,
                    ]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.reasonOptionText,
                        selectedReason === reason && styles.reasonOptionTextSelected,
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.dialogBtnRow}>
                  <TouchableOpacity
                    style={styles.dialogCancelBtn}
                    onPress={() => setShowReuploadModal(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel re-upload request"
                  >
                    <Text style={styles.dialogCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dialogConfirmBtn, styles.dialogConfirmAmber]}
                    onPress={handleConfirmReupload}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm Re-upload Request"
                  >
                    <Text style={styles.dialogConfirmBtnText}>Send Request</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowRejectModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dialogCard}>
                <View style={[styles.dialogIconCircle, styles.dialogRedCircle]}>
                  <Text style={styles.dialogEmoji}>✕</Text>
                </View>
                <Text style={styles.dialogTitle}>Reject User Verification?</Text>
                <Text style={styles.dialogMessage}>
                  {`Are you sure you want to reject verification for ${user.name}? This will suspend their mobile access.`}
                </Text>

                <TextInput
                  style={styles.dialogInput}
                  placeholder="Enter rejection reason..."
                  placeholderTextColor="#94A3B8"
                  value={customRejectReason}
                  onChangeText={setCustomRejectReason}
                  accessibilityLabel="Rejection Reason input"
                />

                <View style={styles.dialogBtnRow}>
                  <TouchableOpacity
                    style={styles.dialogCancelBtn}
                    onPress={() => setShowRejectModal(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel rejection"
                  >
                    <Text style={styles.dialogCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dialogConfirmBtn, styles.dialogConfirmRed]}
                    onPress={handleConfirmReject}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm Reject Verification"
                  >
                    <Text style={styles.dialogConfirmBtnText}>Reject User</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Persistent Bottom Nav */}
      <View style={styles.bottomNavHost}>
        <UsersBottomNav
          bottomInset={insets.bottom}
          activeKey="users"
          onTabPress={onBottomTabPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.base,
  },
  contentWrap: {
    paddingHorizontal: Spacing.base,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2860',
    marginLeft: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: Spacing.base,
    lineHeight: 20,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: Spacing.base,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  userMetaText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  typePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  metaValueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
  },
  sectionWrap: {
    marginBottom: Spacing.base,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  docCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  docIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  docIcon: {
    fontSize: 22,
  },
  docInfoWrap: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  docFileName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 2,
  },
  docMeta: {
    fontSize: 11,
    color: '#94A3B8',
  },
  docStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeVerified: {
    backgroundColor: '#ECFDF5',
  },
  badgePending: {
    backgroundColor: '#FFFBEB',
  },
  docStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textVerified: {
    color: '#059669',
  },
  textPending: {
    color: '#D97706',
  },
  docActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  viewDocBtn: {
    flex: 1,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  viewDocBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  toggleDocBtn: {
    flex: 1.5,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveDocBtn: {
    backgroundColor: '#0F2860',
  },
  rejectDocBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  toggleDocBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  approveDocText: {
    color: '#FFFFFF',
  },
  rejectDocText: {
    color: '#DC2626',
  },
  emptyDocsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyDocsIcon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  emptyDocsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDocsSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.base,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: Spacing.xs,
  },
  notesInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 13,
    color: '#0F172A',
    height: 70,
    textAlignVertical: 'top',
    backgroundColor: '#F8FAFC',
  },
  decisionPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.lg,
  },
  decisionPanelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: Spacing.md,
  },
  approveAllBtn: {
    backgroundColor: '#0F2860',
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  approveAllBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reuploadBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reuploadBtnText: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '700',
  },
  rejectBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  previewCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    elevation: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  previewCloseIcon: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '700',
    padding: 4,
  },
  previewBody: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  previewIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  previewFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  previewCloseBtn: {
    backgroundColor: '#0F2860',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  previewCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    elevation: 8,
  },
  dialogIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  dialogGreenCircle: {
    backgroundColor: '#ECFDF5',
  },
  dialogAmberCircle: {
    backgroundColor: '#FFFBEB',
  },
  dialogRedCircle: {
    backgroundColor: '#FEF2F2',
  },
  dialogEmoji: {
    fontSize: 24,
    fontWeight: '700',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.base,
  },
  dialogInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: Spacing.base,
  },
  reasonOption: {
    width: '100%',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  reasonOptionSelected: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  reasonOptionText: {
    fontSize: 12,
    color: '#334155',
  },
  reasonOptionTextSelected: {
    color: '#B45309',
    fontWeight: '700',
  },
  dialogBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: Spacing.sm,
  },
  dialogCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  dialogConfirmBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogConfirmGreen: {
    backgroundColor: '#059669',
  },
  dialogConfirmAmber: {
    backgroundColor: '#D97706',
  },
  dialogConfirmRed: {
    backgroundColor: '#DC2626',
  },
  dialogConfirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: Spacing.sm,
  },
  notFoundMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  backLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2860',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  backLinkText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomNavHost: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
