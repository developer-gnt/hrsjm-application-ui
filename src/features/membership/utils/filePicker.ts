import { PermissionsAndroid, Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import DocumentPicker, {
  types as docTypes,
  type DocumentPickerResponse,
} from 'react-native-document-picker';

/**
 * Request camera permission on Android
 */
export async function requestAndroidCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'HRSJM Camera Permission',
        message: 'HRSJM needs access to your camera to take profile photos and scan documents.',
        buttonPositive: 'Allow',
        buttonNegative: 'Cancel',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission request error:', err);
    return true;
  }
}

export interface PickedMediaResult {
  uri: string;
  fileName: string;
  fileSize: string;
  type?: string;
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '1.2 MB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Launch native phone Camera for taking photo / selfie
 */
export async function takePhotoWithNativeCamera(
  cameraType: 'front' | 'back' = 'front'
): Promise<PickedMediaResult | null> {
  const hasPermission = await requestAndroidCameraPermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const response: ImagePickerResponse = await launchCamera({
      mediaType: 'photo',
      cameraType,
      quality: 0.8,
      saveToPhotos: false,
    });

    if (response.didCancel || response.errorCode) {
      if (response.errorMessage) {
        console.warn('Image picker error:', response.errorMessage);
      }
      return null;
    }

    const asset = response.assets?.[0];
    if (!asset || !asset.uri) return null;

    return {
      uri: asset.uri,
      fileName: asset.fileName || `IMG_${Date.now()}.jpg`,
      fileSize: formatFileSize(asset.fileSize),
      type: asset.type,
    };
  } catch (err) {
    console.warn('launchCamera error:', err);
    return null;
  }
}

/**
 * Launch native phone Gallery / Photo Picker
 */
export async function choosePhotoFromNativeGallery(): Promise<PickedMediaResult | null> {
  try {
    const response: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (response.didCancel || response.errorCode) {
      return null;
    }

    const asset = response.assets?.[0];
    if (!asset || !asset.uri) return null;

    return {
      uri: asset.uri,
      fileName: asset.fileName || `PHOTO_${Date.now()}.jpg`,
      fileSize: formatFileSize(asset.fileSize),
      type: asset.type,
    };
  } catch (err) {
    console.warn('launchImageLibrary error:', err);
    return null;
  }
}

/**
 * Launch native Android / iOS Document File Chooser (PDF, JPG, PNG)
 */
export async function pickNativeDocument(): Promise<PickedMediaResult | null> {
  try {
    const res = await DocumentPicker.pickSingle({
      type: [docTypes.pdf, docTypes.images],
      copyTo: 'cachesDirectory',
    });

    if (!res || !res.uri) return null;

    return {
      uri: res.fileCopyUri || res.uri,
      fileName: res.name || `document_${Date.now()}.pdf`,
      fileSize: formatFileSize(res.size ?? undefined),
      type: res.type ?? undefined,
    };
  } catch (err: any) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled
      return null;
    }
    console.warn('DocumentPicker error:', err);
    return null;
  }
}
