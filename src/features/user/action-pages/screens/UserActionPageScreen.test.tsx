import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserActionPageScreen } from './UserActionPageScreen';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import { GlobalPaymentModal } from '../../../payments';

jest.mock('../../../member/services/causes.service', () => ({
  causesService: {
    getCauses: jest.fn().mockResolvedValue([]),
    recordDonation: jest.fn(),
  },
}));

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

  it('opens GlobalPaymentModal when tapping the Donate Now button on donate page', async () => {
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

    const paymentModal = renderer.root.findByType(GlobalPaymentModal);
    expect(paymentModal.props.visible).toBe(false);

    const donateButton = renderer.root.findByProps({
      accessibilityLabel: 'Donate Now ₹500',
    });
    expect(donateButton).toBeDefined();

    await ReactTestRenderer.act(async () => {
      donateButton.props.onPress();
    });

    expect(paymentModal.props.visible).toBe(true);
    expect(paymentModal.props.payload.amount).toBe(500);
    expect(paymentModal.props.payload.purpose).toBe('donation');
  });

  it('updates donation payload when selecting a cause card and a different amount', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <UserActionPageScreen pageId="donate" onBack={jest.fn()} />
        </SafeAreaProvider>,
      );
    });

    // Select "Community Activities" cause
    const communityCauseButton = renderer.root.findByProps({
      accessibilityLabel: 'Cause: Community Activities',
    });
    expect(communityCauseButton).toBeDefined();

    await ReactTestRenderer.act(async () => {
      communityCauseButton.props.onPress();
    });

    // Select ₹1,000 amount chip
    const amount1000Button = renderer.root.findAllByProps({
      accessibilityRole: 'radio',
    }).find(node => {
      const texts = node.findAllByType('Text' as any);
      return texts.some((t: any) => t.props.children === '₹1,000');
    });
    expect(amount1000Button).toBeDefined();

    await ReactTestRenderer.act(async () => {
      amount1000Button?.props.onPress();
    });

    // Press the Donate Now button
    const donateButton = renderer.root.findByProps({
      accessibilityLabel: 'Donate Now ₹1,000',
    });
    expect(donateButton).toBeDefined();

    await ReactTestRenderer.act(async () => {
      donateButton.props.onPress();
    });

    const paymentModal = renderer.root.findByType(GlobalPaymentModal);
    expect(paymentModal.props.visible).toBe(true);
    expect(paymentModal.props.payload.amount).toBe(1000);
    expect(paymentModal.props.payload.category).toBe('Community Activities');
    expect(paymentModal.props.payload.title).toBe('HRSJM Donation - Community Activities');
    expect(paymentModal.props.payload.purpose).toBe('donation');
  });

  it('opens payment gateway when clicking the bottom CTA banner Donate Now button', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <UserActionPageScreen pageId="donate" onBack={jest.fn()} />
        </SafeAreaProvider>,
      );
    });

    const ctaBannerButton = renderer.root.findByProps({
      accessibilityLabel: 'Donate Now',
    });
    expect(ctaBannerButton).toBeDefined();

    await ReactTestRenderer.act(async () => {
      ctaBannerButton.props.onPress();
    });

    const paymentModal = renderer.root.findByType(GlobalPaymentModal);
    expect(paymentModal.props.visible).toBe(true);
    expect(paymentModal.props.payload.purpose).toBe('donation');
    expect(paymentModal.props.payload.amount).toBe(500);
  });
});
