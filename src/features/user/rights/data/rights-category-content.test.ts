/**
 * Tests for the six Women's Rights category content definitions and their
 * route/navigation mappings.
 *
 * Verifies:
 *   1. All six expected category IDs are defined.
 *   2. Each category has exactly 5 resource rows.
 *   3. Every resource row has a valid icon name registered in the glyph set.
 *   4. Navigate actions reference valid in-app destinations.
 *   5. findCategoryById returns the correct object / undefined for unknown IDs.
 */

import {
  findCategoryById,
  RIGHTS_CATEGORIES,
} from '../data/rights-category-content';
import type { RightsCategoryId } from '../data/rights-category-content';
import { GLYPHS } from '../../components/icons/glyphs';

const EXPECTED_IDS: RightsCategoryId[] = [
  'safety-protection',
  'education',
  'employment-equal-pay',
  'healthcare',
  'legal-rights',
  'participation',
];

const VALID_NAVIGATE_TARGETS = [
  'file-complaint',
  'user-help',
  'contact',
  'user-events',
] as const;

describe('RIGHTS_CATEGORIES data', () => {
  test('contains exactly the six expected category IDs', () => {
    const keys = Object.keys(RIGHTS_CATEGORIES);
    expect(keys).toHaveLength(6);
    EXPECTED_IDS.forEach(id => expect(keys).toContain(id));
  });

  EXPECTED_IDS.forEach(id => {
    describe(`category: ${id}`, () => {
      const category = RIGHTS_CATEGORIES[id];

      test('has a non-empty title, subtitle and stable id', () => {
        expect(category.id).toBe(id);
        expect(category.title.length).toBeGreaterThan(0);
        expect(category.subtitle.length).toBeGreaterThan(0);
      });

      test('has exactly 5 resource rows', () => {
        expect(category.resources).toHaveLength(5);
      });

      test('every resource has a non-empty id, title and subtitle', () => {
        category.resources.forEach(r => {
          expect(r.id.length).toBeGreaterThan(0);
          expect(r.title.length).toBeGreaterThan(0);
          expect(r.subtitle.length).toBeGreaterThan(0);
        });
      });

      test('every resource icon name is registered in the glyph set', () => {
        category.resources.forEach(r => {
          expect(Object.keys(GLYPHS)).toContain(r.icon);
        });
      });

      test('hero icon name is registered in the glyph set', () => {
        expect(Object.keys(GLYPHS)).toContain(category.heroIcon);
      });

      test('navigate action resources reference valid destinations', () => {
        category.resources
          .filter(r => r.actionType === 'navigate')
          .forEach(r => {
            expect(r.navigateTo).toBeDefined();
            if (r.navigateTo !== undefined) {
              expect(VALID_NAVIGATE_TARGETS).toContain(r.navigateTo);
            }
          });
      });

      test('CTA has a non-empty label', () => {
        expect(category.cta.label.length).toBeGreaterThan(0);
      });

      test('CTA navigate action references a valid destination', () => {
        if (category.cta.actionType === 'navigate') {
          expect(category.cta.navigateTo).toBeDefined();
          if (category.cta.navigateTo !== undefined) {
            expect(VALID_NAVIGATE_TARGETS).toContain(category.cta.navigateTo);
          }
        }
      });
    });
  });
});

describe('findCategoryById', () => {
  EXPECTED_IDS.forEach(id => {
    test(`returns the correct category for "${id}"`, () => {
      const result = findCategoryById(id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(id);
    });
  });

  test('returns undefined for an unknown ID', () => {
    expect(findCategoryById('unknown-category')).toBeUndefined();
  });

  test('returns undefined for an empty string', () => {
    expect(findCategoryById('')).toBeUndefined();
  });
});

describe('Key Areas card → category route mapping', () => {
  test('each key area id in womens-rights data maps to a defined category', () => {
    // The six key area IDs used in rights-content.ts must all resolve.
    const keyAreaIds = [
      'safety-protection',
      'education',
      'employment-equal-pay',
      'healthcare',
      'legal-rights',
      'participation',
    ];
    keyAreaIds.forEach(id => {
      expect(findCategoryById(id)).toBeDefined();
    });
  });
});
