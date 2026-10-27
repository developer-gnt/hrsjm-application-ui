import {
  UserItem,
  UserStats,
  UserFilterOptions,
  UserTypeTabKey,
  AddUserPayload,
  EditUserPayload,
  UserType,
  UserStatus,
  UserVerificationDocument,
} from '../types/user.types';
import { INITIAL_DEV_USERS } from '../data/userFixtures';
import { RegistrationState } from '../../../auth/state/registrationState';
import { apiClient } from '../../../../core/api/client';

const STORAGE_KEY = 'hrsjm_registered_users';

const MOCK_USER_IDS = new Set(['user-001', 'user-002', 'user-003', 'user-004', 'user-005']);
const MOCK_USER_EMAILS = new Set([
  'aamir.khan@example.com',
  'sara.shaikh@example.com',
  'imran.ansari@example.com',
  'priya.sharma@example.com',
  'rahul.verma@example.com',
]);

export const isMockUser = (user: Partial<UserItem> | any): boolean => {
  if (!user) return false;
  if (user.id && MOCK_USER_IDS.has(user.id)) return true;
  const email = (user.email || '').toLowerCase().trim();
  if (email && (MOCK_USER_EMAILS.has(email) || email.endsWith('@example.com'))) return true;
  return false;
};

const getStorage = () => {
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return null;
};

class UsersStore {
  private users: UserItem[] = [];
  private listeners: Set<() => void> = new Set();
  private version: number = 0;

  constructor() {
    this.users =
      process.env.NODE_ENV === 'test'
        ? [...INITIAL_DEV_USERS]
        : this.loadPersistedUsers();
  }

