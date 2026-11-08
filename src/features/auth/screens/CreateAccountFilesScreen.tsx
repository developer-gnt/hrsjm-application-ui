import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import {
  ChevronLeftIcon,
  SearchIcon,
  FilterLinesIcon,
  ChevronRightIcon,
  DocumentFileLinesIcon,
  ImageIcon,
  CameraIcon,
} from '../components/AuthIcons';
import { DocumentTypeOption, UploadedDocFile } from './CreateAccountVerificationScreen';
import { registerUploadedDocument } from '../../admin/membershipApplications/services/uploadedDocumentsCache';
import {
  pickNativeDocument,
  choosePhotoFromNativeGallery,
  takePhotoWithNativeCamera,
} from '../../membership/utils/filePicker';

export interface CreateAccountFilesScreenProps {
  documentType: DocumentTypeOption;
  documentTitle: string;
  onBack: () => void;
  onSelectFile: (fileName: string, sizeBytes: number, mimeType: string, uri?: string) => void;
}


const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const CreateAccountFilesScreen: React.FC<CreateAccountFilesScreenProps> = ({
  documentType,
  documentTitle,
  onBack,
  onSelectFile,
}) => {
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 440 : width;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getDocPrefix = () => (documentType === 'driving' ? 'driving_licence' : documentType);

  const validateAndDeliverFile = (
    fileName: string,
    sizeBytes: number,
    mimeType: string,
    uri?: string
  ): boolean => {
    setErrorMessage(null);

    // Validate extension
    const cleanExt = fileName.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const isValidExt = cleanExt && validExtensions.includes(cleanExt);
    const isValidMime =
      mimeType.startsWith('image/jpeg') ||
      mimeType.startsWith('image/png') ||
      mimeType.startsWith('image/jpg') ||
      mimeType === 'application/pdf';

    if (!isValidExt && !isValidMime) {
      const msg = 'Please select a JPG, PNG or PDF file.';
      setErrorMessage(msg);
      Alert.alert('Unsupported File', msg);
      return false;
    }

    // Validate size (max 5 MB)
    if (sizeBytes > MAX_FILE_SIZE_BYTES) {
      const msg = 'File size must be 5 MB or less.';
      setErrorMessage(msg);
      Alert.alert('File Too Large', msg);
      return false;
    }

    onSelectFile(fileName, sizeBytes, mimeType, uri);
    return true;
  };

  // 1. Browse Documents
  const handleBrowseDocuments = async () => {
    setErrorMessage(null);

    if (Platform.OS === 'web') {
      const docObj = typeof globalThis !== 'undefined' ? (globalThis as any).document : undefined;
      if (docObj && docObj.createElement) {
        const existing = docObj.getElementById('hrsjm-files-input');
        if (existing) {
          try {
            docObj.body.removeChild(existing);
          } catch (_) {}
        }

        const fileInput = docObj.createElement('input');
        fileInput.id = 'hrsjm-files-input';
        fileInput.type = 'file';
        fileInput.accept = 'image/jpeg,image/png,image/jpg,application/pdf,.jpg,.jpeg,.png,.pdf';
        fileInput.style.position = 'fixed';
        fileInput.style.top = '-10000px';
        fileInput.style.left = '-10000px';
        fileInput.style.opacity = '0';
        fileInput.style.visibility = 'hidden';

        fileInput.onchange = (event: any) => {
          const file = event.target?.files?.[0];
          if (file) {
            if (typeof FileReader !== 'undefined') {
              const reader = new FileReader();
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (dataUrl) {
                  registerUploadedDocument(file.name, dataUrl);
                  validateAndDeliverFile(file.name, file.size, file.type || 'application/pdf', dataUrl);
                } else {
                  const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined;
                  if (objectUrl) registerUploadedDocument(file.name, objectUrl);
                  validateAndDeliverFile(file.name, file.size, file.type || 'application/pdf', objectUrl);
                }
              };
              reader.onerror = () => {
                const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined;
                if (objectUrl) registerUploadedDocument(file.name, objectUrl);
                validateAndDeliverFile(file.name, file.size, file.type || 'application/pdf', objectUrl);
              };
              reader.readAsDataURL(file);
            } else {
              const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined;
              if (objectUrl) registerUploadedDocument(file.name, objectUrl);
              validateAndDeliverFile(file.name, file.size, file.type || 'application/pdf', objectUrl);
            }
          }
          try {
            docObj.body.removeChild(fileInput);
          } catch (_) {}
        };

        docObj.body.appendChild(fileInput);
        fileInput.click();
      }
      return;
    }

    try {
      const docPickerMod: any = await import('@react-native-documents/picker' as any).catch(() => null);
      const picker = docPickerMod?.pick ? docPickerMod : docPickerMod?.default;
      if (picker?.pick) {
        const results = await picker.pick({
          type: [picker.types?.pdf, picker.types?.images].filter(Boolean),
          allowMultiSelection: false,
        });

        if (results && results.length > 0) {
          const picked = results[0];
          const fileName = picked.name || `${getDocPrefix()}_document.pdf`;
          const sizeBytes = picked.size ?? 250 * 1024;
          const mimeType = picked.type || 'application/pdf';
          if (picked.uri) registerUploadedDocument(fileName, picked.uri);
          validateAndDeliverFile(fileName, sizeBytes, mimeType, picked.uri);
        }
      } else {
        // Fallback to gallery if documents picker is unavailable on this build
        await handleChooseFromGallery();
      }
    } catch (err: any) {
      if (err?.code === 'OPERATION_CANCELED' || err?.message?.includes('cancel')) {
        // User cancelled, return safely without error
        return;
      }
      console.warn('DocumentPicker Error:', err);
      await handleChooseFromGallery();
    }
  };

  // 2. Choose from Gallery
  const handleChooseFromGallery = async () => {
    setErrorMessage(null);

    if (Platform.OS === 'web') {
      const docObj = typeof globalThis !== 'undefined' ? (globalThis as any).document : undefined;
      if (docObj && docObj.createElement) {
        const fileInput = docObj.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png';
        fileInput.style.position = 'fixed';
        fileInput.style.top = '-10000px';
        fileInput.style.opacity = '0';

        fileInput.onchange = (event: any) => {
          const file = event.target?.files?.[0];
          if (file) {
            if (typeof FileReader !== 'undefined') {
              const reader = new FileReader();
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (dataUrl) {
                  registerUploadedDocument(file.name, dataUrl);
                  validateAndDeliverFile(file.name, file.size, file.type || 'image/jpeg', dataUrl);
                } else {
                  const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined;
                  if (objectUrl) registerUploadedDocument(file.name, objectUrl);
                  validateAndDeliverFile(file.name, file.size, file.type || 'image/jpeg', objectUrl);
                }
              };
              reader.onerror = () => {
                const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined;
                if (objectUrl) registerUploadedDocument(file.name, objectUrl);
                validateAndDeliverFile(file.name, file.size, file.type || 'image/jpeg', objectUrl);
              };
              reader.readAsDataURL(file);
            } else {
              const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined;
              if (objectUrl) registerUploadedDocument(file.name, objectUrl);
              validateAndDeliverFile(file.name, file.size, file.type || 'image/jpeg', objectUrl);
            }
          }
        };

        docObj.body.appendChild(fileInput);
        fileInput.click();
      }
      return;
    }

    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: true,
        quality: 0.8,
      });

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Gallery Error', response.errorMessage || 'Could not open photo gallery');
        return;
      }

      const asset = response.assets?.[0];
      if (asset) {
        let cleanName = asset.fileName || '';
        if (!cleanName || cleanName.startsWith('rn_image_picker_lib_temp_')) {
          if (asset.uri) {
            const decoded = decodeURIComponent(asset.uri);
            const candidate = decoded.substring(decoded.lastIndexOf('/') + 1).split('?')[0];
            if (candidate && !candidate.startsWith('rn_image_picker_lib_temp_') && candidate.includes('.')) {
              cleanName = candidate;
            }
          }
        }
        if (!cleanName || cleanName.startsWith('rn_image_picker_lib_temp_')) {
          const ext = asset.type?.split('/')[1] || 'jpg';
          cleanName = `${getDocPrefix()}_gallery.${ext}`;
        }

        const sizeBytes = asset.fileSize ?? 250 * 1024;
        const mimeType = asset.type || 'image/jpeg';
        const effectiveUri = asset.base64 ? `data:${mimeType};base64,${asset.base64}` : asset.uri;
        if (effectiveUri) registerUploadedDocument(cleanName, effectiveUri);
        validateAndDeliverFile(cleanName, sizeBytes, mimeType, effectiveUri);
      }
    } catch (err) {
      console.warn('launchImageLibrary error:', err);
    }
  };

  // 3. Take Photo with Camera
  const handleTakePhoto = async () => {
    setErrorMessage(null);

    if (Platform.OS === 'android') {
      try {
        const hasCamera = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (!hasCamera) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'HRSJM needs camera access to capture your identity document photo.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
              'Camera Permission Required',
              'Camera permission is required to capture document photos. Please enable Camera in App Settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => Linking.openSettings(),
                },
              ]
            );
            return;
          }
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              'Permission Denied',
              'Camera permission is required to capture photos.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Settings',
                  onPress: () => Linking.openSettings(),
                },
              ]
            );
            return;
          }
        }
      } catch (err) {
        console.warn('Camera permission check error:', err);
      }
    }

    if (Platform.OS === 'web') {
      const docObj = typeof globalThis !== 'undefined' ? (globalThis as any).document : undefined;
      if (docObj && docObj.createElement) {
        const fileInput = docObj.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.capture = 'environment';
        fileInput.style.position = 'fixed';
        fileInput.style.top = '-10000px';
        fileInput.style.opacity = '0';

        fileInput.onchange = (event: any) => {
          const file = event.target?.files?.[0];
          if (file) {
            if (typeof FileReader !== 'undefined') {
              const reader = new FileReader();
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (dataUrl) {
                  registerUploadedDocument(file.name, dataUrl);
                  validateAndDeliverFile(file.name, file.size, file.type || 'image/jpeg', dataUrl);
                } else {
                  const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined;
                  if (objectUrl) registerUploadedDocument(file.name, objectUrl);
                  validateAndDeliverFile(file.name, file.size, file.type || 'image/jpeg', objectUrl);
                }
              };
              reader.onerror = () => {
                const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined;
                if (objectUrl) registerUploadedDocument(file.name, objectUrl);
                validateAndDeliverFile(file.name, file.size, file.type || 'image/jpeg', objectUrl);
              };
              reader.readAsDataURL(file);
            } else {
              const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined;
              if (objectUrl) registerUploadedDocument(file.name, objectUrl);
              validateAndDeliverFile(file.name, file.size, file.type || 'image/jpeg', objectUrl);
            }
          }
        };

        docObj.body.appendChild(fileInput);
        fileInput.click();
      }
      return;
    }

    try {
      const response = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: false,
        includeBase64: true,
        quality: 0.8,
      });

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Camera Error', response.errorMessage || 'Could not capture photo');
        return;
      }

      const asset = response.assets?.[0];
      if (asset) {
        let cleanName = asset.fileName || '';
        if (!cleanName || cleanName.startsWith('rn_image_picker_lib_temp_')) {
          if (asset.uri) {
            const decoded = decodeURIComponent(asset.uri);
            const candidate = decoded.substring(decoded.lastIndexOf('/') + 1).split('?')[0];
            if (candidate && !candidate.startsWith('rn_image_picker_lib_temp_') && candidate.includes('.')) {
              cleanName = candidate;
            }
          }
        }
        if (!cleanName || cleanName.startsWith('rn_image_picker_lib_temp_')) {
          const ext = asset.type?.split('/')[1] || 'jpg';
          cleanName = `${getDocPrefix()}_photo.${ext}`;
        }

        const sizeBytes = asset.fileSize ?? 300 * 1024;
        const mimeType = asset.type || 'image/jpeg';
        const effectiveUri = asset.base64 ? `data:${mimeType};base64,${asset.base64}` : asset.uri;
        validateAndDeliverFile(cleanName, sizeBytes, mimeType, effectiveUri);
      }
    } catch (err) {
      console.warn('launchCamera error:', err);
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back to verification"
            >
              <ChevronLeftIcon size={18} color="#0F2860" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Files</Text>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => {}}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Search files"
              >
                <SearchIcon size={20} color="#0F2860" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => {}}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Filter files"
              >
                <FilterLinesIcon size={20} color="#0F2860" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Validation Error Banner if any */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* 3 File Options Cards */}
          <View style={styles.optionsSection}>
            {/* 1. Browse documents */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleBrowseDocuments}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Browse documents"
            >
              <View style={styles.optionIconContainer}>
                <DocumentFileLinesIcon size={24} color="#0F2860" />
              </View>
              <View style={styles.optionMeta}>
                <Text style={styles.optionTitle}>Browse documents</Text>
                <Text style={styles.optionSubtitle}>
                  Select files up to 2 GB in size
                </Text>
              </View>
              <ChevronRightIcon size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* 2. Choose from gallery */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleChooseFromGallery}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Choose from gallery"
            >
              <View style={styles.optionIconContainer}>
                <ImageIcon size={24} color="#0F2860" />
              </View>
              <View style={styles.optionMeta}>
                <Text style={styles.optionTitle}>Choose from gallery</Text>
                <Text style={styles.optionSubtitle}>
                  Select original quality photos or videos
                </Text>
              </View>
              <ChevronRightIcon size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* 3. Take photo */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleTakePhoto}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Take photo"
            >
              <View style={styles.optionIconContainer}>
                <CameraIcon size={24} color="#0F2860" />
              </View>
              <View style={styles.optionMeta}>
                <Text style={styles.optionTitle}>Take photo</Text>
                <Text style={styles.optionSubtitle}>Capture a new photo</Text>
              </View>
              <ChevronRightIcon size={16} color="#94A3B8" />
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
    paddingBottom: 32,
  },
  mainWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2860',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBannerText: {
    fontSize: 12.5,
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
  },
  optionsSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#EEF2F6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionMeta: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    marginBottom: 3,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  recentSection: {
    paddingHorizontal: 16,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0066FF',
  },
  recentList: {
    gap: 10,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#EEF2F6',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  recentBadge: {
    width: 42,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  badgePdf: {
    backgroundColor: '#EF4444',
  },
  badgeJson: {
    backgroundColor: '#64748B',
  },
  badgeDocx: {
    backgroundColor: '#2563EB',
  },
  badgeZip: {
    backgroundColor: '#6B7280',
  },
  badgeDefault: {
    backgroundColor: '#CBD5E1',
  },
  badgeTextPdf: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeTextJson: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeTextDocx: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  badgeTextZip: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeTextDefault: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recentMeta: {
    flex: 1,
  },
  recentFileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 2,
  },
  recentFileDetails: {
    fontSize: 12,
    color: '#64748B',
  },
});
