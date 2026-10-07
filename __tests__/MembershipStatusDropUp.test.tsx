import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  MembershipApplicationDetailsScreen,
  membershipApplicationsStore,
} from '../src/features/admin/membershipApplications';

describe('Membership Application Status Drop-Up Phase 4 Tests', () => {
  const renderDetailsScreen = async (applicationId = 'APP20260915001') => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <MembershipApplicationDetailsScreen
            applicationId={applicationId}
            onBack={jest.fn()}
          />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders "Application Status" button and opens drop-up modal with 3 status options', async () => {
    const renderer = await renderDetailsScreen('APP20260914023');
    const root = renderer.root;

    // Find the bottom Application Status button
    const statusBtn = root.findByProps({ accessibilityLabel: 'Application Status' });
    expect(statusBtn).toBeDefined();

    // Click to open drop-up
    await act(async () => {
      statusBtn.props.onPress();
    });

    // Drop-up title and 3 options
    expect(root.findByProps({ children: 'Update Application Status' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Set status to Under Review' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Set status to Approved' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Set status to Rejected' })).toBeDefined();
  });

  it('updates application status to Approved when Approved option is selected in drop-up', async () => {
    const renderer = await renderDetailsScreen('APP20260914023'); // initially under_review
    const root = renderer.root;

    // Open drop-up
    const statusBtn = root.findByProps({ accessibilityLabel: 'Application Status' });
    await act(async () => {
      statusBtn.props.onPress();
    });

    // Select "Approved"
    const approvedOption = root.findByProps({ accessibilityLabel: 'Set status to Approved' });
    await act(async () => {
      approvedOption.props.onPress();
    });

    // Verify application status updated in store
    const app = membershipApplicationsStore.getApplicationById('APP20260914023');
    expect(app?.status).toBe('approved');
  });

  it('updates application status to Rejected when Rejected option is selected in drop-up', async () => {
    const renderer = await renderDetailsScreen('APP20260914023');
    const root = renderer.root;

    // Open drop-up
    const statusBtn = root.findByProps({ accessibilityLabel: 'Application Status' });
    await act(async () => {
      statusBtn.props.onPress();
    });

    // Select "Rejected"
    const rejectedOption = root.findByProps({ accessibilityLabel: 'Set status to Rejected' });
    await act(async () => {
      rejectedOption.props.onPress();
    });

    const app = membershipApplicationsStore.getApplicationById('APP20260914023');
    expect(app?.status).toBe('rejected');
  });

  it('updates application status to Under Review when Under Review option is selected', async () => {
    const renderer = await renderDetailsScreen('APP20260914023');
    const root = renderer.root;

    // Open drop-up
    const statusBtn = root.findByProps({ accessibilityLabel: 'Application Status' });
    await act(async () => {
      statusBtn.props.onPress();
    });

    // Select "Under Review"
    const underReviewOption = root.findByProps({ accessibilityLabel: 'Set status to Under Review' });
    await act(async () => {
      underReviewOption.props.onPress();
    });

    const app = membershipApplicationsStore.getApplicationById('APP20260914023');
    expect(app?.status).toBe('under_review');
  });
});
