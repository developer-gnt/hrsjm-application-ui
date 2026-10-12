import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  UserDetailsScreen,
  usersStore,
  INITIAL_DEV_USERS,
} from '../src/features/admin/users';

describe('UserDetailsScreen (Screen 3) User Profile View Tests', () => {
  beforeEach(async () => {
    await act(async () => {
      usersStore.resetToFixtures();
    });
  });

  const renderScreen = async (props: { userId?: string; [key: string]: any }) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <UserDetailsScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders complete profile details matching the reference layout for a Member', async () => {
    // Aamir Khan is a Member (id: user-001, memberId: HRSJM00123)
    const renderer = await renderScreen({ userId: 'user-001' });
    const root = renderer.root;

    // Header info
    expect(root.findAllByProps({ children: 'Aamir Khan' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Member' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Active' }).length).toBeGreaterThanOrEqual(1);

    // 2x2 Metric Cards
    expect(root.findByProps({ children: 'Member ID' })).toBeDefined();
    expect(root.findByProps({ children: 'HRSJM00123' })).toBeDefined();
    expect(root.findByProps({ children: 'Joined On' })).toBeDefined();
    expect(root.findByProps({ children: 'Last Login' })).toBeDefined();
    expect(root.findByProps({ children: 'Total Donations' })).toBeDefined();

    // Table card fields
    expect(root.findByProps({ children: 'Full Name' })).toBeDefined();
    expect(root.findByProps({ children: 'Email Address' })).toBeDefined();
    expect(root.findAllByProps({ children: 'aamir.khan@example.com' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findByProps({ children: 'Phone Number' })).toBeDefined();
    expect(root.findAllByProps({ children: '+91 98765 43210' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findByProps({ children: 'Date of Birth' })).toBeDefined();
    expect(root.findByProps({ children: '12 Mar 1990' })).toBeDefined();
    expect(root.findByProps({ children: 'Gender' })).toBeDefined();
    expect(root.findByProps({ children: 'Male' })).toBeDefined();
    expect(root.findByProps({ children: 'Address' })).toBeDefined();
    expect(root.findByProps({ children: 'Mumbai, Maharashtra, India' })).toBeDefined();

    // Bottom action buttons
    expect(root.findByProps({ accessibilityLabel: 'Block User' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Reset Password' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Edit User Full Button' })).toBeDefined();
  });

  it('renders profile correctly for a Donor with total donations metric and User ID', async () => {
    // Rahul Mehta is a Donor (id: user-005, totalDonations: 12000, donationCount: 5)
    const renderer = await renderScreen({ userId: 'user-005' });
    const root = renderer.root;

    expect(root.findAllByProps({ children: 'Rahul Mehta' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Donor' }).length).toBeGreaterThanOrEqual(1);

    // Non-member displays User ID in metric card
    expect(root.findByProps({ children: 'User ID' })).toBeDefined();
    expect(root.findByProps({ children: '#user-005' })).toBeDefined();

    // Total donations metric card
    expect(root.findByProps({ children: '₹ 12,000' })).toBeDefined();
    expect(root.findByProps({ children: '(5 donations)' })).toBeDefined();
  });

  it('renders profile correctly for a Donation Seeker with Pending status', async () => {
    // Imran Ansari is a Seeker (id: user-003, status: pending)
    const renderer = await renderScreen({ userId: 'user-003' });
    const root = renderer.root;

    expect(root.findAllByProps({ children: 'Imran Ansari' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Donation Seeker' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Pending' }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders profile correctly for a General User with general category', async () => {
    // Fatima Khan is a General User (id: user-004)
    const renderer = await renderScreen({ userId: 'user-004' });
    const root = renderer.root;

    expect(root.findAllByProps({ children: 'Fatima Khan' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'General User' }).length).toBeGreaterThanOrEqual(1);
  });

  it('triggers onEditPress callback when tapping Top Edit button or Bottom Edit User button', async () => {
    const onEditMock = jest.fn();

    const renderer = await renderScreen({
      userId: 'user-001',
      onEditPress: onEditMock,
    });
    const root = renderer.root;

    const topEditBtn = root.findByProps({ accessibilityLabel: 'Edit User' });
    await act(async () => {
      topEditBtn.props.onPress();
    });
    expect(onEditMock).toHaveBeenCalledTimes(1);

    const bottomEditBtn = root.findByProps({ accessibilityLabel: 'Edit User Full Button' });
    await act(async () => {
      bottomEditBtn.props.onPress();
    });
    expect(onEditMock).toHaveBeenCalledTimes(2);
  });

  it('opens and closes the Password Reset modal', async () => {
    const renderer = await renderScreen({ userId: 'user-001' });
    const root = renderer.root;

    const resetBtn = root.findByProps({ accessibilityLabel: 'Reset Password' });
    await act(async () => {
      resetBtn.props.onPress();
    });

    // Modal title appears
    expect(root.findAllByProps({ children: 'Reset Password' }).length).toBeGreaterThanOrEqual(1);

    // Send reset link button exists
    const sendBtn = root.findByProps({ accessibilityLabel: 'Send Password Reset Link' });
    await act(async () => {
      sendBtn.props.onPress();
    });

    // Confirmation displays user email
    expect(root.findAllByProps({ children: 'aamir.khan@example.com' }).length).toBeGreaterThanOrEqual(1);
    const closeBtn = root.findByProps({ accessibilityLabel: 'Close reset confirmation' });
    expect(closeBtn).toBeDefined();
    await act(async () => {
      closeBtn.props.onPress();
    });
  });

  it('allows blocking and unblocking user with immediate store update and UI badge change', async () => {
    const renderer = await renderScreen({ userId: 'user-001' });
    const root = renderer.root;

    // 1. Initially active
    expect(usersStore.getUserById('user-001')?.status).toBe('active');

    // 2. Press Block User action
    const blockBtn = root.findByProps({ accessibilityLabel: 'Block User' });
    await act(async () => {
      blockBtn.props.onPress();
    });

    // Confirmation modal should be visible
    const confirmBlockBtn = root.findByProps({ accessibilityLabel: 'Confirm Block User' });
    await act(async () => {
      confirmBlockBtn.props.onPress();
    });

    // Store is now blocked
    expect(usersStore.getUserById('user-001')?.status).toBe('blocked');
    expect(root.findAllByProps({ children: 'Blocked' }).length).toBeGreaterThanOrEqual(1);

    // 3. Now press Unblock User
    const unblockBtn = root.findByProps({ accessibilityLabel: 'Unblock User' });
    await act(async () => {
      unblockBtn.props.onPress();
    });

    const confirmUnblockBtn = root.findByProps({ accessibilityLabel: 'Confirm Unblock User' });
    await act(async () => {
      confirmUnblockBtn.props.onPress();
    });

    // Store is now active again
    expect(usersStore.getUserById('user-001')?.status).toBe('active');
    expect(root.findAllByProps({ children: 'Active' }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders graceful not found state if userId does not exist', async () => {
    const onBackMock = jest.fn();
    const renderer = await renderScreen({
      userId: 'non-existent-user-id',
      onBack: onBackMock,
    });
    const root = renderer.root;

    expect(root.findByProps({ children: 'User Not Found' })).toBeDefined();
    const backBtn = root.findByProps({ accessibilityLabel: 'Back to Users list' });
    await act(async () => {
      backBtn.props.onPress();
    });
    expect(onBackMock).toHaveBeenCalledTimes(1);
  });
});
