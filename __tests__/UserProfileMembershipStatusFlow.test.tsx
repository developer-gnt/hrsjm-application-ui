import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ProfileScreen } from '../src/features/admin/profile/screens/ProfileScreen';
import { MembershipProvider, useMembership } from '../src/features/membership/context/MembershipContext';
import { membershipApplicationsStore } from '../src/features/admin/membershipApplications/services/membershipApplicationsStore';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { useProfileStore } from '../src/features/admin/profile/profileStore';

import { apiClient } from '../src/core/api/client';

const mockNavigate = jest.fn();

jest.mock('../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue(null),
    post: jest.fn().mockResolvedValue({ success: true }),
    patch: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
    }),
    useFocusEffect: (cb: any) => {
      try {
        cb();
      } catch {}
    },
    useRoute: () => ({ params: {} }),
  };
});

describe('User Profile - Join Membership, Status Sync & Member Conversion Flow', () => {
  beforeAll(() => {
    membershipApplicationsStore.resetForTest();
  });

  afterAll(() => {
    membershipApplicationsStore.resetForTest();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await act(async () => {
      useAuthStore.setState({
        user: {
          id: 'user-999',
          full_name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com',
          mobile_number: '+91 99887 76655',
          status: 'ACTIVE',
          roles: [{ id: 'role-user', name: 'USER' }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        status: 'authenticated',
      });
    });
  });

  it('1. Shows "Join Membership" when user has not applied and redirects to Member Category page', async () => {
    let renderer: any;
    const onJoinMembershipMock = jest.fn();

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <ProfileScreen
            showIdCard={false}
            onJoinMembership={onJoinMembershipMock}
            onNavigate={mockNavigate}
          />
        </MembershipProvider>
      );
    });

    const rootText = JSON.stringify(renderer.toJSON());

    // Should render Join Membership button
    expect(rootText).toContain('Join Membership');
    expect(rootText).toContain('Become an Official Member');
    expect(rootText).toContain('Explore Membership Categories');

    // Find and press the Join Membership button
    const joinBtns = renderer.root.findAllByProps({ accessibilityLabel: 'Join Membership' });
    expect(joinBtns.length).toBeGreaterThan(0);

    await act(async () => {
      joinBtns[0].props.onPress();
    });

    expect(onJoinMembershipMock).toHaveBeenCalled();
    renderer.unmount();
  });

  it('2. Shows "My Status" when user has applied for membership and displays live status', async () => {
    let renderer: any;

    const TestApplier: React.FC = () => {
      const { submitApplication } = useMembership();
      return (
        <button
          data-testid="apply-now-btn"
          onClick={() => {
            submitApplication({
              personalInfo: {
                fullName: 'Rahul Sharma',
                email: 'rahul.sharma@example.com',
                mobileNumber: '9988776655',
              },
            });
          }}
        />
      );
    };

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <TestApplier />
          <ProfileScreen
            showIdCard={false}
            onNavigate={mockNavigate}
          />
        </MembershipProvider>
      );
    });

    // Simulate user submitting an application
    const applyBtn = renderer.root.findByProps({ 'data-testid': 'apply-now-btn' });
    await act(async () => {
      applyBtn.props.onClick();
    });

    const rootTextAfterApply = JSON.stringify(renderer.toJSON());

    // Should now show My Status button and Application Status card
    expect(rootTextAfterApply).toContain('My Status');
<<<<<<< HEAD
    expect(rootTextAfterApply).toContain('Application Status');
    expect(rootTextAfterApply).toContain('Applied');
    renderer.unmount();
=======
    expect(rootTextAfterApply).toMatch(/Applied|Submitted|Under Review/);
>>>>>>> 05fa9d2af0a42b85cc852787fee50475cc0badc8
  });

  it('3. Admin marks application as Rejected with reason -> user sees Rejected and reason', async () => {
    const storeApps = membershipApplicationsStore.getApplications();
    const app = storeApps.find(a => a.email === 'rahul.sharma@example.com');
    if (app) {
      await act(async () => {
        await membershipApplicationsStore.updateStatus(app.id, 'rejected', 'Incomplete address proof document');
      });
    }

    let renderer: any;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <ProfileScreen
            showIdCard={false}
            onNavigate={mockNavigate}
          />
        </MembershipProvider>
      );
    });

    const rootText = JSON.stringify(renderer.toJSON());
    expect(rootText).toContain('Rejected');
    expect(rootText).toContain('Reason for Rejection');
    expect(rootText).toContain('Incomplete address proof document');
    renderer.unmount();
  });

  it('4. Admin marks application as Approved -> user role is converted to MEMBER and sees My ID', async () => {
    const storeApps = membershipApplicationsStore.getApplications();
    const app = storeApps.find(a => a.email === 'rahul.sharma@example.com');
    if (app) {
      await act(async () => {
        await membershipApplicationsStore.updateStatus(app.id, 'approved');
      });
    }

    // Role in useAuthStore should now be upgraded to MEMBER
    const updatedUser = useAuthStore.getState().user;
    expect(updatedUser?.roles?.some(r => r.name === 'MEMBER')).toBe(true);

    let renderer: any;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <ProfileScreen
            onNavigate={mockNavigate}
          />
        </MembershipProvider>
      );
    });

    const rootText = JSON.stringify(renderer.toJSON());
    // Since role is now MEMBER, user has an ID card and sees My ID
    expect(rootText).toContain('My ID');
    expect(rootText).toContain('Member');
    renderer.unmount();
  });
});
