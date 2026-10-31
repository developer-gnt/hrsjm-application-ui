import { Alert, Platform, Share } from 'react-native';

export interface ShareContentOptions {
  title: string;
  message: string;
  url?: string;
}

/**
 * Universal share function — works on Web (navigator.share / clipboard fallback)
 * and Native (Share.share).
 */
export async function shareContent(options: ShareContentOptions): Promise<void> {
  const { title, message, url } = options;
  const shareText = url ? `${message}\n${url}` : message;

  if (Platform.OS === 'web') {
    // Web: try native Web Share API first
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title, text: message, url });
        return;
      } catch {
        // User cancelled or share not supported — fall through to clipboard
      }
    }

    // Fallback: clipboard
    if (nav?.clipboard) {
      try {
        await nav.clipboard.writeText(shareText);
        Alert.alert('Copied!', 'Content copied to clipboard.');
        return;
      } catch {
        // Clipboard not available
      }
    }

    Alert.alert('Share', shareText);
    return;
  }

  // Native
  try {
    await Share.share({
      title,
      message: shareText,
    });
  } catch {
    Alert.alert('Share', 'Unable to share at this time.');
  }
}
