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

const STORAGE_KEY = 'hrsjm_registered_users';

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
    this.users = this.loadPersistedUsers();
  }

  private loadPersistedUsers(): UserItem[] {
    try {
      const storage = getStorage();
      if (storage) {
        const raw = storage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback to empty if parsing fails
    }
    return [];
  }

  private persistUsers(): void {
    try {
      const storage = getStorage();
      if (storage) {
        storage.setItem(STORAGE_KEY, JSON.stringify(this.users));
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

    for (const u of this.users) {
      if (u.status === 'active') active++;
      else if (u.status === 'pending') pending++;
      else if (u.status === 'blocked') blocked++;

      if (u.userType === 'member') members++;
      else if (u.userType === 'seeker') seekers++;
      else if (u.userType === 'donor') donors++;
      else if (u.userType === 'general') general++;
    }

    return {
      total: this.users.length,
      active,
      pending,
      blocked,
      membersCount: members,
      seekersCount: seekers,
      donorsCount: donors,
      generalCount: general,
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
      accountType === 'member'
        ? 'member'
        : accountType === 'seeker'
        ? 'seeker'
        : accountType === 'donor'
        ? 'donor'
        : 'general';

    // Verification rule: General Users are active immediately, Members and Seekers require document verification
    const mappedStatus: UserStatus = mappedType === 'general' ? 'active' : 'pending';

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
    const nextNum = this.users.length + 1;
    const id = `user-${String(nextNum).padStart(3, '0')}`;
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
