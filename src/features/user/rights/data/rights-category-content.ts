/**
 * Content definitions for the six Women's Rights key-area detail pages.
 *
 * Each category contains a stable ID, hero metadata, a list of five resource
 * rows and a call-to-action configuration. Content is intentionally general
 * and educational. No fabricated helplines, services, or unverified external
 * destinations are included.
 *
 * Action types:
 *   - 'navigate': routes to an existing in-app screen (e.g. file-complaint)
 *   - 'info': shows a general informational alert (coming soon)
 */
import type { IconName } from '../../components/icons';

export type RightsCategoryId =
  | 'safety-protection'
  | 'education'
  | 'employment-equal-pay'
  | 'healthcare'
  | 'legal-rights'
  | 'participation';

export type ResourceActionType = 'navigate' | 'info';

export interface RightsCategoryResource {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  actionType: ResourceActionType;
  /** For actionType 'navigate' — the in-app route to open. */
  navigateTo?: 'file-complaint' | 'user-help' | 'contact' | 'user-events';
}

export interface RightsCategoryCtaConfig {
  label: string;
  actionType: ResourceActionType;
  navigateTo?: 'file-complaint' | 'user-help' | 'contact' | 'user-events';
}

export interface RightsCategoryContent {
  id: RightsCategoryId;
  title: string;
  subtitle: string;
  /** Background tint for the hero gradient when no image is present. */
  heroTint: string;
  /** Icon displayed in the hero section. */
  heroIcon: IconName;
  /** Category accent colour for icon bubbles and visual treatment. */
  accentColor: string;
  /** Lighter tint used for icon backgrounds. */
  iconBgColor: string;
  resources: RightsCategoryResource[];
  cta: RightsCategoryCtaConfig;
}

const safetyProtection: RightsCategoryContent = {
  id: 'safety-protection',
  title: 'Safety & Protection',
  subtitle: 'Freedom from violence, harassment and exploitation.',
  heroTint: '#FCE4EC',
  heroIcon: 'shield-check',
  accentColor: '#C2185B',
  iconBgColor: '#FCE4EC',
  resources: [
    {
      id: 'domestic-violence',
      title: 'Domestic Violence Support',
      subtitle: 'Help and information for people experiencing domestic violence.',
      icon: 'heart-hands',
      actionType: 'info',
    },
    {
      id: 'workplace-harassment',
      title: 'Workplace Harassment',
      subtitle: 'Information about workplace harassment and reporting channels.',
      icon: 'briefcase',
      actionType: 'info',
    },
    {
      id: 'online-safety',
      title: 'Online Safety',
      subtitle: 'Guidance for safer participation in digital spaces.',
      icon: 'shield-check',
      actionType: 'info',
    },
    {
      id: 'emergency-helplines',
      title: 'Emergency Helplines',
      subtitle: 'Verified emergency contact information and helplines.',
      icon: 'phone',
      actionType: 'info',
    },
    {
      id: 'awareness-resources',
      title: 'Awareness & Resources',
      subtitle: 'Educational resources about personal safety and rights.',
      icon: 'book-open',
      actionType: 'info',
    },
  ],
  cta: {
    label: 'Need Immediate Help?',
    actionType: 'navigate',
    navigateTo: 'user-help',
  },
};

const education: RightsCategoryContent = {
  id: 'education',
  title: 'Education',
  subtitle: 'Equal access to quality education and skill development.',
  heroTint: '#E3F2FD',
  heroIcon: 'book-open',
  accentColor: '#1565C0',
  iconBgColor: '#DBEAFE',
  resources: [
    {
      id: 'primary-secondary',
      title: 'Primary & Secondary Education',
      subtitle: 'Information about access to school education.',
      icon: 'graduation-cap',
      actionType: 'info',
    },
    {
      id: 'higher-education',
      title: 'Higher Education',
      subtitle: 'Information about further education opportunities.',
      icon: 'book-open',
      actionType: 'info',
    },
    {
      id: 'skill-development',
      title: 'Skill Development',
      subtitle: 'Vocational training and digital skills resources.',
      icon: 'bulb',
      actionType: 'info',
    },
    {
      id: 'adult-literacy',
      title: 'Adult Literacy',
      subtitle: 'Learning opportunities for adults.',
      icon: 'file-text',
      actionType: 'info',
    },
    {
      id: 'educational-schemes',
      title: 'Educational Schemes',
      subtitle: 'Government education schemes and support information.',
      icon: 'doc-search',
      actionType: 'info',
    },
  ],
  cta: {
    label: 'Find Education Schemes',
    actionType: 'info',
  },
};

const employmentEqualPay: RightsCategoryContent = {
  id: 'employment-equal-pay',
  title: 'Employment & Equal Pay',
  subtitle: 'Fair work opportunities and equal wages.',
  heroTint: '#FFF8E1',
  heroIcon: 'briefcase',
  accentColor: '#E65100',
  iconBgColor: '#FFF3E0',
  resources: [
    {
      id: 'job-opportunities',
      title: 'Job Opportunities',
      subtitle: 'Information about employment resources and job portals.',
      icon: 'briefcase',
      actionType: 'info',
    },
    {
      id: 'equal-pay-rights',
      title: 'Equal Pay Rights',
      subtitle: 'Educational information about equal remuneration at the workplace.',
      icon: 'scale',
      actionType: 'info',
    },
    {
      id: 'workplace-policies',
      title: 'Workplace Policies',
      subtitle: 'Information about fair and safe workplace practices.',
      icon: 'file-text',
      actionType: 'info',
    },
    {
      id: 'entrepreneurship-support',
      title: 'Entrepreneurship Support',
      subtitle: 'Information about resources for women entrepreneurs.',
      icon: 'bulb',
      actionType: 'info',
    },
    {
      id: 'career-growth',
      title: 'Skill & Career Growth',
      subtitle: 'Training and career development resources.',
      icon: 'graduation-cap',
      actionType: 'info',
    },
  ],
  cta: {
    label: 'Explore Job Opportunities',
    actionType: 'info',
  },
};

