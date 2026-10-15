import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import {
  createApplicationFromRegistration,
  membershipApplicationsStore,
} from '../src/features/admin/membershipApplications';

describe('Phase 5 — Signup to Membership Applications Flow Integration', () => {
  it('creates a new Membership Application with Under Review status upon Member signup', () => {
    const statsBefore = membershipApplicationsStore.getStats();
    const countBefore = statsBefore.total;

    // Simulate member registration data submitted from signup flow
    const memberSignupData = {
      fullName: 'Vikram Malhotra',
      email: 'vikram.malhotra@example.com',
      phone: '+91 98765 00112',
      countryCode: '+91',
      dob: '18 Jun 1993',
      selectedDocTitle: 'Aadhaar Card',
      uploadedFileName: 'Aadhaar_Vikram.pdf',
      uploadedFileSize: '2.1 MB',
      uploadedFileUri: 'file:///mock/Aadhaar_Vikram.pdf',
    };

    const newApp = createApplicationFromRegistration(memberSignupData);

    expect(newApp.applicantName).toBe('Vikram Malhotra');
    expect(newApp.membershipType).toBe('Individual Membership');
    expect(newApp.status).toBe('under_review');
    expect(newApp.documents?.length).toBe(1);
    expect(newApp.documents?.[0].fileName).toBe('Aadhaar_Vikram.pdf');
    expect(newApp.activityLog?.length).toBeGreaterThanOrEqual(1);

    // Add to store
    membershipApplicationsStore.addApplication(newApp);

    // Verify store statistics updated
    const statsAfter = membershipApplicationsStore.getStats();
    expect(statsAfter.total).toBe(countBefore + 1);
    expect(statsAfter.underReview).toBe(statsBefore.underReview + 1);

    // Verify application is retrievable by ID and in list
    const foundApp = membershipApplicationsStore.getApplicationById(newApp.applicationId);
    expect(foundApp).toBeDefined();
    expect(foundApp?.applicantName).toBe('Vikram Malhotra');

    // Admin approves the new application via drop-up action
    membershipApplicationsStore.updateStatus(newApp.id, 'approved');

    const approvedApp = membershipApplicationsStore.getApplicationById(newApp.id);
    expect(approvedApp?.status).toBe('approved');
    expect(membershipApplicationsStore.getStats().approved).toBe(statsBefore.approved + 1);
  });
});
