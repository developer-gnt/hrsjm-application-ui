import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MembershipApplicationDetailsScreen } from '../src/features/admin/membershipApplications';

describe('MembershipApplicationDetailsScreen Phase 3 Tests', () => {
  const renderDetailsScreen = async (props = {}) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <MembershipApplicationDetailsScreen
            applicationId="APP20260915001"
            onBack={jest.fn()}
            onStatusPress={jest.fn()}
            {...props}
          />
        </SafeAreaProvider>
      );
    });
    return renderer!;
  };

  it('renders application details header and applicant summary card', async () => {
    const renderer = await renderDetailsScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Membership Application Details' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Aman Shaikh' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findByProps({ children: 'APP20260915001' })).toBeDefined();
    expect(root.findAllByProps({ children: 'Individual Membership' }).length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ children: 'Approved' }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders the 3 tabs: Application Details, Documents, and Activity Log', async () => {
    const renderer = await renderDetailsScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Application Details' })).toBeDefined();
    expect(root.findByProps({ children: 'Documents' })).toBeDefined();
    expect(root.findByProps({ children: 'Activity Log' })).toBeDefined();
  });

  it('renders personal information fields inside the Application Details tab by default', async () => {
    const renderer = await renderDetailsScreen();
    const root = renderer.root;

    expect(root.findByProps({ children: 'Personal & Membership Details' })).toBeDefined();
    expect(root.findByProps({ children: 'Full Name' })).toBeDefined();
    expect(root.findByProps({ children: 'Date of Birth' })).toBeDefined();
    expect(root.findByProps({ children: 'Gender' })).toBeDefined();
    expect(root.findByProps({ children: "Father's Name" })).toBeDefined();
    expect(root.findByProps({ children: 'Phone Number' })).toBeDefined();
    expect(root.findByProps({ children: 'Email Address' })).toBeDefined();
    expect(root.findByProps({ children: 'Address' })).toBeDefined();
    expect(root.findByProps({ children: 'Occupation' })).toBeDefined();
    expect(root.findByProps({ children: 'Membership Type' })).toBeDefined();
  });

  it('switches to Documents tab and renders submitted documents', async () => {
    const renderer = await renderDetailsScreen();
    const root = renderer.root;

    const tabs = root.findAllByProps({ accessibilityRole: 'tab' });
    const docsTab = tabs.find(tab => {
      const texts = tab.findAllByType(Text);
      return texts.some(t => String(t.props.children || '') === 'Documents');
    });
    expect(docsTab).toBeDefined();

    await act(async () => {
      docsTab!.props.onPress();
    });

    expect(root.findByProps({ children: 'Aadhaar Card' })).toBeDefined();
    expect(root.findByProps({ children: 'Aadhaar_AmanShaikh.pdf' })).toBeDefined();
  });

  it('switches to Activity Log tab and renders timeline items', async () => {
    const renderer = await renderDetailsScreen();
    const root = renderer.root;

    const tabs = root.findAllByProps({ accessibilityRole: 'tab' });
    const activityTab = tabs.find(tab => {
      const texts = tab.findAllByType(Text);
      return texts.some(t => String(t.props.children || '') === 'Activity Log');
    });
    expect(activityTab).toBeDefined();

    await act(async () => {
      activityTab!.props.onPress();
    });

    expect(root.findByProps({ children: 'Application Audit History' })).toBeDefined();
    expect(root.findByProps({ children: 'Application Approved' })).toBeDefined();
    expect(root.findByProps({ children: 'Application Submitted' })).toBeDefined();
  });

  it('renders bottom bar with Back button and Application Status action button', async () => {
    const onBackMock = jest.fn();
    const renderer = await renderDetailsScreen({ onBack: onBackMock });
    const root = renderer.root;

    expect(root.findByProps({ children: 'Application Status' })).toBeDefined();

    const backButton = root.findByProps({ accessibilityLabel: 'Go back to list' });
    expect(backButton).toBeDefined();

    await act(async () => {
      backButton.props.onPress();
    });

    expect(onBackMock).toHaveBeenCalled();
  });

  it('does NOT render a "Download Application PDF" button per requirements', async () => {
    const renderer = await renderDetailsScreen();
    const root = renderer.root;

    expect(root.findAllByProps({ children: 'Download Application PDF' }).length).toBe(0);
  });
});
