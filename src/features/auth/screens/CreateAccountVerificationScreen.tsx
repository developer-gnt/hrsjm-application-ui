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
  Modal,
  Image,
  Linking,
  TextInput,
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
  ImageIcon,
  EyeIcon,
  TrashIcon,
} from '../components/AuthIcons';
import { CreateAccountFilesScreen } from './CreateAccountFilesScreen';
import {
  getRegistrationState,
  updateRegistrationState,
  addOrUpdateDocument,
  removeDocument,
  UploadedDocItem,
  DocumentTypeOption,
} from '../state/registrationState';
import { navigateToCreateAccountComplete } from '../../../core/navigation/appRouter';

export type { DocumentTypeOption };

export interface UploadedDocFile {
  name: string;
  sizeBytes: number;
  type: string;
  formattedSize: string;
  uri?: string;
  uploadDate?: string;
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
  { number: 2, label: 'Account\nType' },
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

  const regState = getRegistrationState();

  // Selected document type
  const [selectedDoc, setSelectedDoc] = useState<DocumentTypeOption>(
    () => regState.selectedDocId || 'aadhaar'
  );

  // Dynamic Other Document entries list (starts with only 1 entry)
  const [otherDocEntries, setOtherDocEntries] = useState<
    { id: string; docName: string; nameError?: string }[]
  >(() => {
    const existingOtherDocs = (regState.documents || []).filter(
      d => d.id === 'other' || d.id.startsWith('other_')
    );
    if (existingOtherDocs.length > 0) {
      return existingOtherDocs.map(doc => {
        const customName = doc.title.replace(/\s*\(Other Document\)$/i, '').trim();
        return {
          id: doc.id,
          docName: customName === 'Other Document' ? '' : customName,
        };
      });
    }
    return [{ id: 'other_1', docName: '' }];
  });

  // Track active picking doc id & title for file selection
  const [activePickingDoc, setActivePickingDoc] = useState<{
    id: DocumentTypeOption;
    title: string;
  } | null>(null);

