import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { jsPDF } from 'jspdf';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { feedback } from '../../../../core/feedback/FeedbackContext';
import { downloadReportPdf, shareReportPdf } from '../utils/reportPdfDocument';

interface ReportExportActionsProps {
  fileName: string;
  reportTitle: string;
  generatePdf: () => jsPDF;
}

export const ReportExportActions: React.FC<ReportExportActionsProps> = ({
  fileName,
  reportTitle,
  generatePdf,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleDownload = async () => {
    if (downloading || sharing) return;
    setDownloading(true);
    try {
      const pdf = generatePdf();
      const res = await downloadReportPdf(fileName, pdf);
      feedback.success(
        'Report Exported',
        res === 'downloaded'
          ? `PDF successfully saved to your downloads folder (${fileName}).`
          : 'Report PDF opened in your device viewer.',
      );
    } catch (err: any) {
      feedback.error('Export Failed', err?.message || 'Unable to export report PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (downloading || sharing) return;
    setSharing(true);
    try {
      const pdf = generatePdf();
      await shareReportPdf(fileName, reportTitle, pdf);
    } catch (err: any) {
      feedback.error('Share Failed', err?.message || 'Unable to share report PDF.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, styles.downloadBtn]}
        onPress={handleDownload}
        disabled={downloading || sharing}
        activeOpacity={0.8}
      >
        {downloading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.btnIcon}>📥</Text>
            <Text style={styles.downloadBtnText}>Download PDF</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.shareBtn]}
        onPress={handleShare}
        disabled={downloading || sharing}
        activeOpacity={0.8}
      >
        {sharing ? (
          <ActivityIndicator size="small" color={AdminColors.primaryDark} />
        ) : (
          <>
            <Text style={styles.btnIcon}>↗</Text>
            <Text style={styles.shareBtnText}>Share</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  downloadBtn: {
    backgroundColor: AdminColors.primaryDark,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  shareBtnText: {
    color: AdminColors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  btnIcon: {
    fontSize: 14,
  },
});
