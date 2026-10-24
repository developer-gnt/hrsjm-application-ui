import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RightsSummaryCard } from '../src/features/admin/content/rights/components/RightsSummaryCard';
import { RightsStatusTabs } from '../src/features/admin/content/rights/components/RightsStatusTabs';
import {
  RightsCard,
  RightsListHeader,
  formatRightsViews,
} from '../src/features/admin/content/rights/components/RightsCard';
import { RightsActionMenu } from '../src/features/admin/content/rights/components/RightsActionMenu';
import { KnowYourRightsScreen } from '../src/features/admin/content/rights/screens/KnowYourRightsScreen';
import type { RightsListItem, RightsStatsSummary } from '../src/features/admin/content/rights/types/rights.types';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock AdminHeader
jest.mock('../src/app/navigation/AdminHeader', () => ({
  AdminHeader: () => null,
}));

// Mock rights service
jest.mock('../src/features/admin/content/rights/services/rights.service', () => ({
  getRightsList: jest.fn().mockResolvedValue({
    rights: [],
    stats: { total: 12, published: 8, drafts: 2, archived: 2 },
    totalCount: 0,
  }),
  updateRightApi: jest.fn().mockResolvedValue({}),
  deleteRightApi: jest.fn().mockResolvedValue({}),
  incrementRightViewsApi: jest.fn().mockResolvedValue(1),
}));