  private loadPersistedUsers(): UserItem[] {
    try {
      const storage = getStorage();
      if (storage) {
        const raw = storage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const clean = parsed.filter(u => !isMockUser(u));
            if (clean.length !== parsed.length) {
              storage.setItem(STORAGE_KEY, JSON.stringify(clean));
            }
            return clean;
          }
        }
      }
    } catch {
      // Ignore storage errors in non-browser envs
    }
    return [];
  }

  private persistUsers(): void {
    try {
      const storage = getStorage();
      if (storage) {
        const clean = this.users.filter(u => !isMockUser(u));
        storage.setItem(STORAGE_KEY, JSON.stringify(clean));
      }
    } catch {
      // Ignore storage errors in non-browser envs
    }
  }

  public getSnapshot = (): number => {
    return this.version;
  };

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    this.version += 1;
    this.persistUsers();
    this.listeners.forEach(listener => listener());
  }

  public getAllUsers(): UserItem[] {
    return [...this.users];
  }

  public async fetchUsers(): Promise<UserItem[]> {
    // 1. Clean out any mock fixtures from state
    if (process.env.NODE_ENV !== 'test') {
      this.users = this.users.filter(u => !isMockUser(u));
    }

    const mappedUsers: UserItem[] = [];

    // 2. Fetch users from backend NestJS API
    try {
      const response = await apiClient.get<any>('/users');
      const items = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.items)
        ? response.data.items
        : Array.isArray(response)
        ? response
        : null;

      if (items && items.length > 0) {
        for (let idx = 0; idx < items.length; idx++) {
          const u = items[idx];
          if (isMockUser({ id: u.id, email: u.email })) continue;

          const roleNames = (u.roles || []).map((r: any) =>
            (typeof r === 'string' ? r : r.name || '').toUpperCase()
          );
          const isAdmin = roleNames.some((r: string) => r.includes('ADMIN'));
          const isMember = roleNames.some((r: string) => r.includes('MEMBER')) || Boolean(u.membership);
          const isSeeker =
            roleNames.some((r: string) => r.includes('SEEKER') || r.includes('DONATION_SEEKER')) ||
            Boolean(u.assistance);
          const isDonor = roleNames.some((r: string) => r.includes('DONOR')) || Boolean(u.donations?.length);

          let userType: UserType = 'general';
          if (isAdmin) {
            userType = 'admin';
          } else if (isMember) {
            userType = 'member';
          } else if (isSeeker) {
            userType = 'seeker';
          } else if (isDonor) {
            userType = 'donor';
          } else {
            userType = 'general';
          }

          const rawStatus = (u.status || '').toUpperCase();
          let status: UserStatus =
            rawStatus === 'BLOCKED' || u.is_active === false
              ? 'blocked'
              : rawStatus === 'PENDING'
              ? 'pending'
              : 'active';

          // General users do not require admin approval ("for the user we dont need the approve")
          if (userType === 'general' && status === 'pending') {
            status = 'active';
          }

          // In User Management, roles requiring approval (Member, Seeker) only show approved users.
          // Pending applicants remain in their respective review modules (Membership Applications / Aid).
          if ((userType === 'member' || userType === 'seeker') && status === 'pending') {
            continue;
          }

          mappedUsers.push({
            id: u.id || `user-api-${idx}`,
            memberId: u.membership?.membership_number || u.member_id || undefined,
            name: u.full_name || u.name || 'User',
            email: u.email || '',
            phone: u.mobile_number || u.phone || '',
            userType,
            status,
            avatarUrl: u.avatar_url || u.avatar || undefined,
            joinedDate: u.created_at || new Date().toISOString(),
            lastLogin: u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Recently',
            totalDonations: Number(u.total_donations || 0),
            donationCount: Number(u.donation_count || 0),
            dob: u.dob || u.date_of_birth || undefined,
            gender: u.gender || undefined,
            address: u.address || undefined,
            documents: Array.isArray(u.documents) ? u.documents : [],
          });
        }
      }
    } catch {
      // Continue gracefully
    }

    // 3. Merge applications from membershipApplicationsStore
    try {
      const { membershipApplicationsStore } = await import(
        '../../membershipApplications/services/membershipApplicationsStore'
      );
      const apps = membershipApplicationsStore.getApplications();
      if (apps && Array.isArray(apps)) {
        for (const app of apps) {
          if (!app.applicantName || app.applicantName === 'Applicant') continue;
          const isSeeker =
            app.membershipType?.toLowerCase().includes('seeker') ||
            app.applicationId?.startsWith('HRSJM-SEK');

          // In User Management, only APPROVED members & seekers appear.
          // Pending applications remain in Membership Applications until approved.
          if (app.status !== 'approved') {
            continue;
          }

          mappedUsers.push({
            id: app.id || `app-${app.applicationId}`,
            memberId: isSeeker ? undefined : app.applicationId,
            applicationNumber: app.applicationId,
            name: app.applicantName,
            email: app.email && app.email !== '—' ? app.email : '',
            phone: app.phone && app.phone !== '—' ? app.phone : '',
            userType: isSeeker ? 'seeker' : 'member',
            status: 'active',
            avatarUrl: app.avatarUrl,
            joinedDate: app.submittedDate || new Date().toISOString(),
            dob: app.dob,
            gender:
              app.gender === 'Male' || app.gender === 'Female' || app.gender === 'Other'
                ? app.gender
                : undefined,
            address: typeof app.address === 'string' ? app.address : undefined,
            donationCount: 0,
            totalDonations: 0,
            documents: (app.documents || []).map((d: any, i: number) => ({
              id: `doc-${i}`,
              title: d.title || 'Document',
              fileName: d.fileName || d.name || 'document.pdf',
              fileSize: d.fileSize || d.formattedSize || '1 MB',
              fileType: 'application/pdf',
              fileUri: d.uri,
              uploadedAt: app.submittedAt || new Date().toISOString(),
              verified: app.status === 'approved',
            })),
          });
        }
      }
    } catch {
      // Continue gracefully
    }

    // 4. Merge mapped users into this.users without duplicates
    const existingIds = new Set(this.users.map(u => u.id));
    const existingEmails = new Set(
      this.users.map(u => u.email.toLowerCase().trim()).filter(Boolean)
    );
    const existingPhones = new Set(
      this.users.map(u => u.phone.replace(/\s+/g, '')).filter(Boolean)
    );
    let changed = false;

    for (const nu of mappedUsers) {
      if (isMockUser(nu)) continue;
      const normalizedPhone = nu.phone ? nu.phone.replace(/\s+/g, '') : '';
      const normalizedEmail = nu.email ? nu.email.toLowerCase().trim() : '';

      const alreadyExists =
        existingIds.has(nu.id) ||
        (normalizedEmail && existingEmails.has(normalizedEmail)) ||
        (normalizedPhone && existingPhones.has(normalizedPhone));

      if (!alreadyExists) {
        this.users.push(nu);
        existingIds.add(nu.id);
        if (normalizedEmail) existingEmails.add(normalizedEmail);
        if (normalizedPhone) existingPhones.add(normalizedPhone);
        changed = true;
      }
    }

    if (changed) {
      this.notify();
    }

    return this.users;
  }

  public getUserById(id: string): UserItem | undefined {
    return this.users.find(u => u.id === id || u.memberId === id);
  }

  public getStats(): UserStats {
    let active = 0;
    let pending = 0;
    let blocked = 0;
    let members = 0;
    let seekers = 0;
    let donors = 0;
    let general = 0;
    let admins = 0;

    for (const u of this.users) {
      if (u.status === 'active') active++;
      else if (u.status === 'pending') pending++;
      else if (u.status === 'blocked') blocked++;

      if (u.userType === 'admin') admins++;
      else if (u.userType === 'member') members++;
      else if (u.userType === 'seeker') seekers++;
      else if (u.userType === 'donor') donors++;
      else if (u.userType === 'general') general++;
    }

    return {
      total: this.users.length,
      active,
      approved: active,
      pending,
      blocked,
      membersCount: members,
      seekersCount: seekers,
      donorsCount: donors,
      generalCount: general,
      adminsCount: admins,
    };
  }

  public getUsers(options?: UserFilterOptions): UserItem[] {
    let result = [...this.users];

    if (options?.typeTab && options.typeTab !== 'all') {
      result = result.filter(u => u.userType === options.typeTab);
    }

    if (options?.status && options.status !== 'all') {
      result = result.filter(u => u.status === options.status);
    }

    if (options?.joinedFrom) {
      result = result.filter(u => {
        const itemDate = u.joinedDate.slice(0, 10);
        return itemDate >= options.joinedFrom!;
      });
    }

    if (options?.joinedTo) {
      result = result.filter(u => {
        const itemDate = u.joinedDate.slice(0, 10);
        return itemDate <= options.joinedTo!;
      });
    }

    if (options?.searchQuery) {
      const q = options.searchQuery.trim().toLowerCase();
      if (q) {
        result = result.filter(u => {
          return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.phone.toLowerCase().includes(q) ||
            (u.memberId && u.memberId.toLowerCase().includes(q)) ||
            u.id.toLowerCase().includes(q)
          );
        });
      }
    }

    if (options?.sortBy) {
      if (options.sortBy === 'newest') {
        result.sort((a, b) => b.joinedDate.localeCompare(a.joinedDate));
      } else if (options.sortBy === 'oldest') {
        result.sort((a, b) => a.joinedDate.localeCompare(b.joinedDate));
      } else if (options.sortBy === 'name_asc') {
        result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (options.sortBy === 'name_desc') {
        result.sort((a, b) => b.name.localeCompare(a.name));
      }
    }

    return result;
  }

  /**
   * Registers a user directly from the Sign Up / Registration flow.
   * Maps registration fields to the persistent User record and prevents duplicates.
   */
  public registerUserFromRegistration(data: Partial<RegistrationState>): UserItem | null {
    const fullName = data.fullName?.trim();
    const email = data.email?.trim() || '';
    const phone = data.phone?.trim() || '';

    if (!fullName || (!email && !phone)) {
      return null;
    }

    // Check for existing user to avoid duplicate entries
    const existingIndex = this.users.findIndex(u => {
      const emailMatches = email && u.email && u.email.toLowerCase() === email.toLowerCase();
      const phoneMatches = phone && u.phone && u.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, '');
      return emailMatches || phoneMatches;
    });

    const accountType = (data.accountType || 'general').toLowerCase();
    const mappedType: UserType =
      accountType === 'admin'
        ? 'admin'
        : accountType === 'member'
        ? 'member'
        : accountType === 'seeker'
        ? 'seeker'
        : accountType === 'donor'
        ? 'donor'
        : 'general';

    // Verification rule: Admin and General Users are active immediately, Members and Seekers require document verification
    const mappedStatus: UserStatus =
      mappedType === 'admin' || mappedType === 'general' ? 'active' : 'pending';

    // Map verification documents if present
    const documents: UserVerificationDocument[] = [];
    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((doc, idx) => {
        documents.push({
          id: `doc-${idx + 1}-${Date.now()}`,
          title: doc.title || 'Identification Document',
          fileName: doc.name || 'document.pdf',
          fileSize: doc.formattedSize || '1 MB',
          fileType: doc.type || 'application/pdf',
          fileUri: doc.uri,
          uploadedAt: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          verified: mappedStatus === 'active',
        });
      });
    } else if (data.selectedDocTitle || data.uploadedFileName) {
      documents.push({
        id: `doc-1-${Date.now()}`,
        title: data.selectedDocTitle || 'Identification Document',
        fileName: data.uploadedFileName || 'document.pdf',
        fileSize: data.uploadedFileSize || '1 MB',
        fileType: 'application/pdf',
        fileUri: data.uploadedFileUri,
        uploadedAt: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        verified: mappedStatus === 'active',
      });
    }

    const seekerCount = this.users.filter(u => u.userType === 'seeker').length + 1;
    const applicationNumber =
      data.applicationNumber ||
      (mappedType === 'seeker'
        ? `HRSJM-SEK-${String(seekerCount).padStart(4, '0')}`
        : undefined);

    if (existingIndex >= 0) {
      const existingUser = this.users[existingIndex];
      const updatedUser: UserItem = {
        ...existingUser,
        name: fullName,
        email: email || existingUser.email,
        phone: phone || existingUser.phone,
        dob: data.dob || existingUser.dob,
        userType: mappedType,
        status: mappedStatus,
        applicationNumber: existingUser.applicationNumber || applicationNumber,
        documents: documents.length > 0 ? documents : existingUser.documents,
      };
      this.users[existingIndex] = updatedUser;
      this.notify();
      return updatedUser;
    }

    const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const userId = `USR-${uniqueSuffix.toUpperCase()}`;
    const memberId =
      mappedType === 'member'
        ? `HRSJM${String(1000 + this.users.length + 1).slice(-4)}`
        : undefined;

    const newUser: UserItem = {
      id: userId,
      memberId,
      applicationNumber,
      name: fullName,
      email,
      phone,
      userType: mappedType,
      status: mappedStatus,
      joinedDate: new Date().toISOString(),
      dob: data.dob?.trim() || undefined,
      gender: undefined,
      address: undefined,
      donationCount: 0,
      totalDonations: 0,
      documents,
    };

    this.users.unshift(newUser);
    this.notify();
    return newUser;
  }

  public addUser(payload: AddUserPayload): UserItem {
    const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const id = `usr-add-${uniqueSuffix}`;
    const nextNum = this.users.length + 1;
    const memberId = payload.userType === 'member' ? `HRSJM00${127 + nextNum}` : undefined;

    const newUser: UserItem = {
      id,
      memberId,
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      userType: payload.userType,
      status: payload.status || 'active',
      avatarUrl: payload.avatarUrl,
      joinedDate: new Date().toISOString(),
      dob: payload.dob,
      gender: payload.gender,
      address: payload.address,
      donationCount: 0,
      totalDonations: 0,
      documents: [],
    };

    this.users.unshift(newUser);
    this.notify();
    return newUser;
  }

  public updateUser(id: string, payload: EditUserPayload): UserItem | undefined {
    const index = this.users.findIndex(u => u.id === id || u.memberId === id);
    if (index === -1) return undefined;

    const current = this.users[index];
    const updated: UserItem = {
      ...current,
      name: payload.name !== undefined ? payload.name.trim() : current.name,
      email: payload.email !== undefined ? payload.email.trim() : current.email,
      phone: payload.phone !== undefined ? payload.phone.trim() : current.phone,
      userType: payload.userType !== undefined ? payload.userType : current.userType,
      status: payload.status !== undefined ? payload.status : current.status,
      dob: payload.dob !== undefined ? payload.dob : current.dob,
      gender: payload.gender !== undefined ? payload.gender : current.gender,
      address: payload.address !== undefined ? payload.address : current.address,
      avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : current.avatarUrl,
      remarks: payload.remarks !== undefined ? payload.remarks : current.remarks,
      notes: payload.notes !== undefined ? payload.notes : current.notes,
    };

    this.users[index] = updated;
    this.notify();
    return updated;
  }

  public updateStatus(id: string, status: UserItem['status'], remarks?: string): boolean {
    const index = this.users.findIndex(u => u.id === id || u.memberId === id);
    if (index === -1) return false;

    this.users[index] = {
      ...this.users[index],
      status,
      remarks: remarks || this.users[index].remarks,
    };
    this.notify();
    return true;
  }

  public deleteUser(id: string): boolean {
    const index = this.users.findIndex(u => u.id === id || u.memberId === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    this.notify();
    return true;
  }

  public updateDocumentStatus(
    userId: string,
    documentId: string,
    verified: boolean
  ): boolean {
    const user = this.users.find(u => u.id === userId || u.memberId === userId);
    if (!user || !user.documents) return false;

    const doc = user.documents.find(d => d.id === documentId);
    if (!doc) return false;

    doc.verified = verified;
    this.notify();
    return true;
  }

  public verifyAllDocuments(userId: string): boolean {
    const user = this.users.find(u => u.id === userId || u.memberId === userId);
    if (!user) return false;

    if (user.documents) {
      user.documents.forEach(d => {
        d.verified = true;
      });
    }
    user.status = 'active';
    this.notify();
    return true;
  }

  public rejectVerification(userId: string, reason: string): boolean {
    const user = this.users.find(u => u.id === userId || u.memberId === userId);
    if (!user) return false;

    user.status = 'blocked';
    user.remarks = reason;
    this.notify();
    return true;
  }


  public updateStatusByEmailOrPhone(
    email?: string,
    phone?: string,
    status: UserStatus = 'active'
  ): boolean {
    const index = this.users.findIndex(u => {
      const emailMatches = email && u.email && u.email.toLowerCase() === email.toLowerCase();
      const phoneMatches = phone && u.phone && u.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, '');
      return emailMatches || phoneMatches;
    });

    if (index === -1) return false;

    this.users[index] = {
      ...this.users[index],
      status,
    };
    this.notify();
    return true;
  }

  public seedDevFixtures(): void {
    this.users = [...INITIAL_DEV_USERS];
    this.notify();
  }

  public clearUsers(): void {
    this.users = [];
    this.notify();
  }

  public resetToFixtures(): void {
    this.seedDevFixtures();
  }
}

export const usersStore = new UsersStore();
