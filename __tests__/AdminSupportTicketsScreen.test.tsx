import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SupportTicketsScreen } from '../src/features/admin/support/screens/SupportTicketsScreen';
import { TicketCard } from '../src/features/admin/support/components/TicketCard';
import { TicketStatsRow } from '../src/features/admin/support/components/TicketStats';
import type { SupportTicket } from '../src/features/admin/support/types/support.types';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock AuthContext
jest.mock('../src/core/auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-123',
      full_name: 'Test Member',
      roles: [{ name: 'MEMBER' }],
    },
    isAuthenticated: true,
  }),
}));

// Mock useSupportTickets
jest.mock('../src/features/admin/support/hooks/useSupportTickets', () => ({
  useSupportTickets: () => ({
    filteredItems: [
      {
        id: 'tick-0001-abcd',
        user_id: 'user-123',
        subject: '[Membership] Card renewal delay',
        description: 'My card was not received yet.',
        status: 'SUBMITTED',
        resolved_by: null,
        resolved_by_user: null,
        resolved_at: null,
        created_at: '2026-10-20T10:00:00Z',
        updated_at: '2026-10-20T10:00:00Z',
        user: {
          id: 'user-123',
          full_name: 'Test Member',
          email: 'member@hrsjm.org',
        },
      },
    ],
    stats: {
      total: 5,
      open: 2,
      inProgress: 1,
      resolved: 2,
      closed: 0,
    },
    statsLoading: false,
    activeTab: 'ALL',
    searchQuery: '',
    initialLoading: false,
    refreshing: false,
    loadingMore: false,
    error: null,
    filterState: {
      status: 'ALL',
      category: 'ALL',
      dateRange: 'ALL',
    },
    activeFiltersCount: 0,
    setSearchQuery: jest.fn(),
    setActiveTab: jest.fn(),
    applyFilters: jest.fn(),
    refresh: jest.fn(),
    loadMore: jest.fn(),
    clearFilters: jest.fn(),
  }),
}));

describe('Complaints & Support Page (Master Prompt Implementation)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithSafeArea = (ui: React.ReactElement) =>
    ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        {ui}
      </SafeAreaProvider>
    );

  it('renders page title, subtitle, and prominent yellow New Complaint button', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = renderWithSafeArea(<SupportTicketsScreen />);
    });

    const root = renderer!.root;
    const allTexts = root.findAllByType(Text).map(t => {
      const c = t.props.children;
      return Array.isArray(c) ? c.join('') : String(c ?? '');
    }).join(' ');

    expect(allTexts).toContain('Complaints &');
    expect(allTexts).toContain('Support');
    expect(allTexts).toContain('Review, track and resolve');
    expect(allTexts).toContain('New Complaint');

    const newComplaintBtn = root.findByProps({ accessibilityLabel: 'New Complaint' });
    expect(newComplaintBtn).toBeDefined();
  });

  it('renders 2x2 TicketStatsRow with 4 cards', () => {
    const stats = {
      total: 10,
      open: 4,
      inProgress: 2,
      resolved: 4,
    };
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = renderWithSafeArea(<TicketStatsRow stats={stats} />);
    });

    const root = renderer!.root;
    expect(root.findByProps({ label: 'Total Tickets', value: 10 })).toBeDefined();
    expect(root.findByProps({ label: 'Open', value: 4, sublabel: 'Needs reply' })).toBeDefined();
    expect(root.findByProps({ label: 'In Progress', value: 2, sublabel: 'Active' })).toBeDefined();
    expect(root.findByProps({ label: 'Resolved', value: 4, sublabel: 'Closed' })).toBeDefined();
  });

  it('renders TicketCard with parsed category, clean subject, ticket ID, and View Details action', () => {
    const ticket: SupportTicket = {
      id: 'abc-1234-def-5678',
      user_id: 'user-1',
      subject: '[Donation] Receipt issue',
      description: 'Payment made but receipt missing',
      status: 'SUBMITTED',
      resolved_by: null,
      resolved_at: null,
      created_at: '2026-10-15T12:00:00Z',
      updated_at: '2026-10-15T12:00:00Z',
      user: {
        id: 'user-1',
        full_name: 'Amit Kumar',
        email: 'amit@example.com',
      },
    };

    const onPressMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = renderWithSafeArea(
        <TicketCard ticket={ticket} onPress={onPressMock} />
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Donation' })).toBeDefined();
    expect(root.findByProps({ children: 'Receipt issue' })).toBeDefined();
    expect(root.findByProps({ children: 'HRSJM-CMP-ABC1234D' })).toBeDefined();
    expect(root.findByProps({ children: 'Amit Kumar' })).toBeDefined();
    expect(root.findByProps({ children: 'View Details →' })).toBeDefined();

    // Trigger action via touchable
    const touchables = root.findAllByType(TouchableOpacity);
    const viewDetailsTouchable = touchables.find(t =>
      t.findAllByProps({ children: 'View Details →' }).length > 0
    );
    expect(viewDetailsTouchable).toBeDefined();

    act(() => {
      viewDetailsTouchable!.props.onPress();
    });
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
