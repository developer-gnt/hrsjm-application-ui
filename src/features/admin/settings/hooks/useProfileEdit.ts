import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../../../core/api/client';
import { useAuthStore } from '../../../auth/store/authStore';
import { settingsService } from '../services/settings.service';
import { validateProfileEdit } from '../settings.utils';

interface UseProfileEditOptions {
  currentFullName: string;
  currentEmail: string;
  currentMobileNumber?: string;
  onSaved?: (fullName: string, email: string, mobileNumber?: string) => void;
}

export function useProfileEdit({
  currentFullName,
  currentEmail,
  currentMobileNumber = '',
  onSaved,
}: UseProfileEditOptions) {
  const [fullName, setFullName] = useState(currentFullName);
  const [email, setEmail] = useState(currentEmail);
  const [mobileNumber, setMobileNumber] = useState(currentMobileNumber);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFullName(currentFullName);
  }, [currentFullName]);

  useEffect(() => {
    setEmail(currentEmail);
  }, [currentEmail]);

  useEffect(() => {
    setMobileNumber(currentMobileNumber);
  }, [currentMobileNumber]);

  const dirty = useMemo(
    () =>
      fullName.trim() !== (currentFullName || '').trim() ||
      email.trim() !== (currentEmail || '').trim() ||
      mobileNumber.trim() !== (currentMobileNumber || '').trim(),
    [fullName, email, mobileNumber, currentFullName, currentEmail, currentMobileNumber],
  );

  const validation = useMemo(
    () => validateProfileEdit({ fullName, email, mobileNumber }),
    [fullName, email, mobileNumber],
  );

  const save = useCallback(async (): Promise<boolean> => {
    if (saving) {
      return false;
    }
    const check = validateProfileEdit({ fullName, email, mobileNumber });
    if (!check.valid) {
      setError(check.fullNameError ?? check.emailError ?? check.mobileNumberError);
      return false;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await settingsService.updateProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        mobile_number: mobileNumber.trim(),
      });

      // Update auth store immediately so UI updates everywhere
      const existingUser = useAuthStore.getState().user;
      if (existingUser) {
        useAuthStore.getState().setUser({
          ...existingUser,
          full_name: updated.full_name || fullName.trim(),
          email: updated.email || email.trim(),
          mobile_number: updated.mobile_number || mobileNumber.trim(),
        });
      }

      if (onSaved) {
        onSaved(
          updated.full_name,
          updated.email ?? email.trim(),
          updated.mobile_number ?? mobileNumber.trim(),
        );
      }
      setSaved(true);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update the profile. Please try again.'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [email, fullName, mobileNumber, onSaved, saving]);

  const clearFeedback = useCallback(() => {
    setError(null);
    setSaved(false);
  }, []);

  return {
    fullName,
    email,
    mobileNumber,
    setFullName,
    setEmail,
    setMobileNumber,
    dirty,
    saving,
    saved,
    error,
    validation,
    save,
    clearFeedback,
  };
}
