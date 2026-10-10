import type { ImageSourcePropType } from 'react-native';
import { AppRoutes } from '../../../../core/constants/routes';
import {
  AppIconComponent,
  Eye,
  Heart,
  Leaf,
  Scale,
  ShieldCheck,
  Target,
  Users,
  UsersRound,
} from '../../../../core/components/icons';

/**
 * Approved page photography, extracted from the user-supplied image usage
 * guide (exact photos, exact sections) and stored as project assets.
 */
const HERO_BACKGROUND = require('../../../../assets/about/hero-bg.png');
const WHO_WE_ARE_PHOTO = require('../../../../assets/about/who-we-are.png');
const LEADER_1_PHOTO = require('../../../../assets/about/leader-1.png');
const LEADER_2_PHOTO = require('../../../../assets/about/leader-2.png');
const LEADER_3_PHOTO = require('../../../../assets/about/leader-3.png');
const CTA_HANDS_PHOTO = require('../../../../assets/about/cta-hands.png');

/**
 * ============================================================================
 * ABOUT PAGE CONTENT (single source of copy)
 * ============================================================================
 *
 * All wording below is transcribed from the approved high-resolution reference
 * design (About HRSJM, both screens). Nothing is invented; where the reference
 * shows a control whose destination is not defined anywhere in the app, the
 * control is left out (spec: no dead links) and the gap is logged in
 * docs/HRSJM_About_Implementation_Map.md (follow-ups).
 */

export interface AboutValueItem {
  title: string;
  description: string;
  icon: AppIconComponent;
}

export interface AboutLeader {
  name: string;
  role: string;
  /** Portrait asset — none supplied in the repo yet; initials render until then. */
  source?: ImageSourcePropType;
}

export const ABOUT_CONTENT = {
  headerTitle: 'About HRSJM',

  hero: {
    lines: ['People.', 'Rights.', 'Justice.', 'Change.'],
    /** Index of the line rendered in accent gold ("Change."). */
    goldLineIndex: 3,
    caption:
      'Human Rights & Social Justice Mission (HRSJM) works for a fairer, more just and equal society.',
    /**
     * Approved hero visual — fills the whole hero card as its background
     * (navy-to-photo blend baked in); the serif words render on top.
     */
    backgroundSource: HERO_BACKGROUND as ImageSourcePropType,
  },

  whoWeAre: {
    heading: 'Who We Are',
    body: 'Human Rights & Social Justice Mission (HRSJM) is a people-driven organisation dedicated to protecting human rights, promoting social justice and supporting marginalised communities across India.',
    /** Approved thumbnail (right of the copy). */
    imageSource: WHO_WE_ARE_PHOTO as ImageSourcePropType,
    /**
     * "Read More →" per the approved design: expands the approved copy
     * inline (truncated to four lines until tapped; toggles to Read Less).
     */
  },

  belief: {
    heading: 'Our Belief',
    body: 'We believe in a society where every individual, regardless of their background, has equal rights, opportunities and dignity. We stand for justice, compassion and inclusive development.',
    quote:
      'A fairer society is possible when people stand together for human rights and dignity.',
  },

  missionVision: {
    heading: 'Our Mission & Vision',
    mission: {
      title: 'Our Mission',
      body: 'To protect human rights, promote social justice and empower communities through awareness, advocacy, education and support.',
      icon: Target,
    },
    vision: {
      title: 'Our Vision',
      body: 'A fairer, more just and inclusive society where every individual lives with dignity, equality and opportunity.',
      icon: Eye,
    },
  },

  values: {
    heading: 'Our Values & Principles',
    lead: 'Our work is guided by strong values that keep people and justice at the centre of everything we do.',
    items: [
      {
        title: 'Human Dignity',
        description: 'Every individual deserves respect and equal rights.',
        icon: Scale,
      },
      {
        title: 'Equality',
        description:
          'No discrimination based on caste, religion, gender, community or background.',
        icon: Users,
      },
      {
        title: 'Justice',
        description: 'Fairness and accountability for all.',
        icon: ShieldCheck,
      },
      {
        title: 'Inclusivity',
        description: 'Leave no one behind, especially vulnerable communities.',
        icon: Heart,
      },
      {
        title: 'Empowerment',
        description: 'Enable people to know their rights and create change.',
        icon: UsersRound,
      },
      {
        title: 'Service',
        description: 'Work with compassion, integrity and social responsibility.',
        icon: Leaf,
      },
    ] as AboutValueItem[],
  },

  leadership: {
    heading: 'Leadership',
    lead: 'Our leadership team brings diverse experience and a strong commitment to human rights and social justice.',
    /**
     * "View All →" per the approved design: opens the leadership sheet
     * listing every approved member (real, in-page behavior).
     */
    members: [
      { name: 'Dr. A. Rahman', role: 'President', source: LEADER_1_PHOTO },
      { name: 'Adv. Saira Khan', role: 'General Secretary', source: LEADER_2_PHOTO },
      { name: 'Imran Shaikh', role: 'Program Director', source: LEADER_3_PHOTO },
    ] as AboutLeader[],
  },

  cta: {
    heading: 'Together for a More Just Society.',
    body: 'Join hands with HRSJM in our mission to protect rights, empower communities and create a fairer, more inclusive India.',
    buttonLabel: 'Join the Movement',
    /** Approved hands photograph (right side of the card, blended with navy). */
    imageSource: CTA_HANDS_PHOTO as ImageSourcePropType,
    /**
     * Real in-app destination: the Donations module (supporting the movement).
     * Repoint here (route name or https URL) if the approved destination
     * changes; an https value opens in the browser instead.
     */
    route: AppRoutes.DONATIONS,
  },
} as const;
