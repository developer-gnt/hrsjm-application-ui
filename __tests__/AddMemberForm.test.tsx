import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import {
  AddMemberScreen,
  MAIN_CATEGORIES,
  CATEGORY_POSTS_MAP,
} from '../src/features/admin/members/screens/AddMemberScreen';

jest.mock('../src/features/admin/members/services/members.service', () => ({
  membersService: {
    list: jest.fn().mockResolvedValue({ items: [], rawItems: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 }, stats: { total: 0, active: 0, expiringSoon: 0, inactive: 0 } }),
    getStats: jest.fn().mockResolvedValue({ total: 0, active: 0, expiringSoon: 0, inactive: 0 }),
    getCategories: jest.fn().mockResolvedValue([
      { id: 'cat-gen-1', code: 'DISTRICT_UNIT', name: 'District Unit', fee: 1300 },
      { id: 'cat-gen-2', code: 'STATE_UNIT', name: 'State Unit', fee: 2300 },
      { id: 'cat-let-1', code: 'LION_COUNSELOR_AMBASSADOR', name: 'Lion Counselor Ambassador', fee: 5000 },
      { id: 'cat-dir-1', code: 'STATE_DIRECTOR', name: 'State Director', fee: 10000 },
      { id: 'cat-nat-1', code: 'NATIONAL_COUNCIL_CELL', name: 'National Council Cell', fee: 10000 },
    ]),
    create: jest.fn().mockResolvedValue({ id: 'new-mem-1' }),
    updateStatus: jest.fn().mockResolvedValue({}),
    getById: jest.fn().mockResolvedValue({}),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderAddMember = async (props = {}) => {
  const queryClient = createTestQueryClient();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <NavigationContainer>
        <QueryClientProvider client={queryClient}>
          <AddMemberScreen {...props} />
        </QueryClientProvider>
      </NavigationContainer>
    );
  });
  return tree!;
};

const collectText = (node: any): string[] => {
  const texts: string[] = [];
  if (!node) return texts;
  if (node.children) {
    node.children.forEach((child: any) => {
      if (typeof child === 'string') {
        texts.push(child);
      } else if (child && typeof child === 'object') {
        texts.push(...collectText(child));
      }
    });
  }
  return texts;
};

const renderedText = (tree: ReactTestRenderer.ReactTestRenderer): string =>
  collectText(tree.root)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

