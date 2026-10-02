import React from 'react';
import ReactTestRenderer, { ReactTestInstance } from 'react-test-renderer';
import { MembersScreen } from '../src/features/admin/members/screens/MembersScreen';

type PreviewState = 'default' | 'loading' | 'empty' | 'error';

const renderScreen = async (props?: { previewState?: PreviewState }) => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<MembersScreen {...props} />);
  });
  return tree!;
};

/** Collects all rendered Text strings (avoids JSON.stringify on animated style nodes).
 *  Joins without separators first so JSX-interpolated Text fragments recombine
 *  ("352" + "days" + "left" → "352 days left"), then collapses whitespace. */
const collectText = (node: ReactTestInstance): string[] => {
  const texts: string[] = [];
  node.children.forEach(child => {
    if (typeof child === 'string') {
      texts.push(child);
    } else {
      texts.push(...collectText(child as ReactTestInstance));
    }
  });
  return texts;
};

const renderedText = (tree: ReactTestRenderer.ReactTestRenderer): string =>
  collectText(tree.root)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

describe('MembersScreen (mock-data UI build)', () => {
  test('renders header, statistics, controls and member rows', async () => {
    const tree = await renderScreen();
    const text = renderedText(tree);

    expect(text).toContain('HRSJM');
    expect(text).toContain('Add Member');
    expect(text).toContain('2,486');
    expect(text).toContain('Expiring Soon (284)');
    expect(text).toContain('Aman Shaikh');
    expect(text).toContain('HRSJM202600123');
    expect(text).toContain('352 days left');
    expect(text).toContain('Manage and view all registered members.');
  });

  test('renders skeleton placeholders instead of rows while loading', async () => {
    const tree = await renderScreen({ previewState: 'loading' });
    const text = renderedText(tree);

    expect(text).not.toContain('Aman Shaikh');
    expect(text).toContain('2,486'); // stats stay visible as loading skeletons
  });

  test('renders the empty-members state', async () => {
    const tree = await renderScreen({ previewState: 'empty' });
    const text = renderedText(tree);

    expect(text).toContain('No members yet');
    expect(text).not.toContain('Aman Shaikh');
  });

  test('renders the error state with a retry action', async () => {
    const tree = await renderScreen({ previewState: 'error' });
    const text = renderedText(tree);

    expect(text).toContain("Couldn't load members");
    expect(text).toContain('Retry');
    expect(text).not.toContain('Aman Shaikh');
  });

  test('shows the search no-results state and clears the search', async () => {
    const tree = await renderScreen();

    const input = tree.root.find(node => node.props.testID === 'members-search-input');
    await ReactTestRenderer.act(async () => {
      input.props.onChangeText('zzz-no-match');
    });

    expect(renderedText(tree)).toContain('No members found');

    const clearSearch = tree.root.find(
      node => node.props.accessibilityLabel === 'Clear search'
    );
    await ReactTestRenderer.act(async () => {
      clearSearch.props.onPress();
    });

    expect(renderedText(tree)).toContain('Aman Shaikh');
  });

  test('filters rows by status tab', async () => {
    const tree = await renderScreen();

    const expiringTab = tree.root.find(node => node.props.testID === 'members-tab-expiring_soon');
    await ReactTestRenderer.act(async () => {
      expiringTab.props.onPress();
    });

    const text = renderedText(tree);
    expect(text).toContain('Sanjya Khan');
    expect(text).not.toContain('Aman Shaikh');
    expect(text).toContain('12 days left');
  });
});
