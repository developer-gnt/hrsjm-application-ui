import React, { useState } from 'react';
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

  if (!document) return null;

  const titleLower = (document.title || '').toLowerCase();
  const fileLower = (document.fileName || '').toLowerCase();
  const effectiveUri = resolveUploadedFileUri(document.fileName, document.uri);

  const isImage =
    Boolean(effectiveUri) &&
    (fileLower.endsWith('.jpg') ||
      fileLower.endsWith('.jpeg') ||
      fileLower.endsWith('.png') ||
      fileLower.endsWith('.webp') ||
      fileLower.endsWith('.gif') ||
      fileLower.includes('photo') ||
      fileLower.includes('avatar') ||
      effectiveUri?.startsWith('data:image') ||
      effectiveUri?.startsWith('blob:') ||
      effectiveUri?.includes('unsplash.com'));

  const isPdf = fileLower.endsWith('.pdf') || titleLower.includes('pdf');
  const applicantName = applicant?.applicantName || 'Applicant';
  const appId = applicant?.applicationId || '—';
  const appType = applicant?.membershipType || 'Membership Application';

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

    if (activeUri) {
      if (Platform.OS === 'web' && globalWin) {
        globalWin.open(activeUri, '_blank');
        return;
      }
      Linking.openURL(activeUri).catch(() => {});
      return;
    }

    // If no URI exists, print/view authentic metadata
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
                padding: 28px;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .no-print { margin-bottom: 20px; }
              .print-btn {
                background: #0f2860;
                color: #fff;
                border: none;
                padding: 10px 22px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
              }
              .doc-sheet {
                width: 100%;
                max-width: 680px;
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 10px;
                padding: 24px;
                box-shadow: 0 4px 14px rgba(0,0,0,0.06);
              }
              .doc-header {
                border-bottom: 2px solid #0f2860;
                padding-bottom: 12px;
                margin-bottom: 18px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
              }
              .doc-title {
                font-size: 20px;
                font-weight: 800;
                color: #0f2860;
              }
              .doc-sub {
                font-size: 12px;
                color: #64748b;
                margin-top: 4px;
              }
              .doc-img-frame {
                text-align: center;
                margin: 18px 0;
              }
              .doc-preview-img {
                max-width: 100%;
                max-height: 520px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
              }
              .meta-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 18px;
                font-size: 13px;
              }
              .meta-table td {
                padding: 8px 6px;
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
              </div>
              ${
                isImage && effectiveUri
                  ? `<div class="doc-img-frame"><img src="${effectiveUri}" class="doc-preview-img" alt="Uploaded Document" /></div>`
                  : ''
              }
              <table class="meta-table">
                <tr><td>Document Title</td><td>${document.title}</td></tr>
                <tr><td>File Name</td><td>${document.fileName}</td></tr>
                <tr><td>File Size</td><td>${document.fileSize}</td></tr>
                <tr><td>Upload Date</td><td>${document.uploadDate}</td></tr>
                <tr><td>Applicant</td><td>${applicantName}</td></tr>
                <tr><td>Application Ref</td><td>${appId}</td></tr>
                <tr><td>Status</td><td>${document.verified ? 'Verified Document' : 'Submitted Attachment'}</td></tr>
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

    if (Platform.OS === 'web' && globalWin && globalWin.document) {
      if (activeUri && !activeUri.startsWith('blob:')) {
        const link = globalWin.document.createElement('a');
        link.href = activeUri;
        link.download = document.fileName;
        globalWin.document.body.appendChild(link);
        link.click();
        globalWin.document.body.removeChild(link);
        return;
      }
      handleOpenPrint();
    } else if (activeUri) {
      Linking.openURL(activeUri).catch(() => {});
    }
  };

  const renderDocumentContent = () => {
    // 1. Direct Image Document Preview
    if (isImage && effectiveUri) {
      return (
        <View style={styles.imagePreviewWrap}>
          <Image
            source={{ uri: effectiveUri }}
            style={[
              styles.directImage,
              { transform: [{ scale: zoomLevel }] },
            ]}
            resizeMode="contain"
          />
        </View>
      );
    }

    // 2. PDF Document Preview
    if (isPdf && effectiveUri && Platform.OS === 'web') {
      return (
        <View style={styles.pdfPreviewContainer}>
          <View style={styles.pdfActionBanner}>
            <View style={styles.pdfBannerLeft}>
              <Text style={styles.pdfBannerIcon}>📄</Text>
              <View>
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
              <Text style={styles.pdfBannerOpenText}>↗ Open Full PDF</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pdfEmbedFrame}>
            <iframe
              src={effectiveUri}
              title={document.title || document.fileName}
              style={{
                width: '100%',
                height: 380,
                border: 'none',
                borderRadius: 8,
              }}
            />
          </View>
        </View>
      );
    }

    // 3. Document with active URI (Non-image / PDF file attachment)
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
            <Text style={styles.attachmentOpenBtnText}>↗ Open Original File</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 4. Document uploaded metadata without accessible local preview
    return (
      <View style={styles.noPreviewCard}>
        <View style={styles.noPreviewIconBox}>
          <Text style={styles.noPreviewEmoji}>📄</Text>
        </View>
        <Text style={styles.noPreviewTitle}>{document.title}</Text>
        <Text style={styles.noPreviewFileName}>{document.fileName}</Text>

        <View style={styles.noPreviewDetailsTable}>
          <View style={styles.noPreviewRow}>
            <Text style={styles.noPreviewLabel}>File Name:</Text>
            <Text style={styles.noPreviewVal} numberOfLines={1}>
              {document.fileName}
            </Text>
          </View>
          <View style={styles.noPreviewRow}>
            <Text style={styles.noPreviewLabel}>Recorded Size:</Text>
            <Text style={styles.noPreviewVal}>{document.fileSize}</Text>
          </View>
          <View style={styles.noPreviewRow}>
            <Text style={styles.noPreviewLabel}>Uploaded On:</Text>
            <Text style={styles.noPreviewVal}>{document.uploadDate}</Text>
          </View>
          <View style={styles.noPreviewRow}>
            <Text style={styles.noPreviewLabel}>Applicant:</Text>
            <Text style={styles.noPreviewVal}>{applicantName}</Text>
          </View>
        </View>

        <Text style={styles.noPreviewNotice}>
          This is an official document attached to applicant {applicantName}'s file.
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
          <TouchableWithoutFeedback>
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
                    <Text style={styles.titleText} numberOfLines={1}>
                      {document.title}
                    </Text>
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

              {/* Toolbar */}
              <View style={styles.toolbar}>
                <View style={styles.fileMetaTag}>
                  <Text style={styles.fileMetaTagText} numberOfLines={1}>
                    ✓ {document.fileName} • {document.fileSize}
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

              {/* Document View Canvas */}
              <ScrollView
                style={styles.canvasScroll}
                contentContainerStyle={styles.canvasContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.previewCanvasWrap}>
                  {renderDocumentContent()}
                </View>

                {/* Authentic Document Information Box */}
                <View style={styles.documentMetaBox}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Attachment File:</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>
                      {document.fileName}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Verification Status:</Text>
                    <View
                      style={[
                        styles.verifiedInlineBadge,
                        document.verified === false && styles.verifiedInlineBadgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.verifiedInlineBadgeText,
                          document.verified === false && styles.verifiedInlineBadgeTextPending,
                        ]}
                      >
                        {document.verified !== undefined
                          ? document.verified
                            ? '✓ Verified Document'
                            : 'Pending Verification'
                          : 'Uploaded Document Attachment'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Upload Date:</Text>
                    <Text style={styles.metaValue}>{document.uploadDate || 'Recently'}</Text>
                  </View>
                </View>
              </ScrollView>

              {/* Footer Actions */}
              <View style={styles.footerActions}>
                <TouchableOpacity
                  style={styles.printActionBtn}
                  onPress={handleOpenDirect}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Open Full Document"
                >
                  <Text style={styles.printActionText}>↗ Full Screen / Open</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.downloadActionBtn}
                  onPress={handleDownload}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Download Document"
                >
                  <Text style={styles.downloadActionText}>📥 Download</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeActionBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss document preview"
                >
                  <Text style={styles.closeActionText}>Close Preview</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  docBadgeIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docBadgeEmoji: {
    fontSize: 18,
  },
  headerTitleWrap: {
    flex: 1,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeIcon: {
    fontSize: 13,
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
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    flexShrink: 1,
  },
  fileMetaTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
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
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  zoomLevelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2860',
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
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    overflow: 'hidden',
  },
  directImage: {
    width: '100%',
    height: 340,
  },
  pdfPreviewContainer: {
    width: '100%',
  },
  pdfActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  pdfBannerSub: {
    fontSize: 10,
    color: '#64748B',
  },
  pdfBannerOpenBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    borderColor: '#E2E8F0',
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
    color: '#0F2860',
    marginBottom: 4,
  },
  attachmentFileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  attachmentMeta: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 16,
  },
  attachmentOpenBtn: {
    backgroundColor: '#0F2860',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
  },
  attachmentOpenBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noPreviewCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  noPreviewIconBox: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  noPreviewEmoji: {
    fontSize: 26,
  },
  noPreviewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 3,
  },
  noPreviewFileName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 14,
  },
  noPreviewDetailsTable: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 10,
  },
  noPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  noPreviewLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  noPreviewVal: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '700',
    maxWidth: '65%',
  },
  noPreviewNotice: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  documentMetaBox: {
    width: '100%',
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: 11,
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
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedInlineBadgePending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  verifiedInlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  verifiedInlineBadgeTextPending: {
    color: '#B45309',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  printActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  printActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
  },
  downloadActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#EEF3FC',
  },
  downloadActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  closeActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#0F2860',
  },
  closeActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