describe('AddMemberScreen Category and Membership Post Hierarchy', () => {
  test('has exactly three main categories configured', () => {
    expect(MAIN_CATEGORIES.map(c => c.id)).toEqual([
      'General Membership',
      'Letter Pad Post',
      'National Level Post',
    ]);
  });

  test('configures exactly the specified posts per category', () => {
    // 1. General Membership
    const generalPosts = CATEGORY_POSTS_MAP['General Membership'].map(p => p.postName);
    expect(generalPosts).toEqual([
      'District General Member',
      'Zonal General Member',
      'District Unit Post',
      'Zonal Unit Post',
    ]);

    // 2. Letter Pad Post
    const letterPosts = CATEGORY_POSTS_MAP['Letter Pad Post'].map(p => p.postName);
    expect(letterPosts).toEqual([
      'Lion of Zone',
      'Councillor of Zone',
      'Ambassador of Zone',
      "Hon'ble Zone Director",
    ]);

    // 3. National Level Post
    const nationalPosts = CATEGORY_POSTS_MAP['National Level Post'].map(p => p.postName);
    expect(nationalPosts).toEqual([
      'National Legal Council Call',
      'National Minority Council Call',
      'National Woman Council Call',
      'National Political Council Call',
    ]);
  });

  test('initially renders Category dropdown with placeholder "Select Category"', async () => {
    const tree = await renderAddMember();
    const text = renderedText(tree);

    expect(text).toContain('Select Category');
    expect(text).toContain('Category *');
  });

  test('shows validation errors when pressing Next without Category and Membership Post', async () => {
    const tree = await renderAddMember();

    // Find the Next button
    const nextButtons = tree.root.findAll(
      node => node.props && node.props.style && typeof node.props.onPress === 'function' && renderedText({ root: node } as any).includes('Next')
    );
    expect(nextButtons.length).toBeGreaterThan(0);

    await ReactTestRenderer.act(async () => {
      nextButtons[0].props.onPress();
    });

    const errorText = renderedText(tree);
    expect(errorText).toContain('Category is required');
  });

  test('opens Category modal and selects "General Membership", displaying only General posts', async () => {
    const tree = await renderAddMember();

    // Tap Category dropdown
    const catDropdown = tree.root.findByProps({ testID: 'category-dropdown-button' });
    await ReactTestRenderer.act(async () => {
      catDropdown.props.onPress();
    });

    // Tap "General Membership" option
    const genOption = tree.root.findByProps({ testID: 'category-option-General Membership' });
    await ReactTestRenderer.act(async () => {
      genOption.props.onPress();
    });

    // Membership Post dropdown should now be visible with placeholder
    const textAfterSelect = renderedText(tree);
    expect(textAfterSelect).toContain('General Membership');
    expect(textAfterSelect).toContain('Select Membership Post');

    // Tap Membership Post dropdown
    const postDropdown = tree.root.findByProps({ testID: 'membership-post-dropdown-button' });
    await ReactTestRenderer.act(async () => {
      postDropdown.props.onPress();
    });

    // Check that General posts are present and other category posts are NOT present
    const modalText = renderedText(tree);
    expect(modalText).toContain('District General Member');
    expect(modalText).toContain('Zonal General Member');
    expect(modalText).toContain('District Unit Post');
    expect(modalText).toContain('Zonal Unit Post');
    expect(modalText).not.toContain('Lion of Zone');
    expect(modalText).not.toContain('National Legal Council Call');
  });

  test('selecting a post displays its qualification, fee, validity and benefits', async () => {
    const tree = await renderAddMember();

    // 1. Select Category
    const catDropdown = tree.root.findByProps({ testID: 'category-dropdown-button' });
    await ReactTestRenderer.act(async () => {
      catDropdown.props.onPress();
    });
    const genOption = tree.root.findByProps({ testID: 'category-option-General Membership' });
    await ReactTestRenderer.act(async () => {
      genOption.props.onPress();
    });

    // 2. Select Post "District General Member"
    const postDropdown = tree.root.findByProps({ testID: 'membership-post-dropdown-button' });
    await ReactTestRenderer.act(async () => {
      postDropdown.props.onPress();
    });
    const districtPostOption = tree.root.findByProps({ testID: 'membership-post-option-district-general-member' });
    await ReactTestRenderer.act(async () => {
      districtPostOption.props.onPress();
    });

    // Post details card should now be rendered
    const text = renderedText(tree);
    expect(text).toContain('District General Member');
    expect(text).toContain('Minimum 8th Class');
    expect(text).toContain('1 Year');
    expect(text).toContain('Appointment Letter');
    expect(text).toContain('Certificate');
  });

  test('changing Category clears previously selected Membership Post', async () => {
    const tree = await renderAddMember();

    // 1. Select General Membership
    const catDropdown = tree.root.findByProps({ testID: 'category-dropdown-button' });
    await ReactTestRenderer.act(async () => {
      catDropdown.props.onPress();
    });
    const genOption = tree.root.findByProps({ testID: 'category-option-General Membership' });
    await ReactTestRenderer.act(async () => {
      genOption.props.onPress();
    });

    // 2. Select "District General Member"
    const postDropdown = tree.root.findByProps({ testID: 'membership-post-dropdown-button' });
    await ReactTestRenderer.act(async () => {
      postDropdown.props.onPress();
    });
    const districtPostOption = tree.root.findByProps({ testID: 'membership-post-option-district-general-member' });
    await ReactTestRenderer.act(async () => {
      districtPostOption.props.onPress();
    });

    expect(renderedText(tree)).toContain('District General Member');

    // 3. Switch Category to "Letter Pad Post"
    await ReactTestRenderer.act(async () => {
      catDropdown.props.onPress();
    });
    const letterOption = tree.root.findByProps({ testID: 'category-option-Letter Pad Post' });
    await ReactTestRenderer.act(async () => {
      letterOption.props.onPress();
    });

    // The previously selected District General Member must be CLEARED
    const textAfterSwitch = renderedText(tree);
    expect(textAfterSwitch).toContain('Letter Pad Post');
    expect(textAfterSwitch).toContain('Select Membership Post');
    expect(textAfterSwitch).not.toContain('District General Member');

    // 4. Open post dropdown — should now show Letter Pad posts
    await ReactTestRenderer.act(async () => {
      const postDropdownLetter = tree.root.findByProps({ testID: 'membership-post-dropdown-button' });
      postDropdownLetter.props.onPress();
    });

    const letterModalText = renderedText(tree);
    expect(letterModalText).toContain('Lion of Zone');
    expect(letterModalText).toContain('Councillor of Zone');
    expect(letterModalText).toContain('Ambassador of Zone');
    expect(letterModalText).toContain("Hon'ble Zone Director");
    expect(letterModalText).not.toContain('District General Member');
  });

  test('supports National Level Post options', async () => {
    const tree = await renderAddMember();

    // Select National Level Post
    const catDropdown = tree.root.findByProps({ testID: 'category-dropdown-button' });
    await ReactTestRenderer.act(async () => {
      catDropdown.props.onPress();
    });
    const natOption = tree.root.findByProps({ testID: 'category-option-National Level Post' });
    await ReactTestRenderer.act(async () => {
      natOption.props.onPress();
    });

    // Open post dropdown
    const postDropdown = tree.root.findByProps({ testID: 'membership-post-dropdown-button' });
    await ReactTestRenderer.act(async () => {
      postDropdown.props.onPress();
    });

    const natModalText = renderedText(tree);
    expect(natModalText).toContain('National Legal Council Call');
    expect(natModalText).toContain('National Minority Council Call');
    expect(natModalText).toContain('National Woman Council Call');
    expect(natModalText).toContain('National Political Council Call');
  });
});