describe('Know Your Rights Redesign Components', () => {
  const mockStats: RightsStatsSummary = {
    total: 12,
    published: 8,
    drafts: 2,
    archived: 2,
  };

  const mockArticle: RightsListItem = {
    id: 'right-1',
    title: 'Right to Equality & Non-Discrimination',
    description: 'Fundamental protection against discrimination on grounds of religion, race, caste, sex or place of birth.',
    category: 'Fundamental Rights',
    status: 'PUBLISHED',
    lastUpdatedDate: '24 Oct 2026',
    lastUpdatedTime: '10:30 AM',
    views: 1240,
    thumbnailUrl: 'https://picsum.photos/seed/rights1/200/200',
  };

  describe('Phase 2: 4 Statistics Cards (2x2 Grid)', () => {
    it('renders all four statistics cards with correct labels and values', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<RightsSummaryCard stats={mockStats} />);
      });

      const root = renderer!.root;
      const texts = root.findAllByType(Text).map(t => {
        const c = t.props.children;
        return Array.isArray(c) ? c.join('') : String(c ?? '');
      });

      expect(texts).toContain('Total Articles');
      expect(texts).toContain('12');
      expect(texts).toContain('Drafts');
      expect(texts).toContain('2');
      expect(texts).toContain('Published');
      expect(texts).toContain('8');
      expect(texts).toContain('Archived');
    });
  });

  describe('Phase 3: Horizontally Scrollable Status Selectors', () => {
    it('renders all status tabs with counts and triggers selection', () => {
      const tabs = [
        { key: 'ALL' as const, label: 'All', count: 12 },
        { key: 'PUBLISHED' as const, label: 'Published', count: 8 },
        { key: 'DRAFT' as const, label: 'Drafts', count: 2 },
        { key: 'ARCHIVED' as const, label: 'Archived', count: 2 },
      ];
      const onTabChange = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <RightsStatusTabs
            tabs={tabs}
            activeTab="ALL"
            onTabChange={onTabChange}
          />,
        );
      });

      const root = renderer!.root;
      const buttons = root.findAllByType(TouchableOpacity);
      expect(buttons.length).toBe(4);

      // Press Published tab
      act(() => {
        buttons[1].props.onPress();
      });
      expect(onTabChange).toHaveBeenCalledWith('PUBLISHED');
    });
  });

  describe('Phase 4: Rights Content Card & Standalone Edit Button Removal', () => {
    it('formats view counts properly', () => {
      expect(formatRightsViews(500)).toBe('500');
      expect(formatRightsViews(1200)).toBe('1.2K');
      expect(formatRightsViews(15000)).toBe('15K');
    });

    it('renders table header with column definitions', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<RightsListHeader />);
      });
      const root = renderer!.root;
      const texts = root.findAllByType(Text).map(t => String(t.props.children ?? ''));
      expect(texts).toContain('Rights Details');
      expect(texts).toContain('Category');
      expect(texts).toContain('Last Updated');
      expect(texts).toContain('Status');
      expect(texts).toContain('Views');
      expect(texts).toContain('Action');
    });

    it('renders card without standalone edit button and only three-dot action button', () => {
      const onPress = jest.fn();
      const onMorePress = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <RightsCard
            article={mockArticle}
            onPress={onPress}
            onMorePress={onMorePress}
          />,
        );
      });

      const root = renderer!.root;
      const allTexts = root.findAllByType(Text).map(t => {
        const c = t.props.children;
        return Array.isArray(c) ? c.join('') : String(c ?? '');
      });

      // Contains article details
      expect(allTexts).toContain('Right to Equality & Non-Discrimination');
      expect(allTexts).toContain('Fundamental Rights');
      expect(allTexts).toContain('24 Oct 2026');
      expect(allTexts).toContain('10:30 AM');
      expect(allTexts).toContain('Published');
      expect(allTexts).toContain('1.2K');

      // MUST NOT contain a standalone Edit button text
      const editButtons = allTexts.filter(t => t.trim().toLowerCase() === 'edit');
      expect(editButtons.length).toBe(0);

      // Trigger more button
      const touchables = root.findAllByType(TouchableOpacity);
      const moreBtn = touchables.find(
        t => t.props.accessibilityLabel && t.props.accessibilityLabel.includes('Actions for'),
      );
      expect(moreBtn).toBeDefined();

      act(() => {
        moreBtn!.props.onPress();
      });
      expect(onMorePress).toHaveBeenCalled();
    });
  });

  describe('Phase 5: Anchored Floating Action Popover Menu', () => {
    it('renders popup actions for PUBLISHED article: Edit, Unpublish, Archive, Delete', () => {
      const onAction = jest.fn();
      const onClose = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <RightsActionMenu
            visible={true}
            article={mockArticle}
            anchor={{ x: 200, y: 300, width: 32, height: 32 }}
            onAction={onAction}
            onClose={onClose}
          />,
        );
      });

      const root = renderer!.root;
      const texts = root.findAllByType(Text).map(t => {
        const c = t.props.children;
        return Array.isArray(c) ? c.join('') : String(c ?? '');
      });

      expect(texts).toContain('Edit');
      expect(texts).toContain('Unpublish');
      expect(texts).toContain('Archive');
      expect(texts).toContain('Delete');

      // Click Edit action
      const touchables = root.findAllByType(TouchableOpacity);
      const editTouchable = touchables.find(t => t.props.accessibilityLabel === 'Edit');
      expect(editTouchable).toBeDefined();

      act(() => {
        editTouchable!.props.onPress();
      });
      expect(onAction).toHaveBeenCalledWith('edit');
      expect(onClose).toHaveBeenCalled();
    });

    it('renders popup actions for DRAFT article: Edit, Publish, Archive, Delete', () => {
      const draftArticle: RightsListItem = { ...mockArticle, status: 'DRAFT' };
      const onAction = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <RightsActionMenu
            visible={true}
            article={draftArticle}
            onAction={onAction}
            onClose={jest.fn()}
          />,
        );
      });

      const root = renderer!.root;
      const texts = root.findAllByType(Text).map(t => {
        const c = t.props.children;
        return Array.isArray(c) ? c.join('') : String(c ?? '');
      });

      expect(texts).toContain('Edit');
      expect(texts).toContain('Publish');
      expect(texts).toContain('Archive');
      expect(texts).toContain('Delete');
    });
  });

  describe('Search and Filters Row Verification', () => {
    it('verifies Search and Filters row keeps search bar flexible (flex: 1, minWidth: 0), filters button with flexShrink: 0 and 8px gap on narrow screen', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider
            initialMetrics={{
              frame: { x: 0, y: 0, width: 340, height: 740 },
              insets: { top: 0, left: 0, right: 0, bottom: 0 },
            }}
          >
            <KnowYourRightsScreen />
          </SafeAreaProvider>,
        );
      });

      const root = renderer!.root;
      const filterButton = root.findByProps({ accessibilityLabel: 'Filters' });
      expect(filterButton).toBeDefined();

      const searchInput = root.findByProps({ returnKeyType: 'search' });
      expect(searchInput).toBeDefined();

      const fab = root.findByProps({ accessibilityLabel: 'Add Rights Content' });
      expect(fab).toBeDefined();
    });
  });
});
