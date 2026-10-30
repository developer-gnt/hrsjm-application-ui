import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { AboutScreen } from '../src/features/user/about/screens/AboutScreen';
import { ABOUT_CONTENT } from '../src/features/user/about/data/about-content';
import { aboutService } from '../src/features/user/about/services/about.service';

jest.mock('../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({ data: { items: [] } }),
    post: jest.fn().mockResolvedValue({ data: {} }),
  },
}));

jest.mock('../src/features/member/services/causes.service', () => ({
  causesService: {
    getCauses: jest.fn().mockResolvedValue([]),
  },
}));

describe('AboutScreen Dynamic & Separate Page Navigation', () => {
  it('opens separate page for Human-rights Monitoring when clicking the card or arrow', async () => {
    const onOpenWhatWeDo = jest.fn();
    let renderer!: ReactTestRenderer;

    await act(async () => {
      renderer = create(<AboutScreen onOpenWhatWeDo={onOpenWhatWeDo} />);
    });

    const monitoringCard = renderer.root.findByProps({
      accessibilityLabel: 'Human-rights Monitoring — Track, document and highlight rights violations.',
    });
    expect(monitoringCard).toBeDefined();

    await act(async () => {
      monitoringCard.props.onPress();
    });

    expect(onOpenWhatWeDo).toHaveBeenCalledWith('human-rights-monitoring');
  });

  it('navigates to each of the 9 separate pages on selection', async () => {
    const onOpenWhatWeDo = jest.fn();
    let renderer!: ReactTestRenderer;

    await act(async () => {
      renderer = create(<AboutScreen onOpenWhatWeDo={onOpenWhatWeDo} />);
    });

    const expectedMap: Record<string, string> = {
      'Human-rights Monitoring': 'human-rights-monitoring',
      'Awareness Campaigns': 'awareness-campaigns',
      'Workshops & Training': 'workshops-training',
      'Community Activities': 'community-activities',
      'Leadership Development': 'leadership-development',
      'Advocacy & Awareness': 'advocacy-awareness',
      'Research & Rights Education': 'research-rights-education',
      'Legal Rights Awareness': 'legal-rights-awareness',
      'Other Work Areas': 'other-work-areas',
    };

    for (const [title, expectedId] of Object.entries(expectedMap)) {
      const card = renderer.root.findAllByProps({
        accessibilityLabel: `Open details for ${title}`,
      })[0];
      expect(card).toBeDefined();

      await act(async () => {
        card.props.onPress();
      });

      expect(onOpenWhatWeDo).toHaveBeenCalledWith(expectedId);
    }
  });

  it('renders dedicated details page inline when onOpenWhatWeDo is not provided (standalone mode)', async () => {
    let renderer!: ReactTestRenderer;

    await act(async () => {
      renderer = create(<AboutScreen />);
    });

    // Tap Human-rights Monitoring arrow
    const arrowButton = renderer.root.findAllByProps({
      accessibilityLabel: 'Open details for Human-rights Monitoring',
    })[0];
    expect(arrowButton).toBeDefined();

    await act(async () => {
      arrowButton.props.onPress();
    });

    // It should now render WhatWeDoDetailScreen with title "Human-rights Monitoring"
    const headings = renderer.root.findAllByProps({
      children: 'Human-rights Monitoring',
    });
    expect(headings.length).toBeGreaterThan(0);

    const overview = renderer.root.findAllByProps({
      children: 'Overview',
    });
    expect(overview.length).toBeGreaterThan(0);
  });
});

