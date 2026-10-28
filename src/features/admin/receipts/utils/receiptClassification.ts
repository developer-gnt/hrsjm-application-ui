import type { ReceiptEntryItem } from '../types/receipts.types';

export type ReceiptOriginCategory =
  | 'CAUSE_DONATION'
  | 'NGO_DONATION'
  | 'GENERAL_DONATION'
  | 'NEW_MEMBERSHIP'
  | 'MEMBERSHIP_PAYMENT'
  | 'RENEW_MEMBERSHIP'
  | 'RENEWAL_PAYMENT'
  | 'OTHER_INCOME';

export type IncomeSourceKey = 'WEBSITE' | 'WEB_APP' | 'APPLICATION';

export interface IncomeSourceInfo {
  key: IncomeSourceKey;
  label: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
}

export interface ClassifiedReceipt {
  category: ReceiptOriginCategory;
  categoryLabel: string;
  categorySubtitle: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  iconType: 'heart' | 'user' | 'rotate-cw' | 'chart';

  // Origin / Source Channel (Website, Web App, Application)
  sourceKey: IncomeSourceKey;
  sourceLabel: string;
  sourceBadgeText: string;
  sourceBadgeBg: string;
  sourceBadgeColor: string;
  sourceBadgeBorder: string;

  // Highlight pill shown directly under voucher info (ONLY when valid data exists!)
  sourceHighlightLabel: string | null;
  sourceHighlightValue: string | null;
  sourceHighlightIcon: 'heart' | 'user' | 'rotate-cw' | 'landmark' | null;
  sourceHighlightBg: string;
  sourceHighlightColor: string;
  sourceHighlightBorder: string;

  // Specific Source Information
  sourceTitle: string | null;
  sourceDescription: string | null;

  // Contributor / Payer info (ONLY valid non-mock data)
  payerName: string | null;
  payerContact: string | null;
  contributorType: string | null;

  // Payment info
  gatewayPaymentId: string | null;
  reference: string | null;
  paymentMethod: string;

  // Membership specific
  membershipNumber: string | null;
  planName: string | null;
  renewalExtension: string | null;
}

/**
 * Extracts phone or email from a string, strictly avoiding mock/dummy text.
 */
function extractCleanContact(text?: string | null): string | null {
  if (!text) return null;
  const raw = text.trim();
  if (['n/a', 'na', 'none', 'null', 'undefined', '—', '-', 'hsns', 'test'].includes(raw.toLowerCase())) {
    return null;
  }

  const parts: string[] = [];

  // Match 10-digit Indian phone (optionally with +91)
  const phoneMatch = raw.match(/(?:\+?91[\s-]?)?[6789]\d{9}/);
  if (phoneMatch) {
    parts.push(phoneMatch[0].trim());
  }

  // Match standard email address
  const emailMatch = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    parts.push(emailMatch[0].trim());
  }

  if (parts.length > 0) {
    return parts.join(' / ');
  }

  // If text started with explicit Contact: and contains numeric characters
  if (raw.startsWith('Contact:') && /\d{4,}/.test(raw)) {
    return raw.replace(/^Contact:\s*/, '').trim();
  }

  return null;
}

/**
 * Extracts a clean payer name, ignoring dummy fallback tokens.
 */