const healthcare: RightsCategoryContent = {
  id: 'healthcare',
  title: 'Healthcare',
  subtitle: 'Access to quality healthcare and reproductive rights.',
  heroTint: '#E0F7FA',
  heroIcon: 'heart-pulse',
  accentColor: '#00695C',
  iconBgColor: '#D0F0E3',
  resources: [
    {
      id: 'general-healthcare',
      title: 'General Healthcare',
      subtitle: 'General physical and mental well-being information.',
      icon: 'heart-pulse',
      actionType: 'info',
    },
    {
      id: 'reproductive-health',
      title: 'Reproductive Health',
      subtitle: 'General educational information about reproductive health.',
      icon: 'heart',
      actionType: 'info',
    },
    {
      id: 'nutrition-wellness',
      title: 'Nutrition & Wellness',
      subtitle: 'General information about healthy living.',
      icon: 'bulb',
      actionType: 'info',
    },
    {
      id: 'menstrual-health',
      title: 'Menstrual Health',
      subtitle: 'Awareness and educational resources.',
      icon: 'ear',
      actionType: 'info',
    },
    {
      id: 'healthcare-schemes',
      title: 'Healthcare Schemes',
      subtitle: 'Information about verified public healthcare programmes.',
      icon: 'doc-search',
      actionType: 'info',
    },
  ],
  cta: {
    label: 'Find Nearby Healthcare',
    actionType: 'info',
  },
};

const legalRights: RightsCategoryContent = {
  id: 'legal-rights',
  title: 'Legal Rights',
  subtitle: 'Equal treatment and access to justice.',
  heroTint: '#EDE7F6',
  heroIcon: 'scale',
  accentColor: '#4527A0',
  iconBgColor: '#E7DFFF',
  resources: [
    {
      id: 'know-your-rights',
      title: 'Know Your Rights',
      subtitle: 'Educational information about legal and constitutional rights.',
      icon: 'file-text',
      actionType: 'info',
    },
    {
      id: 'legal-aid',
      title: 'Legal Aid & Support',
      subtitle: 'Information about verified legal-aid services.',
      icon: 'scale',
      actionType: 'info',
    },
    {
      id: 'file-complaint',
      title: 'File a Complaint',
      subtitle: 'Use the HRSJM complaint flow to report a rights violation.',
      icon: 'doc-search',
      actionType: 'navigate',
      navigateTo: 'file-complaint',
    },
    {
      id: 'important-laws',
      title: 'Important Laws',
      subtitle: 'Educational summaries of relevant laws protecting women.',
      icon: 'book-open',
      actionType: 'info',
    },
    {
      id: 'legal-resources',
      title: 'Legal Resources',
      subtitle: 'Verified documents, official resources and contacts.',
      icon: 'download',
      actionType: 'info',
    },
  ],
  cta: {
    label: 'Need Legal Assistance?',
    actionType: 'navigate',
    navigateTo: 'user-help',
  },
};

const participation: RightsCategoryContent = {
  id: 'participation',
  title: 'Participation',
  subtitle: 'Representation in decision-making at all levels.',
  heroTint: '#FFF0F5',
  heroIcon: 'users',
  accentColor: '#AD1457',
  iconBgColor: '#F9DDE3',
  resources: [
    {
      id: 'political-participation',
      title: 'Political Participation',
      subtitle: 'Information about civic participation and representation.',
      icon: 'megaphone',
      actionType: 'info',
    },
    {
      id: 'community-involvement',
      title: 'Community Involvement',
      subtitle: 'Opportunities to participate in community initiatives.',
      icon: 'users',
      actionType: 'navigate',
      navigateTo: 'user-events',
    },
    {
      id: 'voices-advocacy',
      title: 'Voices & Advocacy',
      subtitle: 'Information about raising awareness and supporting positive change.',
      icon: 'heart-hands',
      actionType: 'info',
    },
    {
      id: 'leadership-programs',
      title: 'Leadership Programs',
      subtitle: 'Information about leadership development resources.',
      icon: 'medal',
      actionType: 'info',
    },
    {
      id: 'success-stories',
      title: 'Success Stories',
      subtitle: 'Inspiring examples of women making a difference.',
      icon: 'star',
      actionType: 'info',
    },
  ],
  cta: {
    label: 'Get Involved',
    actionType: 'navigate',
    navigateTo: 'user-events',
  },
};

export const RIGHTS_CATEGORIES: Record<RightsCategoryId, RightsCategoryContent> =
  {
    'safety-protection': safetyProtection,
    education,
    'employment-equal-pay': employmentEqualPay,
    healthcare,
    'legal-rights': legalRights,
    participation,
  };

export const findCategoryById = (
  id: string,
): RightsCategoryContent | undefined =>
  RIGHTS_CATEGORIES[id as RightsCategoryId];
