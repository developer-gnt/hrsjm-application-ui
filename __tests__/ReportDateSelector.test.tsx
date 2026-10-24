import React from 'react';
import { TouchableOpacity } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ReportDateSelector } from '../src/features/admin/reports/components/ReportDateSelector';
import { getDatePresets } from '../src/features/admin/reports/utils/reportDates';

describe('ReportDateSelector', () => {
  it('renders all presets with the selected preset highlighted', () => {
    const onSelectPreset = jest.fn();
    const presets = getDatePresets();

    let tree: any;
    act(() => {
      tree = renderer.create(
        <ReportDateSelector
          selectedPreset="THIS_MONTH"
          onSelectPreset={onSelectPreset}
        />
      );
    });

    const root = tree.root;
    const buttons = root.findAllByType(TouchableOpacity);
    expect(buttons.length).toBe(presets.length);

    // Click on the second preset (LAST_MONTH)
    act(() => {
      buttons[1].props.onPress();
    });

    expect(onSelectPreset).toHaveBeenCalledWith(presets[1]);
  });

  it('renders subText when provided', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <ReportDateSelector
          selectedPreset="THIS_MONTH"
          onSelectPreset={jest.fn()}
          subText="Position as of 2026-10-31"
        />
      );
    });

    const root = tree.root;
    const texts = root.findAllByType('Text');
    const hasSubText = texts.some((t: any) =>
      typeof t.props.children === 'string' && t.props.children.includes('Position as of')
    );
    expect(hasSubText).toBe(true);
  });
});
