import { PermissionsAndroid, Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import {
  pick,
  types as docTypes,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';

export interface PickedMediaResult {
  uri: string;
  fileName: string;
  fileSize: string;
  type?: string;
}

/**
 * Check if running in browser / web environment
 */
export function isWebPlatform(): boolean {
  return Platform.OS === 'web' || typeof (globalThis as any).document !== 'undefined';
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '1.2 MB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Native Web File Picker & Camera Capture via hidden DOM input
 */
export function pickWebFile(
  accept: string = 'image/*,application/pdf',
  capture?: 'environment' | 'user',
): Promise<PickedMediaResult | null> {
  return new Promise((resolve) => {
    const webGlobal: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
    const doc = webGlobal.document;
    if (!doc) {
      resolve(null);
      return;
    }

    const input = doc.createElement('input');
    input.type = 'file';
    input.accept = accept;
    if (capture) {
      input.setAttribute('capture', capture);
    }
    input.style.position = 'fixed';
    input.style.top = '-9999px';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    doc.body.appendChild(input);

    let isHandled = false;

    const cleanup = () => {
      try {
        if (input.parentNode) {
          doc.body.removeChild(input);
        }
      } catch {}
    };

    input.onchange = (e: any) => {
      isHandled = true;
      const file: File | undefined = e.target?.files?.[0];
      if (!file) {
        cleanup();
        resolve(null);
        return;
      }

      const fileName = file.name || (capture ? `CAMERA_SCAN_${Date.now()}.jpg` : `DOCUMENT_${Date.now()}.pdf`);
      const fileSize = formatFileSize(file.size);

      if (webGlobal.FileReader) {
        const reader = new webGlobal.FileReader();
        reader.onload = () => {
          cleanup();
          resolve({
            uri: typeof reader.result === 'string' ? reader.result : '',
            fileName,
            fileSize,
            type: file.type,
          });
        };
        reader.onerror = () => {
          cleanup();
          resolve({
            uri: '',
            fileName,
            fileSize,
            type: file.type,
          });
        };
        reader.readAsDataURL(file);
      } else {
        cleanup();
        resolve({
          uri: '',
          fileName,
          fileSize,
          type: file.type,
        });
      }
    };

    const onWindowFocus = () => {
      setTimeout(() => {
        if (!isHandled) {
          cleanup();
          resolve(null);
        }
      }, 1500);
    };
    webGlobal.addEventListener?.('focus', onWindowFocus, { once: true });

    input.click();
  });
}

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

/**
 * Launch phone Camera or Web Camera for taking photo / document scan
 */
export async function takePhotoWithNativeCamera(
  cameraType: 'front' | 'back' = 'front'
): Promise<PickedMediaResult | null> {
  if (isWebPlatform()) {
    return pickWebFile('image/*', cameraType === 'front' ? 'user' : 'environment');
  }

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
    console.warn('launchCamera error, fallback to web input:', err);
    return pickWebFile('image/*', cameraType === 'front' ? 'user' : 'environment');
  }
}

/**
 * Launch phone Gallery or Web Image Chooser
 */
export async function choosePhotoFromNativeGallery(): Promise<PickedMediaResult | null> {
  if (isWebPlatform()) {
    return pickWebFile('image/*');
  }

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
    console.warn('launchImageLibrary error, fallback to web input:', err);
    return pickWebFile('image/*');
  }
}

/**
 * Launch Android/iOS Document Chooser or Web File Browser (PDF, JPG, PNG)
 */
export async function pickNativeDocument(): Promise<PickedMediaResult | null> {
  if (isWebPlatform()) {
    return pickWebFile('.pdf,application/pdf,image/png,image/jpeg,image/webp,.jpg,.jpeg,.png');
  }

  try {
    const results = await pick({
      type: [docTypes.images, docTypes.pdf],
    });

    const res = results[0];
    if (!res || !res.uri) return null;

    return {
      uri: res.uri,
      fileName: res.name || `document_${Date.now()}.pdf`,
      fileSize: formatFileSize(res.size ?? undefined),
      type: res.type ?? undefined,
    };
  } catch (err: any) {
    if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
      // User cancelled
      return null;
    }
    console.warn('DocumentPicker error, fallback to web input:', err);
    return pickWebFile('.pdf,application/pdf,image/png,image/jpeg,image/webp,.jpg,.jpeg,.png');
  }
}
