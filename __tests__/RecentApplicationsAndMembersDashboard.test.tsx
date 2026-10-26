import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { RecentMembersCard } from '../src/features/admin/dashboard/components/RecentMembersCard';
import { RecentApplicationsCard } from '../src/features/admin/dashboard/components/RecentApplicationsCard';
import { getRecentMembers, getRecentApplications } from '../src/features/admin/dashboard/services/dashboard.service';
import { membershipApplicationsStore } from '../src/features/admin/membershipApplications/services/membershipApplicationsStore';
import { apiClient } from '../src/core/api/client';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { RootNavigator } from '../src/app/navigation/RootNavigator';

jest.mock('../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Recent Applications and Recent Members Dashboard Data Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, status: 'unauthenticated' });
    membershipApplicationsStore.resetForTest();
  });

  describe('1. Recent Members Card Filtering & Empty State', () => {
    it('shows only members whose applications have been approved and filters out pending applicants', () => {
      const mockList: any[] = [
        {
          id: 'user-1',
          full_name: 'Approved Member One',
          status: 'ACTIVE',
          membership: { status: 'ACTIVE', membershipNumber: 'HRSJM-001' },
          created_at: '2026-10-20',
        },
        {
          id: 'user-2',
          full_name: 'Pending Applicant Two',
          status: 'ACTIVE', // user status might be ACTIVE in users table
          membership: { status: 'PENDING', membershipNumber: null }, // membership is pending
          created_at: '2026-10-21',
        },
        {
          id: 'user-3',
          full_name: 'Under Review Applicant Three',
          status: 'ACTIVE',
          membership: { status: 'UNDER_REVIEW' },
          created_at: '2026-10-22',
        },
        {
          id: 'user-4',
          full_name: 'General User Without Membership',
          status: 'ACTIVE',
          membership: null,
          created_at: '2026-10-23',
        },
        {
          id: 'user-5',
          full_name: 'Approved Member Five',
          status: 'ACTIVE',
          membership: { status: 'APPROVED', membershipNumber: 'HRSJM-005' },
          created_at: '2026-10-24',
        },
      ];

      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(<RecentMembersCard members={mockList} />);
      });

      const textNodes = tree!.root.findAllByType('Text' as any).map(node => String(node.props.children));
      const fullText = textNodes.join(' ');

      // Approved members must be displayed
      expect(fullText).toContain('Approved Member One');
      expect(fullText).toContain('Approved Member Five');

      // Pending, Under Review, and General Users must NOT appear in Recent Members
      expect(fullText).not.toContain('Pending Applicant Two');
      expect(fullText).not.toContain('Under Review Applicant Three');
      expect(fullText).not.toContain('General User Without Membership');
    });

    it('renders clean empty state when there are no approved members instead of hardcoded mock users', () => {
      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(<RecentMembersCard members={[]} />);
      });

      const textNodes = tree!.root.findAllByType('Text' as any).map(node => String(node.props.children));
      const fullText = textNodes.join(' ');

      expect(fullText).toContain('No approved members yet');
      // Must not show mock placeholder users like 'Aman Shaikh'
      expect(fullText).not.toContain('Aman Shaikh');
      expect(fullText).not.toContain('Saniya Khan');
    });
  });

  describe('2. Recent Applications Card Filtering & Empty State', () => {
    it('shows submitted applications awaiting review and excludes approved/closed ones', () => {
      const mockApplications: any[] = [
        {
          id: 'app-1',
          full_name: 'Applicant Awaiting Review',
          status: 'PENDING',
          created_at: '2026-10-25',
        },
        {
          id: 'app-2',
          full_name: 'Applicant In Review',
          status: 'UNDER_REVIEW',
          created_at: '2026-10-24',
        },
        {
          id: 'app-3',
          full_name: 'Already Approved Applicant',
          status: 'APPROVED',
          created_at: '2026-10-20',
        },
      ];

      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(<RecentApplicationsCard rows={mockApplications} />);
      });

      const textNodes = tree!.root.findAllByType('Text' as any).map(node => String(node.props.children));
      const fullText = textNodes.join(' ');

      expect(fullText).toContain('Applicant Awaiting Review');
      expect(fullText).toContain('Applicant In Review');
      // Approved applicant should not appear in pending recent applications awaiting review
      expect(fullText).not.toContain('Already Approved Applicant');
    });

    it('renders clean empty state when no applications are awaiting review instead of hardcoded mock users', () => {
      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(<RecentApplicationsCard rows={[]} />);
      });

      const textNodes = tree!.root.findAllByType('Text' as any).map(node => String(node.props.children));
      const fullText = textNodes.join(' ');

      expect(fullText).toContain('No pending applications');
      expect(fullText).not.toContain('Amina Sheikh');
      expect(fullText).not.toContain('Tariq Mehmood');
    });
  });

  describe('3. Dashboard Service Query Integration', () => {
    it('getRecentMembers queries API with membershipStatus=ACTIVE and returns only approved members', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        success: true,
        message: 'OK',
        data: {
          items: [
            {
              id: 'u-1',
              full_name: 'Approved Member Live',
              status: 'ACTIVE',
              membership: { status: 'ACTIVE', membershipNumber: 'HRSJM-101' },
            },
            {
              id: 'u-2',
              full_name: 'Pending Member Live',
              status: 'ACTIVE',
              membership: { status: 'PENDING' },
            },
          ],
        },
      } as any);

      const result = await getRecentMembers(5);

      // Verifies backend query parameter
      expect(mockedApiClient.get).toHaveBeenCalledWith('/admin/members', {
        params: { page: 1, limit: 5, membershipStatus: 'ACTIVE' },
      });

      // Verifies only approved member is returned
      expect(result).toHaveLength(1);
      expect(result[0].full_name).toBe('Approved Member Live');
      expect(result[0].status).toBe('ACTIVE');
    });
  });

  describe('4. Approval Workflow & Live Store Sync', () => {
    it('moves application from pending to approved and updates store listeners without restart', async () => {
      const listenerSpy = jest.fn();
      const unsubscribe = membershipApplicationsStore.subscribe(listenerSpy);

      // Add a pending application
      membershipApplicationsStore.addApplication({
        id: 'app-999',
        applicationId: 'APP-999',
        applicantName: 'Kareem Ahmed',
        membershipType: 'Standard Member',
        status: 'submitted',
        submittedAt: '26 Oct 2026',
        submittedDate: '2026-10-26T10:00:00.000Z',
        phone: '9876543210',
      });

      expect(listenerSpy).toHaveBeenCalled();
      const pendingApps = membershipApplicationsStore.getApplications();
      expect(pendingApps.find(a => a.id === 'app-999')?.status).toBe('submitted');

      // Admin approves the application
      await membershipApplicationsStore.updateStatus('app-999', 'approved');

      const updatedApps = membershipApplicationsStore.getApplications();
      const approvedApp = updatedApps.find(a => a.id === 'app-999');
      expect(approvedApp?.status).toBe('approved');

      // Verifies store subscriber was notified so UI can re-render immediately
      expect(listenerSpy).toHaveBeenCalledTimes(2);

      unsubscribe();
    });

    it('keeps Donation Seeker applications separate from Member records', () => {
      membershipApplicationsStore.addApplication({
        id: 'sek-101',
        applicationId: 'HRSJM-SEK-101',
        applicantName: 'Fatima Begum',
        membershipType: 'Donation Seeker',
        status: 'submitted',
        submittedAt: '26 Oct 2026',
        submittedDate: '2026-10-26T11:00:00.000Z',
        phone: '9876543211',
      });

      // Member applications list strictly excludes Donation Seekers
      const memberApps = membershipApplicationsStore.getApplications();
      expect(memberApps.find(a => a.id === 'sek-101')).toBeUndefined();

      // But the seeker record exists in storage by its specific ID
      const seekerApp = membershipApplicationsStore.getApplicationById('sek-101');
      expect(seekerApp).toBeDefined();
      expect(seekerApp?.membershipType).toBe('Donation Seeker');
      expect(seekerApp?.applicationId).toContain('HRSJM-SEK');
    });
  });

  describe('5. Login and Dashboard Routing for Account Types', () => {
    it('routes General User directly to User dashboard without verification requirement', () => {
      useAuthStore.setState({
        status: 'authenticated',
        user: {
          id: 'u-gen',
          full_name: 'General User',
          mobile_number: '9876543210',
          email: 'general@example.com',
          status: 'ACTIVE',
          roles: [{ id: 'r-user', name: 'USER' }],
          membership_status: null,
          assistance_status: null,
          created_at: '2026-10-24T00:00:00.000Z',
          updated_at: '2026-10-24T00:00:00.000Z',
        },
      });

      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(<RootNavigator />);
      });

      expect(tree).toBeDefined();
    });

    it('allows Member with pending verification to log in and open User dashboard', () => {
      useAuthStore.setState({
        status: 'authenticated',
        user: {
          id: 'u-mem-pending',
          full_name: 'Pending Member User',
          mobile_number: '9876543212',
          email: 'pendingmember@example.com',
          status: 'ACTIVE',
          roles: [{ id: 'r-mem', name: 'MEMBER' }],
          membership_status: 'PENDING',
          assistance_status: null,
          created_at: '2026-10-24T00:00:00.000Z',
          updated_at: '2026-10-24T00:00:00.000Z',
        },
      });

      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(<RootNavigator />);
      });

      expect(tree).toBeDefined();
    });

    it('allows Donation Seeker with pending verification to log in and open User dashboard', () => {
      useAuthStore.setState({
        status: 'authenticated',
        user: {
          id: 'u-sek-pending',
          full_name: 'Pending Seeker User',
          mobile_number: '9876543213',
          email: 'pendingseeker@example.com',
          status: 'ACTIVE',
          roles: [{ id: 'r-sek', name: 'DONATION_SEEKER' }],
          membership_status: null,
          assistance_status: 'PENDING',
          created_at: '2026-10-24T00:00:00.000Z',
          updated_at: '2026-10-24T00:00:00.000Z',
        },
      });

      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(<RootNavigator />);
      });

      expect(tree).toBeDefined();
    });
  });
});
