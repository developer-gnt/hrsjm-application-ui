import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  CheckCircleFilledIcon,
  AadhaarDocIcon,
  PanCardDocIcon,
  PassportDocIcon,
  DrivingLicenceDocIcon,
  VoterIdDocIcon,
  OtherDocIcon,
  UploadDocSheetIcon,
  UploadTrayIcon,
  LockOutlineIcon,
  ArrowRightIcon,
} from '../components/AuthIcons';

export type DocumentTypeOption =
  | 'aadhaar'
  | 'pan'
  | 'passport'
  | 'driving'
  | 'voter'
  | 'other';

export interface UploadedDocFile {
  name: string;
  sizeBytes: number;
  type: string;
  formattedSize: string;
}

interface DocumentConfig {
  id: DocumentTypeOption;
  title: string;
  description: string;
  renderIcon: (color: string) => React.ReactNode;
}

const DOCUMENT_OPTIONS: DocumentConfig[] = [
  {
    id: 'aadhaar',
    title: 'Aadhaar Card',
    description: 'Upload a clear photo or scan\nof your Aadhaar Card',
    renderIcon: color => <AadhaarDocIcon size={24} color={color} />,
  },
  {
    id: 'pan',
    title: 'PAN Card',
    description: 'Upload a clear photo or scan\nof your PAN Card',
    renderIcon: color => <PanCardDocIcon size={24} color={color} />,
  },
  {
    id: 'passport',
    title: 'Passport',
    description: 'Upload a clear photo or scan\nof your Passport',
    renderIcon: color => <PassportDocIcon size={24} color={color} />,
  },
  {
    id: 'driving',
    title: 'Driving Licence',
    description: 'Upload a clear photo or scan\nof your Driving Licence',
    renderIcon: color => <DrivingLicenceDocIcon size={24} color={color} />,
  },
  {
    id: 'voter',
    title: 'Voter ID',
    description: 'Upload a clear photo or scan\nof your Voter ID Card',
    renderIcon: color => <VoterIdDocIcon size={24} color={color} />,
  },
  {
    id: 'other',
    title: 'Other Document',
    description:
      'Upload a clear photo or scan of any other valid document (e.g. Government ID, Employee ID, Student ID, etc.)',
    renderIcon: color => <OtherDocIcon size={24} color={color} />,
  },
];

interface CreateAccountVerificationScreenProps {
  onBack?: () => void;
  onContinue?: (selectedDoc: DocumentTypeOption, uploadedFile: UploadedDocFile) => void;
}

interface StepItem {
  number: number;
  label: string;
}

