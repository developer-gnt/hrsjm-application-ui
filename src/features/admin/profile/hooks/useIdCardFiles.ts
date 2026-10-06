import { useCallback, useState } from 'react';
import { AdminProfile } from '../types/profile.types';
import { ToastState } from '../components/ProfileToast';
import {
  downloadIdCardPdfNative,
  downloadIdCardPdfWeb,
  isWebEnvironment,
  prewarmIdCardPdf,
  shareIdCardPdfNative,
  shareIdCardPdfWeb,
} from '../utils/idCardDocument';

export type IdCardAction = 'download' | 'share' | null;

interface UseIdCardFilesOptions {
  onMessage: (message: string | ToastState) => void;
  profile?: AdminProfile;
}

export const useIdCardFiles = ({ onMessage, profile }: UseIdCardFilesOptions) => {
  const [busyAction, setBusyAction] = useState<IdCardAction>(null);

  // Background prewarm queue
  if (profile) {
    prewarmIdCardPdf(profile).catch(() => undefined);
  }

  const download = useCallback(
    async (targetProfile: AdminProfile) => {
      if (busyAction) return;
      setBusyAction('download');
      onMessage({ message: 'Downloading ID card PDF...', variant: 'loading' });
      try {
        if (isWebEnvironment()) {
          const result = await downloadIdCardPdfWeb(targetProfile);
          onMessage({
            message:
              result === 'downloaded'
                ? 'ID card PDF downloaded.'
                : 'ID card PDF opened.',
            variant: 'success',
          });
        } else {
          const result = await downloadIdCardPdfNative(targetProfile);
          onMessage({
            message:
              result === 'downloaded'
                ? 'ID card PDF saved to Downloads folder.'
                : 'ID card PDF opened in preview.',
            variant: 'success',
          });
        }
      } catch (err: any) {
        onMessage({
          message: err?.message || 'Unable to download ID card PDF.',
          variant: 'error',
        });
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, onMessage],
  );

  const share = useCallback(
    async (targetProfile: AdminProfile) => {
      if (busyAction) return;
      setBusyAction('share');
      onMessage({ message: 'Preparing ID card PDF...', variant: 'loading' });
      try {
        if (isWebEnvironment()) {
          const result = await shareIdCardPdfWeb(targetProfile);
          if (result === 'opened') {
            onMessage({
              message: 'ID card PDF opened. You can now save or attach it.',
              variant: 'success',
            });
          } else if (result === 'shared') {
            onMessage({
              message: 'ID card PDF shared successfully.',
              variant: 'success',
            });
          }
        } else {
          const result = await shareIdCardPdfNative(targetProfile);
          if (result === 'shared') {
            onMessage({
              message: 'ID card PDF shared successfully.',
              variant: 'success',
            });
          }
        }
      } catch (error: any) {
        onMessage({
          message: error?.message || 'Unable to share ID card.',
          variant: 'error',
        });
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, onMessage],
  );

  return { download, share, busyAction };
};
