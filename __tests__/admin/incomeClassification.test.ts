import {
  classifyReceipt,
  determineIncomeSource,
  formatVoucherStatusBadge,
} from '../../src/features/admin/receipts/utils/receiptClassification';
import type { ReceiptEntryItem } from '../../src/features/admin/receipts/types/receipts.types';

describe('Income Receipt Classification & Source Detection', () => {
  it('correctly classifies an Application Cause Donation by registered user', () => {
    const item: ReceiptEntryItem = {
      id: 'rec-1',
      voucher_number: 'REC-20261026-00011',
      receipt_date: '2026-10-26T12:00:42Z',
      received_from: 'Mubasshir Farooqui (Member/User)',
      income_account_id: 'acct-don',
      received_in_account_id: 'acct-bank',
      amount: 1000,
      payment_method: 'UPI',
      reference_number: '1468214492702356480',
      description:
        '[Application Donation] Donation for Cause: HRSJM Donation - Awareness and Education | Donor: Mubasshir Farooqui (9888880005 / user@hrsjm.org) | Status: Registered User: Mubasshir Farooqui (9888880005) | Source: Donation for HRSJM Donation - Awareness and Education | Payment ID: 1468214492702356480',
      attachment_url: null,
      status: 'POSTED',
      accounting_entry_id: 'ae-1',
      created_at: '2026-10-26T12:00:42Z',
      updated_at: '2026-10-26T12:00:42Z',
      income_account: { id: 'acct-don', account_name: 'Donation Income', account_code: '4003' },
    };

    const classified = classifyReceipt(item);
    expect(classified.category).toBe('NGO_DONATION');
    expect(classified.categoryLabel).toBe('NGO DONATION');
    expect(classified.sourceKey).toBe('APPLICATION');
    expect(classified.sourceBadgeText).toBe('📱 Application');
    expect(classified.payerName).toBe('Mubasshir Farooqui');
    expect(classified.payerContact).toBe('9888880005 / user@hrsjm.org');
  });

  it('correctly classifies a genuine public Website Donation', () => {
    const item: ReceiptEntryItem = {
      id: 'rec-web',
      voucher_number: 'REC-20261026-00008',
      receipt_date: '2026-10-26T10:13:41Z',
      received_from: 'Mubasshir Complain test a',
      income_account_id: 'acct-don',
      received_in_account_id: 'acct-bank',
      amount: 250,
      payment_method: 'UPI',
      reference_number: '1468187639505366016',
      description:
        '[Website Donation] Donation for Cause: Human Rights Protection & Legal Aid | Donor: Mubasshir Complain test a (9193094293) | Status: Public/Guest Donor | Source: Donation from Website - NGO General Support | Payment ID: 1468187639505366016',
      attachment_url: null,
      status: 'POSTED',
      accounting_entry_id: 'ae-w',
      created_at: '2026-10-26T10:13:41Z',
      updated_at: '2026-10-26T10:13:41Z',
      income_account: { id: 'acct-don', account_name: 'Donation Income', account_code: '4003' },
    };

    const classified = classifyReceipt(item);
    expect(classified.sourceKey).toBe('WEBSITE');
    expect(classified.sourceBadgeText).toBe('🌐 Website');
    expect(classified.payerName).toBe('Mubasshir Complain test a');
  });

  it('labels anonymous website donations without a specified name as "Anonymous Donation from Website"', () => {
    const item: ReceiptEntryItem = {
      id: 'rec-anon',
      voucher_number: 'REC-20261025-00003',
      receipt_date: '2026-10-25T14:30:00Z',
      received_from: 'Kind Supporter',
      income_account_id: 'acct-don',
      received_in_account_id: 'acct-bank',
      amount: 500,
      payment_method: 'UPI',
      reference_number: '146812345678',
      description:
        '[Website Donation] Donation for Cause: Human Rights Protection & Legal Aid | Donor: Kind Supporter | Status: Public/Guest Donor | Source: Donation from Website - NGO General Support | Payment ID: 146812345678',
      attachment_url: null,
      status: 'POSTED',
      accounting_entry_id: 'ae-anon',
      created_at: '2026-10-25T14:30:00Z',
      updated_at: '2026-10-25T14:30:00Z',
      income_account: { id: 'acct-don', account_name: 'Donation Income', account_code: '4003' },
    };

    const classified = classifyReceipt(item);
    expect(classified.sourceKey).toBe('WEBSITE');
    expect(classified.sourceBadgeText).toBe('🌐 Website');
    expect(classified.payerName).toBe('Anonymous Donation from Website');
  });

  it('strictly omits mock contact when description is arbitrary text like "Hsns"', () => {
    const item: ReceiptEntryItem = {
      id: 'rec-3',
      voucher_number: 'REC-20261007-00001',
      receipt_date: '2026-10-07T10:00:00Z',
      received_from: 'Mubasshir Farooqui',
      income_account_id: 'acct-gen',
      received_in_account_id: 'acct-bank',
      amount: 2000,
      payment_method: 'BANK_TRANSFER',
      reference_number: null,
      description: 'Hsns',
      attachment_url: null,
      status: 'POSTED',
      accounting_entry_id: null,
      created_at: '2026-10-07T10:00:00Z',
      updated_at: '2026-10-07T10:00:00Z',
      income_account: { id: 'acct-gen', account_name: 'General Income', account_code: '4009' },
    };

    const classified = classifyReceipt(item);
    expect(classified.category).toBe('OTHER_INCOME');
    expect(classified.payerName).toBe('Mubasshir Farooqui');
    // "Hsns" must NEVER be shown as a contact number or email
    expect(classified.payerContact).toBeNull();
  });

  it('correctly tags cash counter entries as Web App / Office Desk', () => {
    const item: ReceiptEntryItem = {
      id: 'rec-4',
      voucher_number: 'REC-20261026-00099',
      receipt_date: '2026-10-26T10:00:00Z',
      received_from: 'Anonymous Walk-in Donor',
      income_account_id: 'acct-don',
      received_in_account_id: 'acct-cash',
      amount: 250,
      payment_method: 'CASH',
      reference_number: null,
      description: 'Donation received in cash at front desk',
      attachment_url: null,
      status: 'POSTED',
      accounting_entry_id: null,
      created_at: '2026-10-26T10:00:00Z',
      updated_at: '2026-10-26T10:00:00Z',
    };

    const source = determineIncomeSource(item);
    expect(source.key).toBe('WEB_APP');
    expect(source.badgeText).toBe('💻 Web App');
  });

  it('converts technical POSTED status into meaningful Received label', () => {
    const postedBadge = formatVoucherStatusBadge('POSTED');
    expect(postedBadge.label).toBe('Received');
    expect(postedBadge.color).toBe('#059669');

    const cancelledBadge = formatVoucherStatusBadge('CANCELLED');
    expect(cancelledBadge.label).toBe('Cancelled');
    expect(cancelledBadge.color).toBe('#DC2626');
  });
});
