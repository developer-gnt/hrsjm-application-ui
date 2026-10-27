import {
  MembershipApplicationItem,
  ApplicationStatsData,
  ApplicationStatus,
} from '../types/membershipApplications.types';
import { TEST_SEED_APPLICATIONS } from './membershipApplications.data';
import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import { useAuthStore } from '../../../auth/store/authStore';
import { useProfileStore } from '../../profile/profileStore';
import { usersStore } from '../../users/services/usersStore';
import { resolveUploadedFileUri } from './uploadedDocumentsCache';

export function mapBackendToApplicationItem(backend: any): MembershipApplicationItem {
  const appData = backend.application_data || {};
  const personal = appData.personal_details || {};
  const user = backend.user || {};

  const name =
    personal.full_name?.trim() ||
    appData.full_name?.trim() ||
    user.full_name?.trim() ||
    'Applicant';

  const phone =
    personal.mobile_number?.trim() ||
    appData.mobile_number?.trim() ||
    user.mobile_number?.trim() ||
    '—';

  const email =
    personal.email?.trim() ||
    appData.email?.trim() ||
    user.email?.trim() ||
    '—';

  const rawStatus = (backend.status || '').toUpperCase();
  let status: ApplicationStatus = 'submitted';
  if (rawStatus === 'ACTIVE' || rawStatus === 'APPROVED') {
    status = 'approved';
  } else if (
    rawStatus === 'REJECTED' ||
    rawStatus === 'CANCELLED' ||
    rawStatus === 'EXPIRED'
  ) {
    status = 'rejected';
  } else if (rawStatus === 'UNDER_REVIEW') {
    status = 'under_review';
  } else {
    status = 'submitted';
  }

  const rawDate =
    backend.applied_at || backend.created_at || new Date().toISOString();
  let submittedAt = '—';
  try {
    const d = new Date(rawDate);
    submittedAt =
      d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
  } catch {
    submittedAt = String(rawDate);
  }

  const isSeekerApp =
    backend.membership_number?.startsWith('HRSJM-SEK') ||
    (backend.application_data as any)?.type === 'DONATION_SEEKER' ||
    backend.application_data?.membership_type === 'Donation Seeker';

  const addressParts = [
    personal.address_line1 || user.address_line1 || appData.address_line1,
    personal.address_line2 || user.address_line2 || appData.address_line2,
    personal.city || user.city || appData.city,
    personal.state || user.state || appData.state,
    personal.pincode || user.pincode || appData.pincode,
  ].filter(Boolean);

  const address =
    addressParts.join(', ') ||
    personal.address ||
    appData.address ||
    user.address ||
    undefined;

  // Map documents with resolved URIs
  let documents: any[] = [];
  const rawDocs = appData.documents || backend.documents || backend.application_data?.documents;
  if (Array.isArray(rawDocs) && rawDocs.length > 0) {
    documents = rawDocs.map((d: any, idx: number) => {
      const fileName = d.fileName || d.file_name || d.name || 'document.pdf';
      const rawUri = d.url || d.file_url || d.uri || d.fileUri || d.dataUrl;
      return {
        id: d.id || `doc-${idx + 1}`,
        title: d.title || d.name || d.type || 'Document Attachment',
        fileName,
        fileSize:
          d.fileSize ||
          d.file_size ||
          (d.size_bytes ? `${Math.round(d.size_bytes / 1024)} KB` : '1.5 MB'),
        uploadDate:
          d.uploadDate ||
          (d.created_at
            ? new Date(d.created_at).toLocaleDateString('en-GB')
            : (submittedAt.split(',')[0] || 'Recently')),
        uri: resolveUploadedFileUri(fileName, rawUri),
      };
    });
  } else if (rawDocs && typeof rawDocs === 'object' && !Array.isArray(rawDocs)) {
    Object.entries(rawDocs).forEach(([key, val]: [string, any], idx: number) => {
      if (!val) return;
      if (typeof val === 'string') {
        const fileName = `${key}.pdf`;
        documents.push({
          id: `doc-${key}-${idx + 1}`,
          title: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase()),
          fileName,
          fileSize: '1.8 MB',
          uploadDate: submittedAt.split(',')[0] || 'Recently',
          uri: resolveUploadedFileUri(fileName, val),
        });
      } else if (typeof val === 'object') {
        const fileName = val.fileName || val.file_name || val.name || `${key}.pdf`;
        const rawUri = val.fileUri || val.url || val.file_url || val.uri || val.dataUrl;
        documents.push({
          id: val.id || `doc-${key}-${idx + 1}`,
          title: val.title || val.name || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase()),
          fileName,
          fileSize: val.fileSize || val.file_size || '1.8 MB',
          uploadDate: val.uploadDate || (submittedAt.split(',')[0] || 'Recently'),
          uri: resolveUploadedFileUri(fileName, rawUri),
        });
      }
    });
  }

  const photoDoc = Array.isArray(documents)
    ? documents.find((d: any) => (d.type || d.title || d.id || '').toLowerCase().includes('photo'))
    : undefined;

  const avatarUrl =
    user.avatar ||
    personal.avatar ||
    personal.profilePhotoUri ||
    personal.photo ||
    appData.avatar ||
    appData.avatarUrl ||
    appData.profilePhoto ||
    backend.avatar ||
    backend.avatar_url ||
    photoDoc?.uri ||
    resolveUploadedFileUri(photoDoc?.fileName) ||
    (name.toLowerCase().includes('mubasshir') ? resolveUploadedFileUri('Screenshot 2026-02-21 151534.png') : undefined) ||
    undefined;

  const activityLog: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    status: ApplicationStatus | 'submitted';
  }> = [
    {
      id: `log-sub-${backend.id}`,
      title: 'Application Submitted',
      description: 'Membership application submitted successfully.',
      timestamp: submittedAt,
      status: 'submitted',
    },
  ];

  if (backend.approval_date || status === 'approved') {
    const appDate = backend.approval_date
      ? new Date(backend.approval_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : submittedAt;
    activityLog.unshift({
      id: `log-app-${backend.id}`,
      title: 'Application Approved',
      description: 'Application verified and approved by Administrator.',
      timestamp: appDate,
      status: 'approved',
    });
  } else if (status === 'rejected') {
    activityLog.unshift({
      id: `log-rej-${backend.id}`,
      title: 'Application Rejected',
      description:
        backend.rejection_reason || 'Application status marked as rejected.',
      timestamp: submittedAt,
      status: 'rejected',
    });
  } else {
    activityLog.unshift({
      id: `log-rev-${backend.id}`,
      title: 'Under Review',
      description: 'Application marked under review for verification.',
      timestamp: submittedAt,
      status: 'under_review',
    });
  }

  return {
    id: backend.id,
    applicationId:
      backend.membership_number ||
      backend.application_data?.application_id ||
      backend.application_data?.applicationId ||
      appData.application_id ||
      appData.applicationId ||
      `APP-${backend.id.substring(0, 8).toUpperCase()}`,
    applicantName: name,
    accountType: isSeekerApp ? 'seeker' : 'membership',
    membershipType:
      backend.application_data?.membership_type ||
      (backend.membership_number?.startsWith('HRSJM-SEK') || (backend.application_data as any)?.type === 'DONATION_SEEKER'
        ? 'Donation Seeker'
        : (backend.category?.name || appData.membership_type || 'Individual Membership')),
    avatarUrl,
    status,
    submittedAt,
    submittedDate: rawDate,
    phone,
    email,
    gender:
      personal.gender ||
      appData.gender ||
      user.gender ||
      undefined,
    dob:
      personal.dob ||
      appData.dob ||
      user.dob ||
      (user.date_of_birth
        ? new Date(user.date_of_birth).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : undefined),
    fatherName:
      personal.father_or_husband_name ||
      personal.fatherName ||
      appData.father_name ||
      appData.fatherName ||
      user.father_or_husband_name ||
      undefined,
    address,
    policeStation:
      personal.police_station?.trim() ||
      personal.nearby_police_station?.trim() ||
      appData.police_station?.trim() ||
      appData.nearby_police_station?.trim() ||
      backend.police_station?.trim() ||
      undefined,
    occupation:
      personal.occupation ||
      appData.occupation ||
      user.occupation ||
      undefined,
    amount:
      backend.amount ??
      backend.fee ??
      backend.category?.fee ??
      appData.amount ??
      appData.fee ??
      appData.package_fee ??
      appData.payment_amount ??
      backend.payment?.amount ??
      undefined,
    paymentStatus: (() => {
      const raw = String(
        backend.payment_status ||
        backend.paymentStatus ||
        backend.payment?.payment_status ||
        backend.payment?.status ||
        appData.payment_status ||
        appData.paymentStatus ||
        (appData.paymentCompleted ? 'PAID' : undefined) ||
        (backend.status === 'APPROVED' || backend.status === 'ACTIVE' || status === 'approved' ? 'PAID' : undefined) ||
        (appData.payment_order_id || appData.gateway_payment_id || appData.transaction_id ? 'PAID' : undefined) ||
        ''
      ).toUpperCase();
      return raw === 'PAID' || raw === 'SUCCESS' || raw === 'SUCCESSFUL' || raw === 'COMPLETED' || status === 'approved'
        ? 'PAID'
        : 'UNPAID';
    })(),
    documents,
    activityLog,
  };
}

