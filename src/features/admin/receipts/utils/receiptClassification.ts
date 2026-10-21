import type { ReceiptEntryItem } from '../types/receipts.types';

export type ReceiptOriginCategory =
  | 'CAUSE_DONATION'
  | 'GENERAL_DONATION'
  | 'NEW_MEMBERSHIP'
  | 'RENEW_MEMBERSHIP'
  | 'OTHER_INCOME';

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

  // Highlight pill shown directly under voucher info
  sourceHighlightLabel: string;
  sourceHighlightValue: string;
  sourceHighlightIcon: 'heart' | 'user' | 'rotate-cw' | 'landmark';
  sourceHighlightBg: string;
  sourceHighlightColor: string;
  sourceHighlightBorder: string;

  // Specific Source Information
  sourceTitle: string;
  sourceDescription: string;

  // Contributor / Payer info
  payerName: string;
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

export function classifyReceipt(voucher: ReceiptEntryItem): ClassifiedReceipt {
  const accountName = voucher.income_account?.account_name || '';
  const desc = voucher.description || '';
  const refType = voucher.accounting_entry?.reference_type;
  const parts = desc ? desc.split(' | ') : [];

  // Helper extraction
  const causePart = parts.find(p => p.startsWith('Donation for Cause:') || p.startsWith('Cause:'));
  const donorPart = parts.find(p => p.startsWith('Donor:'));
  const memberPart = parts.find(p => p.startsWith('Member:'));
  const contactPart = parts.find(p => p.startsWith('Contact:'));
  const statusPart = parts.find(p => p.startsWith('Status:'));
  const planPart = parts.find(p => p.startsWith('Category:') || p.startsWith('Plan:'));
  const extPart = parts.find(p => p.startsWith('Extension:') || p.startsWith('Validity:'));
  const refPart = parts.find(p => p.startsWith('Payment ID:') || p.startsWith('Ref:'));

  const rawCause = causePart
    ? causePart.replace(/^(Donation for Cause:|Cause:)\s*/, '').trim()
    : '';
  const isSpecificCause =
    Boolean(rawCause) &&
    rawCause.toLowerCase() !== 'general donation' &&
    rawCause.toLowerCase() !== 'general cause';

  const paymentId = refPart
    ? refPart.replace(/^(Payment ID:|Ref:)\s*/, '').trim()
    : voucher.reference_number;

  // 1. Detect Cause Donation or General Donation
  const isDonation =
    accountName === 'Donation Income' ||
    refType === 'DONATION_PAYMENT' ||
    Boolean(causePart) ||
    desc.toLowerCase().startsWith('donation');

  if (isDonation) {
    const donorName = donorPart
      ? donorPart.replace(/^Donor:\s*/, '').trim()
      : voucher.received_from.replace(/\(Member:.*?\)/, '').trim();

    let contact: string | null = null;
    if (contactPart) {
      contact = contactPart.replace(/^Contact:\s*/, '').trim();
    } else {
      // Check if contact is embedded in donor part, e.g. "Donor: Name (Phone / Email)"
      const contactMatch = donorPart?.match(/\((.*?)\)/);
      if (contactMatch) contact = contactMatch[1];
    }

    const contributorType = statusPart
      ? statusPart.replace(/^Status:\s*/, '').trim()
      : 'Public Contributor';

    if (isSpecificCause) {
      const displayCause = rawCause.replace(/\s*\((.*?)\)\s*/, ' — $1');
      return {
        category: 'CAUSE_DONATION',
        categoryLabel: 'CAUSE DONATION',
        categorySubtitle: 'Financial support for a cause',
        badgeBg: '#FEF2F2',
        badgeColor: '#DC2626',
        badgeBorder: '#FECACA',
        iconBg: '#FEF2F2',
        iconBorder: '#FECACA',
        iconColor: '#DC2626',
        iconType: 'heart',
        sourceHighlightLabel: 'Cause:',
        sourceHighlightValue: displayCause,
        sourceHighlightIcon: 'heart',
        sourceHighlightBg: '#FEF2F2',
        sourceHighlightColor: '#DC2626',
        sourceHighlightBorder: '#FECACA',
        sourceTitle: displayCause,
        sourceDescription: "Support for this cause's ongoing relief and medical/welfare fund.",
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

    return {
      category: 'GENERAL_DONATION',
      categoryLabel: 'GENERAL DONATION',
      categorySubtitle: 'Charitable contribution for welfare',
      badgeBg: '#FFF1F2',
      badgeColor: '#E11D48',
      badgeBorder: '#FFE4E6',
      iconBg: '#FFF1F2',
      iconBorder: '#FFE4E6',
      iconColor: '#E11D48',
      iconType: 'heart',
      sourceHighlightLabel: 'Donation:',
      sourceHighlightValue: 'General Charitable & Social Welfare',
      sourceHighlightIcon: 'heart',
      sourceHighlightBg: '#FFF1F2',
      sourceHighlightColor: '#E11D48',
      sourceHighlightBorder: '#FFE4E6',
      sourceTitle: 'General Public Donation',
      sourceDescription: 'Voluntary contribution towards HRSJM charitable and community welfare activities.',
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
    const rawName = memberPart
      ? memberPart.replace(/^Member:\s*/, '').trim()
      : voucher.received_from.replace(/\(Member:.*?\)/, '').trim();

    const contactMatch = rawName.match(/\((.*?)\)/);
    const payerName = rawName.replace(/\(.*?\)/, '').trim() || rawName;
    const contact = contactPart
      ? contactPart.replace(/^Contact:\s*/, '').trim()
      : contactMatch
        ? contactMatch[1]
        : null;

    const extension = extPart
      ? extPart.replace(/^(Extension:|Validity:)\s*/, '').trim()
      : '1 Year Extension';

    const idMatch =
      statusPart?.match(/ID:\s*([A-Za-z0-9-]+)/) ||
      voucher.received_from.match(/Member:\s*([A-Za-z0-9-]+)/);
    const membershipNumber = idMatch ? idMatch[1] : null;

    return {
      category: 'RENEW_MEMBERSHIP',
      categoryLabel: 'MEMBERSHIP RENEWAL',
      categorySubtitle: 'Membership validity renewal fee',
      badgeBg: '#ECFEFF',
      badgeColor: '#0891B2',
      badgeBorder: '#A5F3FC',
      iconBg: '#ECFEFF',
      iconBorder: '#A5F3FC',
      iconColor: '#0891B2',
      iconType: 'rotate-cw',
      sourceHighlightLabel: 'Renewal:',
      sourceHighlightValue: `${payerName}${membershipNumber ? ` (${membershipNumber})` : ''}`,
      sourceHighlightIcon: 'rotate-cw',
      sourceHighlightBg: '#ECFEFF',
      sourceHighlightColor: '#0891B2',
      sourceHighlightBorder: '#A5F3FC',
      sourceTitle: `Membership Renewal (${extension})`,
      sourceDescription: `Validity renewed for ${payerName}${membershipNumber ? ` [${membershipNumber}]` : ''}`,
      payerName,
      payerContact: contact,
      contributorType: 'Renewed Active Member',
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
    const rawName = memberPart
      ? memberPart.replace(/^Member:\s*/, '').trim()
      : voucher.received_from.replace(/\(Member:.*?\)/, '').trim();

    const contactMatch = rawName.match(/\((.*?)\)/);
    const payerName = rawName.replace(/\(.*?\)/, '').trim() || rawName;
    const contact = contactPart
      ? contactPart.replace(/^Contact:\s*/, '').trim()
      : contactMatch
        ? contactMatch[1]
        : null;

    const planName = planPart
      ? planPart.replace(/^(Category:|Plan:)\s*/, '').trim()
      : 'Annual Membership Plan';

    const idMatch =
      statusPart?.match(/ID:\s*([A-Za-z0-9-]+)/) ||
      voucher.received_from.match(/Member:\s*([A-Za-z0-9-]+)/);
    const membershipNumber = idMatch ? idMatch[1] : null;

    return {
      category: 'NEW_MEMBERSHIP',
      categoryLabel: 'MEMBERSHIP FEE',
      categorySubtitle: 'New membership registration fee',
      badgeBg: '#EFF6FF',
      badgeColor: '#2563EB',
      badgeBorder: '#BFDBFE',
      iconBg: '#EFF6FF',
      iconBorder: '#BFDBFE',
      iconColor: '#2563EB',
      iconType: 'user',
      sourceHighlightLabel: 'Member:',
      sourceHighlightValue: `${payerName}${membershipNumber ? ` (${membershipNumber})` : ''}`,
      sourceHighlightIcon: 'user',
      sourceHighlightBg: '#EFF6FF',
      sourceHighlightColor: '#2563EB',
      sourceHighlightBorder: '#BFDBFE',
      sourceTitle: `New Membership: ${payerName}`,
      sourceDescription: `Plan: ${planName}${membershipNumber ? ` • ID: ${membershipNumber}` : ''}`,
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
  return {
    category: 'OTHER_INCOME',
    categoryLabel: 'OTHER INCOME',
    categorySubtitle: 'Incoming revenue voucher',
    badgeBg: '#F5F3FF',
    badgeColor: '#7C3AED',
    badgeBorder: '#DDD6FE',
    iconBg: '#F5F3FF',
    iconBorder: '#DDD6FE',
    iconColor: '#7C3AED',
    iconType: 'chart',
    sourceHighlightLabel: 'Income Account:',
    sourceHighlightValue: accountName || 'General Income',
    sourceHighlightIcon: 'landmark',
    sourceHighlightBg: '#F5F3FF',
    sourceHighlightColor: '#7C3AED',
    sourceHighlightBorder: '#DDD6FE',
    sourceTitle: accountName || 'General Income',
    sourceDescription: desc || 'Official income entry',
    payerName: voucher.received_from,
    payerContact: desc || null,
    contributorType: 'General Payer',
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
