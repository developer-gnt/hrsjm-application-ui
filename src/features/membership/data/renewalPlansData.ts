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
    badge: 'Most Popular',
    themeColor: '#EA580C',
  },
  {
    id: '2-year',
    label: '2nd Year Renewal Fees',
    duration: 'For 2 Years',
    yearNumber: '2nd',
    price: '₹ 400',
    priceAmount: 400,
    badge: 'Save ₹ 100',
    themeColor: '#16A34A',
  },
  {
    id: '3-year',
    label: '3rd Year Renewal Fees',
    duration: 'For 3 Years',
    yearNumber: '3rd',
    price: '₹ 300',
    priceAmount: 300,
    badge: 'Save ₹ 200',
    themeColor: '#6366F1',
  },
];
