import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  MembershipApplicationDetailsScreen,
  membershipApplicationsStore,
} from '../src/features/admin/membershipApplications';

describe('Membership Application Status Action Flow Tests', () => {
  beforeEach(() => {
    membershipApplicationsStore.updateStatus('APP20260914023', 'under_review');
  });

  const renderDetailsScreen = async (applicationId = 'APP20260914023') => {
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

  it('renders initial Under Review button and clicking it reveals 50/50 Reject and Approve buttons with 100% Back', async () => {
    const renderer = await renderDetailsScreen('APP20260914023');
    const root = renderer.root;

    // Find the bottom Under Review action button
    const underReviewBtn = root.findByProps({ accessibilityLabel: 'Under Review Action' });
    expect(underReviewBtn).toBeDefined();

    // Click to expand action area
    await act(async () => {
      underReviewBtn.props.onPress();
    });

    // 50/50 Reject and Approve buttons are shown
    expect(root.findByProps({ accessibilityLabel: 'Reject Application' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Approve Application' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Go back to list' })).toBeDefined();
  });

  it('updates application status to Approved when Approve button is pressed and confirmed in popup', async () => {
    const renderer = await renderDetailsScreen('APP20260914023');
    const root = renderer.root;

    // Expand action area
    const underReviewBtn = root.findByProps({ accessibilityLabel: 'Under Review Action' });
    await act(async () => {
      underReviewBtn.props.onPress();
    });

    // Press Approve
    const approveBtn = root.findByProps({ accessibilityLabel: 'Approve Application' });
    await act(async () => {
      approveBtn.props.onPress();
    });

    // Confirmation popup appears
    expect(root.findByProps({ children: 'Confirm Approval' })).toBeDefined();

    // Confirm OK
    const okBtn = root.findByProps({ accessibilityLabel: 'Confirm Approval' });
    await act(async () => {
      okBtn.props.onPress();
    });

    // Verify application status updated in store
    const app = membershipApplicationsStore.getApplicationById('APP20260914023');
    expect(app?.status).toBe('approved');
  });

  it('updates application status to Rejected when Reject button is pressed and confirmed in popup', async () => {
    const renderer = await renderDetailsScreen('APP20260914023');
    const root = renderer.root;

    // Expand action area
    const underReviewBtn = root.findByProps({ accessibilityLabel: 'Under Review Action' });
    await act(async () => {
      underReviewBtn.props.onPress();
    });

    // Press Reject
    const rejectBtn = root.findByProps({ accessibilityLabel: 'Reject Application' });
    await act(async () => {
      rejectBtn.props.onPress();
    });

    // Confirmation popup appears
    expect(root.findByProps({ children: 'Confirm Rejection' })).toBeDefined();

    // Confirm OK
    const okBtn = root.findByProps({ accessibilityLabel: 'Confirm Rejection' });
    await act(async () => {
      okBtn.props.onPress();
    });

    const app = membershipApplicationsStore.getApplicationById('APP20260914023');
    expect(app?.status).toBe('rejected');
  });
});
