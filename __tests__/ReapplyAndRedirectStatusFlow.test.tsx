import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { UserHomeScreen } from '../src/features/user/home/screens/UserHomeScreen';
import { ApplicationStatusScreen } from '../src/features/membership/screens/ApplicationStatusScreen';
import { MyApplicationScreen } from '../src/features/membership/screens/MyApplicationScreen';
import { MembershipProvider, useMembership } from '../src/features/membership/context/MembershipContext';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { membershipApplicationsStore } from '../src/features/admin/membershipApplications/services/membershipApplicationsStore';

const mockNavigate = jest.fn();

jest.mock('../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue(null),
    post: jest.fn().mockResolvedValue({ success: true, id: 'mem-new-123' }),
    patch: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('../src/features/user/news/services/user-news.service', () => ({
  fetchLatestPublishedNews: jest.fn().mockResolvedValue([]),
}));

jest.mock('../src/features/user/home/services/user-blogs.service', () => ({
  fetchPublishedBlogs: jest.fn().mockResolvedValue([]),
  DEFAULT_HOME_BLOGS: [],
}));

jest.mock('../src/features/admin/content/events/services/events.service', () => ({
  getEventsList: jest.fn().mockResolvedValue({ events: [] }),
}));

jest.mock('../src/features/user/home/components/HeroBanner', () => ({
  HeroBanner: ({ onCtaPress }: any) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity testID="hero-cta-btn" onPress={onCtaPress}>
        <Text>Join the Movement</Text>
      </TouchableOpacity>
    );
  },
}));

jest.mock('../src/features/admin/notifications/hooks/useUnreadCount', () => ({
  useUnreadCount: () => 0,
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
      getState: () => ({ routeNames: ['UserHome', 'MyApplication'] }),
    }),
    useFocusEffect: (cb: any) => {
      try {
        cb();
      } catch {}
    },
    useRoute: () => ({ params: {} }),
  };
});

describe('Membership Reapply & Home Status Redirection Flow', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    membershipApplicationsStore.resetForTest();
    if (typeof globalThis !== 'undefined') {
      try {
        (globalThis as any).window?.localStorage?.clear?.();
        (globalThis as any).window?.sessionStorage?.clear?.();
      } catch {}
    }
    await act(async () => {
      useAuthStore.setState({
        user: {
          id: 'usr-123',
          full_name: 'Applicant User',
          email: 'user@hrsjm.org',
          mobile_number: '9888880005',
          status: 'ACTIVE',
          roles: [{ id: 'role-1', name: 'USER' }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        status: 'authenticated',
      });
    });
  });

  it('redirects Join the Movement and Quick Actions to status when user has applied', async () => {
    const mockOpenStatus = jest.fn();
    const mockOpenActionPage = jest.fn();

    let contextRef: any;
    const TestConsumer = () => {
      contextRef = useMembership();
      return (
        <UserHomeScreen
          onOpenStatus={mockOpenStatus}
          onOpenActionPage={mockOpenActionPage}
        />
      );
    };

    let renderer: any;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <TestConsumer />
        </MembershipProvider>
      );
    });

    // Before applying, hasApplied is false
    expect(contextRef.hasApplied).toBe(false);

    // Apply for membership
    await act(async () => {
      contextRef.submitApplication({
        personalInfo: { fullName: 'Applicant User', mobileNumber: '9888880005' },
      });
    });

    expect(contextRef.hasApplied).toBe(true);
    expect(contextRef.isReapplying).toBe(false);

    const root = renderer.root;

    // 1. Hero banner CTA press
    const heroBtn = root.findByProps({ testID: 'hero-cta-btn' });
    act(() => {
      heroBtn.props.onPress();
    });
    expect(mockOpenStatus).toHaveBeenCalledTimes(1);
    expect(mockOpenActionPage).not.toHaveBeenCalledWith('join');

    // 2. Quick action "Join HRSJM" press
    const joinCard = root.findByProps({ accessibilityLabel: 'Join HRSJM' });
    act(() => {
      joinCard.props.onPress();
    });
    expect(mockOpenStatus).toHaveBeenCalledTimes(2);

    // 3. Quick action "Become a Member" press
    const memberCard = root.findByProps({ accessibilityLabel: 'Become a Member' });
    act(() => {
      memberCard.props.onPress();
    });
    expect(mockOpenStatus).toHaveBeenCalledTimes(3);
  });

  it('renders "Re-apply for Membership" on ApplicationStatusScreen when status is rejected, and triggers reapply', async () => {
    let contextRef: any;
    const TestConsumer = () => {
      contextRef = useMembership();
      return <ApplicationStatusScreen initialStatus="rejected" />;
    };

    let renderer: any;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <TestConsumer />
        </MembershipProvider>
      );
    });

    // Populate existing application to be rejected
    await act(async () => {
      const record = contextRef.submitApplication({
        personalInfo: { fullName: 'Rejected Applicant', mobileNumber: '9888880005', email: 'user@hrsjm.org' },
        addressInfo: { addressLine1: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
      });
      contextRef.updateApplicationStatus(record.applicationId, 'Rejected', 'Documents are blurry');
    });

    const json = JSON.stringify(renderer.toJSON());
    expect(json).toContain('Rejected');
    expect(json).toContain('Re-apply for Membership');

    // Find the Re-apply touchable button
    const root = renderer.root;
    const reapplyBtns = root.findAllByProps({ accessibilityLabel: 'Re-apply for Membership' });
    expect(reapplyBtns.length).toBeGreaterThan(0);

    await act(async () => {
      reapplyBtns[0].props.onPress();
    });

    // Verify reapply state was activated and navigated to categories
    expect(contextRef.isReapplying).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('MembershipCategories');
    // Verify previously filled info is pre-populated
    expect(contextRef.personalInfo.fullName).toBe('Rejected Applicant');
    expect(contextRef.addressInfo.city).toBe('New Delhi');
  });

  it('renders "Re-apply for Membership" on rejected cards in MyApplicationScreen', async () => {
    let contextRef: any;
    const TestConsumer = () => {
      contextRef = useMembership();
      return <MyApplicationScreen />;
    };

    let renderer: any;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <TestConsumer />
        </MembershipProvider>
      );
    });

    // Submit and reject
    await act(async () => {
      const record = contextRef.submitApplication({
        personalInfo: { fullName: 'Applicant User' },
      });
      contextRef.updateApplicationStatus(record.applicationId, 'Rejected');
    });

    const json = JSON.stringify(renderer.toJSON());
    expect(json).toContain('Re-apply for Membership');

    const root = renderer.root;
    const reapplyBtns = root.findAllByProps({ accessibilityLabel: 'Re-apply for Membership' });
    expect(reapplyBtns.length).toBeGreaterThan(0);

    await act(async () => {
      reapplyBtns[0].props.onPress({ stopPropagation: jest.fn() });
    });

    expect(contextRef.isReapplying).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('MembershipCategories');
  });
});
