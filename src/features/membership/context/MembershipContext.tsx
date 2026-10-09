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

interface MembershipContextType {
  // Form draft state
  personalInfo: PersonalInfo;
  addressInfo: AddressInfo;
  documents: DocumentUploads;
  selectedMembershipType: MembershipType;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateAddressInfo: (info: Partial<AddressInfo>) => void;
  updateDocuments: (docs: Partial<DocumentUploads>) => void;
  setSelectedMembershipType: (type: MembershipType) => void;
  resetDraft: () => void;

  // Submitted applications
  applications: MembershipApplicationRecord[];
  activeApplication: MembershipApplicationRecord | null;
  setActiveApplication: (app: MembershipApplicationRecord | null) => void;
  submitApplication: () => MembershipApplicationRecord;
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
  };

  const submitApplication = (): MembershipApplicationRecord => {
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
    const newAppId = `APP${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}${randomDigits.toString().slice(0, 3)}`;

    const newRecord: MembershipApplicationRecord = {
      id: `app-${Date.now()}`,
      applicationId: newAppId,
      membershipId: `MEM${timestamp.getFullYear()}${randomDigits.toString().slice(0, 6)}`,
      membershipType: selectedMembershipType,
      status: 'Under Review',
      submittedAt: `${formattedDate}, ${formattedTime}`,
      validFrom: formattedDate,
      validTill: `${formattedDate.slice(0, -4)}${Number(timestamp.getFullYear()) + 1}`,
      rejectionReason: 'Documents are not clear. Please upload a valid address proof and clear photograph.',
      personalInfo: { ...personalInfo },
      addressInfo: { ...addressInfo },
      documents: { ...documents },
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
        updatePersonalInfo,
        updateAddressInfo,
        updateDocuments,
        setSelectedMembershipType,
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
