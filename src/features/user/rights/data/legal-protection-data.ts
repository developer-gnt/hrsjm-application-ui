/**
 * Content definitions for the four "Know Your Legal Protections" detail pages.
 *
 * IDs match the stable card IDs used in rights-content.ts:
 *   - constitutional-equality
 *   - protection-violence        (card id in rights-content; we also accept
 *                                 protection-from-violence for navigation)
 *   - workplace-rights
 *   - property-inheritance
 *
 * Content is intentionally general and educational. No fabricated helplines,
 * services or unverified external destinations are included.
 */
import type { IconName } from '../../components/icons';

// ─────────────────────────── Shared Types ────────────────────────────────────

export type LegalProtectionId =
  | 'constitutional-equality'
  | 'protection-violence'
  | 'protection-from-violence' // navigation alias → same page
  | 'workplace-rights'
  | 'property-inheritance';

export interface LegalProtectionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
}

export interface LegalProtectionContent {
  /** Canonical stable ID. */
  id: string;
  /** Page title (displayed in hero). */
  title: string;
  /** Short hero description. */
  description: string;
  /** One-line highlight card heading. */
  highlightHeading: string;
  /** Short highlight card description. */
  highlightDescription: string;
  /** Icon shown in the highlight card. */
  highlightIcon: IconName;
  /** Large hero icon. */
  heroIcon: IconName;
  /** Hero section background tint. */
  heroTint: string;
  /** Page accent colour (underlines, icon colours). */
  accentColor: string;
  /** Light pastel used for icon bubble backgrounds. */
  iconBgColor: string;
  /** Five "Key Protections" rows. */
  protections: LegalProtectionItem[];
}

// ─────────────────────── Page 1 — Constitutional Equality ────────────────────

const constitutionalEquality: LegalProtectionContent = {
  id: 'constitutional-equality',
  title: 'Constitutional\nEquality',
  description:
    'Every person deserves equal treatment, dignity, and protection from discrimination.',
  highlightHeading: 'Equal Rights for All',
  highlightDescription:
    'Explore equality, non-discrimination, and equal protection under applicable law.',
  highlightIcon: 'file-text',
  heroIcon: 'scale',
  heroTint: '#FFF8E8',
  accentColor: '#C9A227',
  iconBgColor: '#FCE9B8',
  protections: [
    {
      id: 'equality-before-law',
      title: 'Equality Before the Law',
      subtitle: 'Learn about equal treatment and protection under the law.',
      icon: 'users',
    },
    {
      id: 'non-discrimination',
      title: 'Non-Discrimination',
      subtitle: 'Explore protections against discrimination and unequal treatment.',
      icon: 'shield-check',
    },
    {
      id: 'equal-opportunities',
      title: 'Equal Opportunities',
      subtitle:
        'Understand equality in access to education, employment, and public services.',
      icon: 'book-open',
    },
    {
      id: 'legal-remedies',
      title: 'Legal Remedies',
      subtitle:
        'Learn about general options for seeking help when rights may have been violated.',
      icon: 'scale',
    },
    {
      id: 'know-your-rights',
      title: 'Know Your Rights',
      subtitle:
        'Explore information about constitutional equality and related rights.',
      icon: 'bulb',
    },
  ],
};

// ─────────────────────── Page 2 — Protection from Violence ───────────────────

const protectionFromViolence: LegalProtectionContent = {
  id: 'protection-violence',
  title: 'Protection from\nViolence',
  description:
    'Learn about protections against violence, harassment, abuse, and exploitation, and discover where to seek help.',
  highlightHeading: 'Safety and Dignity',
  highlightDescription:
    'Explore legal protections and information about support options for people experiencing violence or abuse.',
  highlightIcon: 'shield-check',
  heroIcon: 'shield-check',
  heroTint: '#F3EEFF',
  accentColor: '#7C4DFF',
  iconBgColor: '#E7DFFF',
  protections: [
    {
      id: 'domestic-violence',
      title: 'Domestic Violence Protection',
      subtitle:
        'Learn about protections and general support options relating to domestic violence.',
      icon: 'home',
    },
    {
      id: 'harassment-protection',
      title: 'Protection from Harassment',
      subtitle:
        'Explore information about harassment, personal safety, and available legal protections.',
      icon: 'users',
    },
    {
      id: 'abuse-exploitation',
      title: 'Abuse and Exploitation',
      subtitle:
        'Understand different forms of abuse and where to find reliable information.',
      icon: 'shield-check',
    },
    {
      id: 'support-services',
      title: 'Support Services',
      subtitle:
        'Learn how to look for appropriate guidance, counselling, and legal support.',
      icon: 'heart-hands',
    },
    {
      id: 'get-help-support',
      title: 'Get Help and Support',
      subtitle:
        'Explore safe next steps and verified support resources where available.',
      icon: 'phone',
    },
  ],
};

