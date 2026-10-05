/**
 * Local frontend state for the My Profile flow (UI phase — no API).
 *
 * Screens read the profile from this store and edit screens commit
 * updates through `updatePersonalInfo` / `updateAdminDetails`. Success
 * messages are staged here so the profile screen can toast them after
 * the edit screen navigates back. When the backend is ready, a service
 * layer can hydrate `profile` from `/api/v1` without touching the UI.
 */
import { create } from 'zustand';
import {
  AdminDetailsInput,
  AdminProfile,
  PersonalInfoInput,
} from './types/profile.types';

interface ProfileStore {
  profile: AdminProfile;
  /** One-shot success message staged for the profile screen toast. */
  stagedMessage: string | null;
  updatePersonalInfo: (input: PersonalInfoInput) => void;
  updateAdminDetails: (input: AdminDetailsInput) => void;
  stageMessage: (message: string) => void;
  consumeStagedMessage: () => string | null;
}

const initialProfile: AdminProfile = {
  accountName: 'Admin User',
  adminId: 'ADMIN001',
  fullName: 'Amaan Shaikh',
  email: 'admin@hrsjm.org',
  phone: '+91 98765 43210',
  role: 'Administrator',
  department: 'Management',
  accountStatus: 'Active',
  membershipType: 'Individual Member',
  memberId: 'HRSJM202600123',
  dateOfBirth: '12 Mar 2002',
  memberSince: '15 Sep 2026',
  validTill: '15 Sep 2027',
};

export const useProfileStore = create<ProfileStore>(set => ({
  profile: initialProfile,
  stagedMessage: null,
  updatePersonalInfo: input =>
    set(state => ({ profile: { ...state.profile, ...input } })),
  updateAdminDetails: input =>
    set(state => ({ profile: { ...state.profile, ...input } })),
  stageMessage: message => set({ stagedMessage: message }),
  consumeStagedMessage: () => {
    // Read through `set` so the store type is not referenced inside its
    // own initializer (keeps TypeScript inference acyclic).
    let message: string | null = null;
    set(state => {
      message = state.stagedMessage;
      return { stagedMessage: null };
    });
    return message;
  },
}));
