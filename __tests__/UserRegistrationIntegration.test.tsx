import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UsersListScreen, usersStore } from '../src/features/admin/users';
import { updateRegistrationState, resetRegistrationState } from '../src/features/auth';
import { membershipApplicationsStore } from '../src/features/admin/membershipApplications';

describe('User Registration to Dynamic Users List Integration Tests', () => {
  beforeEach(async () => {
    await act(async () => {
      usersStore.clearUsers();
      resetRegistrationState();
    });
  });

  const renderScreen = async (props = {}) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <UsersListScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('initially displays clean empty state when no users have registered', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'No Registered Users' })).toBeDefined();
    expect(root.findAllByProps({ children: '0' }).length).toBeGreaterThanOrEqual(4);
    expect(root.findByProps({ children: 'All Users (0)' })).toBeDefined();
  });

  it('automatically adds a newly registered General User to Users List with Active status', async () => {
    // 1. Simulate registration of General User
    await act(async () => {
      updateRegistrationState({
        fullName: 'Vikram Malhotra',
        email: 'vikram.malhotra@example.com',
        phone: '+91 98220 11223',
        dob: '15 Aug 1991',
        accountType: 'general',
        accountTypeLabel: 'General User',
      });
      usersStore.registerUserFromRegistration({
        fullName: 'Vikram Malhotra',
        email: 'vikram.malhotra@example.com',
        phone: '+91 98220 11223',
        dob: '15 Aug 1991',
        accountType: 'general',
      });
    });

    const renderer = await renderScreen();
    const root = renderer.root;

    // Check card details
    expect(root.findByProps({ children: 'Vikram Malhotra' })).toBeDefined();
    expect(root.findByProps({ children: 'vikram.malhotra@example.com' })).toBeDefined();
    expect(root.findByProps({ children: '+91 98220 11223' })).toBeDefined();
    expect(root.findByProps({ children: 'General User' })).toBeDefined();
    expect(root.findByProps({ children: 'Active' })).toBeDefined();

    // Check dynamic stats
    expect(root.findAllByProps({ children: '1' }).length).toBeGreaterThanOrEqual(1); // Total 1, Active 1
    expect(root.findByProps({ children: 'All Users (1)' })).toBeDefined();
    expect(root.findByProps({ children: 'General Users (1)' })).toBeDefined();
    expect(root.findByProps({ children: 'Members (0)' })).toBeDefined();
  });

  it('automatically adds a registered Member with document to Users List with Pending Verification status', async () => {
    // 1. Register Member with uploaded document
    await act(async () => {
      usersStore.registerUserFromRegistration({
        fullName: 'Pooja Sharma',
        email: 'pooja.sharma@example.com',
        phone: '+91 98330 44556',
        dob: '10 Nov 1994',
        accountType: 'member',
        selectedDocTitle: 'Aadhaar Card',
        uploadedFileName: 'pooja_aadhaar.pdf',
        uploadedFileSize: '1.5 MB',
        documents: [
          {
            id: 'aadhaar',
            title: 'Aadhaar Card',
            name: 'pooja_aadhaar.pdf',
            formattedSize: '1.5 MB',
            sizeBytes: 1500000,
            type: 'application/pdf',
            status: 'ready',
          },
        ],
      });
    });

    const renderer = await renderScreen();
    const root = renderer.root;

    // Check card details
    expect(root.findByProps({ children: 'Pooja Sharma' })).toBeDefined();
    expect(root.findByProps({ children: 'pooja.sharma@example.com' })).toBeDefined();
    expect(root.findByProps({ children: 'Member' })).toBeDefined();
    expect(root.findByProps({ children: 'Pending' })).toBeDefined();

    // Check dynamic stats
    expect(root.findByProps({ children: 'Members (1)' })).toBeDefined();
    expect(root.findByProps({ children: 'Pending Verification' })).toBeDefined();
  });

  it('prevents duplicate records when registration is submitted multiple times with same email', async () => {
    await act(async () => {
      usersStore.registerUserFromRegistration({
        fullName: 'Sameer Verma',
        email: 'sameer.verma@example.com',
        phone: '+91 98111 22334',
        accountType: 'general',
      });
      // Second attempt
      usersStore.registerUserFromRegistration({
        fullName: 'Sameer Verma',
        email: 'sameer.verma@example.com',
        phone: '+91 98111 22334',
        accountType: 'general',
      });
    });

    const users = usersStore.getAllUsers();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('Sameer Verma');
  });

  it('updates member status to Active when admin approves application', async () => {
    let memberUser: any;
    await act(async () => {
      memberUser = usersStore.registerUserFromRegistration({
        fullName: 'Ramesh Patel',
        email: 'ramesh.patel@example.com',
        phone: '+91 98777 66554',
        accountType: 'member',
      });
    });

    expect(memberUser.status).toBe('pending');

    // Admin approves application
    await act(async () => {
      usersStore.updateStatusByEmailOrPhone(
        'ramesh.patel@example.com',
        '+91 98777 66554',
        'active'
      );
    });

    const updatedUser = usersStore.getUserById(memberUser.id);
    expect(updatedUser?.status).toBe('active');
  });
});
