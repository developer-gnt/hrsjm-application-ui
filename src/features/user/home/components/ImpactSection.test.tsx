import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ImpactSection } from './ImpactSection';

describe('ImpactSection', () => {
  it('renders updated numeric statistics using Indian number formatting', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await act(() => {
      tree = ReactTestRenderer.create(
        <ImpactSection
          stats={{
            members: 100079,
            complaintsHandled: 200000,
            casesResolved: 199800,
          }}
        />,
      );
    });

    expect(
      tree.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(expect.arrayContaining(['1,00,079', '2,00,000', '1,99,800']));

    await act(() => {
      tree.update(
        <ImpactSection
          stats={{
            members: 125000,
            complaintsHandled: 215500,
            casesResolved: 201250,
          }}
        />,
      );
    });

    expect(
      tree.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(expect.arrayContaining(['1,25,000', '2,15,500', '2,01,250']));
  });
});
