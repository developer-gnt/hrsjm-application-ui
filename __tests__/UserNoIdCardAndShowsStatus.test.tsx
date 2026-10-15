import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ProfileScreen } from '../src/features/admin/profile/screens/ProfileScreen';
import { MembershipProvider } from '../src/features/membership/context/MembershipContext';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { useProfileStore } from '../src/features/admin/profile/profileStore';
import { apiClient } from '../src/core/api/client';

const mockNavigate = jest.fn();

jest.mock('../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
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

describe('User with pending membership: No ID card and shows Application Status', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await act(async () => {
      useAuthStore.setState({
        user: {
          id: 'eac7762c-4e1e-4c57-be92-bc47f8f9c3ad',
          full_name: 'HRSJM Test User',
          email: 'user@hrsjm.org',
          mobile_number: '9888880005',
          status: 'ACTIVE',
          roles: [{ id: 'role-user-id', name: 'USER' }],
          created_at: '2026-10-13T12:49:38.229Z',
          updated_at: '2026-10-15T07:21:37.047Z',
        },
        status: 'authenticated',
      });
    });

    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          id: 'eac7762c-4e1e-4c57-be92-bc47f8f9c3ad',
          full_name: 'HRSJM Test User',
          email: 'user@hrsjm.org',
          mobile_number: '9888880005',
          status: 'ACTIVE',
          roles: [{ id: 'role-user-id', name: 'USER' }],
        });
      }
      if (url === '/memberships/my') {
        return Promise.resolve({
          id: 'b8ef831e-31f0-4c20-83e2-04692959d2cb',
          status: 'PENDING',
          membership_number: null,
          category: { name: 'District Unit' },
          application_data: {
            membership_type: 'District Active Member',
            personal_details: { dob: '03/01/2008' },
          },
        });
      }
      return Promise.resolve(null);
    });
  });

  it('renders Profile with role "User", NO member ID badge, NO "Download ID Card", shows "My Status >", and shows "Application Status" card', async () => {
    await act(async () => {
      await useProfileStore.getState().fetchProfile();
    });

    const profileState = useProfileStore.getState().profile;
    expect(profileState.role).toBe('User');
    expect(profileState.hasAppliedMembership).toBe(true);
    expect(profileState.membershipStatus).toBe('Applied');
    expect(profileState.memberId).toBe('');
    expect(profileState.adminId).toBe('');

    let renderer: any;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipProvider>
          <ProfileScreen onNavigate={mockNavigate} />
        </MembershipProvider>
      );
    });

    const json = JSON.stringify(renderer.toJSON());

    // 1. Shows "User" role subtitle, NOT "Member"
    expect(json).toContain('User');
    expect(json).not.toContain('"Member"');

    // 2. Does NOT show fake auto-generated member badge
    expect(json).not.toContain('HRSJM-00011');

    // 3. Does NOT show "Download ID Card" button
    expect(json).not.toContain('Download ID Card');

    // 4. Does NOT show "My ID" button
    expect(json).not.toContain('My ID');

    // 5. Shows "My Status" top action button
    expect(json).toContain('My Status');

    // 6. Shows "Application Status" card with "Applied" status
    expect(json).toContain('Application Status');
    expect(json).toContain('Application Type');
    expect(json).toContain('District Unit');
    expect(json).toContain('Applied');
  });
});
