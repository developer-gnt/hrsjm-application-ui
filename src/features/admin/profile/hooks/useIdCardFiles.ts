/**
 * Shared download/share behaviour for the member ID card. Both the My
 * Profile screen (inline card) and the My ID Card detail page use this
 * hook so the real-PDF delivery logic exists in exactly one place.
 */
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { AdminProfile } from '../types/profile.types';
import {
  downloadIdCardPdfNative,
  downloadIdCardPdfWeb,
  isWebEnvironment,
  shareIdCardPdfNative,
  shareIdCardPdfWeb,
} from '../utils/idCardDocument';

export type IdCardAction = 'download' | 'share' | null;

interface UseIdCardFilesOptions {
  onMessage: (message: string) => void;
}

export const useIdCardFiles = ({ onMessage }: UseIdCardFilesOptions) => {
  const [busyAction, setBusyAction] = useState<IdCardAction>(null);

  const download = useCallback(
    async (profile: AdminProfile) => {
      if (busyAction) return;
      setBusyAction('download');
      try {
        if (Platform.OS !== 'web' || !isWebEnvironment()) {
          const result = await downloadIdCardPdfNative(profile);
          onMessage(
            result === 'downloaded'
              ? 'ID card PDF saved to your device downloads folder.'
              : 'ID card PDF opened. Use the save option in the preview to keep it on your device.',
          );
        } else {
          const result = await downloadIdCardPdfWeb(profile);
          onMessage(
            result === 'downloaded'
              ? 'ID card PDF downloaded.'
              : 'Your browser does not allow direct file saving. The ID card has been opened so you can save it.',
          );
        }
      } catch {
        onMessage('Unable to generate the ID card PDF. Please try again.');
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, onMessage],
  );

  const share = useCallback(
    async (profile: AdminProfile) => {
      if (busyAction) return;
      setBusyAction('share');
      try {
        if (Platform.OS !== 'web' || !isWebEnvironment()) {
          // Native share sheet receives the actual PDF file; a user
          // cancel is normal behaviour and returns 'cancelled' silently.
          await shareIdCardPdfNative(profile);
        } else {
          const result = await shareIdCardPdfWeb(profile);
          if (result === 'opened') {
            onMessage(
              'File sharing is not available in this browser. The ID card PDF has been opened so you can save or attach it.',
            );
          }
        }
      } catch (error: any) {
        onMessage(
          error?.message || 'Unable to share ID card. Please try again.',
        );
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, onMessage],
  );

  return { download, share, busyAction };
};
