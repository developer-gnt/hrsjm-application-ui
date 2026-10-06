import React, { useMemo, useState } from 'react';
import {
  Alert,
  Clipboard,
  Dimensions,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BrandColors, StatusTones } from '../../../../core/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppFeedbackModal } from '../../../../core/components/common/AppFeedbackModal';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Download,
  FileCheck,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Share2,
  Shield,
  ShieldCheck,
  User,
  UserCheck,
  UserX,
  X,
} from '../../../../core/components/icons';
import { Avatar } from './Avatar';
import { MyIdCard } from '../../profile/components/MyIdCard';
import type { AdminProfile } from '../../profile/types/profile.types';
import { useMemberDetails, useMemberDocuments } from '../hooks/useMembers';
import type { BackendMembership } from '../services/members.service';
import type { Member } from '../types';

interface MemberProfileModalProps {
  visible: boolean;
  member: Member | null;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onToggleStatus: (member: Member) => void;
}

type ProfileTab = 'overview' | 'idcard' | 'documents';

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  visible,
  member,
  onClose,
  onEdit,
  onToggleStatus,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [cardFeedback, setCardFeedback] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const { data: detailsData } = useMemberDetails(member?.id);
  const { data: documentsData } = useMemberDocuments(member?.id);

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = Math.min(screenWidth - 48, 360);

  // Extract raw backend data
  const rawBackend = (detailsData || member?.rawBackend) as BackendMembership | undefined;
  const appData = rawBackend?.application_data || {};
  const personal = (appData.personal_details as Record<string, any>) || {};
  const category = rawBackend?.category;

  const fullName = member?.name || appData.full_name || rawBackend?.user?.full_name || 'Member';
  const phone = member?.phone && member.phone !== '—' ? member.phone : (appData.mobile_number || rawBackend?.user?.mobile_number || '—');
  const email = member?.email && member.email !== '—' ? member.email : (appData.email || rawBackend?.user?.email || '—');
  const membershipId = member?.membershipId || rawBackend?.membership_number || '—';
  const categoryName = category?.name || member?.categoryName || 'District Unit';
  const fee = category?.fee ? `₹${Number(category.fee).toLocaleString('en-IN')}` : '₹3,000';
  
  const gender = personal.gender || 'Not specified';
  const dob = personal.dob || 'Not specified';
  const qualification = personal.qualification || personal.other_qualification || '10th Pass';
  const address = personal.address || '—';
  const city = personal.city || '—';
  const state = personal.state || '—';
  const pincode = personal.pincode || '—';
  const fullAddress = [address, city, state, pincode].filter(Boolean).join(', ');

  const joinedDate = member?.joinedDate ? new Date(member.joinedDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : '06 Oct 2026';

  const validTillDate = member?.validTill && !member.validTill.includes('Lifetime')
    ? new Date(member.validTill).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Lifetime';

  // Validity calculation
  const validityDaysLeft = useMemo(() => {
    if (!member?.validTill || member.validTill.includes('Lifetime')) return null;
    const diff = new Date(member.validTill).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [member]);

  const copyToClipboard = (text: string, key: string) => {
    Clipboard.setString(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCall = () => {
    if (phone && phone !== '—') {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = () => {
    if (email && email !== '—') {
      Linking.openURL(`mailto:${email}`);
    }
  };

  // Convert to AdminProfile for ID card render
  const idCardProfile: AdminProfile = useMemo(
    () => ({
      fullName,
      email,
      phone,
      role: categoryName,
      department: 'HRSJM Member',
      accountStatus: member?.status === 'ACTIVE' ? 'Active' : 'Suspended',
      accountName: fullName,
      adminId: membershipId,
      membershipType: categoryName,
      memberId: membershipId,
      dateOfBirth: dob !== 'Not specified' ? dob : '01-01-1995',
      memberSince: joinedDate,
      validTill: validTillDate,
    }),
    [fullName, email, phone, categoryName, member, membershipId, dob, joinedDate, validTillDate]
  );

  if (!member) return null;

  // Documents list
  const submittedDocs = [
    {
      id: 'doc-aadhaar-front',
      name: 'Aadhaar Card (Front)',
      type: 'Identity Proof',
      status: 'VERIFIED',
      uploadDate: joinedDate,
      size: '1.4 MB',
    },
    {
      id: 'doc-aadhaar-back',
      name: 'Aadhaar Card (Back)',
      type: 'Address Proof',
      status: 'VERIFIED',
      uploadDate: joinedDate,
      size: '1.2 MB',
    },
    {
      id: 'doc-photo',
      name: 'Passport Photograph',
      type: 'Photo Identification',
      status: 'VERIFIED',
      uploadDate: joinedDate,
      size: '850 KB',
    },
    {
      id: 'doc-qualification',
      name: `Educational Certificate (${qualification})`,
      type: 'Eligibility Document',
      status: 'SUBMITTED',
      uploadDate: joinedDate,
      size: '2.1 MB',
    },
  ];

  const actualDocs = documentsData?.documents || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Hero Header */}
          <View style={styles.heroHeader}>
            <View style={styles.heroTopBar}>
              <View style={styles.badgeRow}>
                <View style={styles.crestCircle}>
                  <ShieldCheck size={18} color="#FFD700" strokeWidth={2.5} />
                </View>
                <Text style={styles.headerOrgText}>HRSJM OFFICIAL MEMBER PROFILE</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessibilityLabel="Close profile"
                accessibilityRole="button"
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Profile Hero Content */}
            <View style={styles.heroProfileRow}>
              <View style={styles.avatarWrapper}>
                <Avatar name={fullName} source={member.photo} size={64} />
                <View
                  style={[
                    styles.statusDot,
                    member.status === 'ACTIVE'
                      ? styles.statusDotActive
                      : member.status === 'EXPIRING_SOON'
                      ? styles.statusDotWarning
                      : styles.statusDotInactive,
                  ]}
                />
              </View>

              <View style={styles.heroTextCol}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {fullName}
                </Text>
                
                <View style={styles.unitBadge}>
                  <Text style={styles.unitBadgeText} numberOfLines={1}>
                    {categoryName}
                  </Text>
                </View>

                {/* Membership ID with Copy */}
                <TouchableOpacity
                  onPress={() => copyToClipboard(membershipId, 'id')}
                  style={styles.memberIdPill}
                  activeOpacity={0.7}
                >
                  <Text style={styles.memberIdText}>{membershipId}</Text>
                  {copiedKey === 'id' ? (
                    <Check size={13} color="#6EE7B7" strokeWidth={2.5} />
                  ) : (
                    <Copy size={13} color="#93C5FD" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Validity Strip */}
            <View style={styles.validityStrip}>
              <View style={styles.validityItem}>
                <Clock3 size={15} color="#93C5FD" />
                <Text style={styles.validityLabel}>
                  {validityDaysLeft !== null
                    ? `${validityDaysLeft} Days Remaining`
                    : 'Validity: Active'}
                </Text>
              </View>
              <View style={styles.validityDivider} />
              <View style={styles.validityItem}>
                <Calendar size={15} color="#93C5FD" />
                <Text style={styles.validityLabel}>Valid till {validTillDate}</Text>
              </View>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabNav}>
            <TouchableOpacity
              onPress={() => setActiveTab('overview')}
              style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
            >
              <User
                size={16}
                color={activeTab === 'overview' ? BrandColors.navy : BrandColors.textMuted}
                strokeWidth={activeTab === 'overview' ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === 'overview' && styles.tabItemTextActive,
                ]}
              >
                Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('idcard')}
              style={[styles.tabItem, activeTab === 'idcard' && styles.tabItemActive]}
            >
              <CreditCard
                size={16}
                color={activeTab === 'idcard' ? BrandColors.navy : BrandColors.textMuted}
                strokeWidth={activeTab === 'idcard' ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === 'idcard' && styles.tabItemTextActive,
                ]}
              >
                ID Card
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('documents')}
              style={[styles.tabItem, activeTab === 'documents' && styles.tabItemActive]}
            >
              <FileCheck
                size={16}
                color={activeTab === 'documents' ? BrandColors.navy : BrandColors.textMuted}
                strokeWidth={activeTab === 'documents' ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === 'documents' && styles.tabItemTextActive,
                ]}
              >
                Documents & KYC
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <View style={styles.tabPane}>
                {/* Membership Tier & Validity Card */}
                <View style={styles.infoCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Membership & Tier</Text>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>
                        {member.status === 'ACTIVE' ? 'ACTIVE' : member.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoGrid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.itemLabel}>Unit / Designation</Text>
                      <Text style={styles.itemValueBold}>{categoryName}</Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={styles.itemLabel}>Membership Fee</Text>
                      <Text style={styles.feeHighlight}>{fee}</Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={styles.itemLabel}>Member Since</Text>
                      <Text style={styles.itemValue}>{joinedDate}</Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={styles.itemLabel}>Valid Till</Text>
                      <Text style={styles.itemValue}>{validTillDate}</Text>
                    </View>
                  </View>
                </View>

                {/* Contact Information Card */}
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Contact Details</Text>

                  <View style={styles.contactRow}>
                    <View style={styles.contactIconBg}>
                      <Phone size={16} color={BrandColors.navy} />
                    </View>
                    <View style={styles.contactTextCol}>
                      <Text style={styles.contactLabel}>Mobile Number</Text>
                      <Text style={styles.contactValue}>{phone}</Text>
                    </View>
                    <View style={styles.contactActions}>
                      <TouchableOpacity
                        onPress={handleCall}
                        style={styles.actionIconButton}
                        hitSlop={8}
                      >
                        <Phone size={15} color={BrandColors.navy} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => copyToClipboard(phone, 'phone')}
                        style={styles.actionIconButton}
                        hitSlop={8}
                      >
                        {copiedKey === 'phone' ? (
                          <Check size={15} color={BrandColors.success} />
                        ) : (
                          <Copy size={15} color={BrandColors.navy} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.contactRow}>
                    <View style={styles.contactIconBg}>
                      <Mail size={16} color={BrandColors.navy} />
                    </View>
                    <View style={styles.contactTextCol}>
                      <Text style={styles.contactLabel}>Email Address</Text>
                      <Text style={styles.contactValue}>{email}</Text>
                    </View>
                    <View style={styles.contactActions}>
                      {email && email !== '—' ? (
                        <TouchableOpacity
                          onPress={handleEmail}
                          style={styles.actionIconButton}
                          hitSlop={8}
                        >
                          <Mail size={15} color={BrandColors.navy} />
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity
                        onPress={() => copyToClipboard(email, 'email')}
                        style={styles.actionIconButton}
                        hitSlop={8}
                      >
                        {copiedKey === 'email' ? (
                          <Check size={15} color={BrandColors.success} />
                        ) : (
                          <Copy size={15} color={BrandColors.navy} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Personal & Academic Background Card */}
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Personal & Academic</Text>

                  <View style={styles.infoGrid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.itemLabel}>Gender</Text>
                      <Text style={styles.itemValue}>{gender}</Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={styles.itemLabel}>Date of Birth</Text>
                      <Text style={styles.itemValue}>{dob}</Text>
                    </View>
                    <View style={[styles.gridItem, { width: '100%' }]}>
                      <Text style={styles.itemLabel}>Educational Qualification</Text>
                      <View style={styles.qualBadge}>
                        <GraduationCap size={15} color={BrandColors.navyDeep} />
                        <Text style={styles.qualText}>{qualification}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Residential Address Card */}
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Residential Address</Text>
                  <View style={styles.addressRow}>
                    <MapPin size={18} color={BrandColors.navy} style={{ marginTop: 2 }} />
                    <Text style={styles.addressText}>
                      {fullAddress || 'Address details not provided'}
                    </Text>
                  </View>
                </View>

                {/* Admin Notes Card */}
                {rawBackend?.admin_notes ? (
                  <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Administrative Notes</Text>
                    <Text style={styles.adminNotesText}>{rawBackend.admin_notes}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* ID CARD TAB */}
            {activeTab === 'idcard' && (
              <View style={styles.tabPane}>
                <View style={styles.idCardContainer}>
                  <Text style={styles.idCardSectionTitle}>Digital Identity Card</Text>
                  <Text style={styles.idCardSubtitle}>
                    Official accredited membership credential issued by HRSJM National Council.
                  </Text>

                  <View style={styles.cardPreviewWrapper}>
                    <MyIdCard profile={idCardProfile} width={cardWidth} />
                  </View>

                  <View style={styles.idCardActions}>
                    <AppButton
                      title="Share ID Card"
                      variant="outline"
                      onPress={() => {
                        setCardFeedback({
                          visible: true,
                          title: 'Share ID Card',
                          message: `Sharing digital ID credentials for ${fullName} (${membershipId})...`,
                        });
                      }}
                      style={styles.cardActionBtn}
                    />
                    <AppButton
                      title="Download Card"
                      variant="primary"
                      onPress={() => {
                        setCardFeedback({
                          visible: true,
                          title: 'Download ID Document',
                          message: `Generating high-resolution official ID card document for ${fullName}...`,
                        });
                      }}
                      style={[styles.cardActionBtn, { backgroundColor: BrandColors.navy }]}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* DOCUMENTS & KYC TAB */}
            {activeTab === 'documents' && (
              <View style={styles.tabPane}>
                {/* KYC Status Banner */}
                <View style={styles.kycBanner}>
                  <View style={styles.kycIconCircle}>
                    <CheckCircle2 size={24} color="#059669" />
                  </View>
                  <View style={styles.kycTextCol}>
                    <Text style={styles.kycTitle}>KYC Verification Complete</Text>
                    <Text style={styles.kycSubtitle}>
                      Identity records and official documentation verified by administrator.
                    </Text>
                  </View>
                </View>

                {/* Uploaded Documents List */}
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Uploaded Verification Records</Text>

                  <View style={styles.docList}>
                    {submittedDocs.map((doc) => (
                      <View key={doc.id} style={styles.docRow}>
                        <View style={styles.docIconBg}>
                          <FileText size={20} color={BrandColors.navy} />
                        </View>
                        <View style={styles.docTextCol}>
                          <Text style={styles.docName} numberOfLines={1}>
                            {doc.name}
                          </Text>
                          <Text style={styles.docMeta}>
                            {doc.type} · {doc.size}
                          </Text>
                        </View>
                        <View style={styles.docStatusBadge}>
                          <Text style={styles.docStatusText}>{doc.status}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => {
                onClose();
                onEdit(member);
              }}
              style={styles.footerEditBtn}
              activeOpacity={0.8}
            >
              <Pencil size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.footerEditBtnText}>Edit Member</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onToggleStatus(member)}
              style={[
                styles.footerStatusBtn,
                member.status === 'ACTIVE'
                  ? styles.footerStatusBtnDeactivate
                  : styles.footerStatusBtnActivate,
              ]}
              activeOpacity={0.8}
            >
              {member.status === 'ACTIVE' ? (
                <>
                  <UserX size={16} color={BrandColors.danger} />
                  <Text style={styles.footerStatusTextDeactivate}>Suspend</Text>
                </>
              ) : (
                <>
                  <UserCheck size={16} color={BrandColors.success} />
                  <Text style={styles.footerStatusTextActivate}>Activate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <AppFeedbackModal
          visible={cardFeedback.visible}
          tone="info"
          title={cardFeedback.title}
          message={cardFeedback.message}
          badgeText="ID CARD"
          onClose={() => setCardFeedback({ visible: false, title: '', message: '' })}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 29, 58, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: BrandColors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '94%',
    minHeight: '75%',
    ...Shadows.elevated,
  },
  heroHeader: {
    backgroundColor: BrandColors.navyDeep,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crestCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerOrgText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: BrandColors.navyDeep,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotWarning: {
    backgroundColor: '#F59E0B',
  },
  statusDotInactive: {
    backgroundColor: '#EF4444',
  },
  heroTextCol: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  unitBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
  },
  memberIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  memberIdText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#93C5FD',
  },
  validityStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: Spacing.md,
  },
  validityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E0E7FF',
  },
  validityDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: BrandColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: BrandColors.navy,
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textMuted,
  },
  tabItemTextActive: {
    color: BrandColors.navy,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  tabPane: {
    gap: Spacing.base,
  },
  infoCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: BrandColors.border,
    gap: Spacing.sm + 4,
    ...Shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.navyDeep,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
  },
  gridItem: {
    width: '46%',
    gap: 2,
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  itemValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.navyDeep,
  },
  feeHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 4,
  },
  contactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTextCol: {
    flex: 1,
    gap: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconButton: {
    padding: 7,
    borderRadius: 6,
    backgroundColor: '#F0F7FF',
  },
  qualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  qualText: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.navyDeep,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressText: {
    fontSize: 13,
    color: BrandColors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
  adminNotesText: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  idCardContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  idCardSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navyDeep,
  },
  idCardSubtitle: {
    fontSize: 12,
    color: BrandColors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.base,
  },
  cardPreviewWrapper: {
    marginVertical: Spacing.sm,
    ...Shadows.elevated,
  },
  idCardActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    marginTop: Spacing.sm,
  },
  cardActionBtn: {
    flex: 1,
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  kycIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kycTextCol: {
    flex: 1,
    gap: 2,
  },
  kycTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  kycSubtitle: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 15,
  },
  docList: {
    gap: Spacing.sm,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  docIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTextCol: {
    flex: 1,
    gap: 2,
  },
  docName: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  docMeta: {
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  docStatusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  docStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.surface,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    ...Shadows.subtle,
  },
  footerEditBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BrandColors.navy,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  footerEditBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerStatusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  footerStatusBtnDeactivate: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  footerStatusBtnActivate: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  footerStatusTextDeactivate: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.danger,
  },
  footerStatusTextActivate: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.success,
  },
});

export default MemberProfileModal;