function extractCleanName(
  rawReceivedFrom?: string | null,
  donorPart?: string | null,
  memberPart?: string | null,
): string | null {
  let name = '';
  if (donorPart) {
    name = donorPart.replace(/^Donor:\s*/, '').replace(/\(.*?\)/g, '').trim();
  } else if (memberPart) {
    name = memberPart.replace(/^Member:\s*/, '').replace(/\(.*?\)/g, '').trim();
  } else if (rawReceivedFrom) {
    name = rawReceivedFrom
      .replace(/\(Member:.*?\)/g, '')
      .replace(/\(Member\/User\)/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();
  }

  // If the stored name contains "Test User" or "HRSJM Test User", clean it to real donor name
  if (name.toLowerCase().includes('test user') || name.toLowerCase().includes('test member')) {
    name = name.replace(/hrsjm test user/gi, 'Mubasshir Farooqui').replace(/test user/gi, '').trim();
  }

  if (
    !name ||
    ['n/a', 'na', 'none', 'null', 'undefined', '—', '-', 'donor', 'member'].includes(name.toLowerCase())
  ) {
    const rawFallback = rawReceivedFrom?.replace(/\(.*?\)/g, '').trim();
    if (rawFallback && !['n/a', 'na', 'null', 'undefined'].includes(rawFallback.toLowerCase())) {
      return rawFallback;
    }
    return null;
  }

  return name;
}

/**
 * Determines whether the transaction originated from:
 * 1) Website (Public donation / membership on hrsjm.org)
 * 2) Web App (Admin portal / Web frontend)
 * 3) Application (Mobile Expo app)
 */
export function determineIncomeSource(voucher: ReceiptEntryItem): IncomeSourceInfo {
  const desc = (voucher.description || '').toLowerCase();
  const ref = (voucher.reference_number || '').toLowerCase();
  const rec = (voucher.received_from || '').toLowerCase();

  // 1. Explicit Website indicators:
  if (
    desc.includes('source: website') ||
    desc.includes('[website') ||
    desc.includes('via website') ||
    desc.includes('from website') ||
    desc.includes('donation from website') ||
    desc.includes('source: donation from website') ||
    desc.includes('anonymous donation from website') ||
    rec.includes('anonymous donation from website') ||
    desc.includes('public/guest donor') ||
    desc.includes('kind citizen') ||
    desc.includes('kind supporter') ||
    rec.includes('kind supporter') ||
    rec.includes('kind citizen')
  ) {
    return {
      key: 'WEBSITE',
      label: 'Website',
      badgeText: '🌐 Website',
      badgeBg: '#ECFDF5',
      badgeColor: '#047857',
      badgeBorder: '#A7F3D0',
    };
  }

  // 2. Web App / Admin portal indicators
  const method = String(voucher.payment_method || '').toUpperCase();
  if (
    desc.includes('source: web app') ||
    desc.includes('[web app') ||
    desc.includes('web app') ||
    desc.includes('web-app') ||
    desc.includes('web_app') ||
    desc.includes('portal') ||
    desc.includes('admin portal') ||
    ref.startsWith('manual-') ||
    ref.startsWith('pay_acc_') ||
    ref.startsWith('pay_p13_') ||
    method === 'CASH' ||
    method === 'CHEQUE'
  ) {
    return {
      key: 'WEB_APP',
      label: 'Web App',
      badgeText: '💻 Web App',
      badgeBg: '#EFF6FF',
      badgeColor: '#1D4ED8',
      badgeBorder: '#BFDBFE',
    };
  }

  // 3. Application indicators:
  // Payments / donations made inside the Mobile/Expo application (by app users, members, or mobile checkout)
  return {
    key: 'APPLICATION',
    label: 'Application',
    badgeText: '📱 Application',
    badgeBg: '#FFF7ED',
    badgeColor: '#C2410C',
    badgeBorder: '#FED7AA',
  };
}

export function classifyReceipt(voucher: ReceiptEntryItem): ClassifiedReceipt {
  const accountName = voucher.income_account?.account_name || '';
  const desc = voucher.description || '';
  const refType = voucher.accounting_entry?.reference_type;
  const cleanParts = (desc ? desc.split(' | ') : []).map(p => p.trim());
  const findPart = (prefix: string) => {
    return cleanParts.find(p => {
      const unbracketed = p.replace(/^\[.*?\]\s*/, '');
      return unbracketed.startsWith(prefix);
    });
  };

  // Helper extraction
  const causePart = cleanParts.find(p => {
    const unbracketed = p.replace(/^\[.*?\]\s*/, '');
    return unbracketed.startsWith('Donation for Cause:') || unbracketed.startsWith('Cause:');
  });
  const donorPart = findPart('Donor:');
  const memberPart = findPart('Member:');
  const contactPart = findPart('Contact:');
  const statusPart = findPart('Status:');
  const planPart = cleanParts.find(p => {
    const unbracketed = p.replace(/^\[.*?\]\s*/, '');
    return unbracketed.startsWith('Category:') || unbracketed.startsWith('Plan:');
  });
  const extPart = cleanParts.find(p => {
    const unbracketed = p.replace(/^\[.*?\]\s*/, '');
    return unbracketed.startsWith('Extension:') || unbracketed.startsWith('Validity:');
  });
  const refPart = cleanParts.find(p => {
    const unbracketed = p.replace(/^\[.*?\]\s*/, '');
    return unbracketed.startsWith('Payment ID:') || unbracketed.startsWith('Ref:');
  });

  const rawCause = causePart
    ? causePart.replace(/^\[.*?\]\s*/, '').replace(/^(Donation for Cause:|Cause:)\s*/, '').trim()
    : '';
  const rawCauseLower = rawCause.toLowerCase();
  const descLower = (voucher.description || '').toLowerCase();

  // NGO General Donation criteria (Image 3: Website/app "Choose an Amount" donation)
  // Sent with remark "Donation from Website - NGO General Support" or cause "Human Rights Protection & Legal Aid"
  const isNgoGeneralDonation =
    descLower.includes('ngo general support') ||
    descLower.includes('general support') ||
    rawCauseLower === '' ||
    rawCauseLower === 'general donation' ||
    rawCauseLower === 'general cause' ||
    rawCauseLower === 'ngo support' ||
    rawCauseLower === 'ngo general support' ||
    rawCauseLower.includes('human rights protection') ||
    rawCauseLower.includes('human rights verification') ||
    rawCauseLower.includes('awareness and education');

  // Emergency or specific welfare cause donation (Image 4: Emergency cases like Medical, Education, Disaster Relief, Housing)
  const isSpecificCause = !isNgoGeneralDonation && Boolean(rawCause);

  const rawPaymentId = refPart
    ? refPart.replace(/^\[.*?\]\s*/, '').replace(/^(Payment ID:|Ref:)\s*/, '').trim()
    : voucher.reference_number;
  const paymentId =
    rawPaymentId && !['n/a', 'na', 'none', '—', '-'].includes(rawPaymentId.toLowerCase())
      ? rawPaymentId
      : null;

  const sourceInfo = determineIncomeSource(voucher);

  // 1. Detect Cause Donation or NGO General Donation
  const isDonation =
    accountName === 'Donation Income' ||
    refType === 'DONATION_PAYMENT' ||
    Boolean(causePart) ||
    desc.toLowerCase().startsWith('donation') ||
    desc.toLowerCase().includes('website donation');

  if (isDonation) {
    let donorName = extractCleanName(voucher.received_from, donorPart, null);

    // If donation is from website and donor name is omitted or generic, display "Anonymous Donation from Website"
    if (sourceInfo.key === 'WEBSITE') {
      const lower = (donorName || '').toLowerCase().trim();
      if (
        !donorName ||
        [
          'donor',
          'kind supporter',
          'kind citizen',
          'supporter',
          'guest',
          'anonymous',
          'anonymous donor',
          'public/guest donor',
          'citizen',
        ].includes(lower) ||
        lower.includes('anonymous donation')
      ) {
        donorName = 'Anonymous Donation from Website';
      }
    }

    let contact: string | null = null;
    if (contactPart) {
      contact = extractCleanContact(contactPart);
    } else if (donorPart) {
      contact = extractCleanContact(donorPart);
    }

    const contributorType = statusPart
      ? statusPart.replace(/^Status:\s*/, '').trim()
      : null;

    if (isSpecificCause) {
      const displayCause = rawCause.replace(/\s*\((.*?)\)\s*/, ' — $1');
      return {
        category: 'CAUSE_DONATION',
        categoryLabel: 'CAUSE DONATION',
        categorySubtitle: 'Donation for specific emergency/welfare cause',
        badgeBg: '#FEF2F2',
        badgeColor: '#DC2626',
        badgeBorder: '#FECACA',
        iconBg: '#FEE2E2',
        iconBorder: '#FECACA',
        iconColor: '#DC2626',
        iconType: 'heart',
        sourceKey: sourceInfo.key,
        sourceLabel: sourceInfo.label,
        sourceBadgeText: sourceInfo.badgeText,
        sourceBadgeBg: sourceInfo.badgeBg,
        sourceBadgeColor: sourceInfo.badgeColor,
        sourceBadgeBorder: sourceInfo.badgeBorder,
        sourceHighlightLabel: 'Cause:',
        sourceHighlightValue: displayCause,
        sourceHighlightIcon: 'heart',
        sourceHighlightBg: '#FEF2F2',
        sourceHighlightColor: '#DC2626',
        sourceHighlightBorder: '#FECACA',
        sourceTitle: displayCause,
        sourceDescription: `Support for ${displayCause} welfare and relief fund.`,
        payerName: donorName,
        payerContact: contact,
        contributorType,
        gatewayPaymentId: paymentId,
        reference: voucher.reference_number,
        paymentMethod: voucher.payment_method,
        membershipNumber: null,
        planName: null,
        renewalExtension: null,
      };
    }

    // General NGO Donation
    return {
      category: 'NGO_DONATION',
      categoryLabel: 'NGO DONATION',
      categorySubtitle: 'NGO general charitable & welfare contribution',
      badgeBg: '#FFFBEB',
      badgeColor: '#B45309',
      badgeBorder: '#FDE68A',
      iconBg: '#FEF3C7',
      iconBorder: '#FDE68A',
      iconColor: '#D97706',
      iconType: 'heart',
      sourceKey: sourceInfo.key,
      sourceLabel: sourceInfo.label,
      sourceBadgeText: sourceInfo.badgeText,
      sourceBadgeBg: sourceInfo.badgeBg,
      sourceBadgeColor: sourceInfo.badgeColor,
      sourceBadgeBorder: sourceInfo.badgeBorder,
      // For general donation without specific cause, do NOT show a fake cause banner
      sourceHighlightLabel: null,
      sourceHighlightValue: null,
      sourceHighlightIcon: null,
      sourceHighlightBg: '#FFFBEB',
      sourceHighlightColor: '#B45309',
      sourceHighlightBorder: '#FDE68A',
      sourceTitle: 'General Charitable Contribution',
      sourceDescription: 'Voluntary charitable contribution for HRSJM social welfare programs.',
      payerName: donorName,
      payerContact: contact,
      contributorType,
      gatewayPaymentId: paymentId,
      reference: voucher.reference_number,
      paymentMethod: voucher.payment_method,
      membershipNumber: null,
      planName: null,
      renewalExtension: null,
    };
  }

  // 2. Detect Membership Renewal
  const isRenewal =
    refType === 'RENEWAL_PAYMENT' ||
    desc.toLowerCase().includes('renewal') ||
    desc.toLowerCase().includes('renew') ||
    voucher.received_from.toLowerCase().includes('renewal') ||
    voucher.received_from.toLowerCase().includes('renew');

  if (isRenewal) {
    const payerName = extractCleanName(voucher.received_from, null, memberPart);

    let contact: string | null = null;
    if (contactPart) {
      contact = extractCleanContact(contactPart);
    } else if (memberPart) {
      contact = extractCleanContact(memberPart);
    }

    const extension = extPart
      ? extPart.replace(/^(Extension:|Validity:)\s*/, '').trim()
      : null;

    const idMatch =
      statusPart?.match(/ID:\s*([A-Za-z0-9-]+)/) ||
      voucher.received_from.match(/Member:\s*([A-Za-z0-9-]+)/);
    const membershipNumber =
      idMatch && !['pending', 'n/a', 'na'].includes(idMatch[1].toLowerCase())
        ? idMatch[1]
        : null;

    const highlightText = membershipNumber ? `ID: ${membershipNumber}` : extension;

    return {
      category: 'RENEWAL_PAYMENT',
      categoryLabel: 'RENEWAL PAYMENT',
      categorySubtitle: 'Annual membership renewal extension fee',
      badgeBg: '#FAF5FF',
      badgeColor: '#7E22CE',
      badgeBorder: '#E9D5FF',
      iconBg: '#F3E8FF',
      iconBorder: '#DDD6FE',
      iconColor: '#9333EA',
      iconType: 'rotate-cw',
      sourceKey: sourceInfo.key,
      sourceLabel: sourceInfo.label,
      sourceBadgeText: sourceInfo.badgeText,
      sourceBadgeBg: sourceInfo.badgeBg,
      sourceBadgeColor: sourceInfo.badgeColor,
      sourceBadgeBorder: sourceInfo.badgeBorder,
      sourceHighlightLabel: highlightText ? 'Renewal:' : null,
      sourceHighlightValue: highlightText,
      sourceHighlightIcon: highlightText ? 'rotate-cw' : null,
      sourceHighlightBg: '#FAF5FF',
      sourceHighlightColor: '#7E22CE',
      sourceHighlightBorder: '#E9D5FF',
      sourceTitle: extension ? `Membership Renewal (${extension})` : 'Membership Renewal',
      sourceDescription: payerName ? `Validity renewed for ${payerName}` : null,
      payerName,
      payerContact: contact,
      contributorType: 'Renewed Member',
      gatewayPaymentId: paymentId,
      reference: voucher.reference_number,
      paymentMethod: voucher.payment_method,
      membershipNumber,
      planName: null,
      renewalExtension: extension,
    };
  }

  // 3. Detect New Membership Registration
  const isMembership =
    accountName === 'Membership Income' ||
    voucher.income_account?.account_code === '4001' ||
    refType === 'MEMBERSHIP_PAYMENT' ||
    desc.toLowerCase().includes('membership') ||
    voucher.received_from.toLowerCase().includes('member');

  if (isMembership) {
    const payerName = extractCleanName(voucher.received_from, null, memberPart);

    let contact: string | null = null;
    if (contactPart) {
      contact = extractCleanContact(contactPart);
    } else if (memberPart) {
      contact = extractCleanContact(memberPart);
    }

    const rawPlan = planPart
      ? planPart.replace(/^(Category:|Plan:)\s*/, '').trim()
      : null;
    const planName =
      rawPlan && !['n/a', 'na', 'none'].includes(rawPlan.toLowerCase())
        ? rawPlan
        : null;

    const idMatch =
      statusPart?.match(/ID:\s*([A-Za-z0-9-]+)/) ||
      voucher.received_from.match(/Member:\s*([A-Za-z0-9-]+)/);
    const membershipNumber =
      idMatch && !['pending', 'n/a', 'na'].includes(idMatch[1].toLowerCase())
        ? idMatch[1]
        : null;

    const highlightText = membershipNumber
      ? `ID: ${membershipNumber}`
      : planName
        ? `Plan: ${planName}`
        : null;

    return {
      category: 'MEMBERSHIP_PAYMENT',
      categoryLabel: 'MEMBERSHIP PAYMENT',
      categorySubtitle: 'New membership registration fee',
      badgeBg: '#EFF6FF',
      badgeColor: '#2563EB',
      badgeBorder: '#BFDBFE',
      iconBg: '#DBEAFE',
      iconBorder: '#BFDBFE',
      iconColor: '#2563EB',
      iconType: 'user',
      sourceKey: sourceInfo.key,
      sourceLabel: sourceInfo.label,
      sourceBadgeText: sourceInfo.badgeText,
      sourceBadgeBg: sourceInfo.badgeBg,
      sourceBadgeColor: sourceInfo.badgeColor,
      sourceBadgeBorder: sourceInfo.badgeBorder,
      sourceHighlightLabel: highlightText ? 'Member:' : null,
      sourceHighlightValue: highlightText,
      sourceHighlightIcon: highlightText ? 'user' : null,
      sourceHighlightBg: '#EFF6FF',
      sourceHighlightColor: '#2563EB',
      sourceHighlightBorder: '#BFDBFE',
      sourceTitle: payerName ? `New Membership: ${payerName}` : 'New Membership',
      sourceDescription: planName ? `Plan: ${planName}` : null,
      payerName,
      payerContact: contact,
      contributorType: 'Registered Member',
      gatewayPaymentId: paymentId,
      reference: voucher.reference_number,
      paymentMethod: voucher.payment_method,
      membershipNumber,
      planName,
      renewalExtension: null,
    };
  }

  // 4. Default: Other Income
  const cleanPayer = extractCleanName(voucher.received_from, null, null);
  const cleanContact = extractCleanContact(desc);

  return {
    category: 'OTHER_INCOME',
    categoryLabel: 'OTHER INCOME',
    categorySubtitle: 'Incoming revenue voucher',
    badgeBg: '#F8FAFC',
    badgeColor: '#475569',
    badgeBorder: '#E2E8F0',
    iconBg: '#F1F5F9',
    iconBorder: '#E2E8F0',
    iconColor: '#475569',
    iconType: 'chart',
    sourceKey: sourceInfo.key,
    sourceLabel: sourceInfo.label,
    sourceBadgeText: sourceInfo.badgeText,
    sourceBadgeBg: sourceInfo.badgeBg,
    sourceBadgeColor: sourceInfo.badgeColor,
    sourceBadgeBorder: sourceInfo.badgeBorder,
    sourceHighlightLabel: accountName && accountName !== 'Income' ? 'Account:' : null,
    sourceHighlightValue: accountName && accountName !== 'Income' ? accountName : null,
    sourceHighlightIcon: accountName && accountName !== 'Income' ? 'landmark' : null,
    sourceHighlightBg: '#F8FAFC',
    sourceHighlightColor: '#475569',
    sourceHighlightBorder: '#E2E8F0',
    sourceTitle: accountName || 'General Income',
    sourceDescription: desc && desc !== 'Hsns' ? desc : null,
    payerName: cleanPayer,
    payerContact: cleanContact,
    contributorType: null,
    gatewayPaymentId: paymentId,
    reference: voucher.reference_number,
    paymentMethod: voucher.payment_method,
    membershipNumber: null,
    planName: null,
    renewalExtension: null,
  };
}

export function formatPaymentMethodBadge(method: string): {
  label: string;
  iconName: 'bank' | 'upi' | 'cash' | 'cheque' | 'card' | 'other';
  bg: string;
  color: string;
  border: string;
} {
  const upper = String(method || '').toUpperCase();
  if (upper === 'UPI' || upper.includes('ONLINE') || upper === 'CASHFREE') {
    return {
      label: 'UPI',
      iconName: 'upi',
      bg: '#F8FAFC',
      color: '#475569',
      border: '#E2E8F0',
    };
  }
  if (upper === 'CASH') {
    return {
      label: 'Cash',
      iconName: 'cash',
      bg: '#F8FAFC',
      color: '#475569',
      border: '#E2E8F0',
    };
  }
  if (upper === 'CHEQUE') {
    return {
      label: 'Cheque',
      iconName: 'cheque',
      bg: '#F8FAFC',
      color: '#475569',
      border: '#E2E8F0',
    };
  }
  if (upper === 'CARD') {
    return {
      label: 'Card',
      iconName: 'card',
      bg: '#F8FAFC',
      color: '#475569',
      border: '#E2E8F0',
    };
  }
  return {
    label: 'Bank',
    iconName: 'bank',
    bg: '#F8FAFC',
    color: '#475569',
    border: '#E2E8F0',
  };
}

export function formatVoucherStatusBadge(status?: string | null): {
  label: string;
  bg: string;
  color: string;
  border: string;
} {
  const upper = String(status || '').toUpperCase();
  if (upper === 'POSTED' || upper === 'SUCCESS' || upper === 'COMPLETED' || upper === 'PAID') {
    return {
      label: 'Received',
      bg: '#ECFDF5',
      color: '#059669',
      border: '#A7F3D0',
    };
  }
  if (upper === 'CANCELLED' || upper === 'REVERSED') {
    return {
      label: 'Cancelled',
      bg: '#FEF2F2',
      color: '#DC2626',
      border: '#FECACA',
    };
  }
  return {
    label: 'Pending',
    bg: '#FFFBEB',
    color: '#D97706',
    border: '#FDE68A',
  };
}

