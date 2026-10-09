export interface RenewalEligibilityRow {
  id: string;
  ifYouJoin: string;
  qualification: string;
  freeRenewal: string;
  iconType: 'district' | 'state' | 'lion' | 'director' | 'council';
  iconBgColor: string;
  iconColor: string;
}

export const RENEWAL_ELIGIBILITY_ROWS: RenewalEligibilityRow[] = [
  {
    id: 'row-district',
    ifYouJoin: '1 persons in District Unit',
    qualification: '10 TH',
    freeRenewal: '1 Year',
    iconType: 'district',
    iconBgColor: '#EFF6FF',
    iconColor: '#1E40AF',
  },
  {
    id: 'row-state',
    ifYouJoin: '1 person in State Unit',
    qualification: '10 TH',
    freeRenewal: '2 Years',
    iconType: 'state',
    iconBgColor: '#EBF7EE',
    iconColor: '#059669',
  },
  {
    id: 'row-lion',
    ifYouJoin: '1 person in (Lion, Counselor or Ambassador of State)',
    qualification: '12 TH',
    freeRenewal: '3 Years',
    iconType: 'lion',
    iconBgColor: '#FFF7ED',
    iconColor: '#EA580C',
  },
  {
    id: 'row-director',
    ifYouJoin: "1 person in Hon'ble State Director",
    qualification: 'GRADUATES',
    freeRenewal: '4 Years',
    iconType: 'director',
    iconBgColor: '#F5F3FF',
    iconColor: '#7C3AED',
  },
  {
    id: 'row-council',
    ifYouJoin: 'National Council Cell\n(Lawyers, Women or Minority)',
    qualification: 'GRADUATES',
    freeRenewal: '5 Years',
    iconType: 'council',
    iconBgColor: '#F0FDFA',
    iconColor: '#0D9488',
  },
];
