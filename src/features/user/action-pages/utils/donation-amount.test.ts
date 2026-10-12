import {
  formatRupees,
  parseCustomDonationAmount,
} from './donation-amount';

describe('donation amount helpers', () => {
  it('accepts positive custom amounts up to two decimal places', () => {
    expect(parseCustomDonationAmount('250')).toBe(250);
    expect(parseCustomDonationAmount('125.50')).toBe(125.5);
  });

  it.each(['', '0', '-25', 'abc', '1.234', '1.2.3'])(
    'rejects invalid custom amount %s',
    value => {
      expect(parseCustomDonationAmount(value)).toBeUndefined();
    },
  );

  it('formats rupee amounts for display', () => {
    expect(formatRupees(1000)).toBe('₹1,000');
  });
});
