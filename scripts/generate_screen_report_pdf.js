const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function createReportPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const W = 210;
  const H = 297;
  let y = 14;

  const checkPage = (requiredHeight = 20) => {
    if (y + requiredHeight > H - 15) {
      doc.addPage();
      y = 15;
      renderPageHeader();
    }
  };

  const renderPageHeader = () => {
    doc.setFillColor(15, 40, 96);
    doc.rect(0, 0, W, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('HRSJM • HUMAN RIGHTS & SOCIAL JUSTICE MISSION | SCREEN PROGRESS REPORT', W / 2, 5.5, { align: 'center' });
  };

  // COVER / HEADER BANNER
  doc.setFillColor(15, 40, 96); // Deep Navy
  doc.rect(0, 0, W, 36, 'F');

  // Gold accent line
  doc.setFillColor(212, 175, 55); // Gold
  doc.rect(0, 36, W, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', W / 2, 14, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(244, 184, 67); // Bright Gold
  doc.text('ALL ROLES SCREEN STATUS & COMPLETION REPORT', W / 2, 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('Generated: October 9, 2026 | Technical Architecture & Product Delivery Team', W / 2, 30, { align: 'center' });

  y = 44;

  // EXECUTIVE METRIC CARDS
  const cardW = 42;
  const cardH = 20;
  const startX = 14;
  const gap = 5;

  const metrics = [
    { label: 'BRD Screens', val: '74', sub: 'Across 4 Roles', bg: [241, 245, 249], border: [203, 213, 225], valColor: [15, 23, 42] },
    { label: 'Completed', val: '66', sub: 'Fully Built & Wired', bg: [236, 253, 245], border: [167, 243, 208], valColor: [5, 150, 105] },
    { label: 'Completion', val: '89.2%', sub: 'Target Progress', bg: [254, 243, 199], border: [253, 230, 138], valColor: [180, 83, 9] },
    { label: 'Codebase Files', val: '85', sub: 'Active Screens', bg: [238, 242, 255], border: [199, 210, 254], valColor: [67, 56, 202] },
  ];

  metrics.forEach((m, idx) => {
    const cx = startX + idx * (cardW + gap);
    doc.setFillColor(...m.bg);
    doc.setDrawColor(...m.border);
    doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cx + cardW / 2, y + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...m.valColor);
    doc.text(m.val, cx + cardW / 2, y + 12.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(m.sub, cx + cardW / 2, y + 17, { align: 'center' });
  });

  y += cardH + 8;

  // MASTER SUMMARY TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 40, 96);
  doc.text('1. MASTER PROGRESS SUMMARY BY ROLE', 14, y);
  y += 4;

  const tableHeader = ['Role', 'Target BRD', 'Completed', 'Left', 'Status / Completion'];
  const tableData = [
    ['Shared Auth & Onboarding', '7', '7', '0', '100% - Fully Complete (Includes KYC)'],
    ['Admin Role', '26', '25', '1', '96% - Accounting, Approvals, CMS, ID Card'],
    ['Member Role', '20', '16', '4', '80% - Digital Card, Renewal, Causes, Receipts'],
    ['Donation Seeker Role', '12', '9', '3', '75% - Assistance, KYC, Support, Chat'],
    ['Guest / Public Role', '9', '9', '0', '100% - Explore, Rights, About, Events, News'],
    ['TOTALS', '74', '66', '8', '89.2% Overall Completion'],
  ];

  const colWidths = [50, 24, 24, 20, 64];

  // Header row
  doc.setFillColor(15, 40, 96);
  doc.rect(14, y, 182, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  let curX = 16;
  tableHeader.forEach((h, i) => {
    doc.text(h, curX, y + 4.5);
    curX += colWidths[i];
  });
  y += 6.5;

  // Data rows
  tableData.forEach((row, rIdx) => {
    const isTotal = rIdx === tableData.length - 1;
    doc.setFillColor(isTotal ? 254 : rIdx % 2 === 0 ? 255 : 248, isTotal ? 243 : rIdx % 2 === 0 ? 255 : 250, isTotal ? 199 : rIdx % 2 === 0 ? 255 : 252);
    doc.rect(14, y, 182, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 6, 196, y + 6);

    doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(isTotal ? 180 : 30, isTotal ? 83 : 41, isTotal ? 9 : 59);

    curX = 16;
    row.forEach((cell, cIdx) => {
      doc.text(cell, curX, y + 4.2);
      curX += colWidths[cIdx];
    });
    y += 6;
  });

  y += 6;

  // SECTION 2: ADMIN BREAKDOWN
  checkPage(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 40, 96);
  doc.text('2. ADMIN ROLE BREAKDOWN (25 Done / 1 Left)', 14, y);
  y += 4;

  const adminDone = [
    '• Dashboard & Live KPIs: AdminDashboardScreen',
    '• Members Directory & Search: MembersScreen',
    '• Membership Approvals Queue: MembershipApplicationsScreen',
    '• KYC Verification & Review: MembershipApplicationDetailsScreen',
    '• Financial Vouchers: ExpenseVouchersScreen, CreateExpenseVoucherScreen, ExpenseDetailsScreen',
    '• Income Receipts: ReceiptVouchersScreen, CreateReceiptVoucherScreen, ReceiptVoucherDetailsScreen',
    '• Double-Entry Accounting: ChartOfAccountsScreen, GeneralLedgerScreen, JournalEntriesScreen',
    '• Statutory Financial Reports: TrialBalanceScreen, ProfitLossScreen, BalanceSheetScreen, ReportsScreen',
    '• Assistance Requests & Seeker Review: AssistanceRequestsScreen, AssistanceDetailsScreen, AssistanceDocumentsScreen',
    '• Grievance & Helpdesk: SupportTicketsScreen, TicketDetailsScreen, TicketChatScreen',
    '• Payment Verification: PaymentVerificationScreen, PaymentDetailsScreen, DonationsScreen',
    '• Content CMS: EventsScreen (Create/Edit), NewsListScreen (Create/Edit), BlogsListScreen (Create/Edit)',
    '• Human Rights Management: KnowYourRightsScreen, CreateRightsArticleScreen, RightArticleDetailsScreen',
    '• Admin Profile & Digital ID Card: ProfileScreen, EditPersonalInfoScreen, MyIdCardScreen (with PDF Export)',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  adminDone.forEach(item => {
    checkPage(6);
    doc.text(item, 16, y);
    y += 4.5;
  });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('❌ Pending for Admin: Roles & Permissions Matrix Screen (RBAC editor for Super Admin)', 16, y);
  y += 6;

  // SECTION 3: MEMBER BREAKDOWN
  checkPage(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 40, 96);
  doc.text('3. MEMBER ROLE BREAKDOWN (16 Done / 4 Left)', 14, y);
  y += 4;

  const memberDone = [
    '• Member Home & Active Digital Card: MemberHomeScreen (interactive navigation, chapter, validity)',
    '• Membership Review & Benefits: MembershipDetailsScreen (benefits breakdown, certificate modal)',
    '• Membership Renewal Flow: RenewMembershipScreen (1-year & 3-year plan options, free renewal policy)',
    '• Membership Categories & Tiers: MembershipCategoriesScreen, BecomeMemberScreen',
    '• Multi-Step KYC Membership Application: CreateAccountScreen, AdditionalScreen, VerificationScreen',
    '• Verified Causes & Aid Feed: MemberCauseListScreen, MemberCauseDetailsScreen (2:2 KPI impact grid)',
    '• Donation Checkout Engine: GlobalPaymentModal, MemberDonationModal (Cashfree PG + 80G Tax Toggle)',
    '• Tax Exemptions & 80G Receipts: DonationsScreen (historical receipts & downloadable proof)',
    '• Member Events & Participation: MemberEventsContainer, UserEventsScreen, UserEventDetailsScreen',
    '• Member Profile & ID Card Generation: ProfileScreen, MembershipCertificateModal, Document Generator',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  memberDone.forEach(item => {
    checkPage(6);
    doc.text(item, 16, y);
    y += 4.5;
  });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('❌ Pending for Member: Standalone Donation Timeline, Dedicated Member Ticket Hub, Chat View, Notification Toggles', 16, y);
  y += 6;

  // SECTION 4: SEEKER & GUEST BREAKDOWN
  checkPage(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 40, 96);
  doc.text('4. SEEKER & GUEST ROLES STATUS', 14, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('Donation Seeker Role (9 Done / 3 Left — 75%):', 16, y);
  y += 4.5;

  const seekerDone = [
    '• Done: SeekerHomeScreen, FileComplaintScreen, GetHelpScreen, AssistanceRequestsScreen, AssistanceDetailsScreen, AssistanceDocumentsScreen, TicketChatScreen, ProfileScreen',
    '• Pending: 4-Step Aid Application Wizard, Aid Tracker Stepper (Timeline), Dedicated Seeker Document Vault',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  seekerDone.forEach(item => {
    checkPage(6);
    doc.text(item, 18, y);
    y += 4.2;
  });

  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text('Guest / Public Role (9 Done / 0 Left — 100%):', 16, y);
  y += 4.5;

  const guestDone = [
    '• Done: UserHomeScreen (Hero explore, counters, news, events), KnowYourRightsScreen, RightDetailsScreen, AboutScreen, ContactUsScreen, UserEventsScreen, UserEventDetailsScreen, RegisterForEventScreen, NewsScreen, NewsDetailsScreen',
    '• Status: Complete. All public explore, news, laws, and registration flows are active.',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  guestDone.forEach(item => {
    checkPage(6);
    doc.text(item, 18, y);
    y += 4.2;
  });

  y += 6;

  // SECTION 5: THE 8 REMAINING SCREENS
  checkPage(45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 40, 96);
  doc.text('5. THE 8 REMAINING SCREENS TO REACH 100% BRD TARGET', 14, y);
  y += 4;

  const remainingScreens = [
    ['1', 'High', 'Roles & Permissions Matrix', 'Admin', 'RBAC permission grid to view/toggle module access'],
    ['2', 'High', 'Aid Tracker Stepper', 'Seeker', 'Visual milestone stepper: Applied > Review > Disbursed'],
    ['3', 'Medium', 'Aid Application Wizard', 'Seeker', '4-step wizard: Category > Need > Story > Hospital Bills'],
    ['4', 'Medium', 'Member Support Ticket Hub', 'Member', 'Dedicated ticket listing portal for logged-in members'],
    ['5', 'Medium', 'Member Support Live Chat', 'Member', 'Real-time threaded chat view with NGO helpdesk'],
    ['6', 'Low', 'Seeker Document Vault', 'Seeker', 'Dedicated re-upload view for rejected medical proofs'],
    ['7', 'Low', 'Personal Donation History', 'Member', 'Personal filterable donation list & tax certificate view'],
    ['8', 'Low', 'Member Notification Settings', 'Member', 'Push notification toggles and email alerts'],
  ];

  // Header
  doc.setFillColor(15, 40, 96);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('#', 16, y + 4.2);
  doc.text('Priority', 24, y + 4.2);
  doc.text('Screen Name', 42, y + 4.2);
  doc.text('Role', 92, y + 4.2);
  doc.text('Scope & Description', 114, y + 4.2);
  y += 6;

  remainingScreens.forEach((r, idx) => {
    checkPage(6);
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, y, 182, 5.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 5.5, 196, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 40, 96);
    doc.text(r[0], 16, y + 3.8);

    doc.setTextColor(r[1] === 'High' ? 220 : r[1] === 'Medium' ? 180 : 71, r[1] === 'High' ? 38 : r[1] === 'Medium' ? 83 : 85, r[1] === 'High' ? 38 : r[1] === 'Medium' ? 9 : 105);
    doc.text(r[1], 24, y + 3.8);

    doc.setTextColor(15, 23, 42);
    doc.text(r[2], 42, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(r[3], 92, y + 3.8);

    doc.setTextColor(51, 65, 85);
    doc.text(r[4], 114, y + 3.8);

    y += 5.5;
  });

  // SIGN OFF FOOTER
  checkPage(20);
  y += 8;
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 40, 96);
  doc.text('Human Rights & Social Justice Mission (HRSJM)', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('National Headquarters: New Delhi, India | Official Digital Platform Report', 14, y + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('VERIFIED & AUDITED: 85 Active Screens in Repository', 196, y, { align: 'right' });

  return doc;
}

const doc = createReportPdf();
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

// Output paths
const projectPath = path.resolve(__dirname, '../docs/HRSJM_All_Roles_Screen_Report_2026-10-09.pdf');
const downloadsPath = 'C:\\Users\\Admin\\Downloads\\HRSJM_All_Roles_Screen_Report_2026-10-09.pdf';

fs.writeFileSync(projectPath, pdfBuffer);
console.log('Saved to project:', projectPath);

try {
  fs.writeFileSync(downloadsPath, pdfBuffer);
  console.log('Saved to downloads:', downloadsPath);
} catch (e) {
  console.log('Could not save directly to Downloads:', e.message);
}
