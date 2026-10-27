export interface MembershipPostData {
  id: string;
  postName: string;
  qualification: string;
  fee: string;
  feeAmount: number;
  validity: string;
  durationLabel?: string;
  checklistItems: string[];
  kitItems: string[];
  iconType: 'user' | 'community' | 'hierarchy' | 'state' | 'crown' | 'counselor' | 'shield' | 'director' | 'scale' | 'minority' | 'women' | 'political';
  iconBgColor: string;
  buttonVariant: 'navy' | 'green';
}

export const DISTRICT_STATE_POSTS: MembershipPostData[] = [
  {
    id: 'district-active-member',
    postName: 'District Active Member',
    qualification: 'Minimum 8th Class',
    fee: '₹ 800',
    feeAmount: 800,
    validity: '1 Year',
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card & Sticker',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card & Sticker',
    ],
    iconType: 'user',
    iconBgColor: '#EFF6FF',
    buttonVariant: 'green',
  },
  {
    id: 'state-active-member',
    postName: 'State Active Member',
    qualification: 'Minimum 8th Class',
    fee: '₹ 800',
    feeAmount: 800,
    validity: '1 Year',
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card & Sticker',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card & Sticker',
    ],
    iconType: 'community',
    iconBgColor: '#EBF7EE',
    buttonVariant: 'green',
  },
  {
    id: 'district-unit-post',
    postName: 'District Unit Post',
    qualification: 'Minimum 10th Class',
    fee: '₹ 1,300',
    feeAmount: 1300,
    validity: '1 Year',
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card, ID Cover, Lanyard, Sticker & T’ Shirt',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card, ID Cover, Lanyard, Sticker & T’ Shirt',
    ],
    iconType: 'hierarchy',
    iconBgColor: '#EFF6FF',
    buttonVariant: 'green',
  },
  {
    id: 'state-unit-post',
    postName: 'State Unit Post',
    qualification: 'Minimum 10th Class',
    fee: '₹ 2,300',
    feeAmount: 2300,
    validity: '2 Years', // IMPORTANT: 2 Years per specification
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card, ID Cover, Lanyard, Sticker & T’ Shirt',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card, ID Cover, Lanyard, Sticker & T’ Shirt',
    ],
    iconType: 'hierarchy',
    iconBgColor: '#EBF7EE',
    buttonVariant: 'green',
  },
];

export const LETTER_PAD_POSTS: MembershipPostData[] = [
  {
    id: 'lion-of-state',
    postName: 'Lion of State',
    qualification: 'Minimum 12th Pass',
    fee: '₹ 5,000',
    feeAmount: 5000,
    validity: '5 Years',
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card & Sticker',
      'T’ Shirt & Letter Pad',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card & Sticker',
      '4. T’ Shirt & Letter Pad',
    ],
    iconType: 'crown',
    iconBgColor: '#EFF6FF',
    buttonVariant: 'green',
  },
  {
    id: 'counselor-of-state',
    postName: 'Counsellor of State',
    qualification: 'Minimum 12th Pass',
    fee: '₹ 5,000',
    feeAmount: 5000,
    validity: '5 Years',
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card & Sticker',
      'T’ Shirt & Letter Pad',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card & Sticker',
      '4. T’ Shirt & Letter Pad',
    ],
    iconType: 'counselor',
    iconBgColor: '#EBF7EE',
    buttonVariant: 'green',
  },
  {
    id: 'ambassador-of-state',
    postName: 'Ambassador of State',
    qualification: 'Minimum 12th Pass',
    fee: '₹ 5,000',
    feeAmount: 5000,
    validity: '5 Years',
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card & Sticker',
      'T’ Shirt & Letter Pad',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card & Sticker',
      '4. T’ Shirt & Letter Pad',
    ],
    iconType: 'shield',
    iconBgColor: '#EFF6FF',
    buttonVariant: 'green',
  },
  {
    id: 'honble-state-director',
    postName: 'Hon’ble State Director',
    qualification: 'Minimum Graduate / Degree',
    fee: '₹ 10,000',
    feeAmount: 10000,
    validity: '10 Years',
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card & Sticker',
      'T’ Shirt & Letter Pad',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card & Sticker',
      '4. T’ Shirt & Letter Pad',
    ],
    iconType: 'director',
    iconBgColor: '#EBF7EE',
    buttonVariant: 'green',
  },
];

export const NATIONAL_LEVEL_POSTS: MembershipPostData[] = [
  {
    id: 'national-legal-council-cell',
    postName: 'National Legal Council Cell',
    qualification: 'Advocate / Retd. Judge',
    fee: '₹ 10,000',
    feeAmount: 10000,
    validity: '10 Years',
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card & Sticker',
      'T’ Shirt & Letter Pad',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card & Sticker',
      '4. T’ Shirt & Letter Pad',
    ],
    iconType: 'scale',
    iconBgColor: '#EFF6FF',
    buttonVariant: 'green',
  },
  {
    id: 'national-minority-council-cell',
    postName: 'National Minority Council Cell',
    qualification: 'Graduate / Degree (Muslim, Christian, Buddhist, Parsi, Jain & Sikh)',
    fee: '₹ 10,000',
    feeAmount: 10000,
    validity: '10 Years',
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card & Sticker',
      'T’ Shirt & Letter Pad',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card & Sticker',
      '4. T’ Shirt & Letter Pad',
    ],
    iconType: 'minority',
    iconBgColor: '#EBF7EE',
    buttonVariant: 'green',
  },
  {
    id: 'national-women-council-cell',
    postName: 'National Woman Council Cell',
    qualification: 'Graduate / Degree (Only for Women)',
    fee: '₹ 10,000',
    feeAmount: 10000,
    validity: '10 Years',
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card & Sticker',
      'T’ Shirt & Letter Pad',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card & Sticker',
      '4. T’ Shirt & Letter Pad',
    ],
    iconType: 'women',
    iconBgColor: '#EFF6FF',
    buttonVariant: 'green',
  },
  {
    id: 'national-political-council-cell',
    postName: 'National Political Council Cell',
    qualification: 'Graduate / Degree (For Politicians)',
    fee: '₹ 10,000',
    feeAmount: 10000,
    validity: '10 Years',
    checklistItems: [
      'Appointment Letter',
      'Certificate',
      'Identity Card & Sticker',
      'T’ Shirt & Letter Pad',
    ],
    kitItems: [
      '1. Appointment Letter',
      '2. Certificate',
      '3. Identity Card & Sticker',
      '4. T’ Shirt & Letter Pad',
    ],
    iconType: 'political',
    iconBgColor: '#EBF7EE',
    buttonVariant: 'green',
  },
];



