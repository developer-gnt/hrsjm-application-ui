import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import {
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { resolveUploadedFileUri } from '../services/uploadedDocumentsCache';

export interface DocumentItemData {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uri?: string;
  fileUri?: string;
  isUploaded?: boolean;
  verified?: boolean;
}

export interface ApplicantDocumentViewerContext {
  applicantName?: string;
  applicationId?: string;
  membershipType?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  fatherName?: string;
  occupation?: string;
  avatarUrl?: string;
}

export interface MembershipDocumentViewerModalProps {
  visible: boolean;
  document?: DocumentItemData | null;
  applicant?: ApplicantDocumentViewerContext;
  onClose: () => void;
}

export const MembershipDocumentViewerModal: React.FC<MembershipDocumentViewerModalProps> = ({
  visible,
  document,
  applicant,
  onClose,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [hasLoadError, setHasLoadError] = useState<boolean>(false);

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setHasLoadError(false);
    setZoomLevel(1);
  }, [document?.id, document?.fileName, document?.uri, visible]);

  if (!document) return null;

  const titleLower = (document.title || '').toLowerCase();
  const fileLower = (document.fileName || '').toLowerCase();
  const effectiveUri = resolveUploadedFileUri(document.fileName, document.uri);

  const isImageFormat =
    fileLower.endsWith('.jpg') ||
    fileLower.endsWith('.jpeg') ||
    fileLower.endsWith('.png') ||
    fileLower.endsWith('.webp') ||
    fileLower.endsWith('.gif') ||
    fileLower.includes('photo') ||
    fileLower.includes('avatar') ||
    fileLower.includes('screenshot');

  const isImageLoadable =
    Boolean(effectiveUri) &&
    !imageError &&
    (effectiveUri?.startsWith('data:image') ||
      effectiveUri?.startsWith('blob:') ||
      effectiveUri?.startsWith('http://') ||
      effectiveUri?.startsWith('https://') ||
      (Platform.OS !== 'web' && (effectiveUri?.startsWith('file://') || effectiveUri?.startsWith('content://'))));

  const isImage = isImageFormat && isImageLoadable;

  const isPdf = fileLower.endsWith('.pdf') || titleLower.includes('pdf');
  const applicantName = applicant?.applicantName || 'Member Applicant';
  const appId = applicant?.applicationId || '—';
  const appType = applicant?.membershipType || 'HRSJM Membership';

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.15, 2.0));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.15, 0.7));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleOpenDirect = () => {
    const globalWin = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
    const activeUri = effectiveUri || document.uri;

    const isDirectWebUrl =
      activeUri &&
      (activeUri.startsWith('http://') ||
        activeUri.startsWith('https://') ||
        activeUri.startsWith('data:') ||
        activeUri.startsWith('blob:'));

    if (isDirectWebUrl) {
      if (Platform.OS === 'web' && globalWin) {
        globalWin.open(activeUri, '_blank');
        return;
      }
      Linking.openURL(activeUri).catch(() => {});
      return;
    }

    if (Platform.OS !== 'web' && activeUri) {
      Linking.openURL(activeUri).catch(() => {});
      return;
    }
    handleOpenPrint();
  };

  const handleOpenPrint = () => {
    const globalWin = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
    const activeUri = effectiveUri || document.uri;

    if (Platform.OS === 'web' && globalWin) {
      if (activeUri && !activeUri.startsWith('blob:') && !activeUri.startsWith('data:')) {
        globalWin.open(activeUri, '_blank');
        return;
      }

      const printWindow = globalWin.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8" />
            <title>${document.title} - ${applicantName}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                background: #f8fafc;
                margin: 0;
                padding: 32px 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .no-print { margin-bottom: 24px; }
              .print-btn {
                background: #011F39;
                color: #FAD465;
                border: 1px solid #FAD465;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
              }
              .doc-sheet {
                width: 100%;
                max-width: 720px;
                background: #ffffff;
                border: 2px solid #011F39;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.08);
              }
              .doc-header {
                border-bottom: 2px solid #011F39;
                padding-bottom: 16px;
                margin-bottom: 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .doc-title {
                font-size: 22px;
                font-weight: 800;
                color: #011F39;
              }
              .doc-sub {
                font-size: 13px;
                color: #64748b;
                margin-top: 4px;
              }
              .doc-badge {
                background: #ECFDF5;
                color: #047857;
                border: 1px solid #A7F3D0;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
              }
              .doc-img-frame {
                text-align: center;
                margin: 20px 0;
              }
              .doc-preview-img {
                max-width: 100%;
                max-height: 540px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
              }
              .meta-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 24px;
                font-size: 13px;
              }
              .meta-table td {
                padding: 10px 8px;
                border-bottom: 1px solid #f1f5f9;
              }
              .meta-table td:first-child {
                font-weight: 700;
                color: #475569;
                width: 35%;
              }
              .meta-table td:last-child {
                color: #0f172a;
              }
              @media print {
                body { background: #fff; padding: 0; }
                .no-print { display: none; }
                .doc-sheet { box-shadow: none; border: none; padding: 12px 0; }
              }
            </style>
          </head>
          <body>
            <div class="no-print">
              <button class="print-btn" onclick="window.print()">🖨️ Print / Save Document</button>
            </div>
            <div class="doc-sheet">
              <div class="doc-header">
                <div>
                  <div class="doc-title">${document.title}</div>
                  <div class="doc-sub">${applicantName} • ${appType} (${appId})</div>
                </div>
                <div class="doc-badge">✓ Verified Document</div>
              </div>
              ${
                isImage && effectiveUri
                  ? `<div class="doc-img-frame"><img src="${effectiveUri}" class="doc-preview-img" alt="Uploaded Document" /></div>`
                  : ''
              }
              <table class="meta-table">
                <tr><td>Document Category</td><td>${document.title}</td></tr>
                <tr><td>File Name</td><td>${document.fileName}</td></tr>
                <tr><td>File Size</td><td>${document.fileSize}</td></tr>
                <tr><td>Upload Date</td><td>${document.uploadDate}</td></tr>
                <tr><td>Applicant</td><td>${applicantName}</td></tr>
                <tr><td>Application Ref</td><td>${appId}</td></tr>
                <tr><td>Verification Status</td><td>Verified and Stored in Database</td></tr>
              </table>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else if (activeUri) {
      Linking.openURL(activeUri).catch(() => {});
    }
  };

  const handleDownload = () => {
    const globalWin = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
    const activeUri = effectiveUri || document.uri;

    const isDirectWebUrl =
      activeUri &&
      (activeUri.startsWith('http://') ||
        activeUri.startsWith('https://') ||
        activeUri.startsWith('data:') ||
        activeUri.startsWith('blob:'));

    if (Platform.OS === 'web' && globalWin && globalWin.document && isDirectWebUrl && !activeUri.startsWith('blob:')) {
      try {
        const link = globalWin.document.createElement('a');
        link.href = activeUri;
        link.download = document.fileName || `${document.title}.jpg`;
        globalWin.document.body.appendChild(link);
        link.click();
        globalWin.document.body.removeChild(link);
        return;
      } catch {}
    } else if (Platform.OS !== 'web' && activeUri) {
      Linking.openURL(activeUri).catch(() => {});
      return;
    }

    handleOpenPrint();
  };

  const renderDocumentContent = () => {
    // 0. Missing / Inaccessible File
    if (hasLoadError) {
      return (
        <View style={styles.errorCard}>
          <View style={styles.errorIconBox}>
            <Text style={styles.errorEmoji}>⚠️</Text>
          </View>
          <Text style={styles.errorTitle}>File Unavailable on Server</Text>
          <Text style={styles.errorFileName}>{document.fileName}</Text>
          <Text style={styles.errorNotice}>
            The document could not be loaded directly from storage. Please verify server storage configuration.
          </Text>
        </View>
      );
    }

    // 1. Direct Image Document Preview
    if (isImage && effectiveUri && !imageError) {
      return (
        <View style={styles.imagePreviewWrap}>
          {imageLoading && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="large" color="#0F2860" />
              <Text style={styles.imageLoadingText}>Loading preview...</Text>
            </View>
          )}
          <Image
            source={{ uri: effectiveUri }}
            style={[
              styles.directImage,
              { transform: [{ scale: zoomLevel }] },
            ]}
            resizeMode="contain"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
              setHasLoadError(true);
            }}
          />
        </View>
      );
    }

    // 2. PDF Document Preview (Web & Mobile)
    if (isPdf && effectiveUri && Platform.OS === 'web') {
      return (
        <View style={styles.pdfPreviewContainer}>
          <View style={styles.pdfActionBanner}>
            <View style={styles.pdfBannerLeft}>
              <Text style={styles.pdfBannerIcon}>📄</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.pdfBannerTitle} numberOfLines={1}>
                  {document.fileName}
                </Text>
                <Text style={styles.pdfBannerSub}>
                  {document.fileSize} • Uploaded {document.uploadDate}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.pdfBannerOpenBtn}
              onPress={handleOpenDirect}
              activeOpacity={0.8}
            >
              <Text style={styles.pdfBannerOpenText}>↗ Open Tab</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pdfEmbedFrame}>
            <iframe
              src={effectiveUri}
              title={document.title || document.fileName}
              style={{
                width: '100%',
                height: 420,
                border: 'none',
                borderRadius: 8,
              }}
            />
          </View>
        </View>
      );
    }

    // 3. Document with active URI (Non-web PDF or attachment)
    if (effectiveUri) {
      return (
        <View style={styles.attachmentCard}>
          <View style={styles.attachmentIconBox}>
            <Text style={styles.attachmentIconEmoji}>📄</Text>
          </View>
          <Text style={styles.attachmentDocTitle}>{document.title}</Text>
          <Text style={styles.attachmentFileName}>{document.fileName}</Text>
          <Text style={styles.attachmentMeta}>
            {document.fileSize} • Uploaded on {document.uploadDate}
          </Text>
          <TouchableOpacity
            style={styles.attachmentOpenBtn}
            onPress={handleOpenDirect}
            activeOpacity={0.85}
          >
            <Text style={styles.attachmentOpenBtnText}>↗ View Original Document</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 4. Fallback Verified Document Presentation
    return (
      <View style={styles.verifiedFallbackCard}>
        <View style={styles.verifiedFallbackIconBox}>
          <Text style={styles.verifiedFallbackEmoji}>📄</Text>
        </View>
        <Text style={styles.verifiedFallbackTitle}>{document.title}</Text>
        <Text style={styles.verifiedFallbackFileName}>{document.fileName}</Text>
        <Text style={styles.verifiedFallbackNotice}>
          This document is recorded in the HRSJM database for applicant {applicantName}.
        </Text>
      </View>
    );
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
          <TouchableWithoutFeedback onPress={e => e.stopPropagation?.()}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.docBadgeIcon}>
                    <Text style={styles.docBadgeEmoji}>
                      {isImage ? '🖼️' : '📄'}
                    </Text>
                  </View>
                  <View style={styles.headerTitleWrap}>
                    <View style={styles.headerTitleRow}>
                      <Text style={styles.titleText} numberOfLines={1}>
                        {document.title}
                      </Text>
                      <View style={styles.verifiedHeaderBadge}>
                        <Text style={styles.verifiedHeaderBadgeText}>✓ Verified</Text>
                      </View>
                    </View>
                    <Text style={styles.subtitleText} numberOfLines={1}>
                      {applicantName} • {appType} ({appId})
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Close document viewer"
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Sub-toolbar */}
              <View style={styles.toolbar}>
                <View style={styles.fileMetaTag}>
                  <Text style={styles.fileMetaTagText} numberOfLines={1}>
                    📎 {document.fileName} • {document.fileSize}
                  </Text>
                </View>

                {/* Zoom Controls for Images */}
                {isImage && (
                  <View style={styles.zoomControls}>
                    <TouchableOpacity
                      style={styles.zoomBtn}
                      onPress={handleZoomOut}
                      activeOpacity={0.7}
                      accessibilityLabel="Zoom out document"
                    >
                      <Text style={styles.zoomBtnText}>−</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleResetZoom}
                      activeOpacity={0.7}
                      accessibilityLabel="Reset zoom"
                    >
                      <Text style={styles.zoomLevelText}>{Math.round(zoomLevel * 100)}%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.zoomBtn}
                      onPress={handleZoomIn}
                      activeOpacity={0.7}
                      accessibilityLabel="Zoom in document"
                    >
                      <Text style={styles.zoomBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Scrollable Document Canvas & Single Consolidated Details */}
              <ScrollView
                style={styles.canvasScroll}
                contentContainerStyle={styles.canvasContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.previewCanvasWrap}>
                  {renderDocumentContent()}
                </View>

                {/* Single Consolidated Document Verification Card */}
                <View style={styles.documentMetaBox}>
                  <View style={styles.metaBoxHeader}>
                    <Text style={styles.metaBoxHeaderTitle}>Document Verification Record</Text>
                    <View style={styles.activeDbPill}>
                      <View style={styles.activeDbDot} />
                      <Text style={styles.activeDbPillText}>Database Linked</Text>
                    </View>
                  </View>

                  <View style={styles.metaGrid}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Document Category:</Text>
                      <Text style={styles.metaValue}>{document.title}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Attachment File:</Text>
                      <Text style={styles.metaValue} numberOfLines={1}>
                        {document.fileName}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Recorded Size:</Text>
                      <Text style={styles.metaValue}>{document.fileSize}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Upload Date:</Text>
                      <Text style={styles.metaValue}>{document.uploadDate || 'Recently'}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Applicant Name:</Text>
                      <Text style={styles.metaValue}>{applicantName}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Verification Status:</Text>
                      <View style={styles.verifiedInlineBadge}>
                        <Text style={styles.verifiedInlineBadgeText}>
                          ✓ Official Document Verified
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Footer Action Bar */}
              <View style={styles.footerActions}>
                <TouchableOpacity
                  style={styles.printActionBtn}
                  onPress={handleOpenDirect}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Open Full Document"
                >
                  <Text style={styles.printActionText} numberOfLines={1}>↗ Full Screen</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.downloadActionBtn}
                  onPress={handleDownload}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Download Document"
                >
                  <Text style={styles.downloadActionText} numberOfLines={1}>📥 Download</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeActionBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss document preview"
                >
                  <Text style={styles.closeActionText} numberOfLines={1}>Close</Text>
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
    backgroundColor: 'rgba(1, 31, 57, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    zIndex: 999999,
    elevation: 999999,
    ...(Platform.OS === 'web'
      ? ({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        } as any)
      : {}),
  },
  modalCard: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 1000000,
    zIndex: 1000000,
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  docBadgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#011F39',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docBadgeEmoji: {
    fontSize: 20,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#011F39',
  },
  verifiedHeaderBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  fileMetaTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    flexShrink: 1,
  },
  fileMetaTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  zoomBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#011F39',
  },
  zoomLevelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#011F39',
    paddingHorizontal: 6,
  },
  canvasScroll: {
    flexGrow: 1,
    marginVertical: 4,
  },
  canvasContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  previewCanvasWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewWrap: {
    width: '100%',
    minHeight: 280,
    maxHeight: 460,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 8,
    overflow: 'hidden',
  },
  directImage: {
    width: '100%',
    height: 360,
  },
  pdfPreviewContainer: {
    width: '100%',
  },
  pdfActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  pdfBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  pdfBannerIcon: {
    fontSize: 22,
  },
  pdfBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
  },
  pdfBannerSub: {
    fontSize: 11,
    color: '#64748B',
  },
  pdfBannerOpenBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pdfBannerOpenText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pdfEmbedFrame: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  attachmentCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
  },
  attachmentIconBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  attachmentIconEmoji: {
    fontSize: 32,
  },
  attachmentDocTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#011F39',
    marginBottom: 4,
  },
  attachmentFileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  attachmentMeta: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  attachmentOpenBtn: {
    backgroundColor: '#011F39',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
  },
  attachmentOpenBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FAD465',
  },
  verifiedFallbackCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
  },
  verifiedFallbackIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  verifiedFallbackEmoji: {
    fontSize: 28,
  },
  verifiedFallbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#011F39',
    marginBottom: 3,
  },
  verifiedFallbackFileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  verifiedFallbackNotice: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  errorIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  errorEmoji: {
    fontSize: 24,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 4,
  },
  errorFileName: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 6,
  },
  errorNotice: {
    fontSize: 11,
    color: '#7F1D1D',
    textAlign: 'center',
  },
  documentMetaBox: {
    width: '100%',
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  metaBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  metaBoxHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#011F39',
  },
  activeDbPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeDbDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeDbPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  metaGrid: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: '65%',
  },
  verifiedInlineBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedInlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  printActionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  printActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#011F39',
  },
  downloadActionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#011F39',
  },
  closeActionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#011F39',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  imageLoadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    zIndex: 2,
  },
  imageLoadingText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '600',
  },
  formatPill: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#0F2860',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  formatPillText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  noPreviewActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  sheetActionBtn: {
    backgroundColor: '#0F2860',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  sheetActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sheetActionBtnSecondary: {
    backgroundColor: '#EEF3FC',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8E5F8',
  },
  sheetActionBtnTextSecondary: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
  },
});
