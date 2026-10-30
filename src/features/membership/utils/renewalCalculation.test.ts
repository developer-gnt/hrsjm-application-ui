import { calculateRenewalQuoteClientSide } from './renewalCalculation';

describe('calculateRenewalQuoteClientSide 30-day renewal validation', () => {
  it('prevents renewal when more than 30 days remain until expiry', () => {
    const asOf = new Date('2026-05-01');
    const expiry = new Date('2026-06-15'); // 45 days remaining

    const quote = calculateRenewalQuoteClientSide({
      currentExpiry: expiry.toISOString(),
      asOfDate: asOf,
    });

    expect(quote.days_remaining).toBe(45);
    expect(quote.is_eligible_for_renewal).toBe(false);
    expect(quote.renewal_validation_message).toBe(
      'Membership renewal is allowed only within 30 days before the expiry date.'
    );
  });

  it('allows renewal automatically when within 30 days before expiry', () => {
    const asOf = new Date('2026-05-20');
    const expiry = new Date('2026-06-15'); // 26 days remaining

    const quote = calculateRenewalQuoteClientSide({
      currentExpiry: expiry.toISOString(),
      asOfDate: asOf,
    });

    expect(quote.days_remaining).toBe(26);
    expect(quote.is_eligible_for_renewal).toBe(true);
    expect(quote.renewal_validation_message).toBeUndefined();
  });

  it('allows renewal when membership is already expired or overdue', () => {
    const asOf = new Date('2026-06-20');
    const expiry = new Date('2026-06-15'); // 5 days overdue

    const quote = calculateRenewalQuoteClientSide({
      currentExpiry: expiry.toISOString(),
      asOfDate: asOf,
    });

    expect(quote.is_overdue).toBe(true);
    expect(quote.is_eligible_for_renewal).toBe(true);
    expect(quote.renewal_validation_message).toBeUndefined();
  });
});
