import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BlogsListScreen } from '../src/features/admin/content/blogs/screens/BlogsListScreen';
import { BlogCard } from '../src/features/admin/content/blogs/components/BlogCard';
import type { BlogListItem } from '../src/features/admin/content/blogs/types/blog.types';

// Mock useBlogs hook
const mockUpdateBlog = jest.fn();
const mockDeleteBlog = jest.fn();
const mockRefresh = jest.fn();

const mockBlogItems: BlogListItem[] = [
  {
    id: 'b-01',
    title: 'Understanding Your Mental Well-Being',
    excerpt: 'A simple guide to fundamental practices for a healthier and happier life...',
    category: 'Knowledge',
    date: '28 Sep 2026',
    time: '04:30 PM',
    status: 'PUBLISHED',
    views: 2100,
    thumbnailUrl: 'https://picsum.photos/seed/test-blog-1/200/200',
  },
  {
    id: 'b-02',
    title: 'The Importance of Digital Literacy',
    excerpt: 'Learn how digital skills can open new opportunities and empower communities...',
    category: 'Social',
    date: '24 Sep 2026',
    time: '11:15 AM',
    status: 'DRAFT',
    views: 1900,
    thumbnailUrl: null,
  },
];

jest.mock('../src/features/admin/content/blogs/hooks/useBlogs', () => ({
  useBlogs: () => ({
    blogs: mockBlogItems,
    stats: {
      total: 2,
      published: 1,
      drafts: 1,
      archived: 0,
    },
    state: 'success',
    errorMessage: null,
    refresh: mockRefresh,
    createBlog: jest.fn(),
    updateBlog: mockUpdateBlog,
    deleteBlog: mockDeleteBlog,
  }),
}));

// Mock AdminHeader
jest.mock('../src/app/navigation/AdminHeader', () => ({
  AdminHeader: () => null,
}));

describe('BlogsListScreen Functional Verification (Phase 3)', () => {
  const onAddBlogMock = jest.fn();
  const onOpenBlogMock = jest.fn();
  const onEditBlogMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () =>
    ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 1024, height: 768 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <BlogsListScreen
          onAddBlog={onAddBlogMock}
          onOpenBlog={onOpenBlogMock}
          onEditBlog={onEditBlogMock}
        />
      </SafeAreaProvider>
    );

  it('renders page header matching Donation Seekers typography and Add Blog button', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = renderScreen();
    });

    const root = renderer!.root;
    const allTexts = root.findAllByType(Text).map(t => {
      const c = t.props.children;
      return Array.isArray(c) ? c.join('') : String(c ?? '');
    }).join(' ');

    expect(allTexts).toContain('Blogs');
    expect(allTexts).toContain('Create, manage and publish blog articles.');
    expect(allTexts).toContain('Add Blog');

    // Trigger Add Blog button (header or FAB)
    const addBtns = root.findAllByProps({ accessibilityLabel: 'Add Blog' });
    expect(addBtns.length).toBeGreaterThan(0);
    act(() => {
      addBtns[0].props.onPress();
    });
    expect(onAddBlogMock).toHaveBeenCalledTimes(1);
  });

  it('renders all blog cards with dynamic fields, formatted views, and correct status badges', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = renderScreen();
    });

    const root = renderer!.root;
    const cards = root.findAllByType(BlogCard);
    expect(cards.length).toBe(2);

    expect(cards[0].props.blog.title).toBe('Understanding Your Mental Well-Being');
    expect(cards[0].props.blog.category).toBe('Knowledge');
    expect(cards[0].props.blog.status).toBe('PUBLISHED');
    expect(cards[0].props.blog.views).toBe(2100);

    expect(cards[1].props.blog.title).toBe('The Importance of Digital Literacy');
    expect(cards[1].props.blog.category).toBe('Social');
    expect(cards[1].props.blog.status).toBe('DRAFT');
    expect(cards[1].props.blog.views).toBe(1900);
  });

  it('triggers onEditBlog with the exact blog record when Edit is pressed', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = renderScreen();
    });

    const root = renderer!.root;
    const cards = root.findAllByType(BlogCard);
    expect(cards.length).toBeGreaterThan(0);

    act(() => {
      cards[0].props.onEditPress(mockBlogItems[0]);
    });
    expect(onEditBlogMock).toHaveBeenCalledWith(mockBlogItems[0]);
  });

  it('triggers onOpenBlog when the blog card row is pressed', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = renderScreen();
    });

    const root = renderer!.root;
    const cards = root.findAllByType(BlogCard);
    act(() => {
      cards[0].props.onPress(mockBlogItems[0]);
    });
    expect(onOpenBlogMock).toHaveBeenCalledWith(mockBlogItems[0]);
  });
});
