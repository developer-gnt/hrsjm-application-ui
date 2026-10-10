import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  UserVerificationScreen,
  UserDetailsScreen,
  UsersListScreen,
  usersStore,
  INITIAL_DEV_USERS,
} from '../src/features/admin/users';

describe('UserVerificationScreen (Screen 5) KYC Review Tests', () => {
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
          <UserVerificationScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders user summary and list of submitted KYC documents', async () => {
    // Imran Ansari (user-003) has 2 documents
    const renderer = await renderScreen({ userId: 'user-003' });
    const root = renderer.root;

    // User summary
    expect(root.findByProps({ children: 'User Verification' })).toBeDefined();
    expect(root.findByProps({ children: 'Imran Ansari' })).toBeDefined();
    expect(root.findByProps({ children: 'imran.ansari@example.com' })).toBeDefined();
    expect(root.findByProps({ children: 'Donation Seeker' })).toBeDefined();

    // Document review section
    expect(root.findByProps({ children: 'Uploaded Documents' })).toBeDefined();
    expect(root.findByProps({ children: '0/2 Verified' })).toBeDefined();
    expect(root.findByProps({ children: 'Income / Need Proof' })).toBeDefined();
    expect(root.findByProps({ children: 'medical_aid_request_proof.pdf' })).toBeDefined();
    expect(root.findByProps({ children: 'Aadhaar Card' })).toBeDefined();
    expect(root.findByProps({ children: 'aadhaar_imran.jpg' })).toBeDefined();
  });

  it('opens and closes document preview modal when tapping preview', async () => {
    const renderer = await renderScreen({ userId: 'user-003' });
    const root = renderer.root;

    const previewBtn = root.findByProps({ accessibilityLabel: 'Preview Income / Need Proof' });
    await act(async () => {
      previewBtn.props.onPress();
    });

    // Preview modal displays filename (both in card and in modal)
    expect(root.findAllByProps({ children: 'medical_aid_request_proof.pdf' }).length).toBeGreaterThanOrEqual(2);
    expect(root.findByProps({ children: 'Status: Pending Review' })).toBeDefined();

    const closeBtn = root.findByProps({ accessibilityLabel: 'Dismiss document preview' });
    await act(async () => {
      closeBtn.props.onPress();
    });
  });

  it('toggles verification state for an individual document and updates verified count badge', async () => {
    const renderer = await renderScreen({ userId: 'user-003' });
    const root = renderer.root;

    expect(root.findByProps({ children: '0/2 Verified' })).toBeDefined();

    // Approve first document
    const approveBtn = root.findByProps({ accessibilityLabel: 'Approve Income / Need Proof' });
    await act(async () => {
      approveBtn.props.onPress();
    });

    // Store is updated and UI reflects 1/2 Verified
    expect(usersStore.getUserById('user-003')?.documents?.[0].verified).toBe(true);
    expect(root.findByProps({ children: '1/2 Verified' })).toBeDefined();

    // Unapprove document
    const unapproveBtn = root.findByProps({ accessibilityLabel: 'Unapprove Income / Need Proof' });
    await act(async () => {
      unapproveBtn.props.onPress();
    });

    expect(usersStore.getUserById('user-003')?.documents?.[0].verified).toBe(false);
    expect(root.findByProps({ children: '0/2 Verified' })).toBeDefined();
  });

  it('approves all documents, activates user account in store, and invokes onSuccess', async () => {
    const onSuccessMock = jest.fn();
    const renderer = await renderScreen({
      userId: 'user-003',
      onSuccess: onSuccessMock,
    });
    const root = renderer.root;

    // Initially pending
    expect(usersStore.getUserById('user-003')?.status).toBe('pending');

    const approveAllBtn = root.findByProps({
      accessibilityLabel: 'Approve All Documents & Verify User',
    });
    await act(async () => {
      approveAllBtn.props.onPress();
    });

    // Confirmation dialog
    expect(root.findByProps({ children: 'Verify User Account?' })).toBeDefined();
    const confirmBtn = root.findByProps({
      accessibilityLabel: 'Confirm Approve Verification',
    });
    await act(async () => {
      confirmBtn.props.onPress();
    });

    // User is now verified and active in store
    const updated = usersStore.getUserById('user-003');
    expect(updated?.status).toBe('active');
    expect(updated?.documents?.every(d => d.verified)).toBe(true);
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
  });

  it('handles request re-upload with selected reason and sets status to pending with remarks', async () => {
    const onSuccessMock = jest.fn();
    const renderer = await renderScreen({
      userId: 'user-003',
      onSuccess: onSuccessMock,
    });
    const root = renderer.root;

    const reuploadBtn = root.findByProps({ accessibilityLabel: 'Request Re-upload' });
    await act(async () => {
      reuploadBtn.props.onPress();
    });

    expect(root.findByProps({ children: 'Request Document Re-upload' })).toBeDefined();

    const confirmReuploadBtn = root.findByProps({
      accessibilityLabel: 'Confirm Re-upload Request',
    });
    await act(async () => {
      confirmReuploadBtn.props.onPress();
    });

    const updated = usersStore.getUserById('user-003');
    expect(updated?.status).toBe('pending');
    expect(updated?.remarks).toContain('Re-upload requested');
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
  });

  it('rejects user verification, stores custom rejection reason, and sets status to blocked', async () => {
    const onSuccessMock = jest.fn();
    const renderer = await renderScreen({
      userId: 'user-003',
      onSuccess: onSuccessMock,
    });
    const root = renderer.root;

    const rejectBtn = root.findByProps({ accessibilityLabel: 'Reject User' });
    await act(async () => {
      rejectBtn.props.onPress();
    });

    expect(root.findByProps({ children: 'Reject User Verification?' })).toBeDefined();

    const reasonInput = root.findByProps({ accessibilityLabel: 'Rejection Reason input' });
    await act(async () => {
      reasonInput.props.onChangeText('Fraudulent documentation detected');
    });

    const confirmRejectBtn = root.findByProps({
      accessibilityLabel: 'Confirm Reject Verification',
    });
    await act(async () => {
      confirmRejectBtn.props.onPress();
    });

    const updated = usersStore.getUserById('user-003');
    expect(updated?.status).toBe('blocked');
    expect(updated?.remarks).toBe('Fraudulent documentation detected');
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
  });

  it('renders clean empty state for a user with no uploaded documents', async () => {
    // Fatima Khan (user-004) has no documents
    const renderer = await renderScreen({ userId: 'user-004' });
    const root = renderer.root;

    expect(root.findByProps({ children: 'No Documents Uploaded' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'This user has not submitted any verification documents yet.',
      })
    ).toBeDefined();
  });

  it('integration: approving verification updates status on UserDetailsScreen and UsersListScreen', async () => {
    // 1. Verify user-003
    await act(async () => {
      usersStore.verifyAllDocuments('user-003');
    });

    // 2. UserDetailsScreen reflects Active status
    let detailsRenderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      detailsRenderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <UserDetailsScreen userId="user-003" />
        </SafeAreaProvider>
      );
    });

    expect(detailsRenderer!.root.findAllByProps({ children: 'Active' }).length).toBeGreaterThanOrEqual(1);

    // 3. UsersListScreen stats and tab counts update
    let listRenderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      listRenderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <UsersListScreen />
        </SafeAreaProvider>
      );
    });

    expect(listRenderer!.root.findAllByProps({ children: 'Active' }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders graceful not found screen if userId is not found', async () => {
    const onBackMock = jest.fn();
    const renderer = await renderScreen({
      userId: 'non-existent-user',
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
