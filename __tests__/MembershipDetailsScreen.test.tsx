import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MembershipDetailsScreen } from '../src/features/membership/screens/MembershipDetailsScreen';
import { MembershipDetailsHero } from '../src/features/membership/components/MembershipDetailsHero';
import { MemberSummaryCard } from '../src/features/membership/components/MemberSummaryCard';
import { MembershipEmptyState } from '../src/features/membership/components/MembershipEmptyState';
import { MembershipQuickActions } from '../src/features/membership/components/MembershipQuickActions';
import { MembershipInformationCard } from '../src/features/membership/components/MembershipInformationCard';
import { MembershipBenefitsSection } from '../src/features/membership/components/MembershipBenefitsSection';
import { MembershipValidityCard } from '../src/features/membership/components/MembershipValidityCard';
import { MembershipDocumentsSection } from '../src/features/membership/components/MembershipDocumentsSection';
import { MembershipRenewCtaButton } from '../src/features/membership/components/MembershipRenewCtaButton';
import {
  updateRegistrationState,
  resetRegistrationState,
} from '../src/features/auth/state/registrationState';
import {
  membershipApplicationsStore,
  createApplicationFromRegistration,
} from '../src/features/admin/membershipApplications';
import {
  navigateToMembershipDetails,
  getRouteSnapshot,
} from '../src/core/navigation/appRouter';

