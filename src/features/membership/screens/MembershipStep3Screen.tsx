import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, serif, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import type { AppStackParamList } from '../../../core/navigation/types';
import { useMembership } from '../context/MembershipContext';
import { MembershipTopBar } from '../components/MembershipTopBar';
import { MembershipProgressBar } from '../components/MembershipProgressBar';
import { DocumentUploadCard } from '../components/DocumentUploadCard';
import { AppBottomSheet } from '../../../core/components/common/AppBottomSheet';
import type { DocumentItem } from '../types/membership.types';
import {
  pickNativeDocument,
  takePhotoWithNativeCamera,
} from '../utils/filePicker';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

interface UploadErrors {
  identity?: string;
  address?: string;
  photo?: string;
}

type DocCategory = 'identity' | 'address' | 'photo';

// Sample official document presets for quick testing
const PRESET_OPTIONS: Record<
  DocCategory,
  Array<{ name: string; fileName: string; size: string }>
> = {
  identity: [
    { name: 'Aadhaar Card (Front & Back)', fileName: 'aadhaar_card_scanned.pdf', size: '1.8 MB' },
    { name: 'PAN Card Copy', fileName: 'pan_card_front_back.pdf', size: '1.2 MB' },
    { name: 'Passport Bio Page', fileName: 'passport_scan_page1.pdf', size: '2.4 MB' },
    { name: 'Voter ID Card', fileName: 'voter_id_official.pdf', size: '1.5 MB' },
    { name: 'Driving License Scan', fileName: 'driving_license_valid.jpg', size: '1.7 MB' },
  ],
  address: [
    { name: 'Electricity Bill (Recent)', fileName: 'electricity_bill_sept.pdf', size: '2.1 MB' },
    { name: 'Registered Rent Agreement', fileName: 'rent_agreement_notarized.pdf', size: '3.5 MB' },
    { name: 'Bank Passbook / Statement', fileName: 'bank_statement_last_month.pdf', size: '1.6 MB' },
    { name: 'LPG Gas Connection Bill', fileName: 'lpg_gas_bill_aug.pdf', size: '1.4 MB' },
  ],
  photo: [
    { name: 'Passport Size Photograph', fileName: 'passport_size_white_bg.jpg', size: '850 KB' },
    { name: 'Color Studio Headshot', fileName: 'recent_headshot_hd.jpg', size: '1.1 MB' },
    { name: 'Formal Studio Portrait', fileName: 'studio_formal_photo.png', size: '920 KB' },
  ],
};

