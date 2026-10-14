import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserActionPageScreen } from './UserActionPageScreen';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';

describe('UserActionPageScreen', () => {
  const initialMetrics = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };

  it('does not render duplicate UserBottomNavigation by default or when hideBottomNav is true', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <UserActionPageScreen
            pageId="donate"
            onBack={jest.fn()}
          />
        </SafeAreaProvider>,
      );
    });
    expect(renderer.root.findAllByType(UserBottomNavigation)).toHaveLength(0);
  });

  it('renders UserBottomNavigation only when showBottomNav is explicitly true and hideBottomNav is false', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <UserActionPageScreen
            pageId="donate"
            showBottomNav={true}
            hideBottomNav={false}
            onBack={jest.fn()}
          />
        </SafeAreaProvider>,
      );
    });
    expect(renderer.root.findAllByType(UserBottomNavigation)).toHaveLength(1);
  });

  it('invokes onOpenMembershipCategories when tapping the Apply for Membership CTA button', async () => {
    const onOpenMembershipCategories = jest.fn();
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <UserActionPageScreen
            pageId="join"
            onBack={jest.fn()}
            onOpenMembershipCategories={onOpenMembershipCategories}
          />
        </SafeAreaProvider>,
      );
    });

    const ctaButton = renderer.root.findByProps({
      accessibilityLabel: 'Apply for Membership',
    });
    expect(ctaButton).toBeDefined();

    await ReactTestRenderer.act(async () => {
      ctaButton.props.onPress();
    });

    expect(onOpenMembershipCategories).toHaveBeenCalledTimes(1);
  });
});
