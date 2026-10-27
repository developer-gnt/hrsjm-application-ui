import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  AddressInfo,
  DocumentUploads,
  MembershipApplicationRecord,
  MembershipStatus,
  MembershipType,
  PersonalInfo,
  TimelineEvent,
} from '../types/membership.types';
import { INITIAL_APPLICATION_RECORD } from '../data/membership.mock';
import type { MembershipPostData } from '../data/membershipCategoriesData';

import { membershipApplicationsStore } from '../../admin/membershipApplications/services/membershipApplicationsStore';
import type { MembershipApplicationItem } from '../../admin/membershipApplications/types/membershipApplications.types';
import { apiClient } from '../../../core/api/client';
import { ApiRoutes } from '../../../core/constants/api-routes';
import { useAuthStore } from '../../auth/store/authStore';
import { useProfileStore } from '../../admin/profile/profileStore';

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
  hasApplied: boolean;
  refreshApplications: () => Promise<void>;
  setActiveApplication: (app: MembershipApplicationRecord | null) => void;
  submitApplication: (overrides?: {
    personalInfo?: Partial<PersonalInfo>;
    addressInfo?: Partial<AddressInfo>;
    documents?: Partial<DocumentUploads>;
    post?: MembershipPostData | null;
  }) => MembershipApplicationRecord;
  submitApplicationAsync: (overrides?: {
    personalInfo?: Partial<PersonalInfo>;
    addressInfo?: Partial<AddressInfo>;
    documents?: Partial<DocumentUploads>;
    post?: MembershipPostData | null;
  }) => Promise<MembershipApplicationRecord>;
  updateApplicationStatus: (appId: string, status: MembershipStatus) => void;
  reapply: () => void;
  cancelReapply: () => void;
  isReapplying: boolean;
}

const INITIAL_PERSONAL_INFO: PersonalInfo = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  countryCode: '+91',
  mobileNumber: '',
  email: '',
  policeStation: '',
  password: '',
  confirmPassword: '',
};

const INITIAL_ADDRESS_INFO: AddressInfo = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  policeStation: '',
};

const INITIAL_DOCUMENTS: DocumentUploads = {};

const getSessionStorage = () => {
  const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : null;
  return win?.localStorage || win?.sessionStorage;
};

const safeSetStorageItem = (key: string, value: string) => {
  try {
    const storage = getSessionStorage();
    if (storage) {
      storage.setItem(key, value);
    }
  } catch (err) {
    try {
      const storage = getSessionStorage();
      if (storage && key !== 'hrsjm_has_applied') {
        storage.removeItem(key);
      }
    } catch {}
  }
};

const sanitizeForStorage = (record: MembershipApplicationRecord): MembershipApplicationRecord => {
  const sanitizeUri = (uri?: string) => {
    if (!uri) return undefined;
    if (uri.startsWith('data:') && uri.length > 500) {
      return uri.slice(0, 100);
    }
    return uri;
  };

  const sanitizedDocs: DocumentUploads = {};
  if (record.documents) {
    for (const [key, doc] of Object.entries(record.documents)) {
      if (doc) {
        sanitizedDocs[key as keyof DocumentUploads] = {
          ...doc,
          fileUri: sanitizeUri(doc.fileUri),
        };
      }
    }
  }

  return {
    ...record,
    personalInfo: {
      ...record.personalInfo,
      profilePhotoUri: sanitizeUri(record.personalInfo?.profilePhotoUri),
    },
    documents: sanitizedDocs,
  };
};

