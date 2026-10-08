import type { IconName } from '../../components/icons';

/** One work-area card in the About 3x3 grid. */
export interface AboutWorkArea {
  id: string;
  /** Title as rendered (may contain the reference's manual line break). */
  title: string;
  description: string;
  icon: IconName;
}

/** Small labelled tile in the What We Do / Key Focus Areas rows. */
export interface AboutTile {
  id: string;
  /** Label as rendered (may contain the reference's manual line break). */
  label: string;
  icon: IconName;
}

/** One statistic in the Impact row. */
export interface AboutImpactStat {
  id: string;
  /** Preformatted value, e.g. '2,000+'. */
  value: string;
  label: string;
  icon: IconName;
}

/** Title + optional description + a 4-column row of labelled tiles. */
export interface AboutInfoBlock {
  title: string;
  description?: string;
  tiles: AboutTile[];
}

/** Title + a 3-column row of impact statistics. */
export interface AboutImpactBlock {
  title: string;
  stats: AboutImpactStat[];
}

/**
 * Static content model for the About page (UI phase — no backend endpoint
 * is invented; content becomes dynamic in the integration phase).
 */
export interface AboutContent {
  hero: {
    titleLine: string;
    titleAccentLine: string;
    description: string;
    /** Bundled hero asset under src/assets/images (documentation only). */
    imageAssetName: string;
  };
  workAreas: AboutWorkArea[];
  /** Full-bleed monitor banner between the grid and What We Do. */
  monitorBanner: {
    title: string;
    description: string;
    /** Bundled banner asset under src/assets/images (documentation only). */
    imageAssetName: string;
  };
  whatWeDo: AboutInfoBlock;
  focusAreas: AboutInfoBlock;
  impact: AboutImpactBlock;
  finalCta: {
    headingLine: string;
    headingAccentLine: string;
    supporting: string;
    buttonLabel: string;
    /** Bundled CTA asset under src/assets/images (documentation only). */
    imageAssetName: string;
  };
}
