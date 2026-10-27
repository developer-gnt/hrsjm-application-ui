import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CreateAccountScreen } from '../src/features/auth/screens/CreateAccountScreen';
import { CreateAccountAdditionalScreen } from '../src/features/auth/screens/CreateAccountAdditionalScreen';
import { CreateAccountVerificationScreen } from '../src/features/auth/screens/CreateAccountVerificationScreen';
import { MembershipPostCard } from '../src/features/membership/components/MembershipPostCard';
import { RegisterScreen } from '../src/features/auth/screens/RegisterScreen';
import { RootNavigator } from '../src/app/navigation/RootNavigator';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { updateRegistrationState, resetRegistrationState } from '../src/features/auth/state/registrationState';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

describe('Account Types Selection and Registration Flow Tests', () => {
  beforeEach(() => {
    resetRegistrationState();
    jest.clearAllMocks();
  });

  const renderComponent = async (component: React.ReactElement) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          {component}
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders all three account types: General User, Member, and Donation Seeker', async () => {
    const renderer = await renderComponent(<CreateAccountAdditionalScreen />);
    const root = renderer.root;

    // Check that all 3 account type titles are rendered
    expect(root.findByProps({ children: 'General User' })).toBeDefined();
    expect(root.findByProps({ children: 'Member' })).toBeDefined();
    expect(root.findByProps({ children: 'Donation Seeker' })).toBeDefined();

    // Check accessibility labels
    expect(root.findByProps({ accessibilityLabel: 'General User Account Type' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Member Account Type' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Donation Seeker Account Type' })).toBeDefined();
  });

  it('triggers onContinue callback with selected account type "member"', async () => {
    const onContinueMock = jest.fn();
    const renderer = await renderComponent(
      <CreateAccountAdditionalScreen onContinue={onContinueMock} />
    );
    const root = renderer.root;

    // Tap Member card
    const memberCard = root.findByProps({ accessibilityLabel: 'Member Account Type' });
    await act(async () => {
      memberCard.props.onPress();
    });

    // Tap continue
    const continueBtn = root.findByProps({ accessibilityLabel: 'Continue' });
    await act(async () => {
      continueBtn.props.onPress();
    });

    expect(onContinueMock).toHaveBeenCalledWith('member');
  });

  it('redirects member selection to existing Member registration form in RegisterScreen', async () => {
    const navigateMock = jest.fn();
    const navigationMock: any = {
      navigate: navigateMock,
      setOptions: jest.fn(),
      goBack: jest.fn(),
    };

    updateRegistrationState({
      fullName: 'Ananya Sharma',
      email: 'ananya@example.com',
      phone: '+91 9876543210',
      countryCode: '+91',
      dob: '12/05/1995',
    });

    const renderer = await renderComponent(
      <RegisterScreen navigation={navigationMock} route={{} as any} />
    );
    const root = renderer.root;

    // Advance to step 1 (Account Type) by simulating Step 0 submission
    const createAccountScreens = root.findAllByType(CreateAccountScreen);
    if (createAccountScreens.length > 0) {
      await act(async () => {
        createAccountScreens[0].props.onContinue({
          fullName: 'Ananya Sharma',
          email: 'ananya@example.com',
          phone: '9876543210',
          countryCode: '+91',
          dob: '12/05/1995',
        });
      });
    }

    // Step 1: select member and continue
    const additionalScreens = root.findAllByType(CreateAccountAdditionalScreen);
    expect(additionalScreens.length).toBeGreaterThan(0);
    await act(async () => {
      additionalScreens[0].props.onContinue('member');
    });

    // Should redirect to existing MembershipCategories screen
    expect(navigateMock).toHaveBeenCalledWith('MembershipCategories');
  });

  it('routes authenticated user with PENDING membership status to User portal dashboard', () => {
    // When user logs in with role MEMBER but pending verification
    act(() => {
      useAuthStore.setState({
        status: 'authenticated',
        user: {
          id: 'u-pending-mem',
          full_name: 'Pending Member',
          mobile_number: '9876543210',
          email: 'pending@example.com',
          roles: [{ id: 'r-mem', name: 'MEMBER' }],
          membership_status: 'PENDING',
          assistance_status: null,
          account_type: 'member',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'ACTIVE',
        },
      });
    });

    // RootNavigator evaluation
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<RootNavigator />);
    });

    // Should render UserTabNavigator (User dashboard), NOT MemberTabNavigator
    const root = renderer!.root;
    expect(root.findByProps({ roleType: 'user' })).toBeDefined();
  });

  it('routes authenticated user with APPROVED membership status to Member portal', () => {
    act(() => {
      useAuthStore.setState({
        status: 'authenticated',
        user: {
          id: 'u-approved-mem',
          full_name: 'Approved Member',
          mobile_number: '9876543210',
          email: 'approved@example.com',
          roles: [{ id: 'r-mem', name: 'MEMBER' }],
          membership_status: 'ACTIVE',
          assistance_status: null,
          account_type: 'member',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'ACTIVE',
        },
      });
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<RootNavigator />);
    });

    const root = renderer!.root;
    expect(root.findByProps({ roleType: 'member' })).toBeDefined();
  });

  it('routes authenticated user with PENDING donation seeker status to User portal dashboard', () => {
    act(() => {
      useAuthStore.setState({
        status: 'authenticated',
        user: {
          id: 'u-pending-seeker',
          full_name: 'Pending Seeker',
          mobile_number: '9876543211',
          email: 'seeker@example.com',
          roles: [{ id: 'r-usr', name: 'USER' }],
          membership_status: null,
          assistance_status: 'PENDING',
          account_type: 'seeker',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'ACTIVE',
        },
      });
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<RootNavigator />);
    });

    const root = renderer!.root;
    expect(root.findByProps({ roleType: 'user' })).toBeDefined();
  });

  it('renders yellow Apply Now button on MembershipPostCard', async () => {
    const onApplyMock = jest.fn();
    const renderer = await renderComponent(
      <MembershipPostCard
        id="test-post"
        postName="State Active Member"
        qualification="Minimum 8th Class"
        fee="₹ 900"
        validity="1 Year"
        checklistItems={['Appointment Letter']}
        kitItems={['1. Appointment Letter']}
        icon={<></>}
        onApply={onApplyMock}
      />
    );
    const root = renderer.root;
    const applyButton = root.findByProps({ accessibilityLabel: 'Apply Now for State Active Member' });
    expect(applyButton).toBeDefined();
    // Verify yellow background styling
    const flattenedStyle = Array.isArray(applyButton.props.style)
      ? Object.assign({}, ...applyButton.props.style)
      : applyButton.props.style;
    expect(flattenedStyle.backgroundColor).toBe('#EAA224');
  });

  it('renders Create Password fields on CreateAccountVerificationScreen for Donation Seeker', async () => {
    const renderer = await renderComponent(<CreateAccountVerificationScreen />);
    const root = renderer.root;

    // Verify Password and Confirm Password inputs
    expect(root.findByProps({ accessibilityLabel: 'Password' })).toBeDefined();
    expect(root.findByProps({ accessibilityLabel: 'Confirm Password' })).toBeDefined();
    expect(root.findByProps({ children: 'Create Password' })).toBeDefined();
    expect(root.findByProps({ children: 'Password must contain:' })).toBeDefined();
  });
});
