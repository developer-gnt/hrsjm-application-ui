import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  CreateSupportTicketScreen,
  supportTicketsStore,
  APPROVED_TICKET_CATEGORIES,
} from '../src/features/support';

describe('CreateSupportTicketScreen (Phase 2: Screen 2 & Screen 3) Tests', () => {
  beforeEach(async () => {
    await act(async () => {
      supportTicketsStore.resetToFixtures();
      supportTicketsStore.clearDraft();
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
          <CreateSupportTicketScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders header, title, subtitle, stepper at Step 1, and back link', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Create Support Ticket' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'Raise your request and get help from our team.',
      })
    ).toBeDefined();
    expect(root.findByProps({ children: 'Back to Support Tickets' })).toBeDefined();
    expect(root.findByProps({ children: 'Ticket Details' })).toBeDefined();
    expect(root.findByProps({ children: 'Review' })).toBeDefined();
    expect(root.findByProps({ children: 'Submitted' })).toBeDefined();
  });

  it('renders category selector initially collapsed (Screen 2)', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const selectorBtn = root.findByProps({
      accessibilityLabel: 'Select a ticket category',
    });
    expect(selectorBtn).toBeDefined();
    expect(selectorBtn.props.accessibilityState.expanded).toBe(false);

    // In collapsed state, category cards from the dropdown should not be rendered
    const donationItem = root.findAllByProps({
      accessibilityLabel: 'Donations: Payment issues, receipts, 80G tax exemptions',
    });
    expect(donationItem.length).toBe(0);
  });

  it('tapping category selector expands Screen 3 inline dropdown with 11 approved categories', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const selectorBtn = root.findByProps({
      accessibilityLabel: 'Select a ticket category',
    });

    await act(async () => {
      selectorBtn.props.onPress();
    });

    // Check all 11 categories exist
    expect(APPROVED_TICKET_CATEGORIES.length).toBe(11);
    for (const cat of APPROVED_TICKET_CATEGORIES) {
      const match = root.findAllByProps({
        accessibilityLabel: `${cat.name}: ${cat.helperText}`,
      });
      expect(match.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('selecting a category collapses dropdown and updates selector title and store draft', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // Expand
    const selectorBtn = root.findByProps({
      accessibilityLabel: 'Select a ticket category',
    });
    await act(async () => {
      selectorBtn.props.onPress();
    });

    // Select "Membership"
    const membershipOption = root.findByProps({
      accessibilityLabel: 'Membership: Membership related queries and issues',
    });
    await act(async () => {
      membershipOption.props.onPress();
    });

    // Store draft is updated
    expect(supportTicketsStore.getDraft().category).toBe('Membership');

    // Selector is collapsed again
    const updatedSelectorBtn = root.findByProps({
      accessibilityLabel: 'Selected category: Membership. Tap to change category.',
    });
    expect(updatedSelectorBtn).toBeDefined();
    expect(updatedSelectorBtn.props.accessibilityState.expanded).toBe(false);
  });

  it('updates subject and description with live 500-char counter', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    // Counter initially 0/500
    expect(root.findByProps({ children: '0/500' })).toBeDefined();

    const textInputs = root.findAllByType(TextInput);
    const subjectInput = textInputs.find(i => i.props.accessibilityLabel === 'Subject');
    const descInput = textInputs.find(i => i.props.accessibilityLabel === 'Description');
    expect(subjectInput).toBeDefined();
    expect(descInput).toBeDefined();

    await act(async () => {
      subjectInput!.props.onChangeText('Unable to download annual certificate');
      descInput!.props.onChangeText('Please help me generate the certificate for 2026.');
    });

    // Verify counter updated
    const count = 'Please help me generate the certificate for 2026.'.length;
    expect(root.findByProps({ children: `${count}/500` })).toBeDefined();

    // Verify store draft updated
    const draft = supportTicketsStore.getDraft();
    expect(draft.subject).toBe('Unable to download annual certificate');
    expect(draft.description).toBe('Please help me generate the certificate for 2026.');
  });

  it('shows validation errors when pressing Next with empty fields', async () => {
    const onNextMock = jest.fn();
    const renderer = await renderScreen({ onNext: onNextMock });
    const root = renderer.root;

    const nextBtn = root.findByProps({ accessibilityLabel: 'Next' });

    await act(async () => {
      nextBtn.props.onPress();
    });

    // Errors displayed
    expect(root.findByProps({ children: 'Please select a ticket category.' })).toBeDefined();
    expect(root.findByProps({ children: 'Please enter a brief subject for your request.' })).toBeDefined();
    expect(root.findByProps({ children: 'Please describe your issue or request in detail.' })).toBeDefined();

    // Callback should not be called
    expect(onNextMock).not.toHaveBeenCalled();
  });

  it('calls onCancel when Cancel button is tapped', async () => {
    const onCancelMock = jest.fn();
    const renderer = await renderScreen({ onCancel: onCancelMock });
    const root = renderer.root;

    const cancelBtn = root.findByProps({ accessibilityLabel: 'Cancel' });
    await act(async () => {
      cancelBtn.props.onPress();
    });

    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('navigates with complete draft when valid form is submitted', async () => {
    const onNextMock = jest.fn();
    const renderer = await renderScreen({ onNext: onNextMock });
    const root = renderer.root;

    // Expand & select category
    const selectorBtn = root.findByProps({ accessibilityLabel: 'Select a ticket category' });
    await act(async () => {
      selectorBtn.props.onPress();
    });
    const kycOption = root.findByProps({
      accessibilityLabel: 'KYC & Documents: KYC verification and document related issues',
    });
    await act(async () => {
      kycOption.props.onPress();
    });

    // Fill inputs
    const textInputs = root.findAllByType(TextInput);
    const subjectInput = textInputs.find(i => i.props.accessibilityLabel === 'Subject');
    const descInput = textInputs.find(i => i.props.accessibilityLabel === 'Description');

    await act(async () => {
      subjectInput!.props.onChangeText('Aadhaar verification stuck');
      descInput!.props.onChangeText('Document was uploaded 3 days ago but is still pending.');
    });

    const nextBtn = root.findByProps({ accessibilityLabel: 'Next' });
    await act(async () => {
      nextBtn.props.onPress();
    });

    expect(onNextMock).toHaveBeenCalledTimes(1);
    expect(onNextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'KYC & Documents',
        subject: 'Aadhaar verification stuck',
        description: 'Document was uploaded 3 days ago but is still pending.',
        attachments: [],
      })
    );
  });
});
