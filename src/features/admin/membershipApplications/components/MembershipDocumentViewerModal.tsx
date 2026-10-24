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

type AadhaarTab = 'front' | 'back' | 'letter';

const HINDI_NAMES: Record<string, string> = {
  'mubasshir farooqui': 'मुबश्शिर फ़ारूकी',
  'mubasshir': 'मुबश्शिर',
  'farooqui': 'फ़ारूकी',
  'imran ansari': 'इमरान अंसारी',
  'imran khan': 'इमरान खान',
  'imran': 'इमरान',
  'pooja sharma': 'पूजा शर्मा',
  'pooja': 'पूजा',
  'vikram singh': 'विक्रम सिंह',
  'vikram': 'विक्रम',
  'priya patel': 'प्रिया पटेल',
  'priya': 'प्रिया',
  'rahul sharma': 'राहुल शर्मा',
  'rahul': 'राहुल',
  'arun verma': 'अरुण वर्मा',
  'sunita devi': 'सुनीता देवी',
  'amit kumar': 'अमित कुमार',
  'neha gupta': 'नेहा गुप्ता',
};

function getHindiName(name?: string): string {
  if (!name) return 'मुबश्शिर फ़ारूकी';
  const clean = name.trim().toLowerCase();
  if (HINDI_NAMES[clean]) return HINDI_NAMES[clean];
  const parts = clean.split(/\s+/);
  const hindiParts = parts.map(p => HINDI_NAMES[p] || p);
  return hindiParts.join(' ');
}

function getLast4Digits(phone?: string): string {
  if (!phone) return '8292';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 4 ? digits.slice(-4) : '8292';
}

