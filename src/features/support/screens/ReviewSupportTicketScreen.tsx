import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import { SupportTicket, TicketAttachment } from '../types/ticket.types';
import { APPROVED_TICKET_CATEGORIES } from '../data/categories';
import { supportTicketsStore } from '../services/supportTicketsStore';
import { SupportTicketsHeader } from '../components/SupportTicketsHeader';
import { SupportProgressStepper } from '../components/SupportProgressStepper';
import { CategoryIcon, EditPencilIcon } from '../components/SupportIcons';
import { SupportBottomNav } from '../components/SupportBottomNav';

interface ReviewSupportTicketScreenProps {
  onBack?: () => void;
  onEdit?: () => void;
  onSubmitSuccess?: (createdTicket: SupportTicket) => void;
  onBottomTabPress?: (key: string) => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

const getFileIcon = (ext: string): { icon: string; bg: string } => {
  const norm = ext.toLowerCase();
  if (norm === 'pdf') return { icon: '📄', bg: '#FEE2E2' };
  if (norm === 'doc' || norm === 'docx') return { icon: '📝', bg: '#DBEAFE' };
  if (['jpg', 'jpeg', 'png', 'webp'].includes(norm)) return { icon: '🖼️', bg: '#DCFCE7' };
  return { icon: '📎', bg: '#F1F5F9' };
};

export const ReviewSupportTicketScreen: React.FC<ReviewSupportTicketScreenProps> = ({
  onBack,
  onEdit,
  onSubmitSuccess,
  onBottomTabPress,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<TicketAttachment | null>(null);

  // Read current draft from reactive store
  const draft = supportTicketsStore.getDraft();

  const categoryObj = APPROVED_TICKET_CATEGORIES.find(
    c => c.name.toLowerCase() === draft.category?.toLowerCase()
  );

  const handleViewFile = (file: TicketAttachment) => {
    setPreviewFile(file);
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
    if (file.uri && win && win.open && (file.uri.startsWith('blob:') || file.uri.startsWith('http'))) {
      try {
        win.open(file.uri, '_blank');
      } catch (e) {
        // Fallback to preview modal
      }
    }
  };

  const handleEditPress = () => {
    if (onEdit) {
      onEdit();
    } else if (onBack) {
      onBack();
    }
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const createdTicket = supportTicketsStore.createTicketFromDraft(draft);
      if (onSubmitSuccess) {
        onSubmitSuccess(createdTicket);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Top Branded Header */}
      <SupportTicketsHeader
        paddingTop={insets.top}
        onMenuPress={onMenuPress}
        onNotificationsPress={onNotificationsPress}
        onProfilePress={onProfilePress}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* Back link */}
          <TouchableOpacity
            style={styles.backLinkRow}
            onPress={handleEditPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to Ticket Details"
          >
            <Text style={styles.backChevron}>←</Text>
            <Text style={styles.backLinkText}>Back to Ticket Details</Text>
          </TouchableOpacity>

          {/* Page Title & Subtitle */}
          <Text style={styles.pageTitle}>Review Your Ticket</Text>
          <Text style={styles.pageSubtitle}>
            Please verify your information before submitting.
          </Text>

          {/* Stepper (Step 2 active) */}
          <SupportProgressStepper currentStep={2} />

          {/* Main Review Card */}
          <View style={styles.reviewCard}>
            {/* Review Card Header with Edit CTA */}
            <View style={styles.reviewHeaderRow}>
              <View style={styles.reviewHeaderBadge}>
                <Text style={styles.reviewHeaderBadgeText}>Ticket Details Summary</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Edit Ticket Details"
              >
                <EditPencilIcon size={14} color={AdminColors.primary} />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Field 1: Category */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>CATEGORY</Text>
              <View style={styles.categoryCard}>
                <View
                  style={[
                    styles.categoryIconTile,
                    { backgroundColor: categoryObj?.bgColor || '#EFF6FF' },
                  ]}
                >
                  <CategoryIcon
                    category={categoryObj?.name || draft.category || 'General'}
                    size={20}
                  />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>
                    {categoryObj?.name || draft.category || 'Not Selected'}
                  </Text>
                  <Text style={styles.categoryHelper} numberOfLines={2}>
                    {categoryObj?.helperText || 'Support request category'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Field 2: Subject */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>SUBJECT</Text>
              <View style={styles.valueBox}>
                <Text style={styles.subjectText}>
                  {draft.subject || 'No subject entered'}
                </Text>
              </View>
            </View>

            {/* Field 3: Description */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>DESCRIPTION</Text>
              <View style={styles.descBox}>
                <Text style={styles.descText}>
                  {draft.description || 'No description provided'}
                </Text>
              </View>
            </View>

            {/* Field 4: Attached Files */}
            <View style={styles.fieldSection}>
              <View style={styles.filesLabelRow}>
                <Text style={styles.fieldLabel}>
                  {`ATTACHED FILES (${draft.attachments?.length || 0})`}
                </Text>
              </View>

              {draft.attachments && draft.attachments.length > 0 ? (
                <View style={styles.filesGrid}>
                  {draft.attachments.map((file: TicketAttachment) => {
                    const iconCfg = getFileIcon(file.type);
                    return (
                      <View key={file.id} style={styles.fileItem}>
                        <View
                          style={[
                            styles.fileIconTile,
                            { backgroundColor: iconCfg.bg },
                          ]}
                        >
                          <Text style={styles.fileEmoji}>{iconCfg.icon}</Text>
                        </View>
                        <View style={styles.fileDetails}>
                          <Text style={styles.fileName} numberOfLines={1}>
                            {file.name}
                          </Text>
                          <Text style={styles.fileSize}>
                            {file.formattedSize}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.viewFileButton}
                          onPress={() => handleViewFile(file)}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityLabel={`View document ${file.name}`}
                        >
                          <Text style={styles.viewFileText}>View 👁️</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.noFilesBox}>
                  <Text style={styles.noFilesText}>No files attached</Text>
                </View>
              )}
            </View>

            {/* SLA / Info Notice Box */}
            <View style={styles.noticeBox}>
              <Text style={styles.noticeIcon}>ℹ️</Text>
              <Text style={styles.noticeText}>
                Our support team typically responds to tickets within 24–48 business hours. You can track this ticket anytime from your support dashboard.
              </Text>
            </View>
          </View>

          {/* Bottom Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleEditPress}
              disabled={isSubmitting}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Back to edit ticket details"
            >
              <Text style={styles.backButtonText}>← Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Submit Ticket"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Ticket ✓</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Document Preview Modal */}
      <Modal
        visible={!!previewFile}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewFile(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.previewCard}>
            {/* Modal Header */}
            <View style={styles.previewModalHeader}>
              <View style={styles.previewHeaderTitleWrap}>
                <Text style={styles.previewModalTitle}>Document Preview</Text>
                <Text style={styles.previewModalSubtitle} numberOfLines={1}>
                  {previewFile?.name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setPreviewFile(null)}
                accessibilityRole="button"
                accessibilityLabel="Close document preview"
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.previewBody}>
              {previewFile &&
              ['jpg', 'jpeg', 'png', 'webp'].includes(previewFile.type.toLowerCase()) &&
              previewFile.uri ? (
                <Image
                  source={{ uri: previewFile.uri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.docPreviewPlaceholder}>
                  <View
                    style={[
                      styles.largeDocIcon,
                      { backgroundColor: getFileIcon(previewFile?.type || '').bg },
                    ]}
                  >
                    <Text style={styles.largeDocEmoji}>
                      {getFileIcon(previewFile?.type || '').icon}
                    </Text>
                  </View>
                  <Text style={styles.largeDocName} numberOfLines={2}>
                    {previewFile?.name}
                  </Text>
                  <Text style={styles.largeDocMeta}>
                    {previewFile
                      ? `${previewFile.type.toUpperCase()} • ${previewFile.formattedSize}`
                      : ''}
                  </Text>
                  <View style={styles.docVerifiedBadge}>
                    <Text style={styles.docVerifiedText}>
                      ✓ Attached & Ready for Submission
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Modal Actions */}
            <View style={styles.previewActionsRow}>
              {previewFile?.uri && (
                <TouchableOpacity
                  style={styles.openTabButton}
                  onPress={() => {
                    const win =
                      typeof globalThis !== 'undefined'
                        ? (globalThis as any).window
                        : undefined;
                    if (win && win.open) win.open(previewFile.uri, '_blank');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Open document in new tab"
                >
                  <Text style={styles.openTabText}>Open in New Window ↗</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closePreviewBtn}
                onPress={() => setPreviewFile(null)}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.closePreviewBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavHost}>
        <SupportBottomNav
          bottomInset={insets.bottom}
          activeKey="support"
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
  },
  contentWrap: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  backLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  backChevron: {
    fontSize: 16,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  backLinkText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: AdminColors.primary,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    marginTop: 4,
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.base,
    marginTop: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: Spacing.sm,
  },
  reviewHeaderBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  reviewHeaderBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: AdminColors.primary,
    letterSpacing: 0.3,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  fieldSection: {
    marginBottom: Spacing.base,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  categoryIconTile: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryHelper: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  valueBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  subjectText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 18,
  },
  descBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 70,
  },
  descText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  filesLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filesGrid: {
    gap: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
  },
  fileIconTile: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileEmoji: {
    fontSize: 16,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  fileSize: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  viewFileButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginLeft: 8,
  },
  viewFileText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  noFilesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  noFilesText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: BorderRadius.md,
    padding: 10,
    gap: 8,
    alignItems: 'flex-start',
  },
  noticeIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#1E40AF',
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  backButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  submitButton: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.primary,
    shadowColor: AdminColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomNavHost: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    maxWidth: 520,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  previewHeaderTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  previewModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
  },
  previewModalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeModalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  previewBody: {
    padding: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
  },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: BorderRadius.md,
  },
  docPreviewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  largeDocIcon: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  largeDocEmoji: {
    fontSize: 34,
  },
  largeDocName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    maxWidth: 360,
  },
  largeDocMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  docVerifiedBadge: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginTop: 16,
  },
  docVerifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  previewActionsRow: {
    flexDirection: 'row',
    gap: 10,
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  openTabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  closePreviewBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePreviewBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
});
