import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity, Text } from 'react-native';
import { MembershipStep1Screen } from '../src/features/membership/screens/MembershipStep1Screen';
import { MembershipProvider } from '../src/features/membership/context/MembershipContext';
import { authService } from '../src/features/auth/services/auth.service';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
    canGoBack: () => true,
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: (cb: any) => cb(),
}));

describe('MembershipStep1Screen — Duplicate Email and Mobile Live Debounced Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('performs live debounced duplicate check for mobile number and shows error on step 1', async () => {
    const checkDuplicatesSpy = jest.spyOn(authService, 'checkDuplicates').mockResolvedValue({
      available: false,
      mobile_taken: true,
      email_taken: false,
      mobile_message: 'Mobile number is already registered. Please sign in or use another number.',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <MembershipStep1Screen />
        </MembershipProvider>
      );
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    const mobileInput = inputs.find(i => i.props.accessibilityLabel === 'Mobile Number');
    expect(mobileInput).toBeDefined();

    // Type 10 digits
    await act(async () => {
      mobileInput?.props.onChangeText('9876543210');
    });

    // Fast-forward debounce timer (500ms)
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(checkDuplicatesSpy).toHaveBeenCalledWith('9876543210', undefined, undefined);

    const texts = renderer!.root.findAllByType(Text);
    const hasDuplicateError = texts.some(t =>
      typeof t.props.children === 'string' &&
      t.props.children.includes('Mobile number is already registered')
    );
    expect(hasDuplicateError).toBe(true);
  });

  it('performs live debounced duplicate check for email address and shows error on step 1', async () => {
    const checkDuplicatesSpy = jest.spyOn(authService, 'checkDuplicates').mockResolvedValue({
      available: false,
      mobile_taken: false,
      email_taken: true,
      email_message: 'Email address is already registered. Please sign in or use another email.',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <MembershipStep1Screen />
        </MembershipProvider>
      );
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    const emailInput = inputs.find(i => i.props.accessibilityLabel === 'Email Address');
    expect(emailInput).toBeDefined();

    // Type valid email
    await act(async () => {
      emailInput?.props.onChangeText('existing@example.com');
    });

    // Fast-forward debounce timer (500ms)
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(checkDuplicatesSpy).toHaveBeenCalledWith(undefined, 'existing@example.com', undefined);

    const texts = renderer!.root.findAllByType(Text);
    const hasDuplicateError = texts.some(t =>
      typeof t.props.children === 'string' &&
      t.props.children.includes('Email address is already registered')
    );
    expect(hasDuplicateError).toBe(true);
  });

  it('blocks navigation to step 2 when continue is pressed with duplicate credentials', async () => {
    jest.spyOn(authService, 'checkDuplicates').mockResolvedValue({
      available: false,
      mobile_taken: true,
      email_taken: false,
      mobile_message: 'Mobile number is already registered. Please sign in or use another number.',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <MembershipStep1Screen />
        </MembershipProvider>
      );
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    const fullNameInput = inputs.find(i => i.props.accessibilityLabel === 'Full Name');
    const mobileInput = inputs.find(i => i.props.accessibilityLabel === 'Mobile Number');
    const emailInput = inputs.find(i => i.props.accessibilityLabel === 'Email Address');
    const policeInput = inputs.find(i => i.props.accessibilityLabel === 'Nearby Police Station');
    const passwordInput = inputs.find(i => i.props.accessibilityLabel === 'Password');
    const confirmInput = inputs.find(i => i.props.accessibilityLabel === 'Confirm Password');

    await act(async () => {
      fullNameInput?.props.onChangeText('Test Applicant');
      mobileInput?.props.onChangeText('9876543210');
      emailInput?.props.onChangeText('test@example.com');
      policeInput?.props.onChangeText('Central Police Station');
      passwordInput?.props.onChangeText('Secret123');
      confirmInput?.props.onChangeText('Secret123');
    });

    // Set DOB and Gender through context or trigger
    const buttons = renderer!.root.findAllByType(TouchableOpacity);
    const continueBtn = buttons.find(b => b.props.accessibilityLabel === 'Continue to Address Details');
    expect(continueBtn).toBeDefined();

    await act(async () => {
      continueBtn?.props.onPress();
    });

    // Should not navigate because of validation or duplicate check
    expect(mockNavigate).not.toHaveBeenCalledWith('MembershipStep2Address');
  });
});

