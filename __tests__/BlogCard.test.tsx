import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import {
  BlogCard,
  BlogListHeader,
  formatBlogViews,
} from '../src/features/admin/content/blogs/components/BlogCard';
import type { BlogListItem } from '../src/features/admin/content/blogs/types/blog.types';

// Mock useWindowDimensions so we can test desktop vs mobile responsive modes
let mockDimensions = { width: 1024, height: 768, scale: 1, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  default: () => mockDimensions,
}));

describe('BlogCard & BlogListHeader (Master Prompt Responsive Redesign)', () => {
  const mockBlog: BlogListItem = {
    id: 'b-01',
    title: 'Understanding Your Mental Well-Being',
    excerpt: 'A simple guide to fundamental practices for a healthier and happier life...',
    category: 'Knowledge',
    date: '28 Sep 2026',
    time: '04:30 PM',
    status: 'PUBLISHED',
    views: 2100,
    thumbnailUrl: 'https://picsum.photos/seed/test-blog/200/200',
  };

  beforeEach(() => {
    mockDimensions = { width: 1024, height: 768, scale: 1, fontScale: 1 };
    jest.clearAllMocks();
  });

  it('correctly formats view counts (formatBlogViews)', () => {
    expect(formatBlogViews(980)).toBe('980');
    expect(formatBlogViews(1000)).toBe('1.0K');
    expect(formatBlogViews(2100)).toBe('2.1K');
    expect(formatBlogViews(15400)).toBe('15K');
  });

  describe('Desktop / Tablet Layout (width >= 680px)', () => {
    it('renders desktop BlogListHeader with all 5 metadata columns', () => {
      mockDimensions = { width: 1024, height: 768, scale: 1, fontScale: 1 };
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<BlogListHeader />);
      });

      const root = renderer!.root;
      const allTexts = root.findAllByType(Text).map(t => {
        const c = t.props.children;
        return Array.isArray(c) ? c.join('') : String(c ?? '');
      }).join(' ');

      expect(allTexts).toContain('Blog Details');
      expect(allTexts).toContain('Category');
      expect(allTexts).toContain('Date ↓');
      expect(allTexts).toContain('Status');
      expect(allTexts).toContain('Views');
      expect(allTexts).toContain('Actions');
    });

    it('renders full desktop card with aligned metadata and vertical dividers', () => {
      mockDimensions = { width: 1024, height: 768, scale: 1, fontScale: 1 };
      const onPressMock = jest.fn();
      const onEditMock = jest.fn();
      const onMoreMock = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <BlogCard
            blog={mockBlog}
            onPress={onPressMock}
            onEditPress={onEditMock}
            onMorePress={onMoreMock}
          />
        );
      });

      const root = renderer!.root;
      const allTexts = root.findAllByType(Text).map(t => {
        const c = t.props.children;
        return Array.isArray(c) ? c.join('') : String(c ?? '');
      }).join(' ');

      expect(allTexts).toContain('Understanding Your Mental Well-Being');
      expect(allTexts).toContain('Knowledge');
      expect(allTexts).toContain('28 Sep 2026');
      expect(allTexts).toContain('04:30 PM');
      expect(allTexts).toContain('Published');
      expect(allTexts).toContain('2.1K');
      expect(allTexts).toContain('Edit');

      // Test Edit button
      const editBtn = root.findByProps({ accessibilityLabel: `Edit ${mockBlog.title}` });
      act(() => {
        editBtn.props.onPress();
      });
      expect(onEditMock).toHaveBeenCalledWith(mockBlog);

      // Test More button
      const moreBtn = root.findByProps({ accessibilityLabel: `More actions for ${mockBlog.title}` });
      act(() => {
        moreBtn.props.onPress();
      });
      expect(onMoreMock).toHaveBeenCalledWith(mockBlog);
    });
  });

  describe('Mobile Layout (width < 680px)', () => {
    it('hides BlogListHeader on mobile to prevent crammed column squishing', () => {
      mockDimensions = { width: 375, height: 812, scale: 1, fontScale: 1 };
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<BlogListHeader />);
      });

      expect(renderer!.toJSON()).toBeNull();
    });

    it('renders 3-tier responsive mobile card with full metadata and actions', () => {
      mockDimensions = { width: 375, height: 812, scale: 1, fontScale: 1 };
      const onPressMock = jest.fn();
      const onEditMock = jest.fn();
      const onMoreMock = jest.fn();

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <BlogCard
            blog={mockBlog}
            onPress={onPressMock}
            onEditPress={onEditMock}
            onMorePress={onMoreMock}
          />
        );
      });

      const root = renderer!.root;
      const allTexts = root.findAllByType(Text).map(t => {
        const c = t.props.children;
        return Array.isArray(c) ? c.join('') : String(c ?? '');
      }).join(' ');

      // Tier 1: Title & excerpt
      expect(allTexts).toContain('Understanding Your Mental Well-Being');
      expect(allTexts).toContain('A simple guide to fundamental practices');

      // Tier 2: Category, date, status
      expect(allTexts).toContain('Knowledge');
      expect(allTexts).toContain('28 Sep 2026');
      expect(allTexts).toContain('04:30 PM');
      expect(allTexts).toContain('Published');

      // Tier 3: Views & Actions
      expect(allTexts).toContain('2.1K');
      expect(allTexts).toContain('Edit');

      // Edit and overflow still fully functional on mobile
      const editBtn = root.findByProps({ accessibilityLabel: `Edit ${mockBlog.title}` });
      act(() => {
        editBtn.props.onPress();
      });
      expect(onEditMock).toHaveBeenCalledWith(mockBlog);
    });
  });

  it('renders fallback icon when no thumbnail is provided', () => {
    const blogNoImage: BlogListItem = {
      ...mockBlog,
      thumbnailUrl: null,
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<BlogCard blog={blogNoImage} />);
    });

    const root = renderer!.root;
    expect(root.findAllByType(Image).length).toBe(0);
    const fallbackText = root.findAllByType(Text).find(t => t.props.children === '📝');
    expect(fallbackText).toBeDefined();
  });
});
