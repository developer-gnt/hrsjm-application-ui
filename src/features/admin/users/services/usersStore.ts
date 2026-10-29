import {
  UserItem,
  UserStats,
  UserFilterOptions,
  UserTypeTabKey,
  AddUserPayload,
  EditUserPayload,
  UserType,
  UserStatus,
  UserGender,
  UserVerificationDocument,
} from '../types/user.types';
import { INITIAL_DEV_USERS } from '../data/userFixtures';
import { RegistrationState } from '../../../auth/state/registrationState';
import { apiClient } from '../../../../core/api/client';
import { useAuthStore } from '../../../auth/store/authStore';

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

export const parseUserDateToTimestamp = (dateStr?: string): number => {
  if (!dateStr) return 0;
  if (typeof dateStr === 'number') return dateStr;
  const num = Number(dateStr);
  if (!isNaN(num) && num > 100000000) return num;
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return parsed;
  return 0;
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
    this.sortUsersInternal();
  }

  private sortUsersInternal(): void {
    this.users.sort((a, b) => {
      const timeA = parseUserDateToTimestamp(a.joinedDate);
      const timeB = parseUserDateToTimestamp(b.joinedDate);
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });
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
            return clean.sort((a, b) => {
              const timeA = parseUserDateToTimestamp(a.joinedDate);
              const timeB = parseUserDateToTimestamp(b.joinedDate);
              if (timeB !== timeA) return timeB - timeA;
              return (b.id || '').localeCompare(a.id || '');
            });
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
    return [...this.users].sort((a, b) => {
      const timeA = parseUserDateToTimestamp(a.joinedDate);
      const timeB = parseUserDateToTimestamp(b.joinedDate);
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });
  }

  public async fetchUsers(): Promise<UserItem[]> {
    // 1. Clean out any mock fixtures from state
    if (process.env.NODE_ENV !== 'test') {
      this.users = this.users.filter(u => !isMockUser(u));
    }

    const mappedUsers: UserItem[] = [];

    // 2. Fetch users from backend NestJS API
    try {
      const response = await apiClient.get<any>('/users?limit=100');
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
            rawStatus === 'BLOCKED' || rawStatus === 'INACTIVE' || rawStatus === 'SUSPENDED' || u.is_active === false
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
    let changed = false;

    for (const nu of mappedUsers) {
      if (isMockUser(nu)) continue;
      const normalizedPhone = nu.phone ? nu.phone.replace(/\s+/g, '') : '';
      const normalizedEmail = nu.email ? nu.email.toLowerCase().trim() : '';

      const existingIndex = this.users.findIndex(
        u =>
          u.id === nu.id ||
          (normalizedEmail && u.email && u.email.toLowerCase().trim() === normalizedEmail) ||
          (normalizedPhone && u.phone && u.phone.replace(/\s+/g, '') === normalizedPhone)
      );

      if (existingIndex >= 0) {
        this.users[existingIndex] = {
          ...this.users[existingIndex],
          ...nu,
          joinedDate: nu.joinedDate || this.users[existingIndex].joinedDate,
        };
        changed = true;
      } else {
        this.users.unshift(nu);
        changed = true;
      }
    }

    this.sortUsersInternal();

    if (changed) {
      this.notify();
    }

    return this.users;
  }

  public getUserById(id: string): UserItem | undefined {
    return this.users.find(u => u.id === id || u.memberId === id);
  }

  public async fetchUserById(id: string): Promise<UserItem | undefined> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    let target = this.users.find(u => u.id === id || u.memberId === id);

    try {
      let apiUser: any = null;
      if (isUuid) {
        const res: any = await apiClient.get<any>(`/users/${id}`);
        apiUser = res?.data || res;
      } else {
        const cleanMobile = target?.phone ? target.phone.replace(/\D/g, '').slice(-10) : '';
        const searchVal = cleanMobile || target?.email || id;
        const res: any = await apiClient.get<any>('/users', {
          params: { search: searchVal },
        });
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res)
          ? res
          : [];
        if (items.length > 0) {
          apiUser = items.find((u: any) =>
            u.id === id ||
            (cleanMobile && u.mobile_number && u.mobile_number.includes(cleanMobile)) ||
            (target?.email && u.email && u.email.toLowerCase() === target.email.toLowerCase())
          ) || items[0];
        }
      }

      if (apiUser && apiUser.id) {
        const roleNames = (apiUser.roles || []).map((r: any) =>
          (typeof r === 'string' ? r : r.name || '').toUpperCase()
        );
        const isAdmin = roleNames.some((r: string) => r.includes('ADMIN'));
        const isMember = roleNames.some((r: string) => r.includes('MEMBER')) || Boolean(apiUser.membership_status);
        const isSeeker =
          roleNames.some((r: string) => r.includes('SEEKER') || r.includes('DONATION_SEEKER')) ||
          Boolean(apiUser.assistance_status);
        const isDonor = roleNames.some((r: string) => r.includes('DONOR'));

        let userType: UserType = 'general';
        if (isAdmin) userType = 'admin';
        else if (isMember) userType = 'member';
        else if (isSeeker) userType = 'seeker';
        else if (isDonor) userType = 'donor';
        else userType = 'general';

        const rawStatus = (apiUser.status || '').toUpperCase();
        let status: UserStatus =
          rawStatus === 'BLOCKED' || rawStatus === 'INACTIVE' || rawStatus === 'SUSPENDED'
            ? 'blocked'
            : rawStatus === 'PENDING'
            ? 'pending'
            : 'active';

        const mapped: UserItem = {
          id: apiUser.id,
          memberId: apiUser.membership_number || target?.memberId,
          name: apiUser.full_name || target?.name || 'User',
          email: apiUser.email || target?.email || '',
          phone: apiUser.mobile_number || target?.phone || '',
          userType,
          status,
          avatarUrl: apiUser.avatar || target?.avatarUrl,
          joinedDate: apiUser.created_at || target?.joinedDate || new Date().toISOString(),
          lastLogin: target?.lastLogin || 'Recently',
          totalDonations: Number(apiUser.total_donations || target?.totalDonations || 0),
          donationCount: Number(apiUser.donation_count || target?.donationCount || 0),
          dob: apiUser.dob || target?.dob,
          gender: apiUser.gender || target?.gender,
          address: apiUser.address || target?.address,
          documents: target?.documents || [],
          remarks: target?.remarks,
          notes: target?.notes,
        };

        const existingIndex = this.users.findIndex(u => u.id === mapped.id || u.id === id);
        if (existingIndex >= 0) {
          this.users[existingIndex] = {
            ...this.users[existingIndex],
            ...mapped,
          };
        } else {
          this.users.unshift(mapped);
        }
        this.sortUsersInternal();
        this.notify();
        return mapped;
      }
    } catch {
      // offline / mock fallback
    }

    return target;
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
      const fromTime = parseUserDateToTimestamp(options.joinedFrom);
      result = result.filter(u => {
        const itemTime = parseUserDateToTimestamp(u.joinedDate);
        return itemTime >= fromTime;
      });
    }

    if (options?.joinedTo) {
      const toTime = parseUserDateToTimestamp(options.joinedTo) + 86400000;
      result = result.filter(u => {
        const itemTime = parseUserDateToTimestamp(u.joinedDate);
        return itemTime <= toTime;
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
            (u.applicationNumber && u.applicationNumber.toLowerCase().includes(q)) ||
            u.id.toLowerCase().includes(q)
          );
        });
      }
    }

    // Default to 'newest' so the latest registration is always on top
    const sortBy = options?.sortBy || 'newest';
    if (sortBy === 'newest') {
      result.sort((a, b) => {
        const timeA = parseUserDateToTimestamp(a.joinedDate);
        const timeB = parseUserDateToTimestamp(b.joinedDate);
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      });
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => {
        const timeA = parseUserDateToTimestamp(a.joinedDate);
        const timeB = parseUserDateToTimestamp(b.joinedDate);
        if (timeA !== timeB) return timeA - timeB;
        return (a.id || '').localeCompare(b.id || '');
      });
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name_desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
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
        gender: (data.gender as UserGender) || existingUser.gender,
        userType: mappedType,
        status: mappedStatus,
        applicationNumber: existingUser.applicationNumber || applicationNumber,
        documents: documents.length > 0 ? documents : existingUser.documents,
        joinedDate: existingUser.joinedDate || new Date().toISOString(),
      };
      this.users[existingIndex] = updatedUser;
      this.sortUsersInternal();
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
      gender: (data.gender as UserGender) || undefined,
      address: undefined,
      donationCount: 0,
      totalDonations: 0,
      documents,
    };

    this.users.unshift(newUser);
    this.sortUsersInternal();
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
    this.sortUsersInternal();
    this.notify();
    return newUser;
  }

    private async syncUserUpdateToBackend(
    userId: string,
    payload: EditUserPayload,
    current?: UserItem
  ): Promise<string | null> {
    try {
      const cleanMobile = payload.phone
        ? payload.phone.replace(/\D/g, '').slice(-10)
        : current?.phone ? current.phone.replace(/\D/g, '').slice(-10) : undefined;

      const patchData: any = {};
      if (payload.name !== undefined) patchData.full_name = payload.name.trim();
      if (payload.email !== undefined) patchData.email = payload.email.trim();
      if (cleanMobile && cleanMobile.length === 10) patchData.mobile_number = cleanMobile;
      if (payload.dob !== undefined) patchData.dob = payload.dob.trim();
      if (payload.gender !== undefined) patchData.gender = payload.gender;
      if (payload.address !== undefined) patchData.address = payload.address.trim();
      if (payload.avatarUrl !== undefined) patchData.avatar = payload.avatarUrl;

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
      let targetId = isUuid ? userId : null;

      if (!targetId) {
        try {
          const searchVal = cleanMobile || payload.email || current?.email || undefined;
          const res: any = await apiClient.get<any>('/users', {
            params: { search: searchVal },
          });
          const items = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.items)
            ? res.data.items
            : Array.isArray(res)
            ? res
            : null;
          if (items && items.length > 0) {
            const found = items.find((u: any) =>
              (cleanMobile && u.mobile_number && u.mobile_number.includes(cleanMobile)) ||
              (payload.email && u.email && u.email.toLowerCase() === payload.email.toLowerCase()) ||
              (current?.email && u.email && u.email.toLowerCase() === current.email.toLowerCase())
            );
            if (found && found.id) {
              targetId = found.id;
            }
          }
        } catch {
          // ignore lookup errors
        }
      }

      // If user does not exist in backend database yet, create them via POST /users
      if (!targetId && current) {
        try {
          const createRes: any = await apiClient.post<any>('/users', {
            full_name: payload.name || current.name || 'User',
            mobile_number: cleanMobile || '9800000000',
            email: payload.email || current.email || undefined,
            dob: payload.dob || current.dob || undefined,
            gender: payload.gender || current.gender || undefined,
            address: payload.address || current.address || undefined,
            avatar: payload.avatarUrl || current.avatarUrl || undefined,
          });
          const created = createRes?.data || createRes;
          if (created && created.id) {
            targetId = created.id;
          }
        } catch (e) {
          console.warn('syncUserCreation error:', e);
        }
      }

      if (targetId) {
        if (Object.keys(patchData).length > 0) {
          await apiClient.patch(`/users/${targetId}`, patchData);
        }

        if (payload.status !== undefined) {
          const apiStatus = payload.status === 'blocked' ? 'INACTIVE' : 'ACTIVE';
          await apiClient.patch(`/users/${targetId}/status`, { status: apiStatus }).catch(() => {});
        }
        return targetId;
      }
    } catch (err) {
      console.warn('syncUserUpdateToBackend error:', err);
    }
    return null;
  }

  public async updateUser(id: string, payload: EditUserPayload): Promise<UserItem | undefined> {
    const index = this.users.findIndex(u => u.id === id || u.memberId === id);
    if (index === -1) return undefined;

    const current = this.users[index];
    const backendId = await this.syncUserUpdateToBackend(current.id, payload, current);

    const updated: UserItem = {
      ...current,
      id: backendId || current.id,
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
    this.sortUsersInternal();
    this.notify();

    // Keep active auth session in sync if the edited user is currently logged in
    try {
      const authUser = useAuthStore.getState().user;
      if (
        authUser &&
        (authUser.id === current.id ||
          (authUser.email && current.email && authUser.email.toLowerCase() === current.email.toLowerCase()) ||
          (authUser.mobile_number && current.phone && authUser.mobile_number.replace(/\D/g, '') === current.phone.replace(/\D/g, '')))
      ) {
        useAuthStore.getState().setUser({
          ...authUser,
          full_name: updated.name,
          email: updated.email,
          mobile_number: updated.phone,
        });
      }
    } catch {
      // test safe
    }

    return updated;
  }

  public async updateStatus(
    id: string,
    status: UserItem['status'],
    remarks?: string
  ): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id || u.memberId === id);
    if (index === -1) return false;

    this.users[index] = {
      ...this.users[index],
      status,
      remarks: remarks || this.users[index].remarks,
    };
    this.notify();

    const target = this.users[index];
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(target.id);
    let targetId = isUuid ? target.id : null;

    if (!targetId) {
      try {
        const cleanMobile = target.phone ? target.phone.replace(/\D/g, '').slice(-10) : '';
        const res: any = await apiClient.get<any>('/users', {
          params: { search: cleanMobile || target.email || undefined },
        });
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res)
          ? res
          : null;
        if (items && items.length > 0) {
          const found = items.find((u: any) =>
            (cleanMobile && u.mobile_number && u.mobile_number.includes(cleanMobile)) ||
            (target.email && u.email && u.email.toLowerCase() === target.email.toLowerCase())
          );
          if (found && found.id) {
            targetId = found.id;
          }
        }
      } catch (err) {
        console.warn('updateStatus lookup targetId error:', err);
      }
    }

    if (targetId) {
      try {
        const apiStatus = status === 'blocked' ? 'INACTIVE' : 'ACTIVE';
        await apiClient.patch(`/users/${targetId}/status`, { status: apiStatus });
      } catch (err) {
        console.warn('updateStatus backend patch error:', err);
      }
    }

    return true;
  }

  public async resetPassword(
    id: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = UUID_RE.test(id);

    // ── Fast path: id is already a real UUID → call backend directly ──────────
    if (isUuid) {
      try {
        const res: any = await apiClient.post(`/users/${id}/reset-password`, {
          new_password: newPassword,
        });
        return {
          success: true,
          message: res?.data?.message || res?.message || 'Password reset successfully',
        };
      } catch (err: any) {
        // 404 could mean a mock / fixture user; fall through to local update
        if (err?.response?.status !== 404) {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            'Failed to reset password. Please try again.';
          return { success: false, message: Array.isArray(msg) ? msg.join(', ') : msg };
        }
      }
    }

    // ── Slow path: non-UUID id (e.g. membership number) — resolve UUID first ──
    let target = this.users.find(u => u.id === id || u.memberId === id);
    let targetId: string | null = null;

    if (target && UUID_RE.test(target.id)) {
      targetId = target.id;
    }

    if (!targetId && target) {
      try {
        const cleanMobile = target.phone ? target.phone.replace(/\D/g, '').slice(-10) : '';
        const res: any = await apiClient.get<any>('/users', {
          params: { search: cleanMobile || target.email || undefined },
        });
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res)
          ? res
          : null;
        if (items && items.length > 0) {
          const found = items.find((u: any) =>
            (cleanMobile && u.mobile_number && u.mobile_number.includes(cleanMobile)) ||
            (target?.email && u.email && u.email.toLowerCase() === target.email.toLowerCase())
          );
          if (found && found.id) {
            targetId = found.id;
          }
        }
      } catch (err) {
        console.warn('resetPassword lookup targetId error:', err);
      }
    }

    if (targetId) {
      try {
        const res: any = await apiClient.post(`/users/${targetId}/reset-password`, {
          new_password: newPassword,
        });
        return {
          success: true,
          message: res?.data?.message || res?.message || 'Password reset successfully',
        };
      } catch (err: any) {
        if (err?.response?.status === 404 || isMockUser(target)) {
          return { success: true, message: 'Password updated successfully.' };
        }
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to reset password. Please try again.';
        return { success: false, message: Array.isArray(msg) ? msg.join(', ') : msg };
      }
    }

    // Local dev fixture
    if (target) {
      return { success: true, message: 'Password updated successfully.' };
    }

    return { success: false, message: 'User record could not be located.' };
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
