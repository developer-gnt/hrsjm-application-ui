import { useProfileStore } from '../../src/features/admin/profile/profileStore';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { apiClient } from '../../src/core/api/client';
import {
  generateIdCardPdf,
  downloadIdCardPdfWeb,
  idCardFileName,
} from '../../src/features/admin/profile/utils/idCardDocument';

jest.mock('../../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('My Profile & ID Card Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'u-12345',
        full_name: 'Test New User',
        email: 'testuser@hrsjm.org',
        mobile_number: '+91 91234 56789',
        status: 'ACTIVE',
        roles: [{ id: 'r-1', name: 'DONATION_SEEKER' }],
        created_at: '2026-10-01T10:00:00Z',
        updated_at: '2026-10-01T10:00:00Z',
      },
      status: 'authenticated',
    });
  });

  it('dynamically loads logged in user profile and generates member ID like HRSJM-00001', async () => {
    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          id: 'u-12345',
          full_name: 'Test New User',
          email: 'testuser@hrsjm.org',
          mobile_number: '+91 91234 56789',
          status: 'ACTIVE',
          roles: [{ id: 'r-1', name: 'DONATION_SEEKER' }],
          created_at: '2026-10-01T10:00:00Z',
          updated_at: '2026-10-01T10:00:00Z',
        });
      }
      return Promise.resolve(null);
    });

    await useProfileStore.getState().fetchProfile();

    const profile = useProfileStore.getState().profile;
    expect(profile.fullName).toBe('Test New User');
    expect(profile.email).toBe('testuser@hrsjm.org');
    expect(profile.phone).toBe('+91 91234 56789');
    expect(profile.role).toBe('Donar Seeker');
    expect(profile.memberId).toMatch(/^HRSJM-\d{5}$/);
    expect(profile.accountStatus).toBe('Active');
  });

  it('loads existing membership number from backend when available', async () => {
    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          id: 'u-12345',
          full_name: 'Test New User',
          email: 'testuser@hrsjm.org',
          mobile_number: '+91 91234 56789',
          status: 'ACTIVE',
          roles: [{ id: 'r-1', name: 'DONOR' }],
          created_at: '2026-10-01T10:00:00Z',
          updated_at: '2026-10-01T10:00:00Z',
        });
      }
      if (url === '/memberships/my') {
        return Promise.resolve({
          membership_number: 'HRSJM-00042',
          start_date: '2026-09-15',
          expiry_date: '2027-09-15',
          category: { name: 'Individual Member' },
        });
      }
      return Promise.resolve(null);
    });

    await useProfileStore.getState().fetchProfile();

    const profile = useProfileStore.getState().profile;
    expect(profile.memberId).toBe('HRSJM-00042');
    expect(profile.membershipType).toBe('Individual Member');
  });

  it('updates personal information and calls backend /auth/me', async () => {
    (apiClient.patch as jest.Mock).mockResolvedValueOnce({ success: true });

    await useProfileStore.getState().updatePersonalInfo({
      fullName: 'Updated Name',
      email: 'updated@hrsjm.org',
      phone: '+91 91234 56789',
    });

    expect(apiClient.patch).toHaveBeenCalledWith('/auth/me', {
      full_name: 'Updated Name',
      email: 'updated@hrsjm.org',
      mobile_number: '+91 91234 56789',
      phone: '+91 91234 56789',
    });

    const profile = useProfileStore.getState().profile;
    expect(profile.fullName).toBe('Updated Name');
    expect(profile.email).toBe('updated@hrsjm.org');
    expect(profile.phone).toBe('+91 91234 56789');
  });

  it('updates admin role among the 4 allowed roles without department', async () => {
    await useProfileStore.getState().updateAdminDetails({
      role: 'Member',
      accountStatus: 'Active',
    });

    const profile = useProfileStore.getState().profile;
    expect(profile.role).toBe('Member');
    expect(profile.accountStatus).toBe('Active');
    expect((profile as any).department).toBeUndefined();
  });

  it('generates ID card PDF and filename correctly', () => {
    const profile = useProfileStore.getState().profile;
    const fileName = idCardFileName(profile);
    expect(fileName).toBe('HRSJM_Member_Updated_Name.pdf');

    const pdf = generateIdCardPdf(profile);
    expect(pdf).toBeDefined();
    expect(typeof pdf.output).toBe('function');
  });

  it('downloads ID card PDF instantly on web environment', async () => {
    const profile = useProfileStore.getState().profile;
    const result = await downloadIdCardPdfWeb(profile);
    expect(result).toBe('downloaded');
  });
});