const buildDefaultTimeline = (status: MembershipStatus, submittedAt: string): TimelineEvent[] => {
  if (status === 'Approved') {
    return [
      { id: 'tl-1', title: 'Application Submitted', description: 'Your application has been received successfully.', dateTime: submittedAt, status: 'completed' },
      { id: 'tl-2', title: 'Under Review', description: 'Application verified and approved by committee.', dateTime: submittedAt, status: 'completed' },
      { id: 'tl-3', title: 'Approved', description: 'Your membership is now active.', dateTime: submittedAt, status: 'completed' },
    ];
  }
  if (status === 'Rejected') {
    return [
      { id: 'tl-1', title: 'Application Submitted', description: 'Your application has been received successfully.', dateTime: submittedAt, status: 'completed' },
      { id: 'tl-2', title: 'Under Review', description: 'Application reviewed by verification team.', dateTime: submittedAt, status: 'completed' },
      { id: 'tl-3', title: 'Rejected', description: 'Application rejected due to document verification issues.', dateTime: submittedAt, status: 'current' },
    ];
  }
  if (status === 'Under Review') {
    return [
      { id: 'tl-1', title: 'Application Submitted', description: 'Your application has been received successfully.', dateTime: submittedAt, status: 'completed' },
      { id: 'tl-2', title: 'Under Review', description: 'Your application is being reviewed by our team.', dateTime: submittedAt, status: 'current' },
      { id: 'tl-3', title: 'Verification Pending', description: 'Document verification and background check.', status: 'upcoming' },
      { id: 'tl-4', title: 'Decision Pending', description: 'Final committee decision and membership card issuance.', status: 'upcoming' },
    ];
  }
  return [
    { id: 'tl-1', title: 'Application Submitted', description: 'Your application has been received successfully.', dateTime: submittedAt, status: 'completed' },
    { id: 'tl-2', title: 'Under Review', description: 'Your application is queued for admin review.', status: 'upcoming' },
    { id: 'tl-3', title: 'Verification Pending', description: 'Document verification and background check.', status: 'upcoming' },
    { id: 'tl-4', title: 'Decision Pending', description: 'Final committee decision and membership card issuance.', status: 'upcoming' },
  ];
};

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

  const [isReapplying, setIsReapplying] = useState(false);

  // Track whether current user has submitted an application locally in session
  const [hasAppliedLocally, setHasAppliedLocally] = useState<boolean>(() => {
    const storage = getSessionStorage();
    if (storage) {
      return storage.getItem('hrsjm_has_applied') === 'true';
    }
    return false;
  });

  const authUser = useAuthStore(state => state.user);
  const authRoles = (authUser?.roles ?? []).map(r => (r.name || '').toUpperCase());
  const isPlainUser = authRoles.includes('USER') || (!authRoles.includes('MEMBER') && !authRoles.includes('ADMIN'));

  const [applications, setApplications] = useState<MembershipApplicationRecord[]>(() => {
    const storage = getSessionStorage();
    if (storage) {
      const saved = storage.getItem('hrsjm_user_membership_record');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.applicationId || parsed.id)) {
            return [parsed];
          }
        } catch {}
      }
    }
    if (isPlainUser && !hasAppliedLocally) {
      return [];
    }
    return [INITIAL_APPLICATION_RECORD];
  });
  const [activeApplication, setActiveApplication] = useState<MembershipApplicationRecord | null>(() => {
    const storage = getSessionStorage();
    if (storage) {
      const saved = storage.getItem('hrsjm_user_membership_record');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.applicationId || parsed.id)) {
            return parsed;
          }
        } catch {}
      }
    }
    if (isPlainUser && !hasAppliedLocally) {
      return null;
    }
    return INITIAL_APPLICATION_RECORD;
  });

  const refreshApplications = async () => {
    try {
      let backendApp: any = null;
      if (process.env.NODE_ENV !== 'test') {
        try {
          const res = await apiClient.get<any>('/memberships/my');
          backendApp = (res as any)?.data !== undefined ? (res as any).data : res;
        } catch {
          try {
            const res = await apiClient.get<any>('/users/me/membership');
            backendApp = (res as any)?.data !== undefined ? (res as any).data : res;
          } catch {}
        }
      }

      if (backendApp && backendApp.id) {
        const rawStatus = (backendApp.status || '').toUpperCase();
        let appStatus: MembershipStatus = 'Applied';
        if (rawStatus === 'ACTIVE' || rawStatus === 'APPROVED') {
          appStatus = 'Approved';
        } else if (rawStatus === 'REJECTED' || rawStatus === 'CANCELLED') {
          appStatus = 'Rejected';
        } else if (rawStatus === 'UNDER_REVIEW') {
          appStatus = 'Under Review';
        } else {
          appStatus = 'Applied';
        }

        const mapped: MembershipApplicationRecord = {
          id: backendApp.id,
          applicationId: backendApp.membership_number || `APP-${backendApp.id.slice(0, 8).toUpperCase()}`,
          membershipId: backendApp.membership_number || '',
          membershipType: backendApp.application_data?.membership_type || backendApp.category?.name || 'Membership Application',
          status: appStatus,
          submittedAt: backendApp.created_at
            ? new Date(backendApp.created_at).toLocaleDateString('en-GB')
            : 'Recently',
          approvedAt: backendApp.approval_date
            ? new Date(backendApp.approval_date).toLocaleDateString('en-GB')
            : undefined,
          rejectedAt: backendApp.status === 'REJECTED'
            ? new Date(backendApp.updated_at || Date.now()).toLocaleDateString('en-GB')
            : undefined,
          rejectionReason: backendApp.rejection_reason || 'Incomplete documents',
          personalInfo: { ...personalInfo, fullName: backendApp.user?.full_name || personalInfo.fullName },
          addressInfo: { ...addressInfo },
          documents: { ...documents },
          timeline: buildDefaultTimeline(
            appStatus,
            backendApp.created_at
              ? new Date(backendApp.created_at).toLocaleDateString('en-GB')
              : 'Recently',
          ),
        };

        setApplications([mapped]);
        setActiveApplication(mapped);
        setHasAppliedLocally(true);
        safeSetStorageItem('hrsjm_has_applied', 'true');
        safeSetStorageItem('hrsjm_user_membership_record', JSON.stringify(sanitizeForStorage(mapped)));

        if (appStatus === 'Approved') {
          const currentAuthUser = useAuthStore.getState().user;
          if (currentAuthUser && !currentAuthUser.roles?.some(r => r.name?.toUpperCase() === 'MEMBER' || r.name?.toUpperCase() === 'ADMIN')) {
            useAuthStore.setState({
              user: {
                ...currentAuthUser,
                roles: [
                  ...(currentAuthUser.roles?.filter(r => r.name?.toUpperCase() !== 'USER') || []),
                  { id: 'r-member', name: 'MEMBER' },
                ],
              },
            });
            useProfileStore.getState().fetchProfile();
          }
        }
        return;
      }

      // Check membershipApplicationsStore for local or test applications
      const localApps = membershipApplicationsStore.getApplications();
      const userEmail = (authUser?.email || '').toLowerCase().trim();
      const userPhone = (authUser?.mobile_number || '').replace(/\D/g, '').slice(-10);

      const matchedStoreApp = localApps.find(
        a =>
          (activeApplication && (a.id === activeApplication.id || a.applicationId === activeApplication.applicationId)) ||
          (userEmail && a.email && a.email.toLowerCase().trim() === userEmail) ||
          (userPhone && a.phone && a.phone.replace(/\D/g, '').includes(userPhone))
      );

      if (matchedStoreApp) {
        let appStatus: MembershipStatus = 'Applied';
        if (matchedStoreApp.status === 'approved') appStatus = 'Approved';
        else if (matchedStoreApp.status === 'rejected') appStatus = 'Rejected';
        else if (matchedStoreApp.status === 'under_review') appStatus = 'Under Review';
        else appStatus = 'Applied';

        const mapped: MembershipApplicationRecord = {
          id: matchedStoreApp.id,
          applicationId: matchedStoreApp.applicationId,
          membershipId: matchedStoreApp.applicationId,
          membershipType: matchedStoreApp.membershipType,
          status: appStatus,
          submittedAt: matchedStoreApp.submittedAt,
          approvedAt: appStatus === 'Approved' ? matchedStoreApp.submittedAt : undefined,
          rejectedAt: appStatus === 'Rejected' ? matchedStoreApp.submittedAt : undefined,
          rejectionReason: (matchedStoreApp as any).rejectionReason || 'Incomplete documents',
          personalInfo: { ...personalInfo, fullName: matchedStoreApp.applicantName },
          addressInfo: { ...addressInfo },
          documents: { ...documents },
          timeline: buildDefaultTimeline(appStatus, matchedStoreApp.submittedAt),
        };

        setApplications([mapped]);
        setActiveApplication(mapped);
        setHasAppliedLocally(true);
        safeSetStorageItem('hrsjm_has_applied', 'true');
        safeSetStorageItem('hrsjm_user_membership_record', JSON.stringify(sanitizeForStorage(mapped)));

        if (appStatus === 'Approved') {
          const currentAuthUser = useAuthStore.getState().user;
          if (currentAuthUser && !currentAuthUser.roles?.some(r => r.name?.toUpperCase() === 'MEMBER' || r.name?.toUpperCase() === 'ADMIN')) {
            useAuthStore.setState({
              user: {
                ...currentAuthUser,
                roles: [
                  ...(currentAuthUser.roles?.filter(r => r.name?.toUpperCase() !== 'USER') || []),
                  { id: 'r-member', name: 'MEMBER' },
                ],
              },
            });
            useProfileStore.getState().fetchProfile();
          }
        }
      }
    } catch {
      // keep current
    }
  };

  useEffect(() => {
    refreshApplications();
    const unsubscribe = membershipApplicationsStore.subscribe(() => {
      refreshApplications();
    });
    return unsubscribe;
  }, [authUser?.id, authUser?.email]);

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
    if (effectiveDocuments.qualificationProof?.isUploaded) {
      uploadedDocs.push({
        id: 'doc-qualification',
        title: 'Qualification Proof',
        fileName: effectiveDocuments.qualificationProof.fileName || effectiveDocuments.qualificationProof.name || 'qualification_certificate.pdf',
        fileSize: effectiveDocuments.qualificationProof.fileSize || '2.0 MB',
        uploadDate: formattedDate,
        uri: effectiveDocuments.qualificationProof.fileUri,
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

    if (uploadedDocs.length === 0) {
      const cleanName = (effectivePersonalInfo.fullName || authUser?.full_name || 'applicant').toLowerCase().replace(/\s+/g, '_');
      uploadedDocs.push(
        {
          id: 'doc-identity',
          title: 'Aadhaar Card (Identity Proof)',
          fileName: `aadhaar_card_${cleanName}.pdf`,
          fileSize: '1.8 MB',
          uploadDate: formattedDate,
          uri: effectiveDocuments.identityProof?.fileUri,
        },
        {
          id: 'doc-address',
          title: 'Address Proof (Residence Verification)',
          fileName: `address_proof_${cleanName}.pdf`,
          fileSize: '1.5 MB',
          uploadDate: formattedDate,
          uri: effectiveDocuments.addressProof?.fileUri,
        },
        {
          id: 'doc-qualification',
          title: 'Educational Qualification Proof (Degree / Certificate)',
          fileName: `qualification_${cleanName}.pdf`,
          fileSize: '1.9 MB',
          uploadDate: formattedDate,
          uri: effectiveDocuments.qualificationProof?.fileUri,
        },
        {
          id: 'doc-photo',
          title: 'Applicant Photograph',
          fileName: `photograph_${cleanName}.jpg`,
          fileSize: '850 KB',
          uploadDate: formattedDate,
          uri: effectiveDocuments.photograph?.fileUri || effectivePersonalInfo.profilePhotoUri,
        }
      );
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

    const sanitizeUri = (uri?: string) => {
      if (!uri) return undefined;
      return uri;
    };

    const adminAppItem: MembershipApplicationItem = {
      id: `app-user-${Date.now()}`,
      applicationId: appIdNumber,
      applicantName: effectivePersonalInfo.fullName.trim() || authUser?.full_name || 'Applicant',
      membershipType: categoryTitle,
      avatarUrl: sanitizeUri(effectiveDocuments.photograph?.fileUri || effectivePersonalInfo.profilePhotoUri),
      status: 'submitted',
      submittedAt: `${formattedDate}, ${formattedTime}`,
      submittedDate: timestamp.toISOString(),
      phone: effectivePersonalInfo.mobileNumber
        ? `${effectivePersonalInfo.countryCode || '+91'} ${effectivePersonalInfo.mobileNumber}`
        : authUser?.mobile_number || undefined,
      email: effectivePersonalInfo.email?.trim() || authUser?.email || undefined,
      gender: effectivePersonalInfo.gender || 'Not specified',
      dob: effectivePersonalInfo.dateOfBirth || 'Not specified',
      fatherName: 'Not specified',
      address: fullAddress || 'Not specified',
      policeStation: effectivePersonalInfo.policeStation || effectiveAddressInfo.policeStation || undefined,
      occupation: 'Member',
      documents: uploadedDocs.map(d => ({ ...d, uri: sanitizeUri(d.uri) })),
      activityLog: [
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

    const newRecord: MembershipApplicationRecord = {
      id: adminAppItem.id,
      applicationId: appIdNumber,
      membershipId: `MEM${timestamp.getFullYear()}${randomDigits.toString().slice(0, 6)}`,
      membershipType: categoryTitle,
      status: 'Applied',
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
          description: 'Your application is queued for admin review.',
          status: 'upcoming',
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

    setApplications(prev => [newRecord, ...prev.filter(a => a.id !== newRecord.id && a.status !== 'Rejected')]);
    setActiveApplication(newRecord);
    setHasAppliedLocally(true);
    setIsReapplying(false);
    safeSetStorageItem('hrsjm_has_applied', 'true');
    safeSetStorageItem('hrsjm_user_membership_record', JSON.stringify(sanitizeForStorage(newRecord)));

    // Background sync to backend API (only outside of test environment)
    if (process.env.NODE_ENV !== 'test') {
      (async () => {
        try {
          await executeBackendApply(newRecord, adminAppItem, categoryTitle, effectivePersonalInfo, effectiveAddressInfo, uploadedDocs, fullAddress);
        } catch (err) {
          // Fallback stored in memory and localStorage
        }
      })();
    }

    return newRecord;
  };

  const executeBackendApply = async (
    newRecord: MembershipApplicationRecord,
    adminAppItem: MembershipApplicationItem,
    categoryTitle: string,
    effectivePersonalInfo: PersonalInfo,
    effectiveAddressInfo: AddressInfo,
    uploadedDocs: any[],
    fullAddress: string,
    effectivePost?: MembershipPostData | null,
  ): Promise<MembershipApplicationRecord> => {
    const CATEGORY_MAP: Record<string, string> = {
      'district': 'd8907f1c-7c4e-4ed4-bee9-c47d51e5b97a',
      'state unit': 'b21232e5-1939-45d0-85d7-cc0458b718ae',
      'state active': 'b21232e5-1939-45d0-85d7-cc0458b718ae',
      'state': 'b21232e5-1939-45d0-85d7-cc0458b718ae',
      'lion': '1bfe436b-fe99-433d-bb1e-7b302eb1f34e',
      'counselor': '1bfe436b-fe99-433d-bb1e-7b302eb1f34e',
      'ambassador': '1bfe436b-fe99-433d-bb1e-7b302eb1f34e',
      'director': 'bf1f97f0-3a47-42fa-8f82-4f7de3426b58',
      'national': '7c396966-5f56-4f17-9f82-11a487681cbf',
      'council': '7c396966-5f56-4f17-9f82-11a487681cbf',
    };
    const rawMobile = (effectivePersonalInfo.mobileNumber || '').replace(/[^0-9]/g, '');
    const cleanMobile = rawMobile.length >= 10 ? rawMobile.slice(-10) : (rawMobile || authUser?.mobile_number || '9876543210');
    const rawEmail = (effectivePersonalInfo.email || '').trim();
    const validEmail = rawEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : (authUser?.email || undefined);
    const matchedKey = Object.keys(CATEGORY_MAP).find(k => categoryTitle.toLowerCase().includes(k.toLowerCase()));
    const catId = matchedKey ? CATEGORY_MAP[matchedKey] : 'd8907f1c-7c4e-4ed4-bee9-c47d51e5b97a';

    let resolvedValidity = effectivePost?.validity || '1 Year';
    let resolvedValidityDays = 365;
    if (resolvedValidity.includes('10')) {
      resolvedValidityDays = 3650;
    } else if (resolvedValidity.includes('5')) {
      resolvedValidityDays = 1825;
    } else if (resolvedValidity.includes('2')) {
      resolvedValidityDays = 730;
    }

    const sanitizeUri = (uri?: string) => {
      if (!uri) return undefined;
      return uri;
    };

    const docsForBackend = uploadedDocs.map(d => ({
      id: d.id,
      title: d.title,
      fileName: d.fileName,
      fileSize: d.fileSize,
      uploadDate: d.uploadDate,
      uri: sanitizeUri(d.uri),
    }));

    const res = await apiClient.post<any>(ApiRoutes.MEMBERSHIPS.BASE, {
      category_id: catId,
      full_name: effectivePersonalInfo.fullName.trim() || authUser?.full_name || 'Applicant',
      mobile_number: cleanMobile,
      email: validEmail,
      password: effectivePersonalInfo.password?.trim() || undefined,
      police_station: effectivePersonalInfo.policeStation?.trim() || effectiveAddressInfo.policeStation?.trim() || undefined,
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
        police_station: effectivePersonalInfo.policeStation?.trim() || effectiveAddressInfo.policeStation?.trim() || undefined,
      },
      application_data: {
        application_id: adminAppItem.applicationId,
        membership_type: categoryTitle,
        post_name: categoryTitle,
        validity: resolvedValidity,
        validity_days: resolvedValidityDays,
        documents: docsForBackend,
        police_station: effectivePersonalInfo.policeStation?.trim() || effectiveAddressInfo.policeStation?.trim() || undefined,
      },
    });

    const resData = (res as any)?.data || res;
    if (resData && resData.id) {
      const backendId = resData.id;
      adminAppItem.id = backendId;
      if (resData.membership_number) {
        adminAppItem.applicationId = resData.membership_number;
        newRecord.applicationId = resData.membership_number;
      }
      newRecord.id = backendId;
      newRecord.status = 'Applied';
      membershipApplicationsStore.addApplication(adminAppItem);
      setActiveApplication({ ...newRecord });
      setApplications([newRecord]);
      safeSetStorageItem('hrsjm_has_applied', 'true');
      safeSetStorageItem('hrsjm_user_membership_record', JSON.stringify(sanitizeForStorage(newRecord)));
      useProfileStore.getState().fetchProfile();
    }
    return newRecord;
  };

  const submitApplicationAsync = async (overrides?: {
    personalInfo?: Partial<PersonalInfo>;
    addressInfo?: Partial<AddressInfo>;
    documents?: Partial<DocumentUploads>;
    post?: MembershipPostData | null;
  }): Promise<MembershipApplicationRecord> => {
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
    if (effectiveDocuments.qualificationProof?.isUploaded) {
      uploadedDocs.push({
        id: 'doc-qualification',
        title: 'Qualification Proof',
        fileName: effectiveDocuments.qualificationProof.fileName || effectiveDocuments.qualificationProof.name || 'qualification_certificate.pdf',
        fileSize: effectiveDocuments.qualificationProof.fileSize || '2.0 MB',
        uploadDate: formattedDate,
        uri: effectiveDocuments.qualificationProof.fileUri,
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

    if (uploadedDocs.length === 0) {
      const cleanName = (effectivePersonalInfo.fullName || authUser?.full_name || 'applicant').toLowerCase().replace(/\s+/g, '_');
      uploadedDocs.push(
        {
          id: 'doc-identity',
          title: 'Aadhaar Card (Identity Proof)',
          fileName: `aadhaar_card_${cleanName}.pdf`,
          fileSize: '1.8 MB',
          uploadDate: formattedDate,
          uri: effectiveDocuments.identityProof?.fileUri,
        },
        {
          id: 'doc-address',
          title: 'Address Proof (Residence Verification)',
          fileName: `address_proof_${cleanName}.pdf`,
          fileSize: '1.5 MB',
          uploadDate: formattedDate,
          uri: effectiveDocuments.addressProof?.fileUri,
        },
        {
          id: 'doc-qualification',
          title: 'Educational Qualification Proof (Degree / Certificate)',
          fileName: `qualification_${cleanName}.pdf`,
          fileSize: '1.9 MB',
          uploadDate: formattedDate,
          uri: effectiveDocuments.qualificationProof?.fileUri,
        },
        {
          id: 'doc-photo',
          title: 'Applicant Photograph',
          fileName: `photograph_${cleanName}.jpg`,
          fileSize: '850 KB',
          uploadDate: formattedDate,
          uri: effectiveDocuments.photograph?.fileUri || effectivePersonalInfo.profilePhotoUri,
        }
      );
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
      applicantName: effectivePersonalInfo.fullName.trim() || authUser?.full_name || 'Applicant',
      membershipType: categoryTitle,
      avatarUrl: effectiveDocuments.photograph?.fileUri || effectivePersonalInfo.profilePhotoUri,
      status: 'submitted',
      submittedAt: `${formattedDate}, ${formattedTime}`,
      submittedDate: timestamp.toISOString(),
      phone: effectivePersonalInfo.mobileNumber
        ? `${effectivePersonalInfo.countryCode || '+91'} ${effectivePersonalInfo.mobileNumber}`
        : authUser?.mobile_number || undefined,
      email: effectivePersonalInfo.email?.trim() || authUser?.email || undefined,
      gender: effectivePersonalInfo.gender || 'Not specified',
      dob: effectivePersonalInfo.dateOfBirth || 'Not specified',
      fatherName: 'Not specified',
      address: fullAddress || 'Not specified',
      policeStation: effectivePersonalInfo.policeStation || effectiveAddressInfo.policeStation || undefined,
      occupation: 'Member',
      documents: uploadedDocs,
      activityLog: [
        {
          id: `log-sub-${Date.now()}`,
          title: 'Application Submitted',
          description: 'Membership application submitted online by applicant.',
          timestamp: `${formattedDate}, ${formattedTime}`,
          status: 'submitted',
        },
      ],
    };

    let validityYears = 1;
    if (effectivePost?.validity) {
      const match = effectivePost.validity.match(/(\d+)\s*year/i);
      if (match) {
        validityYears = parseInt(match[1], 10);
      }
    } else {
      const lower = categoryTitle.toLowerCase();
      if (lower.includes('director') || lower.includes('council')) {
        validityYears = 10;
      } else if (lower.includes('lion') || lower.includes('counselor') || lower.includes('ambassador')) {
        validityYears = 5;
      } else if (lower.includes('state unit')) {
        validityYears = 2;
      }
    }

    const newRecord: MembershipApplicationRecord = {
      id: adminAppItem.id,
      applicationId: appIdNumber,
      membershipId: `MEM${timestamp.getFullYear()}${randomDigits.toString().slice(0, 6)}`,
      membershipType: categoryTitle,
      status: 'Applied',
      submittedAt: `${formattedDate}, ${formattedTime}`,
      validFrom: formattedDate,
      validTill: `${formattedDate.slice(0, -4)}${Number(timestamp.getFullYear()) + validityYears}`,
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
          description: 'Your application is queued for admin review.',
          status: 'upcoming',
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
    setHasAppliedLocally(true);
    setIsReapplying(false);
    safeSetStorageItem('hrsjm_has_applied', 'true');
    safeSetStorageItem('hrsjm_user_membership_record', JSON.stringify(sanitizeForStorage(newRecord)));

    if (process.env.NODE_ENV !== 'test') {
      try {
        const saved = await executeBackendApply(
          newRecord,
          adminAppItem,
          categoryTitle,
          effectivePersonalInfo,
          effectiveAddressInfo,
          uploadedDocs,
          fullAddress,
          effectivePost,
        );
        return saved;
      } catch {
        return newRecord;
      }
    }
    return newRecord;
  };

  const updateApplicationStatus = (appId: string, status: MembershipStatus, rejectionReason?: string) => {
    setApplications(prev =>
      prev.map(app => (app.applicationId === appId || app.id === appId ? { ...app, status, rejectionReason: rejectionReason || app.rejectionReason } : app))
    );
    setActiveApplication(prev => {
      if (prev && (prev.applicationId === appId || prev.id === appId)) {
        const updated = { ...prev, status, rejectionReason: rejectionReason || prev.rejectionReason };
        safeSetStorageItem('hrsjm_user_membership_record', JSON.stringify(sanitizeForStorage(updated)));
        return updated;
      }
      return prev;
    });
  };

  const reapply = () => {
    setIsReapplying(true);
    // Pre-populate personal and address info from existing application so applicant doesn't have to retype
    const sourceApp = activeApplication || applications[0];
    if (sourceApp) {
      if (sourceApp.personalInfo) {
        setPersonalInfo({ ...INITIAL_PERSONAL_INFO, ...sourceApp.personalInfo });
      }
      if (sourceApp.addressInfo) {
        setAddressInfo({ ...INITIAL_ADDRESS_INFO, ...sourceApp.addressInfo });
      }
      if (sourceApp.membershipType) {
        setSelectedMembershipType(sourceApp.membershipType);
      }
    }
  };

  const cancelReapply = () => {
    setIsReapplying(false);
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
        hasApplied: Boolean(hasAppliedLocally || activeApplication || applications.length > 0),
        isReapplying,
        refreshApplications,
        setActiveApplication,
        submitApplication,
        submitApplicationAsync,
        updateApplicationStatus,
        reapply,
        cancelReapply,
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
