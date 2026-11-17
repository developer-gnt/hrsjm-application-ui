import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import {
  MEMBERSHIP_POSITIONS,
  MEMBERSHIP_POSITIONS_DATA,
  isValidMembershipPosition,
  normalizeMembershipPosition,
} from '../src/features/admin/membershipApplications/constants/membershipPositions';
import { membershipApplicationsStore } from '../src/features/admin/membershipApplications/services/membershipApplicationsStore';
import { MembershipPositionSelector } from '../src/features/admin/membershipApplications/components/MembershipPositionSelector';

describe('Membership Position Feature', () => {
  describe('1. 25 Official Membership Positions Data Integrity', () => {
    it('has exactly 25 official positions matching the reference image', () => {
      expect(MEMBERSHIP_POSITIONS_DATA).toHaveLength(25);
      expect(MEMBERSHIP_POSITIONS).toHaveLength(25);
    });

    it('matches exact naming, ordering, and notes from reference chart', () => {
      const expected = [
        { id: 1, name: 'President' },
        { id: 2, name: 'Executive President' },
        { id: 3, name: 'Deputy Executive President' },
        { id: 4, name: 'Vice President' },
        { id: 5, name: 'Deputy Vice President' },
        { id: 6, name: 'Chief Secretary' },
        { id: 7, name: 'Deputy Chief Secretary' },
        { id: 8, name: 'Joint Secretary' },
        { id: 9, name: 'Chief Observer' },
        { id: 10, name: 'Deputy Chief Observer' },
        { id: 11, name: 'Chief Reporting Officer' },
        { id: 12, name: 'Deputy Reporting Officer' },
        { id: 13, name: 'Chief Coordinator' },
        { id: 14, name: 'Deputy Chief Coordinator' },
        {
          id: 15,
          name: 'Minority Welfare Secretary',
          note: 'Reserved for a minority-community representative',
        },
        {
          id: 16,
          name: 'Women Empowerment Secretary',
          note: 'Reserved for a female candidate',
        },
        { id: 17, name: 'Social Welfare Secretary' },
        { id: 18, name: 'Consumer Welfare Secretary' },
        { id: 19, name: 'Human Welfare Secretary' },
        { id: 20, name: 'Administrative Secretary' },
        { id: 21, name: 'Deputy Administrative Secretary' },
        { id: 22, name: 'Information Secretary' },
        { id: 23, name: 'Organising Secretary' },
        {
          id: 24,
          name: 'Legal Advisor',
          note: 'Reserved for a qualified Advocate',
        },
        { id: 25, name: 'Deputy Legal Advisor' },
      ];

      expected.forEach((exp, idx) => {
        const actual = MEMBERSHIP_POSITIONS_DATA[idx];
        expect(actual.id).toBe(exp.id);
        expect(actual.name).toBe(exp.name);
        if (exp.note) {
          expect(actual.note).toBe(exp.note);
        }
      });
    });

    it('validates position names correctly', () => {
      expect(isValidMembershipPosition('President')).toBe(true);
      expect(isValidMembershipPosition('executive president')).toBe(true);
      expect(isValidMembershipPosition('Organising Secretary')).toBe(true);
      expect(isValidMembershipPosition('Deputy Legal Advisor')).toBe(true);
      expect(isValidMembershipPosition('Random Fake Role')).toBe(false);
      expect(isValidMembershipPosition('')).toBe(false);
      expect(isValidMembershipPosition(null)).toBe(false);
    });

    it('normalizes position names correctly', () => {
      expect(normalizeMembershipPosition('vice president')).toBe('Vice President');
      expect(normalizeMembershipPosition('   legal advisor   ')).toBe('Legal Advisor');
      expect(normalizeMembershipPosition('Nonexistent Role')).toBeNull();
    });
  });

  describe('2. Store & Application Workflow Integration', () => {
    const testAppId = 'test-pos-app-1';

    beforeEach(() => {
      // Seed a test application into the store
      (membershipApplicationsStore as any).applications = [
        {
          id: testAppId,
          applicationId: 'HRSJM-APP-99881',
          applicantName: 'Vikram Singh',
          membershipType: 'Annual General Member',
          status: 'submitted',
          submittedAt: '17 Nov 2026, 10:00 AM',
          submittedDate: new Date().toISOString(),
          phone: '9876543210',
          email: 'vikram@example.com',
          membershipPosition: undefined,
        },
      ];
    });

    it('assigns position to an application', async () => {
      const success = await membershipApplicationsStore.assignPosition(
        testAppId,
        'Chief Secretary',
      );
      expect(success).toBe(true);

      const app = membershipApplicationsStore.getApplicationById(testAppId);
      expect(app?.membershipPosition).toBe('Chief Secretary');
    });

    it('approves application and permanently saves assigned position', async () => {
      // First assign position
      await membershipApplicationsStore.assignPosition(
        testAppId,
        'Deputy Chief Secretary',
      );

      // Now approve
      await membershipApplicationsStore.updateStatus(
        testAppId,
        'approved',
        undefined,
        'Deputy Chief Secretary',
      );

      const approvedApp = membershipApplicationsStore.getApplicationById(testAppId);
      expect(approvedApp?.status).toBe('approved');
      expect(approvedApp?.membershipPosition).toBe('Deputy Chief Secretary');
    });
  });

  describe('3. MembershipPositionSelector Component UI', () => {
    it('renders the selector button with placeholder when no position is selected', () => {
      let renderer: TestRenderer.ReactTestRenderer;
      act(() => {
        renderer = TestRenderer.create(
          <MembershipPositionSelector
            selectedPosition={null}
            onSelectPosition={jest.fn()}
          />,
        );
      });

      const root = renderer!.root;
      const textNodes = root.findAllByType('Text' as any);
      const textContents = textNodes.map((n) => n.props.children);
      expect(
        textContents.some(
          (t) =>
            typeof t === 'string' &&
            t.includes('Select 1 of 25 Membership Positions'),
        ),
      ).toBe(true);
    });

    it('renders selected position name when provided', () => {
      let renderer: TestRenderer.ReactTestRenderer;
      act(() => {
        renderer = TestRenderer.create(
          <MembershipPositionSelector
            selectedPosition="Executive President"
            onSelectPosition={jest.fn()}
          />,
        );
      });

      const root = renderer!.root;
      const textNodes = root.findAllByType('Text' as any);
      const textContents = textNodes.map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : n.props.children,
      );
      expect(textContents).toContain('Executive President');
      expect(textContents).toContain('Position #2');
    });

    it('displays error message when error prop is passed', () => {
      let renderer: TestRenderer.ReactTestRenderer;
      act(() => {
        renderer = TestRenderer.create(
          <MembershipPositionSelector
            selectedPosition={null}
            onSelectPosition={jest.fn()}
            error="Please select a Membership Position"
          />,
        );
      });

      const root = renderer!.root;
      const textNodes = root.findAllByType('Text' as any);
      const textContents = textNodes.map((n) => n.props.children);
      expect(textContents).toContain('Please select a Membership Position');
    });
  });
});
