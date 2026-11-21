import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import jsQR from 'jsqr';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { AdminColors, BorderRadius, Shadows, Spacing, Typography } from '../../../core';
import { AppButton } from '../../../core/components/common/AppButton';
import {
  Camera,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  KeyRound,
  ShieldCheck,
  Search,
} from '../../../core/components/icons';
import { extractTokenFromQr } from '../services/memberVerificationService';

export interface LiveQrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess?: (tokenOrPayload: string) => void;
  onScan?: (tokenOrPayload: string) => void;
}

export const LiveQrScannerModal: React.FC<LiveQrScannerModalProps> = ({
  visible,
  onClose,
  onScanSuccess,
  onScan,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Align QR code within the target frame');

  // Animated scan laser beam
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Web video / canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scan beam animation loop
  useEffect(() => {
    if (visible && !showManualInput) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.stopAnimation();
    }
  }, [visible, showManualInput, scanAnim]);

  // Request camera permissions & initialize live stream
  useEffect(() => {
    if (!visible) {
      stopCameraStream();
      setIsProcessing(false);
      return;
    }

    let isMounted = true;

    async function initCamera() {
      setPermissionError(null);
      setIsProcessing(false);

      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          try {
            const constraints: MediaStreamConstraints = {
              video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (!isMounted) {
              stream.getTracks().forEach(t => t.stop());
              return;
            }
            streamRef.current = stream;
            setHasPermission(true);

            // Setup HTML video element if DOM available
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.setAttribute('playsinline', 'true');
              await videoRef.current.play();
              startWebScanningLoop();
            }
          } catch (err: any) {
            console.warn('Camera getUserMedia error on web:', err);
            if (isMounted) {
              setHasPermission(false);
              setPermissionError(
                err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
                  ? 'Camera access was denied. Please allow camera permissions in your browser or enter ID manually.'
                  : 'Unable to open camera stream. You can upload an image or enter the ID manually.'
              );
            }
          }
        } else {
          setHasPermission(false);
          setPermissionError('Camera is not supported on this browser. Please enter ID manually or upload a photo.');
        }
      } else if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'HRSJM Camera Permission',
              message: 'HRSJM needs camera access to scan member identification QR codes.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (isMounted) {
            const ok = granted === PermissionsAndroid.RESULTS.GRANTED;
            setHasPermission(ok);
            if (!ok) {
              setPermissionError('Camera permission is required to scan QR codes. Please allow camera access in Settings.');
            }
          }
        } catch (err: any) {
          if (isMounted) {
            setHasPermission(false);
            setPermissionError('Failed to request camera permission: ' + err.message);
          }
        }
      } else {
        setHasPermission(true);
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      stopCameraStream();
    };
  }, [visible]);

  // Clean up camera stream
  const stopCameraStream = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Continuous frame reading loop for Web camera preview
  const startWebScanningLoop = () => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scanFrame = () => {
      if (!visible || isProcessing) {
        animationFrameId.current = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data && code.data.trim().length > 0) {
            handleDetectedCode(code.data);
            return;
          }
        } catch (scanErr) {
          // continue scanning next frame
        }
      }

      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Handle successful code detection with debouncing lock
  const handleDetectedCode = (rawCode: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    stopCameraStream();

    const cleanToken = extractTokenFromQr(rawCode);
    setStatusMessage(`Scanned: ${cleanToken}`);

    // Short success feedback delay
    setTimeout(() => {
      const callback = onScan || onScanSuccess;
      if (callback) {
        callback(rawCode);
      }
      setIsProcessing(false);
    }, 350);
  };

  // Scan from photo using camera or gallery
  const handleCapturePhoto = async (fromGallery = false) => {
    setIsProcessing(true);
    setStatusMessage('Opening camera...');

    try {
      const pickerFn = fromGallery ? launchImageLibrary : launchCamera;
      const res: any = await pickerFn({
        mediaType: 'photo',
        cameraType: 'back',
        includeBase64: true,
        quality: 0.9,
      });

      if (res.didCancel) {
        setIsProcessing(false);
        setStatusMessage('Align QR code within the target frame');
        return;
      }

      if (res.errorMessage) {
        setStatusMessage('Error: ' + res.errorMessage);
        setIsProcessing(false);
        return;
      }

      const asset = res.assets && res.assets[0];
      if (!asset) {
        setIsProcessing(false);
        return;
      }

      setStatusMessage('Decoding QR from photo...');

      // Decode on Web via Image & Canvas
      if (typeof document !== 'undefined') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imgData.data, imgData.width, imgData.height);
            if (code && code.data) {
              handleDetectedCode(code.data);
            } else {
              setStatusMessage('No QR code detected in the photo. Please try again.');
              setIsProcessing(false);
            }
          } else {
            setIsProcessing(false);
          }
        };
        img.onerror = () => {
          setStatusMessage('Could not load image. Please try again.');
          setIsProcessing(false);
        };
        img.src = asset.uri;
      } else {
        // Fallback for native: pass URI or token directly
        handleDetectedCode(asset.fileName || asset.uri);
      }
    } catch (err: any) {
      console.warn('Capture error:', err);
      setStatusMessage('Capture failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Handle manual code submission
  const handleManualSubmit = () => {
    const clean = manualInput.trim();
    if (!clean) return;
    handleDetectedCode(clean);
  };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.scannerCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                <Camera size={18} color="#082046" />
              </View>
              <View>
                <Text style={styles.title}>Member ID Card Scanner</Text>
                <Text style={styles.subtitle}>Hold card steady to scan QR code</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close scanner"
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Viewfinder Area or Manual Input Area */}
          {!showManualInput ? (
            <View style={styles.viewfinderContainer}>
              {/* Web HTML5 video stream */}
              {Platform.OS === 'web' && (
                <div
                  ref={el => (containerRef.current = el as any)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000000',
                  }}
                >
                  <video
                    ref={el => (videoRef.current = el)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    autoPlay
                    muted
                    playsInline
                  />
                </div>
              )}

              {/* Overlay with target frame */}
              <View style={styles.overlayFrame}>
                <View style={styles.targetSquare}>
                  {/* Gold corner brackets */}
                  <View style={[styles.cornerBracket, styles.topLeft]} />
                  <View style={[styles.cornerBracket, styles.topRight]} />
                  <View style={[styles.cornerBracket, styles.bottomLeft]} />
                  <View style={[styles.cornerBracket, styles.bottomRight]} />

                  {/* Animated laser beam */}
                  <Animated.View
                    style={[
                      styles.scanLaser,
                      {
                        transform: [{ translateY }],
                      },
                    ]}
                  />

                  {isProcessing && (
                    <View style={styles.processingMask}>
                      <ActivityIndicator size="large" color="#FAD465" />
                      <Text style={styles.processingText}>Verifying live with database...</Text>
                    </View>
                  )}
                </View>

                {/* Subtitle / status text below target */}
                <Text style={styles.statusHelper}>{statusMessage}</Text>
              </View>

              {/* Permission error state overlay */}
              {permissionError && (
                <View style={styles.permissionErrorOverlay}>
                  <AlertCircle size={36} color="#DC2626" />
                  <Text style={styles.permissionErrorTitle}>Camera Access Required</Text>
                  <Text style={styles.permissionErrorDesc}>{permissionError}</Text>
                  <View style={styles.permissionButtonsRow}>
                    <AppButton
                      title="Take Photo"
                      variant="primary"
                      size="sm"
                      onPress={() => handleCapturePhoto(false)}
                      style={{ marginRight: 8 }}
                    />
                    <AppButton
                      title="Enter ID Manually"
                      variant="outline"
                      size="sm"
                      onPress={() => setShowManualInput(true)}
                    />
                  </View>
                </View>
              )}
            </View>
          ) : (
            /* Manual ID Entry View */
            <View style={styles.manualEntryContainer}>
              <View style={styles.manualIconWrap}>
                <KeyRound size={28} color="#082046" />
              </View>
              <Text style={styles.manualTitle}>Enter Member ID or Token</Text>
              <Text style={styles.manualDesc}>
                Type the Member ID (e.g. HRSJM-00049, ADMIN529, or paste verification URL):
              </Text>

              <TextInput
                style={styles.manualInput}
                placeholder="e.g. HRSJM-00049 or ADMIN529"
                placeholderTextColor="#94A3B8"
                value={manualInput}
                onChangeText={setManualInput}
                autoCapitalize="characters"
                autoCorrect={false}
              />

              <View style={styles.quickChipsWrap}>
                <Text style={styles.quickChipsLabel}>Quick Test Cards:</Text>
                <View style={styles.chipsRow}>
                  {['HRSJM-00049', 'ADMIN529', 'HRSJM-00020'].map(code => (
                    <TouchableOpacity
                      key={code}
                      style={styles.chipButton}
                      onPress={() => setManualInput(code)}
                    >
                      <Text style={styles.chipText}>{code}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <AppButton
                title={isProcessing ? 'Verifying...' : 'Verify Member Live'}
                variant="primary"
                size="md"
                loading={isProcessing}
                disabled={!manualInput.trim()}
                onPress={handleManualSubmit}
                style={styles.manualSubmitBtn}
              />
            </View>
          )}

          {/* Bottom Control Bar */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => handleCapturePhoto(false)}
              activeOpacity={0.7}
            >
              <View style={styles.controlIconCircle}>
                <Camera size={18} color="#082046" />
              </View>
              <Text style={styles.controlLabel}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => handleCapturePhoto(true)}
              activeOpacity={0.7}
            >
              <View style={styles.controlIconCircle}>
                <ImageIcon size={18} color="#082046" />
              </View>
              <Text style={styles.controlLabel}>From Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => setShowManualInput(!showManualInput)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.controlIconCircle,
                  showManualInput && { backgroundColor: '#FAD465' },
                ]}
              >
                <KeyRound size={18} color="#082046" />
              </View>
              <Text style={styles.controlLabel}>
                {showManualInput ? 'Open Camera' : 'Enter ID'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 23, 53, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  scannerCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FAF7F0',
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.cardLarge,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#082046',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
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
  viewfinderContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  targetSquare: {
    width: 220,
    height: 220,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerBracket: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#FAD465',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 6,
  },
  scanLaser: {
    position: 'absolute',
    top: 10,
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: '#FAD465',
    shadowColor: '#FAD465',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  processingMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 23, 53, 0.85)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  statusHelper: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionErrorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  permissionErrorTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  permissionErrorDesc: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },
  permissionButtonsRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  manualEntryContainer: {
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  manualIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#CAA048',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#082046',
  },
  manualDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  manualInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#082046',
  },
  quickChipsWrap: {
    width: '100%',
    marginTop: 12,
    marginBottom: 8,
  },
  quickChipsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipButton: {
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#CAA048',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#082046',
  },
  manualSubmitBtn: {
    width: '100%',
    marginTop: 10,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FAD465',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  controlItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  controlIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
});

export default LiveQrScannerModal;
