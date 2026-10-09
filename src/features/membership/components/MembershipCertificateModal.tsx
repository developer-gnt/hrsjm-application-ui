import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { MembershipDetailsData } from '../hooks/useMembershipDetailsData';
import { DocumentItem } from './MembershipDocumentsSection';
import {
  generateMembershipCertificatePdf,
  generateMembershipCardPdf,
  generateMembershipGuidelinesPdf,
  downloadOrOpenPdf,
} from '../utils/membershipDocumentGenerator';

interface MembershipCertificateModalProps {
  visible: boolean;
  document: DocumentItem | null;
  memberData: MembershipDetailsData;
  onClose: () => void;
  onDownloadComplete?: () => void;
}

export const MembershipCertificateModal: React.FC<MembershipCertificateModalProps> = ({
  visible,
  document,
  memberData,
  onClose,
  onDownloadComplete,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Reset download status when modal opens or document changes
  useEffect(() => {
    if (visible) {
      setDownloading(false);
      setDownloaded(false);
    }
  }, [visible, document?.id]);

  if (!visible || !document) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      let pdfDoc: any;
      let fileName = '';

      if (document.type === 'certificate') {
        pdfDoc = await generateMembershipCertificatePdf(memberData);
        fileName = `HRSJM-Membership-Certificate-${memberData.memberId || '2026'}.pdf`;
      } else if (document.type === 'idcard') {
        pdfDoc = await generateMembershipCardPdf(memberData);
        fileName = `HRSJM-Member-ID-Card-${memberData.memberId || '2026'}.pdf`;
      } else {
        pdfDoc = await generateMembershipGuidelinesPdf(memberData);
        fileName = 'HRSJM-Membership-Guidelines.pdf';
      }

      await downloadOrOpenPdf(pdfDoc, fileName);
      setDownloaded(true);
      onDownloadComplete?.();
    } catch (err) {
      console.warn('PDF download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Top Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerTitleRow}>
                  <Text style={styles.docEmoji}>
                    {document.type === 'certificate' ? '🏆' : document.type === 'idcard' ? '🪪' : '📑'}
                  </Text>
                  <View style={styles.headerTextGroup}>
                    <Text style={styles.modalTitle} numberOfLines={1}>
                      {document.title}
                    </Text>
                    {downloaded ? (
                      <Text style={styles.successSubtitle}>✓ Downloaded successfully</Text>
                    ) : (
                      <Text style={styles.previewSubtitle}>Official Document Preview</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                  accessibilityLabel="Close document modal"
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Visual Document Previews */}
                {document.type === 'certificate' ? (
                  /* 1. Certificate Preview */
                  <View style={styles.certificatePaper}>
                    <View style={styles.goldBorder}>
                      <View style={styles.innerNavyBorder}>
                        <Text style={styles.certOrg}>
                          HUMAN RIGHTS & SOCIAL JUSTICE MISSION
                        </Text>
                        <Text style={styles.certSub}>
                          मानव अधिकार • सामाजिक न्याय • REG. ACT XXI OF 1860
                        </Text>
                        <View style={styles.certGoldDivider} />

                        <Text style={styles.certHeading}>CERTIFICATE OF MEMBERSHIP</Text>
                        <Text style={styles.certLead}>This is to proudly certify that</Text>

                        <Text style={styles.certName}>{memberData.fullName || 'Member Name'}</Text>
                        <View style={styles.nameUnderline} />

                        <Text style={styles.certStatement}>
                          is officially enrolled as an authorized{' '}
                          <Text style={styles.certBold}>{memberData.membershipType}</Text> of Human Rights & Social Justice Mission.
                        </Text>

                        <View style={styles.certMetaBox}>
                          <View style={styles.certMetaCol}>
                            <Text style={styles.metaLabel}>MEMBER ID</Text>
                            <Text style={styles.metaVal}>{memberData.memberId || 'HRSJM202600123'}</Text>
                          </View>
                          <View style={styles.certMetaCol}>
                            <Text style={styles.metaLabel}>JOINED ON</Text>
                            <Text style={styles.metaVal}>{memberData.joinDate || '15 Sep 2026'}</Text>
                          </View>
                          <View style={styles.certMetaCol}>
                            <Text style={styles.metaLabel}>VALID TILL</Text>
                            <Text style={styles.metaVal}>{memberData.validTill || '15 Sep 2027'}</Text>
                          </View>
                        </View>

                        <View style={styles.sealRow}>
                          <View style={styles.sigCol}>
                            <View style={styles.sigLine} />
                            <Text style={styles.sigRole}>National President</Text>
                            <Text style={styles.sigSub}>HRSJM Council</Text>
                          </View>

                          <View style={styles.sealCircle}>
                            <Text style={styles.sealText}>★ SEAL ★</Text>
                            <Text style={styles.sealOrg}>HRSJM</Text>
                          </View>

                          <View style={styles.sigCol}>
                            <View style={styles.sigLine} />
                            <Text style={styles.sigRole}>General Secretary</Text>
                            <Text style={styles.sigSub}>Human Rights Mission</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : document.type === 'idcard' ? (
                  /* 2. ID Card Preview */
                  <View style={styles.idCardPreview}>
                    <View style={styles.idCardTopBand}>
                      <Text style={styles.idCardBrand}>HRSJM • HUMAN RIGHTS MISSION</Text>
                      <View style={styles.idCardPill}>
                        <Text style={styles.idCardPillText}>{memberData.status}</Text>
                      </View>
                    </View>
                    <View style={styles.idCardBody}>
                      <View style={styles.idCardPhoto}>
                        <Text style={styles.idCardPhotoText}>PHOTO</Text>
                      </View>
                      <View style={styles.idCardDetails}>
                        <Text style={styles.idCardName}>{memberData.fullName}</Text>
                        <Text style={styles.idCardType}>{memberData.membershipType}</Text>
                        <Text style={styles.idCardRow}>
                          <Text style={styles.idCardLabel}>ID: </Text>
                          <Text style={styles.idCardVal}>{memberData.memberId}</Text>
                        </Text>
                        <Text style={styles.idCardRow}>
                          <Text style={styles.idCardLabel}>Valid: </Text>
                          <Text style={styles.idCardVal}>{memberData.validTill}</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  /* 3. Guidelines Preview */
                  <View style={styles.guidelinesPreview}>
                    <Text style={styles.guidelinesTitle}>HRSJM Code of Conduct & Guidelines</Text>
                    <Text style={styles.guidelinesPara}>
                      1. Uphold the fundamental dignity, human rights, and constitutional principles of all individuals.
                    </Text>
                    <Text style={styles.guidelinesPara}>
                      2. Participate actively in authorized community justice, outreach campaigns, and educational drives.
                    </Text>
                    <Text style={styles.guidelinesPara}>
                      3. Organization credentials and identity cards are strictly non-transferable and for authorized use only.
                    </Text>
                    <Text style={styles.guidelinesPara}>
                      4. Direct grievance escalation available via the National Helpdesk at support@hrsjm.org.
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Bottom Actions: EXACTLY 2 BUTTONS SIDE BY SIDE WITH 50/50 WIDTH */}
              <View style={styles.footerRow}>
                {/* Download Button (50%) */}
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={handleDownload}
                  activeOpacity={0.8}
                  disabled={downloading}
                  accessibilityRole="button"
                  accessibilityLabel="Download PDF"
                >
                  <Text style={styles.downloadBtnText}>
                    {downloading ? 'Downloading...' : 'Download'}
                  </Text>
                </TouchableOpacity>

                {/* Done Button (50%) */}
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Done"
                >
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 60, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  docEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTextGroup: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
  },
  previewSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  successSubtitle: {
    fontSize: 11.5,
    color: '#16A34A',
    fontWeight: '700',
    marginTop: 1,
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
  scrollArea: {
    maxHeight: 460,
  },
  scrollContainer: {
    padding: 16,
  },

  /* Visual Certificate Styling */
  certificatePaper: {
    backgroundColor: '#FEFCF6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  goldBorder: {
    borderWidth: 2,
    borderColor: '#D4AF37',
    padding: 4,
    borderRadius: 4,
  },
  innerNavyBorder: {
    borderWidth: 1,
    borderColor: '#0F2860',
    padding: 14,
    borderRadius: 2,
    alignItems: 'center',
  },
  certOrg: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F2860',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  certSub: {
    fontSize: 8.5,
    color: '#B45309',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  certGoldDivider: {
    width: '60%',
    height: 1,
    backgroundColor: '#D4AF37',
    marginVertical: 8,
  },
  certHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F2860',
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    textAlign: 'center',
  },
  certLead: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  certName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    marginTop: 4,
    textAlign: 'center',
  },
  nameUnderline: {
    width: '50%',
    height: 1.5,
    backgroundColor: '#D4AF37',
    marginTop: 3,
    marginBottom: 8,
  },
  certStatement: {
    fontSize: 10,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 10,
  },
  certBold: {
    fontWeight: '700',
    color: '#0F2860',
  },
  certMetaBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  certMetaCol: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 10,
    color: '#0F2860',
    fontWeight: '700',
    marginTop: 1,
  },
  sealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 4,
  },
  sigCol: {
    alignItems: 'center',
    flex: 1,
  },
  sigLine: {
    width: '80%',
    height: 1,
    backgroundColor: '#94A3B8',
    marginBottom: 3,
  },
  sigRole: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0F2860',
  },
  sigSub: {
    fontSize: 7.5,
    color: '#64748B',
  },
  sealCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  sealText: {
    fontSize: 6,
    fontWeight: '700',
    color: '#B45309',
  },
  sealOrg: {
    fontSize: 8,
    fontWeight: '800',
    color: '#B45309',
  },

  /* ID Card Preview */
  idCardPreview: {
    backgroundColor: '#0F2860',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  idCardTopBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.4)',
    paddingBottom: 8,
    marginBottom: 10,
  },
  idCardBrand: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  idCardPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  idCardPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  idCardBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  idCardPhoto: {
    width: 50,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#1E3A8A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idCardPhotoText: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '600',
  },
  idCardDetails: {
    flex: 1,
    gap: 3,
  },
  idCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  idCardType: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F4B843',
  },
  idCardRow: {
    fontSize: 10,
  },
  idCardLabel: {
    color: '#94A3B8',
  },
  idCardVal: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* Guidelines Preview */
  guidelinesPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 4,
  },
  guidelinesPara: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },

  /* Bottom Actions: Exactly 2 Buttons 50/50 Side by Side */
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  downloadBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EAA224',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A204C',
    letterSpacing: 0.2,
  },
  doneBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
