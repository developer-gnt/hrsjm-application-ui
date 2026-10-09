import type { IconName } from '../../components/icons';

export interface AboutWorkArea {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface AboutPrinciple {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface AboutApproachStep {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface AboutImpactStat {
  id: string;
  value: string;
  label: string;
  icon: IconName;
}

export interface AboutContent {
  hero: {
    eyebrow: string;
    titleLine: string;
    titleAccentLine: string;
    description: string;
    imageAssetName: string;
  };
  principles: AboutPrinciple[];
  workAreas: AboutWorkArea[];
  approach: {
    title: string;
    description: string;
    steps: AboutApproachStep[];
  };
  impact: {
    title: string;
    description: string;
    stats: AboutImpactStat[];
  };
  finalCta: {
    headingLine: string;
    headingAccentLine: string;
    supporting: string;
    buttonLabel: string;
    imageAssetName: string;
  };
}