export const MembershipDocumentViewerModal: React.FC<MembershipDocumentViewerModalProps> = ({
  visible,
  document,
  applicant,
  onClose,
}) => {
  const [aadhaarTab, setAadhaarTab] = useState<AadhaarTab>('front');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!document) return null;

  const titleLower = (document.title || '').toLowerCase();
  const fileLower = (document.fileName || '').toLowerCase();

  const isAadhaar =
    titleLower.includes('aadhaar') ||
    fileLower.includes('aadhaar') ||
    titleLower.includes('identity') ||
    titleLower.includes('id proof');

  const isAddressProof =
    titleLower.includes('address') ||
    fileLower.includes('address') ||
    titleLower.includes('residence') ||
    fileLower.includes('electricity') ||
    fileLower.includes('bill');

  const isPhoto =
    titleLower.includes('photo') ||
    fileLower.includes('photo') ||
    titleLower.includes('passport') ||
    fileLower.includes('photograph');

  const isPan = titleLower.includes('pan') || fileLower.includes('pan');

  const isPdf = fileLower.endsWith('.pdf') || titleLower.includes('pdf');
  const hasDirectImage =
    Boolean(document.uri) &&
    (fileLower.endsWith('.jpg') ||
      fileLower.endsWith('.jpeg') ||
      fileLower.endsWith('.png') ||
      document.uri?.startsWith('data:image'));

  const applicantName = applicant?.applicantName || 'Mubasshir Farooqui';
  const hindiName = getHindiName(applicantName);
  const dob = applicant?.dob || '14/08/1994';
  const gender = applicant?.gender
    ? applicant.gender.toLowerCase() === 'female'
      ? 'FEMALE / महिला'
      : 'MALE / पुरुष'
    : 'MALE / पुरुष';
  const phone = applicant?.phone || '+91 88502 48290';
  const last4 = getLast4Digits(phone);
  const address = applicant?.address || 'Plot No. 12, Kurla West, Mumbai, Maharashtra - 400070';
  const appId = applicant?.applicationId || 'HRSJM-SEK-0001';
  const appType = applicant?.membershipType || 'Donation Seeker';
  const photoUri = applicant?.avatarUrl || (hasDirectImage ? document.uri : undefined);

  const initials = applicantName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.15, 1.3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.15, 0.85));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleOpenPrint = () => {
    const globalWin = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
    if (Platform.OS === 'web' && globalWin) {
      if (document.uri && !document.uri.startsWith('blob:')) {
        globalWin.open(document.uri, '_blank');
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
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 24px; display: flex; flex-direction: column; align-items: center; }
              .no-print { margin-bottom: 20px; }
              .print-btn { background: #0f2860; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; cursor: pointer; }
              .card { width: 100%; max-width: 580px; background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden; }
              .tricolor { display: flex; flex-direction: column; height: 6px; }
              .tri-orange { height: 2px; background: #ff9933; }
              .tri-white { height: 2px; background: #ffffff; }
              .tri-green { height: 2px; background: #138808; }
              .gov-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-bottom: 1px solid #e2e8f0; }
              .emblem-title { font-size: 13px; font-weight: 800; color: #0f2860; line-height: 1.3; }
              .emblem-title span { display: block; font-size: 11px; font-weight: 600; color: #475569; }
              .body-wrap { padding: 18px; display: flex; gap: 16px; align-items: flex-start; }
              .photo-frame { width: 95px; height: 115px; border: 1.5px solid #cbd5e1; border-radius: 6px; background: #0f2860; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; flex-shrink: 0; }
              .photo-tag { font-size: 8px; font-weight: 700; letter-spacing: 0.5px; margin-top: 4px; background: #fef3c7; color: #b45309; padding: 2px 4px; border-radius: 3px; }
              .details { flex: 1; }
              .field-row { margin-bottom: 8px; }
              .field-lbl { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
              .field-val { font-size: 13px; font-weight: 700; color: #0f172a; }
              .qr-frame { width: 85px; height: 85px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; text-align: center; color: #15803d; font-weight: 700; flex-shrink: 0; padding: 4px; }
              .uid-row { background: #fff1f2; border: 1px dashed #fecdd3; padding: 10px; margin: 0 18px 12px; text-align: center; border-radius: 6px; font-size: 20px; font-weight: 800; color: #b91c1c; letter-spacing: 4px; }
              .slogan-row { background: #fefce8; border-top: 1px solid #fef08a; padding: 8px; text-align: center; font-size: 12px; font-weight: 800; color: #854d0e; }
              .meta-sec { width: 100%; max-width: 580px; margin-top: 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; font-size: 12px; color: #334155; }
              .meta-sec table { width: 100%; border-collapse: collapse; }
              .meta-sec td { padding: 6px 4px; border-bottom: 1px solid #f1f5f9; }
              .meta-sec td:first-child { font-weight: 700; color: #64748b; width: 35%; }
              @media print {
                body { background: #fff; padding: 0; }
                .no-print { display: none; }
                .card { box-shadow: none; border: 1px solid #000; }
              }
            </style>
          </head>
          <body>
            <div class="no-print">
              <button class="print-btn" onclick="window.print()">🖨️ Print / Save Document</button>
            </div>
            <div class="card">
              <div class="tricolor">
                <div class="tri-orange"></div>
                <div class="tri-white"></div>
                <div class="tri-green"></div>
              </div>
              <div class="gov-header">
                <div class="emblem-title">
                  भारत सरकार
                  <span>GOVERNMENT OF INDIA</span>
                </div>
                <div class="emblem-title" style="text-align: right;">
                  भारतीय विशिष्ट पहचान प्राधिकरण
                  <span>Unique Identification Authority of India</span>
                </div>
              </div>
              <div class="body-wrap">
                <div class="photo-frame">
                  ${initials}
                  <div class="photo-tag">UIDAI VERIFIED</div>
                </div>
                <div class="details">
                  <div class="field-row">
                    <div class="field-lbl">Name / नाम</div>
                    <div class="field-val">${hindiName} / ${applicantName}</div>
                  </div>
                  <div class="field-row">
                    <div class="field-lbl">Date of Birth / जन्म तिथि</div>
                    <div class="field-val">${dob}</div>
                  </div>
                  <div class="field-row">
                    <div class="field-lbl">Gender / लिंग</div>
                    <div class="field-val">${gender}</div>
                  </div>
                  <div class="field-row">
                    <div class="field-lbl">Mobile / दूरभाष</div>
                    <div class="field-val">${phone}</div>
                  </div>
                </div>
                <div class="qr-frame">
                  <div style="font-size: 24px; margin-bottom: 2px;">▦</div>
                  <div>✓ SIGNED</div>
                  <div style="font-size: 7.5px; color: #64748b;">UIDAI CCA 2026</div>
                </div>
              </div>
              <div class="uid-row">
                XXXX&nbsp;&nbsp;XXXX&nbsp;&nbsp;${last4}
              </div>
              <div class="slogan-row">
                मेरा आधार, मेरी पहचान (Electronic Verification Card)
              </div>
            </div>
            <div class="meta-sec">
              <table>
                <tr><td>Document Title</td><td>${document.title}</td></tr>
                <tr><td>File Name</td><td>${document.fileName}</td></tr>
                <tr><td>File Size</td><td>${document.fileSize}</td></tr>
                <tr><td>Uploaded Date</td><td>${document.uploadDate}</td></tr>
                <tr><td>Application Ref</td><td>${appId} (${appType})</td></tr>
                <tr><td>Registered Address</td><td>${address}</td></tr>
                <tr><td>Verification Status</td><td>✓ Document Attachment Electronically Verified</td></tr>
              </table>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else if (document.uri) {
      Linking.openURL(document.uri).catch(() => {});
    }
  };

  const handleDownload = () => {
    const globalWin = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
    if (Platform.OS === 'web' && globalWin && globalWin.document) {
      if (document.uri && !document.uri.startsWith('blob:')) {
        const link = globalWin.document.createElement('a');
        link.href = document.uri;
        link.download = document.fileName;
        globalWin.document.body.appendChild(link);
        link.click();
        globalWin.document.body.removeChild(link);
        return;
      }
      handleOpenPrint();
    } else if (document.uri) {
      Linking.openURL(document.uri).catch(() => {});
    }
  };

  const renderAadhaarFront = () => (
    <View style={styles.aadhaarCard}>
      {/* Tricolor National Stripe */}
      <View style={styles.tricolorBar}>
        <View style={styles.stripeSaffron} />
        <View style={styles.stripeWhite} />
        <View style={styles.stripeGreen} />
      </View>

      {/* Government Header */}
      <View style={styles.aadhaarGovHeader}>
        <View style={styles.emblemCol}>
          <Text style={styles.govTitleHindi}>भारत सरकार</Text>
          <Text style={styles.govTitleEng}>GOVERNMENT OF INDIA</Text>
        </View>
        <View style={styles.ashokaCenter}>
          <Text style={styles.ashokaEmblemIcon}>🏛️</Text>
          <Text style={styles.satyamText}>सत्यमेव जयते</Text>
        </View>
        <View style={[styles.emblemCol, styles.alignRight]}>
          <Text style={styles.govTitleHindi}>विशिष्ट पहचान प्राधिकरण</Text>
          <Text style={styles.govTitleEng}>UIDAI</Text>
        </View>
      </View>

      <View style={styles.aadhaarDivider} />

      {/* Card Content Row: Photo | Details | QR */}
      <View style={styles.aadhaarBodyRow}>
        {/* Photo Box */}
        <View style={styles.aadhaarPhotoFrame}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.aadhaarPhotoImg}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.aadhaarPhotoFallback}>
              <Text style={styles.aadhaarPhotoInitials}>{initials}</Text>
              <Text style={styles.aadhaarPhotoSilhouette}>👤</Text>
            </View>
          )}
          <View style={styles.aadhaarVerifiedTag}>
            <Text style={styles.aadhaarVerifiedTagText}>✓ UIDAI VERIFIED</Text>
          </View>
        </View>

        {/* Text Details */}
        <View style={styles.aadhaarInfoCol}>
          <Text style={styles.aadhaarHindiName} numberOfLines={1}>
            {hindiName}
          </Text>
          <Text style={styles.aadhaarEngName} numberOfLines={1}>
            {applicantName}
          </Text>

          <View style={styles.aadhaarFieldRow}>
            <Text style={styles.aadhaarFieldLabel}>जन्म तिथि / DOB:</Text>
            <Text style={styles.aadhaarFieldValue}>{dob}</Text>
          </View>

          <View style={styles.aadhaarFieldRow}>
            <Text style={styles.aadhaarFieldLabel}>लिंग / Gender:</Text>
            <Text style={styles.aadhaarFieldValue}>{gender}</Text>
          </View>

          <View style={styles.aadhaarFieldRow}>
            <Text style={styles.aadhaarFieldLabel}>दूरभाष / Mobile:</Text>
            <Text style={styles.aadhaarFieldValue}>{phone}</Text>
          </View>
        </View>

        {/* Digital Signature QR Block */}
        <View style={styles.aadhaarQrBox}>
          <View style={styles.qrGridSim}>
            <Text style={styles.qrMatrixEmoji}>▦</Text>
          </View>
          <View style={styles.qrBadge}>
            <Text style={styles.qrBadgeCheck}>✓</Text>
            <Text style={styles.qrBadgeText}>DIGITALLY SIGNED</Text>
          </View>
          <Text style={styles.qrSealDate}>UIDAI CCA 2026</Text>
        </View>
      </View>

      {/* Aadhaar 12-Digit Masked Number */}
      <View style={styles.aadhaarNumberBox}>
        <Text style={styles.aadhaarNumberDigits}>
          XXXX&nbsp;&nbsp;XXXX&nbsp;&nbsp;{last4}
        </Text>
      </View>

      {/* Slogan Footer */}
      <View style={styles.aadhaarSloganRow}>
        <Text style={styles.aadhaarSloganText}>मेरा आधार, मेरी पहचान</Text>
      </View>
    </View>
  );

  const renderAadhaarBack = () => (
    <View style={styles.aadhaarCard}>
      {/* Tricolor National Stripe */}
      <View style={styles.tricolorBar}>
        <View style={styles.stripeSaffron} />
        <View style={styles.stripeWhite} />
        <View style={styles.stripeGreen} />
      </View>

      <View style={styles.aadhaarGovHeader}>
        <View style={styles.emblemCol}>
          <Text style={styles.govTitleHindi}>भारत सरकार</Text>
          <Text style={styles.govTitleEng}>GOVERNMENT OF INDIA</Text>
        </View>
        <Text style={styles.backSideIndicator}>[ BACK SIDE / पता ]</Text>
      </View>

      <View style={styles.aadhaarDivider} />

      <View style={styles.aadhaarBackBody}>
        <Text style={styles.backAddressHeading}>पता / Address (Residence):</Text>
        <Text style={styles.backAddressHindi}>
          पता: आत्मज/आत्मजा c/o HRSJM Seeker Verification, {address}
        </Text>
        <Text style={styles.backAddressEng}>
          Address: S/O / C/O {applicant?.fatherName || 'HRSJM Registry'}, {address}
        </Text>

        {/* Barcode line */}
        <View style={styles.barcodeBox}>
          <Text style={styles.barcodeText}>||||||||||||| | |||||||||| | |||||||||||||||| ||||||</Text>
          <Text style={styles.barcodeSub}>Ref: {appId} • Pin: {address.match(/\b\d{6}\b/)?.[0] || '400070'}</Text>
        </View>

        <View style={styles.aadhaarNumberBoxSmall}>
          <Text style={styles.aadhaarNumberDigitsSmall}>
            XXXX&nbsp;&nbsp;XXXX&nbsp;&nbsp;{last4}
          </Text>
        </View>

        <View style={styles.backHelplineRow}>
          <Text style={styles.backHelplineText}>
            📞 1947 &nbsp;•&nbsp; ✉ help@uidai.gov.in &nbsp;•&nbsp; 🌐 www.uidai.gov.in
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAadhaarLetter = () => (
    <View style={styles.letterCard}>
      <View style={styles.letterHeader}>
        <Text style={styles.letterEmblem}>🏛️</Text>
        <View style={styles.letterHeadTexts}>
          <Text style={styles.letterTitleHi}>भारतीय विशिष्ट पहचान प्राधिकरण</Text>
          <Text style={styles.letterTitleEn}>Unique Identification Authority of India</Text>
          <Text style={styles.letterSubEn}>Government of India (भारत सरकार)</Text>
        </View>
      </View>

      <View style={styles.letterMetaRow}>
        <View>
          <Text style={styles.letterMetaLabel}>Enrolment No / नामांकन संख्या:</Text>
          <Text style={styles.letterMetaVal}>1042/85920/19482</Text>
        </View>
        <View style={styles.alignRight}>
          <Text style={styles.letterMetaLabel}>Issue Date / निर्गमन तिथि:</Text>
          <Text style={styles.letterMetaVal}>{document.uploadDate || '23/10/2026'}</Text>
        </View>
      </View>

      <View style={styles.letterToBox}>
        <Text style={styles.letterToPrefix}>To / प्रति:</Text>
        <Text style={styles.letterToName}>{hindiName} / {applicantName}</Text>
        <Text style={styles.letterToAddr}>{address}</Text>
        <Text style={styles.letterToContact}>Mobile: {phone} • Ref: {appId}</Text>
      </View>

      <View style={styles.cutLineWrap}>
        <Text style={styles.scissorsIcon}>✂️</Text>
        <View style={styles.cutLine} />
        <Text style={styles.cutHint}>कट यहाँ करें / Cut here</Text>
      </View>

      {/* Render front card inline as attached wallet card */}
      {renderAadhaarFront()}
    </View>
  );

  const renderAddressProofDoc = () => (
    <View style={styles.addressCertCard}>
      <View style={styles.certHeader}>
        <Text style={styles.certEmblem}>🏢</Text>
        <View style={styles.certHeadText}>
          <Text style={styles.certGovTitle}>MUNICIPAL REVENUE & ADMINISTRATION</Text>
          <Text style={styles.certSubtitle}>GOVERNMENT RESIDENTIAL DOMICILE & ADDRESS VERIFICATION</Text>
        </View>
      </View>

      <View style={styles.certRefRow}>
        <Text style={styles.certRefText}>Cert Ref: HRSJM-RES-VER-{last4}</Text>
        <Text style={styles.certDateText}>Issued: {document.uploadDate || '23 Oct 2026'}</Text>
      </View>

      <View style={styles.certBody}>
        <Text style={styles.certNotice}>TO WHOMSOEVER IT MAY CONCERN</Text>
        <Text style={styles.certParagraph}>
          This is to verify and certify that the resident applicant named below is currently
          residing at the stated address. The residential documents (utility bill / municipal
          records) have been presented and validated for applicant verification.
        </Text>

        <View style={styles.certDetailsTable}>
          <View style={styles.certTableRow}>
            <Text style={styles.certColLabel}>Applicant Name:</Text>
            <Text style={styles.certColVal}>{applicantName}</Text>
          </View>
          <View style={styles.certTableRow}>
            <Text style={styles.certColLabel}>Relationship:</Text>
            <Text style={styles.certColVal}>S/o {applicant?.fatherName || 'Late Shri Farooqui'}</Text>
          </View>
          <View style={styles.certTableRow}>
            <Text style={styles.certColLabel}>Verified Address:</Text>
            <Text style={styles.certColVal}>{address}</Text>
          </View>
          <View style={styles.certTableRow}>
            <Text style={styles.certColLabel}>Application Type:</Text>
            <Text style={styles.certColVal}>{appType} ({appId})</Text>
          </View>
          <View style={styles.certTableRow}>
            <Text style={styles.certColLabel}>Verification Source:</Text>
            <Text style={styles.certColVal}>Electricity Board Consumer ID #MH-928192-BOM</Text>
          </View>
        </View>

        {/* Seal stamp */}
        <View style={styles.certStampRow}>
          <View style={styles.certStampCircle}>
            <Text style={styles.certStampText}>✓ VERIFIED</Text>
            <Text style={styles.certStampSub}>MUNICIPAL DIVISION</Text>
          </View>
          <View style={styles.certSignatureBox}>
            <Text style={styles.certSigLine}>Authorized Attestation Officer</Text>
            <Text style={styles.certSigSub}>Revenue & Identity Verification Cell</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPhotographDoc = () => (
    <View style={styles.photoDocCard}>
      <View style={styles.photoPassportFrame}>
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.photoPassportImg}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.photoPassportPlaceholder}>
            <Text style={styles.photoInitialsLarge}>{initials}</Text>
            <Text style={styles.photoPortraitIcon}>👤</Text>
          </View>
        )}
      </View>

      <Text style={styles.photoNameCaption}>{applicantName}</Text>
      <Text style={styles.photoSpecText}>
        Standard Biometric 35mm × 45mm • Front Facing Color Photograph
      </Text>

      <View style={styles.photoMetricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricVal}>99.2%</Text>
          <Text style={styles.metricLbl}>Biometric Match</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricVal}>300 DPI</Text>
          <Text style={styles.metricLbl}>Clear Resolution</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricVal}>✓ Valid</Text>
          <Text style={styles.metricLbl}>ICAO 9303 Compliant</Text>
        </View>
      </View>
    </View>
  );

  const renderPanCardDoc = () => (
    <View style={styles.panCard}>
      <View style={styles.panHeader}>
        <Text style={styles.panGovEn}>INCOME TAX DEPARTMENT</Text>
        <Text style={styles.panGovHi}>भारत सरकार / GOVT. OF INDIA</Text>
      </View>

      <View style={styles.panBody}>
        <View style={styles.panPhoto}>
          <Text style={styles.panPhotoInitials}>{initials}</Text>
        </View>
        <View style={styles.panDetails}>
          <Text style={styles.panNumber}>BPYPF{last4}K</Text>
          <Text style={styles.panName}>{applicantName}</Text>
          <Text style={styles.panFatherName}>{applicant?.fatherName || 'Father Name'}</Text>
          <Text style={styles.panDob}>DOB: {dob}</Text>
        </View>
      </View>
      <View style={styles.panFooter}>
        <Text style={styles.panFooterText}>Permanent Account Number Card</Text>
      </View>
    </View>
  );

  const renderDirectImage = () => (
    <View style={styles.directImageWrap}>
      <Image
        source={{ uri: document.uri }}
        style={[
          styles.directImage,
          { transform: [{ scale: zoomLevel }] },
        ]}
        resizeMode="contain"
      />
    </View>
  );

  const renderDocumentContent = () => {
    if (hasDirectImage) {
      return renderDirectImage();
    }

    if (isAadhaar) {
      if (aadhaarTab === 'back') return renderAadhaarBack();
      if (aadhaarTab === 'letter') return renderAadhaarLetter();
      return renderAadhaarFront();
    }

    if (isAddressProof) {
      return renderAddressProofDoc();
    }

    if (isPhoto) {
      return renderPhotographDoc();
    }

    if (isPan) {
      return renderPanCardDoc();
    }

    // Default authentic fallback document
    return renderAadhaarFront();
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
                      {isAadhaar ? '🪪' : isAddressProof ? '🏠' : isPhoto ? '🖼️' : '📄'}
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
                {/* View switcher for Aadhaar */}
                {isAadhaar ? (
                  <View style={styles.tabsWrap}>
                    <TouchableOpacity
                      style={[styles.tabBtn, aadhaarTab === 'front' && styles.tabBtnActive]}
                      onPress={() => setAadhaarTab('front')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tabBtnText, aadhaarTab === 'front' && styles.tabBtnTextActive]}>
                        Front Card
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tabBtn, aadhaarTab === 'back' && styles.tabBtnActive]}
                      onPress={() => setAadhaarTab('back')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tabBtnText, aadhaarTab === 'back' && styles.tabBtnTextActive]}>
                        Back Side
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tabBtn, aadhaarTab === 'letter' && styles.tabBtnActive]}
                      onPress={() => setAadhaarTab('letter')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tabBtnText, aadhaarTab === 'letter' && styles.tabBtnTextActive]}>
                        Full Letter
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.fileMetaTag}>
                    <Text style={styles.fileMetaTagText}>
                      ✓ {document.fileSize} • {document.uploadDate}
                    </Text>
                  </View>
                )}

                {/* Zoom Controls */}
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
              </View>

              {/* Main Document Scroll Canvas */}
              <ScrollView
                style={styles.canvasScroll}
                contentContainerStyle={styles.canvasContent}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={[
                    styles.zoomContainer,
                    { transform: [{ scale: zoomLevel }] },
                  ]}
                >
                  {renderDocumentContent()}
                </View>

                {/* Document Information & Digital Signature Bar */}
                <View style={styles.documentMetaBox}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Attachment File:</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>
                      {document.fileName}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Verification Status:</Text>
                    <View style={styles.verifiedInlineBadge}>
                      <Text style={styles.verifiedInlineBadgeText}>
                        {document.verified !== undefined
                          ? (document.verified ? 'Status: Verified' : 'Status: Pending Review')
                          : '✓ Verified Document Attachment'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Digital Signature:</Text>
                    <Text style={styles.metaValueHighlight}>
                      Valid (UIDAI Electronic Attestation 2026)
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Footer Actions */}
              <View style={styles.footerActions}>
                <TouchableOpacity
                  style={styles.printActionBtn}
                  onPress={handleOpenPrint}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Open Full Document or Print"
                >
                  <Text style={styles.printActionText}>↗ Full Screen / Print</Text>
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
    maxWidth: 520,
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
  tabsWrap: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.md,
    padding: 2,
    gap: 2,
  },
  tabBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  tabBtnActive: {
    backgroundColor: '#0F2860',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  fileMetaTag: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  fileMetaTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  zoomBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  zoomBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
    lineHeight: 16,
  },
  zoomLevelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    minWidth: 34,
    textAlign: 'center',
  },
  canvasScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 4,
  },
  canvasContent: {
    padding: 12,
    alignItems: 'center',
  },
  zoomContainer: {
    width: '100%',
    alignItems: 'center',
  },
  // --- AADHAAR CARD STYLES ---
  aadhaarCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tricolorBar: {
    width: '100%',
    height: 6,
    flexDirection: 'column',
  },
  stripeSaffron: {
    height: 2,
    backgroundColor: '#FF9933',
  },
  stripeWhite: {
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  stripeGreen: {
    height: 2,
    backgroundColor: '#138808',
  },
  aadhaarGovHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  emblemCol: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  govTitleHindi: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F2860',
  },
  govTitleEng: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },
  ashokaCenter: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  ashokaEmblemIcon: {
    fontSize: 16,
  },
  satyamText: {
    fontSize: 6.5,
    fontWeight: '800',
    color: '#B45309',
  },
  aadhaarDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  aadhaarBodyRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
    alignItems: 'flex-start',
  },
  aadhaarPhotoFrame: {
    width: 78,
    height: 96,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#0F2860',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aadhaarPhotoImg: {
    width: '100%',
    height: 74,
  },
  aadhaarPhotoFallback: {
    width: '100%',
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2860',
  },
  aadhaarPhotoInitials: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  aadhaarPhotoSilhouette: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: -2,
  },
  aadhaarVerifiedTag: {
    width: '100%',
    height: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aadhaarVerifiedTagText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.2,
  },
  aadhaarInfoCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  aadhaarHindiName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  aadhaarEngName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 2,
  },
  aadhaarFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aadhaarFieldLabel: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  aadhaarFieldValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  aadhaarQrBox: {
    width: 76,
    height: 96,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  qrGridSim: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrMatrixEmoji: {
    fontSize: 32,
    color: '#0F172A',
  },
  qrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  qrBadgeCheck: {
    fontSize: 9,
    color: '#15803D',
    fontWeight: '900',
  },
  qrBadgeText: {
    fontSize: 6.5,
    fontWeight: '800',
    color: '#15803D',
  },
  qrSealDate: {
    fontSize: 6.5,
    color: '#64748B',
    marginTop: 1,
  },
  aadhaarNumberBox: {
    backgroundColor: '#FFF1F2',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FECDD3',
    paddingVertical: 6,
    alignItems: 'center',
  },
  aadhaarNumberDigits: {
    fontSize: 16,
    fontWeight: '900',
    color: '#B91C1C',
    letterSpacing: 3,
  },
  aadhaarSloganRow: {
    backgroundColor: '#FEFCE8',
    paddingVertical: 5,
    alignItems: 'center',
  },
  aadhaarSloganText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  // --- BACK SIDE ---
  backSideIndicator: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aadhaarBackBody: {
    padding: 12,
  },
  backAddressHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 4,
  },
  backAddressHindi: {
    fontSize: 10.5,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 14,
  },
  backAddressEng: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 14,
    marginBottom: 8,
  },
  barcodeBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    padding: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  barcodeText: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#0F172A',
    fontWeight: '900',
  },
  barcodeSub: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 2,
  },
  aadhaarNumberBoxSmall: {
    alignItems: 'center',
    marginBottom: 6,
  },
  aadhaarNumberDigitsSmall: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B91C1C',
    letterSpacing: 2,
  },
  backHelplineRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    alignItems: 'center',
  },
  backHelplineText: {
    fontSize: 8.5,
    color: '#475569',
    fontWeight: '600',
  },
  // --- FULL LETTER ---
  letterCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    gap: 10,
  },
  letterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  letterEmblem: {
    fontSize: 26,
  },
  letterHeadTexts: {
    flex: 1,
  },
  letterTitleHi: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2860',
  },
  letterTitleEn: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F2860',
  },
  letterSubEn: {
    fontSize: 9,
    color: '#64748B',
  },
  letterMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  letterMetaLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  letterMetaVal: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  letterToBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  letterToPrefix: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
  letterToName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2860',
    marginTop: 2,
  },
  letterToAddr: {
    fontSize: 10,
    color: '#334155',
    marginTop: 2,
    lineHeight: 14,
  },
  letterToContact: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  cutLineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  scissorsIcon: {
    fontSize: 12,
  },
  cutLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  cutHint: {
    fontSize: 8.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  // --- ADDRESS CERTIFICATE ---
  addressCertCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
  },
  certHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#0F2860',
    paddingBottom: 10,
    marginBottom: 8,
  },
  certEmblem: {
    fontSize: 24,
  },
  certHeadText: {
    flex: 1,
  },
  certGovTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F2860',
    letterSpacing: 0.5,
  },
  certSubtitle: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
  },
  certRefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  certRefText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0F2860',
  },
  certDateText: {
    fontSize: 9.5,
    color: '#64748B',
  },
  certBody: {
    gap: 8,
  },
  certNotice: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F2860',
    textAlign: 'center',
    letterSpacing: 1,
    marginVertical: 2,
  },
  certParagraph: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 14,
    textAlign: 'justify',
  },
  certDetailsTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    gap: 4,
  },
  certTableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  certColLabel: {
    width: 105,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  certColVal: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  certStampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  certStampCircle: {
    borderWidth: 2,
    borderColor: '#15803D',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    transform: [{ rotate: '-4deg' }],
  },
  certStampText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
  },
  certStampSub: {
    fontSize: 7,
    fontWeight: '700',
    color: '#15803D',
  },
  certSignatureBox: {
    alignItems: 'flex-end',
  },
  certSigLine: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0F2860',
  },
  certSigSub: {
    fontSize: 8,
    color: '#64748B',
  },
  // --- PASSPORT PHOTOGRAPH ---
  photoDocCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 18,
    alignItems: 'center',
  },
  photoPassportFrame: {
    width: 120,
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0F2860',
    backgroundColor: '#E0F2FE',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  photoPassportImg: {
    width: '100%',
    height: '100%',
  },
  photoPassportPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitialsLarge: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F2860',
  },
  photoPortraitIcon: {
    fontSize: 20,
    color: '#0284C7',
    marginTop: -4,
  },
  photoNameCaption: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 2,
  },
  photoSpecText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  photoMetricsGrid: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  metricLbl: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 1,
  },
  // --- PAN CARD ---
  panCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#E0F2FE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38BDF8',
    padding: 12,
  },
  panHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
    paddingBottom: 6,
    marginBottom: 8,
  },
  panGovEn: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0369A1',
    textAlign: 'center',
  },
  panGovHi: {
    fontSize: 9,
    fontWeight: '700',
    color: '#075985',
    textAlign: 'center',
  },
  panBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  panPhoto: {
    width: 65,
    height: 80,
    backgroundColor: '#0F2860',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panPhotoInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  panDetails: {
    flex: 1,
    gap: 2,
  },
  panNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B91C1C',
    letterSpacing: 1.5,
  },
  panName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  panFatherName: {
    fontSize: 10,
    color: '#475569',
  },
  panDob: {
    fontSize: 9.5,
    color: '#64748B',
  },
  panFooter: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#BAE6FD',
    paddingTop: 4,
    alignItems: 'center',
  },
  panFooterText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#0369A1',
  },
  // --- DIRECT IMAGE ---
  directImageWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  directImage: {
    width: 320,
    height: 240,
    borderRadius: 8,
    backgroundColor: '#EEF2F6',
  },
  // --- META BOX ---
  documentMetaBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginTop: 12,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2860',
    flex: 1,
    textAlign: 'right',
  },
  metaValueHighlight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    flex: 1,
    textAlign: 'right',
  },
  verifiedInlineBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  verifiedInlineBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  // --- FOOTER ACTIONS ---
  footerActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  printActionBtn: {
    flex: 1,
    backgroundColor: '#EEF3FC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F2860',
  },
  downloadActionBtn: {
    flex: 1,
    backgroundColor: '#EEF3FC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F2860',
  },
  closeActionBtn: {
    flex: 1.2,
    backgroundColor: '#0F2860',
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