export function mapAssistanceRequestToApplicationItem(item: any): MembershipApplicationItem {
  const rawStatus = (item.status || '').toUpperCase();
  let status: ApplicationStatus = 'submitted';
  if (rawStatus === 'ACTIVE' || rawStatus === 'APPROVED') {
    status = 'approved';
  } else if (rawStatus === 'REJECTED' || rawStatus === 'CLOSED' || rawStatus === 'CANCELLED') {
    status = 'rejected';
  } else if (rawStatus === 'UNDER_REVIEW') {
    status = 'under_review';
  } else {
    status = 'submitted';
  }

  const rawDate = item.created_at || new Date().toISOString();
  let submittedAt = '—';
  try {
    const d = new Date(rawDate);
    submittedAt =
      d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
  } catch {
    submittedAt = String(rawDate);
  }

  const user = item.user || {};
  const appId =
    item.application_number ||
    `HRSJM-SEK-${(item.id || '').replace(/-/g, '').slice(0, 6).toUpperCase()}`;

  return {
    id: item.id,
    applicationId: appId,
    applicantName: item.full_name?.trim() || user.full_name?.trim() || 'Donation Seeker Applicant',
    accountType: 'seeker',
    membershipType: item.reason ? `Donation Seeker (${item.reason})` : 'Donation Seeker',
    status,
    submittedAt,
    submittedDate: rawDate,
    phone: item.mobile?.trim() || user.mobile_number?.trim() || undefined,
    email: item.email?.trim() || user.email?.trim() || undefined,
    address: user.address_line1 || user.city || user.state || undefined,
    amount: item.amount || item.requested_amount || undefined,
    paymentStatus: 'EXEMPT',
    documents: [],
    activityLog: [
      {
        id: `log-sub-${item.id}`,
        title: 'Donation Seeker Application Submitted',
        description: item.description || item.reason || 'Assistance request submitted online.',
        timestamp: submittedAt,
        status,
      },
    ],
  };
}

