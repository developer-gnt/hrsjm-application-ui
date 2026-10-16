import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import {
  ApplicationStatusScreen,
  ApplicationUnderReviewScreen,
  ApplicationApprovedStatusScreen,
  ApplicationRejectedStatusScreen,
} from '../src/features/membership/screens/ApplicationStatusScreen';
import { ApplicationAppliedScreen } from '../src/features/membership/screens/ApplicationAppliedScreen';
import { MyApplicationScreen } from '../src/features/membership/screens/MyApplicationScreen';
import { MembershipProvider } from '../src/features/membership/context/MembershipContext';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      getState: () => ({ routeNames: ['MyApplication', 'ApplicationDetails'] }),
    }),
    useFocusEffect: (cb: any) => {
      try {
        cb();
      } catch {}
    },
    useRoute: () => ({
      params: { applicationId: 'APP-20261012-001' },
    }),
  };
});

describe('My Status Inner Pages (Application Status)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = async (ui: React.ReactElement) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>{ui}</MembershipProvider>,
      );
    });
    return renderer!;
  };

  it('1. Applied Successfully: renders green success banner, details, and 1-step timeline', async () => {
    const renderer = await renderComponent(
      <ApplicationStatusScreen initialStatus="applied" />,
    );

    const rootText = JSON.stringify(renderer.toJSON());

    // Header & Banner
    expect(rootText).toContain('Application Status');
    expect(rootText).toContain('Applied Successfully');
    expect(rootText).toContain('Your application has been submitted successfully.');

    // Details Card
    expect(rootText).toContain('Application Type');
    expect(rootText).toContain('Application ID');
    expect(rootText).toContain('Applied on');

    // Approved on and Rejected on should NOT be present
    expect(rootText).not.toContain('Approved on');
    expect(rootText).not.toContain('Rejected on');

    // Status Timeline Card
    expect(rootText).toContain('Status Timeline');

    // Bottom Button
    expect(rootText).toContain('Back to My Status');
  });

  it('2. Under Review: renders golden status banner, details, and 2-step timeline', async () => {
    const renderer = await renderComponent(
      <ApplicationStatusScreen initialStatus="under_review" />,
    );

    const rootText = JSON.stringify(renderer.toJSON());

    // Banner
    expect(rootText).toContain('Under Review');
    expect(rootText).toContain('Your application is currently under review.');

    // Details
    expect(rootText).toContain('Application Type');
    expect(rootText).toContain('Application ID');
    expect(rootText).toContain('Applied on');
    expect(rootText).not.toContain('Approved on');
    expect(rootText).not.toContain('Rejected on');

    // Timeline has both Applied and Under Review
    expect(rootText).toContain('Status Timeline');
    expect(rootText).toContain('Applied Successfully');
    expect(rootText).toContain('Under Review');
  });

  it('3. Approved: renders green banner, Approved on row, and 3-step timeline', async () => {
    const renderer = await renderComponent(
      <ApplicationStatusScreen initialStatus="approved" />,
    );

    const rootText = JSON.stringify(renderer.toJSON());

    // Banner
    expect(rootText).toContain('Approved');
    expect(rootText).toContain('Your application has been approved.');
    expect(rootText).toContain('You can now access all member benefits.');

    // Details contains Approved on
    expect(rootText).toContain('Approved on');
    expect(rootText).not.toContain('Rejected on');

    // Timeline has 3 stages
    expect(rootText).toContain('Status Timeline');
    expect(rootText).toContain('Applied Successfully');
    expect(rootText).toContain('Under Review');
    expect(rootText).toContain('Approved');
  });

  it('4. Rejected: renders red error banner, Rejected on, Rejection Reason, and timeline', async () => {
    const renderer = await renderComponent(
      <ApplicationStatusScreen initialStatus="rejected" />,
    );

    const rootText = JSON.stringify(renderer.toJSON());

    // Banner
    expect(rootText).toContain('Rejected');
    expect(rootText).toContain('Your application has been rejected.');

    // Details contains Rejected on
    expect(rootText).toContain('Rejected on');

    // Rejection Reason Callout
    expect(rootText).toContain('Reason');

    // Timeline
    expect(rootText).toContain('Status Timeline');
    expect(rootText).toContain('Applied Successfully');
    expect(rootText).toContain('Under Review');
  });

  it('5. Individual component wrappers mount correctly', async () => {
    const appWrapper = await renderComponent(<ApplicationAppliedScreen />);
    expect(JSON.stringify(appWrapper.toJSON())).toContain('Applied Successfully');

    const reviewWrapper = await renderComponent(<ApplicationUnderReviewScreen />);
    expect(JSON.stringify(reviewWrapper.toJSON())).toContain('Under Review');

    const approvedWrapper = await renderComponent(<ApplicationApprovedStatusScreen />);
    expect(JSON.stringify(approvedWrapper.toJSON())).toContain('Approved');

    const rejectedWrapper = await renderComponent(<ApplicationRejectedStatusScreen />);
    expect(JSON.stringify(rejectedWrapper.toJSON())).toContain('Rejected');
  });

  it('6. MyApplicationScreen renders screen cleanly', async () => {
    const renderer = await renderComponent(<MyApplicationScreen />);

    const rootText = JSON.stringify(renderer.toJSON());
    expect(rootText).toContain('My Application');
    expect(rootText).not.toContain('statusButtonsCard');
  });
});
