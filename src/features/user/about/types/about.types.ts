import type { IconName } from '../../components/icons';

/** One work-area card in the About 3x3 grid. */
export interface AboutWorkArea {
  id: string;
  /** Title as rendered (may contain the reference's manual line break). */
  title: string;
  description: string;
  icon: IconName;
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
  finalCta: {
    headingLine: string;
    headingAccentLine: string;
    supporting: string;
    buttonLabel: string;
    /** Bundled CTA asset under src/assets/images (documentation only). */
    imageAssetName: string;
  };
}