describe('Phase 1, 2, 3 & 4 — Complete Membership Details & Benefits Experience', () => {
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
          <MembershipDetailsScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  beforeEach(() => {
    act(() => {
      resetRegistrationState();
    });
  });

  describe('1. Screen Skeleton & Branding Verification (Phase 1)', () => {
    it('renders the screen shell, HRSJM header, and Hero banner correctly', async () => {
      const renderer = await renderScreen();
      const root = renderer.root;

      // Header branding
      expect(root.findByProps({ children: 'HRSJM' })).toBeDefined();
      expect(
        root.findByProps({ children: 'HUMAN RIGHTS & SOCIAL JUSTICE MISSION' })
      ).toBeDefined();
      expect(
        root.findByProps({ children: 'मानव अधिकार • सामाजिक न्याय' })
      ).toBeDefined();

      // Hero banner titles
      const hero = root.findByType(MembershipDetailsHero);
      expect(hero).toBeDefined();
      expect(
        root.findByProps({
          children:
            'Your membership connects you with a stronger community, greater opportunities and a more just society.',
        })
      ).toBeDefined();

      // Bottom navigation tabs (6 member tabs)
      expect(root.findByProps({ children: 'Home' })).toBeDefined();
      expect(root.findByProps({ children: 'Know Your Rights' })).toBeDefined();
      expect(root.findByProps({ children: 'Complaints' })).toBeDefined();
      expect(root.findByProps({ children: 'Events' })).toBeDefined();
      expect(root.findByProps({ children: 'News' })).toBeDefined();
      expect(root.findByProps({ children: 'Profile' })).toBeDefined();
    });
  });

  describe('2. Empty State Handling (Incomplete / No Signup)', () => {
    it('shows a friendly empty state when no signup data exists without fabricated values', async () => {
      const renderer = await renderScreen();
      const root = renderer.root;

      // Empty state component should be rendered
      const emptyState = root.findByType(MembershipEmptyState);
      expect(emptyState).toBeDefined();
      expect(
        root.findByProps({ children: 'No Membership Details Found' })
      ).toBeDefined();
      expect(
        root.findByProps({ children: 'Start Member Registration' })
      ).toBeDefined();
    });
  });

  describe('3. Dynamic Data Trace & Membership Information (Phase 1 & 2)', () => {
    it('binds dynamically to real signup state and renders Membership Information Card', async () => {
      // User completes signup
      act(() => {
        updateRegistrationState({
          fullName: 'Priya Sharma',
          email: 'priya.sharma@example.org',
          phone: '+91 98765 43210',
          dob: '15 Aug 1996',
          accountType: 'member',
          accountTypeLabel: 'Individual Member',
        });
      });

      // Member application generated from registration
      const newApp = createApplicationFromRegistration({
        fullName: 'Priya Sharma',
        email: 'priya.sharma@example.org',
        phone: '+91 98765 43210',
        dob: '15 Aug 1996',
        selectedDocTitle: 'Aadhaar Card',
        uploadedFileName: 'priya_aadhaar.pdf',
      });

      act(() => {
        membershipApplicationsStore.addApplication(newApp);
      });

      const renderer = await renderScreen();
      const root = renderer.root;

      // Summary Card was removed per user request
      expect(root.findAllByType(MemberSummaryCard).length).toBe(0);

      // Membership Information Card is displayed with correct member data
      const infoCard = root.findByType(MembershipInformationCard);
      expect(infoCard).toBeDefined();
      expect(infoCard.props.membershipType).toBe('Individual Member');
      expect(infoCard.props.memberId).toBe(newApp.applicationId);
      expect(infoCard.props.status).toBe('Under Review');

      // Admin approves application -> status dynamically updates to Active
      act(() => {
        membershipApplicationsStore.updateStatus(newApp.id, 'approved');
      });

      expect(infoCard.props.status).toBe('Active');
    });

    it('renders with student or custom membership category selected in signup', async () => {
      act(() => {
        updateRegistrationState({
          fullName: 'Arjun Mehta',
          email: 'arjun@example.com',
          phone: '+91 91234 56789',
          accountType: 'member',
          accountTypeLabel: 'Student Member',
        });
      });

      const renderer = await renderScreen();
      const root = renderer.root;
      const infoCard = root.findByType(MembershipInformationCard);
      expect(infoCard.props.membershipType).toBe('Student Member');
    });
  });

  describe('4. Quick Actions Verification (Phase 2)', () => {
    beforeEach(() => {
      act(() => {
        updateRegistrationState({
          fullName: 'Amaan Shaikh',
          email: 'amaan@example.com',
          accountType: 'member',
          accountTypeLabel: 'Individual Member',
        });
      });
    });

    it('renders the 4 quick action cards: Member Card, Benefits, Documents, Renew', async () => {
      const renderer = await renderScreen();
      const root = renderer.root;

      const quickActions = root.findByType(MembershipQuickActions);
      expect(quickActions).toBeDefined();

      expect(root.findByProps({ children: 'Member Card' })).toBeDefined();
      expect(root.findByProps({ children: 'View Digital Card' })).toBeDefined();

      expect(root.findByProps({ children: 'Benefits' })).toBeDefined();
      expect(root.findByProps({ children: 'What You Get' })).toBeDefined();

      expect(root.findByProps({ children: 'Documents' })).toBeDefined();
      expect(root.findByProps({ children: 'View & Download' })).toBeDefined();

      expect(root.findByProps({ children: 'Renew' })).toBeDefined();
      expect(root.findByProps({ children: 'Manage Membership' })).toBeDefined();
    });

    it('triggers action callbacks when quick action cards are pressed', async () => {
      const onMemberCardMock = jest.fn();
      const onBenefitsMock = jest.fn();
      const onDocumentsMock = jest.fn();
      const onRenewMock = jest.fn();

      const renderer = await renderScreen({
        onMemberCardPress: onMemberCardMock,
        onBenefitsPress: onBenefitsMock,
        onDocumentsPress: onDocumentsMock,
        onRenewPress: onRenewMock,
      });

      const root = renderer.root;

      // Press Member Card
      const memberCardBtn = root.findByProps({ accessibilityLabel: 'Member Card, View Digital Card' });
      act(() => {
        memberCardBtn.props.onPress();
      });
      expect(onMemberCardMock).toHaveBeenCalled();

      // Press Benefits
      const benefitsBtn = root.findByProps({ accessibilityLabel: 'Benefits, What You Get' });
      act(() => {
        benefitsBtn.props.onPress();
      });
      expect(onBenefitsMock).toHaveBeenCalled();

      // Press Documents
      const documentsBtn = root.findByProps({ accessibilityLabel: 'Documents, View & Download' });
      act(() => {
        documentsBtn.props.onPress();
      });
      expect(onDocumentsMock).toHaveBeenCalled();

      // Press Renew
      const renewBtn = root.findByProps({ accessibilityLabel: 'Renew, Manage Membership' });
      act(() => {
        renewBtn.props.onPress();
      });
      expect(onRenewMock).toHaveBeenCalled();
    });
  });

  describe('5. Membership Information Rows Verification (Phase 2)', () => {
    it('renders all required membership information rows matching actual signup values', async () => {
      act(() => {
        updateRegistrationState({
          fullName: 'Sara Khan',
          email: 'sara.khan@example.com',
          phone: '+91 99887 76655',
          dob: '22 Nov 1998',
          accountType: 'member',
          accountTypeLabel: 'Individual Member',
        });
      });

      const newApp = createApplicationFromRegistration({
        fullName: 'Sara Khan',
        email: 'sara.khan@example.com',
        phone: '+91 99887 76655',
        dob: '22 Nov 1998',
        selectedDocTitle: 'Passport',
        uploadedFileName: 'sara_passport.pdf',
      });

      act(() => {
        membershipApplicationsStore.addApplication(newApp);
      });

      const renderer = await renderScreen();
      const root = renderer.root;

      const infoCard = root.findByType(MembershipInformationCard);
      expect(infoCard).toBeDefined();

      // Section Title
      expect(root.findByProps({ children: 'Membership Information' })).toBeDefined();

      // Row labels
      expect(infoCard.findByProps({ children: 'Full Name' })).toBeDefined();
      expect(infoCard.findByProps({ children: 'Membership Type' })).toBeDefined();
      expect(infoCard.findByProps({ children: 'Member ID' })).toBeDefined();
      expect(infoCard.findByProps({ children: 'Date of Birth' })).toBeDefined();
      expect(infoCard.findByProps({ children: 'Join Date' })).toBeDefined();
      expect(infoCard.findByProps({ children: 'Valid Till' })).toBeDefined();
      expect(infoCard.findByProps({ children: 'Status' })).toBeDefined();

      // Row values
      expect(root.findByProps({ children: 'Sara Khan' })).toBeDefined();
      expect(infoCard.findByProps({ children: newApp.applicationId })).toBeDefined();
      expect(root.findByProps({ children: '22 Nov 1998' })).toBeDefined();
    });

    it('handles missing DOB cleanly by displaying "Not provided" without fabricating data', async () => {
      act(() => {
        updateRegistrationState({
          fullName: 'Kabir Varma',
          email: 'kabir@example.com',
          phone: '+91 98760 12345',
          dob: '', // not provided
          accountType: 'member',
          accountTypeLabel: 'Professional Member',
        });
      });

      const renderer = await renderScreen();
      const root = renderer.root;

      expect(root.findByProps({ children: 'Kabir Varma' })).toBeDefined();
      expect(root.findByProps({ children: 'Not provided' })).toBeDefined();
    });
  });

  describe('6. Membership Benefits Verification (Phase 3)', () => {
    beforeEach(() => {
      act(() => {
        updateRegistrationState({
          fullName: 'Amaan Shaikh',
          email: 'amaan@example.com',
          accountType: 'member',
          accountTypeLabel: 'Individual Member',
        });
      });
    });

    it('renders the 6 membership benefit cards in the grid', async () => {
      const renderer = await renderScreen();
      const root = renderer.root;

      const benefitsSection = root.findByType(MembershipBenefitsSection);
      expect(benefitsSection).toBeDefined();

      expect(root.findByProps({ children: 'Membership Benefits' })).toBeDefined();
      expect(root.findByProps({ children: 'Access to Events' })).toBeDefined();
      expect(root.findByProps({ children: 'Learning Resources' })).toBeDefined();
      expect(root.findByProps({ children: 'Community Network' })).toBeDefined();
      expect(root.findByProps({ children: 'Volunteer Opportunities' })).toBeDefined();
      expect(root.findByProps({ children: 'Special Updates' })).toBeDefined();
      expect(root.findByProps({ children: 'Member Discounts' })).toBeDefined();
    });

    it('triggers onBenefitItemPress callback when a benefit card is pressed', async () => {
      const onBenefitItemPressMock = jest.fn();
      const renderer = await renderScreen({ onBenefitItemPress: onBenefitItemPressMock });
      const root = renderer.root;

      const eventCard = root.findByProps({ accessibilityLabel: 'Access to Events: Exclusive invites to workshops, seminars and campaigns.' });
      act(() => {
        eventCard.props.onPress();
      });

      expect(onBenefitItemPressMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'events',
          title: 'Access to Events',
        })
      );
    });
  });

  describe('7. Membership Validity Card Verification (Phase 3)', () => {
    it('renders the validity card with Valid Till, Total Duration, and Days Remaining', async () => {
      act(() => {
        updateRegistrationState({
          fullName: 'Amaan Shaikh',
          email: 'amaan@example.com',
          accountType: 'member',
          accountTypeLabel: 'Individual Member',
        });
      });

      const renderer = await renderScreen();
      const root = renderer.root;

      const validityCard = root.findByType(MembershipValidityCard);
      expect(validityCard).toBeDefined();

      expect(root.findByProps({ children: 'Membership Validity' })).toBeDefined();
      expect(validityCard.findByProps({ children: 'Valid Till' })).toBeDefined();
      expect(validityCard.findByProps({ children: 'Total Duration' })).toBeDefined();
      expect(validityCard.findByProps({ children: '1 Year' })).toBeDefined();
      expect(validityCard.findByProps({ children: 'Days Remaining' })).toBeDefined();
      expect(validityCard.findByProps({ children: '352 Days' })).toBeDefined();
    });
  });

  describe('8. Membership Documents Verification (Phase 4)', () => {
    it('renders the 3 membership document rows with download actions', async () => {
      act(() => {
        updateRegistrationState({
          fullName: 'Amaan Shaikh',
          email: 'amaan@example.com',
          accountType: 'member',
          accountTypeLabel: 'Individual Member',
        });
      });

      const renderer = await renderScreen();
      const root = renderer.root;

      const docsSection = root.findByType(MembershipDocumentsSection);
      expect(docsSection).toBeDefined();

      expect(root.findByProps({ children: 'Membership Documents' })).toBeDefined();
      expect(root.findByProps({ children: 'Membership Certificate' })).toBeDefined();
      expect(root.findByProps({ children: 'Membership Card (PDF)' })).toBeDefined();
      expect(root.findByProps({ children: 'Membership Guidelines' })).toBeDefined();
    });

    it('triggers onDocumentItemPress callback when a document item is pressed', async () => {
      const onDocPressMock = jest.fn();
      const renderer = await renderScreen({ onDocumentItemPress: onDocPressMock });
      const root = renderer.root;

      const certRow = root.findByProps({
        accessibilityLabel: 'Membership Certificate, Download your official certificate',
      });
      act(() => {
        certRow.props.onPress();
      });

      expect(onDocPressMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'certificate',
          type: 'certificate',
        })
      );
    });
  });

  describe('9. Renew Membership CTA Button Verification (Phase 4)', () => {
    it('renders the Renew Membership CTA button and triggers onRenewPress', async () => {
      const onRenewMock = jest.fn();
      const renderer = await renderScreen({ onRenewPress: onRenewMock });
      const root = renderer.root;

      const renewBtn = root.findByType(MembershipRenewCtaButton);
      expect(renewBtn).toBeDefined();

      const touchable = renewBtn.findByProps({ accessibilityLabel: 'Renew Membership' });
      act(() => {
        touchable.props.onPress();
      });

      expect(onRenewMock).toHaveBeenCalled();
    });
  });

  describe('10. Routing and Navigation Gate', () => {
    it('navigates to membership-details route via router helper', () => {
      act(() => {
        navigateToMembershipDetails();
      });

      const current = getRouteSnapshot();
      expect(current.name).toBe('membership-details');
    });

    it('handles back button press via onBack callback', async () => {
      const onBackMock = jest.fn();
      const renderer = await renderScreen({ onBack: onBackMock });

      const root = renderer.root;
      const backButton = root.findByProps({ accessibilityLabel: 'Go back' });
      act(() => {
        backButton.props.onPress();
      });

      expect(onBackMock).toHaveBeenCalled();
    });
  });
});
