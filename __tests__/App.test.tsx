import React from 'react';
import ReactTestRenderer, { ReactTestInstance } from 'react-test-renderer';
import App from '../App';

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

test('renders the HRSJM app (Members screen) correctly', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });
  const text = collectText(tree!.root)
    .join('')
    .replace(/\s+/g, ' ');
  expect(text).toContain('Members');
  expect(text).toContain('Aman Shaikh');
});
