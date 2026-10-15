import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  TicketSubmittedScreen,
  supportTicketsStore,
} from '../src/features/support';

describe('TicketSubmittedScreen (Phase 4: Screen 5) Tests', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    await act(async () => {
      supportTicketsStore.resetToFixtures();
    });
  });

  afterEach(async () => {
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
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
          <TicketSubmittedScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders success hero checkmark, title, and subtitle', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Ticket Submitted Successfully!' })).toBeDefined();
    expect(root.findAllByProps({ children: '✓' }).length).toBeGreaterThanOrEqual(1);
    expect(
      root.findByProps({
        children: 'Your support request has been logged into our system. Our team has received your ticket and will attend to it shortly.',
      })
    ).toBeDefined();
  });

  it('renders stepper at Step 3 (Submitted)', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Ticket Details' })).toBeDefined();
    expect(root.findByProps({ children: 'Review' })).toBeDefined();
    expect(root.findByProps({ children: 'Submitted' })).toBeDefined();
  });

  it('displays ticket reference ID, category, subject, pending status badge, and SLA', async () => {
    const pendingTicket = supportTicketsStore.createTicketFromDraft({
      category: 'General Inquiry',
      subject: 'Question about NGO guidelines',
      description: 'Need guidelines',
      attachments: [],
    });
    const renderer = await renderScreen({ ticketId: pendingTicket.id });
    const root = renderer.root;

    // Ticket Reference ID
    expect(root.findByProps({ children: pendingTicket.ticketNumber })).toBeDefined();

    // Category
    expect(root.findByProps({ children: pendingTicket.category })).toBeDefined();

    // Status badge (displays Pending by default per requirements)
    expect(root.findByProps({ children: 'Pending' })).toBeDefined();

    // SLA Expected response
    expect(root.findByProps({ children: 'Expected Response Time' })).toBeDefined();
  });

  it('displays Pending status by default when new ticket is submitted', async () => {
    const newTicket = supportTicketsStore.createTicketFromDraft({
      category: 'Donations',
      subject: 'Tax receipt 80G',
      description: 'Need receipt',
      attachments: [],
    });
    const renderer = await renderScreen({ ticketId: newTicket.id });
    const root = renderer.root;

    expect(root.findByProps({ children: 'Pending' })).toBeDefined();
  });

  it('triggers copy action on copy button press', async () => {
    const firstTicket = supportTicketsStore.getTickets()[0];
    const renderer = await renderScreen({ ticketId: firstTicket.id });
    const root = renderer.root;

    const copyBtn = root.findByProps({ accessibilityLabel: 'Copy ticket reference ID' });
    expect(copyBtn).toBeDefined();
    expect(root.findByProps({ children: 'Copy' })).toBeDefined();

    await act(async () => {
      copyBtn.props.onPress();
    });

    expect(root.findByProps({ children: 'Copied' })).toBeDefined();
  });

  it('navigates to support dashboard when View All Tickets is pressed', async () => {
    const onViewAllMock = jest.fn();
    const renderer = await renderScreen({ onViewAllTickets: onViewAllMock });
    const root = renderer.root;

    const viewAllBtn = root.findByProps({ accessibilityLabel: 'View All Support Tickets' });
    await act(async () => {
      viewAllBtn.props.onPress();
    });

    expect(onViewAllMock).toHaveBeenCalledTimes(1);
  });

  it('navigates to create ticket when Raise Another Ticket is pressed', async () => {
    const onCreateAnotherMock = jest.fn();
    const renderer = await renderScreen({ onCreateAnotherTicket: onCreateAnotherMock });
    const root = renderer.root;

    const raiseAnotherBtn = root.findByProps({ accessibilityLabel: 'Raise Another Ticket' });
    await act(async () => {
      raiseAnotherBtn.props.onPress();
    });

    expect(onCreateAnotherMock).toHaveBeenCalledTimes(1);
  });
});
