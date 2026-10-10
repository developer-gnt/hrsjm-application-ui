import type { WhatWeDoContent, WhatWeDoId } from '../types/what-we-do.types';

const COMMUNITY_IMAGE = require('../../../../assets/images/about-hero-community.png');
const SOLIDARITY_IMAGE = require('../../../../assets/images/contact-cta-hands.jpg');
const ORGANIZATION_IMAGE = require('../../../../assets/images/contact-hero-building.jpg');
const HOME_IMAGE = require('../../../../assets/images/hero-home.webp');

export const WHAT_WE_DO_CONTENT: Record<WhatWeDoId, WhatWeDoContent> = {
  'human-rights-monitoring': {
    id: 'human-rights-monitoring',
    title: 'Human-rights Monitoring',
    heroDescription:
      'Tracking violations, documenting concerns and helping communities access accountability and support.',
    heroImage: ORGANIZATION_IMAGE,
    overview:
      'We monitor rights conditions, document incidents and help communities understand where protections are being denied or overlooked.',
    activities: [
      {
        title: 'Field Monitoring',
        description: 'Observe conditions and gather evidence in affected communities.',
        icon: 'eye',
      },
      {
        title: 'Case Documentation',
        description: 'Record incidents, timelines and human-rights patterns.',
        icon: 'file-text',
      },
      {
        title: 'Fact-Finding',
        description: 'Identify risks, patterns and vulnerable protection gaps.',
        icon: 'doc-search',
      },
      {
        title: 'Community Reporting',
        description: 'Support local reporting and response pathways for affected people.',
        icon: 'megaphone',
      },
    ],
    whyItMatters:
      'Monitoring helps expose rights abuses early, strengthens accountability and informs the support communities deserve.',
    whyIcon: 'shield-check',
    participationItems: [
      { text: 'Share verified concerns through the right reporting channels.', icon: 'message' },
      { text: 'Report incidents to trusted local and community networks.', icon: 'users' },
      { text: 'Support evidence-based advocacy and response efforts.', icon: 'scale' },
    ],
    ctaTitle: 'Explore Monitoring',
    ctaButtonLabel: 'Learn More',
    ctaImage: COMMUNITY_IMAGE,
    ctaDestination: 'contact',
  },
  'awareness-campaigns': {
    id: 'awareness-campaigns',
    title: 'Awareness Campaigns',
    heroDescription:
      'Building awareness of human rights, equality and social justice through community education and public engagement.',
    heroImage: COMMUNITY_IMAGE,
    overview:
      'We conduct awareness initiatives to help people understand their rights, available support and ways to participate in social change.',
    activities: [
      {
        title: 'Rights Awareness Drives',
        description: 'Community sessions and public outreach on key rights issues.',
        icon: 'megaphone',
      },
      {
        title: 'Community Outreach',
        description: 'Engage with local communities and identify priority needs.',
        icon: 'users',
      },
      {
        title: 'Public Education',
        description: 'Educational materials and campaigns for wider understanding.',
        icon: 'file-text',
      },
      {
        title: 'Digital Awareness',
        description: 'Use online channels to share trusted information and resources.',
        icon: 'globe',
      },
    ],
    whyItMatters:
      'Awareness helps people recognise rights concerns, find relevant information and make informed decisions about support and action.',
    whyIcon: 'shield-check',
    participationItems: [
      { text: 'Attend awareness sessions in your area.', icon: 'users' },
      { text: 'Share verified educational resources with others.', icon: 'globe' },
      { text: 'Volunteer for approved outreach activities.', icon: 'handshake' },
    ],
    ctaTitle: 'Help Spread Awareness',
    ctaButtonLabel: 'Join the Movement',
    ctaImage: SOLIDARITY_IMAGE,
    ctaDestination: 'contact',
  },
  'workshops-training': {
    id: 'workshops-training',
    title: 'Workshops & Training',
    heroDescription:
      'Creating opportunities to learn, develop practical skills and strengthen community participation.',
    heroImage: COMMUNITY_IMAGE,
    overview:
      'Our workshops and training sessions provide opportunities for rights education, skill-building and constructive community engagement.',
    activities: [
      {
        title: 'Human Rights Workshops',
        description: 'Sessions on rights, laws and social issues.',
        icon: 'users',
      },
      {
        title: 'Community Training',
        description: 'Skill-building for stronger, better-informed communities.',
        icon: 'graduation-cap',
      },
      {
        title: 'Youth Leadership',
        description: 'Develop young people as community leaders and advocates.',
        icon: 'medal',
      },
      {
        title: 'Awareness Sessions',
        description: 'Interactive learning and practical discussion for action.',
        icon: 'book-open',
      },
    ],
    whyItMatters:
      'Learning can help people understand rights, build confidence and participate more effectively in their communities.',
    whyIcon: 'bulb',
    participationItems: [
      { text: 'Join relevant learning sessions and community training.', icon: 'book-open' },
      { text: 'Participate in approved training programmes.', icon: 'graduation-cap' },
      { text: 'Share learning opportunities with your community.', icon: 'users' },
    ],
    ctaTitle: 'Learn and Participate',
    ctaButtonLabel: 'Get Involved',
    ctaImage: COMMUNITY_IMAGE,
    ctaDestination: 'contact',
  },
  'community-activities': {
    id: 'community-activities',
    title: 'Community Activities',
    heroDescription:
      'Encouraging local participation, community engagement and initiatives that respond to people’s needs.',
    heroImage: COMMUNITY_IMAGE,
    overview:
      'We support community engagement that encourages local participation, helps people connect and creates opportunities to address community needs.',
    activities: [
      {
        title: 'Community Outreach',
        description: 'Engage with local communities and identify practical needs.',
        icon: 'users',
      },
      {
        title: 'Local Initiatives',
        description: 'Support neighbourhood participation and local action.',
        icon: 'map-pin',
      },
      {
        title: 'Volunteer Participation',
        description: 'Create accessible opportunities for people to contribute.',
        icon: 'heart-hands',
      },
      {
        title: 'Community Support',
        description: 'Collaborate on needs-based initiatives with trusted partners.',
        icon: 'handshake',
      },
    ],
    whyItMatters:
      'Community participation helps people connect, share concerns and work together on local priorities that improve daily life.',
    whyIcon: 'users',
    participationItems: [
      { text: 'Participate in approved community activities.', icon: 'users' },
      { text: 'Explore existing volunteer opportunities.', icon: 'heart-hands' },
      { text: 'Contact HRSJM through trusted channels for information.', icon: 'message' },
    ],
    ctaTitle: 'Join the Community',
    ctaButtonLabel: 'Get Involved',
    ctaImage: SOLIDARITY_IMAGE,
    ctaDestination: 'contact',
  },
  'leadership-development': {
    id: 'leadership-development',
    title: 'Leadership Development',
    heroDescription:
      'Empowering youth and community leaders with the confidence, skills and knowledge to act for positive change.',
    heroImage: COMMUNITY_IMAGE,
    overview:
      'We build leadership capacities through mentoring, training and practical opportunities that help people guide and support their communities.',
    activities: [
      {
        title: 'Youth Leadership',
        description: 'Grow confidence and advocacy skills among young people.',
        icon: 'medal',
      },
      {
        title: 'Skill Development',
        description: 'Strengthen public speaking, organising and community action.',
        icon: 'briefcase',
      },
      {
        title: 'Peer Learning',
        description: 'Create spaces for shared experiences and mutual support.',
        icon: 'users',
      },
      {
        title: 'Community Representation',
        description: 'Support emerging leaders to speak for local concerns.',
        icon: 'megaphone',
      },
    ],
    whyItMatters:
      'Strong community leadership creates more resilient, informed and active societies able to address shared challenges together.',
    whyIcon: 'graduation-cap',
    participationItems: [
      { text: 'Join community leadership initiatives and learning spaces.', icon: 'users' },
      { text: 'Take part in mentoring and peer-learning opportunities.', icon: 'graduation-cap' },
      { text: 'Support the leadership development of young community members.', icon: 'heart-hands' },
    ],
    ctaTitle: 'Explore Leadership',
    ctaButtonLabel: 'Learn More',
    ctaImage: COMMUNITY_IMAGE,
    ctaDestination: 'contact',
  },
  'advocacy-awareness': {
    id: 'advocacy-awareness',
    title: 'Advocacy & Awareness',
    heroDescription:
      'Promoting informed dialogue, public awareness and constructive engagement with institutions and community stakeholders.',
    heroImage: SOLIDARITY_IMAGE,
    overview:
      'Our advocacy and awareness work helps bring human-rights concerns into public conversation and informs decision-makers about issues affecting communities.',
    activities: [
      {
        title: 'Rights Awareness',
        description: 'Share reliable information and practical guidance with communities.',
        icon: 'megaphone',
      },
      {
        title: 'Institutional Engagement',
        description: 'Build constructive dialogue with relevant stakeholders.',
        icon: 'briefcase',
      },
      {
        title: 'Public Advocacy',
        description: 'Support campaigns and messages that strengthen accountability.',
        icon: 'scale',
      },
      {
        title: 'Community Information',
        description: 'Provide updates on rights, services and pathways to action.',
        icon: 'file-text',
      },
    ],
    whyItMatters:
      'Advocacy transforms awareness into action, helping communities inform institutions and strengthen rights protection.',
    whyIcon: 'megaphone',
    participationItems: [
      { text: 'Learn about relevant rights issues and community campaigns.', icon: 'book-open' },
      { text: 'Speak up through trusted community and advocacy channels.', icon: 'users' },
      { text: 'Support dialogue with institutions and decision-makers.', icon: 'scale' },
    ],
    ctaTitle: 'Explore Advocacy',
    ctaButtonLabel: 'Get Involved',
    ctaImage: SOLIDARITY_IMAGE,
    ctaDestination: 'contact',
  },
  'research-rights-education': {
    id: 'research-rights-education',
    title: 'Research & Rights Education',
    heroDescription:
      'Supporting informed action through research, documentation and accessible human-rights education resources.',
    heroImage: ORGANIZATION_IMAGE,
    overview:
      'We produce knowledge resources that help people understand rights, learn from evidence and better respond to social and legal challenges.',
    activities: [
      {
        title: 'Rights Education',
        description: 'Simplify rights concepts and help communities understand their protections.',
        icon: 'book-open',
      },
      {
        title: 'Research & Documentation',
        description: 'Collect and analyse evidence on rights issues and community trends.',
        icon: 'doc-search',
      },
      {
        title: 'Learning Resources',
        description: 'Create guides and educational materials for public use.',
        icon: 'file-text',
      },
      {
        title: 'Reports & Publications',
        description: 'Publish findings that inform action, policy and awareness.',
        icon: 'briefcase',
      },
    ],
    whyItMatters:
      'Reliable information helps people better understand social issues, access support and respond with confidence and clarity.',
    whyIcon: 'doc-search',
    participationItems: [
      { text: 'Explore available learning resources and publications.', icon: 'book-open' },
      { text: 'Read approved reports and educational materials.', icon: 'file-text' },
      { text: 'Share information through trusted HRSJM channels and networks.', icon: 'users' },
    ],
    ctaTitle: 'Explore Rights Education',
    ctaButtonLabel: 'Learn More',
    ctaImage: HOME_IMAGE,
    ctaDestination: 'rights',
  },
  'legal-rights-awareness': {
    id: 'legal-rights-awareness',
    title: 'Legal Rights Awareness',
    heroDescription:
      'Helping people understand legal rights, remedies and support pathways in accessible, practical ways.',
    heroImage: ORGANIZATION_IMAGE,
    overview:
      'We provide legal rights information and guidance to help individuals understand their protections, responsibilities and available support.',
    activities: [
      {
        title: 'Legal Rights Information',
        description: 'Share practical knowledge about rights and legal protections.',
        icon: 'scale',
      },
      {
        title: 'Rights & Remedies',
        description: 'Explain options for recourse, support and safe action.',
        icon: 'shield-check',
      },
      {
        title: 'Referral Support',
        description: 'Connect people with trusted resources and local support.',
        icon: 'users',
      },
      {
        title: 'Legal Resources',
        description: 'Provide accessible guidance and information to help people navigate systems.',
        icon: 'file-text',
      },
    ],
    whyItMatters:
      'When people understand their legal rights and support pathways, they are better prepared to protect themselves, seek help and make informed decisions.',
    whyIcon: 'scale',
    participationItems: [
      { text: 'Access approved legal information and guidance resources.', icon: 'file-text' },
      { text: 'Understand your rights and available remedies.', icon: 'scale' },
      { text: 'Seek trusted support through established referral pathways.', icon: 'users' },
    ],
    ctaTitle: 'Explore Legal Rights',
    ctaButtonLabel: 'Learn More',
    ctaImage: HOME_IMAGE,
    ctaDestination: 'rights',
  },
  'other-work-areas': {
    id: 'other-work-areas',
    title: 'Other Work Areas',
    heroDescription:
      'Supporting broader community wellbeing through education, health, welfare and related public-interest work.',
    heroImage: SOLIDARITY_IMAGE,
    overview:
      'Beyond core rights work, we also contribute to related areas such as education, healthcare, welfare and community well-being that impact everyday life.',
    activities: [
      {
        title: 'Education Support',
        description: 'Promote access to learning and public awareness resources.',
        icon: 'book-open',
      },
      {
        title: 'Healthcare Information',
        description: 'Raise awareness of health-related rights and support.',
        icon: 'heart-pulse',
      },
      {
        title: 'Women & Child Welfare',
        description: 'Support community wellbeing and protection for vulnerable groups.',
        icon: 'heart-hands',
      },
      {
        title: 'Community Welfare',
        description: 'Build supportive systems that strengthen everyday life.',
        icon: 'users',
      },
    ],
    whyItMatters:
      'A strong community depends on interconnected support systems that protect dignity, health, education and wellbeing for all.',
    whyIcon: 'heart',
    participationItems: [
      { text: 'Learn about related community support initiatives.', icon: 'book-open' },
      { text: 'Support welfare and awareness activities in your community.', icon: 'users' },
      { text: 'Connect with HRSJM for collaborative community action.', icon: 'handshake' },
    ],
    ctaTitle: 'Explore Our Work',
    ctaButtonLabel: 'Get Involved',
    ctaImage: SOLIDARITY_IMAGE,
    ctaDestination: 'contact',
  },
};

export const getWhatWeDoContent = (
  contentId: WhatWeDoId,
): WhatWeDoContent => WHAT_WE_DO_CONTENT[contentId];