// ─────────────────────────── Page 3 — Workplace Rights ───────────────────────

const workplaceRights: LegalProtectionContent = {
  id: 'workplace-rights',
  title: 'Workplace Rights',
  description:
    'Explore information about fair treatment, safe working conditions, and equal opportunities at work.',
  highlightHeading: 'Fair and Safe Workplaces',
  highlightDescription:
    'Learn about fair treatment, workplace safety, and protections that may apply to you.',
  highlightIcon: 'briefcase',
  heroIcon: 'briefcase',
  heroTint: '#E9F8F2',
  accentColor: '#00796B',
  iconBgColor: '#D0F0E3',
  protections: [
    {
      id: 'safe-environment',
      title: 'Safe Working Environment',
      subtitle:
        'Explore information about workplace safety and protection from harassment.',
      icon: 'shield-check',
    },
    {
      id: 'equal-opportunities-work',
      title: 'Equal Opportunities',
      subtitle:
        'Learn about fair access to employment and professional development.',
      icon: 'users',
    },
    {
      id: 'fair-treatment',
      title: 'Fair Treatment',
      subtitle:
        'Understand workplace fairness and protections against unlawful discrimination.',
      icon: 'file-text',
    },
    {
      id: 'report-support',
      title: 'Report and Seek Support',
      subtitle:
        'Learn about general ways to raise workplace concerns and seek appropriate assistance.',
      icon: 'message',
    },
    {
      id: 'know-workplace-rights',
      title: 'Know Your Workplace Rights',
      subtitle:
        'Explore information and resources about rights and responsibilities at work.',
      icon: 'briefcase',
    },
  ],
};

// ─────────────────────── Page 4 — Property & Inheritance ─────────────────────

const propertyInheritance: LegalProtectionContent = {
  id: 'property-inheritance',
  title: 'Property &\nInheritance',
  description:
    'Understand property ownership, inheritance, and the importance of informed legal decisions.',
  highlightHeading: 'Your Property Rights',
  highlightDescription:
    'Explore information about property ownership, inheritance, and managing property-related matters.',
  highlightIcon: 'home',
  heroIcon: 'home',
  heroTint: '#FFF0F3',
  accentColor: '#C2185B',
  iconBgColor: '#F9DDE3',
  protections: [
    {
      id: 'right-to-own',
      title: 'Right to Own Property',
      subtitle:
        'Explore general information about property ownership and related rights.',
      icon: 'home',
    },
    {
      id: 'inheritance-rights',
      title: 'Inheritance Rights',
      subtitle:
        'Learn about inheritance and succession, including the importance of applicable personal and property laws.',
      icon: 'users',
    },
    {
      id: 'property-management',
      title: 'Property Management',
      subtitle:
        'Explore information about property documents, transactions, and responsible management.',
      icon: 'file-text',
    },
    {
      id: 'legal-guidance',
      title: 'Legal Guidance',
      subtitle:
        'Learn when professional legal guidance may be helpful for property-related matters.',
      icon: 'scale',
    },
    {
      id: 'learn-property-rights',
      title: 'Learn More About Property Rights',
      subtitle:
        'Explore reliable information and resources about property and inheritance.',
      icon: 'book-open',
    },
  ],
};

// ───────────────────────────── Registry ──────────────────────────────────────

const LEGAL_PROTECTION_MAP: Record<string, LegalProtectionContent> = {
  'constitutional-equality': constitutionalEquality,
  'protection-violence': protectionFromViolence,
  /** Alias accepted from navigation — maps to the same page. */
  'protection-from-violence': protectionFromViolence,
  'workplace-rights': workplaceRights,
  'property-inheritance': propertyInheritance,
};

export const findLegalProtectionById = (
  id: string,
): LegalProtectionContent | undefined => LEGAL_PROTECTION_MAP[id];

export const LEGAL_PROTECTION_IDS = [
  'constitutional-equality',
  'protection-violence',
  'workplace-rights',
  'property-inheritance',
] as const;