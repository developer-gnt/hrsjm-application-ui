import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type {
  AddressInfo,
  DocumentUploads,
  MembershipApplicationRecord,
  MembershipStatus,
  MembershipType,
  PersonalInfo,
} from '../types/membership.types';
import { INITIAL_APPLICATION_RECORD } from '../data/membership.mock';
import type { MembershipPostData } from '../data/membershipCategoriesData';

import { membershipApplicationsStore } from '../../admin/membershipApplications/services/membershipApplicationsStore';
import type { MembershipApplicationItem } from '../../admin/membershipApplications/types/membershipApplications.types';
import { apiClient } from '../../../core/api/client';
import { ApiRoutes } from '../../../core/constants/api-routes';

interface MembershipContextType {
  // Form draft state
  personalInfo: PersonalInfo;
  addressInfo: AddressInfo;
  documents: DocumentUploads;
  selectedMembershipType: MembershipType;
  selectedPost: MembershipPostData | null;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateAddressInfo: (info: Partial<AddressInfo>) => void;
  updateDocuments: (docs: Partial<DocumentUploads>) => void;
  setSelectedMembershipType: (type: MembershipType) => void;
  setSelectedPost: (post: MembershipPostData | null) => void;
  resetDraft: () => void;

  // Submitted applications
  applications: MembershipApplicationRecord[];
  activeApplication: MembershipApplicationRecord | null;
  setActiveApplication: (app: MembershipApplicationRecord | null) => void;
  submitApplication: (overrides?: {
    personalInfo?: Partial<PersonalInfo>;
    addressInfo?: Partial<AddressInfo>;
    documents?: Partial<DocumentUploads>;
    post?: MembershipPostData | null;
  }) => MembershipApplicationRecord;
  updateApplicationStatus: (appId: string, status: MembershipStatus) => void;
  reapply: () => void;
}

const INITIAL_PERSONAL_INFO: PersonalInfo = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  countryCode: '+91',
  mobileNumber: '',
  email: '',
};

const INITIAL_ADDRESS_INFO: AddressInfo = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

