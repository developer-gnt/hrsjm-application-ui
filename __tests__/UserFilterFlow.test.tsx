import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  UsersListScreen,
  UserFilterModal,
  usersStore,
  INITIAL_DEV_USERS,
} from '../src/features/admin/users';

describe('UserFilterFlow (Screen 6) User Filtering & Search Tests', () => {
  beforeEach(async () => {
    await act(async () => {
      usersStore.resetToFixtures();
    });
  });

  const renderModal = async (props: {
    visible?: boolean;
    currentFilters?: any;
    onClose?: () => void;
    onApply?: (f: any) => void;
    onReset?: () => void;
  }) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <UserFilterModal
          visible={props.visible ?? true}
          currentFilters={props.currentFilters || {}}
          onClose={props.onClose || jest.fn()}
          onApply={props.onApply || jest.fn()}
          onReset={props.onReset || jest.fn()}
        />
      );
    });
    return renderer!;
  };

  const renderListScreen = async (props: any = {}) => {
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

  it('renders UserFilterModal with all filter sections and choices', async () => {
    const renderer = await renderModal({ visible: true });
    const root = renderer.root;

    // Header title
    expect(root.findByProps({ children: 'Filter Users' })).toBeDefined();

    // Section 1: User Type
    expect(root.findByProps({ children: 'User Type' })).toBeDefined();
    expect(root.findByProps({ children: 'All Types' })).toBeDefined();
    expect(root.findByProps({ children: 'Members' })).toBeDefined();
    expect(root.findByProps({ children: 'Donation Seekers' })).toBeDefined();
    expect(root.findByProps({ children: 'Donors' })).toBeDefined();
    expect(root.findByProps({ children: 'General Users' })).toBeDefined();

    // Section 2: Account Status
    expect(root.findByProps({ children: 'Account Status' })).toBeDefined();
    expect(root.findByProps({ children: 'All Statuses' })).toBeDefined();
    expect(root.findByProps({ children: 'Active' })).toBeDefined();
    expect(root.findByProps({ children: 'Pending' })).toBeDefined();
    expect(root.findByProps({ children: 'Blocked' })).toBeDefined();

    // Section 3: Date Joined Range
    expect(root.findByProps({ children: 'Date Joined Range' })).toBeDefined();

    // Section 4: Sort By
    expect(root.findByProps({ children: 'Sort By' })).toBeDefined();
    expect(root.findByProps({ children: 'Newest First' })).toBeDefined();
    expect(root.findByProps({ children: 'Oldest First' })).toBeDefined();
    expect(root.findByProps({ children: 'Name (A to Z)' })).toBeDefined();
    expect(root.findByProps({ children: 'Name (Z to A)' })).toBeDefined();

    // Footer buttons
    expect(root.findByProps({ accessibilityLabel: 'Reset all filters' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Apply filters' })).toBeDefined();
  });

  it('allows selecting filters and calling onApply with updated criteria', async () => {
    const onApplyMock = jest.fn();
    const onCloseMock = jest.fn();

    const renderer = await renderModal({
      visible: true,
      onApply: onApplyMock,
      onClose: onCloseMock,
    });
    const root = renderer.root;

    // Select Members type
    const memberChip = root.findByProps({
      accessibilityLabel: 'Filter by user type: Members',
    });
    await act(async () => {
      memberChip.props.onPress();
    });

    // Select Pending status
    const pendingChip = root.findByProps({
      accessibilityLabel: 'Filter by status: Pending',
    });
    await act(async () => {
      pendingChip.props.onPress();
    });

    // Select Name (A to Z) sorting
    const sortChip = root.findByProps({
      accessibilityLabel: 'Sort by: Name (A to Z)',
    });
    await act(async () => {
      sortChip.props.onPress();
    });

    // Apply
    const applyBtn = root.findByProps({ accessibilityLabel: 'Apply filters' });
    await act(async () => {
      applyBtn.props.onPress();
    });

    expect(onApplyMock).toHaveBeenCalledTimes(1);
    expect(onApplyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        typeTab: 'member',
        status: 'pending',
        sortBy: 'name_asc',
      })
    );
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('Reset button resets all filter selections to default values', async () => {
    const onResetMock = jest.fn();
    const onCloseMock = jest.fn();

    const renderer = await renderModal({
      visible: true,
      currentFilters: {
        typeTab: 'donor',
        status: 'blocked',
        sortBy: 'oldest',
      },
      onReset: onResetMock,
      onClose: onCloseMock,
    });
    const root = renderer.root;

    const resetBtn = root.findByProps({ accessibilityLabel: 'Reset all filters' });
    await act(async () => {
      resetBtn.props.onPress();
    });

    expect(onResetMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('tapping Filters button in UsersSearchBar opens UserFilterModal in UsersListScreen', async () => {
    const onFilterPressMock = jest.fn();
    const renderer = await renderListScreen({ onFilterPress: onFilterPressMock });
    const root = renderer.root;

    const filterButton = root.findByProps({ accessibilityLabel: 'Filters' });
    expect(filterButton).toBeDefined();

    await act(async () => {
      filterButton.props.onPress();
    });

    expect(onFilterPressMock).toHaveBeenCalledTimes(1);

    // Modal title is present
    expect(root.findByProps({ children: 'Filter Users' })).toBeDefined();
  });

  it('applying status filter in modal filters visible user cards and displays active filter badge', async () => {
    const renderer = await renderListScreen();
    const root = renderer.root;

    // Open filter modal
    const filterButton = root.findByProps({ accessibilityLabel: 'Filters' });
    await act(async () => {
      filterButton.props.onPress();
    });

    // Select Blocked status (only Rahul Mehta is blocked in fixtures)
    const blockedChip = root.findByProps({
      accessibilityLabel: 'Filter by status: Blocked',
    });
    await act(async () => {
      blockedChip.props.onPress();
    });

    // Apply filters
    const applyBtn = root.findByProps({ accessibilityLabel: 'Apply filters' });
    await act(async () => {
      applyBtn.props.onPress();
    });

    // Rahul Mehta is displayed
    expect(root.findByProps({ children: 'Rahul Mehta' })).toBeDefined();

    // Aamir Khan (active) is filtered out
    expect(root.findAllByProps({ children: 'Aamir Khan' }).length).toBe(0);

    // Active filter pill is rendered
    expect(root.findByProps({ children: 'Status: BLOCKED ✕' })).toBeDefined();
  });

  it('date filtering correctly filters users within joined date range', async () => {
    // Fixtures dates:
    // user-005 (Rahul): 2026-09-18
    // user-004 (Fatima): 2026-09-20
    // user-003 (Imran): 2026-09-24
    // user-002 (Sara): 2026-09-26
    // user-001 (Aamir): 2026-09-28

    const midSeptemberUsers = usersStore.getUsers({
      joinedFrom: '2026-09-24',
      joinedTo: '2026-09-27',
    });

    expect(midSeptemberUsers.length).toBe(2);
    expect(midSeptemberUsers.map(u => u.name)).toEqual(['Sara Shaikh', 'Imran Ansari']);
  });

  it('sorting orders users properly by name ascending and descending', async () => {
    const ascUsers = usersStore.getUsers({ sortBy: 'name_asc' });
    const ascNames = ascUsers.map(u => u.name);
    expect(ascNames).toEqual([
      'Aamir Khan',
      'Fatima Khan',
      'Imran Ansari',
      'Rahul Mehta',
      'Sara Shaikh',
    ]);

    const descUsers = usersStore.getUsers({ sortBy: 'name_desc' });
    const descNames = descUsers.map(u => u.name);
    expect(descNames).toEqual([
      'Sara Shaikh',
      'Rahul Mehta',
      'Imran Ansari',
      'Fatima Khan',
      'Aamir Khan',
    ]);
  });

  it('shows No Users Found empty state when search or filters return 0 results and resetting restores list', async () => {
    const renderer = await renderListScreen();
    const root = renderer.root;

    // Search for non-existent keyword
    const searchInput = root.findByProps({
      accessibilityLabel: 'Search users by name, email, phone or user ID',
    });
    await act(async () => {
      searchInput.props.onChangeText('XYZ_NON_EXISTENT_NAME_12345');
    });

    expect(root.findByProps({ children: 'No Users Found' })).toBeDefined();

    // Press Reset Filters CTA in empty state
    const resetBtn = root.findByProps({ accessibilityLabel: 'Reset Filters' });
    await act(async () => {
      resetBtn.props.onPress();
    });

    // List is restored
    expect(root.findByProps({ children: 'Aamir Khan' })).toBeDefined();
  });
});
