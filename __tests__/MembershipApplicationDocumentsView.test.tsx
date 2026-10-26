import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { MembershipDocumentsTab } from '../src/features/admin/membershipApplications/components/MembershipDocumentsTab';
import {
  mapBackendToApplicationItem,
  membershipApplicationsStore,
} from '../src/features/admin/membershipApplications/services/membershipApplicationsStore';
import type { MembershipApplicationItem } from '../src/features/admin/membershipApplications/types/membershipApplications.types';

describe('Membership Documents Tab & Store Integration', () => {
  const sampleApp: MembershipApplicationItem = {
    id: 'b8ef831e-31f0-4c20-83e2-04692959d2cb',
    applicationId: 'HRSJM-00003',
    applicantName: 'Mubasshir Farooqui',
    membershipType: 'District Active Member',
    status: 'under_review',
    submittedAt: '15 Oct 2026, 08:25 PM',
    submittedDate: '2026-10-15T14:55:09Z',
    phone: '+91 8850248290',
    email: 'user@hrsjm.org',
    gender: 'Male',
    dob: '03/01/2008',
    fatherName: 'Not specified',
    address: '123 Human Rights Road, New Delhi, Delhi, 110001',
    occupation: 'Member',
    documents: [
      {
        id: 'doc-id-1',
        title: 'Aadhaar Card (Identity Proof)',
        fileName: 'aadhaar_card_mubasshir.pdf',
        fileSize: '1.8 MB',
        uploadDate: '15/10/2026',
      },
      {
        id: 'doc-id-2',
        title: 'Address Proof (Residence Verification)',
        fileName: 'electricity_bill_delhi.pdf',
        fileSize: '1.5 MB',
        uploadDate: '15/10/2026',
      },
      {
        id: 'doc-id-3',
        title: 'Passport Size Photograph',
        fileName: 'passport_photo_mubasshir.jpg',
        fileSize: '850 KB',
        uploadDate: '15/10/2026',
      },
    ],
  };

  it('renders all submitted documents for applicant in admin documents tab', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <MembershipDocumentsTab application={sampleApp} />
      );
    });

    const root = tree.root;
    const allText = root
      .findAllByType('Text' as never)
      .map(t => String(t.props.children || ''))
      .join(' ');

    expect(allText).toContain('Submitted Documents');
    expect(allText).toContain('Aadhaar Card (Identity Proof)');
    expect(allText).toContain('Address Proof (Residence Verification)');
    expect(allText).toContain('Passport Size Photograph');
    expect(allText).toContain('aadhaar_card_mubasshir.pdf');
    expect(allText).toContain('electricity_bill_delhi.pdf');
    expect(allText).toContain('passport_photo_mubasshir.jpg');
  });

  it('renders clean empty state when application documents array is empty (no fake mock docs)', () => {
    const emptyDocsApp: MembershipApplicationItem = {
      ...sampleApp,
      documents: [],
    };

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <MembershipDocumentsTab application={emptyDocsApp} />
      );
    });

    const root = tree.root;
    const allText = root
      .findAllByType('Text' as never)
      .map(t => String(t.props.children || ''))
      .join(' ');

    expect(allText).toContain('Submitted Documents');
    expect(allText).toContain('No documents attached to this application');
    expect(allText).not.toContain('Aadhaar Card (Identity Proof)');
  });

  it('triggers document viewer modal when View button is clicked', () => {
    const onViewDoc = jest.fn();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <MembershipDocumentsTab application={sampleApp} onViewDocument={onViewDoc} />
      );
    });

    const root = tree.root;
    const viewButtons = root.findAllByProps({ accessibilityLabel: 'View Aadhaar Card (Identity Proof)' });
    expect(viewButtons.length).toBeGreaterThan(0);

    act(() => {
      viewButtons[0].props.onPress();
    });

    expect(onViewDoc).toHaveBeenCalledTimes(1);
    expect(onViewDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Aadhaar Card (Identity Proof)',
        fileName: 'aadhaar_card_mubasshir.pdf',
      })
    );
  });

  it('mapBackendToApplicationItem extracts documents from backend application_data', () => {
    const backendData = {
      id: 'b8ef831e-31f0-4c20-83e2-04692959d2cb',
      membership_number: 'HRSJM-00003',
      status: 'UNDER_REVIEW',
      created_at: '2026-10-15T14:55:09Z',
      application_data: {
        full_name: 'Mubasshir Farooqui',
        mobile_number: '8850248290',
        email: 'user@hrsjm.org',
        membership_type: 'District Active Member',
        documents: [
          {
            id: 'doc-1',
            title: 'Aadhaar Card',
            fileName: 'aadhaar.pdf',
            fileSize: '1.2 MB',
          },
        ],
      },
    };

    const mapped = mapBackendToApplicationItem(backendData);
    expect(mapped.documents).toBeDefined();
    expect(mapped.documents!.length).toBe(1);
    expect(mapped.documents![0].fileName).toBe('aadhaar.pdf');
  });
});
