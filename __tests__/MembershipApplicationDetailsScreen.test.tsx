import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  MembershipApplicationDetailsScreen,
  membershipApplicationsStore,
} from '../src/features/admin/membershipApplications';

describe('MembershipApplicationDetailsScreen Status Flow & Confirmation Tests', () => {
  beforeEach(() => {
    // Reset Aman Shaikh to under_review before each test
    membershipApplicationsStore.updateStatus('APP20260915001', 'under_review');
  });

  const renderDetailsScreen = async (props = {}) => {
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
            applicationId="APP20260915001"
            onBack={jest.fn()}
            {...props}
          />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders initial state: Activity Log has only Application Submitted and bottom bar has Under Review button', async () => {
    const renderer = await renderDetailsScreen();
    const root = renderer.root;

    // Bottom bar has Under Review button
    expect(root.findByProps({ accessibilityLabel: 'Under Review Action' })).toBeDefined();

    // Switch to Activity Log tab
    const tabs = root.findAllByProps({ accessibilityRole: 'tab' });
    const activityTab = tabs.find(tab => {
      const texts = tab.findAllByType(Text);
      return texts.some(t => String(t.props.children || '') === 'Activity Log');
    });

    await act(async () => {
      activityTab!.props.onPress();
    });

    expect(root.findByProps({ children: 'Application Submitted' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Application is under review by admin.' }).length).toBe(0);
  });

  it('Scenario 1: Click Approve -> Popup appears -> Click Cancel -> Status remains Under Review', async () => {
    const renderer = await renderDetailsScreen();
    const root = renderer.root;

    // Click Under Review
    const underReviewBtn = root.findByProps({ accessibilityLabel: 'Under Review Action' });
    await act(async () => {
      underReviewBtn.props.onPress();
    });

    // Click Approve button
    const approveBtn = root.findByProps({ accessibilityLabel: 'Approve Application' });
    await act(async () => {
      approveBtn.props.onPress();
    });

    // Confirm Approval modal is visible
    expect(root.findByProps({ children: 'Confirm Approval' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'After approving the status you cannot change the status. Are you sure you want to approve this application?',
      })
    ).toBeDefined();

    // Click Cancel
    const cancelBtn = root.findByProps({ accessibilityLabel: 'Cancel status change' });
    await act(async () => {
      cancelBtn.props.onPress();
    });

    // Store is still under_review
    const app = membershipApplicationsStore.getApplicationById('APP20260915001');
    expect(app?.status).toBe('under_review');
  });

  it('Scenario 2: Click Approve -> Popup appears -> Click OK -> Status becomes Approved', async () => {
    const renderer = await renderDetailsScreen();
    const root = renderer.root;

    // Click Under Review
    const underReviewBtn = root.findByProps({ accessibilityLabel: 'Under Review Action' });
    await act(async () => {
      underReviewBtn.props.onPress();
    });

    // Click Approve button
    const approveBtn = root.findByProps({ accessibilityLabel: 'Approve Application' });
    await act(async () => {
      approveBtn.props.onPress();
    });

    // Click OK on modal
    const okBtn = root.findByProps({ accessibilityLabel: 'Confirm Approval' });
    await act(async () => {
      okBtn.props.onPress();
    });

    // Store is updated to approved
    const app = membershipApplicationsStore.getApplicationById('APP20260915001');
    expect(app?.status).toBe('approved');

    // Bottom bar shows Approved
    expect(root.findAllByProps({ children: 'Approved' }).length).toBeGreaterThanOrEqual(1);

    // Switch to Activity Log tab and verify all 3 statuses exist
    const tabs = root.findAllByProps({ accessibilityRole: 'tab' });
    const activityTab = tabs.find(tab => {
      const texts = tab.findAllByType(Text);
      return texts.some(t => String(t.props.children || '') === 'Activity Log');
    });

    await act(async () => {
      activityTab!.props.onPress();
    });

    expect(root.findByProps({ children: 'Application Submitted' })).toBeDefined();
    expect(root.findByProps({ children: 'Application is under review by admin.' })).toBeDefined();
    expect(root.findByProps({ children: 'Application approved successfully.' })).toBeDefined();
  });

  it('Scenario 3: Click Reject -> Popup appears -> Click Cancel -> Status remains Under Review', async () => {
    const renderer = await renderDetailsScreen();
    const root = renderer.root;

    // Click Under Review
    const underReviewBtn = root.findByProps({ accessibilityLabel: 'Under Review Action' });
    await act(async () => {
      underReviewBtn.props.onPress();
    });

    // Click Reject button
    const rejectBtn = root.findByProps({ accessibilityLabel: 'Reject Application' });
    await act(async () => {
      rejectBtn.props.onPress();
    });

    // Confirm Rejection modal is visible
    expect(root.findByProps({ children: 'Confirm Rejection' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'After rejecting the status you cannot change the status. Are you sure you want to reject this application?',
      })
    ).toBeDefined();

    // Click Cancel
    const cancelBtn = root.findByProps({ accessibilityLabel: 'Cancel status change' });
    await act(async () => {
      cancelBtn.props.onPress();
    });

    // Store is still under_review
    const app = membershipApplicationsStore.getApplicationById('APP20260915001');
    expect(app?.status).toBe('under_review');
  });

  it('Scenario 4: Click Reject -> Popup appears -> Click OK -> Status becomes Rejected', async () => {
    const renderer = await renderDetailsScreen();
    const root = renderer.root;

    // Click Under Review
    const underReviewBtn = root.findByProps({ accessibilityLabel: 'Under Review Action' });
    await act(async () => {
      underReviewBtn.props.onPress();
    });

    // Click Reject button
    const rejectBtn = root.findByProps({ accessibilityLabel: 'Reject Application' });
    await act(async () => {
      rejectBtn.props.onPress();
    });

    // Click OK on modal
    const okBtn = root.findByProps({ accessibilityLabel: 'Confirm Rejection' });
    await act(async () => {
      okBtn.props.onPress();
    });

    // Store is updated to rejected
    const app = membershipApplicationsStore.getApplicationById('APP20260915001');
    expect(app?.status).toBe('rejected');

    // Bottom bar shows Rejected
    expect(root.findAllByProps({ children: 'Rejected' }).length).toBeGreaterThanOrEqual(1);

    // Switch to Activity Log tab and verify all 3 statuses exist
    const tabs = root.findAllByProps({ accessibilityRole: 'tab' });
    const activityTab = tabs.find(tab => {
      const texts = tab.findAllByType(Text);
      return texts.some(t => String(t.props.children || '') === 'Activity Log');
    });

    await act(async () => {
      activityTab!.props.onPress();
    });

    expect(root.findByProps({ children: 'Application Submitted' })).toBeDefined();
    expect(root.findByProps({ children: 'Application is under review by admin.' })).toBeDefined();
    expect(root.findByProps({ children: 'Application rejected by admin.' })).toBeDefined();
  });
});