const INITIAL_DOCUMENTS: DocumentUploads = {};

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(INITIAL_PERSONAL_INFO);
  const [addressInfo, setAddressInfo] = useState<AddressInfo>(INITIAL_ADDRESS_INFO);
  const [documents, setDocuments] = useState<DocumentUploads>(INITIAL_DOCUMENTS);
  const [selectedMembershipType, setSelectedMembershipType] = useState<MembershipType>('Individual Membership');
  const [selectedPost, setSelectedPostState] = useState<MembershipPostData | null>(null);

  const setSelectedPost = (post: MembershipPostData | null) => {
    setSelectedPostState(post);
    if (post) {
      setSelectedMembershipType(post.postName);
    }
  };

  const [applications, setApplications] = useState<MembershipApplicationRecord[]>([
    INITIAL_APPLICATION_RECORD,
  ]);
  const [activeApplication, setActiveApplication] = useState<MembershipApplicationRecord | null>(
    INITIAL_APPLICATION_RECORD
  );

  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    setPersonalInfo(prev => ({ ...prev, ...info }));
  };

  const updateAddressInfo = (info: Partial<AddressInfo>) => {
    setAddressInfo(prev => ({ ...prev, ...info }));
  };

  const updateDocuments = (docs: Partial<DocumentUploads>) => {
    setDocuments(prev => ({ ...prev, ...docs }));
  };

  const resetDraft = () => {
    setPersonalInfo(INITIAL_PERSONAL_INFO);
    setAddressInfo(INITIAL_ADDRESS_INFO);
    setDocuments(INITIAL_DOCUMENTS);
    setSelectedMembershipType('Individual Membership');
    setSelectedPostState(null);
  };

  const submitApplication = (overrides?: {
    personalInfo?: Partial<PersonalInfo>;
    addressInfo?: Partial<AddressInfo>;
    documents?: Partial<DocumentUploads>;
    post?: MembershipPostData | null;
  }): MembershipApplicationRecord => {
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const randomDigits = Math.floor(1000000 + Math.random() * 9000000);

    const effectivePersonalInfo = { ...personalInfo, ...(overrides?.personalInfo || {}) };
    const effectiveAddressInfo = { ...addressInfo, ...(overrides?.addressInfo || {}) };
    const effectiveDocuments = { ...documents, ...(overrides?.documents || {}) };
    const effectivePost = overrides?.post !== undefined ? overrides.post : selectedPost;

    const uploadedDocs: any[] = [];
    if (effectiveDocuments.identityProof?.isUploaded) {
      uploadedDocs.push({
        id: 'doc-identity',
        title: 'Identity Proof',
        fileName: effectiveDocuments.identityProof.fileName || effectiveDocuments.identityProof.name || 'identity_proof.png',
        fileSize: effectiveDocuments.identityProof.fileSize || '2.3 MB',
        uploadDate: formattedDate,
        uri: effectiveDocuments.identityProof.fileUri,
      });
    }
    if (effectiveDocuments.addressProof?.isUploaded) {
      uploadedDocs.push({
        id: 'doc-address',
        title: 'Address Proof',
        fileName: effectiveDocuments.addressProof.fileName || effectiveDocuments.addressProof.name || 'address_proof.png',
        fileSize: effectiveDocuments.addressProof.fileSize || '2.3 MB',
        uploadDate: formattedDate,
        uri: effectiveDocuments.addressProof.fileUri,
      });
    }
    if (effectiveDocuments.photograph?.isUploaded) {
      uploadedDocs.push({
        id: 'doc-photo',
        title: 'Photograph',
        fileName: effectiveDocuments.photograph.fileName || effectiveDocuments.photograph.name || 'photograph.png',
        fileSize: effectiveDocuments.photograph.fileSize || '2.3 MB',
        uploadDate: formattedDate,
        uri: effectiveDocuments.photograph.fileUri,
      });
    }

    const addressParts = [
      effectiveAddressInfo.addressLine1,
      effectiveAddressInfo.addressLine2,
      effectiveAddressInfo.city,
      effectiveAddressInfo.state,
      effectiveAddressInfo.pincode,
      effectiveAddressInfo.country,
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    const categoryTitle =
      effectivePost?.postName || selectedMembershipType || 'District Active Member';

    // Consecutive application ID matching HRSJM-0000X format
    const existingApps = membershipApplicationsStore.getApplications();
    const maxNum = existingApps.reduce((max, a) => {
      const match = (a.applicationId || '').match(/HRSJM-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 2);
    const appIdNumber = `HRSJM-${String(maxNum + 1).padStart(5, '0')}`;

    const adminAppItem: MembershipApplicationItem = {
      id: `app-user-${Date.now()}`,
      applicationId: appIdNumber,
      applicantName: effectivePersonalInfo.fullName.trim() || 'Applicant',
      membershipType: categoryTitle,
      avatarUrl: effectiveDocuments.photograph?.fileUri || effectivePersonalInfo.profilePhotoUri,
      status: 'under_review',
      submittedAt: `${formattedDate}, ${formattedTime}`,
      submittedDate: timestamp.toISOString(),
      phone: effectivePersonalInfo.mobileNumber
        ? `${effectivePersonalInfo.countryCode || '+91'} ${effectivePersonalInfo.mobileNumber}`
        : undefined,
      email: effectivePersonalInfo.email?.trim() || undefined,
      gender: effectivePersonalInfo.gender || 'Not specified',
      dob: effectivePersonalInfo.dateOfBirth || 'Not specified',
      fatherName: 'Not specified',
      address: fullAddress || 'Not specified',
      occupation: 'Member',
      documents: uploadedDocs,
      activityLog: [
        {
          id: `log-review-${Date.now()}`,
          title: 'Under Review',
          description: 'Application submitted and queued for verification review.',
          timestamp: `${formattedDate}, ${formattedTime}`,
          status: 'under_review',
        },
        {
          id: `log-sub-${Date.now()}`,
          title: 'Application Submitted',
          description: 'Membership application submitted online by applicant.',
          timestamp: `${formattedDate}, ${formattedTime}`,
          status: 'submitted',
        },
      ],
    };

    // Add to admin store so it appears dynamically in the 1st position in admin screen
    membershipApplicationsStore.addApplication(adminAppItem);

    // Background sync to backend API if possible
    (async () => {
      try {
        const cleanMobile = effectivePersonalInfo.mobileNumber?.replace(/[^0-9]/g, '');
        const catId = 'd8907f1c-7c4e-4ed4-bee9-c47d51e5b97a'; // District Unit Category
        const res = await apiClient.post<any>(ApiRoutes.MEMBERSHIPS.BASE, {
          category_id: catId,
          full_name: effectivePersonalInfo.fullName.trim() || 'Applicant',
          mobile_number: cleanMobile || undefined,
          email: effectivePersonalInfo.email?.trim() || undefined,
          personal_details: {
            dob: effectivePersonalInfo.dateOfBirth,
            gender: effectivePersonalInfo.gender,
            address: fullAddress,
            address_line1: effectiveAddressInfo.addressLine1,
            address_line2: effectiveAddressInfo.addressLine2,
            city: effectiveAddressInfo.city,
            state: effectiveAddressInfo.state,
            pincode: effectiveAddressInfo.pincode,
            country: effectiveAddressInfo.country,
          },
          application_data: {
            membership_type: categoryTitle,
            documents: uploadedDocs,
          },
        });
        if (res && (res as any).data?.id) {
          adminAppItem.id = (res as any).data.id;
          if ((res as any).data.membership_number) {
            adminAppItem.applicationId = (res as any).data.membership_number;
          }
          membershipApplicationsStore.addApplication(adminAppItem);
        }
      } catch (err) {
        // Fallback stored in memory and localStorage
      }
    })();

    const newRecord: MembershipApplicationRecord = {
      id: `app-${Date.now()}`,
      applicationId: appIdNumber,
      membershipId: `MEM${timestamp.getFullYear()}${randomDigits.toString().slice(0, 6)}`,
      membershipType: categoryTitle,
      status: 'Under Review',
      submittedAt: `${formattedDate}, ${formattedTime}`,
      validFrom: formattedDate,
      validTill: `${formattedDate.slice(0, -4)}${Number(timestamp.getFullYear()) + 1}`,
      rejectionReason: 'Documents are not clear. Please upload a valid address proof and clear photograph.',
      personalInfo: { ...effectivePersonalInfo },
      addressInfo: { ...effectiveAddressInfo },
      documents: { ...effectiveDocuments },
      timeline: [
        {
          id: 'tl-1',
          title: 'Application Submitted',
          description: 'Your application has been received successfully.',
          dateTime: `${formattedDate}, ${formattedTime}`,
          status: 'completed',
        },
        {
          id: 'tl-2',
          title: 'Under Review',
          description: 'Your application is being reviewed by our team.',
          status: 'current',
        },
        {
          id: 'tl-3',
          title: 'Verification Pending',
          description: 'Document verification and background check.',
          status: 'upcoming',
        },
        {
          id: 'tl-4',
          title: 'Decision Pending',
          description: 'Final committee decision and membership card issuance.',
          status: 'upcoming',
        },
      ],
    };

    setApplications(prev => [newRecord, ...prev]);
    setActiveApplication(newRecord);
    return newRecord;
  };

  const updateApplicationStatus = (appId: string, status: MembershipStatus) => {
    setApplications(prev =>
      prev.map(app => (app.applicationId === appId || app.id === appId ? { ...app, status } : app))
    );
    setActiveApplication(prev => {
      if (prev && (prev.applicationId === appId || prev.id === appId)) {
        return { ...prev, status };
      }
      return prev;
    });
  };

  const reapply = () => {
    // Preserve previously entered personal and address information for easier reapplication
    resetDraft();
  };

  return (
    <MembershipContext.Provider
      value={{
        personalInfo,
        addressInfo,
        documents,
        selectedMembershipType,
        selectedPost,
        updatePersonalInfo,
        updateAddressInfo,
        updateDocuments,
        setSelectedMembershipType,
        setSelectedPost,
        resetDraft,
        applications,
        activeApplication,
        setActiveApplication,
        submitApplication,
        updateApplicationStatus,
        reapply,
      }}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error('useMembership must be used within a MembershipProvider');
  }
  return context;
}
