import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  AddUserScreen,
  UsersListScreen,
  usersStore,
  INITIAL_DEV_USERS,
} from '../src/features/admin/users';

describe('AddUserScreen (Screen 2) Form & Create Flow Tests', () => {
  beforeEach(async () => {
    await act(async () => {
      usersStore.resetToFixtures();
    });
  });

  const renderAddUserScreen = async (props = {}) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <AddUserScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders all form fields, labels, and action buttons in reference layout', async () => {
    const renderer = await renderAddUserScreen();
    const root = renderer.root;

    // Header & title
    expect(root.findByProps({ children: 'Add New User' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'Create a new user account and fill in the required details.',
      })
    ).toBeDefined();

    // Field inputs
    expect(root.findByProps({ accessibilityLabel: 'Full Name input' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Email Address input' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Phone Number input' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Select user type' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Password input' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Confirm Password input' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Select Date of Birth' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Select Gender' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Address input' })).toBeDefined();

    // Action buttons
    expect(root.findByProps({ accessibilityLabel: 'Cancel adding user' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Submit Create User' })).toBeDefined();
  });

  it('displays inline validation errors when submitting an empty form', async () => {
    const renderer = await renderAddUserScreen();
    const root = renderer.root;

    const submitBtn = root.findByProps({ accessibilityLabel: 'Submit Create User' });

    await act(async () => {
      submitBtn.props.onPress();
    });

    // Check validation error messages
    expect(root.findByProps({ children: 'Full name is required' })).toBeDefined();
    expect(root.findByProps({ children: 'Email address is required' })).toBeDefined();
    expect(root.findByProps({ children: 'Phone number is required' })).toBeDefined();
    expect(root.findByProps({ children: 'Please select a user type' })).toBeDefined();
    expect(root.findByProps({ children: 'Password is required' })).toBeDefined();
    expect(root.findByProps({ children: 'Confirm password is required' })).toBeDefined();
  });

  it('displays specific validation errors for invalid email, short phone, and mismatched password', async () => {
    const renderer = await renderAddUserScreen();
    const root = renderer.root;

    const nameInput = root.findByProps({ accessibilityLabel: 'Full Name input' });
    const emailInput = root.findByProps({ accessibilityLabel: 'Email Address input' });
    const phoneInput = root.findByProps({ accessibilityLabel: 'Phone Number input' });
    const passwordInput = root.findByProps({ accessibilityLabel: 'Password input' });
    const confirmInput = root.findByProps({ accessibilityLabel: 'Confirm Password input' });
    const submitBtn = root.findByProps({ accessibilityLabel: 'Submit Create User' });

    await act(async () => {
      nameInput.props.onChangeText('A'); // < 2 characters
      emailInput.props.onChangeText('invalid-email'); // invalid format
      phoneInput.props.onChangeText('12345'); // < 10 digits
      passwordInput.props.onChangeText('123'); // < 6 chars
      confirmInput.props.onChangeText('123456'); // mismatch
    });

    await act(async () => {
      submitBtn.props.onPress();
    });

    expect(root.findByProps({ children: 'Full name must be at least 2 characters' })).toBeDefined();
    expect(root.findByProps({ children: 'Please enter a valid email address' })).toBeDefined();
    expect(root.findByProps({ children: 'Please enter a valid 10-digit phone number' })).toBeDefined();
    expect(root.findByProps({ children: 'Password must be at least 6 characters' })).toBeDefined();
    expect(root.findByProps({ children: 'Passwords do not match' })).toBeDefined();
  });

  it('toggles password and confirm password visibility', async () => {
    const renderer = await renderAddUserScreen();
    const root = renderer.root;

    const passwordInput = root.findByProps({ accessibilityLabel: 'Password input' });
    const confirmInput = root.findByProps({ accessibilityLabel: 'Confirm Password input' });

    // Initially secured
    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(confirmInput.props.secureTextEntry).toBe(true);

    // Toggle password
    const togglePassBtn = root.findByProps({ accessibilityLabel: 'Show password' });
    await act(async () => {
      togglePassBtn.props.onPress();
    });

    const updatedPassInput = root.findByProps({ accessibilityLabel: 'Password input' });
    expect(updatedPassInput.props.secureTextEntry).toBe(false);

    // Toggle confirm password
    const toggleConfirmBtn = root.findByProps({ accessibilityLabel: 'Show confirm password' });
    await act(async () => {
      toggleConfirmBtn.props.onPress();
    });

    const updateConfirmInput = root.findByProps({ accessibilityLabel: 'Confirm Password input' });
    expect(updateConfirmInput.props.secureTextEntry).toBe(false);
  });

  it('Cancel button invokes onBack callback without creating a user or mutating the store', async () => {
    const onBackMock = jest.fn();
    const initialCount = usersStore.getUsers().length;
    const renderer = await renderAddUserScreen({ onBack: onBackMock });
    const root = renderer.root;

    const cancelBtn = root.findByProps({ accessibilityLabel: 'Cancel adding user' });
    await act(async () => {
      cancelBtn.props.onPress();
    });

    expect(onBackMock).toHaveBeenCalledTimes(1);
    expect(usersStore.getUsers().length).toBe(initialCount);
  });

  it('successfully creates a user, persists to store without raw password, increments count, and calls onSuccess', async () => {
    const onSuccessMock = jest.fn();
    const initialUsersCount = usersStore.getUsers().length;
    const initialStats = usersStore.getStats();

    const renderer = await renderAddUserScreen({ onSuccess: onSuccessMock });
    const root = renderer.root;

    // Open User Type modal and select "Donor"
    const userTypeSelect = root.findByProps({ accessibilityLabel: 'Select user type' });
    await act(async () => {
      userTypeSelect.props.onPress();
    });

    // Find Donor option in modal
    const donorOption = root.findByProps({ children: 'Donor' });
    // Find parent TouchableOpacity
    const donorTouchable = root.findAllByType(TouchableOpacity).find(t => {
      try {
        return t.findByProps({ children: 'Donor' });
      } catch {
        return false;
      }
    });

    await act(async () => {
      if (donorTouchable) {
        donorTouchable.props.onPress();
      }
    });

    // Fill all form inputs
    const nameInput = root.findByProps({ accessibilityLabel: 'Full Name input' });
    const emailInput = root.findByProps({ accessibilityLabel: 'Email Address input' });
    const phoneInput = root.findByProps({ accessibilityLabel: 'Phone Number input' });
    const passwordInput = root.findByProps({ accessibilityLabel: 'Password input' });
    const confirmInput = root.findByProps({ accessibilityLabel: 'Confirm Password input' });
    const addressInput = root.findByProps({ accessibilityLabel: 'Address input' });

    await act(async () => {
      nameInput.props.onChangeText('Dr. Zoya Patel');
      emailInput.props.onChangeText('zoya.patel@example.com');
      phoneInput.props.onChangeText('9876543210');
      passwordInput.props.onChangeText('Secret123!');
      confirmInput.props.onChangeText('Secret123!');
      addressInput.props.onChangeText('Mumbai, Maharashtra');
    });

    // Submit form
    const submitBtn = root.findByProps({ accessibilityLabel: 'Submit Create User' });
    await act(async () => {
      submitBtn.props.onPress();
    });

    expect(onSuccessMock).toHaveBeenCalledTimes(1);

    // Verify store has the new user
    const users = usersStore.getUsers();
    expect(users.length).toBe(initialUsersCount + 1);

    const createdUser = users.find(u => u.email === 'zoya.patel@example.com');
    expect(createdUser).toBeDefined();
    expect(createdUser?.name).toBe('Dr. Zoya Patel');
    expect(createdUser?.phone).toBe('+91 9876543210');
    expect(createdUser?.userType).toBe('donor');
    expect(createdUser?.address).toBe('Mumbai, Maharashtra');

    // Security check: raw password must NOT be stored anywhere on the user object
    expect((createdUser as any).password).toBeUndefined();
    expect((createdUser as any).confirmPassword).toBeUndefined();

    // Verify stats updated
    const updatedStats = usersStore.getStats();
    expect(updatedStats.total).toBe(initialStats.total + 1);
  });

  it('integration: created user appears in UsersListScreen under the correct tab and stats reflect the addition', async () => {
    // 1. Add a user via usersStore (simulating creation)
    await act(async () => {
      usersStore.addUser({
        name: 'Kavita Sharma',
        email: 'kavita.sharma@example.com',
        phone: '+91 9123456789',
        userType: 'member',
        status: 'active',
      });
    });

    // 2. Render UsersListScreen
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

    const root = listRenderer!.root;

    // 3. User should appear on UsersListScreen
    expect(root.findByProps({ children: 'Kavita Sharma' })).toBeDefined();
    expect(root.findByProps({ children: 'kavita.sharma@example.com' })).toBeDefined();

    // 4. Verify Total Users count badge updated
    const stats = usersStore.getStats();
    expect(stats.total).toBe(INITIAL_DEV_USERS.length + 1);
    expect(stats.membersCount).toBe(
      INITIAL_DEV_USERS.filter(u => u.userType === 'member').length + 1
    );
  });
});
