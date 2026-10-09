import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RenewMembershipScreen } from '../src/features/membership';

describe('RenewMembershipScreen — Phase 1 Tests', () => {
  const renderScreen = async (props = {}) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <RenewMembershipScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('Phase 1: renders RenewMembershipScreen without crashing', async () => {
    const renderer = await renderScreen();
    expect(renderer.root).toBeDefined();
  });

  it('Phase 1: renders Header with HRSJM branding, logo, motto and actions', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'HRSJM' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'Human Rights • Justice • Accountability',
      })
    ).toBeDefined();
    expect(
      root.findByProps({
        children: 'Peace  •  Equality  •  Dignity',
      })
    ).toBeDefined();

    // Check notification badge count '3'
    expect(root.findByProps({ children: '3' })).toBeDefined();

    // Check menu and profile accessibility labels
    expect(root.findByProps({ accessibilityLabel: 'Open Navigation Menu' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Notifications' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'User Profile' })).toBeDefined();
  });

  it('Phase 1: renders Page Title "Renew Membership"', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Renew Membership' })).toBeDefined();
  });

  it('Phase 1: renders Membership Expiry Alert card with correct warning text', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(
      root.findByProps({ children: 'Your membership is expiring soon!' })
    ).toBeDefined();
    expect(
      root.findByProps({ children: 'Only 7 days remaining' })
    ).toBeDefined();
    expect(
      root.findByProps({ accessibilityLabel: 'Membership Expiry Alert' })
    ).toBeDefined();
  });

  it('Phase 1: renders Current Membership Card with District Unit, valid till, and days remaining', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Current Membership' })).toBeDefined();
    expect(root.findByProps({ children: 'District Unit' })).toBeDefined();
    expect(root.findByProps({ children: 'Valid Till' })).toBeDefined();
    expect(root.findByProps({ children: '15 Oct 2026' })).toBeDefined();
    expect(root.findByProps({ children: 'Days Remaining' })).toBeDefined();
    expect(root.findByProps({ children: '7 days' })).toBeDefined();
  });

  it('Phase 1: triggers header action callbacks when pressed', async () => {
    const onMenuMock = jest.fn();
    const onNotificationsMock = jest.fn();
    const onProfileMock = jest.fn();

    const renderer = await renderScreen({
      onMenuPress: onMenuMock,
      onNotificationsPress: onNotificationsMock,
      onProfilePress: onProfileMock,
    });

    const menuBtn = renderer.root.findByProps({ accessibilityLabel: 'Open Navigation Menu' });
    const notifBtn = renderer.root.findByProps({ accessibilityLabel: 'Notifications' });
    const profileBtn = renderer.root.findByProps({ accessibilityLabel: 'User Profile' });

    await act(async () => {
      menuBtn.props.onPress();
      notifBtn.props.onPress();
      profileBtn.props.onPress();
    });

    expect(onMenuMock).toHaveBeenCalledTimes(1);
    expect(onNotificationsMock).toHaveBeenCalledTimes(1);
    expect(onProfileMock).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------
  // PHASE 2 TESTS — Renewal Plan & 3-Year Info
  // -------------------------------------------------------------
  it('Phase 2: renders Renewal Plan heading and equal-fee badge', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Renewal Plan' })).toBeDefined();
    expect(
      root.findByProps({ children: 'Renewal fee is equal for all members' })
    ).toBeDefined();
  });

  it('Phase 2: renders all 3 renewal plans with exact prices, durations, and badges', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // 1st Year Plan
    expect(root.findByProps({ children: '1st Year Renewal Fees' })).toBeDefined();
    expect(root.findByProps({ children: 'For 1 Year' })).toBeDefined();
    expect(root.findByProps({ children: '₹ 500' })).toBeDefined();
    expect(root.findByProps({ children: 'Most Popular' })).toBeDefined();

    // 2nd Year Plan
    expect(root.findByProps({ children: '2nd Year Renewal Fees' })).toBeDefined();
    expect(root.findByProps({ children: 'For 2 Years' })).toBeDefined();
    expect(root.findByProps({ children: '₹ 400' })).toBeDefined();
    expect(root.findByProps({ children: 'Save ₹ 100' })).toBeDefined();

    // 3rd Year Plan
    expect(root.findByProps({ children: '3rd Year Renewal Fees' })).toBeDefined();
    expect(root.findByProps({ children: 'For 3 Years' })).toBeDefined();
    expect(root.findByProps({ children: '₹ 300' })).toBeDefined();
    expect(root.findByProps({ children: 'Save ₹ 200' })).toBeDefined();
  });

  it('Phase 2: selects 1st Year by default and allows switching plan selection', async () => {
    const onPlanSelectMock = jest.fn();
    const renderer = await renderScreen({ onPlanSelect: onPlanSelectMock });
    const root = renderer.root;

    const plan1 = root.findByProps({
      accessibilityLabel: '1st Year Renewal Fees, ₹ 500, Most Popular',
    });
    const plan2 = root.findByProps({
      accessibilityLabel: '2nd Year Renewal Fees, ₹ 400, Save ₹ 100',
    });
    const plan3 = root.findByProps({
      accessibilityLabel: '3rd Year Renewal Fees, ₹ 300, Save ₹ 200',
    });

    // 1st plan is checked by default
    expect(plan1.props.accessibilityState.checked).toBe(true);
    expect(plan2.props.accessibilityState.checked).toBe(false);
    expect(plan3.props.accessibilityState.checked).toBe(false);

    // Click 2nd plan
    await act(async () => {
      plan2.props.onPress();
    });

    expect(onPlanSelectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '2-year',
        label: '2nd Year Renewal Fees',
        price: '₹ 400',
      })
    );

    // Re-query or verify updated state
    const updatedPlan1 = root.findByProps({
      accessibilityLabel: '1st Year Renewal Fees, ₹ 500, Most Popular',
    });
    const updatedPlan2 = root.findByProps({
      accessibilityLabel: '2nd Year Renewal Fees, ₹ 400, Save ₹ 100',
    });

    expect(updatedPlan1.props.accessibilityState.checked).toBe(false);
    expect(updatedPlan2.props.accessibilityState.checked).toBe(true);
  });

  it('Phase 2: renders Three Year Renewal Information card with ₹300 highlight', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(
      root.findByProps({ children: 'After 3 years of consistent renewal,' })
    ).toBeDefined();
    expect(root.findByProps({ children: '₹ 300.' })).toBeDefined();
    expect(
      root.findByProps({ accessibilityLabel: '3-Year Renewal Information' })
    ).toBeDefined();
  });

  // -------------------------------------------------------------
  // PHASE 3 TESTS — Eligibility & Free Renewal Policy
  // -------------------------------------------------------------
  it('Phase 3: renders Membership Renewal Eligibility section with all 5 rows', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // Heading
    expect(root.findByProps({ children: 'Membership Renewal Eligibility' })).toBeDefined();

    // Row 1: District Unit
    expect(root.findByProps({ children: '1 persons in District Unit' })).toBeDefined();
    expect(root.findAllByProps({ children: '10 TH' }).length).toBeGreaterThanOrEqual(2); // Row 1 & Row 2
    expect(root.findByProps({ children: '1 Year' })).toBeDefined();

    // Row 2: State Unit
    expect(root.findByProps({ children: '1 person in State Unit' })).toBeDefined();
    expect(root.findByProps({ children: '2 Years' })).toBeDefined();

    // Row 3: Lion / Counselor / Ambassador
    expect(
      root.findByProps({
        children: '1 person in (Lion, Counselor or Ambassador of State)',
      })
    ).toBeDefined();
    expect(root.findByProps({ children: '12 TH' })).toBeDefined();
    expect(root.findByProps({ children: '3 Years' })).toBeDefined();

    // Row 4: Hon'ble State Director
    expect(
      root.findByProps({ children: "1 person in Hon'ble State Director" })
    ).toBeDefined();
    expect(root.findAllByProps({ children: 'GRADUATES' }).length).toBeGreaterThanOrEqual(2); // Row 4 & Row 5
    expect(root.findByProps({ children: '4 Years' })).toBeDefined();

    // Row 5: National Council Cell
    expect(
      root.findByProps({
        children: 'National Council Cell\n(Lawyers, Women or Minority)',
      })
    ).toBeDefined();
    expect(root.findByProps({ children: '5 Years' })).toBeDefined();
  });

  it('Phase 3: renders Note for Free Renewal Policy card with all 3 numbered points', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(
      root.findByProps({ children: 'Note for Free Renewal Policy' })
    ).toBeDefined();
    expect(
      root.findByProps({ accessibilityLabel: 'Note for Free Renewal Policy' })
    ).toBeDefined();

    // Point 1
    expect(
      root.findByProps({
        children:
          'There is no need to wait for the renewal period to arrive. Renewal can be processed anytime.',
      })
    ).toBeDefined();

    // Point 2
    expect(
      root.findByProps({
        children:
          'When you introduce a new member, your ID will be sent along with theirs, and your renewal period will be extended accordingly.',
      })
    ).toBeDefined();

    // Point 3
    expect(
      root.findByProps({
        children:
          'If you introduce new members multiple times within a year, you will receive a free renewal each time, and a new ID will be issued to you every time.',
      })
    ).toBeDefined();
  });

  // -------------------------------------------------------------
  // PHASE 4 TESTS — Contact Bar & Renew Now Button
  // -------------------------------------------------------------
  it('Phase 4: renders Website + WhatsApp Contact Bar with correct details', async () => {
    const onWebsiteMock = jest.fn();
    const onWhatsAppMock = jest.fn();

    const renderer = await renderScreen({
      onWebsitePress: onWebsiteMock,
      onWhatsAppPress: onWhatsAppMock,
    });
    const root = renderer.root;

    expect(root.findByProps({ children: 'https://hrsjm.org/' })).toBeDefined();
    expect(root.findByProps({ children: '7021057853' })).toBeDefined();

    const websiteBtn = root.findByProps({
      accessibilityLabel: 'Website: https://hrsjm.org/',
    });
    const whatsAppBtn = root.findByProps({
      accessibilityLabel: 'WhatsApp: 7021057853',
    });

    await act(async () => {
      websiteBtn.props.onPress();
      whatsAppBtn.props.onPress();
    });

    expect(onWebsiteMock).toHaveBeenCalledTimes(1);
    expect(onWhatsAppMock).toHaveBeenCalledTimes(1);
  });

  it('Phase 4: renders Renew Now button and triggers onRenewPress with selected plan', async () => {
    const onRenewMock = jest.fn();
    const renderer = await renderScreen({ onRenewPress: onRenewMock });
    const root = renderer.root;

    const renewBtn = root.findByProps({ accessibilityLabel: 'Renew Now' });
    expect(renewBtn).toBeDefined();
    expect(root.findByProps({ children: 'Renew Now →' })).toBeDefined();

    await act(async () => {
      renewBtn.props.onPress();
    });

    // Default selected plan is '1-year'
    expect(onRenewMock).toHaveBeenCalledWith('1-year');
  });

  // -------------------------------------------------------------
  // PHASE 5 TESTS — Complete Regression Flow
  // -------------------------------------------------------------
  it('Phase 5: completes full regression verification for Renew Membership page', async () => {
    const onRenewMock = jest.fn();
    const onPlanSelectMock = jest.fn();
    const renderer = await renderScreen({
      onRenewPress: onRenewMock,
      onPlanSelect: onPlanSelectMock,
    });
    const root = renderer.root;

    // 1. Header
    expect(root.findByProps({ children: 'HRSJM' })).toBeDefined();

    // 2. Title
    expect(root.findByProps({ children: 'Renew Membership' })).toBeDefined();

    // 3. Expiry alert
    expect(
      root.findByProps({ children: 'Your membership is expiring soon!' })
    ).toBeDefined();
    expect(root.findByProps({ children: 'Only 7 days remaining' })).toBeDefined();

    // 4. Current membership
    expect(root.findByProps({ children: 'District Unit' })).toBeDefined();
    expect(root.findByProps({ children: '15 Oct 2026' })).toBeDefined();
    expect(root.findByProps({ children: '7 days' })).toBeDefined();

    // 5. Select 3rd Year Plan and verify update
    const plan3 = root.findByProps({
      accessibilityLabel: '3rd Year Renewal Fees, ₹ 300, Save ₹ 200',
    });
    await act(async () => {
      plan3.props.onPress();
    });

    expect(onPlanSelectMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: '3-year', price: '₹ 300' })
    );

    // 6. Press Renew Now with 3-year selected
    const renewBtn = root.findByProps({ accessibilityLabel: 'Renew Now' });
    await act(async () => {
      renewBtn.props.onPress();
    });

    expect(onRenewMock).toHaveBeenCalledWith('3-year');

    // 7. Verify Eligibility table and all 5 rows exist
    expect(root.findByProps({ children: '1 persons in District Unit' })).toBeDefined();
    expect(root.findByProps({ children: '1 person in State Unit' })).toBeDefined();
    expect(
      root.findByProps({
        children: '1 person in (Lion, Counselor or Ambassador of State)',
      })
    ).toBeDefined();
    expect(
      root.findByProps({ children: "1 person in Hon'ble State Director" })
    ).toBeDefined();
    expect(
      root.findByProps({
        children: 'National Council Cell\n(Lawyers, Women or Minority)',
      })
    ).toBeDefined();

    // 8. Verify Free Renewal Policy and 3 points exist
    expect(
      root.findByProps({ children: 'Note for Free Renewal Policy' })
    ).toBeDefined();

    // 9. Verify Website & WhatsApp
    expect(root.findByProps({ children: 'https://hrsjm.org/' })).toBeDefined();
    expect(root.findByProps({ children: '7021057853' })).toBeDefined();
  });
});




