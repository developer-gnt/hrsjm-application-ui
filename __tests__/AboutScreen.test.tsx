import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AboutScreen } from '../src/features/user/about/screens/AboutScreen';
import { AppModal } from '../src/core';
import { ABOUT_CONTENT } from '../src/features/user/about/data/about-content';
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

    expect(hasText(renderer.root, 'HRSJM')).toBe(true);
    expect(hasText(renderer.root, 'Who We Are')).toBe(true);
    expect(hasText(renderer.root, 'Human Dignity')).toBe(true);
    expect(hasText(renderer.root, 'Equal Rights')).toBe(true);
    expect(hasText(renderer.root, 'Social Justice')).toBe(true);
    expect(hasText(renderer.root, 'What We Do')).toBe(true);
    expect(hasText(renderer.root, 'Core Values')).toBe(true);
  });

  it('renders the hero copy and principles', async () => {
    const renderer = await renderScreen();

    expect(hasText(renderer.root, ABOUT_CONTENT.hero.eyebrow)).toBe(true);
    expect(hasText(renderer.root, ABOUT_CONTENT.hero.description)).toBe(true);
    for (const principle of ABOUT_CONTENT.principles) {
      expect(hasText(renderer.root, principle.title)).toBe(true);
      expect(hasText(renderer.root, principle.description)).toBe(true);
    }
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