const STEPS: StepItem[] = [
  { number: 1, label: 'Personal\nDetails' },
  { number: 2, label: 'Additional\nInformation' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Complete' },
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const CreateAccountVerificationScreen: React.FC<CreateAccountVerificationScreenProps> = ({
  onBack,
  onContinue,
}) => {
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 440 : width;
  const currentStep = 3; // Step 3: Verification

  // Phase 2: Selected document type (default: 'aadhaar')
  const [selectedDoc, setSelectedDoc] = useState<DocumentTypeOption>('aadhaar');

  // Phase 3: Uploaded files map per document type
  const [uploadedFiles, setUploadedFiles] = useState<
    Partial<Record<DocumentTypeOption, UploadedDocFile>>
  >({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentUploadedFile = uploadedFiles[selectedDoc];
  const selectedDocConfig = DOCUMENT_OPTIONS.find(d => d.id === selectedDoc);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).window?.history) {
      (globalThis as any).window.history.back();
    }
  };

  const processSelectedFile = (
    fileName: string,
    sizeBytes: number,
    mimeType: string
  ) => {
    setUploadError(null);

    // Validate extension
    const cleanExt = fileName.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    const isValidExt = cleanExt && validExtensions.includes(cleanExt);
    const isValidMime =
      mimeType.startsWith('image/') ||
      mimeType === 'application/pdf';

    if (!isValidExt && !isValidMime) {
      setUploadError('Please select a JPG, PNG or PDF file.');
      return;
    }

    // Validate size (max 5 MB)
    if (sizeBytes > MAX_FILE_SIZE_BYTES) {
      setUploadError('File size must be 5 MB or less.');
      return;
    }

    const formattedSize =
      sizeBytes < 1024 * 1024
        ? `${Math.round(sizeBytes / 1024)} KB`
        : `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;

    setUploadedFiles(prev => ({
      ...prev,
      [selectedDoc]: {
        name: fileName,
        sizeBytes,
        type: mimeType || `image/${cleanExt}`,
        formattedSize,
      },
    }));
  };

  const handleChooseFile = () => {
    setUploadError(null);

    const docObj = typeof globalThis !== 'undefined' ? (globalThis as any).document : undefined;
    if (docObj && docObj.createElement) {
      // Remove any leftover picker inputs
      const existing = docObj.getElementById('hrsjm-doc-file-input');
      if (existing) {
        try {
          docObj.body.removeChild(existing);
        } catch (_) {}
      }

      // Direct file chooser for web/browser environment
      const fileInput = docObj.createElement('input');
      fileInput.id = 'hrsjm-doc-file-input';
      fileInput.type = 'file';
      fileInput.accept = 'image/jpeg,image/png,image/jpg,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf';
      fileInput.style.position = 'fixed';
      fileInput.style.top = '-10000px';
      fileInput.style.left = '-10000px';
      fileInput.style.opacity = '0';
      fileInput.style.visibility = 'hidden';

      fileInput.onchange = (event: any) => {
        const file = event.target?.files?.[0];
        if (file) {
          processSelectedFile(file.name, file.size, file.type || 'application/octet-stream');
        }
        try {
          docObj.body.removeChild(fileInput);
        } catch (_) {}
      };

      docObj.body.appendChild(fileInput);
      fileInput.click();
    } else {
      // Mobile file picker handler / simulated file selection dialog for Android/iOS
      Alert.alert(
        'Select Document File',
        `Choose file for ${selectedDocConfig?.title || 'Document'}:`,
        [
          {
            text: `${selectedDocConfig?.title || 'Document'}_Scan.pdf (1.4 MB)`,
            onPress: () =>
              processSelectedFile(
                `${selectedDoc}_scan.pdf`,
                1.4 * 1024 * 1024,
                'application/pdf'
              ),
          },
          {
            text: `${selectedDocConfig?.title || 'Document'}_Photo.jpg (2.1 MB)`,
            onPress: () =>
              processSelectedFile(
                `${selectedDoc}_photo.jpg`,
                2.1 * 1024 * 1024,
                'image/jpeg'
              ),
          },
          {
            text: 'Test Oversized File (6.5 MB)',
            onPress: () =>
              processSelectedFile(
                'large_scan.pdf',
                6.5 * 1024 * 1024,
                'application/pdf'
              ),
          },
          {
            text: 'Test Unsupported File (.docx)',
            onPress: () =>
              processSelectedFile(
                'document.docx',
                1.0 * 1024 * 1024,
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };


  const handleRemoveFile = () => {
    setUploadedFiles(prev => {
      const copy = { ...prev };
      delete copy[selectedDoc];
      return copy;
    });
    setUploadError(null);
  };

  const handleContinue = () => {
    if (!currentUploadedFile) {
      setUploadError(
        `Please choose and upload your ${selectedDocConfig?.title || 'document'} before continuing.`
      );
      return;
    }

    setUploadError(null);

    if (onContinue) {
      onContinue(selectedDoc, currentUploadedFile);
    } else {
      Alert.alert(
        'Identity Document Submitted',
        `Your ${selectedDocConfig?.title} (${currentUploadedFile.name}) has been uploaded and submitted for verification.`,
        [{ text: 'OK' }]
      );
    }
  };


  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isTabletOrDesktop && { alignItems: 'center' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainWrapper, { width: contentMaxWidth }]}>
          {/* 1. Header with Back Button & Centered Screen Title */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ChevronLeftIcon size={16} color="#0F2860" />
            </TouchableOpacity>

            <View style={styles.titleWrapper}>
              <Text style={styles.screenTitle}>Create Your Account</Text>
            </View>

            {/* Empty balance spacer for true centering */}
            <View style={styles.headerSpacer} />
          </View>

          {/* 2. 4-Step Progress Indicator */}
          <View style={styles.progressSection}>
            <View style={styles.stepsRow}>
              {STEPS.map((step, index) => {
                const isCompleted = step.number < currentStep;
                const isActive = step.number === currentStep;
                const isLast = index === STEPS.length - 1;

                return (
                  <React.Fragment key={step.number}>
                    {/* Step Node */}
                    <View style={styles.stepNodeContainer}>
                      <View
                        style={[
                          styles.stepCircle,
                          isCompleted && styles.stepCircleCompleted,
                          isActive && styles.stepCircleActive,
                        ]}
                      >
                        {isCompleted ? (
                          <View style={styles.checkMark}>
                            <View style={styles.checkMarkStem} />
                            <View style={styles.checkMarkKick} />
                          </View>
                        ) : (
                          <Text
                            style={[
                              styles.stepNumber,
                              isActive && styles.stepNumberActive,
                            ]}
                          >
                            {step.number}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          (isCompleted || isActive) && styles.stepLabelActive,
                        ]}
                        numberOfLines={2}
                      >
                        {step.label}
                      </Text>
                    </View>

                    {/* Connecting Line between steps */}
                    {!isLast && (
                      <View
                        style={[
                          styles.connectingLine,
                          step.number < currentStep
                            ? styles.connectingLineActive
                            : styles.connectingLineInactive,
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          {/* 3. Identity Verification Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Identity Verification</Text>
            <Text style={styles.sectionDescription}>
              Please select and upload a valid government-issued ID.
            </Text>

            <Text style={styles.selectDocHeading}>Select Document</Text>

            {/* 6 Document Cards List */}
            <View style={styles.docCardsList}>
              {DOCUMENT_OPTIONS.map(doc => {
                const isSelected = selectedDoc === doc.id;
                const hasUploadedFile = Boolean(uploadedFiles[doc.id]);

                return (
                  <TouchableOpacity
                    key={doc.id}
                    style={[
                      styles.docCard,
                      isSelected && styles.docCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedDoc(doc.id);
                      setUploadError(null);
                    }}
                    activeOpacity={0.8}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={doc.title}
                  >
                    {/* Left: Document Icon */}
                    <View style={styles.docIconWrapper}>
                      {doc.renderIcon('#0F2860')}
                    </View>

                    {/* Center: Title & Description */}
                    <View style={styles.docContentWrapper}>
                      <View style={styles.docTitleRow}>
                        <Text style={styles.docTitle}>{doc.title}</Text>
                        {hasUploadedFile && (
                          <View style={styles.uploadedBadge}>
                            <Text style={styles.uploadedBadgeText}>✓ Uploaded</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.docDescription}>{doc.description}</Text>
                    </View>

                    {/* Right: Selection Radio / Check Indicator */}
                    <View style={styles.radioWrapper}>
                      {isSelected ? (
                        <CheckCircleFilledIcon size={20} color="#EAA224" />
                      ) : (
                        <View style={styles.radioUnselected} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 4. Upload Document Section */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadHeading}>Upload Document</Text>

              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  currentUploadedFile && styles.uploadBoxSuccess,
                  uploadError && styles.uploadBoxError,
                ]}
                onPress={!currentUploadedFile ? handleChooseFile : undefined}
                activeOpacity={!currentUploadedFile ? 0.9 : 1}
                accessibilityRole="button"
                accessibilityLabel="Upload Document"
              >
                {currentUploadedFile ? (
                  /* Uploaded File State */
                  <View style={styles.uploadedFileContainer}>
                    <View style={styles.uploadedHeader}>
                      <CheckCircleFilledIcon size={26} color="#10B981" />
                      <View style={styles.uploadedMeta}>
                        <Text style={styles.uploadedFileName} numberOfLines={1}>
                          {currentUploadedFile.name}
                        </Text>
                        <Text style={styles.uploadedFileSize}>
                          {currentUploadedFile.formattedSize} • Ready for verification
                        </Text>
                      </View>
                    </View>

                    <View style={styles.uploadedActions}>
                      <TouchableOpacity
                        style={styles.changeFileButton}
                        onPress={handleChooseFile}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.changeFileText}>Change</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeFileButton}
                        onPress={handleRemoveFile}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.removeFileText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* Empty Upload State */
                  <View style={styles.uploadEmptyContainer}>
                    <View style={styles.uploadIconWrapper}>
                      <UploadDocSheetIcon size={46} color="#0F2860" />
                    </View>
                    <Text style={styles.uploadMainText}>
                      Upload a clear image or PDF
                    </Text>
                    <Text style={styles.uploadSubText}>
                      • JPG, PNG or PDF • Max 5 MB •
                    </Text>

                    <TouchableOpacity
                      style={styles.chooseFileButton}
                      onPress={handleChooseFile}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel="Choose File"
                    >
                      <UploadTrayIcon size={18} color="#0F2860" />
                      <Text style={styles.chooseFileText}>Choose File</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>

              {/* Upload error message */}
              {uploadError && (
                <Text style={styles.uploadErrorText}>{uploadError}</Text>
              )}
            </View>

            {/* 5. Security Message */}
            <View style={styles.securityContainer}>
              <LockOutlineIcon size={14} color="#64748B" />
              <Text style={styles.securityText}>
                Your document is securely used for verification.
              </Text>
            </View>

            {/* 6. Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Continue to next step"
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <View style={styles.continueArrowWrapper}>
                <ArrowRightIcon size={18} color="#0F2860" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    textAlign: 'center',
  },
  headerSpacer: {
    width: 38,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'relative',
  },
  stepNodeContainer: {
    alignItems: 'center',
    width: 68,
    zIndex: 2,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleCompleted: {
    backgroundColor: '#EAA224',
  },
  stepCircleActive: {
    backgroundColor: '#EAA224',
    borderWidth: 0,
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  checkMark: {
    width: 12,
    height: 7,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  checkMarkStem: {},
  checkMarkKick: {},
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 14,
  },
  stepLabelActive: {
    color: '#0F2860',
    fontWeight: '700',
  },
  connectingLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginTop: 15,
    marginHorizontal: -8,
    zIndex: 1,
  },
  connectingLineActive: {
    backgroundColor: '#EAA224',
  },
  connectingLineInactive: {
    backgroundColor: '#E2E8F0',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  sectionDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
  },
  selectDocHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 12,
  },
  docCardsList: {
    gap: 12,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  docCardSelected: {
    borderColor: '#EAA224',
    borderWidth: 1.6,
    backgroundColor: '#FFFDF9',
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  docIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docContentWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
  },
  uploadedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uploadedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  docDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  radioWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  uploadSection: {
    marginTop: 24,
    marginBottom: 10,
  },
  uploadHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 12,
  },
  uploadBox: {
    borderWidth: 1.6,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#FAFBFC',
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    borderStyle: 'solid',
  },
  uploadBoxError: {
    borderColor: '#EF4444',
  },
  uploadEmptyContainer: {
    alignItems: 'center',
    width: '100%',
  },
  uploadIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  uploadMainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 6,
    textAlign: 'center',
  },
  uploadSubText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  chooseFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFDF6',
    borderWidth: 1.5,
    borderColor: '#EAA224',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 28,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chooseFileText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
  },
  uploadedFileContainer: {
    width: '100%',
    alignItems: 'center',
  },
  uploadedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingHorizontal: 8,
  },
  uploadedMeta: {
    flex: 1,
  },
  uploadedFileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 2,
  },
  uploadedFileSize: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  uploadedActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  changeFileButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  changeFileText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F2860',
  },
  removeFileButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  removeFileText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  uploadErrorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
    paddingLeft: 4,
    fontWeight: '500',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAA224',
    height: 50,
    borderRadius: 12,
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
    letterSpacing: 0.3,
  },
  continueArrowWrapper: {
    marginLeft: 8,
  },
});

