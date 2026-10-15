import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  SupportTicketsScreen,
  supportTicketsStore,
} from '../src/features/support';

describe('SupportTicketsScreen (Screen 1) Phase 1 Tests', () => {
  beforeEach(async () => {
    await act(async () => {
      supportTicketsStore.resetToFixtures();
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
          <SupportTicketsScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders without crashing and displays HRSJM branding, page title, and subtitle', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Support Tickets' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'Raise and track your support requests.',
      })
    ).toBeDefined();
    expect(root.findByProps({ children: 'HRSJM' })).toBeDefined();
  });

  it('renders prominent Create Ticket button and triggers callback when pressed', async () => {
    const onCreateTicketMock = jest.fn();
    const renderer = await renderScreen({ onCreateTicketPress: onCreateTicketMock });
    const root = renderer.root;

    const createButton = root.findByProps({ accessibilityLabel: 'Create Support Ticket' });
    expect(createButton).toBeDefined();

    await act(async () => {
      createButton.props.onPress();
    });

    expect(onCreateTicketMock).toHaveBeenCalledTimes(1);
  });

  it('renders all 4 summary cards with dynamic derived counts', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const stats = supportTicketsStore.getStats();
    expect(stats.total).toBe(12);

    expect(root.findAllByProps({ children: 'Total Tickets' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Open' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Resolved' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Closed' }).length).toBeGreaterThanOrEqual(1);

    expect(root.findAllByProps({ children: stats.total }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: stats.open }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: stats.resolved }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: stats.closed }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders status tabs and filters tickets by status tab', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // Initially All (12) tickets shown
    expect(root.findByProps({ children: 'Membership Card Issue' })).toBeDefined();
    expect(root.findByProps({ children: 'Payment Failed' })).toBeDefined();

    // Click "Open" tab
    const openTab = root.findByProps({
      accessibilityLabel: `Open tickets (${supportTicketsStore.getStats().open})`,
    });
    expect(openTab).toBeDefined();

    await act(async () => {
      openTab.props.onPress();
    });

    // In Open tab, open tickets are present, while closed/resolved are filtered out
    expect(root.findByProps({ children: 'Donation Receipt Not Received' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Payment Failed' }).length).toBe(0);
    expect(root.findAllByProps({ children: 'Profile Update Request' }).length).toBe(0);
  });

  it('filters tickets by search query across subject and ticket ID', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const input = root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('TKT202600125');
    });

    expect(root.findByProps({ children: 'Membership Card Issue' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Donation Receipt Not Received' }).length).toBe(0);
  });

  it('filters tickets by category via search input', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const input = root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('Payment Issues');
    });

    expect(root.findByProps({ children: 'Payment Failed' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Membership Card Issue' }).length).toBe(0);
  });

  it('displays no-matching-results state when search finds nothing and allows clearing', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const input = root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('NonExistentTicketQuery999');
    });

    expect(root.findByProps({ children: 'No matching tickets found' })).toBeDefined();

    // Clear search
    const clearButton = root.findByProps({ accessibilityLabel: 'Clear filters and search' });
    await act(async () => {
      clearButton.props.onPress();
    });

    expect(root.findByProps({ children: 'Membership Card Issue' })).toBeDefined();
  });

  it('triggers onViewTicketDetails callback when View Details is pressed on a ticket card', async () => {
    const onViewDetailsMock = jest.fn();
    const renderer = await renderScreen({ onViewTicketDetails: onViewDetailsMock });
    const root = renderer.root;

    const detailsButton = root.findByProps({
      accessibilityLabel: 'View details for #TKT202600125',
    });
    expect(detailsButton).toBeDefined();

    await act(async () => {
      detailsButton.props.onPress();
    });

    expect(onViewDetailsMock).toHaveBeenCalledTimes(1);
    expect(onViewDetailsMock.mock.calls[0][0].id).toBe('TKT202600125');
  });

  it('opens SupportTicketDetailsModal when View Details is pressed without external callback', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const detailsButton = root.findByProps({
      accessibilityLabel: 'View details for #TKT202600125',
    });

    await act(async () => {
      detailsButton.props.onPress();
    });

    expect(
      root.findAllByProps({ accessibilityLabel: 'Close ticket details' }).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders bottom navigation with Support tab active', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const supportNav = root.findByProps({ accessibilityLabel: 'Support' });
    expect(supportNav).toBeDefined();
    expect(supportNav.props.accessibilityState).toEqual({ selected: true });
  });

  it('updates summary counts and ticket list reactively when store changes', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(supportTicketsStore.getStats().total).toBe(12);

    await act(async () => {
      supportTicketsStore.addTicket({
        id: 'TKT202600999',
        ticketNumber: '#TKT202600999',
        category: 'Donations',
        subject: 'Newly Created Test Ticket',
        description: 'Test description for reactive store verification.',
        status: 'open',
        createdAt: '2026-10-09T10:00:00Z',
        formattedDate: '09 Oct 2026, 10:00 AM',
      });
    });

    expect(supportTicketsStore.getStats().total).toBe(13);
    expect(supportTicketsStore.getStats().open).toBe(5);
    expect(root.findByProps({ children: 'Newly Created Test Ticket' })).toBeDefined();
  });

  it('filters tickets by single day date when selected in modal', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // Open filter modal
    const filterBtn = root.findByProps({ accessibilityLabel: 'Filters' });
    await act(async () => {
      filterBtn.props.onPress();
    });

    // Select single day 2026-09-20
    const dayOption = root.findByProps({ accessibilityLabel: 'Date 2026-09-20' });
    expect(dayOption).toBeDefined();

    await act(async () => {
      dayOption.props.onPress();
    });

    // Click Apply Filter
    const applyButton = root.findByProps({ accessibilityLabel: 'Apply Filter' });
    await act(async () => {
      applyButton.props.onPress();
    });

    // Only tickets from 20 Sep 2026 are displayed
    expect(root.findByProps({ children: 'Membership Card Issue' })).toBeDefined();
    expect(root.findByProps({ children: 'KYC Document Verification' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Donation Receipt Not Received' }).length).toBe(0);
    expect(root.findAllByProps({ children: 'Payment Failed' }).length).toBe(0);
  });

  it('filters tickets by From - To date range when selected in modal', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // Open filter modal
    const filterBtn = root.findByProps({ accessibilityLabel: 'Filters' });
    await act(async () => {
      filterBtn.props.onPress();
    });

    // Switch to From - To range mode
    const rangeTab = root.findByProps({ accessibilityLabel: 'From - To Range Mode' });
    await act(async () => {
      rangeTab.props.onPress();
    });

    // Select From: 2026-09-20, To: 2026-09-21
    const fromDay = root.findByProps({ accessibilityLabel: 'Date 2026-09-20' });
    const toDay = root.findByProps({ accessibilityLabel: 'Date 2026-09-21' });

    await act(async () => {
      fromDay.props.onPress();
    });
    await act(async () => {
      toDay.props.onPress();
    });

    // Click Apply Filter
    const applyButton = root.findByProps({ accessibilityLabel: 'Apply Filter' });
    await act(async () => {
      applyButton.props.onPress();
    });

    // Tickets from 20 Sep and 21 Sep are visible
    expect(root.findByProps({ children: 'Membership Card Issue' })).toBeDefined();
    expect(root.findByProps({ children: 'Donation Receipt Not Received' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Payment Failed' }).length).toBe(0); // 18 Sep
  });

  it('clears date filter and restores all tickets when filter chip is closed', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // Open filter modal & apply single day
    const filterBtn = root.findByProps({ accessibilityLabel: 'Filters' });
    await act(async () => {
      filterBtn.props.onPress();
    });

    const dayOption = root.findByProps({ accessibilityLabel: 'Date 2026-09-20' });
    await act(async () => {
      dayOption.props.onPress();
    });

    const applyButton = root.findByProps({ accessibilityLabel: 'Apply Filter' });
    await act(async () => {
      applyButton.props.onPress();
    });

    expect(root.findAllByProps({ children: 'Payment Failed' }).length).toBe(0);

    // Clear filter chip
    const clearChip = root.findByProps({ accessibilityLabel: 'Clear date filter' });
    await act(async () => {
      clearChip.props.onPress();
    });

    // All tickets restored
    expect(root.findByProps({ children: 'Payment Failed' })).toBeDefined();
  });
});
