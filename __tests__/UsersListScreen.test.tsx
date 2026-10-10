import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  UsersListScreen,
  usersStore,
  INITIAL_DEV_USERS,
} from '../src/features/admin/users';

describe('UsersListScreen (Screen 1) Dynamic Tests', () => {
  beforeEach(async () => {
    await act(async () => {
      usersStore.resetToFixtures();
    });
  });

  const renderScreen = async (props = {}) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <UsersListScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders without crashing and displays HRSJM branding, Users title, and description', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findAllByProps({ children: 'Users' }).length).toBeGreaterThanOrEqual(1);
    expect(
      root.findByProps({
        children:
          'Manage all mobile app users including members, donation seekers, donors, and general users.',
      })
    ).toBeDefined();
    expect(root.findByProps({ children: 'HRSJM' })).toBeDefined();
  });

  it('renders Add User button and triggers onAddUserPress callback when pressed', async () => {
    const onAddUserMock = jest.fn();
    const renderer = await renderScreen({ onAddUserPress: onAddUserMock });
    const root = renderer.root;

    const addButton = root.findByProps({ accessibilityLabel: 'Add New User' });
    expect(addButton).toBeDefined();

    await act(async () => {
      addButton.props.onPress();
    });

    expect(onAddUserMock).toHaveBeenCalledTimes(1);
  });

  it('renders Sign Up button in header and triggers onSignUpPress callback when pressed', async () => {
    const onSignUpMock = jest.fn();
    const renderer = await renderScreen({ onSignUpPress: onSignUpMock });
    const root = renderer.root;

    const signUpButton = root.findByProps({ accessibilityLabel: 'Sign Up New User' });
    expect(signUpButton).toBeDefined();

    await act(async () => {
      signUpButton.props.onPress();
    });

    expect(onSignUpMock).toHaveBeenCalledTimes(1);
  });

  it('renders 2x2 statistics cards calculating counts dynamically from actual user records', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // 5 total fixtures: 3 active, 1 pending, 1 blocked
    expect(root.findByProps({ children: '5' })).toBeDefined();
    expect(root.findByProps({ children: '3' })).toBeDefined();
    expect(root.findAllByProps({ children: '1' }).length).toBeGreaterThanOrEqual(2);

    expect(root.findByProps({ children: 'Total Users' })).toBeDefined();
    expect(root.findByProps({ children: 'Active Users' })).toBeDefined();
    expect(root.findByProps({ children: 'Pending Verification' })).toBeDefined();
    expect(root.findByProps({ children: 'Blocked Users' })).toBeDefined();
  });

  it('renders user type tabs with dynamic category counts', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'All Users (5)' })).toBeDefined();
    expect(root.findByProps({ children: 'Members (2)' })).toBeDefined();
    expect(root.findByProps({ children: 'Donation Seekers (1)' })).toBeDefined();
    expect(root.findByProps({ children: 'Donors (1)' })).toBeDefined();
    expect(root.findByProps({ children: 'General Users (1)' })).toBeDefined();
  });

  it('renders user cards with names, emails, phones, and badges', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // Check Aamir Khan
    expect(root.findByProps({ children: 'Aamir Khan' })).toBeDefined();
    expect(root.findByProps({ children: 'aamir.khan@example.com' })).toBeDefined();
    expect(root.findByProps({ children: '+91 98765 43210' })).toBeDefined();

    // Check Sara Shaikh
    expect(root.findByProps({ children: 'Sara Shaikh' })).toBeDefined();

    // Check Imran Ansari (Donation Seeker)
    expect(root.findByProps({ children: 'Imran Ansari' })).toBeDefined();

    // Check Fatima Khan
    expect(root.findByProps({ children: 'Fatima Khan' })).toBeDefined();

    // Check Rahul Mehta (Donor, Blocked)
    expect(root.findByProps({ children: 'Rahul Mehta' })).toBeDefined();
  });

  it('calls onUserPress when a user card is pressed', async () => {
    const onUserPressMock = jest.fn();
    const renderer = await renderScreen({ onUserPress: onUserPressMock });
    const root = renderer.root;

    const aamirCard = root.findByProps({
      accessibilityLabel: 'User Aamir Khan, Member, Active',
    });
    expect(aamirCard).toBeDefined();

    await act(async () => {
      aamirCard.props.onPress();
    });

    expect(onUserPressMock).toHaveBeenCalledTimes(1);
    expect(onUserPressMock.mock.calls[0][0].name).toBe('Aamir Khan');
  });

  it('filters users by search input query', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const searchInput = root.findByType(TextInput);
    expect(searchInput).toBeDefined();

    await act(async () => {
      searchInput.props.onChangeText('Sara');
    });

    expect(root.findByProps({ children: 'Sara Shaikh' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Aamir Khan' })).toHaveLength(0);
  });

  it('shows empty state when no users match search, and resetting restores list', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const searchInput = root.findByType(TextInput);

    await act(async () => {
      searchInput.props.onChangeText('NonExistentUser12345');
    });

    expect(root.findByProps({ children: 'No Users Found' })).toBeDefined();

    const resetButton = root.findByProps({ accessibilityLabel: 'Reset Filters' });
    expect(resetButton).toBeDefined();

    await act(async () => {
      resetButton.props.onPress();
    });

    expect(root.findByProps({ children: 'Aamir Khan' })).toBeDefined();
  });

  it('shows distinct empty state when 0 registered users exist with registration CTA', async () => {
    await act(async () => {
      usersStore.clearUsers();
    });

    const onSignUpMock = jest.fn();
    const renderer = await renderScreen({ onSignUpPress: onSignUpMock });
    const root = renderer.root;

    expect(root.findByProps({ children: 'No Registered Users' })).toBeDefined();

    const signUpButton = root.findByProps({ accessibilityLabel: 'Go to Sign Up form' });
    expect(signUpButton).toBeDefined();

    await act(async () => {
      signUpButton.props.onPress();
    });

    expect(onSignUpMock).toHaveBeenCalledTimes(1);
  });

  it('filters users by user type tab (e.g. Donation Seekers)', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const seekerTab = root.findByProps({ accessibilityLabel: 'Donation Seekers (1)' });
    expect(seekerTab).toBeDefined();

    await act(async () => {
      seekerTab.props.onPress();
    });

    expect(root.findByProps({ children: 'Imran Ansari' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Aamir Khan' })).toHaveLength(0);
  });

  it('renders bottom navigation with Users active', async () => {
    const onBottomTabMock = jest.fn();
    const renderer = await renderScreen({ onBottomTabPress: onBottomTabMock });
    const root = renderer.root;

    const usersTab = root.findByProps({ accessibilityLabel: 'Users' });
    expect(usersTab).toBeDefined();
    expect(usersTab.props.accessibilityState.selected).toBe(true);

    const membersTab = root.findByProps({ accessibilityLabel: 'Members' });
    expect(membersTab).toBeDefined();

    await act(async () => {
      membersTab.props.onPress();
    });

    expect(onBottomTabMock).toHaveBeenCalledWith('members');
  });
});
