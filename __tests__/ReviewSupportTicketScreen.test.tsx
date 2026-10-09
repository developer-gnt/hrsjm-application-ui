import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ReviewSupportTicketScreen,
  supportTicketsStore,
} from '../src/features/support';

describe('ReviewSupportTicketScreen (Phase 3: Screen 4) Tests', () => {
  beforeEach(async () => {
    await act(async () => {
      supportTicketsStore.resetToFixtures();
      supportTicketsStore.clearDraft();
      // Setup draft for review
      supportTicketsStore.updateDraft({
        category: 'ID Card & Certificate',
        subject: 'Certificate delivery address change',
        description: 'Need to update delivery address before the physical certificate is dispatched.',
        attachments: [
          {
            id: 'att-1',
            name: 'address_proof.pdf',
            size: 245000,
            formattedSize: '239 KB',
            type: 'pdf',
          },
        ],
      });
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
          <ReviewSupportTicketScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders header, title, subtitle, stepper at Step 2, and breadcrumb link', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Review Your Ticket' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'Please verify your information before submitting.',
      })
    ).toBeDefined();
    expect(root.findByProps({ children: 'Back to Ticket Details' })).toBeDefined();
    expect(root.findByProps({ children: 'Ticket Details Summary' })).toBeDefined();
  });

  it('displays category, subject, description, and attached files from draft', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // Category displayed
    expect(root.findByProps({ children: 'ID Card & Certificate' })).toBeDefined();

    // Subject displayed
    expect(root.findByProps({ children: 'Certificate delivery address change' })).toBeDefined();

    // Description displayed
    expect(
      root.findByProps({
        children: 'Need to update delivery address before the physical certificate is dispatched.',
      })
    ).toBeDefined();

    // Attached files count and name
    expect(root.findByProps({ children: 'ATTACHED FILES (1)' })).toBeDefined();
    expect(root.findByProps({ children: 'address_proof.pdf' })).toBeDefined();
    expect(root.findByProps({ children: '239 KB' })).toBeDefined();
  });

  it('displays "No files attached" when draft has zero attachments', async () => {
    await act(async () => {
      supportTicketsStore.updateDraft({ attachments: [] });
    });

    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'ATTACHED FILES (0)' })).toBeDefined();
    expect(root.findByProps({ children: 'No files attached' })).toBeDefined();
  });

  it('triggers onEdit callback when top Edit button or Back link is pressed', async () => {
    const onEditMock = jest.fn();
    const renderer = await renderScreen({ onEdit: onEditMock });
    const root = renderer.root;

    const editBtn = root.findByProps({ accessibilityLabel: 'Edit Ticket Details' });
    await act(async () => {
      editBtn.props.onPress();
    });
    expect(onEditMock).toHaveBeenCalledTimes(1);

    const backBtn = root.findByProps({ accessibilityLabel: 'Back to edit ticket details' });
    await act(async () => {
      backBtn.props.onPress();
    });
    expect(onEditMock).toHaveBeenCalledTimes(2);

    // Verify draft data is still preserved in store for editing
    const draft = supportTicketsStore.getDraft();
    expect(draft.subject).toBe('Certificate delivery address change');
    expect(draft.category).toBe('ID Card & Certificate');
  });

  it('submits ticket, adds it to the store, and calls onSubmitSuccess callback', async () => {
    const onSubmitSuccessMock = jest.fn();
    const renderer = await renderScreen({ onSubmitSuccess: onSubmitSuccessMock });
    const root = renderer.root;

    const initialTotal = supportTicketsStore.getTickets().length;
    expect(initialTotal).toBe(12);

    const submitBtn = root.findByProps({ accessibilityLabel: 'Submit Ticket' });
    await act(async () => {
      submitBtn.props.onPress();
    });

    // Verify ticket added to store with pending status
    const ticketsAfter = supportTicketsStore.getTickets();
    expect(ticketsAfter.length).toBe(13);

    const createdTicket = ticketsAfter[0];
    expect(createdTicket.subject).toBe('Certificate delivery address change');
    expect(createdTicket.category).toBe('ID Card & Certificate');
    expect(createdTicket.status).toBe('pending');
    expect(createdTicket.id).toMatch(/^TKT-2026-\d{4}$/);

    // Verify onSubmitSuccess callback invoked with created ticket
    expect(onSubmitSuccessMock).toHaveBeenCalledTimes(1);
    expect(onSubmitSuccessMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: createdTicket.id,
        category: 'ID Card & Certificate',
      })
    );

    // Draft is now cleared
    expect(supportTicketsStore.getDraft().subject).toBe('');
  });

  it('renders View button on attached documents and opens preview when tapped', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const viewDocBtn = root.findByProps({
      accessibilityLabel: 'View document address_proof.pdf',
    });
    expect(viewDocBtn).toBeDefined();

    await act(async () => {
      viewDocBtn.props.onPress();
    });

    expect(root.findByProps({ children: 'Document Preview' })).toBeDefined();
  });
});