export function MembershipStep3Screen() {
  const navigation = useNavigation<NavProp>();
  const { documents, updateDocuments, submitApplication } = useMembership();

  const [errors, setErrors] = useState<UploadErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [activePickerType, setActivePickerType] = useState<DocCategory | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Custom upload state
  const [customFileName, setCustomFileName] = useState('');
  const [customFileType, setCustomFileType] = useState<'PDF' | 'JPG' | 'PNG'>('PDF');

  const applyUploadedDocument = (
    type: DocCategory,
    docData: { name: string; fileName: string; fileSize?: string; uri?: string }
  ) => {
    if (type === 'identity') {
      updateDocuments({
        identityProof: {
          type: 'identity',
          name: docData.name,
          fileName: docData.fileName,
          fileSize: docData.fileSize || '1.5 MB',
          isUploaded: true,
          fileUri: docData.uri,
        },
      });
      if (errors.identity) setErrors(prev => ({ ...prev, identity: undefined }));
    } else if (type === 'address') {
      updateDocuments({
        addressProof: {
          type: 'address',
          name: docData.name,
          fileName: docData.fileName,
          fileSize: docData.fileSize || '1.8 MB',
          isUploaded: true,
          fileUri: docData.uri,
        },
      });
      if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
    } else if (type === 'photo') {
      updateDocuments({
        photograph: {
          type: 'photo',
          name: docData.name,
          fileName: docData.fileName,
          fileSize: docData.fileSize || '950 KB',
          isUploaded: true,
          fileUri: docData.uri,
        },
      });
      if (errors.photo) setErrors(prev => ({ ...prev, photo: undefined }));
    }
    setActivePickerType(null);
    setCustomFileName('');
  };

  // Launch Native Camera for Document
  const handleLaunchNativeCamera = async (type: DocCategory) => {
    setIsProcessing(true);
    try {
      const result = await takePhotoWithNativeCamera(type === 'photo' ? 'front' : 'back');
      if (result && result.uri) {
        applyUploadedDocument(type, {
          name: type === 'photo' ? 'Photograph' : `${type.toUpperCase()} Document (Camera)`,
          fileName: result.fileName,
          fileSize: result.fileSize,
          uri: result.uri,
        });
      }
    } catch (e) {
      console.warn('Native camera doc scan error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Launch Native File Manager / Document Picker
  const handleLaunchNativeFilePicker = async (type: DocCategory) => {
    setIsProcessing(true);
    try {
      const result = await pickNativeDocument();
      if (result && result.uri) {
        applyUploadedDocument(type, {
          name: `${type.toUpperCase()} Document`,
          fileName: result.fileName,
          fileSize: result.fileSize,
          uri: result.uri,
        });
      }
    } catch (e) {
      console.warn('Native file picker error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomUpload = (type: DocCategory) => {
    const baseName = customFileName.trim() || `${type}_document`;
    const cleanExt = customFileType.toLowerCase();
    const finalFileName = baseName.endsWith(`.${cleanExt}`) ? baseName : `${baseName}.${cleanExt}`;

    applyUploadedDocument(type, {
      name: `${type.toUpperCase()} Proof (${customFileType})`,
      fileName: finalFileName,
      fileSize: `${(Math.random() * 1.5 + 1.0).toFixed(1)} MB`,
    });
  };

  const handleRemove = (type: DocCategory) => {
    if (type === 'identity') {
      updateDocuments({ identityProof: undefined });
    } else if (type === 'address') {
      updateDocuments({ addressProof: undefined });
    } else if (type === 'photo') {
      updateDocuments({ photograph: undefined });
    }
  };

  const validateUploads = (): boolean => {
    const newErrors: UploadErrors = {};

    if (!documents.identityProof?.isUploaded) {
      newErrors.identity = 'Please upload your identity proof';
    }
    if (!documents.addressProof?.isUploaded) {
      newErrors.address = 'Please upload your address proof';
    }
    if (!documents.photograph?.isUploaded) {
      newErrors.photo = 'Please upload your photograph';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateUploads()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const newRecord = submitApplication();
      navigation.navigate('MembershipSubmitted', {
        applicationId: newRecord.applicationId,
      });
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <MembershipTopBar showBack onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Main Title */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Apply for Membership</Text>
        </View>

        {/* 3-Step Progress Bar (Step 3 Active) */}
        <MembershipProgressBar currentStep={3} />

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Document Upload</Text>
          <Text style={styles.sectionSubtitle}>
            Please upload the required documents (3 documents).
          </Text>
        </View>

        {/* Upload Cards */}
        <View style={styles.uploadCardsList}>
          {/* Document 1: Identity Proof */}
          <DocumentUploadCard
            index={1}
            title="Identity Proof"
            subtitle="Aadhaar Card, PAN Card or Passport"
            document={documents.identityProof}
            error={errors.identity}
            onUpload={() => {
              setCustomFileName('my_aadhaar_card');
              setCustomFileType('PDF');
              setActivePickerType('identity');
            }}
            onCameraPress={() => handleLaunchNativeCamera('identity')}
            onFilePress={() => handleLaunchNativeFilePicker('identity')}
            onRemove={() => handleRemove('identity')}
            onPreview={() => setPreviewDoc(documents.identityProof || null)}
          />

          {/* Document 2: Address Proof */}
          <DocumentUploadCard
            index={2}
            title="Address Proof"
            subtitle="Electricity Bill, Rent Agreement or Bank Statement"
            document={documents.addressProof}
            error={errors.address}
            onUpload={() => {
              setCustomFileName('my_address_proof');
              setCustomFileType('PDF');
              setActivePickerType('address');
            }}
            onCameraPress={() => handleLaunchNativeCamera('address')}
            onFilePress={() => handleLaunchNativeFilePicker('address')}
            onRemove={() => handleRemove('address')}
            onPreview={() => setPreviewDoc(documents.addressProof || null)}
          />

          {/* Document 3: Photograph */}
          <DocumentUploadCard
            index={3}
            title="Photograph"
            subtitle="Recent passport size photograph"
            document={documents.photograph}
            error={errors.photo}
            onUpload={() => {
              setCustomFileName('my_passport_photo');
              setCustomFileType('JPG');
              setActivePickerType('photo');
            }}
            onCameraPress={() => handleLaunchNativeCamera('photo')}
            onFilePress={() => handleLaunchNativeFilePicker('photo')}
            onRemove={() => handleRemove('photo')}
            onPreview={() => setPreviewDoc(documents.photograph || null)}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back to Address Details">
            <Icon name="chevron-left" size={18} color={colors.primary} strokeWidth={2.4} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Submit Application">
            {submitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Interactive Document Picker Bottom Sheet */}
      <AppBottomSheet
        visible={activePickerType !== null}
        title={activePickerType ? `Upload ${activePickerType.toUpperCase()} Proof` : 'Upload Document'}
        onClose={() => setActivePickerType(null)}>
        {activePickerType ? (
          <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
            {isProcessing ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Opening device camera / storage...</Text>
              </View>
            ) : (
              <>
                {/* Primary Action Tiles: Direct Phone Camera & Direct Device Files */}
                <View style={styles.primarySourceRow}>
                  <TouchableOpacity
                    style={styles.sourceCard}
                    activeOpacity={0.7}
                    onPress={() => handleLaunchNativeCamera(activePickerType)}>
                    <View style={[styles.sourceIconCircle, { backgroundColor: '#E0F2FE' }]}>
                      <Icon name="camera" size={24} color="#0284C7" strokeWidth={2.3} />
                    </View>
                    <View style={styles.sourceTextWrap}>
                      <Text style={styles.sourceTitle}>Camera Scan</Text>
                      <Text style={styles.sourceSub}>Take instant photo</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sourceCard}
                    activeOpacity={0.7}
                    onPress={() => handleLaunchNativeFilePicker(activePickerType)}>
                    <View style={[styles.sourceIconCircle, { backgroundColor: '#EAF1FE' }]}>
                      <Icon name="upload" size={24} color={colors.primary} strokeWidth={2.3} />
                    </View>
                    <View style={styles.sourceTextWrap}>
                      <Text style={styles.sourceTitle}>Browse Files</Text>
                      <Text style={styles.sourceSub}>Phone storage & PDF</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Custom File Name & Format Input Box */}
                <View style={styles.customUploadSection}>
                  <Text style={styles.customSectionTitle}>Or Enter File Name from Storage:</Text>

                  <View style={styles.customInputRow}>
                    <TextInput
                      style={styles.customFileNameInput}
                      placeholder="Enter file name..."
                      placeholderTextColor="#94A3B8"
                      value={customFileName}
                      onChangeText={setCustomFileName}
                    />
                  </View>

                  <View style={styles.formatRow}>
                    <Text style={styles.formatLabel}>Format:</Text>
                    {(['PDF', 'JPG', 'PNG'] as const).map(fmt => (
                      <TouchableOpacity
                        key={fmt}
                        style={[
                          styles.formatChip,
                          customFileType === fmt && styles.formatChipActive,
                        ]}
                        onPress={() => setCustomFileType(fmt)}>
                        <Text
                          style={[
                            styles.formatChipText,
                            customFileType === fmt && styles.formatChipTextActive,
                          ]}>
                          {fmt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.attachBtn}
                    activeOpacity={0.85}
                    onPress={() => handleCustomUpload(activePickerType)}>
                    <Icon name="upload" size={16} color={colors.white} strokeWidth={2.4} />
                    <Text style={styles.attachBtnText}>
                      Attach "{customFileName.trim() || 'document'}.{customFileType.toLowerCase()}"
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Preset Options */}
                <View style={styles.presetsSection}>
                  <Text style={styles.presetsHeading}>Official Document Presets:</Text>
                  <View style={styles.presetsList}>
                    {PRESET_OPTIONS[activePickerType].map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.presetCard}
                        activeOpacity={0.7}
                        onPress={() => applyUploadedDocument(activePickerType, item)}>
                        <View style={styles.presetIconWrap}>
                          <Icon
                            name={item.fileName.endsWith('.pdf') ? 'file-pdf' : 'file-text'}
                            size={20}
                            color={colors.primary}
                            strokeWidth={2}
                          />
                        </View>
                        <View style={styles.presetTextWrap}>
                          <Text style={styles.presetName}>{item.name}</Text>
                          <Text style={styles.presetMeta}>
                            {item.fileName} • {item.size}
                          </Text>
                        </View>
                        <Icon name="upload" size={18} color={colors.primary} strokeWidth={2} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        ) : null}
      </AppBottomSheet>

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          visible={previewDoc !== null}
          animationType="fade"
          transparent
          onRequestClose={() => setPreviewDoc(null)}>
          <View style={styles.previewModalOverlay}>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewModalTitle}>Document Details</Text>
                <TouchableOpacity
                  onPress={() => setPreviewDoc(null)}
                  style={styles.previewCloseBtn}>
                  <Icon name="x-circle" size={22} color="#64748B" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.docGraphicContainer}>
                <Icon
                  name={previewDoc.fileName?.endsWith('.pdf') ? 'file-pdf' : 'file-text'}
                  size={52}
                  color={colors.primary}
                  strokeWidth={1.8}
                />
                <Text style={styles.docNameBig}>{previewDoc.fileName}</Text>
                <View style={styles.docStatusBadge}>
                  <Icon name="check" size={12} color={colors.active} strokeWidth={3} />
                  <Text style={styles.docStatusBadgeText}>Document Attached & Ready</Text>
                </View>
              </View>

              <View style={styles.docInfoTable}>
                <View style={styles.docInfoRow}>
                  <Text style={styles.docInfoLabel}>Document Type</Text>
                  <Text style={styles.docInfoVal}>{previewDoc.name}</Text>
                </View>
                <View style={styles.docInfoRow}>
                  <Text style={styles.docInfoLabel}>File Size</Text>
                  <Text style={styles.docInfoVal}>{previewDoc.fileSize || '1.8 MB'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.previewDoneBtn}
                onPress={() => setPreviewDoc(null)}>
                <Text style={styles.previewDoneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.card,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 3,
  },
  titleSection: {
    marginBottom: spacing.xs,
  },
  screenTitle: {
    ...serif,
    fontSize: 26,
    fontWeight: '700',
    color: '#16274B',
    letterSpacing: -0.3,
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16274B',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  uploadCardsList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: '#EAF1FE',
    gap: 4,
  },
  backBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.primary,
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },

  /* Document Picker Sheet Styles */
  pickerScroll: {
    maxHeight: 460,
    paddingBottom: spacing.lg,
  },
  loadingBox: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  primarySourceRow: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  sourceCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    padding: spacing.md - 2,
    borderWidth: 1.5,
    borderColor: '#D4E2FC',
    gap: 10,
  },
  sourceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceTextWrap: {
    flex: 1,
  },
  sourceTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16274B',
  },
  sourceSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  customUploadSection: {
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  customSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 42,
    marginBottom: 10,
  },
  customFileNameInput: {
    flex: 1,
    fontSize: 13,
    color: '#16274B',
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  formatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  formatChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formatChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  formatChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  formatChipTextActive: {
    color: colors.white,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.sm,
    gap: 6,
  },
  attachBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  presetsSection: {
    marginBottom: spacing.lg,
  },
  presetsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  presetsList: {
    gap: spacing.sm,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    padding: spacing.md - 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  presetIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetTextWrap: {
    flex: 1,
  },
  presetName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  presetMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  /* Preview Modal Styles */
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  previewCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  previewModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#16274B',
  },
  previewCloseBtn: {
    padding: 4,
  },
  docGraphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  docNameBig: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
  },
  docStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginTop: 6,
  },
  docStatusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.active,
  },
  docInfoTable: {
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 8,
    marginBottom: spacing.md,
  },
  docInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docInfoLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  docInfoVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  previewDoneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  previewDoneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});

export default MembershipStep3Screen;