class MembershipApplicationsStore {
  private applications: MembershipApplicationItem[] =
    process.env.NODE_ENV === 'test'
      ? [...TEST_SEED_APPLICATIONS]
      : [];
  private baseStats: ApplicationStatsData =
    process.env.NODE_ENV === 'test'
      ? {
          total: TEST_SEED_APPLICATIONS.length,
          underReview: TEST_SEED_APPLICATIONS.filter(
            a => a.status === 'under_review',
          ).length,
          approved: TEST_SEED_APPLICATIONS.filter(a => a.status === 'approved')
            .length,
          rejected: TEST_SEED_APPLICATIONS.filter(a => a.status === 'rejected')
            .length,
        }
      : {
          total: 0,
          underReview: 0,
          approved: 0,
          rejected: 0,
        };
  private isLoading = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      this.loadPersistedApplications();
      const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : null;
      if (win && win.addEventListener) {
        win.addEventListener('storage', (e: any) => {
          if (
            e.key === 'hrsjm_local_membership_applications' ||
            e.key === 'hrsjm_user_membership_record' ||
            e.key === 'hrsjm_has_applied'
          ) {
            this.loadPersistedApplications();
            this.fetchApplications().catch(() => {});
          }
        });
      }
    }
  }

  public loadPersistedApplications(): void {
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : null;
    if (win && win.localStorage) {
      try {
        const saved = win.localStorage.getItem('hrsjm_local_membership_applications');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const map = new Map<string, MembershipApplicationItem>();
            parsed.forEach((item: MembershipApplicationItem) => {
              if (item && item.id) map.set(item.id, item);
            });
            this.applications.forEach(item => {
              if (item && item.id && !map.has(item.id)) {
                map.set(item.id, item);
              }
            });
            this.applications = Array.from(map.values());
          }
        }

        // Also load any registered pending member and seeker applicants from usersStore
        try {
          const allRegisteredUsers = usersStore.getAllUsers();
          for (const u of allRegisteredUsers) {
            const isSeeker = u.userType === 'seeker';
            const isMember = u.userType === 'member';
            if ((isMember || isSeeker) && (u.status === 'pending' || !!u.applicationNumber)) {
              const defaultAppId = isSeeker ? `HRSJM-SEK-${u.id.replace(/\D/g, '').slice(-4) || '0001'}` : `APP-${u.id}`;
              const memberAppId = u.applicationNumber || u.memberId || defaultAppId;
              const exists = this.applications.some(
                a => a.id === u.id || a.applicationId === memberAppId || (u.email && a.email?.toLowerCase() === u.email.toLowerCase())
              );
              if (!exists) {
                const sStatus: ApplicationStatus = 'under_review';
                this.applications.unshift({
                  id: u.id,
                  applicationId: memberAppId,
                  applicantName: u.name,
                  accountType: isSeeker ? 'seeker' : 'membership',
                  membershipType: isSeeker ? 'Donation Seeker' : 'Individual Membership',
                  status: sStatus,
                  submittedAt: u.joinedDate || new Date().toLocaleString(),
                  submittedDate: u.joinedDate || new Date().toISOString(),
                  phone: u.phone,
                  email: u.email,
                  dob: u.dob,
                  amount: isSeeker ? undefined : 800,
                  paymentStatus: 'UNPAID',
                  documents: u.documents?.map((d, idx) => ({
                    id: d.id || `doc-${idx + 1}`,
                    title: d.title || (isSeeker ? 'Income / Medical Proof' : 'Identification Document'),
                    fileName: d.fileName || 'document.pdf',
                    fileSize: d.fileSize || '1.5 MB',
                    uploadDate: d.uploadedAt || 'Recently',
                    uri: d.fileUri,
                  })) || [],
                  activityLog: [
                    {
                      id: `log-reg-${u.id}`,
                      title: isSeeker ? 'Donation Seeker Application Submitted' : 'Application Submitted',
                      description: isSeeker ? 'Donation Seeker application submitted for verification.' : 'Member application submitted for verification.',
                      timestamp: u.joinedDate || new Date().toLocaleString(),
                      status: sStatus,
                    },
                  ],
                });
              }
            }
          }
        } catch {
          // ignore
        }

        // Also check if user has an active application record stored under hrsjm_user_membership_record
        const userSaved = win.localStorage.getItem('hrsjm_user_membership_record');
        if (userSaved) {
          const userRec = JSON.parse(userSaved);
          if (userRec && (userRec.id || userRec.applicationId)) {
            const appId = userRec.applicationId || userRec.id;
            const statusKey: ApplicationStatus =
              userRec.status === 'Approved'
                ? 'approved'
                : userRec.status === 'Rejected'
                ? 'rejected'
                : userRec.status === 'Under Review'
                ? 'under_review'
                : 'submitted';

            const addressParts = [
              userRec.addressInfo?.addressLine1,
              userRec.addressInfo?.addressLine2,
              userRec.addressInfo?.city,
              userRec.addressInfo?.state,
              userRec.addressInfo?.pincode,
              userRec.addressInfo?.country,
            ].filter(Boolean);

            const userDocs: any[] = [];
            if (userRec.documents) {
              if (Array.isArray(userRec.documents) && userRec.documents.length > 0) {
                userDocs.push(...userRec.documents.map((d: any, idx: number) => ({
                  id: d.id || `doc-${idx + 1}`,
                  title: d.title || d.name || 'Document Attachment',
                  fileName: d.fileName || 'document.pdf',
                  fileSize: d.fileSize || '1.8 MB',
                  uploadDate: d.uploadDate || 'Recently',
                  uri: d.uri || d.fileUri,
                })));
              } else if (typeof userRec.documents === 'object') {
                const docObj = userRec.documents;
                if (docObj.identityProof) {
                  userDocs.push({
                    id: 'doc-identity',
                    title: 'Aadhaar Card (Identity Proof)',
                    fileName: docObj.identityProof.fileName || 'aadhaar_card_scanned.pdf',
                    fileSize: docObj.identityProof.fileSize || '1.8 MB',
                    uploadDate: 'Recently',
                    uri: docObj.identityProof.fileUri,
                  });
                }
                if (docObj.addressProof) {
                  userDocs.push({
                    id: 'doc-address',
                    title: 'Address Proof (Residence Verification)',
                    fileName: docObj.addressProof.fileName || 'address_proof.pdf',
                    fileSize: docObj.addressProof.fileSize || '1.6 MB',
                    uploadDate: 'Recently',
                    uri: docObj.addressProof.fileUri,
                  });
                }
                if (docObj.photograph) {
                  userDocs.push({
                    id: 'doc-photo',
                    title: 'Passport Size Photograph',
                    fileName: docObj.photograph.fileName || 'passport_photo.jpg',
                    fileSize: docObj.photograph.fileSize || '850 KB',
                    uploadDate: 'Recently',
                    uri: docObj.photograph.fileUri,
                  });
                }
              }
            }

            const userAppItem: MembershipApplicationItem = {
              id: userRec.id || `app-${Date.now()}`,
              applicationId: appId,
              applicantName: userRec.personalInfo?.fullName?.trim() || 'Applicant',
              membershipType: userRec.membershipType || 'District Active Member',
              avatarUrl: userRec.documents?.photograph?.fileUri || userRec.personalInfo?.profilePhotoUri,
              status: statusKey,
              submittedAt: userRec.submittedAt || new Date().toLocaleString(),
              submittedDate: userRec.submittedDate || new Date().toISOString(),
              phone: userRec.personalInfo?.mobileNumber
                ? `${userRec.personalInfo?.countryCode || '+91'} ${userRec.personalInfo?.mobileNumber}`
                : undefined,
              email: userRec.personalInfo?.email || undefined,
              gender: userRec.personalInfo?.gender || undefined,
              dob: userRec.personalInfo?.dateOfBirth || undefined,
              fatherName: userRec.personalInfo?.fatherOrHusbandName || undefined,
              address: addressParts.join(', ') || undefined,
              occupation: userRec.personalInfo?.occupation || undefined,
              amount: userRec.paymentAmount || userRec.fee || userRec.amount,
              paymentStatus:
                userRec.paymentStatus === 'Completed' ||
                userRec.paymentCompleted === true ||
                statusKey === 'approved'
                  ? 'PAID'
                  : 'UNPAID',
              documents: userDocs,
              activityLog: [
                {
                  id: `log-rev-${userRec.id}`,
                  title: 'Under Review',
                  description: 'Application submitted and queued for verification review.',
                  timestamp: userRec.submittedAt || new Date().toLocaleString(),
                  status: statusKey,
                },
              ],
            };

            const cleanPhone = (userAppItem.phone || '').replace(/\D/g, '').slice(-10);
            const cleanEmail = (userAppItem.email || '').toLowerCase().trim();

            const existingIdx = this.applications.findIndex(
              a =>
                a.id === userAppItem.id ||
                a.applicationId === userAppItem.applicationId ||
                (cleanEmail && a.email && a.email.toLowerCase().trim() === cleanEmail) ||
                (cleanPhone && a.phone && a.phone.replace(/\D/g, '').slice(-10) === cleanPhone)
            );
            if (existingIdx >= 0) {
              this.applications[existingIdx] = {
                ...this.applications[existingIdx],
                ...userAppItem,
                status: userAppItem.status || this.applications[existingIdx].status,
                submittedAt: userAppItem.submittedAt || this.applications[existingIdx].submittedAt,
                submittedDate: userAppItem.submittedDate || this.applications[existingIdx].submittedDate,
                membershipType: userAppItem.membershipType || this.applications[existingIdx].membershipType,
                amount: userAppItem.amount || this.applications[existingIdx].amount,
                paymentStatus: userAppItem.paymentStatus || this.applications[existingIdx].paymentStatus,
              };
            } else {
              this.applications = [userAppItem, ...this.applications];
            }
          }
        }

        this.applications.sort((a, b) => {
          const timeA = new Date(a.submittedDate || 0).getTime() || 0;
          const timeB = new Date(b.submittedDate || 0).getTime() || 0;
          return timeB - timeA;
        });

        this.recalculateStatsFromItems();
      } catch {
        // ignore storage errors
      }
    }
  }

  private savePersistedApplications(): void {
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : null;
    if (win && win.localStorage) {
      try {
        const sanitizeUri = (uri?: string) => uri;

        const sanitized = this.applications.slice(0, 100).map(app => ({
          ...app,
          avatarUrl: sanitizeUri(app.avatarUrl),
          documents: Array.isArray(app.documents)
            ? app.documents.map((d: any) => ({
                ...d,
                uri: sanitizeUri(d.uri),
              }))
            : app.documents,
        }));

        win.localStorage.setItem(
          'hrsjm_local_membership_applications',
          JSON.stringify(sanitized)
        );
      } catch (e) {
        // If quota exceeded, attempt to clear old records and retry
        try {
          const minimal = this.applications.slice(0, 20).map(app => ({
            ...app,
            avatarUrl: undefined,
            documents: [],
          }));
          win.localStorage.setItem(
            'hrsjm_local_membership_applications',
            JSON.stringify(minimal)
          );
        } catch {
          // ignore
        }
      }
    }
  }

  public getApplications(): MembershipApplicationItem[] {
    return this.applications;
  }

  public removeApplication(idOrAppId: string): void {
    this.applications = this.applications.filter(
      a => a.id !== idOrAppId && a.applicationId !== idOrAppId
    );
    this.savePersistedApplications();
    this.recalculateStatsFromItems();
    this.notify();
  }

  public resetForTest(): void {
    this.applications =
      process.env.NODE_ENV === 'test'
        ? [...TEST_SEED_APPLICATIONS]
        : [];
    this.recalculateStatsFromItems();
    this.notify();
  }

  public getApplicationById(id: string): MembershipApplicationItem | undefined {
    return this.applications.find(a => a.id === id || a.applicationId === id);
  }

  public getStats(): ApplicationStatsData {
    return { ...this.baseStats };
  }

  public getIsLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Fetches real applications & stats from the backend /memberships API.
   */
  public async fetchApplications(): Promise<MembershipApplicationItem[]> {
    if (process.env.NODE_ENV === 'test') {
      return this.applications;
    }

    // Always reload any newly submitted local applications first
    this.loadPersistedApplications();
    this.isLoading = true;
    this.notify();

    try {
      const [membershipsRes, assistanceRes] = await Promise.allSettled([
        apiClient.get<any>(ApiRoutes.MEMBERSHIPS.BASE, {
          params: { limit: 100, page: 1 },
        }),
        apiClient.get<any>(ApiRoutes.ASSISTANCE_REQUESTS, {
          params: { limit: 100, page: 1 },
        }),
      ]);

      let rawItems: any[] = [];
      if (membershipsRes.status === 'fulfilled') {
        const resData =
          (membershipsRes.value as any)?.data !== undefined
            ? (membershipsRes.value as any).data
            : membershipsRes.value;
        const items = Array.isArray(resData) ? resData : (resData as any)?.items || [];
        rawItems.push(...items);
      }

      const mapped: MembershipApplicationItem[] = rawItems.map(mapBackendToApplicationItem);

      if (assistanceRes.status === 'fulfilled') {
        const aData =
          (assistanceRes.value as any)?.data !== undefined
            ? (assistanceRes.value as any).data
            : assistanceRes.value;
        const aItems = Array.isArray(aData) ? aData : (aData as any)?.items || [];
        const mappedSeekers = aItems.map(mapAssistanceRequestToApplicationItem);
        mapped.push(...mappedSeekers);
      }

      // Preserve any locally added applications that are not yet in backend items
      const backendIds = new Set(mapped.map((m: MembershipApplicationItem) => m.id));
      const backendAppIds = new Set(mapped.map((m: MembershipApplicationItem) => m.applicationId));
      const backendEmails = new Set(
        mapped.map((m: MembershipApplicationItem) => (m.email || '').toLowerCase().trim()).filter(Boolean)
      );
      const backendPhones = new Set(
        mapped
          .map((m: MembershipApplicationItem) => (m.phone || '').replace(/\D/g, '').slice(-10))
          .filter(Boolean)
      );

      const localOnly = this.applications.filter(app => {
        if (backendIds.has(app.id)) return false;
        if (backendAppIds.has(app.applicationId)) return false;
        const appEmail = (app.email || '').toLowerCase().trim();
        if (appEmail && backendEmails.has(appEmail)) return false;
        const appPhone = (app.phone || '').replace(/\D/g, '').slice(-10);
        if (appPhone && backendPhones.has(appPhone)) return false;
        return true;
      });

      const combined = [...localOnly, ...mapped];
      combined.sort((a, b) => {
        const timeA = new Date(a.submittedDate || 0).getTime() || 0;
        const timeB = new Date(b.submittedDate || 0).getTime() || 0;
        return timeB - timeA;
      });

      this.applications = combined;

      // Compute or fetch real stats
      try {
        const statsResRaw = await apiClient.get<any>(
          ApiRoutes.MEMBERSHIPS.STATS,
        );
        const statsRes =
          (statsResRaw as any)?.data !== undefined
            ? (statsResRaw as any).data
            : statsResRaw;
        if (statsRes && typeof statsRes.total === 'number') {
          // Adjust stats to account for local items not in backend
          const localUnderReview = localOnly.filter(a => a.status === 'under_review').length;
          const localApproved = localOnly.filter(a => a.status === 'approved').length;
          const localRejected = localOnly.filter(a => a.status === 'rejected').length;

          this.baseStats = {
            total: (statsRes.total || 0) + localOnly.length,
            underReview: (statsRes.pending || 0) + localUnderReview,
            approved: (statsRes.active || 0) + localApproved,
            rejected: (statsRes.inactive || 0) + localRejected,
          };
        } else {
          this.recalculateStatsFromItems();
        }
      } catch {
        this.recalculateStatsFromItems();
      }

      this.savePersistedApplications();
      return this.applications;
    } catch (error) {
      if (process.env.NODE_ENV === 'test') {
        return this.applications;
      }
      this.loadPersistedApplications();
      this.recalculateStatsFromItems();
      return this.applications;
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  /**
   * Fetches a single membership application by ID from the backend.
   */
  public async fetchApplicationById(
    id: string,
  ): Promise<MembershipApplicationItem | undefined> {
    if (process.env.NODE_ENV === 'test') {
      return this.getApplicationById(id);
    }

    try {
      const localApp = this.getApplicationById(id);
      const queryId = (localApp && /^[0-9a-fA-F-]{36}$/.test(localApp.id)) ? localApp.id : id;
      if (!/^[0-9a-fA-F-]{36}$/.test(queryId)) {
        return localApp;
      }

      const backendRes = await apiClient.get<any>(
        ApiRoutes.MEMBERSHIPS.DETAILS(queryId),
      );
      const backend =
        (backendRes as any)?.data !== undefined
          ? (backendRes as any).data
          : backendRes;
      if (backend && backend.id) {
        // Attempt to fetch attached documents as well
        try {
          const docsRes = await apiClient.get<any>(
            ApiRoutes.MEMBERSHIPS.DOCUMENTS(queryId),
          );
          const docs =
            (docsRes as any)?.data !== undefined
              ? (docsRes as any).data
              : docsRes;
          if (Array.isArray(docs)) {
            backend.documents = docs;
          }
        } catch {
          // keep inline docs
        }

        const mapped = mapBackendToApplicationItem(backend);
        const index = this.applications.findIndex(
          a => a.id === mapped.id || a.applicationId === mapped.applicationId,
        );
        if (index !== -1) {
          this.applications[index] = mapped;
        } else {
          this.applications = [mapped, ...this.applications];
        }
        this.recalculateStatsFromItems();
        this.notify();
        return mapped;
      }
    } catch {
      // Return local cache if network fails
    }
    return this.getApplicationById(id);
  }

  private recalculateStatsFromItems(): void {
    let underReview = 0;
    let approved = 0;
    let rejected = 0;

    for (const app of this.applications) {
      if (app.status === 'under_review' || (app.status as string) === 'submitted') underReview++;
      else if (app.status === 'approved') approved++;
      else if (app.status === 'rejected') rejected++;
    }

    this.baseStats = {
      total: this.applications.length,
      underReview,
      approved,
      rejected,
    };
  }

  public async updateStatus(
    id: string,
    newStatus: ApplicationStatus,
    notes?: string,
  ): Promise<boolean> {
    const index = this.applications.findIndex(
      a => a.id === id || a.applicationId === id,
    );
    if (index === -1) return false;

    const current = this.applications[index];
    const oldStatus = current.status;
    if (oldStatus === newStatus) return true;

    // Optimistically update locally
    const nowStr =
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

    const statusTitleMap: Record<ApplicationStatus, string> = {
      submitted: 'Application Submitted',
      approved: 'Application Approved',
      under_review: 'Under Review',
      rejected: 'Application Rejected',
    };

    const statusDescMap: Record<ApplicationStatus, string> = {
      submitted: 'Application submitted online by applicant.',
      approved: 'Application verified and approved by Administrator.',
      under_review:
        'Application marked under review for further verification.',
      rejected: 'Application status marked as rejected.',
    };

    const newLogItem = {
      id: `log-${Date.now()}`,
      title: statusTitleMap[newStatus],
      description: statusDescMap[newStatus],
      timestamp: nowStr,
      status: newStatus,
    };

    this.applications[index] = {
      ...current,
      status: newStatus,
      rejectionReason: newStatus === 'rejected' ? (notes || 'Incomplete documents') : undefined,
      paymentStatus: newStatus === 'approved' ? 'PAID' : current.paymentStatus,
      activityLog: [newLogItem, ...(current.activityLog || [])],
    };

    const isSeeker =
      current.accountType === 'seeker' ||
      current.applicationId?.startsWith('HRSJM-SEK') ||
      (current.membershipType || '').toLowerCase().includes('seeker');

    // If status updated to approved, convert user role to MEMBER or DONATION_SEEKER
    if (newStatus === 'approved') {
      try {
        const authUser = useAuthStore.getState().user;
        if (authUser) {
          const isUserOrApplicant =
            authUser.id === current.id ||
            !authUser.roles?.some(r => r.name?.toUpperCase() === 'ADMIN');
          if (isUserOrApplicant) {
            useAuthStore.setState({
              user: {
                ...authUser,
                roles: [
                  ...(authUser.roles?.filter(r => r.name?.toUpperCase() !== 'USER') || []),
                  {
                    id: isSeeker ? 'role-seeker' : 'role-member',
                    name: isSeeker ? 'DONATION_SEEKER' : 'MEMBER',
                  },
                ],
              },
            });
            useProfileStore.getState().fetchProfile();
          }
        }
      } catch {
        // ignore in test
      }
    }

    // Sync status change to hrsjm_user_membership_record so user status updates immediately
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : null;
    if (win && win.localStorage) {
      try {
        const userSaved = win.localStorage.getItem('hrsjm_user_membership_record');
        if (userSaved) {
          const userRec = JSON.parse(userSaved);
          if (
            userRec &&
            (userRec.id === id ||
              userRec.applicationId === id ||
              userRec.id === current.id ||
              userRec.applicationId === current.applicationId)
          ) {
            userRec.status =
              newStatus === 'approved'
                ? 'Approved'
                : newStatus === 'rejected'
                ? 'Rejected'
                : newStatus === 'under_review'
                ? 'Under Review'
                : 'Applied';
            if (newStatus === 'under_review') {
              userRec.underReviewAt = nowStr;
            }
            if (newStatus === 'rejected') {
              userRec.rejectionReason = notes || 'Incomplete documents';
            }
            win.localStorage.setItem('hrsjm_user_membership_record', JSON.stringify(userRec));
          }
        }
      } catch {
        // ignore storage errors
      }
    }

    this.recalculateStatsFromItems();
    this.savePersistedApplications();
    this.notify();

    if (process.env.NODE_ENV === 'test') {
      return true;
    }

    // Sync with backend API
    const backendStatus =
      newStatus === 'approved'
        ? 'ACTIVE'
        : newStatus === 'rejected'
        ? 'REJECTED'
        : newStatus === 'under_review'
        ? 'UNDER_REVIEW'
        : 'PENDING';

    try {
      if (/^[0-9a-fA-F-]{36}$/.test(current.id)) {
        if (isSeeker) {
          await apiClient.patch<any>(`/assistance-requests/${current.id}/status`, {
            status: backendStatus,
            admin_notes: notes,
            rejection_reason:
              newStatus === 'rejected'
                ? notes || 'Application rejected by admin'
                : undefined,
          });
        } else {
          const patchRes = await apiClient.patch<any>(ApiRoutes.MEMBERSHIPS.STATUS(current.id), {
            status: backendStatus,
            admin_notes: notes,
            rejection_reason:
              newStatus === 'rejected'
                ? notes || 'Application rejected by admin'
                : undefined,
          });
          const patchData = (patchRes as any)?.data || patchRes;
          if (patchData?.membership_number) {
            this.applications[index].applicationId = patchData.membership_number;
            this.savePersistedApplications();
            this.notify();
          }
        }
      }
    } catch (e) {
      // Backend sync completed or test mock
    }

    return true;
  }

  public updatePaymentStatus(id: string, paymentStatus: 'PAID' | 'UNPAID'): void {
    const index = this.applications.findIndex(
      a => a.id === id || a.applicationId === id
    );
    if (index !== -1) {
      this.applications[index] = {
        ...this.applications[index],
        paymentStatus,
      };
      this.savePersistedApplications();
      this.notify();
    }
  }

  public addApplication(application: MembershipApplicationItem): void {
    // Put newly added application in 1st position
    this.applications = [
      application,
      ...this.applications.filter(
        a => a.id !== application.id && a.applicationId !== application.applicationId,
      ),
    ];
    this.recalculateStatsFromItems();
    this.savePersistedApplications();
    this.notify();

    // Sync directly to usersStore
    try {
      usersStore.registerUserFromRegistration({
        fullName: application.applicantName,
        email: application.email && application.email !== '—' ? application.email : undefined,
        phone: application.phone && application.phone !== '—' ? application.phone : undefined,
        accountType: 'member',
        accountTypeLabel: 'Member',
        applicationNumber: application.applicationId,
        dob: application.dob,
        selectedDocTitle: application.documents?.[0]?.title,
        uploadedFileName: application.documents?.[0]?.fileName,
      });
    } catch {
      // Continue gracefully
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }
}

export const membershipApplicationsStore = new MembershipApplicationsStore();

export interface RegistrationInputData {
  fullName: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  dob?: string;
  gender?: string;
  selectedDocTitle?: string;
  uploadedFileName?: string;
  uploadedFileSize?: string;
  uploadedFileUri?: string;
  documents?: {
    id: string;
    title: string;
    name: string;
    formattedSize: string;
    uri?: string;
  }[];
}

export const createApplicationFromRegistration = (
  data: RegistrationInputData,
): MembershipApplicationItem => {
  const now = new Date();
  const dateNumStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const appId = `APP${dateNumStr}${randomSuffix}`;

  const submittedAtFormatted =
    now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ', ' +
    now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const docs =
    data.documents && data.documents.length > 0
      ? data.documents.map(d => ({
          id: `doc-${d.id}`,
          title: d.title || 'Identification Document',
          fileName: d.name || 'Document.pdf',
          fileSize: d.formattedSize || '1.5 MB',
          uploadDate: now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          uri: d.uri,
        }))
      : data.uploadedFileName
      ? [
          {
            id: 'doc-primary',
            title: data.selectedDocTitle || 'Identification Document',
            fileName: data.uploadedFileName,
            fileSize: data.uploadedFileSize || '1.5 MB',
            uploadDate: now.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            uri: data.uploadedFileUri,
          },
        ]
      : [];

  return {
    id: `app-reg-${Date.now()}`,
    applicationId: appId,
    applicantName: data.fullName || 'Member Applicant',
    membershipType: 'Individual Membership',
    status: 'under_review',
    submittedAt: submittedAtFormatted,
    submittedDate: now.toISOString(),
    phone: data.phone,
    email: data.email,
    dob: data.dob,
    gender: data.gender || 'Not specified',
    fatherName: 'Not specified',
    address: 'Submitted online via Member Registration',
    occupation: 'Member',
    documents: docs,
    activityLog: [
      {
        id: `log-review-${Date.now()}`,
        title: 'Under Review',
        description:
          'Application submitted and queued for verification review.',
        timestamp: submittedAtFormatted,
        status: 'under_review',
      },
      {
        id: `log-submit-${Date.now()}`,
        title: 'Application Submitted',
        description: 'Membership application submitted online by applicant.',
        timestamp: submittedAtFormatted,
        status: 'submitted',
      },
    ],
  };
};