  // Uploaded files map per document type (Single Source of Truth, initialized from registrationState)
  const [uploadedFiles, setUploadedFiles] = useState<
    Partial<Record<DocumentTypeOption, UploadedDocFile>>
  >(() => {
    const map: Partial<Record<DocumentTypeOption, UploadedDocFile>> = {};
    if (regState.documents && regState.documents.length > 0) {
      regState.documents.forEach(doc => {
        map[doc.id] = {
          name: doc.name,
          sizeBytes: doc.sizeBytes,
          type: doc.type,
          formattedSize: doc.formattedSize,
          uri: doc.uri,
          uploadDate: doc.uploadDate,
        };
      });
    }
    return map;
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isFilesScreenOpen, setIsFilesScreenOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{
    docTitle: string;
    file: UploadedDocFile;
  } | null>(null);

  const currentUploadedFile = uploadedFiles[selectedDoc];
  const selectedDocConfig = DOCUMENT_OPTIONS.find(d => d.id === selectedDoc);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).window?.history) {
      (globalThis as any).window.history.back();
    }
  };

  const handleAddMoreOtherDoc = () => {
    const nextNum = otherDocEntries.length + 1;
    const newId = `other_${Date.now()}_${nextNum}`;
    setOtherDocEntries(prev => [...prev, { id: newId, docName: '' }]);
  };

  const handleRemoveOtherDocCard = (entryId: string) => {
    removeDocument(entryId);
    setUploadedFiles(prev => {
      const copy = { ...prev };
      delete copy[entryId];
      return copy;
    });
    setOtherDocEntries(prev => {
      const filtered = prev.filter(e => e.id !== entryId);
      return filtered.length > 0 ? filtered : [{ id: 'other_1', docName: '' }];
    });
  };

  const handleOtherDocNameChange = (entryId: string, text: string) => {
    setOtherDocEntries(prev =>
      prev.map(e => (e.id === entryId ? { ...e, docName: text, nameError: undefined } : e))
    );
    const currentFile = uploadedFiles[entryId];
    if (currentFile) {
      const displayTitle = text.trim() ? `${text.trim()} (Other Document)` : 'Other Document';
      addOrUpdateDocument({
        id: entryId,
        title: displayTitle,
        name: currentFile.name,
        sizeBytes: currentFile.sizeBytes,
        type: currentFile.type,
        formattedSize: currentFile.formattedSize,
        uri: currentFile.uri,
        uploadDate: currentFile.uploadDate,
        status: 'ready',
      });
    }
  };

  const handleChooseOtherFile = (
    entry: { id: string; docName: string; nameError?: string },
    _index: number
  ) => {
    if (!entry.docName || !entry.docName.trim()) {
      setOtherDocEntries(prev =>
        prev.map(e =>
          e.id === entry.id
            ? { ...e, nameError: 'Please enter your document name before choosing a file.' }
            : e
        )
      );
      return;
    }
    setOtherDocEntries(prev =>
      prev.map(e => (e.id === entry.id ? { ...e, nameError: undefined } : e))
    );
    const displayTitle = `${entry.docName.trim()} (Other Document)`;
    setActivePickingDoc({
      id: entry.id,
      title: displayTitle,
    });
    setIsFilesScreenOpen(true);
  };

  const handleChooseStandardFile = () => {
    setUploadError(null);
    setActivePickingDoc({
      id: selectedDoc,
      title: selectedDocConfig?.title || 'Document',
    });
    setIsFilesScreenOpen(true);
  };

  const processSelectedFile = (
    fileName: string,
    sizeBytes: number,
    mimeType: string,
    uri?: string
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

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const uploadDate = `${day}/${month}/${year}`;

    const docId = activePickingDoc?.id || selectedDoc;
    const docTitle = activePickingDoc?.title || selectedDocConfig?.title || 'Document';

    const newDocItem: UploadedDocItem = {
      id: docId,
      title: docTitle,
      name: fileName,
      sizeBytes,
      type: mimeType || (cleanExt === 'pdf' ? 'application/pdf' : `image/${cleanExt || 'jpeg'}`),
      formattedSize,
      uri,
      uploadDate,
      status: 'ready',
    };

    // Update shared registration state array
    addOrUpdateDocument(newDocItem);

    // Update local verification view map
    setUploadedFiles(prev => ({
      ...prev,
      [docId]: {
        name: fileName,
        sizeBytes,
        type: newDocItem.type,
        formattedSize,
        uri,
        uploadDate,
      },
    }));
  };

  const handleDeleteDocument = (docId: DocumentTypeOption) => {
    removeDocument(docId);
    setUploadedFiles(prev => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
    setUploadError(null);
  };

  const handleViewDocument = async (docTitle: string, file: UploadedDocFile) => {
    if (file.uri) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (isPdf && Platform.OS === 'android') {
        try {
          const supported = await Linking.canOpenURL(file.uri);
          if (supported) {
            await Linking.openURL(file.uri);
            return;
          }
        } catch (_) {}
      }
    }
    setPreviewItem({ docTitle, file });
  };

  const handleContinue = () => {
    const currentUploadedDocs = getRegistrationState().documents;
    if (!currentUploadedDocs || currentUploadedDocs.length === 0) {
      setUploadError(
        `Please choose and upload your ${selectedDocConfig?.title || 'document'} before continuing.`
      );
      return;
    }

    setUploadError(null);

    if (onContinue) {
      const primary = currentUploadedDocs[0];
      onContinue(primary.id, {
        name: primary.name,
        sizeBytes: primary.sizeBytes,
        type: primary.type,
        formattedSize: primary.formattedSize,
        uri: primary.uri,
      });
    } else {
      navigateToCreateAccountComplete();
    }
  };

  if (isFilesScreenOpen) {
    const pickingDocId = activePickingDoc?.id || selectedDoc;
    const pickingDocTitle = activePickingDoc?.title || selectedDocConfig?.title || 'Document';
    return (
      <CreateAccountFilesScreen
        documentType={pickingDocId}
        documentTitle={pickingDocTitle}
        onBack={() => {
          setIsFilesScreenOpen(false);
          setActivePickingDoc(null);
        }}
        onSelectFile={(fileName, sizeBytes, mimeType, uri) => {
          processSelectedFile(fileName, sizeBytes, mimeType, uri);
          setIsFilesScreenOpen(false);
          setActivePickingDoc(null);
        }}
      />
    );
  }

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
                const hasUploadedFile =
                  doc.id === 'other'
                    ? Object.keys(uploadedFiles).some(
                        k => k === 'other' || k.startsWith('other_')
                      )
                    : Boolean(uploadedFiles[doc.id]);

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
                      const file = uploadedFiles[doc.id];
                      updateRegistrationState({
                        selectedDocId: doc.id,
                        selectedDocTitle: doc.title,
                        uploadedFileName: file?.name || '',
                        uploadedFileSize: file?.formattedSize || '',
                        uploadedFileUri: file?.uri || '',
                        hasUploadedDocument: Boolean(file),
                      });
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

            {/* 4A. Standard Document Upload Section (Visible when non-other doc is selected and not yet uploaded) */}
            {selectedDoc !== 'other' && !currentUploadedFile && (
              <View style={styles.uploadSection}>
                <Text style={styles.uploadHeading}>Upload Document</Text>

                <View
                  style={[
                    styles.uploadBox,
                    uploadError && styles.uploadBoxError,
                  ]}
                >
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
                      onPress={handleChooseStandardFile}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel="Choose File"
                    >
                      <UploadTrayIcon size={18} color="#0F2860" />
                      <Text style={styles.chooseFileText}>Choose File</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Upload error message */}
                {uploadError && (
                  <Text style={styles.uploadErrorText}>{uploadError}</Text>
                )}
              </View>
            )}

            {/* 4B. Other Document Multiple Upload Cards (Visible when 'Other Document' is selected) */}
            {selectedDoc === 'other' && (
              <View style={styles.otherDocsSection}>
                {otherDocEntries.map((entry, index) => {
                  const isUploaded = Boolean(uploadedFiles[entry.id]);
                  const placeholderText =
                    index === 0
                      ? 'e.g. Employee ID, Student ID, etc.'
                      : 'e.g. Government ID, Office ID, etc.';

                  return (
                    <View key={entry.id} style={styles.otherDocCard}>
                      {/* Top Row: Title & Delete Card Button */}
                      <View style={styles.otherDocHeaderRow}>
                        <Text style={styles.otherDocCardHeading}>
                          Other Document {index + 1}
                        </Text>
                        <TouchableOpacity
                          style={styles.otherDocDeleteButton}
                          onPress={() => handleRemoveOtherDocCard(entry.id)}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel={`Delete Other Document ${index + 1}`}
                        >
                          <TrashIcon size={16} color="#64748B" />
                        </TouchableOpacity>
                      </View>

                      {/* Document Name Input */}
                      <Text style={styles.otherDocInputLabel}>
                        Enter your document name
                      </Text>
                      <TextInput
                        style={[
                          styles.otherDocTextInput,
                          entry.nameError ? styles.otherDocTextInputError : null,
                        ]}
                        placeholder={placeholderText}
                        placeholderTextColor="#94A3B8"
                        value={entry.docName}
                        onChangeText={text => handleOtherDocNameChange(entry.id, text)}
                        autoCapitalize="words"
                      />
                      {entry.nameError && (
                        <Text style={styles.otherDocErrorText}>{entry.nameError}</Text>
                      )}

                      {/* Upload Box (Only shown if file not yet uploaded for this entry) */}
                      {!isUploaded ? (
                        <View style={styles.otherUploadBox}>
                          <View style={styles.otherUploadIconWrapper}>
                            <UploadDocSheetIcon size={36} color="#0F2860" />
                          </View>
                          <Text style={styles.otherUploadMainText}>
                            Upload a clear image or PDF
                          </Text>
                          <Text style={styles.otherUploadSubText}>
                            • JPG, PNG or PDF • Max 5 MB •
                          </Text>

                          <TouchableOpacity
                            style={styles.otherChooseFileButton}
                            onPress={() => handleChooseOtherFile(entry, index)}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel={`Choose file for Other Document ${index + 1}`}
                          >
                            <UploadTrayIcon size={16} color="#0F2860" />
                            <Text style={styles.otherChooseFileText}>Choose File</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.otherUploadedSuccessRow}>
                          <View style={styles.otherSuccessBadge}>
                            <Text style={styles.otherSuccessBadgeText}>✓ File Uploaded</Text>
                          </View>
                          <Text style={styles.otherSuccessFileName} numberOfLines={1}>
                            {uploadedFiles[entry.id]?.name}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* + Add More Button */}
                <TouchableOpacity
                  style={styles.addMoreButton}
                  onPress={handleAddMoreOtherDoc}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Add More Other Document"
                >
                  <Text style={styles.addMoreButtonText}>+ Add More</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 5. Uploaded Documents Section (Rendered when one or more documents are uploaded) */}
            {regState.documents && regState.documents.length > 0 && (
              <View style={styles.uploadedDocsSection}>
                <Text style={styles.uploadedDocsSectionHeading}>Uploaded Documents</Text>
                <View style={styles.uploadedDocsList}>
                  {regState.documents.map(doc => {
                    const isPdf =
                      doc.type === 'application/pdf' ||
                      doc.name.toLowerCase().endsWith('.pdf');

                    return (
                      <View key={doc.id} style={styles.uploadedDocCard}>
                        {/* Left: Document type badge (PDF with folded corner or Image icon) */}
                        <View style={styles.uploadedDocBadgeWrapper}>
                          {isPdf ? (
                            <View style={styles.pdfBadgeContainer}>
                              <View style={styles.pdfDocBody}>
                                <View style={styles.pdfFold} />
                                <Text style={styles.pdfText}>PDF</Text>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.imageBadgeContainer}>
                              <ImageIcon size={22} color="#0284C7" />
                            </View>
                          )}
                        </View>

                        {/* Middle: Document details */}
                        <View style={styles.uploadedDocMeta}>
                          <Text style={styles.uploadedDocTitle} numberOfLines={1}>
                            {doc.title}
                          </Text>
                          <Text style={styles.uploadedDocFileName} numberOfLines={1} ellipsizeMode="middle">
                            {doc.name}
                          </Text>
                          <Text style={styles.uploadedDocSubDetails} numberOfLines={1}>
                            {doc.formattedSize}  •  {doc.uploadDate || 'Today'}
                          </Text>
                        </View>

                        {/* Right: View & Delete Actions */}
                        <View style={styles.uploadedDocActions}>
                          <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() =>
                              handleViewDocument(doc.title, {
                                name: doc.name,
                                sizeBytes: doc.sizeBytes,
                                type: doc.type,
                                formattedSize: doc.formattedSize,
                                uri: doc.uri,
                                uploadDate: doc.uploadDate,
                              })
                            }
                            activeOpacity={0.75}
                            accessibilityRole="button"
                            accessibilityLabel={`View ${doc.title}`}
                          >
                            <EyeIcon size={16} color="#0F2860" />
                            <Text style={styles.viewButtonText}>View</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteDocument(doc.id)}
                            activeOpacity={0.75}
                            accessibilityRole="button"
                            accessibilityLabel={`Delete ${doc.title}`}
                          >
                            <TrashIcon size={16} color="#475569" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* 6. Security Message (Positioned right below upload / documents list) */}
            <View style={styles.securityContainer}>
              <LockOutlineIcon size={14} color="#64748B" />
              <Text style={styles.securityText}>
                Your document is securely used for verification.
              </Text>
            </View>

            {/* 7. Continue Button */}
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

      {/* File Preview Modal */}
      <Modal
        visible={Boolean(previewItem)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: isTabletOrDesktop ? 480 : '92%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.modalDocTitle}>{previewItem?.docTitle}</Text>
                <Text style={styles.modalFileName} numberOfLines={1}>
                  {previewItem?.file.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPreviewItem(null)}
                style={styles.modalCloseButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Close preview"
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {previewItem?.file.uri &&
              (previewItem.file.type.startsWith('image/') ||
                !previewItem.file.name.toLowerCase().endsWith('.pdf')) ? (
                <Image
                  source={{ uri: previewItem.file.uri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.pdfPreviewBox}>
                  <View style={styles.pdfBadgeContainer}>
                    <View style={styles.pdfDocBody}>
                      <View style={styles.pdfFold} />
                      <Text style={styles.pdfText}>PDF</Text>
                    </View>
                  </View>
                  <Text style={styles.pdfPreviewTitle}>{previewItem?.file.name}</Text>
                  <Text style={styles.pdfPreviewSize}>
                    Size: {previewItem?.file.formattedSize}
                  </Text>
                  <Text style={styles.pdfPreviewStatus}>✓ Ready for verification</Text>
                  {previewItem?.file.uri && (
                    <TouchableOpacity
                      style={styles.openExternalButton}
                      onPress={() => {
                        if (previewItem?.file.uri) {
                          Linking.openURL(previewItem.file.uri).catch(() => {});
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.openExternalText}>Open in System Viewer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setPreviewItem(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalDoneText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  /* Other Document Dynamic Cards */
  otherDocsSection: {
    marginTop: 18,
    marginBottom: 6,
  },
  otherDocCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  otherDocHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  otherDocCardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
  },
  otherDocDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherDocInputLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F2860',
    marginBottom: 6,
  },
  otherDocTextInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F2860',
    marginBottom: 12,
  },
  otherDocTextInputError: {
    borderColor: '#EF4444',
  },
  otherDocErrorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: -8,
    marginBottom: 10,
    fontWeight: '500',
  },
  otherUploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherUploadIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  otherUploadMainText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 4,
    textAlign: 'center',
  },
  otherUploadSubText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    textAlign: 'center',
  },
  otherChooseFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFDF6',
    borderWidth: 1.5,
    borderColor: '#EAA224',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  otherChooseFileText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
  },
  otherUploadedSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  otherSuccessBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  otherSuccessBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  otherSuccessFileName: {
    flex: 1,
    fontSize: 12.5,
    color: '#15803D',
    fontWeight: '500',
  },
  addMoreButton: {
    height: 46,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#EAA224',
    borderRadius: 10,
    backgroundColor: '#FFFDF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addMoreButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B45309',
  },
  uploadedDocsSectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    marginBottom: 12,
  },
  /* Uploaded Documents Section Styles */
  uploadedDocsSection: {
    marginTop: 14,
    marginBottom: 6,
  },
  uploadedDocsList: {
    gap: 10,
  },
  uploadedDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  uploadedDocBadgeWrapper: {
    marginRight: 12,
  },
  pdfBadgeContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfDocBody: {
    width: 26,
    height: 30,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  pdfFold: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 7,
    height: 7,
    backgroundColor: '#FCA5A5',
    borderBottomLeftRadius: 3,
  },
  pdfText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  imageBadgeContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedDocMeta: {
    flex: 1,
    paddingRight: 8,
  },
  uploadedDocTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 2,
  },
  uploadedDocFileName: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#64748B',
    marginBottom: 2,
  },
  uploadedDocSubDetails: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#94A3B8',
  },
  uploadedDocActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EAA224',
    backgroundColor: '#FFFFFF',
  },
  viewButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F2860',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Preview Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 96, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalDocTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  modalFileName: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalBody: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    maxHeight: 380,
    marginBottom: 18,
  },
  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  pdfPreviewBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  pdfPreviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
    marginTop: 14,
    textAlign: 'center',
  },
  pdfPreviewSize: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  pdfPreviewStatus: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
    marginTop: 8,
  },
  openExternalButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0F2860',
  },
  openExternalText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalDoneButton: {
    backgroundColor: '#EAA224',
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F2860',
  },
});

