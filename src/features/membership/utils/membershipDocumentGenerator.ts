import { MembershipDetailsData } from '../hooks/useMembershipDetailsData';

export interface GeneratedDocumentResult {
  fileName: string;
  url?: string;
  status: 'downloaded' | 'opened' | 'previewed';
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
 * Executes browser download and opens PDF tab.
 */
export const downloadOrOpenPdf = async (
  pdfDoc: any,
  fileName: string
): Promise<GeneratedDocumentResult> => {
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
    } else {
      web.window?.open?.(url, '_blank');
    }

    return { fileName, url, status: 'downloaded' };
  } catch (err) {
    web.window?.open?.(url, '_blank');
    return { fileName, url, status: 'opened' };
  }
};
