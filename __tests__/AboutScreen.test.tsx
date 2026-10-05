import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AboutScreen } from '../src/features/about/screens/AboutScreen';
import { AppModal } from '../src/core';
import { ABOUT_CONTENT } from '../src/features/about/content/aboutContent';
import { AppRoutes } from '../src/core/constants/routes';

/**
 * About screen (final delivery) — verifies the full section composition with
 * the approved copy and that EVERY visible control works: header back,
 * Read More expand/collapse, View All sheet, per-leader sheet, and the CTA
 * navigation to its real destination.
 */
describe('AboutScreen', () => {
  const initialMetrics = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };

  const renderScreen = async (props: {
    onBack?: () => void;
    onNavigate?: (target: string) => void;
  } = {}) => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    // act() flushes async hydration before assertions.
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <AboutScreen onBack={props.onBack} onNavigate={props.onNavigate} />
        </SafeAreaProvider>,
      );
    });
    return renderer;
  };

  const hasText = (
    root: ReactTestRenderer.ReactTestInstance,
    needle: string,
  ) =>
    root.findAllByType('Text' as never).some(node =>
      String(node.props.children ?? '').includes(needle),
    );

  const pressLabel = async (
    root: ReactTestRenderer.ReactTestInstance,
    label: string,
  ) => {
    const button = root.findByProps({ accessibilityLabel: label });
    await ReactTestRenderer.act(async () => {
      (button.props.onPress as () => void)();
    });
  };

  it('renders every section with the approved reference copy', async () => {
    const renderer = await renderScreen();

    expect(hasText(renderer.root, 'About HRSJM')).toBe(true);
    expect(hasText(renderer.root, 'Who We Are')).toBe(true);
    expect(
      hasText(
        renderer.root,
        'people-driven organisation dedicated to protecting human rights',
      ),
    ).toBe(true);
    expect(hasText(renderer.root, 'Our Belief')).toBe(true);
    expect(
      hasText(
        renderer.root,
        'A fairer society is possible when people stand together',
      ),
    ).toBe(true);
    expect(hasText(renderer.root, 'Our Mission & Vision')).toBe(true);
    expect(
      hasText(
        renderer.root,
        'Our work is guided by strong values that keep people and justice',
      ),
    ).toBe(true);
    expect(hasText(renderer.root, 'Leadership')).toBe(true);
    expect(hasText(renderer.root, 'Together for a More Just Society.')).toBe(
      true,
    );
  });

  it('renders the hero words, six values and three leaders', async () => {
    const renderer = await renderScreen();

    for (const line of ABOUT_CONTENT.hero.lines) {
      expect(hasText(renderer.root, line)).toBe(true);
    }
    for (const value of ABOUT_CONTENT.values.items) {
      expect(hasText(renderer.root, value.title)).toBe(true);
    }
    for (const member of ABOUT_CONTENT.leadership.members) {
      expect(hasText(renderer.root, member.name)).toBe(true);
    }
  });

  it('expands and collapses the Who We Are copy via Read More', async () => {
    const renderer = await renderScreen();

    expect(hasText(renderer.root, 'Read More')).toBe(true);
    await pressLabel(renderer.root, 'Read more about HRSJM');
    expect(hasText(renderer.root, 'Read Less')).toBe(true);
    await pressLabel(renderer.root, 'Read less about HRSJM');
    expect(hasText(renderer.root, 'Read More')).toBe(true);
  });

  it('opens the leadership sheet from View All', async () => {
    const renderer = await renderScreen();

    await pressLabel(renderer.root, 'View all leadership members');
    const modals = renderer.root.findAllByType(AppModal);
    expect(modals.some(modal => modal.props.visible === true)).toBe(true);
    expect(
      modals.some(
        modal =>
          modal.props.visible === true && modal.props.title === 'Leadership',
      ),
    ).toBe(true);
  });

  it('opens a leader sheet from the card arrow chip', async () => {
    const renderer = await renderScreen();

    await pressLabel(renderer.root, 'View Dr. A. Rahman, President');
    const modals = renderer.root.findAllByType(AppModal);
    expect(
      modals.some(
        modal =>
          modal.props.visible === true &&
          modal.props.title === 'Dr. A. Rahman',
      ),
    ).toBe(true);
  });

  it('navigates to the real CTA destination from Join the Movement', async () => {
    const onNavigate = jest.fn();
    const renderer = await renderScreen({ onNavigate });

    expect(hasText(renderer.root, 'Join the Movement')).toBe(true);
    await pressLabel(renderer.root, 'Join the Movement');
    expect(onNavigate).toHaveBeenCalledWith(AppRoutes.DONATIONS);
  });

  it('invokes onBack from the header back button', async () => {
    const onBack = jest.fn();
    const renderer = await renderScreen({ onBack });

    await pressLabel(renderer.root, 'Go back');
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
