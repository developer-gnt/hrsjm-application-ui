import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { MembershipProvider, useMembership } from '../src/features/membership/context/MembershipContext';
import { MembershipApplicationsScreen } from '../src/features/admin/membershipApplications/screens/MembershipApplicationsScreen';
import { MembershipApplicationDetailsScreen } from '../src/features/admin/membershipApplications/screens/MembershipApplicationDetailsScreen';
import { membershipApplicationsStore } from '../src/features/admin/membershipApplications/services/membershipApplicationsStore';
import { DISTRICT_STATE_POSTS } from '../src/features/membership/data/membershipCategoriesData';

// Component helper to simulate user applying
const TestUserMembershipFlow: React.FC<{ onSubmitted?: (appId: string) => void }> = ({ onSubmitted }) => {
  const {
    setSelectedPost,
    updatePersonalInfo,
    updateAddressInfo,
    updateDocuments,
    submitApplication,
  } = useMembership();

  return (
    <button
      data-testid="submit-btn"
      onClick={() => {
        // Submit Application with Step 1, Step 2, and Step 3 details
        const record = submitApplication({
          post: DISTRICT_STATE_POSTS[0], // 'District Active Member'
          personalInfo: {
            fullName: 'qwertyuiop',
            dateOfBirth: '15/01/1998',
            gender: 'Male',
            countryCode: '+91',
            mobileNumber: '1234567890',
            email: 'qwertyuio@gmail.com',
          },
          addressInfo: {
            addressLine1: 'qwertyuiplkjhgfd',
            addressLine2: 'qwertyuiop',
            city: 'Guwahati',
            state: 'Assam',
            pincode: '123456',
            country: 'India',
          },
          documents: {
            identityProof: {
              type: 'identity',
              name: 'download (1).png',
              fileName: 'download (1).png',
              fileSize: '2.3 MB',
              fileUri: 'file:///path/download(1).png',
              isUploaded: true,
            },
            addressProof: {
              type: 'address',
              name: 'download (1).png',
              fileName: 'download (1).png',
              fileSize: '2.3 MB',
              fileUri: 'file:///path/download(1).png',
              isUploaded: true,
            },
            photograph: {
              type: 'photo',
              name: 'download (1).png',
              fileName: 'download (1).png',
              fileSize: '2.3 MB',
              fileUri: 'file:///path/download(1).png',
              isUploaded: true,
            },
          },
        });
        onSubmitted?.(record.applicationId);
      }}
    />
  );
};

describe('User Membership to Admin Membership Applications Screen Integration', () => {
  it('dynamically adds newly submitted membership application to the 1st position in Admin Screen', async () => {
    let submittedAppId = '';

    // Render User Flow inside MembershipProvider
    let testRenderer: any;
    await ReactTestRenderer.act(async () => {
      testRenderer = ReactTestRenderer.create(
        <MembershipProvider>
          <TestUserMembershipFlow onSubmitted={(id) => { submittedAppId = id; }} />
        </MembershipProvider>
      );
    });

    const submitBtn = testRenderer.root.findByProps({ 'data-testid': 'submit-btn' });
    const statsBefore = membershipApplicationsStore.getStats();

    // User submits the application
    await ReactTestRenderer.act(async () => {
      submitBtn.props.onClick();
    });

    expect(submittedAppId).toBeTruthy();

    // Verify stats updated
    const statsAfter = membershipApplicationsStore.getStats();
    expect(statsAfter.underReview).toBe(statsBefore.underReview + 1);
    expect(statsAfter.total).toBe(statsBefore.total + 1);

    // Verify application in store is in 1st position
    const applications = membershipApplicationsStore.getApplications();
    const firstApp = applications[0];
    expect(firstApp.applicantName).toBe('qwertyuiop');
    expect(firstApp.membershipType).toBe('District Active Member');
    expect(['submitted', 'under_review']).toContain(firstApp.status);
    expect(firstApp.phone).toContain('1234567890');
    expect(firstApp.email).toBe('qwertyuio@gmail.com');
    expect(firstApp.dob).toBe('15/01/1998');
    expect(firstApp.gender).toBe('Male');
    expect(firstApp.address).toContain('Guwahati, Assam');
    expect(firstApp.documents?.length).toBe(3);

    // Now render Admin MembershipApplicationsScreen
    let adminRenderer: any;
    await ReactTestRenderer.act(async () => {
      adminRenderer = ReactTestRenderer.create(
        <MembershipApplicationsScreen />
      );
    });

    // Check that applicant 'qwertyuiop' is rendered in the admin screen
    const nameInstance = adminRenderer.root.findAllByProps({ children: 'qwertyuiop' });
    expect(nameInstance.length).toBeGreaterThan(0);

    // Check that 'District Active Member' is rendered
    const typeInstance = adminRenderer.root.findAllByProps({ children: 'District Active Member' });
    expect(typeInstance.length).toBeGreaterThan(0);

    // Check that the application card has 'Under Review' status
    const statusInstance = adminRenderer.root.findAllByProps({ children: 'Under Review' });
    expect(statusInstance.length).toBeGreaterThan(0);

    // Now render Admin MembershipApplicationDetailsScreen with this applicant
    let detailsRenderer: any;
    await ReactTestRenderer.act(async () => {
      detailsRenderer = ReactTestRenderer.create(
        <MembershipApplicationDetailsScreen
          applicationId={firstApp.applicationId}
          onBack={() => {}}
        />
      );
    });

    // Verify Details screen displays applicant details
    expect(detailsRenderer.root.findAllByProps({ children: 'qwertyuiop' }).length).toBeGreaterThan(0);
    expect(detailsRenderer.root.findAllByProps({ children: '15/01/1998' }).length).toBeGreaterThan(0);
    expect(detailsRenderer.root.findAllByProps({ children: 'Male' }).length).toBeGreaterThan(0);
    expect(detailsRenderer.root.findAllByProps({ children: 'qwertyuio@gmail.com' }).length).toBeGreaterThan(0);
    expect(detailsRenderer.root.findAllByProps({ children: 'District Active Member' }).length).toBeGreaterThan(0);

    // Verify documents tab in details has all 3 documents
    const docTitles = ['Identity Proof', 'Address Proof', 'Photograph'];
    for (const title of docTitles) {
      expect(firstApp.documents?.some(d => d.title === title)).toBe(true);
    }
  });
});
