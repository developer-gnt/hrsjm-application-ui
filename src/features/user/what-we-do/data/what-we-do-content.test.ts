import { WHAT_WE_DO_CONTENT } from './what-we-do-content';
import { WHAT_WE_DO_IDS } from '../types/what-we-do.types';

describe('What HRSJM Does page content', () => {
  it('provides the nine stable page IDs and their matching titles', () => {
    expect(Object.keys(WHAT_WE_DO_CONTENT)).toEqual(WHAT_WE_DO_IDS);
    expect(WHAT_WE_DO_IDS.map(id => WHAT_WE_DO_CONTENT[id].title)).toEqual([
      'Human-rights Monitoring',
      'Awareness Campaigns',
      'Workshops & Training',
      'Community Activities',
      'Leadership Development',
      'Advocacy & Awareness',
      'Research & Rights Education',
      'Legal Rights Awareness',
      'Other Work Areas',
    ]);
  });

  it.each(WHAT_WE_DO_IDS)(
    'provides complete sections for %s',
    contentId => {
      const content = WHAT_WE_DO_CONTENT[contentId];

      expect(content.id).toBe(contentId);
      expect(content.heroDescription).toBeTruthy();
      expect(content.heroImage).toBeTruthy();
      expect(content.overview).toBeTruthy();
      expect(content.activities).toHaveLength(4);
      expect(
        content.activities.every(
          activity => activity.title && activity.description && activity.icon,
        ),
      ).toBe(true);
      expect(content.whyItMatters).toBeTruthy();
      expect(content.participationItems).toHaveLength(3);
      expect(content.ctaTitle).toBeTruthy();
      expect(content.ctaButtonLabel).toBeTruthy();
      expect(content.ctaImage).toBeTruthy();
    },
  );
});
