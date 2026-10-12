import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MemberDashboardDetailsScreen } from './MemberDashboardDetailsScreen';

const createScreen = () => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    }}
  >
    <MemberDashboardDetailsScreen
      membership={null}
      onBack={jest.fn()}
      onOpenMembershipInfo={jest.fn()}
      onOpenComplaint={jest.fn()}
      onOpenDonation={jest.fn()}
      onOpenEvents={jest.fn()}
      onOpenRights={jest.fn()}
      onOpenRight={jest.fn()}
      onOpenEvent={jest.fn()}
      onOpenHome={jest.fn()}
      onOpenAbout={jest.fn()}
      onOpenNews={jest.fn()}
      onOpenContact={jest.fn()}
    />
  </SafeAreaProvider>
);

describe('MemberDashboardDetailsScreen', () => {
  it('switches between overview, activity, learning and membership content', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await act(() => {
      tree = ReactTestRenderer.create(createScreen());
    });

    const selectTab = async (label: string, id: string) => {
      const tab = tree.root.find(
        node => node.props.testID === `member-dashboard-tab-${id}`,
      );
      await act(() => tab.props.onPress());
      return tree.root.findAllByType(Text).map(node => node.props.children);
    };

    expect(await selectTab('Overview', 'overview')).toContain('Membership Details');
    expect(await selectTab('My Activity', 'activity')).toContain(
      'Activity history unavailable',
    );
    expect(await selectTab('Learning', 'learning')).toContain('Rights Education');
    expect(await selectTab('Membership', 'membership')).toContain(
      'No membership record available',
    );
  });
});
