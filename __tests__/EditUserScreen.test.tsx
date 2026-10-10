import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  EditUserScreen,
  UserDetailsScreen,
  UsersListScreen,
  usersStore,
  INITIAL_DEV_USERS,
} from '../src/features/admin/users';

describe('EditUserScreen (Screen 4) Edit Form & Update Flow Tests', () => {
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
          <EditUserScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('pre-populates all existing user data correctly matching reference layout', async () => {
    const renderer = await renderScreen({ userId: 'user-001' });
    const root = renderer.root;

    // Profile header displays existing user data
    expect(root.findAllByProps({ children: 'Aamir Khan' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findByProps({ children: 'aamir.khan@example.com' })).toBeDefined();
    expect(root.findByProps({ children: '+91 98765 43210' })).toBeDefined();

    // Inputs pre-filled with existing values
    const nameInput = root.findByProps({ accessibilityLabel: 'Edit Full Name input' });
    expect(nameInput.props.value).toBe('Aamir Khan');

    const emailInput = root.findByProps({ accessibilityLabel: 'Edit Email Address input' });
    expect(emailInput.props.value).toBe('aamir.khan@example.com');

    const phoneInput = root.findByProps({ accessibilityLabel: 'Edit Phone Number input' });
    expect(phoneInput.props.value).toContain('98765');

    const addressInput = root.findByProps({ accessibilityLabel: 'Edit Address input' });
    expect(addressInput.props.value).toBe('Mumbai, Maharashtra, India');

    // Type and Status selector labels
    expect(root.findByProps({ children: 'Member' })).toBeDefined();
    expect(root.findByProps({ children: 'Active' })).toBeDefined();

    // DOB & Gender
    expect(root.findByProps({ children: '12 Mar 1990' })).toBeDefined();
    expect(root.findByProps({ children: 'Male' })).toBeDefined();

    // Profile image card
    expect(root.findByProps({ children: 'Tap to change profile photo' })).toBeDefined();
    expect(root.findByProps({ children: 'JPG, PNG (Max 5 MB)' })).toBeDefined();
  });

  it('displays inline validation errors when fields are cleared or made invalid', async () => {
    const renderer = await renderScreen({ userId: 'user-001' });
    const root = renderer.root;

    const nameInput = root.findByProps({ accessibilityLabel: 'Edit Full Name input' });
    const emailInput = root.findByProps({ accessibilityLabel: 'Edit Email Address input' });
    const phoneInput = root.findByProps({ accessibilityLabel: 'Edit Phone Number input' });
    const saveBtn = root.findByProps({ accessibilityLabel: 'Save Changes' });

    // Clear inputs
    await act(async () => {
      nameInput.props.onChangeText('');
      emailInput.props.onChangeText('invalid-email-address');
      phoneInput.props.onChangeText('123');
    });

    await act(async () => {
      saveBtn.props.onPress();
    });

    expect(root.findByProps({ children: 'Full name is required' })).toBeDefined();
    expect(root.findByProps({ children: 'Please enter a valid email address' })).toBeDefined();
    expect(root.findByProps({ children: 'Please enter a valid 10-digit phone number' })).toBeDefined();
  });

  it('Reset button restores form fields back to their original user values', async () => {
    const renderer = await renderScreen({ userId: 'user-001' });
    const root = renderer.root;

    const nameInput = root.findByProps({ accessibilityLabel: 'Edit Full Name input' });
    await act(async () => {
      nameInput.props.onChangeText('Temporary Name Change');
    });
    expect(nameInput.props.value).toBe('Temporary Name Change');

    const resetBtn = root.findByProps({ accessibilityLabel: 'Reset form' });
    await act(async () => {
      resetBtn.props.onPress();
    });

    expect(nameInput.props.value).toBe('Aamir Khan');
  });

  it('Cancel / Back link invokes onBack without mutating user in the store', async () => {
    const onBackMock = jest.fn();
    const originalUser = usersStore.getUserById('user-001');

    const renderer = await renderScreen({
      userId: 'user-001',
      onBack: onBackMock,
    });
    const root = renderer.root;

    const nameInput = root.findByProps({ accessibilityLabel: 'Edit Full Name input' });
    await act(async () => {
      nameInput.props.onChangeText('Modified But Cancelled Name');
    });

    const cancelBtn = root.findByProps({ accessibilityLabel: 'Cancel edit user' });
    await act(async () => {
      cancelBtn.props.onPress();
    });

    expect(onBackMock).toHaveBeenCalledTimes(1);
    // Verified: store retains original user name
    expect(usersStore.getUserById('user-001')?.name).toBe(originalUser?.name);
  });

  it('successfully updates user data, persists to store, and calls onSuccess callback', async () => {
    const onSuccessMock = jest.fn();
    const renderer = await renderScreen({
      userId: 'user-001',
      onSuccess: onSuccessMock,
    });
    const root = renderer.root;

    const nameInput = root.findByProps({ accessibilityLabel: 'Edit Full Name input' });
    const addressInput = root.findByProps({ accessibilityLabel: 'Edit Address input' });
    const phoneInput = root.findByProps({ accessibilityLabel: 'Edit Phone Number input' });
    const saveBtn = root.findByProps({ accessibilityLabel: 'Save Changes' });

    await act(async () => {
      nameInput.props.onChangeText('Aamir R. Khan');
      addressInput.props.onChangeText('Bandra West, Mumbai');
      phoneInput.props.onChangeText('98765 00000');
    });

    await act(async () => {
      saveBtn.props.onPress();
    });

    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onSuccessMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-001',
        name: 'Aamir R. Khan',
        address: 'Bandra West, Mumbai',
        phone: '+91 98765 00000',
      })
    );

    // Verify store contains updated record
    const updatedInStore = usersStore.getUserById('user-001');
    expect(updatedInStore?.name).toBe('Aamir R. Khan');
    expect(updatedInStore?.address).toBe('Bandra West, Mumbai');
    expect(updatedInStore?.phone).toBe('+91 98765 00000');
  });

  it('integration: updating user updates both UserDetailsScreen and UsersListScreen', async () => {
    // 1. Update user in store via Edit
    await act(async () => {
      usersStore.updateUser('user-001', {
        name: 'Aamir Khan Senior',
        address: 'Colaba, Mumbai',
      });
    });

    // 2. Render UserDetailsScreen -> displays updated name & address
    let detailsRenderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      detailsRenderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <UserDetailsScreen userId="user-001" />
        </SafeAreaProvider>
      );
    });

    expect(detailsRenderer!.root.findAllByProps({ children: 'Aamir Khan Senior' }).length).toBeGreaterThanOrEqual(1);
    expect(detailsRenderer!.root.findByProps({ children: 'Colaba, Mumbai' })).toBeDefined();

    // 3. Render UsersListScreen -> displays updated name
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

    expect(listRenderer!.root.findByProps({ children: 'Aamir Khan Senior' })).toBeDefined();
  });

  it('renders not found state when editing an unknown userId', async () => {
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
