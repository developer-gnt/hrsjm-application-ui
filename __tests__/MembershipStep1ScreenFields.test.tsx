import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import { MembershipStep1Screen } from '../src/features/membership/screens/MembershipStep1Screen';
import { MembershipProvider } from '../src/features/membership/context/MembershipContext';
import { useAuthStore } from '../src/features/auth/store/authStore';

// Mock navigation
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

describe('MembershipStep1Screen — Placeholder, Police Station, and Password Fields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAuthStore.setState({
        user: {
          id: 'usr-test-123',
          full_name: 'HRSJM Test User',
          email: 'test@hrsjm.org',
          mobile_number: '9876543210',
          roles: [{ id: 'role-user', name: 'USER' }],
        } as any,
      });
    });
  });

  it('renders Full Name with user name as placeholder and empty input value', async () => {
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
    expect(fullNameInput).toBeDefined();
    expect(fullNameInput?.props.placeholder).toBe('HRSJM Test User');
    expect(fullNameInput?.props.value).toBe('');
  });

  it('renders Nearby Police Station input', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <MembershipStep1Screen />
        </MembershipProvider>
      );
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    const policeStationInput = inputs.find(i => i.props.accessibilityLabel === 'Nearby Police Station');
    expect(policeStationInput).toBeDefined();
    expect(policeStationInput?.props.placeholder).toBe('Enter nearby police station');
  });

  it('renders Password and Confirm Password inputs with eye toggle buttons', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <MembershipStep1Screen />
        </MembershipProvider>
      );
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    const passwordInput = inputs.find(i => i.props.accessibilityLabel === 'Password');
    const confirmPasswordInput = inputs.find(i => i.props.accessibilityLabel === 'Confirm Password');

    expect(passwordInput).toBeDefined();
    expect(confirmPasswordInput).toBeDefined();
    expect(passwordInput?.props.secureTextEntry).toBe(true);
    expect(confirmPasswordInput?.props.secureTextEntry).toBe(true);

    const buttons = renderer!.root.findAllByType(TouchableOpacity);
    const togglePasswordBtn = buttons.find(b => b.props.accessibilityLabel === 'Show password');
    expect(togglePasswordBtn).toBeDefined();
  });

  it('renders Qualification Proof upload card in MembershipStep3Screen', async () => {
    const { MembershipStep3Screen } = require('../src/features/membership/screens/MembershipStep3Screen');
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <MembershipStep3Screen />
        </MembershipProvider>
      );
    });

    const rootText = JSON.stringify(renderer!.toJSON());
    expect(rootText).toContain('Qualification Proof');
    expect(rootText).toContain('Graduation Degree, Diploma or Highest Certificate');
    expect(rootText).toContain('(4 documents)');
  });
});
