import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppAvatar } from '../../../../core/components/common/AppAvatar';
import { BrandColors } from '../../../../core/theme/colors';
import { BorderRadius, Shadows, Spacing } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { formatCurrency, formatDate } from '../../../../core/utils/format';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileCheck,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  X,
} from '../../../../core/components/icons';
import type {
  AssistanceRequest,
  AssistanceStatus,
  UpdateAssistanceStatusBody,
} from '../types/assistance.types';

interface SeekerDetailsModalProps {
  visible: boolean;
  request: AssistanceRequest | null;
  onClose: () => void;
  onUpdateStatus: (id: string, body: UpdateAssistanceStatusBody) => Promise<void>;
  isUpdating?: boolean;
}

export const SeekerDetailsModal: React.FC<SeekerDetailsModalProps> = ({
  visible,
  request,
  onClose,
  onUpdateStatus,
  isUpdating = false,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REVIEW' | 'DOCUMENTS'>('OVERVIEW');
  const [targetStatus, setTargetStatus] = useState<AssistanceStatus>('APPROVED');
  const [adminRemark, setAdminRemark] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!request) return null;

  const displayId = `DS${request.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  const getStatusBadge = (st: AssistanceStatus) => {
    switch (st) {
      case 'APPROVED':
        return { bg: '#DCFCE7', color: '#15803D', label: 'Approved' };
      case 'REJECTED':
        return { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' };
      case 'CLOSED':
        return { bg: '#F1F5F9', color: '#475569', label: 'Closed' };
      case 'UNDER_REVIEW':
      case 'PENDING':
      default:
        return { bg: '#FEF3C7', color: '#B45309', label: 'Under Review' };
    }
  };

  const currentBadge = getStatusBadge(request.status);

  const handleApplyStatusChange = async () => {
    if (!request) return;
    setErrorMsg(null);

    try {
      await onUpdateStatus(request.id, {
        status: targetStatus,
        admin_remark: adminRemark.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update request status.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            {/* Header Card */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <AppAvatar name={request.full_name} size={48} />
                <View style={styles.headerTitles}>
                  <Text style={styles.seekerName} numberOfLines={1}>
                    {request.full_name}
                  </Text>
                  <View style={styles.idRow}>
                    <Text style={styles.idBadge}>{displayId}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: currentBadge.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: currentBadge.color },
                        ]}
                      >
                        {currentBadge.label}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Navigation Segments */}
              <View style={styles.tabBar}>
                {(
                  [
                    { key: 'OVERVIEW', label: 'Overview & Need' },
                    { key: 'REVIEW', label: 'Admin Action' },
                    { key: 'DOCUMENTS', label: 'Documents' },
                  ] as const
                ).map(tab => {
                  const isActive = activeTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[styles.tabItem, isActive && styles.tabItemActive]}
                      onPress={() => setActiveTab(tab.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          isActive && styles.tabTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Scrollable Body */}
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <>
                  {/* Financial Overview Card */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Heart size={16} color="#0F2C59" />
                      <Text style={styles.cardTitle}>Assistance Financials</Text>
                    </View>
                    <View style={styles.financialGrid}>
                      <View style={styles.finCol}>
                        <Text style={styles.finLabel}>REQUESTED GOAL</Text>
                        <Text style={styles.finAmount}>
                          {formatCurrency(request.requested_amount)}
                        </Text>
                      </View>
                      <View style={styles.finCol}>
                        <Text style={styles.finLabel}>AMOUNT COLLECTED</Text>
                        <Text style={[styles.finAmount, { color: '#059669' }]}>
                          {formatCurrency(Number(request.raised_amount) || 0)}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={{ marginTop: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>
                          Collection Progress
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#0F2C59' }}>
                          {request.requested_amount > 0
                            ? Math.min(100, Math.max(0, Math.round(((Number(request.raised_amount) || 0) / request.requested_amount) * 100)))
                            : 0}%
                        </Text>
                      </View>
                      <View style={{ width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                        <View
                          style={{
                            height: '100%',
                            backgroundColor: '#059669',
                            width: `${
                              request.requested_amount > 0
                                ? Math.min(100, Math.max(0, Math.round(((Number(request.raised_amount) || 0) / request.requested_amount) * 100)))
                                : 0
                            }%`,
                          }}
                        />
                      </View>
                    </View>

                    <View style={styles.divider} />
                    <View style={styles.dateRow}>
                      <Text style={styles.dateLabel}>Current Status:</Text>
                      <View style={[styles.statusBadge, { backgroundColor: currentBadge.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }]}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: currentBadge.color }}>
                          {currentBadge.label}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.dateRow, { marginTop: 6 }]}>
                      <Text style={styles.dateLabel}>Applied on:</Text>
                      <Text style={styles.dateVal}>
                        {formatDate(request.created_at)}
                      </Text>
                    </View>
                  </View>

                  {/* Cause & Case Details Card */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <FileText size={16} color="#0F2C59" />
                      <Text style={styles.cardTitle}>Case Information</Text>
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldTitle}>Reason / Cause</Text>
                      <View style={styles.causePill}>
                        <Text style={styles.causePillText}>
                          {request.reason}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldTitle}>Detailed Need Description</Text>
                      <Text style={styles.descriptionText}>
                        {request.description ||
                          'No additional narrative provided. Please verify documents or contact applicant.'}
                      </Text>
                    </View>

                    {request.admin_remark ? (
                      <View style={styles.fieldBlock}>
                        <Text style={styles.fieldTitle}>Admin Verification Notes</Text>
                        <View style={styles.remarkBox}>
                          <Text style={styles.remarkText}>
                            {request.admin_remark}
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </View>

                  {/* Contact Details Card */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <User size={16} color="#0F2C59" />
                      <Text style={styles.cardTitle}>Applicant Contact</Text>
                    </View>

                    <View style={styles.contactRow}>
                      <Phone size={15} color="#64748B" />
                      <Text style={styles.contactVal}>
                        {request.mobile || 'Not available'}
                      </Text>
                    </View>

                    {request.email ? (
                      <View style={styles.contactRow}>
                        <Mail size={15} color="#64748B" />
                        <Text style={styles.contactVal}>{request.email}</Text>
                      </View>
                    ) : null}

                    {request.city ? (
                      <View style={styles.contactRow}>
                        <MapPin size={15} color="#64748B" />
                        <Text style={styles.contactVal}>{request.city}</Text>
                      </View>
                    ) : null}
                  </View>
                </>
              )}

              {/* TAB 2: REVIEW & ACTION */}
              {activeTab === 'REVIEW' && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Shield size={16} color="#0F2C59" />
                    <Text style={styles.cardTitle}>Administrative Review</Text>
                  </View>

                  <Text style={styles.sectionSubtitle}>
                    Select a decision status to update this application:
                  </Text>

                  {/* Decision Chips */}
                  <View style={styles.decisionChips}>
                    {(
                      [
                        { key: 'APPROVED', label: 'Approve', color: '#10B981', bg: '#ECFDF5' },
                        { key: 'REJECTED', label: 'Reject', color: '#EF4444', bg: '#FEF2F2' },
                        { key: 'UNDER_REVIEW', label: 'Under Review', color: '#F59E0B', bg: '#FFFBEB' },
                        { key: 'CLOSED', label: 'Close Request', color: '#64748B', bg: '#F1F5F9' },
                      ] as const
                    ).map(opt => {
                      const isSelected = targetStatus === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[
                            styles.decisionChip,
                            isSelected && {
                              backgroundColor: opt.bg,
                              borderColor: opt.color,
                              borderWidth: 1.5,
                            },
                          ]}
                          onPress={() => setTargetStatus(opt.key)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.decisionChipText,
                              isSelected && { color: opt.color, fontWeight: '800' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Admin Remarks Input */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldTitle}>
                      {targetStatus === 'REJECTED'
                        ? 'Rejection Reason / Notes *'
                        : 'Official Remarks / Decision Note'}
                    </Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textArea}
                        placeholder={
                          targetStatus === 'APPROVED'
                            ? 'e.g. Application verified with medical records and hospital quota.'
                            : targetStatus === 'REJECTED'
                              ? 'e.g. Incomplete verification documents provided.'
                              : 'e.g. Additional documentation required from coordinator.'
                        }
                        placeholderTextColor="#94A3B8"
                        multiline={true}
                        numberOfLines={3}
                        value={adminRemark}
                        onChangeText={setAdminRemark}
                        editable={!isUpdating}
                      />
                    </View>
                  </View>

                  {errorMsg ? (
                    <View style={styles.errorBanner}>
                      <AlertCircle size={15} color="#EF4444" />
                      <Text style={styles.errorBannerText}>{errorMsg}</Text>
                    </View>
                  ) : null}

                  {/* Submit Action Button */}
                  <TouchableOpacity
                    style={[
                      styles.decisionBtn,
                      targetStatus === 'APPROVED'
                        ? styles.approveBtn
                        : targetStatus === 'REJECTED'
                          ? styles.rejectBtn
                          : styles.neutralBtn,
                      isUpdating && { opacity: 0.6 },
                    ]}
                    onPress={handleApplyStatusChange}
                    disabled={isUpdating}
                    activeOpacity={0.85}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.decisionBtnText}>
                        Confirm & Update to {getStatusBadge(targetStatus).label}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* TAB 3: DOCUMENTS */}
              {activeTab === 'DOCUMENTS' && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <FileCheck size={16} color="#0F2C59" />
                    <Text style={styles.cardTitle}>Supporting Documents</Text>
                  </View>

                  <View style={styles.docItem}>
                    <View style={styles.docIconBg}>
                      <FileText size={18} color="#0F2C59" />
                    </View>
                    <View style={styles.docInfo}>
                      <Text style={styles.docName}>
                        Verification Proof - {request.reason}
                      </Text>
                      <Text style={styles.docMeta}>
                        Submitted with application • Verified
                      </Text>
                    </View>
                    <View style={styles.docBadge}>
                      <Text style={styles.docBadgeText}>Attached</Text>
                    </View>
                  </View>

                  <View style={styles.docNoteBox}>
                    <Text style={styles.docNoteText}>
                      All uploaded identification proofs and medical/financial
                      estimates are encrypted and audited per HRSJM security
                      standards.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 44, 89, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
    maxHeight: '92%',
  },
  container: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '100%',
    ...Shadows.elevated,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  headerTitles: {
    flex: 1,
  },
  seekerName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2C59',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  idBadge: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#0F2C59',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F2C59',
    fontWeight: '800',
  },
  scroll: {
    maxHeight: 520,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2C59',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  financialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  finCol: {
    flex: 1,
  },
  finLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  finAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2C59',
    marginTop: 2,
  },
  finStatusText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  dateVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  fieldBlock: {
    gap: 4,
    marginTop: 4,
  },
  fieldTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  causePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  causePillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  descriptionText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: BorderRadius.lg,
  },
  remarkBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  remarkText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  contactVal: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  decisionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  decisionChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  decisionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.lg,
    padding: 8,
  },
  textArea: {
    height: 65,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  decisionBtn: {
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  neutralBtn: {
    backgroundColor: '#0F2C59',
  },
  decisionBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: BorderRadius.md,
  },
  errorBannerText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F2C59',
  },
  docMeta: {
    fontSize: 10.5,
    color: '#64748B',
  },
  docBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  docBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  docNoteBox: {
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: BorderRadius.lg,
    marginTop: 6,
  },
  docNoteText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
});

export default SeekerDetailsModal;
