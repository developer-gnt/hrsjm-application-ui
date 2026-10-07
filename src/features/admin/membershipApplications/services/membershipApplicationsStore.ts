import { MembershipApplicationItem, ApplicationStatsData, ApplicationStatus } from '../types/membershipApplications.types';
import { INITIAL_APPLICATIONS, INITIAL_APPLICATION_STATS } from './membershipApplications.data';

class MembershipApplicationsStore {
  private applications: MembershipApplicationItem[] = [...INITIAL_APPLICATIONS];
  private baseStats: ApplicationStatsData = { ...INITIAL_APPLICATION_STATS };
  private listeners: Set<() => void> = new Set();

  public getApplications(): MembershipApplicationItem[] {
    return [...this.applications];
  }

  public getApplicationById(id: string): MembershipApplicationItem | undefined {
    return this.applications.find(a => a.id === id || a.applicationId === id);
  }

  public getStats(): ApplicationStatsData {
    // Dynamic recalculation of stats based on base mock baseline
    let underReviewCount = this.baseStats.underReview;
    let approvedCount = this.baseStats.approved;
    let rejectedCount = this.baseStats.rejected;
    let totalCount = this.baseStats.total;

    return {
      total: totalCount,
      underReview: underReviewCount,
      approved: approvedCount,
      rejected: rejectedCount,
    };
  }

  public updateStatus(id: string, newStatus: ApplicationStatus): boolean {
    const index = this.applications.findIndex(a => a.id === id || a.applicationId === id);
    if (index === -1) return false;

    const current = this.applications[index];
    const oldStatus = current.status;
    if (oldStatus === newStatus) return true;

    // Adjust base counts
    if (oldStatus === 'under_review') this.baseStats.underReview = Math.max(0, this.baseStats.underReview - 1);
    if (oldStatus === 'approved') this.baseStats.approved = Math.max(0, this.baseStats.approved - 1);
    if (oldStatus === 'rejected') this.baseStats.rejected = Math.max(0, this.baseStats.rejected - 1);

    if (newStatus === 'under_review') this.baseStats.underReview += 1;
    if (newStatus === 'approved') this.baseStats.approved += 1;
    if (newStatus === 'rejected') this.baseStats.rejected += 1;

    const nowStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ', ' + new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const statusTitleMap: Record<ApplicationStatus, string> = {
      approved: 'Application Approved',
      under_review: 'Under Review',
      rejected: 'Application Rejected',
    };

    const statusDescMap: Record<ApplicationStatus, string> = {
      approved: 'Application verified and approved by Administrator.',
      under_review: 'Application marked under review for further verification.',
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
      activityLog: [newLogItem, ...(current.activityLog || [])],
    };

    this.notify();
    return true;
  }

  public addApplication(application: MembershipApplicationItem): void {
    this.applications = [application, ...this.applications];
    this.baseStats.total += 1;
    if (application.status === 'under_review') this.baseStats.underReview += 1;
    else if (application.status === 'approved') this.baseStats.approved += 1;
    else if (application.status === 'rejected') this.baseStats.rejected += 1;
    this.notify();
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
          uploadDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          uri: d.uri,
        }))
      : data.uploadedFileName
      ? [
          {
            id: 'doc-primary',
            title: data.selectedDocTitle || 'Identification Document',
            fileName: data.uploadedFileName,
            fileSize: data.uploadedFileSize || '1.5 MB',
            uploadDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
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
    gender: 'Not specified',
    fatherName: 'Not specified',
    address: 'Submitted online via Member Registration',
    occupation: 'Member',
    documents: docs,
    activityLog: [
      {
        id: `log-review-${Date.now()}`,
        title: 'Under Review',
        description: 'Application submitted and queued for verification review.',
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

