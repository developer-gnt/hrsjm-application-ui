import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CreateEventScreen } from '../src/features/admin/content/events/screens/CreateEventScreen';

// Mock navigation & auth
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock('../src/core/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', full_name: 'Admin User', roles: [{ name: 'ADMIN' }] },
    isAuthenticated: true,
  }),
}));

jest.mock('../src/features/admin/content/events/hooks/useEvents', () => ({
  useCreateEvent: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useUpdateEvent: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

describe('Create Event Screen (Approved Wireframe Implementation)', () => {
  const renderScreen = () => {
    let tree: any;
    act(() => {
      tree = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <CreateEventScreen onCancel={jest.fn()} />
        </SafeAreaProvider>,
      );
    });
    return tree;
  };

  it('renders the 3 approved wireframe cards and no rich-text toolbar', () => {
    const tree = renderScreen();
    const root = tree.root;

    // Headings
    const texts = root.findAllByType(Text).map((t: any) => t.props.children);
    expect(texts).toContain('Basic Information');
    expect(texts).toContain('Event Image');
    expect(texts).toContain('Event Details');

    // Confirm that rich-text toolbar glyphs (B, I, U, etc.) DO NOT exist
    const toolbarGlyphs = ['B', 'I', 'U', '⋮≡', '🔗'];
    toolbarGlyphs.forEach(glyph => {
      const match = texts.find((t: any) => t === glyph);
      expect(match).toBeUndefined();
    });

    // Inputs
    const inputs = root.findAllByType(TextInput);
    const placeholders = inputs.map((i: any) => i.props.placeholder);
    expect(placeholders).toContain('Enter event title');
    expect(placeholders).toContain('Write event description...');
    expect(placeholders).toContain('Enter event location');

    // Description is a clean multiline text input
    const descInput = inputs.find((i: any) => i.props.placeholder === 'Write event description...');
    expect(descInput).toBeDefined();
    expect(descInput?.props.multiline).toBe(true);

    // Cover Image upload section text
    expect(texts).toContain('Tap to upload event image');
    expect(texts).toContain('Camera, Gallery, or Presets (JPG, PNG)');

    // Date and time placeholders
    expect(texts).toContain('Select event date');
    expect(texts).toContain('Select start time');
    expect(texts).toContain('Select end time');

    // Primary action button
    expect(texts).toContain('Create Event');
  });
});
