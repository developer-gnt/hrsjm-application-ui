import { MembershipDetailsData } from '../hooks/useMembershipDetailsData';

export interface GeneratedDocumentResult {
  fileName: string;
  url?: string;
  filePath?: string;
  status: 'downloaded' | 'opened' | 'previewed' | 'shared';
}

/**
 * Generates an official HRSJM Certificate of Membership (A4 Landscape PDF).
 */
export const generateMembershipCertificatePdf = async (
  data: MembershipDetailsData
): Promise<any> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4', // 297 x 210 mm
  });

  const W = 297;
  const H = 210;

  // 1. Background Tint
  doc.setFillColor(254, 252, 246); // warm certificate ivory
  doc.rect(0, 0, W, H, 'F');

  // 2. Gold & Navy Double Border
  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(2.5);
  doc.rect(10, 10, W - 20, H - 20);

  doc.setDrawColor(15, 40, 96); // Deep Navy
  doc.setLineWidth(0.8);
  doc.rect(13, 13, W - 26, H - 26);

  // Corner Accents (Gold corner squares)
  doc.setFillColor(212, 175, 55);
  doc.rect(11, 11, 4, 4, 'F');
  doc.rect(W - 15, 11, 4, 4, 'F');
  doc.rect(11, H - 15, 4, 4, 'F');
  doc.rect(W - 15, H - 15, 4, 4, 'F');

  // 3. Header: Mission Crest & Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 40, 96);
  doc.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', W / 2, 32, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // Amber
  doc.text('MANAV ADHIKAR & SAMAJIK NYAY • REG. UNDER ACT XXI OF 1860', W / 2, 40, {
    align: 'center',
  });

  // Thin Gold Line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.75);
  doc.line(60, 45, W - 60, 45);

  // 4. Certificate Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(15, 40, 96);
  doc.text('CERTIFICATE OF MEMBERSHIP', W / 2, 60, { align: 'center' });

  // 5. Body Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(100, 116, 139);
  doc.text('This is to proudly certify that', W / 2, 75, { align: 'center' });

  // Member Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(15, 40, 96);
  doc.text(data.fullName || 'Registered Member', W / 2, 92, { align: 'center' });

  // Underline beneath name
  const nameWidth = Math.max(80, (data.fullName?.length || 10) * 8);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.2);
  doc.line((W - nameWidth) / 2, 96, (W + nameWidth) / 2, 96);

  // Recognition Statement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `is officially enrolled as an authorized ${data.membershipType} of the Mission,`,
    W / 2,
    108,
    { align: 'center' }
  );
  doc.text(
    'pledged to advocate for human rights, protect social justice, and support community empowerment.',
    W / 2,
    116,
    { align: 'center' }
  );

  // 6. Member Details Badge Box
  const boxW = 190;
  const boxH = 26;
  const boxX = (W - boxW) / 2;
  const boxY = 126;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, 'FD');

  doc.setFontSize(10.5);
  doc.setTextColor(100, 116, 139);
  doc.text('MEMBER ID:', boxX + 10, boxY + 11);
  doc.text('JOINED ON:', boxX + 70, boxY + 11);
  doc.text('VALID TILL:', boxX + 130, boxY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 40, 96);
  doc.text(data.memberId || 'HRSJM202600123', boxX + 10, boxY + 19);
  doc.text(data.joinDate || '15 Sep 2026', boxX + 70, boxY + 19);
  doc.text(data.validTill || '15 Sep 2027', boxX + 130, boxY + 19);

  // 7. Signatures & Official Seal
  const sigY = 175;

  // Left Signatory
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(35, sigY, 95, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 40, 96);
  doc.text('National President', 65, sigY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('HRSJM National Council', 65, sigY + 11, { align: 'center' });

  // Center Official Seal Badge
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.5);
  doc.circle(W / 2, sigY - 2, 13, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text('HRSJM', W / 2, sigY - 4, { align: 'center' });
  doc.text('OFFICIAL SEAL', W / 2, sigY + 1, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('★ VERIFIED ★', W / 2, sigY + 6, { align: 'center' });

  // Right Signatory
  doc.line(W - 95, sigY, W - 35, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 40, 96);
  doc.text('General Secretary', W - 65, sigY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Human Rights Mission', W - 65, sigY + 11, { align: 'center' });

  return doc;
};

/**
 * Generates official Printable Membership Card PDF (CR80 ID card format: 85.6 x 54 mm).
 */
export const generateMembershipCardPdf = async (
  data: MembershipDetailsData
): Promise<any> => {
  const { jsPDF } = await import('jspdf');
  const W = 85.6;
  const H = 54.0;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [W, H],
  });

  // Base navy background
  doc.setFillColor(15, 40, 96);
  doc.rect(0, 0, W, H, 'F');

  // Top header banner (Gold/Cream)
  doc.setFillColor(255, 248, 230);
  doc.rect(0, 0, W, 14, 'F');

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(0, 14, W, 14);

  // Top text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 40, 96);
  doc.text('HRSJM • HUMAN RIGHTS MISSION', 6, 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(180, 83, 9);
  doc.text('OFFICIAL MEMBER IDENTITY CARD', 6, 10.5);

  // Status Badge
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(W - 20, 3.5, 15, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(21, 128, 61);
  doc.text(data.status || 'Active', W - 12.5, 7.5, { align: 'center' });

  // Photo placeholder box
  doc.setFillColor(30, 58, 138);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.roundedRect(6, 18, 20, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('PHOTO', 16, 31, { align: 'center' });

  // Member Information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(data.fullName || 'Member Name', 30, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(244, 184, 67);
  doc.text(data.membershipType || 'Individual Member', 30, 26.5);

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(203, 213, 225);
  doc.text('Member ID:', 30, 32);
  doc.text('Joined:', 30, 36);
  doc.text('Valid Till:', 30, 40);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(data.memberId || 'HRSJM202600123', 46, 32);
  doc.text(data.joinDate || '15 Sep 2026', 46, 36);
  doc.text(data.validTill || '15 Sep 2027', 46, 40);

  // Bottom Security Line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(148, 163, 184);
  doc.text('Non-transferable • Registered Under Societies Registration Act XXI of 1860', W / 2, 49.5, {
    align: 'center',
  });

  return doc;
};

/**
 * Generates official Membership Guidelines PDF (A4 Portrait).
 */
export const generateMembershipGuidelinesPdf = async (
  data: MembershipDetailsData
): Promise<any> => {
  const { jsPDF } = await import('jspdf');
  const W = 210;
  const H = 297;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // Top Navy Banner
  doc.setFillColor(15, 40, 96);
  doc.rect(0, 0, W, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', W / 2, 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(244, 184, 67);
  doc.text('OFFICIAL MEMBERSHIP GUIDELINES & CODE OF CONDUCT', W / 2, 24, {
    align: 'center',
  });

  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Issued to: ${data.fullName} (${data.memberId}) • Category: ${data.membershipType}`, W / 2, 31, {
    align: 'center',
  });

  // Content Sections
  let y = 48;
  const addSection = (title: string, bullets: string[]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 40, 96);
    doc.text(title, 18, y);
    y += 4;

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.line(18, y, 90, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    bullets.forEach(b => {
      const wrapped = doc.splitTextToSize(`• ${b}`, W - 36);
      doc.text(wrapped, 20, y);
      y += wrapped.length * 5 + 2;
    });

    y += 4;
  };

  addSection('1. Core Mission & Objectives', [
    'Defend basic human rights regardless of race, creed, religion, or economic background.',
    'Promote peace, gender equality, education, and social justice across vulnerable communities.',
    'Operate in accordance with the Constitution of India and Universal Declaration of Human Rights.',
  ]);

  addSection('2. Member Responsibilities & Code of Ethics', [
    'Maintain highest integrity and respect while representing HRSJM in public forums or social initiatives.',
    'Do not use the organization credentials, letterhead, or logo for personal or unlawful benefits.',
    'Participate actively in authorized outreach campaigns, legal awareness drives, and member meetings.',
  ]);

  addSection('3. Rights & Privileges of Members', [
    'Access official certificates, digital identification card, and volunteer recognition documents.',
    'Priority invitation to workshops, regional conventions, and national human rights symposiums.',
    'Direct support channel to NGO council leaders for community grievance interventions.',
  ]);

  addSection('4. Validity, Renewal & Governance', [
    'Membership remains valid for 1 year from the official date of approval.',
    'Renewals can be submitted online within 30 days prior to expiry via the official mobile app.',
    'For queries, contact support@hrsjm.org or call the National Helpdesk at 1800-HRSJM-HELP.',
  ]);

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(18, H - 20, W - 18, H - 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('HRSJM NGO Application • Confidential Official Document', W / 2, H - 14, {
    align: 'center',
  });

  return doc;
};

/**
 * Download & Export options for membership documents
 */
export interface DownloadOptions {
  title?: string;
  memberData?: Partial<MembershipDetailsData> | null;
}

/**
 * Generates an official, standard-compliant filename according to HRSJM specification:
 * - Certificate: HRSJM_Membership_Certificate_[MemberID].pdf
 * - Card: HRSJM_Membership_Card_[MemberID].pdf
 * - Guidelines: HRSJM_Membership_Guidelines.pdf
 */
export const getMembershipDocumentFileName = (
  type: 'certificate' | 'idcard' | 'guidelines',
  memberData?: Partial<MembershipDetailsData> | null
): string => {
  const rawId = memberData?.memberId || 'Member';
  const safeId = String(rawId).trim().replace(/[^a-zA-Z0-9_-]/g, '_');

  if (type === 'certificate') {
    return `HRSJM_Membership_Certificate_${safeId}.pdf`;
  }
  if (type === 'idcard') {
    return `HRSJM_Membership_Card_${safeId}.pdf`;
  }
  return 'HRSJM_Membership_Guidelines.pdf';
};

/**
 * Extracts a base64 string from a jsPDF instance reliably across all environments.
 */
export const extractPdfBase64 = (pdfDoc: any): string => {
  // 1. Try datauristring
  try {
    if (typeof pdfDoc.output === 'function') {
      const dataUri = pdfDoc.output('datauristring');
      if (typeof dataUri === 'string' && dataUri.includes(',')) {
        return dataUri.split(',')[1];
      }
    }
  } catch (e) {
    // fallback
  }

  // 2. Try arraybuffer
  try {
    if (typeof pdfDoc.output === 'function') {
      const arrayBuffer = pdfDoc.output('arraybuffer');
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      if (typeof btoa === 'function') {
        return btoa(binary);
      }
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(binary, 'binary').toString('base64');
      }
    }
  } catch (e) {
    // fallback
  }

  throw new Error('Unable to extract PDF content from generated document.');
};

let cachedRNFS: any = null;
let cachedNativeShare: any = null;

export const getNativeModules = async () => {
  if (cachedRNFS && cachedNativeShare) {
    return { RNFS: cachedRNFS, NativeShare: cachedNativeShare };
  }
  try {
    const [blobMod, shareMod] = await Promise.all([
      import('react-native-blob-util').catch(() => null),
      import('react-native-share').catch(() => null),
    ]);
    if (blobMod) cachedRNFS = blobMod.default || blobMod;
    if (shareMod) cachedNativeShare = shareMod.default || shareMod;
  } catch {
    // ignore
  }
  return { RNFS: cachedRNFS, NativeShare: cachedNativeShare };
};

const checkAndRequestStoragePermission = async (): Promise<boolean> => {
  const { Platform } = await import('react-native');
  if (Platform.OS !== 'android') return true;
  // Modern Android 10+ (API 29+) handles scoped storage without WRITE_EXTERNAL_STORAGE
  if (typeof Platform.Version === 'number' && Platform.Version >= 29) {
    return true;
  }
  try {
    const { PermissionsAndroid } = await import('react-native');
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    if (hasPermission) return true;
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission Required',
        message: 'HRSJM needs storage access to save membership documents to your device.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return true;
  }
};

/**
 * Universal cross-platform document downloader:
 * - Web: executes browser Blob download through HTML anchor element
 * - Android: saves to public Downloads with Scoped Storage / MediaStore / DownloadManager notification
 * - iOS: saves to application DocumentDir and enables Files / Share integration
 */
export const downloadOrOpenPdf = async (
  pdfDoc: any,
  fileName: string,
  options?: DownloadOptions
): Promise<GeneratedDocumentResult> => {
  const { Platform } = await import('react-native');
  const webGlobal: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const isWeb =
    Platform.OS === 'web' ||
    (typeof webGlobal.window !== 'undefined' && typeof webGlobal.document !== 'undefined' && Boolean(webGlobal.document?.createElement));

  // ── 1. Web Implementation (Preserved exactly as-is) ──────────────────
  if (isWeb) {
    const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
    if (!web.URL?.createObjectURL || !web.document) {
      return { fileName, status: 'previewed' };
    }
    const blob = pdfDoc.output('blob');
    const url = web.URL.createObjectURL(blob);
    try {
      const link = web.document.createElement('a');
      if (typeof link.download === 'string') {
        link.href = url;
        link.download = fileName;
        link.rel = 'noopener';
        link.target = '_blank';
        link.style.display = 'none';
        web.document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => {
          try {
            web.URL.revokeObjectURL(url);
          } catch {}
        }, 10000);
        return { fileName, url, status: 'downloaded' };
      } else {
        web.window?.open?.(url, '_blank');
        return { fileName, url, status: 'opened' };
      }
    } catch {
      web.window?.open?.(url, '_blank');
      return { fileName, url, status: 'opened' };
    }
  }

  // ── 2. Native Mobile Implementation (Android & iOS) ──────────────────
  await checkAndRequestStoragePermission();

  const base64 = extractPdfBase64(pdfDoc);
  if (!base64 || base64.length < 100) {
    throw new Error('Generated PDF is empty or corrupted.');
  }

  const { RNFS } = await getNativeModules();
  const dirs = RNFS?.fs?.dirs;

  if (!dirs || !RNFS?.fs?.writeFile) {
    // Graceful fallback if native file module is unavailable
    const { Share } = await import('react-native');
    await Share.share({
      title: options?.title || fileName,
      message: `HRSJM Official Document: ${fileName}`,
    });
    return { fileName, status: 'shared' };
  }

  // Write initially to app Cache / Document directory
  const cacheDir = dirs.CacheDir || dirs.DocumentDir;
  const cachePath = `${cacheDir}/${fileName}`;
  await RNFS.fs.writeFile(cachePath, base64, 'base64');

  // Verify file write integrity
  const fileStat = await RNFS.fs.stat(cachePath).catch(() => null);
  if (!fileStat || Number(fileStat.size) <= 0) {
    throw new Error('Failed to write PDF file to local device storage.');
  }

  let finalSavedPath = cachePath;

  if (Platform.OS === 'android') {
    let savedToPublic = false;

    // Priority A: Scoped Storage MediaStore collection (works across Android 10-15)
    if (RNFS.MediaCollection?.copyToMediaStore) {
      try {
        await RNFS.MediaCollection.copyToMediaStore(
          { name: fileName, parentFolder: '', mimeType: 'application/pdf' },
          'Download',
          cachePath
        );
        savedToPublic = true;
      } catch (err) {
        console.log('copyToMediaStore notice:', err);
      }
    }

    // Priority B: Direct write to public Download directory (/storage/emulated/0/Download)
    const publicDownloadDir = dirs.LegacyDownloadDir || dirs.DownloadDir;
    if (!savedToPublic && publicDownloadDir) {
      try {
        const publicPath = `${publicDownloadDir}/${fileName}`;
        await RNFS.fs.writeFile(publicPath, base64, 'base64');
        finalSavedPath = publicPath;
        savedToPublic = true;
      } catch (err) {
        console.log('Public download directory write notice:', err);
      }
    }

    // Priority C: Register with MediaStore Scanner (so file appears immediately in Files & Downloads apps)
    const pathsToScan = [finalSavedPath, cachePath].filter(Boolean);
    if (RNFS.fs?.scanFile && pathsToScan.length > 0) {
      try {
        await (RNFS.fs.scanFile as any)(
          pathsToScan.map((p: string) => ({ path: p, mime: 'application/pdf' }))
        ).catch(() => undefined);
      } catch {}
    }

    // Priority D: Register with Android Download Manager (status bar notification)
    if (RNFS.android?.addCompleteDownload) {
      try {
        await RNFS.android.addCompleteDownload({
          title: fileName,
          description: options?.title ? `HRSJM ${options.title}` : 'HRSJM Membership Document',
          mime: 'application/pdf',
          path: finalSavedPath,
          showNotification: true,
        });
      } catch (err) {
        console.log('addCompleteDownload notice:', err);
      }
    }
  } else {
    // iOS: Save in DocumentDir
    const docPath = `${dirs.DocumentDir}/${fileName}`;
    await RNFS.fs.writeFile(docPath, base64, 'base64');
    finalSavedPath = docPath;
  }

  return {
    fileName,
    filePath: finalSavedPath,
    status: 'downloaded',
  };
};

/**
 * Opens a downloaded PDF document using the native platform PDF viewer.
 */
export const openPdfDocument = async (filePath: string): Promise<void> => {
  if (!filePath) return;
  const { Platform } = await import('react-native');
  try {
    const { RNFS } = await getNativeModules();
    if (Platform.OS === 'android' && RNFS?.android?.actionViewIntent) {
      await RNFS.android.actionViewIntent(filePath, 'application/pdf');
      return;
    }
  } catch (e) {
    console.log('actionViewIntent notice:', e);
  }

  try {
    const { NativeShare } = await getNativeModules();
    if (NativeShare?.open) {
      await NativeShare.open({
        url: filePath.startsWith('file://') ? filePath : `file://${filePath}`,
        type: 'application/pdf',
      });
      return;
    }
  } catch (e) {
    console.log('NativeShare open notice:', e);
  }

  try {
    const { Linking } = await import('react-native');
    const url = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
    }
  } catch (e) {
    console.log('Linking open notice:', e);
  }
};

