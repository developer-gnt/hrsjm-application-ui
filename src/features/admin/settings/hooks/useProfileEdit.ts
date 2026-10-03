import { useCallback, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../../../core/api/client';
import { settingsService } from '../services/settings.service';
import { validateProfileEdit } from '../settings.utils';

interface UseProfileEditOptions {
  currentFullName: string;
  currentEmail: string;
  onSaved: (fullName: string, email: string) => void;
}

// Edit profile flow per the phase plan: only Name and Email are editable -
// the backend PATCH /auth/me supports exactly those fields (confirmed
// contract). Phone / profile image editing has no backend support (reported).
export function useProfileEdit({
  currentFullName,
  currentEmail,
  onSaved,
}: UseProfileEditOptions) {
  const [fullName, setFullName] = useState(currentFullName);
  const [email, setEmail] = useState(currentEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = useMemo(
    () =>
      fullName.trim() !== currentFullName.trim() ||
      email.trim() !== currentEmail.trim(),
    [fullName, email, currentFullName, currentEmail],
  );

  const validation = useMemo(
    () => validateProfileEdit({ fullName, email }),
    [fullName, email],
  );

  const save = useCallback(async (): Promise<boolean> => {
    if (saving) {
      return false;
    }
    const check = validateProfileEdit({ fullName, email });
    if (!check.valid) {
      setError(check.fullNameError ?? check.emailError);
      return false;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await settingsService.updateProfile({
        full_name: fullName.trim(),
        email: email.trim(),
      });
      onSaved(updated.full_name, updated.email ?? email.trim());
      setSaved(true);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update the profile. Please try again.'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [email, fullName, onSaved, saving]);

  const clearFeedback = useCallback(() => {
    setError(null);
    setSaved(false);
  }, []);

  return {
    fullName,
    email,
    setFullName,
    setEmail,
    dirty,
    saving,
    saved,
    error,
    validation,
    save,
    clearFeedback,
  };
}
