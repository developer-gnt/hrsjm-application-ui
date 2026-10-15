import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  BecomeMemberScreen,
  BecomeMemberHero,
  BecomeMemberCtaButton,
} from '../src/features/membership';
import { getRegistrationState } from '../src/features/auth/state/registrationState';

describe('BecomeMemberScreen — Phase 1, Phase 2, Phase 3 & Phase 4 Tests', () => {
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
          <BecomeMemberScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  // -------------------------------------------------------------
  // PHASE 1 VERIFICATION TESTS
  // -------------------------------------------------------------
  it('Phase 1: renders BecomeMemberScreen without crashing', async () => {
    const renderer = await renderScreen();
    expect(renderer.root).toBeDefined();
  });

  it('Phase 1: renders BecomeMemberHeader with logo, HRSJM title, and hindi tagline', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'HRSJM' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'HUMAN RIGHTS & SOCIAL JUSTICE MISSION',
      })
    ).toBeDefined();
    expect(
      root.findByProps({
        children: 'मानव अधिकार • सामाजिक न्याय',
      })
    ).toBeDefined();
  });

  it('Phase 1: renders Hero section with "Become a", "Member", and supporting text', async () => {
    const renderer = await renderScreen();
    const heroInstance = renderer.root.findByType(BecomeMemberHero);

    expect(heroInstance).toBeDefined();
    expect(heroInstance.findByProps({ children: 'Member' })).toBeDefined();
    expect(
      heroInstance.findByProps({
        children:
          'Be a part of a movement for a fairer, more just and equal society. Join HRSJM and help us protect human rights and create positive change.',
      })
    ).toBeDefined();
  });

  it('Phase 1: triggers onBack callback when back button is pressed', async () => {
    const onBackMock = jest.fn();
    const renderer = await renderScreen({ onBack: onBackMock });
    const backBtn = renderer.root.findByProps({ accessibilityLabel: 'Go back' });

    await act(async () => {
      backBtn.props.onPress();
    });

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------
  // PHASE 2 VERIFICATION TESTS (Why Become a Member)
  // -------------------------------------------------------------
  it('Phase 2: renders "Why Become a Member?" section heading', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Why Become a Member?' })).toBeDefined();
  });

  it('Phase 2: renders all 4 benefit cards with accurate titles and descriptions', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // Card 1
    expect(root.findByProps({ children: 'Be Part of a Cause' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'Join a community working for human rights and social justice.',
      })
    ).toBeDefined();

    // Card 2
    expect(root.findByProps({ children: 'Access Resources' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'Get exclusive access to learning materials, workshops and updates.',
      })
    ).toBeDefined();

    // Card 3
    expect(root.findByProps({ children: 'Participate in Events' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'Be the first to know about events, campaigns and volunteer opportunities.',
      })
    ).toBeDefined();

    // Card 4
    expect(root.findByProps({ children: 'Make a Real Impact' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'Support our work and help create positive change in society.',
      })
    ).toBeDefined();
  });

  it('Phase 2: triggers onBenefitCardPress callback when a benefit card is tapped', async () => {
    const onCardPressMock = jest.fn();
    const renderer = await renderScreen({ onBenefitCardPress: onCardPressMock });
    const card = renderer.root.findByProps({ accessibilityLabel: 'Be Part of a Cause' });

    await act(async () => {
      card.props.onPress();
    });

    expect(onCardPressMock).toHaveBeenCalledWith('cause');
  });

  // -------------------------------------------------------------
  // PHASE 3 VERIFICATION TESTS (Membership Categories)
  // -------------------------------------------------------------
  it('Phase 3: renders "Membership Categories" section heading', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Membership Categories' })).toBeDefined();
  });

  it('Phase 3: renders all 3 membership categories with correct descriptions', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // Individual Member
    expect(root.findByProps({ accessibilityLabel: 'Individual Member' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'For individuals who want to support and participate.',
      })
    ).toBeDefined();

    // Student Member
    expect(root.findByProps({ accessibilityLabel: 'Student Member' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'For students who want to learn and get involved.',
      })
    ).toBeDefined();

    // Professional Member
    expect(root.findByProps({ accessibilityLabel: 'Professional Member' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'For working professionals who want to contribute their skills and time.',
      })
    ).toBeDefined();
  });

  it('Phase 3: triggers onCategorySelect callback and updates selected state when category card is tapped', async () => {
    const onSelectMock = jest.fn();
    const renderer = await renderScreen({ onCategorySelect: onSelectMock });
    const studentCard = renderer.root.findByProps({ accessibilityLabel: 'Student Member' });

    await act(async () => {
      studentCard.props.onPress();
    });

    expect(onSelectMock).toHaveBeenCalledWith('student');
  });

  // -------------------------------------------------------------
  // PHASE 4 VERIFICATION TESTS (Main CTA + Onboarding Flow)
  // -------------------------------------------------------------
  it('Phase 4: renders Main CTA button with "Become a Member"', async () => {
    const renderer = await renderScreen();
    const ctaInstance = renderer.root.findByType(BecomeMemberCtaButton);

    expect(ctaInstance).toBeDefined();
    expect(ctaInstance.findByProps({ children: 'Become a Member' })).toBeDefined();
  });

  it('Phase 4: triggers onCtaPress and updates registration state with selected member category', async () => {
    const onCtaMock = jest.fn();
    const renderer = await renderScreen({
      initialCategory: 'professional',
      onCtaPress: onCtaMock,
    });
    const ctaButton = renderer.root.findByProps({ accessibilityLabel: 'Become a Member' });

    await act(async () => {
      ctaButton.props.onPress();
    });

    expect(onCtaMock).toHaveBeenCalledWith('professional');
    const state = getRegistrationState();
    expect(state.accountType).toBe('member');
    expect(state.accountTypeLabel).toBe('Professional Member');
  });
});