/**
 * Shares a downloaded PDF document as a real document attachment through the native OS share sheet.
 */
export const sharePdfDocument = async (filePath: string, title?: string): Promise<void> => {
  if (!filePath) return;
  const fileUrl = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
  try {
    const { NativeShare } = await getNativeModules();
    if (NativeShare?.open) {
      await NativeShare.open({
        url: fileUrl,
        type: 'application/pdf',
        title: title || 'HRSJM Membership Document',
        subject: title || 'HRSJM Membership Document',
        filename: title ? title.replace(/[^a-zA-Z0-9_-]/g, '_') : 'HRSJM_Document',
      });
      return;
    }
  } catch (e) {
    console.log('NativeShare share notice:', e);
  }

  try {
    const { Share } = await import('react-native');
    await Share.share({
      title: title || 'HRSJM Membership Document',
      url: fileUrl,
      message: `HRSJM Membership Document: ${title || ''}`,
    });
  } catch (e) {
    console.log('Core Share notice:', e);
  }
};

/**
 * Displays user-friendly confirmation dialog with instant Open and Share options on mobile.
 */
export const showDownloadSuccessFeedback = async (
  result: GeneratedDocumentResult,
  documentTitle: string
): Promise<void> => {
  const { Platform, Alert } = await import('react-native');
  if (Platform.OS === 'web') {
    return;
  }

  const fileName = result.fileName;

  if (Platform.OS === 'android') {
    Alert.alert(
      'Download Complete',
      `"${fileName}" has been saved to your Downloads folder.`,
      [
        {
          text: 'Open',
          onPress: () => {
            if (result.filePath) openPdfDocument(result.filePath);
          },
        },
        {
          text: 'Share',
          onPress: () => {
            if (result.filePath) sharePdfDocument(result.filePath, documentTitle);
          },
        },
        { text: 'Done', style: 'cancel' },
      ],
      { cancelable: true }
    );
  } else {
    // iOS: Open native share/save-to-files sheet
    if (result.filePath) {
      sharePdfDocument(result.filePath, documentTitle);
    } else {
      Alert.alert('Download Complete', `"${fileName}" is ready on your device.`);
    }
  }
};
