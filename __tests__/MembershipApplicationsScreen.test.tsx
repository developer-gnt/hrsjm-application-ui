import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  MembershipApplicationsScreen,
  membershipApplicationsStore,
} from '../src/features/admin/membershipApplications';

describe('MembershipApplicationsScreen Phase 1 & 2 Tests', () => {
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
          <MembershipApplicationsScreen {...props} />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders without crashing and displays header title and subtitle', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Membership Applications' })).toBeDefined();
    expect(
      root.findByProps({
        children: 'Review, verify and manage membership applications.',
      })
    ).toBeDefined();
  });

  it('renders all 4 summary stat cards with correct labels', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    expect(root.findAllByProps({ children: 'Total Applications' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Under Review' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Approved' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Rejected' }).length).toBeGreaterThanOrEqual(1);
  });

  it('filters applications by search query (applicant name)', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const input = root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('Saniya');
    });

    expect(root.findByProps({ children: 'Saniya Khan' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Aman Shaikh' }).length).toBe(0);
  });

  it('filters applications by application ID', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const input = root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('APP20260912008');
    });

    expect(root.findByProps({ children: 'Faiza Ansari' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Aman Shaikh' }).length).toBe(0);
  });

  it('filters applications when a status tab is pressed', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const tabs = root.findAllByProps({ accessibilityRole: 'tab' });
    const rejectedTab = tabs.find(tab => {
      const texts = tab.findAllByType(Text);
      return texts.some(t => {
        const textContent = Array.isArray(t.props.children)
          ? t.props.children.join('')
          : String(t.props.children || '');
        return textContent.includes('Rejected');
      });
    });
    expect(rejectedTab).toBeDefined();

    await act(async () => {
      rejectedTab!.props.onPress();
    });

    expect(root.findByProps({ children: 'Faiza Ansari' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Aman Shaikh' }).length).toBe(0);
  });

  it('shows empty state when no applications match search query', async () => {
    const renderer = await renderScreen();
    const root = renderer.root;

    const input = root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('NonExistentNameXYZ');
    });

    expect(root.findByProps({ children: 'No Applications Found' })).toBeDefined();
    expect(root.findByProps({ children: 'Reset All Filters' })).toBeDefined();
  });

  it('updates store and listing when status changes', async () => {
    const renderer = await renderScreen();
    const appsBefore = membershipApplicationsStore.getApplications();
    const rejectedApp = appsBefore.find(a => a.status === 'rejected');
    expect(rejectedApp).toBeDefined();

    await act(async () => {
      membershipApplicationsStore.updateStatus(rejectedApp!.id, 'under_review');
    });

    const updatedApp = membershipApplicationsStore.getApplicationById(rejectedApp!.id);
    expect(updatedApp?.status).toBe('under_review');
  });
});
