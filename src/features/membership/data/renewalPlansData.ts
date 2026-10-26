export interface RenewalPlanOption {
  id: string;
  label: string;
  duration: string;
  yearNumber: string;
  price: string;
  priceAmount: number;
  badge: string;
  themeColor: string;
}

export const RENEWAL_PLANS: RenewalPlanOption[] = [
  {
    id: '1-year',
    label: '1st Year Renewal Fees',
    duration: 'For 1 Year',
    yearNumber: '1st',
    price: '₹ 500',
    priceAmount: 500,
    badge: '1st Renewal',
    themeColor: '#EA580C',
  },
  {
    id: '2-year',
    label: '2nd Year Renewal Fees',
    duration: 'For 1 Year',
    yearNumber: '2nd',
    price: '₹ 400',
    priceAmount: 400,
    badge: 'Save ₹ 100',
    themeColor: '#16A34A',
  },
  {
    id: '3-year',
    label: '3rd Year Renewal Fees',
    duration: 'For 1 Year',
    yearNumber: '3rd',
    price: '₹ 300',
    priceAmount: 300,
    badge: 'Save ₹ 200',
    themeColor: '#6366F1',
  },
];

/**
 * Returns only the single applicable renewal plan for the member's next renewal sequence.
 * - Sequence 1: 1st Year Renewal Fees (₹500)
 * - Sequence 2: 2nd Year Renewal Fees (₹400)
 * - Sequence 3: 3rd Year Renewal Fees (₹300)
 * - Sequence 4+: Annual Renewal Fees (₹300)
 */
export function getDynamicRenewalPlan(sequenceNumber: number): RenewalPlanOption {
  const seq = Math.max(1, Math.floor(sequenceNumber || 1));
  if (seq === 1) {
    return {
      id: 'renewal-seq-1',
      label: '1st Year Renewal Fees',
      duration: 'For 1 Year',
      yearNumber: '1st',
      price: '₹ 500',
      priceAmount: 500,
      badge: '1st Renewal',
      themeColor: '#EA580C',
    };
  }
  if (seq === 2) {
    return {
      id: 'renewal-seq-2',
      label: '2nd Year Renewal Fees',
      duration: 'For 1 Year',
      yearNumber: '2nd',
      price: '₹ 400',
      priceAmount: 400,
      badge: 'Save ₹ 100',
      themeColor: '#16A34A',
    };
  }
  if (seq === 3) {
    return {
      id: 'renewal-seq-3',
      label: '3rd Year Renewal Fees',
      duration: 'For 1 Year',
      yearNumber: '3rd',
      price: '₹ 300',
      priceAmount: 300,
      badge: 'Save ₹ 200',
      themeColor: '#6366F1',
    };
  }
  const suffix = seq === 4 ? '4th' : seq === 5 ? '5th' : `${seq}th`;
  return {
    id: `renewal-seq-${seq}`,
    label: 'Annual Renewal Fees',
    duration: 'For 1 Year',
    yearNumber: suffix,
    price: '₹ 300',
    priceAmount: 300,
    badge: 'Fixed ₹ 300 Rate',
    themeColor: '#0284C7',
  };
}

