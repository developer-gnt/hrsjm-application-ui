import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  MembershipCategoriesScreen,
  BecomeMemberScreen,
} from '../src/features/membership';
import { getRegistrationState } from '../src/features/auth/state/registrationState';

describe('MembershipCategoriesScreen — Phase 1 & Phase 2 Tests', () => {
  const renderCategoriesScreen = async (props = {}) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <MembershipCategoriesScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  const renderBecomeMemberScreen = async (props = {}) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <BecomeMemberScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  // -------------------------------------------------------------
  // PHASE 1 TESTS
  // -------------------------------------------------------------
  it('Phase 1: renders MembershipCategoriesScreen without crashing', async () => {
    const renderer = await renderCategoriesScreen();
    expect(renderer.root).toBeDefined();
  });

  it('Phase 1: renders Header with title and subtitle', async () => {
    const renderer = await renderCategoriesScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Membership Categories' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'Choose a membership plan that fits you',
      })
    ).toBeDefined();
  });

  it('Phase 1: renders all three section headings', async () => {
    const renderer = await renderCategoriesScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'District & State Level Posts' })).toBeDefined();
    expect(root.findByProps({ children: 'Letter Pad Posts' })).toBeDefined();
    expect(root.findByProps({ children: 'National Level Posts' })).toBeDefined();
  });

  it('Phase 1: triggers onBack callback when back button is pressed', async () => {
    const onBackMock = jest.fn();
    const renderer = await renderCategoriesScreen({ onBack: onBackMock });
    const backBtn = renderer.root.findByProps({ accessibilityLabel: 'Go back' });

    await act(async () => {
      backBtn.props.onPress();
    });

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });

  it('Phase 1: navigates from Become a Member screen CTA button to Membership Categories', async () => {
    const onCtaPressMock = jest.fn();
    const renderer = await renderBecomeMemberScreen({ onCtaPress: onCtaPressMock });
    const ctaButton = renderer.root.findByProps({ accessibilityLabel: 'Become a Member' });

    await act(async () => {
      ctaButton.props.onPress();
    });

    expect(onCtaPressMock).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------
  // PHASE 2 TESTS — District & State Level Posts
  // -------------------------------------------------------------
  it('Phase 2: renders all 4 District & State Level Posts with exact fees and qualifications', async () => {
    const renderer = await renderCategoriesScreen();
    const root = renderer.root;

    // 1. District Active Member
    expect(root.findByProps({ children: 'District Active Member' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Minimum 8th Class' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findByProps({ children: '₹ 800' })).toBeDefined();

    // 2. State Active Member
    expect(root.findByProps({ children: 'State Active Member' })).toBeDefined();
    expect(root.findByProps({ children: '₹ 900' })).toBeDefined();

    // 3. District Unit Post
    expect(root.findByProps({ children: 'District Unit Post' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Minimum 10th Class' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findByProps({ children: '₹ 1,300' })).toBeDefined();

    // 4. State Unit Post (CRITICAL: 2 Years validity)
    expect(root.findByProps({ children: 'State Unit Post' })).toBeDefined();
    expect(root.findByProps({ children: '₹ 2,300' })).toBeDefined();
    expect(root.findAllByProps({ children: '2 Years' }).length).toBeGreaterThanOrEqual(1);
  });

  it('Phase 2: triggers onApplyPost and updates registration state when Apply Now is pressed', async () => {
    const onApplyMock = jest.fn();
    const renderer = await renderCategoriesScreen({ onApplyPost: onApplyMock });
    const applyButton = renderer.root.findByProps({
      accessibilityLabel: 'Apply Now for District Active Member',
    });

    await act(async () => {
      applyButton.props.onPress();
    });

    expect(onApplyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'district-active-member',
        postName: 'District Active Member',
        fee: '₹ 800',
      })
    );

    const state = getRegistrationState();
    expect(state.accountType).toBe('member');
    expect(state.accountTypeLabel).toBe('District Active Member');
  });

  // -------------------------------------------------------------
  // PHASE 3 TESTS — Letter Pad Posts
  // -------------------------------------------------------------
  it('Phase 3: renders all 4 Letter Pad Posts with exact fees and qualifications', async () => {
    const renderer = await renderCategoriesScreen();
    const root = renderer.root;

    // 1. Lion of State
    expect(root.findByProps({ children: 'Lion of State' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Graduation / Degree' }).length).toBeGreaterThanOrEqual(3); // Lion, Counselor, Ambassador
    expect(root.findAllByProps({ children: '₹ 5,000' }).length).toBeGreaterThanOrEqual(3);
    expect(root.findAllByProps({ children: '5 Years' }).length).toBeGreaterThanOrEqual(3);

    // 2. Counselor of State
    expect(root.findByProps({ children: 'Counselor of State' })).toBeDefined();

    // 3. Ambassador of State
    expect(root.findByProps({ children: 'Ambassador of State' })).toBeDefined();

    // 4. Hon'ble State Director
    expect(root.findByProps({ children: 'Hon’ble State Director' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Post Graduation' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: '₹ 10,000' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: '10 Years' }).length).toBeGreaterThanOrEqual(1);
  });

  it('Phase 3: triggers onApplyPost for Letter Pad post', async () => {
    const onApplyMock = jest.fn();
    const renderer = await renderCategoriesScreen({ onApplyPost: onApplyMock });
    const applyButton = renderer.root.findByProps({
      accessibilityLabel: 'Apply Now for Lion of State',
    });

    await act(async () => {
      applyButton.props.onPress();
    });

    expect(onApplyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'lion-of-state',
        postName: 'Lion of State',
        fee: '₹ 5,000',
        validity: '5 Years',
      })
    );

    const state = getRegistrationState();
    expect(state.accountType).toBe('member');
    expect(state.accountTypeLabel).toBe('Lion of State');
  });

  // -------------------------------------------------------------
  // PHASE 4 TESTS — National Level Posts
  // -------------------------------------------------------------
  it('Phase 4: renders all 4 National Level Posts with exact fees and qualifications', async () => {
    const renderer = await renderCategoriesScreen();
    const root = renderer.root;

    // 1. National Legal Council Cell
    expect(root.findByProps({ children: 'National Legal Council Cell' })).toBeDefined();

    // 2. National Minority Council Cell
    expect(root.findByProps({ children: 'National Minority Council Cell' })).toBeDefined();

    // 3. National Women Council Cell
    expect(root.findByProps({ children: 'National Women Council Cell' })).toBeDefined();

    // 4. National Political Council Cell
    expect(root.findByProps({ children: 'National Political Council Cell' })).toBeDefined();

    // All 4 have Post Graduation, ₹ 10,000, 10 Years
    expect(root.findAllByProps({ children: 'Post Graduation' }).length).toBeGreaterThanOrEqual(4);
    expect(root.findAllByProps({ children: '₹ 10,000' }).length).toBeGreaterThanOrEqual(4);
    expect(root.findAllByProps({ children: '10 Years' }).length).toBeGreaterThanOrEqual(4);
  });

  it('Phase 4: triggers onApplyPost for National Level post and updates registration state', async () => {
    const onApplyMock = jest.fn();
    const renderer = await renderCategoriesScreen({ onApplyPost: onApplyMock });
    const applyButton = renderer.root.findByProps({
      accessibilityLabel: 'Apply Now for National Legal Council Cell',
    });

    await act(async () => {
      applyButton.props.onPress();
    });

    expect(onApplyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'national-legal-council-cell',
        postName: 'National Legal Council Cell',
        fee: '₹ 10,000',
        validity: '10 Years',
      })
    );

    const state = getRegistrationState();
    expect(state.accountType).toBe('member');
    expect(state.accountTypeLabel).toBe('National Legal Council Cell');
  });

  // -------------------------------------------------------------
  // PHASE 5 TESTS — Verification Notice & Responsive Polish
  // -------------------------------------------------------------
  it('Phase 5: renders Verification Notice card with policy and kit information', async () => {
    const renderer = await renderCategoriesScreen();
    const root = renderer.root;

    expect(
      root.findByProps({ children: 'Document Verification & Approval Policy' })
    ).toBeDefined();
    expect(
      root.findByProps({ children: 'राष्ट्रीय समिति द्वारा सत्यापन एवं अनुमोदन' })
    ).toBeDefined();
    expect(
      root.findByProps({ accessibilityLabel: 'Verification Notice' })
    ).toBeDefined();
  });

  it('Phase 5: renders all 12 membership posts across all 3 sections', async () => {
    const renderer = await renderCategoriesScreen();
    const root = renderer.root;

    const allApplyButtons = root.findAllByProps({
      accessibilityRole: 'button',
    }).filter(b => (b.props.accessibilityLabel || '').startsWith('Apply Now for '));

    expect(allApplyButtons.length).toBeGreaterThanOrEqual(12);
  });
});



